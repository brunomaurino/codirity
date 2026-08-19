# W3 motion gates: the queue scene's contracts, asserted where they actually
# ship.
#
#   1. NO SCROLL-JACKING — over the component source.
#   2. NO 1:1 SCROLL-LINKING — the handler may only write a discrete integer.
#   3. The tween belongs to CSS — asserted in the COMPILED chunk, because a
#      source grep is comment-blind and Lightning CSS drops the second of two
#      identical-value declarations.
#   4. Reduced motion AND no-JS both collapse the 320vh scene — W2 shipped a
#      conversion band that rendered blank without JS, and a 320vh scene whose
#      quantizer never runs is the same defect wearing a different hat.
#
# Usage:
#   python3 scripts/w3-motion-gate.py [path/to/compiled.css ...]
#   python3 scripts/w3-motion-gate.py --source <Queue.tsx> [compiled.css ...]
#
# `--source` exists so the self-test can point the gate at COPIES instead of
# mutating the tracked working tree (Phase 4/5 review).
import glob
import re
import sys

fails = []

argv = sys.argv[1:]
SRC = "src/components/sections/Queue.tsx"
QSRC = "src/lib/queueStep.ts"
while argv and argv[0] in ("--source", "--qsource"):
    if argv[0] == "--source":
        SRC = argv[1]
    else:
        QSRC = argv[1]
    argv = argv[2:]

# ---------- 1 + 2: the component source ----------
src = open(SRC, encoding="utf-8").read()
# Strip comments first: the file DISCUSSES scroll-jacking at length, and a
# comment-blind grep would fail on its own documentation.
code = re.sub(r"//[^\n]*", "", re.sub(r"/\*.*?\*/", "", src, flags=re.S))

for banned, why in [
    (r"\.preventDefault\s*\(", "preventDefault on a scroll/touch/wheel event is scroll-jacking"),
    (r"\bscrollTo\s*\(", "scrollTo drives the reader's scroll position"),
    (r"\bscrollIntoView\s*\(", "scrollIntoView drives the reader's scroll position"),
    (r"scroll-behavior", "overriding scroll-behavior hijacks native scrolling"),
    (r"\bwheel\b", "a wheel listener is the classic scroll-jack surface"),
    (r"overflow\s*[:=]", "the scene must not manage its own scroll container"),
]:
    if re.search(banned, code):
        fails.append(f"scroll-jacking: {why} — found /{banned}/ in {SRC}")

# EVERY scroll-ish listener must be passive — checked one call at a time.
# A single regex spanning `addEventListener("scroll" ... passive: true` with
# DOTALL matched ACROSS calls, so adding a second listener let a non-passive
# first one hide behind the second one's options. The self-test caught it.
listeners = re.findall(
    r"addEventListener\(\s*[\"'](scroll|resize|wheel|touchmove|touchstart)[\"']\s*,([^;]*?)\)\s*;",
    code,
    re.S,
)
if not listeners:
    fails.append("no scroll listener found at all — did the quantizer move?")
for name, rest in listeners:
    if "passive:true" not in rest.replace(" ", ""):
        fails.append(f"the `{name}` listener is not registered {{ passive: true }}")

# The quantizer must go through the pure `stepForScroll`, which is where the
# rounding lives and where scripts/w3-quantizer-test.ts asserts the contract.
# The component must NEVER compute a step inline again.
if "stepForScroll(" not in code:
    fails.append("Queue.tsx no longer delegates to stepForScroll — the quantizer contract is untested")
if re.search(r"-\s*r\.top\s*/", code) or re.search(r"\bprogress\b", code):
    fails.append("Queue.tsx computes a scroll ratio inline again — that math belongs in stepForScroll")

try:
    qcode = re.sub(r"//[^\n]*", "", re.sub(r"/\*.*?\*/", "", open(QSRC, encoding="utf-8").read(), flags=re.S))
except FileNotFoundError:
    qcode = ""
    fails.append(f"{QSRC} is missing — the quantizer has no testable home")
if qcode:
    if "Math.round(" not in qcode:
        fails.append(f"{QSRC}: no Math.round — the step must be quantized, not scroll-proportional")
    if "Math.min(1" not in qcode or "Math.max(0" not in qcode:
        fails.append(f"{QSRC}: progress is not clamped to [0,1] — the step would run past the chips")
    if not re.search(r"travel\s*<=\s*0", qcode):
        fails.append(f"{QSRC}: no travel<=0 guard — a collapsed scene would divide by zero or snap to 0")
    if not re.search(r"return\s+Math\.round", qcode):
        fails.append(f"{QSRC}: the returned value is not the rounded step")

# ---------- 3 + 4: the compiled CSS ----------
chunks = argv or glob.glob(".next/static/chunks/*.css")
if not chunks:
    fails.append("no compiled CSS chunk — run `npm run build` first")
    css = ""
else:
    css = "\n".join(open(c, encoding="utf-8").read() for c in chunks)
flat = css.replace(" ", "")


def media_body(*conds):
    """Body of the first @media block whose condition matches any of `conds`."""
    for cond in conds:
        i = flat.find(cond)
        while i != -1:
            j = flat.find("{", i)
            depth, k = 0, j
            while k < len(flat):
                if flat[k] == "{":
                    depth += 1
                elif flat[k] == "}":
                    depth -= 1
                    if depth == 0:
                        return flat[j : k + 1]
                k += 1
            i = flat.find(cond, i + 1)
    return ""


if css:
    # The tween is CSS's, on the house curve, and the track is what moves.
    m = re.search(r"\.q-track\{([^}]*)\}", flat)
    if not m:
        fails.append(".q-track did not compile")
    else:
        body = m.group(1)
        if "transition:transform" not in body:
            fails.append(f".q-track has no transform transition — the tween is not CSS's: {body}")
        if "var(--ease)" not in body and "cubic-bezier" not in body:
            fails.append(".q-track's transition is not on the house curve")
        if "translatex(calc(var(--step" not in body.lower():
            fails.append(".q-track no longer composes its transform from --step")

    if ".queue-scene{height:320vh}" not in flat:
        fails.append("the 320vh scroll track did not compile")
    if "position:sticky" not in flat:
        fails.append("the sticky stage did not compile")

    # Both degradations must collapse the scene. A 320vh scene whose quantizer
    # cannot run is three viewports of dead scroll past a frozen queue.
    for label, body in [
        ("reduced-motion", media_body("prefers-reduced-motion:reduce")),
        ("no-JS", media_body("scripting:none")),
    ]:
        if not body:
            fails.append(f"no @media block for {label}")
            continue
        # Parse each rule's BODY — Lightning CSS reorders declarations
        # alphabetically, so a positional `.q-track{transform:none` assertion
        # is a gate bug, not a CSS defect (the same class as its `::after` →
        # `:after` normalisation).
        def decls(selector, block=body):
            m = re.search(re.escape(selector) + r"\{([^}]*)\}", block)
            return m.group(1) if m else None

        scene_d = decls(".queue-scene")
        if scene_d is None or "height:auto" not in scene_d:
            fails.append(f"{label}: the 320vh scene is not collapsed to height:auto")
        stage_d = decls(".queue-stage")
        if stage_d is None or "position:static" not in stage_d:
            fails.append(f"{label}: the sticky stage is not made static")
        track_d = decls(".q-track")
        if track_d is None or "transform:none" not in track_d:
            fails.append(f"{label}: the track still translates")

print(f"source: {SRC}  chunks: {len(chunks)}")
if fails:
    print("\nFAIL:")
    for f in fails:
        print(" -", f)
    sys.exit(1)
print("\nPASS — no scroll-jacking, no 1:1 linking, CSS owns the tween, both degradations collapse.")
