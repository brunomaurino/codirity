#!/usr/bin/env python3
"""
The Leak Report — outbound wedge scanner for the Codirity 30-day campaign.

Given a prospect's domain, finds concrete, verifiable defects on their own site and
writes a report you can hand them BEFORE asking for anything. The campaign's whole
premise is that the finding is true and checkable; every claim this script prints has
to survive the prospect opening devtools thirty seconds later.

Stdlib only, on purpose: this has to still run in month six with no npm install and no
dependency that can rot.

    python3 scan.py acme.com
    python3 scan.py acme.com --max-urls 500 --out ~/leads/acme

Checks (1-3 are defects Codirity has personally shipped and fixed, which is why they
are the ones worth leading with):
  1. sitemap vs reality — URLs the sitemap advertises that 404, 5xx, or redirect-chain
  2. SSR — does the HTML render without JavaScript, or does a crawler get an empty body
  3. checkout — pricing CTAs that are href="#", Stripe test mode, or plain broken
  4. metadata — missing title/description/OG/JSON-LD on content pages
  5. Core Web Vitals — optional, needs a free PageSpeed Insights key (--psi-key)

Correctness guard: before trusting any 404 finding, the scanner probes a URL that
cannot exist. If the site answers 200 to that, its 404s are soft and the whole
sitemap check is marked unreliable rather than reported. Sending a founder a list of
"broken" pages that are fine is worse than sending nothing at all.
"""

from __future__ import annotations

import argparse
import gzip
import json
import random
import re
import ssl
import sys
import threading
import time
import urllib.error
import urllib.parse
import urllib.request
from concurrent.futures import ThreadPoolExecutor
from dataclasses import dataclass, field, asdict
from html.parser import HTMLParser
from pathlib import Path

UA = "CodirityLeakReport/1.0 (+https://www.codirity.com; pre-sales site audit; bruno@codirity.com)"
TIMEOUT = 12
WORKERS = 4
DELAY = (0.05, 0.35)
THROTTLE_CODES = (429, 503)
CTA_PAT = re.compile(
    r"(buy\.stripe\.com|checkout\.stripe\.com|/checkout|/signup|/sign-up|/subscribe|/get-started|/start|/trial|/pricing)",
    re.I,
)
CTA_TEXT_PAT = re.compile(
    r"\b(get started|start (free|now|today)|sign up|subscribe|buy now|choose plan|"
    r"select plan|upgrade|book a (call|demo)|try (it )?free|start trial)\b",
    re.I,
)
_print_lock = threading.Lock()


def log(msg: str) -> None:
    with _print_lock:
        print(msg, file=sys.stderr, flush=True)


# ---------------------------------------------------------------- fetching


@dataclass
class Resp:
    url: str
    status: int | None
    final_url: str
    chain: list[str] = field(default_factory=list)
    body: bytes = b""
    headers: dict = field(default_factory=dict)
    error: str | None = None

    @property
    def redirects(self) -> int:
        return len(self.chain)


def _ctx() -> ssl.SSLContext:
    return ssl.create_default_context()


class _ChainRecorder(urllib.request.HTTPRedirectHandler):
    """urlopen follows redirects silently, which makes the hop count invisible.

    Recording them here is the only way to see a chain at all: the earlier version of
    this function tried to catch redirects as HTTPError and never fired, because the
    default opener had already followed them. The self-test caught that.
    """

    def __init__(self) -> None:
        self.chain: list[str] = []

    def redirect_request(self, req, fp, code, msg, headers, newurl):
        self.chain.append(newurl)
        return super().redirect_request(req, fp, code, msg, headers, newurl)


def fetch(url: str, method: str = "GET", read_body: bool = True) -> Resp:
    rec = _ChainRecorder()
    opener = urllib.request.build_opener(rec, urllib.request.HTTPSHandler(context=_ctx()))
    req = urllib.request.Request(url, method=method, headers={
        "User-Agent": UA,
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
    })
    try:
        with opener.open(req, timeout=TIMEOUT) as r:
            raw = r.read(1_500_000) if read_body else b""
            if r.headers.get("Content-Encoding") == "gzip" or url.endswith(".gz"):
                try:
                    raw = gzip.decompress(raw)
                except Exception:
                    pass
            return Resp(url, r.status, r.url, list(rec.chain), raw, dict(r.headers))
    except urllib.error.HTTPError as e:
        body = b""
        try:
            body = e.read(200_000)
        except Exception:
            pass
        return Resp(url, e.code, e.url or url, list(rec.chain), body, dict(e.headers or {}))
    except urllib.error.URLError as e:
        return Resp(url, None, url, list(rec.chain), b"", {}, error=str(e.reason))
    except Exception as e:  # socket timeouts, bad certs, malformed redirects
        return Resp(url, None, url, list(rec.chain), b"", {}, error=type(e).__name__ + ": " + str(e))


def head_or_get(url: str) -> Resp:
    r = fetch(url, method="HEAD", read_body=False)
    # Plenty of servers reject HEAD (405/501) or lie about it; fall back.
    if r.status in (405, 501) or r.status is None:
        r = fetch(url, method="GET")
    return r


# ---------------------------------------------------------------- html


class TextExtractor(HTMLParser):
    """Visible text only: what a crawler that does not run JavaScript actually sees."""

    SKIP = {"script", "style", "noscript", "template", "svg"}

    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.depth = 0
        self.parts: list[str] = []
        # href AND anchor text: a dead CTA is often `href="#"`, which matches no URL
        # pattern at all. Only the label ("Get started") identifies it as a CTA.
        self.links: list[dict] = []
        self._a: dict | None = None
        self.title = ""
        self._in_title = False
        self.metas: dict[str, str] = {}
        self.jsonld = 0

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if tag in self.SKIP:
            self.depth += 1
            if tag == "script" and (a.get("type") or "").lower() == "application/ld+json":
                self.jsonld += 1
        elif tag == "title":
            self._in_title = True
        elif tag == "a" and a.get("href") is not None:
            self._a = {"href": a["href"], "text": ""}
            self.links.append(self._a)
        elif tag == "meta":
            key = (a.get("name") or a.get("property") or "").lower()
            if key:
                self.metas[key] = a.get("content", "")

    def handle_endtag(self, tag):
        if tag in self.SKIP and self.depth:
            self.depth -= 1
        elif tag == "title":
            self._in_title = False
        elif tag == "a":
            self._a = None

    def handle_data(self, data):
        if self._in_title:
            self.title += data.strip()
        elif not self.depth:
            t = data.strip()
            if t:
                self.parts.append(t)
                if self._a is not None:
                    self._a["text"] = (self._a["text"] + " " + t).strip()

    @property
    def text(self) -> str:
        return " ".join(self.parts)


def parse_html(body: bytes) -> TextExtractor:
    p = TextExtractor()
    try:
        p.feed(body.decode("utf-8", errors="replace"))
    except Exception:
        pass
    return p


# ---------------------------------------------------------------- discovery


def normalize(domain: str) -> str:
    d = domain.strip()
    if not d.startswith(("http://", "https://")):
        d = "https://" + d
    return d.rstrip("/")


def canonical_base(url: str) -> tuple[str, Resp]:
    """Follow the homepage to wherever it really lives (www, trailing host changes)."""
    r = fetch(url)
    if r.status is None and not url.startswith("http://"):
        r = fetch(url.replace("https://", "http://", 1))
    parsed = urllib.parse.urlparse(r.final_url if r.status else url)
    return f"{parsed.scheme}://{parsed.netloc}", r


def sitemap_urls(base: str) -> tuple[list[str], list[str]]:
    """Return (page urls, sitemaps consulted)."""
    candidates: list[str] = []
    robots = fetch(base + "/robots.txt")
    if robots.status == 200:
        for line in robots.body.decode("utf-8", errors="replace").splitlines():
            if line.lower().startswith("sitemap:"):
                candidates.append(line.split(":", 1)[1].strip())
    for guess in ("/sitemap.xml", "/sitemap_index.xml", "/sitemap-index.xml", "/sitemap.xml.gz"):
        if base + guess not in candidates:
            candidates.append(base + guess)

    seen_maps: list[str] = []
    pages: list[str] = []
    queue = list(candidates)
    while queue and len(seen_maps) < 25:
        sm = queue.pop(0)
        if sm in seen_maps:
            continue
        r = fetch(sm)
        if r.status != 200 or not r.body:
            continue
        seen_maps.append(sm)
        text = r.body.decode("utf-8", errors="replace")
        locs = re.findall(r"<loc>\s*([^<\s]+)\s*</loc>", text, re.I)
        if re.search(r"<sitemapindex", text, re.I):
            queue.extend(locs)
        else:
            pages.extend(locs)
    # de-dupe, keep order
    out, seen = [], set()
    for u in pages:
        if u not in seen:
            seen.add(u)
            out.append(u)
    return out, seen_maps


def soft_404_probe(base: str) -> tuple[bool, int | None]:
    """A URL that cannot exist. If it answers 200, this site's 404s are soft."""
    token = "codirity-leak-probe-%d" % random.randint(10**6, 10**7)
    r = head_or_get(f"{base}/{token}")
    return (r.status == 200), r.status


# ---------------------------------------------------------------- checks


def check_sitemap(base: str, urls: list[str], cap: int) -> dict:
    soft, probe_status = soft_404_probe(base)
    # RANDOM, not urls[:cap]. The head of a sitemap is the homepage and the top nav: the
    # most-maintained URLs a site has. Sampling them first made the scanner near-blind —
    # the first live batch covered 0.50% of 107,717 URLs, all from the healthy end, and
    # reported 20 of 21 domains as clean. Rot lives in the long tail.
    sample = random.sample(urls, min(cap, len(urls))) if urls else []
    results = []

    def one(u: str) -> dict:
        time.sleep(random.uniform(*DELAY))  # be a polite guest
        r = head_or_get(u)
        return {"url": u, "status": r.status, "redirects": r.redirects,
                "final_url": r.final_url, "error": r.error}

    if sample:
        with ThreadPoolExecutor(max_workers=WORKERS) as pool:
            results = list(pool.map(one, sample))

    # A real site rate-limited this scanner at 80 URLs (edairymarket.com, 429s). If a
    # site throttles or wobbles under our own load, a 503 looks exactly like a defect —
    # and the wedge email would then accuse a founder of a fault we caused. So: every
    # negative is re-checked ALONE, slowly, and only a repeat failure is reportable.
    throttled = [x for x in results if x["status"] in THROTTLE_CODES]
    unreliable = len(throttled) > max(2, 0.10 * len(results)) if results else False

    def reverify(x: dict) -> dict:
        time.sleep(1.5)
        r = head_or_get(x["url"])
        x["recheck_status"] = r.status
        x["confirmed"] = r.status == x["status"]
        return x

    candidates = [x for x in results
                  if x["status"] in (404, 410) or (x["status"] is not None and 500 <= x["status"] < 600)]
    if candidates:
        log(f"→ re-verifying {len(candidates)} negative(s) serially")
        candidates = [reverify(x) for x in candidates[:40]]

    dead = [x for x in candidates if x["status"] in (404, 410) and x.get("confirmed")]
    errors = [x for x in candidates
              if x["status"] is not None and 500 <= x["status"] < 600 and x.get("confirmed")]
    chains = [x for x in results if (x["redirects"] or 0) >= 2]
    insecure = [x for x in results if x["url"].startswith("http://")]
    home_redirects = [
        x for x in results
        if x["redirects"] and urllib.parse.urlparse(x["final_url"]).path.rstrip("/") == ""
    ]
    return {
        "checked": len(results), "total_in_sitemap": len(urls),
        "soft_404": soft, "probe_status": probe_status,
        "throttled": len(throttled), "unreliable": unreliable,
        "coverage": (len(results) / len(urls)) if urls else 0.0,
        "unconfirmed": [x for x in candidates if not x.get("confirmed")],
        "dead": dead, "server_errors": errors, "redirect_chains": chains,
        "insecure": insecure, "redirects_to_home": home_redirects,
    }


def check_ssr(base: str, pricing_url: str | None) -> dict:
    out = {}
    for label, url in (("home", base), ("pricing", pricing_url)):
        if not url:
            continue
        r = fetch(url)
        if r.status != 200:
            out[label] = {"url": url, "status": r.status, "error": r.error}
            continue
        p = parse_html(r.body)
        out[label] = {
            "url": url, "status": r.status,
            "html_bytes": len(r.body),
            "visible_chars": len(p.text),
            "empty_without_js": len(p.text) < 500,
            "title": p.title,
            "jsonld_blocks": p.jsonld,
            "has_description": bool(p.metas.get("description")),
            "has_og_title": bool(p.metas.get("og:title")),
            "has_og_image": bool(p.metas.get("og:image")),
        }
    return out


def check_checkout(base: str, pricing_url: str | None) -> dict:
    target = pricing_url or base
    r = fetch(target)
    if r.status != 200:
        return {"url": target, "status": r.status, "ctas": [], "note": "pricing page unreachable"}
    p = parse_html(r.body)
    seen, ctas = set(), []
    for link in p.links:
        href, text = link["href"], link["text"]
        # Match on the href OR the label. A `href="#"` Get-started button matches no
        # URL pattern, and it is the single most valuable finding on the page.
        if not (CTA_PAT.search(href) or CTA_TEXT_PAT.search(text)):
            continue
        absolute = urllib.parse.urljoin(target, href)
        key = absolute + "|" + text
        if key in seen:
            continue
        seen.add(key)
        item = {"href": href, "text": text[:40], "url": absolute}
        if href.strip() in ("#", "") or href.strip().lower().startswith("javascript:"):
            item.update(status=None, verdict='dead: href="%s"' % href.strip())
        elif "buy.stripe.com/test_" in absolute or "checkout.stripe.com/test" in absolute:
            item.update(status=None, verdict="Stripe TEST mode: does not charge a real card")
        else:
            cr = head_or_get(absolute)
            item["status"] = cr.status
            item["verdict"] = "ok" if cr.status == 200 else f"broken: HTTP {cr.status}"
        ctas.append(item)
        if len(ctas) >= 12:
            break
    return {"url": target, "status": r.status, "ctas": ctas}


def check_metadata(urls: list[str], sample_size: int = 8) -> list[dict]:
    picks = urls[:sample_size]
    def one(u: str) -> dict:
        r = fetch(u)
        if r.status != 200:
            return {"url": u, "status": r.status}
        p = parse_html(r.body)
        return {
            "url": u, "status": 200, "title": p.title,
            "missing": [k for k, v in (
                ("title", p.title),
                ("description", p.metas.get("description")),
                ("og:title", p.metas.get("og:title")),
                ("og:image", p.metas.get("og:image")),
                ("json-ld", p.jsonld or None),
            ) if not v],
        }
    if not picks:
        return []
    with ThreadPoolExecutor(max_workers=WORKERS) as pool:
        return list(pool.map(one, picks))


def check_psi(url: str, key: str) -> dict:
    api = ("https://www.googleapis.com/pagespeedonline/v5/runPagespeed?"
           + urllib.parse.urlencode({"url": url, "key": key, "strategy": "mobile"}))
    r = fetch(api)
    if r.status != 200:
        return {"error": f"HTTP {r.status}"}
    try:
        data = json.loads(r.body)
        audits = data["lighthouseResult"]["audits"]
        return {
            "performance": round(data["lighthouseResult"]["categories"]["performance"]["score"] * 100),
            "lcp": audits["largest-contentful-paint"]["displayValue"],
            "cls": audits["cumulative-layout-shift"]["displayValue"],
            "tbt": audits["total-blocking-time"]["displayValue"],
        }
    except Exception as e:
        return {"error": f"unparseable: {e}"}


# ---------------------------------------------------------------- findings


def find_pricing(urls: list[str], base: str) -> str | None:
    for u in urls:
        if re.search(r"/(pricing|plans|price)/?$", u, re.I):
            return u
    r = fetch(base)
    if r.status == 200:
        for link in parse_html(r.body).links:
            if re.search(r"/(pricing|plans)/?($|[?#])", link["href"], re.I):
                return urllib.parse.urljoin(base, link["href"])
    return None


def build_findings(res: dict) -> list[dict]:
    """Ranked, each with the subject line it would earn. Severity: the cost to THEM."""
    f: list[dict] = []
    sm = res["sitemap"]

    status_claims_ok = not sm["soft_404"] and not sm.get("unreliable")
    if sm["dead"] and status_claims_ok:
        n, total = len(sm["dead"]), sm["checked"]
        f.append({
            "severity": 1, "check": "sitemap",
            "headline": f"{n} of {total} URLs in the sitemap return 404",
            "subject": f"{n} of your {total} pages return 404",
            "detail": "Still listed in the sitemap Google crawls, so crawl budget is being spent on them.",
            "evidence": [x["url"] for x in sm["dead"][:12]],
        })
    if sm["server_errors"] and status_claims_ok:
        f.append({
            "severity": 1, "check": "sitemap",
            "headline": f"{len(sm['server_errors'])} URLs return a 5xx",
            "subject": f"{len(sm['server_errors'])} pages on {'{domain}'} are erroring right now",
            "detail": "Server errors on pages the site itself advertises.",
            "evidence": [f"{x['url']} → {x['status']}" for x in sm["server_errors"][:12]],
        })

    for label, d in res["ssr"].items():
        if d.get("empty_without_js"):
            f.append({
                "severity": 1, "check": "ssr",
                "headline": f"The {label} page renders {d['visible_chars']} characters without JavaScript",
                "subject": f"Your {label} page renders empty without JavaScript",
                "detail": f"{d['html_bytes']:,} bytes of HTML, {d['visible_chars']} characters of text a "
                          "non-JS crawler can read.",
                "evidence": [d["url"]],
            })

    broken = [c for c in res["checkout"].get("ctas", []) if c["verdict"] != "ok"]
    if broken:
        f.append({
            "severity": 0, "check": "checkout",
            "headline": f"{len(broken)} checkout/CTA link(s) do not work",
            "subject": "Your pricing CTA does not reach a checkout",
            "detail": "A pricing page that advertises a price and cannot take the money.",
            "evidence": [f"{c['href']} → {c['verdict']}" for c in broken[:8]],
        })

    if sm["redirect_chains"]:
        f.append({
            "severity": 3, "check": "sitemap",
            "headline": f"{len(sm['redirect_chains'])} URLs go through 2+ redirects",
            "subject": "Redirect chains in your sitemap",
            "detail": "Each hop costs latency and dilutes the link signal.",
            "evidence": [f"{x['url']} → {x['redirects']} hops" for x in sm["redirect_chains"][:8]],
        })
    if sm["redirects_to_home"]:
        f.append({
            "severity": 2, "check": "sitemap",
            "headline": f"{len(sm['redirects_to_home'])} sitemap URLs redirect to the homepage",
            "subject": "Sitemap URLs quietly redirecting to your homepage",
            "detail": "Google treats a redirect-to-home as a soft 404 and drops the page.",
            "evidence": [x["url"] for x in sm["redirects_to_home"][:8]],
        })

    missing = [m for m in res["metadata"] if m.get("missing")]
    if missing:
        counts: dict[str, int] = {}
        for m in missing:
            for k in m["missing"]:
                counts[k] = counts.get(k, 0) + 1
        worst = ", ".join(f"{k} ({v})" for k, v in sorted(counts.items(), key=lambda x: -x[1])[:3])
        f.append({
            "severity": 3, "check": "metadata",
            "headline": f"{len(missing)} of {len(res['metadata'])} sampled pages are missing metadata",
            "subject": "Missing share metadata on your content pages",
            "detail": f"Most common: {worst}.",
            "evidence": [f"{m['url']} → missing {', '.join(m['missing'])}" for m in missing[:8]],
        })

    psi = res.get("psi") or {}
    if psi.get("performance") is not None and psi["performance"] < 50:
        f.append({
            "severity": 2, "check": "vitals",
            "headline": f"Mobile performance scores {psi['performance']}/100",
            "subject": f"Your mobile site scores {psi['performance']}/100 on Google's own test",
            "detail": f"LCP {psi.get('lcp')}, CLS {psi.get('cls')}, TBT {psi.get('tbt')}.",
            "evidence": [],
        })

    f.sort(key=lambda x: x["severity"])
    return f


# ---------------------------------------------------------------- report


def render(domain: str, res: dict, findings: list[dict]) -> str:
    sm = res["sitemap"]
    L = [f"# Leak Report — {domain}", ""]
    L.append(f"Scanned {sm['checked']} of {sm['total_in_sitemap']:,} sitemap URLs "
             f"({sm.get('coverage', 0) * 100:.1f}%, sampled at random). "
             f"Sitemaps found: {len(res['sitemaps'])}.")
    L.append("")

    if sm.get("unreliable"):
        L += [f"> ⚠️  **Status findings suppressed.** {sm['throttled']} of {sm['checked']} requests came "
              "back 429/503, so this site was rate-limiting the scan. A 5xx under our own load is not "
              "their defect. Re-run with `--max-urls 40` before claiming anything about broken pages.", ""]

    if sm["soft_404"]:
        L += ["> ⚠️  **404 detection disabled for this site.** A URL that cannot exist answered "
              f"HTTP {sm['probe_status']}, so this site serves soft 404s and a 200 proves nothing. "
              "Do not claim broken pages here — lead with a different check.", ""]

    # Severity 3 is real but it does not earn a reply. "Your content pages are missing
    # og:image" is not a sentence that gets a founder on a call, and promoting one to the
    # wedge slot would mass-produce weak emails — which is how a wedge campaign decays
    # into ordinary cold outbound. Observed on the first live batch: 4 of the first 6
    # domains had metadata-only findings.
    strong = [x for x in findings if x["severity"] <= 2]

    cov = sm.get("coverage", 0.0)
    thin = cov < 0.25 and sm["total_in_sitemap"] > 100

    if not strong and thin:
        L += [f"**Inconclusive, not a verdict.** Only {sm['checked']} of "
              f"{sm['total_in_sitemap']:,} sitemap URLs were checked ({cov * 100:.1f}%). "
              "Finding nothing in a sample this thin says nothing about the site — the "
              f"eDairyMarket case study found 27 of 273 by checking the whole catalogue. "
              f"Re-run with `--max-urls {min(sm['total_in_sitemap'], 1000)}` before deciding "
              "this account is clean.", ""]
        if findings:
            L += ["Low-severity findings so far:", ""]
            for x in findings:
                L.append(f"- {x['headline']} ({x['check']})")
            L.append("")
        return "\n".join(L)

    if not strong:
        why = ("No findings." if not findings else
               f"Only low-severity findings ({', '.join(sorted({x['check'] for x in findings}))}).")
        L += [f"**{why} Not a Tier A account.** Drop it to Tier B or cut it. A wedge that opens "
              "with weak news is worse than no email — it spends the one first impression you get.", ""]
        if findings:
            L += ["_Low-severity findings are still listed below: they are useful as the day-3 "
                  "follow-up on an account that earned a reply some other way._", ""]
        else:
            return "\n".join(L)
    else:
        lead = strong[0]
        L += ["## The wedge", "",
              f"**Subject:** {lead['subject'].replace('{domain}', domain)}", "",
              f"**Opener:** {lead['headline']}. {lead['detail']}", "",
              f"_Hold the remaining {max(0, len(findings) - 1)} finding(s) for the day-3 follow-up. "
              "Never send them all at once._", "", "---", ""]

    L += ["## All findings", ""]
    for i, x in enumerate(findings, 1):
        sev = {0: "CRITICAL", 1: "HIGH", 2: "MEDIUM", 3: "LOW"}.get(x["severity"], "LOW")
        L.append(f"### {i}. [{sev}] {x['headline']}")
        L.append(f"_{x['check']}_ — {x['detail']}")
        if x["evidence"]:
            L.append("")
            L += [f"- `{e}`" for e in x["evidence"]]
        L.append("")

    L += ["---", "", "## Raw checks", ""]
    for label, d in res["ssr"].items():
        if "visible_chars" in d:
            L.append(f"- **SSR / {label}**: {d['visible_chars']} visible chars from "
                     f"{d['html_bytes']:,} bytes · JSON-LD blocks: {d['jsonld_blocks']} · "
                     f"title: {d['title'][:60] or '(none)'!r}")
    for c in res["checkout"].get("ctas", []):
        L.append(f"- **CTA** `{c['href'][:70]}` → {c['verdict']}")
    if res.get("psi"):
        L.append(f"- **PSI mobile**: {res['psi']}")
    L.append("")
    L.append(f"_Generated by scripts/leak-report/scan.py · every claim above is re-checkable "
             f"by re-running: `python3 scan.py {domain}`_")
    return "\n".join(L)


# ---------------------------------------------------------------- main


def scan(domain: str, cap: int, psi_key: str | None) -> tuple[dict, list[dict], str]:
    base, home = canonical_base(normalize(domain))
    log(f"→ {base} (HTTP {home.status})")
    if home.status is None:
        raise SystemExit(f"unreachable: {domain} ({home.error})")

    urls, maps = sitemap_urls(base)
    log(f"→ {len(urls)} URLs across {len(maps)} sitemap(s)")
    pricing = find_pricing(urls, base)
    log(f"→ pricing page: {pricing or 'not found'}")

    res = {
        "domain": domain, "base": base, "sitemaps": maps,
        "sitemap": check_sitemap(base, urls, cap),
        "ssr": check_ssr(base, pricing),
        "checkout": check_checkout(base, pricing),
        "metadata": check_metadata([u for u in urls if u != base][:40]),
        "psi": check_psi(base, psi_key) if psi_key else None,
    }
    findings = build_findings(res)
    return res, findings, render(domain, res, findings)


def main() -> None:
    ap = argparse.ArgumentParser(description="The Leak Report — pre-sales site scanner")
    ap.add_argument("domain")
    ap.add_argument("--max-urls", type=int, default=300, help="sitemap URLs to verify (default 300)")
    ap.add_argument("--out", default=None, help="directory for the report (default: ./leads/<domain>)")
    ap.add_argument("--psi-key", default=None, help="PageSpeed Insights API key (free, optional)")
    ap.add_argument("--slow", action="store_true",
                    help="one request at a time, ~1s apart — for sites that rate-limit the scan")
    ap.add_argument("--json", action="store_true", help="print raw JSON to stdout instead of markdown")
    a = ap.parse_args()

    if a.slow:
        global WORKERS, DELAY
        WORKERS, DELAY = 1, (0.8, 1.6)
        log("→ slow mode: 1 worker")

    res, findings, report = scan(a.domain, a.max_urls, a.psi_key)

    slug = re.sub(r"[^a-z0-9]+", "-", a.domain.lower()).strip("-")
    out = Path(a.out) if a.out else Path("leads") / slug
    out.mkdir(parents=True, exist_ok=True)
    (out / "report.md").write_text(report)
    (out / "raw.json").write_text(json.dumps({"result": res, "findings": findings}, indent=2, default=str))

    print(json.dumps(findings, indent=2) if a.json else report)
    log(f"→ written to {out}/report.md")


if __name__ == "__main__":
    main()
