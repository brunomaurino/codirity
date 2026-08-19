# W4 fact-provenance gate.
#
# This is the gate that matters most in this bundle, because this is the section
# where v3 shipped two fabrications about a REAL, NAMED client:
#   - "guest carts" where the record says buyer FAVORITES;
#   - an invented sentence characterising Meshio's product before the work.
# Both slipped a gate that asserted only that expected strings were PRESENT.
#
# The FIRST draft of this gate was itself proved vacuous in four ways by the
# Phase 4/5 review, each demonstrated live against the real prerendered page:
#   1. the "nothing extra" and "no invented numbers" sweeps iterated only over
#      the two case-study sections, so the CLIENTS strip had presence-only
#      coverage — an invented seed-round sentence added to a client card passed;
#   2. provenance was a SUBSTRING test against one flat concatenation of every
#      field, so a run spanning two field boundaries, a fact copied from one
#      study into the other, or a truncation dropping a load-bearing qualifier
#      ("specced") all passed;
#   3. a 12-character floor exempted short runs — an invented "Shopify" stack
#      pill and an injected "Paid" state both passed;
#   4. the stat check was self-satisfying, since "27" is a substring of
#      "of 273 product pages" in the same section.
#
# So provenance is now EXACT MEMBERSHIP of a rendered text run in the SET of
# offer.ts field values, over EVERY section this bundle owns, with NO length
# floor. A substring can no longer stand in for a field, and a field of one
# entity can no longer vouch for text rendered under another.
#
# Usage: python3 scripts/w4-facts-gate.py [rendered-page.html]
import html
import json
import re
import subprocess
import sys

PAGE = sys.argv[1] if len(sys.argv) > 1 else "/tmp/codirity-page.html"
page = open(PAGE, encoding="utf-8").read()

# Read the FACTS by executing offer.ts, not by regexing it.
facts = json.loads(
    subprocess.run(
        ["npx", "tsx", "-e",
         "import {caseStudies, clients, sections} from './src/config/offer';"
         "process.stdout.write(JSON.stringify({caseStudies, clients, sections}))"],
        capture_output=True, text=True, check=True,
    ).stdout
)
studies, clients, sections = facts["caseStudies"], facts["clients"], facts["sections"]

strip = lambda t: html.unescape(re.sub(r"<[^>]+>", " ", t))
squash = lambda t: re.sub(r"\s+", " ", strip(t)).strip()

# Drop the RSC flight payload: it repeats every string as JSON.
dom = re.sub(r"<script[^>]*>.*?</script>", "", page, flags=re.S)

fails = []

# ---------- (c) the structured split reconstructs the canonical fact ----------
for s in studies:
    parts = []
    if s.get("stat"):
        parts += [s["stat"]["value"], s["stat"]["of"]]
    parts += s["headlineLines"]
    rebuilt = " ".join(parts)
    if rebuilt != s["headline"]:
        fails.append(
            f"{s['name']}: the display split does NOT reconstruct the headline fact\n"
            f"    headline: {s['headline']!r}\n"
            f"    rebuilt:  {rebuilt!r}"
        )
    sm = s.get("stateMachine")
    if sm:
        bullet = next((b for b in s["whatShipped"] if "state machine" in b.lower()), None)
        if not bullet:
            fails.append(f"{s['name']}: a state machine renders but no whatShipped bullet names one")
        else:
            for st in sm["states"] + [sm["goal"]]:
                if st.lower() not in bullet.lower():
                    fails.append(
                        f"{s['name']}: state {st!r} is not in the whatShipped bullet naming the "
                        f"machine ({bullet!r})"
                    )

# ---------- section extraction ----------
def section_containing(needle):
    i = dom.find(needle)
    if i == -1:
        return ""
    start = dom.rfind("<section", 0, i)
    end = dom.find("</section>", i)
    return dom[start:end] if start != -1 and end != -1 else ""


def runs(markup):
    """Every contiguous text node the browser paints, in order."""
    return [t for t in (squash(r) for r in re.split(r"<[^>]+>", markup)) if t]


# The provenance UNIVERSE, per owning entity — a SET of exact field values, not
# a concatenation. Each section is checked only against ITS OWN entity's fields
# plus shared chrome, so a fact belonging to one study cannot vouch for text
# rendered under another.
CHROME = {"—", "→", "client", "pre-launch", squash(sections["recentWork"]["title"])}


def field_set(entity):
    vals = set()
    def add(v):
        if isinstance(v, str):
            vals.add(squash(v))
        elif isinstance(v, list):
            for x in v:
                add(x)
        elif isinstance(v, dict):
            for x in v.values():
                add(x)
    add(entity)
    return {v for v in vals if v}


OWNED = []
for s in studies:
    OWNED.append((f"study:{s['name']}", section_containing(s["headlineLines"][0]), field_set(s)))
clients_section = section_containing(squash(clients[0]["story"])[:40]) or section_containing(
    sections["recentWork"]["title"]
)
OWNED.append(("clients", clients_section, field_set(clients)))

for label, markup, allowed in OWNED:
    if not markup:
        fails.append(f"{label}: section did not render")
        continue
    # (a) every fact renders …
    for want in allowed:
        if want not in runs(markup) and want not in squash(markup):
            fails.append(f"{label}: MISSING {want[:70]!r}")
    # (b) … and NOTHING else does. Exact membership, no length floor.
    for t in runs(markup):
        if t in allowed or t in CHROME:
            continue
        fails.append(f"{label}: TEXT NOT TRACEABLE to offer.ts:\n    {t[:150]!r}")
    # (d) no number that offer.ts does not carry, in this section
    allowed_nums = {n for v in allowed for n in re.findall(r"\d[\d,.]*", v)}
    for t in runs(markup):
        for n in re.findall(r"\d[\d,.]*", t):
            if n.rstrip(".,") not in {a.rstrip(".,") for a in allowed_nums}:
                fails.append(f"{label}: number {n!r} renders but is not in offer.ts")

# ---------- the load-bearing string ----------
if "Found and fixed." not in squash(dom):
    fails.append("'Found and fixed.' does not render — the 404 claim reads as unresolved")

# ---------- the accessible name of each headline ----------
# The h3 carries `aria-label={headline}`, which is the ONLY form of the claim
# assistive tech receives (the visible lines are aria-hidden). It is therefore a
# rendered fact in its own right and must equal the canonical string exactly —
# a drifted label would be invisible to every check that reads visible text
# only, including this gate's own `squash()` (which strips attributes). The
# self-test exposed this gap by mutating the label and passing.
labels = [html.unescape(m) for m in re.findall(r'<h3[^>]*aria-label="([^"]*)"', dom)]
for s in studies:
    if s["headline"] not in labels:
        fails.append(
            f"{s['name']}: no headline has the canonical accessible name\n"
            f"    expected: {s['headline']!r}\n"
            f"    found:    {labels}"
        )
for lab in labels:
    if lab not in {s["headline"] for s in studies}:
        fails.append(f"a headline's accessible name is not a canonical headline: {lab!r}")

# ---------- the stat element, checked as an ELEMENT ----------
# The first draft asked whether "27" appeared anywhere in the section, which
# "of 273 product pages" satisfied on its own. Compare the ELEMENT's own text.
for s in studies:
    markup = section_containing(s["headlineLines"][0])
    big = re.findall(r'<span class="stat-big"[^>]*>(.*?)</span>', markup, re.S)
    of = re.findall(r'<span class="stat-of"[^>]*>(.*?)</span>', markup, re.S)
    if s.get("stat"):
        if [squash(x) for x in big] != [squash(s["stat"]["value"])]:
            fails.append(f"{s['name']}: stat-big renders {[squash(x) for x in big]}, expected {s['stat']['value']!r}")
        if [squash(x) for x in of] != [squash(s["stat"]["of"])]:
            fails.append(f"{s['name']}: stat-of renders {[squash(x) for x in of]}, expected {s['stat']['of']!r}")
    else:
        if big or of:
            fails.append(
                f"{s['name']} has no `stat` in offer.ts but renders one — §7 records no honest "
                f"number for it and the state machine is the story"
            )

# ---------- client tags, matched as TAG ELEMENTS ----------
def client_block(name):
    for m in re.finditer(r'<div class="client[^"]*"[^>]*>(.*?)</div>', dom, re.S):
        if squash(m.group(1)).startswith(name):
            return m.group(1)
    return ""


for c in clients:
    block = client_block(c["name"])
    if not block:
        fails.append(f"client {c['name']}: block did not render")
        continue
    # Scoped to THIS client and matched as the tag ELEMENT — Vivi's own story
    # contains the phrase "we're building pre-launch", so a document-wide
    # substring search was satisfied by prose and could never fail.
    tags = {squash(t).lower() for t in re.findall(r'<span class="tag">(.*?)</span>', block, re.S)}
    if "client" not in tags:
        fails.append(f"client {c['name']}: no `client` tag renders (tags: {sorted(tags)})")
    if c.get("preLaunch") and "pre-launch" not in tags:
        fails.append(f"client {c['name']}: preLaunch is true but no pre-launch TAG renders")
    if not c.get("preLaunch") and "pre-launch" in tags:
        fails.append(f"client {c['name']}: a pre-launch tag renders but preLaunch is not set")

print(f"studies={[s['name'] for s in studies]} clients={[c['name'] for c in clients]}")
print(f"sections checked={[l for l, _, _ in OWNED]}")
if fails:
    print("\nFAIL:")
    for f in fails:
        print(" -", f)
    sys.exit(1)
print("\nPASS — every fact renders, nothing else does, and the splits reconstruct.")
