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
# Usage: python3 scripts/w3-motion-gate.py [path/to/compiled.css]
import glob
import re
import sys

fails = []

# ---------- 1 + 2: the component source ----------
SRC = "src/components/sections/Queue.tsx"
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

if not re.search(r"addEventListener\(\s*[\"']scroll[\"'].*?passive:\s*true", code, re.S):
    fails.append("the scroll listener must be registered { passive: true }")

# The handler must write a ROUNDED integer, never the raw progress ratio.
if not re.search(r"Math\.round\(", code):
    fails.append("no Math.round — the step must be quantized, not scroll-proportional")
# `progress` (the continuous 0..1 value) must never reach the DOM.
for sink in [r"setScrollStep\(\s*progress", r"setProperty\([^)]*progress", r"style[^=]*=\s*[^;]*progress"]:
    if re.search(sink, code):
        fails.append(f"the continuous scroll ratio reaches the DOM (/{sink}/) — that is 1:1 linking")

# ---------- 3 + 4: the compiled CSS ----------
chunks = sys.argv[1:] or glob.glob(".next/static/chunks/*.css")
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
