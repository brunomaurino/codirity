# Verifies the foundingRate.active kill switch. offer.ts documents it as ONE
# line that removes the founding row, its checkout CTA, the FAQ entry and the
# eyebrow's own count TOGETHER — the offer must never strand in prose.
import html
import re
import sys

#   1. set foundingRate.active = false in src/config/offer.ts
#   2. curl -s http://localhost:3000/ -o /tmp/off.html
#   3. python3 scripts/w2-killswitch-check.py /tmp/off.html
#   4. restore the flag
S = sys.argv[1] if len(sys.argv) > 1 else "/tmp/codirity-off.html"
s = open(S, encoding="utf-8").read()
strip = lambda t: html.unescape(re.sub(r"<[^>]+>", "", t)).strip()

notes = [strip(m) for m in re.findall(r'class="term-note"[^>]*>(.*?)</span>', s, re.S)]
keys = [strip(m) for m in re.findall(r'<span class="term-k"[^>]*>(.*?)</span>', s, re.S)]
eb = re.search(r'class="label rv fade"[^>]*>(.*?)</p>', s, re.S)
eyebrow = strip(eb.group(1)) if eb else ""

# Strip the RSC flight payload before the prose sweep: it repeats every string
# and would make an honest "no stranded mention" check impossible to satisfy.
dom = re.sub(r"<script[^>]*>.*?</script>", "", s, flags=re.S)

fails = []
if len(notes) != 3:
    fails.append(f"expected 3 rows with founding off, got {len(notes)}")
if any("Founding" in k for k in keys):
    fails.append(f"founding row label still rendered: {keys}")
if "checkout_click_founding" in s:
    fails.append("founding checkout CTA still wired")
if any("launch price" in n for n in notes):
    fails.append("founding note still rendered")
if "three" not in eyebrow:
    fails.append(f"eyebrow did not follow the row count: {eyebrow!r}")
stranded = [
    m for m in re.findall(r"[^<>]{0,70}[Ff]ounding[^<>]{0,70}", dom) if m.strip()
]
if stranded:
    fails.append("'founding' still mentioned in prose: " + repr(stranded[:3]))

print(f"rows={len(notes)} labels={keys}")
print(f"eyebrow={eyebrow!r}")
if fails:
    print("\nFAIL:")
    for f in fails:
        print(" -", f)
    sys.exit(1)
print("\nPASS — one flag removed the row, the CTA, the FAQ entry and the count.")
