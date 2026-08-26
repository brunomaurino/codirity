#!/usr/bin/env python3
"""
Self-test for scan.py, against a local server with DELIBERATELY injected defects.

The point is not that the scanner runs. The point is watching every check FIRE on a
defect that is known to be there, and then watching the soft-404 guard SUPPRESS a
finding it must not make. A check that has never failed is not a check.

    python3 selftest.py
"""

from __future__ import annotations

import json
import sys
import threading
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
import scan as S  # noqa: E402

SOFT_404 = False   # flipped by the second pass
THROTTLE = False   # flipped by the third pass
HITS: dict[str, int] = {}  # per-path request counter, for the flaky-500 route


class Handler(BaseHTTPRequestHandler):
    def log_message(self, *a):  # silence
        pass

    def _send(self, code: int, body: str = "", ctype: str = "text/html", loc: str | None = None):
        data = body.encode()
        self.send_response(code)
        self.send_header("Content-Type", ctype)
        self.send_header("Content-Length", str(len(data)))
        if loc:
            self.send_header("Location", loc)
        self.end_headers()
        if self.command != "HEAD":
            self.wfile.write(data)

    def do_HEAD(self):
        self.do_GET()

    def do_GET(self):
        p = self.path.split("?")[0]
        host = f"http://{self.headers.get('Host')}"
        HITS[p] = HITS.get(p, 0) + 1

        if THROTTLE and p not in ("/robots.txt", "/sitemap.xml", "/", "/pricing"):
            return self._send(429, "slow down")

        if p == "/flaky":
            # Fails once, then recovers: the exact shape of a site wobbling under our
            # own scan. Must NOT reach the report.
            return self._send(500 if HITS[p] <= 1 else 200,
                              "<html><title>Flaky</title><body>" + ("ok " * 200) + "</body></html>")

        if p == "/robots.txt":
            return self._send(200, f"User-agent: *\nSitemap: {host}/sitemap.xml\n", "text/plain")

        if p == "/sitemap.xml":
            locs = ["/", "/ok", "/dead", "/boom", "/chain1", "/to-home", "/pricing",
                    "/post-no-meta", "/flaky"]
            body = ('<?xml version="1.0" encoding="UTF-8"?><urlset>'
                    + "".join(f"<url><loc>{host}{u}</loc></url>" for u in locs)
                    + "</urlset>")
            return self._send(200, body, "application/xml")

        if p == "/":
            # INJECTED DEFECT: every word of content lives inside <script>. A crawler
            # that does not run JS sees an empty body.
            return self._send(200,
                "<html><head><title>Fixture</title></head><body><div id=root></div>"
                "<script>document.getElementById('root').innerHTML='" + ("content " * 400) + "'</script>"
                '<a href="/pricing">Pricing</a></body></html>')

        if p == "/pricing":
            # INJECTED DEFECTS: a dead href="#" CTA and a Stripe TEST-mode link.
            return self._send(200,
                "<html><head><title>Pricing</title>"
                '<meta name="description" content="plans"></head><body>'
                "<p>" + ("Real server-rendered pricing copy. " * 40) + "</p>"
                '<a href="#">Get started</a>'
                # NOT a defect: a newsletter form handled in JS. Must never be reported.
                '<a href="#">Subscribe to the Newsletter</a>'
                '<a href="#">Follow us on GitHub</a>'
                '<a href="https://buy.stripe.com/test_abc123">Subscribe</a>'
                f'<a href="{host}/signup">Sign up</a>'
                "</body></html>")

        if p == "/signup":
            return self._send(200, "<html><title>Signup</title><body>" + ("x " * 300) + "</body></html>")

        if p == "/ok":
            return self._send(200, "<html><head><title>OK</title>"
                                   '<meta name="description" content="d">'
                                   '<meta property="og:title" content="t">'
                                   '<meta property="og:image" content="i">'
                                   '<script type="application/ld+json">{}</script></head>'
                                   "<body>" + ("fine " * 200) + "</body></html>")

        if p == "/post-no-meta":
            # INJECTED DEFECT: no description, no OG, no JSON-LD.
            return self._send(200, "<html><head><title>Post</title></head><body>"
                                   + ("words " * 200) + "</body></html>")

        if p == "/boom":
            return self._send(500, "kaboom")  # INJECTED DEFECT: 5xx

        if p == "/chain1":
            return self._send(301, "", loc=f"{host}/chain2")
        if p == "/chain2":
            return self._send(301, "", loc=f"{host}/ok")  # INJECTED DEFECT: 2-hop chain

        if p == "/to-home":
            return self._send(301, "", loc=f"{host}/")  # INJECTED DEFECT: soft-404 redirect

        # /dead and the probe land here.
        if SOFT_404:
            return self._send(200, "<html><title>Not found</title><body>nothing here</body></html>")
        return self._send(404, "not found")


def run_pass(label: str) -> tuple[dict, list[dict]]:
    HITS.clear()  # per-pass: the flaky route must fail its FIRST contact in every pass
    srv = ThreadingHTTPServer(("127.0.0.1", 0), Handler)
    port = srv.server_address[1]
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    try:
        res, findings, _ = S.scan(f"http://127.0.0.1:{port}", cap=50, psi_key=None)
    finally:
        srv.shutdown()
    return res, findings


def main() -> int:
    global SOFT_404, THROTTLE
    failures: list[str] = []

    def check(name: str, cond: bool, got: object = "") -> None:
        print(f"  {'PASS' if cond else 'FAIL'}  {name}" + (f"  ({got})" if not cond else ""))
        if not cond:
            failures.append(name)

    print("\n[pass 1] hard 404s — every check must FIRE\n")
    res, findings = run_pass("hard")
    kinds = {f["check"] for f in findings}
    sm = res["sitemap"]
    by = {f["headline"]: f for f in findings}

    check("soft-404 guard stays OFF on a site with real 404s", sm["soft_404"] is False, sm["probe_status"])
    check("404 in sitemap detected", any("404" in h for h in by), sorted(by))
    check("exactly the one injected dead URL", len(sm["dead"]) == 1, [x["url"] for x in sm["dead"]])
    check("5xx detected", len(sm["server_errors"]) == 1, sm["server_errors"])
    check("2-hop redirect chain detected", len(sm["redirect_chains"]) >= 1, sm["redirect_chains"])
    check("redirect-to-homepage detected", len(sm["redirects_to_home"]) >= 1, sm["redirects_to_home"])
    check("SSR: home flagged empty without JS", res["ssr"]["home"]["empty_without_js"] is True,
          res["ssr"]["home"].get("visible_chars"))
    check("SSR: pricing NOT flagged (it renders)", res["ssr"]["pricing"]["empty_without_js"] is False,
          res["ssr"]["pricing"].get("visible_chars"))
    ctas = res["checkout"]["ctas"]
    check('CTA href="#" caught', any('href="#"' in c["verdict"] for c in ctas), ctas)
    check("Stripe TEST mode caught", any("TEST mode" in c["verdict"] for c in ctas), ctas)
    check("working CTA not flagged", any(c["verdict"] == "ok" for c in ctas), ctas)
    check("newsletter signup is NOT reported as a broken checkout",
          not any("newsletter" in c["text"].lower() for c in ctas),
          [c["text"] for c in ctas])
    check("a GitHub/social link is NOT reported as a broken checkout",
          not any("github" in c["text"].lower() for c in ctas),
          [c["text"] for c in ctas])
    check("metadata gaps found", "metadata" in kinds, sorted(kinds))
    check("checkout finding is ranked first", findings and findings[0]["check"] == "checkout",
          findings[0]["check"] if findings else None)
    check("wedge subject is non-empty", bool(findings and findings[0]["subject"]))

    print("\n[pass 2] soft 404s — the 404 claim must be SUPPRESSED\n")
    SOFT_404 = True
    res2, findings2 = run_pass("soft")
    sm2 = res2["sitemap"]
    check("soft-404 guard fires", sm2["soft_404"] is True, sm2["probe_status"])
    check("no 404 finding is made", not any(f["check"] == "sitemap" and "404" in f["headline"]
                                            for f in findings2),
          [f["headline"] for f in findings2])
    check("other checks still work under soft-404", any(f["check"] == "checkout" for f in findings2),
          [f["check"] for f in findings2])

    print("\n[pass 3] a flaky 500 and a throttling site — findings must be SUPPRESSED\n")
    SOFT_404 = False
    res3, findings3 = run_pass("flaky")
    sm3 = res3["sitemap"]
    check("hard 500 still reported", len(sm3["server_errors"]) == 1,
          [x["url"] for x in sm3["server_errors"]])
    check("flaky 500 recovered on recheck and was NOT reported",
          not any("flaky" in x["url"] for x in sm3["server_errors"]),
          [x["url"] for x in sm3["server_errors"]])
    check("the flaky URL is recorded as unconfirmed",
          any("flaky" in x["url"] for x in sm3["unconfirmed"]),
          [x["url"] for x in sm3["unconfirmed"]])

    THROTTLE = True
    res4, findings4 = run_pass("throttle")
    sm4 = res4["sitemap"]
    check("throttling detected", sm4["unreliable"] is True,
          f"{sm4['throttled']}/{sm4['checked']} throttled")
    check("no status claim made while throttled",
          not any(f["check"] == "sitemap" and ("404" in f["headline"] or "5xx" in f["headline"])
                  for f in findings4),
          [f["headline"] for f in findings4])

    print("\n[pass 4] thin coverage must read as INCONCLUSIVE, not clean\n")
    thin = {"sitemap": {"checked": 30, "total_in_sitemap": 59377, "soft_404": False,
                        "probe_status": 404, "throttled": 0, "unreliable": False,
                        "coverage": 30 / 59377, "unconfirmed": [], "dead": [],
                        "server_errors": [], "redirect_chains": [], "insecure": [],
                        "redirects_to_home": []},
            "sitemaps": ["x"], "ssr": {}, "checkout": {"ctas": []}, "metadata": [], "psi": None}
    thin_out = S.render("thin.com", thin, [])
    check("a 0.05% sample is called inconclusive", "Inconclusive" in thin_out)
    check("it does not claim the account is clean", "No findings." not in thin_out)
    check("it names the re-run that would settle it", "--max-urls" in thin_out)

    wide = json.loads(json.dumps(thin))
    wide["sitemap"].update(checked=800, total_in_sitemap=1000, coverage=0.8)
    wide_out = S.render("wide.com", wide, [])
    check("a 80% sample with nothing found IS a verdict", "Not a Tier A account" in wide_out)

    small = json.loads(json.dumps(thin))
    small["sitemap"].update(checked=30, total_in_sitemap=40, coverage=0.75)
    check("a small site is judged, not excused",
          "Not a Tier A account" in S.render("small.com", small, []))

    print("\n[pass 5] a metadata-only account must NOT qualify as Tier A\n")
    blank = {"sitemap": {"checked": 5, "total_in_sitemap": 5, "soft_404": False, "probe_status": 404,
                         "throttled": 0, "unreliable": False, "unconfirmed": [], "dead": [],
                         "server_errors": [], "redirect_chains": [], "insecure": [],
                         "redirects_to_home": []},
             "sitemaps": ["x"], "ssr": {}, "checkout": {"ctas": []}, "metadata": [], "psi": None}
    weak = [{"severity": 3, "check": "metadata", "headline": "h", "subject": "s",
             "detail": "d", "evidence": ["e"]}]
    weak_out = S.render("weak.com", blank, weak)
    check("metadata-only account is refused as Tier A", "Not a Tier A account" in weak_out)
    check("no wedge is offered for it", "## The wedge" not in weak_out)
    check("the weak finding is still listed for the follow-up", "day-3 follow-up" in weak_out)

    strong = [{"severity": 1, "check": "ssr", "headline": "h", "subject": "s",
               "detail": "d", "evidence": ["e"]}] + weak
    strong_out = S.render("strong.com", blank, strong)
    check("a strong finding still produces a wedge", "## The wedge" in strong_out)
    check("the wedge uses the strong finding, not the weak one",
          strong_out.split("**Opener:**")[1].split("\n")[0].strip().startswith("h"))

    print(f"\n{'ALL CHECKS ARMED' if not failures else str(len(failures)) + ' FAILING'}: "
          f"{len(failures)} failure(s)\n")
    return 1 if failures else 0


if __name__ == "__main__":
    raise SystemExit(main())
