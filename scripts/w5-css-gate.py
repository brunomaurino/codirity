# W5 CSS contracts, asserted in the COMPILED chunk.
#
# The strike on the declined rows is new MOTION, so it inherits every trap the
# plan has already paid for:
#   - it must be a TRANSFORM (scaleX), never an animated width — a width
#     animation relayouts the row on every frame;
#   - reduced-motion AND `scripting: none` must both leave it DRAWN. Killing
#     the transition alone freezes it at scaleX(0), which is the same
#     "kill the motion, strand the content" defect as W4's clipped stat and
#     W2's blank conversion band;
#   - the services hover must move the inner span by transform, never padding
#     (a padding hover changes the row box and shoves every sibling down).
#
# Usage: python3 scripts/w5-css-gate.py [chunk.css ...]
import glob
import re
import sys

chunks = sys.argv[1:] or glob.glob(".next/static/chunks/*.css")
if not chunks:
    sys.exit("no compiled CSS chunk — run `npm run build` first")
css = "\n".join(open(c, encoding="utf-8").read() for c in chunks)
flat = css.replace(" ", "")

fails = []


def rule(selector, block=flat):
    m = re.search(re.escape(selector) + r"\{([^}]*)\}", block)
    return m.group(1) if m else None


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


# ---------- 1. the strike is a transform, and it draws ----------
strike = rule(".declined.svc-name.strike")
if strike is None:
    fails.append(".declined .svc-name .strike did not compile")
else:
    if "transform:scalex(0)" not in strike.lower():
        fails.append(f"the strike does not start at scaleX(0): {strike}")
    if "transition:transform" not in strike:
        fails.append("the strike does not transition TRANSFORM — a width animation relayouts")
    if re.search(r"transition:[^;]*\bwidth\b", strike):
        fails.append("the strike transitions `width` — that relayouts the row every frame")
    # Lightning CSS normalises `transform-origin: left` to `0` (and `translateX`
    # to `translate`) — accept the compiled spellings rather than the authored
    # ones, the same class as its `::after` → `:after` rewrite.
    if not re.search(r"transform-origin:(left|0)\b", strike):
        fails.append(f"the strike does not draw from the left: {strike}")
drawn = rule(".in.declined.svc-name.strike")
if drawn is None or "scalex(1)" not in drawn.lower():
    fails.append("the strike never reaches scaleX(1) on reveal")

# ---------- 2. both degradations leave it DRAWN ----------
for label, cond in [
    ("reduced-motion", "prefers-reduced-motion:reduce"),
    ("no-JS", "scripting:none"),
]:
    body = media_body(cond)
    if not body:
        fails.append(f"no @media block for {label}")
        continue
    bodies = re.findall(r"\.declined\.svc-name\.strike\{([^}]*)\}", body)
    if not any("scalex(1)" in b.lower() for b in bodies):
        fails.append(
            f"{label}: the strike is not pinned to scaleX(1) — the declined rows would "
            f"render with no strike at all"
        )

# ---------- 3. the hover moves by transform, never padding ----------
hover = rule(".svc-listli:hover.svc-name")
if hover is None:
    fails.append("the services hover rule did not compile")
else:
    # `translateX(14px)` compiles to `translate(14px)`; both are a horizontal
    # transform, which is what the contract is about.
    if not re.search(r"transform:translate(x)?\(", hover.lower()):
        fails.append(f"the services hover does not move by transform: {hover}")
    if "padding" in hover:
        fails.append("the services hover changes PADDING — that reflows every sibling row")

name = rule(".svc-name")
if name and "transition:transform" not in name:
    fails.append(".svc-name does not transition transform")
if name and re.search(r"transition:[^;]*padding", name):
    fails.append(".svc-name transitions padding")

# ---------- 4. no orphaned animations (the W4 class, re-checked) ----------
defined = set(re.findall(r"@keyframes\s+([A-Za-z_][\w-]*)", css))
referenced = set()
for m in re.findall(r"animation-name:\s*([^;}]+)", css):
    referenced |= {n.strip() for n in m.split(",") if n.strip()}
KEYWORDS = {
    "none", "linear", "ease", "ease-in", "ease-out", "ease-in-out", "infinite",
    "normal", "reverse", "alternate", "alternate-reverse", "forwards", "backwards",
    "both", "running", "paused", "step-start", "step-end", "initial", "inherit",
    "unset", "revert", "auto",
}
for m in re.findall(r"[^-]animation:\s*([^;}]+)", css):
    for t in re.split(r"[\s,]+", m.strip()):
        if (
            t
            and not re.match(r"^[\d.]+m?s$", t)
            and not t.startswith(("cubic-bezier", "steps", "var("))
            and t.lower() not in KEYWORDS
            and re.match(r"^[A-Za-z_][\w-]*$", t)
        ):
            referenced.add(t)
for n in sorted(referenced - defined - {"none"}):
    fails.append(f"animation `{n}` is referenced but no @keyframes defines it — it dies SILENTLY")

# ---------- 5. the paper ground exists and carries its own smoothing ----------
paper = rule(".paper")
if paper is None:
    fails.append(".paper did not compile")
elif "-webkit-font-smoothing:auto" not in paper:
    fails.append(".paper does not reset font-smoothing — dark-section antialiasing thins ink on paper")

print(f"chunks={len(chunks)}")
if fails:
    print("\nFAIL:")
    for f in fails:
        print(" -", f)
    sys.exit(1)
print("\nPASS — the strike is a transform and always draws; hover is transform-only; no orphans.")
