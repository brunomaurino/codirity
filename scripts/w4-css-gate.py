# W4 CSS contracts, asserted in the COMPILED chunk.
#
# The headline check here is general, not W4-specific: **every animation-name
# referenced anywhere must have matching @keyframes**. W4 shipped
# `animation: stat-wipe` with the keyframes never ported. Nothing errored —
# an undefined animation-name simply resolves to none — so the flagship
# scroll-linked wipe was silently dead in every browser that supported it,
# AND its `@supports not` fallback was suppressed because the positive branch
# still matched. A visual check cannot catch this: a wipe that never ran looks
# exactly like a wipe that finished (Phase 4/5 review BLOCKER).
#
# Usage: python3 scripts/w4-css-gate.py [chunk.css ...]
import glob
import re
import sys

chunks = sys.argv[1:] or glob.glob(".next/static/chunks/*.css")
if not chunks:
    sys.exit("no compiled CSS chunk — run `npm run build` first")
css = "\n".join(open(c, encoding="utf-8").read() for c in chunks)
flat = css.replace(" ", "")

fails = []

# ---------- 1. no animation references undefined keyframes ----------
defined = set(re.findall(r"@keyframes\s+([A-Za-z_][\w-]*)", css))
referenced = set()
# `animation-name: x` and the `animation:` shorthand (Lightning CSS reorders the
# shorthand's components, so take every identifier and subtract known keywords).
for m in re.findall(r"animation-name:\s*([^;}]+)", css):
    referenced |= {n.strip() for n in m.split(",") if n.strip()}
KEYWORDS = {
    "none", "linear", "ease", "ease-in", "ease-out", "ease-in-out", "infinite",
    "normal", "reverse", "alternate", "alternate-reverse", "forwards", "backwards",
    "both", "running", "paused", "step-start", "step-end", "initial", "inherit",
    "unset", "revert", "auto",
}
for m in re.findall(r"[^-]animation:\s*([^;}]+)", css):
    for token in re.split(r"[\s,]+", m.strip()):
        t = token.strip()
        if (
            t
            and not re.match(r"^[\d.]+m?s$", t)
            and not t.startswith(("cubic-bezier", "steps", "var("))
            and t.lower() not in KEYWORDS
            and re.match(r"^[A-Za-z_][\w-]*$", t)
        ):
            referenced.add(t)

for name in sorted(referenced - defined - {"none"}):
    fails.append(
        f"animation `{name}` is referenced but no @keyframes defines it — it resolves "
        f"to none and dies SILENTLY"
    )

# ---------- 2. both degradations pin the stat to its finished state ----------
def media_body(cond):
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


for label, cond in [
    ("reduced-motion", "prefers-reduced-motion:reduce"),
    ("no-JS", "scripting:none"),
]:
    body = media_body(cond)
    if not body:
        fails.append(f"no @media block for {label}")
        continue
    # ALL `.stat-big{…}` bodies, not the first: `.stat-big` also terminates a
    # long selector list (`…,.q-task,.stat-big{animation:none!important}`), and
    # a first-match regex read that rule's body and reported the pin missing.
    # Same positional-assumption bug class as W3's declaration-order check.
    bodies = re.findall(r"\.stat-big\{([^}]*)\}", body)
    if not any("clip-path:none" in b for b in bodies):
        fails.append(
            f"{label}: .stat-big is not pinned to clip-path:none — the headline figure "
            f"would stay clipped to nothing"
        )

# ---------- 3. the scroll-linked branch and its fallback both compile ----------
if "@supports(animation-timeline:view())" not in flat:
    fails.append("the scroll-linked wipe branch did not compile")
if "@supportsnot(animation-timeline:view())" not in flat:
    fails.append("the @supports-not fallback did not compile")

# ---------- 4. the stat caps AT the h1 size, as its comment claims ----------
stat = re.search(r"\.stat-big\{[^}]*font-size:clamp\([^)]*,([\d.]+)rem\)", flat)
hero = re.search(r"\.d-xl\{[^}]*font-size:clamp\([^)]*,([\d.]+)rem\)", flat)
if not stat or not hero:
    fails.append("could not read the stat / hero size caps from the compiled chunk")
elif float(stat.group(1)) > float(hero.group(1)):
    fails.append(
        f"the stat caps at {stat.group(1)}rem, ABOVE the h1's {hero.group(1)}rem — "
        f"'one king per page, and it isn't a client's bug count'"
    )

print(f"chunks={len(chunks)} keyframes_defined={sorted(defined)}")
print(f"animations_referenced={sorted(referenced)}")
if fails:
    print("\nFAIL:")
    for f in fails:
        print(" -", f)
    sys.exit(1)
print("\nPASS — no orphaned animations; both degradations pin the stat; sizes hold.")
