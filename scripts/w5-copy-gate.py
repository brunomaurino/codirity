# W5 copy + parity gate.
#
# Two invariants this bundle can break, both of which v3 actually broke:
#   1. `included[]` / `notIncluded[]` shipped a PARAPHRASE and silently dropped
#      one item. So both arrays are diffed LITERALLY and in BOTH directions —
#      a reworded row and a missing row each fail, and so does an EXTRA row.
#   2. The FAQ's answers must ship in the SERVER HTML and match the FAQPage
#      JSON-LD exactly. The v3 component protected this with a CSS collapse; the
#      v4 rework moves to native <details>, which keeps the same guarantee — but
#      the guarantee is the thing being checked, not the mechanism.
#
# Provenance is EXACT MEMBERSHIP of a rendered text run in the set of offer.ts
# values, per the W4 lesson: a substring test against a flat concatenation
# passes borrowed text, dropped qualifiers and short fabrications.
#
# Usage: python3 scripts/w5-copy-gate.py [rendered-page.html]
import html
import json
import re
import subprocess
import sys

PAGE = sys.argv[1] if len(sys.argv) > 1 else "/tmp/codirity-page.html"
page = open(PAGE, encoding="utf-8").read()

facts = json.loads(
    subprocess.run(
        ["npx", "tsx", "-e",
         "import {included, notIncluded, howItWorks, faq, sections} from './src/config/offer';"
         "process.stdout.write(JSON.stringify({included, notIncluded, howItWorks, faq, sections}))"],
        capture_output=True, text=True, check=True,
    ).stdout
)
included = facts["included"]
not_included = facts["notIncluded"]
how = facts["howItWorks"]
faq = facts["faq"]
sections = facts["sections"]

strip = lambda t: html.unescape(re.sub(r"<[^>]+>", " ", t))
squash = lambda t: re.sub(r"\s+", " ", strip(t)).strip()
dom = re.sub(r"<script(?![^>]*application/ld\+json).*?</script>", "", page, flags=re.S)

fails = []

# ---------- 1. the services list, literally, both directions ----------
rows = [squash(m) for m in re.findall(r'<span class="svc-name"[^>]*>(.*?)</span>\s*(?:<span class="svc-no")?', page, re.S)]
# Re-extract cleanly: each .svc-name's own text, with the nested strike stripped.
rows = []
for m in re.finditer(r'<span class="svc-name"[^>]*>(.*?)</li>', page, re.S):
    inner = re.sub(r'<span class="strike".*?</span>', "", m.group(1), flags=re.S)
    inner = re.sub(r'<span class="svc-no".*?</span>', "", inner, flags=re.S)
    rows.append(squash(inner))

for want in included + not_included:
    if want not in rows:
        fails.append(f"services: MISSING (or reworded) {want!r}")
for got in rows:
    if got not in included + not_included:
        fails.append(f"services: EXTRA row not in offer.ts: {got!r}")
if len(rows) != len(included) + len(not_included):
    fails.append(f"services: {len(rows)} rows render, offer.ts has {len(included) + len(not_included)}")

# The DECLINED rows must be exactly notIncluded[], each with its strike and the
# words "we say no" — the refusal stated, never implied by styling alone.
declined = []
for m in re.finditer(r'<li class="declined"[^>]*>(.*?)</li>', page, re.S):
    block = m.group(1)
    inner = re.sub(r'<span class="strike".*?</span>', "", block, flags=re.S)
    inner = re.sub(r'<span class="svc-no".*?</span>', "", inner, flags=re.S)
    name = squash(inner)
    declined.append(name)
    if 'class="strike"' not in block:
        fails.append(f"declined row {name!r} has no strike element")
    if "we say no" not in squash(block):
        fails.append(f"declined row {name!r} does not say 'we say no'")
if declined != not_included:
    fails.append(f"declined rows are {declined}, expected exactly notIncluded {not_included}")

# ---------- 2. FAQ parity: rendered vs JSON-LD vs offer.ts ----------
rendered_q = [squash(m) for m in re.findall(r"<summary[^>]*>(.*?)</summary>", dom, re.S)]
rendered_a = [
    squash(m)
    for m in re.findall(r"</summary>\s*<p[^>]*>(.*?)</p>", dom, re.S)
]
for item in faq:
    if squash(item["question"]) not in rendered_q:
        fails.append(f"FAQ question MISSING from the server HTML: {item['question']!r}")
    if squash(item["answer"]) not in rendered_a:
        fails.append(f"FAQ answer MISSING from the server HTML: {item['question']!r}")
for q in rendered_q:
    if q not in [squash(i["question"]) for i in faq]:
        fails.append(f"FAQ renders a question not in offer.ts: {q!r}")
if len(rendered_q) != len(faq):
    fails.append(f"{len(rendered_q)} questions render, offer.ts has {len(faq)}")

ld_blocks = re.findall(r'<script[^>]*application/ld\+json[^>]*>(.*?)</script>', page, re.S)
faq_ld = None
for b in ld_blocks:
    try:
        data = json.loads(html.unescape(b))
    except json.JSONDecodeError:
        continue
    if data.get("@type") == "FAQPage":
        faq_ld = data
if not faq_ld:
    fails.append("no FAQPage JSON-LD found")
else:
    ld_pairs = [
        (squash(e["name"]), squash(e["acceptedAnswer"]["text"]))
        for e in faq_ld.get("mainEntity", [])
    ]
    off_pairs = [(squash(i["question"]), squash(i["answer"])) for i in faq]
    if ld_pairs != off_pairs:
        fails.append(
            f"FAQPage JSON-LD does not match offer.ts exactly "
            f"({len(ld_pairs)} entries vs {len(off_pairs)})"
        )
    for q, a in ld_pairs:
        if q not in rendered_q or a not in rendered_a:
            fails.append(f"JSON-LD entry not present in the crawlable DOM: {q!r}")

# ---------- 3. the steps compose from config ----------
for step in how:
    blob = squash(dom)
    if f"{step['number']} — {step['title']}" not in blob:
        fails.append(f"step {step['number']} heading missing or not composed from config")
    if squash(step["description"]) not in blob:
        fails.append(f"step {step['number']} description missing")

# ---------- 4. the founder quote IS the FAQ answer ----------
quote = re.search(r"<blockquote[^>]*>(.*?)</blockquote>", dom, re.S)
who = next((i for i in faq if i["question"] == "Who does the work?"), None)
if not quote:
    fails.append("the founder blockquote did not render")
elif not who:
    fails.append("offer.ts has no 'Who does the work?' entry to promote")
elif squash(quote.group(1)) != squash(who["answer"]):
    fails.append("the founder quote is not verbatim the 'Who does the work?' FAQ answer")
# §1.8: text only.
founder = re.search(r'<section[^>]*class="[^"]*founder.*?</section>', page, re.S)
if founder and re.search(r"<img|background-image|avatar", founder.group(0), re.I):
    fails.append("the founder block contains an image/avatar — §1.8 says text only")

print(f"services rows={len(rows)} (declined {len(declined)}) · faq={len(rendered_q)} · steps={len(how)}")
if fails:
    print("\nFAIL:")
    for f in fails:
        print(" -", f)
    sys.exit(1)
print("\nPASS — services literal both ways, FAQ parity holds, steps compose, founder quote matches.")
