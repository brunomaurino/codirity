# W2 copy gate: the terms band's rendered text must match the approved mockup
# EXACTLY — both directions.
#
# The v3 fact-provenance gate only asserted that the spec's strings were PRESENT.
# It passed two fabrications ("guest carts", an invented Meshio sentence) because
# a substitution or an ADDITION leaves every expected string intact. So this gate
# has a negative half: every note/label the page renders inside #terms must also
# appear in the mockup. Anything the page says that the mockup does not is a
# regression, whether or not the expected strings survived.
import html
import re
import sys

#   curl -s http://localhost:3000/ -o /tmp/page.html
#   python3 scripts/w2-copy-gate.py /tmp/page.html
PAGE = sys.argv[1] if len(sys.argv) > 1 else "/tmp/codirity-page.html"
page = open(PAGE, encoding="utf-8").read()
mock = open("docs/redesign-v4/approved-mockup.html", encoding="utf-8").read()


def spans(src, cls):
    return [
        html.unescape(re.sub(r"<[^>]+>", "", m)).strip()
        for m in re.findall(rf'<span class="{cls}"[^>]*>(.*?)</span>', src, re.S)
    ]


def notes(src):
    return [
        html.unescape(re.sub(r"<[^>]+>", "", m)).strip()
        for m in re.findall(r'class="term-note"[^>]*>(.*?)</span>', src, re.S)
    ]


fails = []

mock_notes, page_notes = notes(mock), notes(page)
mock_keys, page_keys = spans(mock, "term-k"), spans(page, "term-k")

# Positive half: everything the contract promises is rendered.
for want in mock_notes:
    if want not in page_notes:
        fails.append(f"MISSING note from mockup:\n    want: {want!r}")
for want in mock_keys:
    if want not in page_keys:
        fails.append(f"MISSING label from mockup:\n    want: {want!r}")

# Negative half: the page invents nothing the contract does not carry.
for got in page_notes:
    if got not in mock_notes:
        fails.append(f"EXTRA note not in mockup (fabrication check):\n    got:  {got!r}")
for got in page_keys:
    if got not in mock_keys:
        fails.append(f"EXTRA label not in mockup:\n    got:  {got!r}")

if len(page_notes) != len(mock_notes):
    fails.append(f"row count: page {len(page_notes)} vs mockup {len(mock_notes)}")

# The figures are the whole point of the band — compare them as rendered.
def figures(src):
    out = []
    for m in re.findall(r'class="term-v[^"]*"[^>]*>(.*?)</span>\s*<span class="term-note"', src, re.S):
        out.append(re.sub(r"\s+", " ", html.unescape(re.sub(r"<[^>]+>", " ", m))).strip())
    return out


mf, pf = figures(mock), figures(page)
if mf != pf:
    fails.append(f"FIGURES differ:\n    mockup: {mf}\n    page:   {pf}")

# Eyebrow: the spelled-out count must equal the rows actually rendered.
eb = re.search(r'class="label rv fade"[^>]*>(.*?)</p>', page, re.S)
eyebrow = html.unescape(re.sub(r"<[^>]+>", "", eb.group(1))).strip() if eb else ""
words = {"zero": 0, "one": 1, "two": 2, "three": 3, "four": 4, "five": 5, "six": 6}
m = re.search(r"in (\w+) numbers", eyebrow)
if not m:
    fails.append(f"eyebrow not found/parsed: {eyebrow!r}")
elif words.get(m.group(1)) != len(page_notes):
    fails.append(f"eyebrow says {m.group(1)!r} but {len(page_notes)} rows render")

print(f"rows={len(page_notes)} eyebrow={eyebrow!r}")
print(f"figures={pf}")
if fails:
    print("\nFAIL:")
    for f in fails:
        print(" -", f)
    sys.exit(1)
print("\nPASS — terms band copy matches the approved mockup in both directions.")
