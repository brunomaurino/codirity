# Verifies the foundingRate.active kill switch. offer.ts documents it as ONE
# line that removes the founding row, its checkout CTA, the FAQ entry and the
# eyebrow's own count TOGETHER — the offer must never strand in prose.
#
# Since 2026-09-14 `active` is FALSE in the shipped config (one flat price), so
# this now runs against the ordinary rendered page and guards the retirement:
# no founding row, no founding CTA, no stranded "founding" in prose, and an
# eyebrow that counts the two rows that remain.
import html
import re
import sys

#   curl -s http://localhost:3000/ -o /tmp/off.html
#   python3 scripts/w2-killswitch-check.py /tmp/off.html
# To prove the switch still SWITCHES, flip active back to true and confirm the
# founding row, its CTA and the FAQ entry all reappear together.
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
if len(notes) != 2:
    fails.append(f"expected 2 rows with founding off, got {len(notes)}")
if any("Founding" in k for k in keys):
    fails.append(f"founding row label still rendered: {keys}")
if "checkout_click_founding" in s:
    fails.append("founding checkout CTA still wired")
if any("launch price" in n for n in notes):
    fails.append("founding note still rendered")
if "two" not in eyebrow:
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
