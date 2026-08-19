# W3 copy gate: the queue scene's rendered text vs the approved mockup, BOTH
# directions — same contract as W2's.
#
# The negative half is the load-bearing one. v3's fact-provenance gate only
# asserted expected strings were PRESENT, which is blind to substitutions and
# additions, and it passed two fabrications. Here it matters more than usual:
# the chips are ILLUSTRATIVE and the honesty note says so, so a chip quietly
# growing into something that reads like real client work is exactly the
# regression this section can suffer.
#
# Usage: python3 scripts/w3-copy-gate.py [path/to/rendered.html]
import html
import re
import sys

PAGE = sys.argv[1] if len(sys.argv) > 1 else "/tmp/codirity-page.html"
page = open(PAGE, encoding="utf-8").read()
mock = open("docs/redesign-v4/approved-mockup.html", encoding="utf-8").read()

strip = lambda t: html.unescape(re.sub(r"<[^>]+>", " ", t))
squash = lambda t: re.sub(r"\s+", " ", strip(t)).strip()


def scene(src):
    """The #queue section only — the word 'queue' appears all over both files."""
    i = src.find('id="queue"')
    if i == -1:
        return ""
    j = src.find("</section>", i)
    return src[i:j]


ps, ms = scene(page), scene(mock)
fails = []
if not ps:
    fails.append("no #queue section rendered")
if not ms:
    fails.append("no #queue section in the mockup (contract moved?)")

if ps and ms:
    def chips(s):
        return [
            squash(re.sub(r"<small>.*?</small>", "", m, flags=re.S))
            for m in re.findall(r'class="q-task[^"]*"[^>]*>(.*?)</li>', s, re.S)
        ]

    def one(s, cls):
        m = re.search(rf'class="{cls}"[^>]*>(.*?)</p>', s, re.S)
        return squash(m.group(1)) if m else None

    pc, mc = chips(ps), chips(ms)
    for want in mc:
        if want not in pc:
            fails.append(f"MISSING chip from mockup: {want!r}")
    for got in pc:
        if got not in mc:
            fails.append(f"EXTRA chip not in mockup (fabrication check): {got!r}")
    if len(pc) != len(mc):
        fails.append(f"chip count: page {len(pc)} vs mockup {len(mc)}")

    # The honesty line is the gate on this whole section. Verbatim or nothing.
    pn, mn = one(ps, "q-note"), one(ms, "q-note")
    if pn != mn:
        fails.append(f"HONESTY LINE differs:\n    mockup: {mn!r}\n    page:   {pn!r}")

    # The headline, hand-set one line per masked rise.
    ph = [squash(m) for m in re.findall(r'class="line"[^>]*><span>(.*?)</span>', ps, re.S)]
    mh = [squash(m) for m in re.findall(r'class="line"[^>]*><span>(.*?)</span>', ms, re.S)]
    if ph != mh:
        fails.append(f"HEADLINE differs:\n    mockup: {mh}\n    page:   {ph}")

    # The label above it.
    pl = one(ps, "label rv fade")
    ml = one(ms, "label rv fade")
    if pl != ml:
        fails.append(f"label differs: mockup {ml!r} vs page {pl!r}")

    # SSR must render the coherent step-0 state: one active, rest queued,
    # counter 0. A no-JS reader sees exactly this and nothing else.
    states = [squash(m) for m in re.findall(r"<small>(.*?)</small>", ps, re.S)]
    if states != ["active", "queued", "queued", "queued"]:
        fails.append(f"SSR state is not the coherent step-0 tableau: {states}")
    counter = re.search(r'class="q-count"[^>]*>(.*?)</span>', ps, re.S)
    if not counter or squash(counter.group(1)) != "0":
        fails.append(f"SSR counter is not 0: {counter and squash(counter.group(1))}")

    print(f"chips={pc}")
    print(f"headline={ph}")
    print(f"note={pn!r}")

if fails:
    print("\nFAIL:")
    for f in fails:
        print(" -", f)
    sys.exit(1)
print("\nPASS — queue scene matches the approved mockup in both directions.")
