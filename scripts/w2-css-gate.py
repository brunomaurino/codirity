# Asserts the W2 CSS contracts hold in the COMPILED chunk, not in source.
#
# Source greps have lied twice on this build: Lightning CSS drops the second of
# two identical-value declarations, and a comment-blind grep "found" rules that
# were commented out. Only the shipped bytes count.
import glob
import re
import sys

chunks = glob.glob(".next/static/chunks/*.css")
assert chunks, "no compiled CSS chunk found — run `npm run build` first"
css = "\n".join(open(c, encoding="utf-8").read() for c in chunks)
print(f"chunks: {len(chunks)}  bytes: {len(css)}")

fails = []


def media_block(cond):
    """Return the body of the @media block whose condition matches `cond`."""
    i = css.find(cond)
    while i != -1:
        j = css.find("{", i)
        depth, k = 0, j
        while k < len(css):
            if css[k] == "{":
                depth += 1
            elif css[k] == "}":
                depth -= 1
                if depth == 0:
                    return css[j : k + 1]
            k += 1
        i = css.find(cond, i + 1)
    return ""


# [6] no-JS: the conversion band must render without the IntersectionObserver.
nojs = media_block("scripting:none") or media_block("scripting: none")
if not nojs:
    fails.append("no @media (scripting: none) block survived compilation")
else:
    # Lightning CSS normalises `::after` to the legacy `:after`, so accept both
    # rather than asserting the source spelling.
    flat_nojs = nojs.replace(" ", "")
    if ".term>*" not in flat_nojs:
        fails.append("no-JS block is missing `.term > *` — the band would render blank")
    if ".term:after" not in flat_nojs and ".term::after" not in flat_nojs:
        fails.append("no-JS block is missing `.term::after` — the row rules stay collapsed")

# [1] the breakpoint is the mockup's, and the old value is gone.
if "min-width:860px" not in css.replace(" ", ""):
    fails.append("the 860px breakpoint did not compile")
flat = css.replace(" ", "")
if re.search(r"min-width:900px\)\{[^}]*\.term\b", flat):
    fails.append("a 900px .term breakpoint is still shipping")

# [3] the hanging-$ gutter is sized to the glyph.
m = re.search(r"\.term-v\{[^}]*padding-left:([\d.]+)em", flat)
if not m:
    fails.append(".term-v padding-left did not compile")
elif abs(float(m.group(1)) - 0.42) > 0.001:
    fails.append(f".term-v gutter is {m.group(1)}em, expected 0.42em")

# [9] the CTA's own transition must COMPOSE with the row entrance, not replace
# it — it needs opacity+transform on the same stagger, or the CTA pops in.
m = re.search(r"\.term>\.term-cta\{transition:([^}]*)\}", flat)
if not m:
    fails.append(".term > .term-cta transition did not compile")
else:
    t = m.group(1)
    for prop in ["opacity", "transform", "border-color"]:
        if prop not in t:
            fails.append(f"CTA transition lost `{prop}`: {t}")

# v4 is single-theme: the dark variant must be neutralized, never emitting
# prefers-color-scheme rules that would repaint the grounds.
if "prefers-color-scheme:dark" in flat:
    fails.append("a prefers-color-scheme:dark block is shipping — v4 is single-theme")

if fails:
    print("\nFAIL:")
    for f in fails:
        print(" -", f)
    sys.exit(1)
print("\nPASS — compiled CSS honours the W2 contracts.")
