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
# Same anchoring: `rule()` searches `flat`, where `.declined.svc-name.strike`
# is a substring of the `.in`-prefixed selector.
_m = re.search(r"(?<!\.in)\.declined\.svc-name\.strike\{([^}]*)\}", flat)
strike = _m.group(1) if _m else None
if strike is None:
    fails.append(".declined .svc-name .strike did not compile")
else:
    # The strike must FRAGMENT with the text: it is an inline box wrapping the
    # words, with box-decoration-break:clone, so a row that wraps gets a bar per
    # LINE. The mockup's absolutely-positioned `transform: scaleX()` bar struck
    # only line 1, at the box's width rather than the text's — three of the five
    # declined rows wrap at 375px (Phase 4/5 review).
    if "display:inline" not in strike.replace("-block", "!"):
        fails.append(f"the strike is not an inline box, so it cannot fragment per line: {strike}")
    # The STANDARD property, not the -webkit- alias: `-webkit-box-decoration-break`
    # CONTAINS the bare name, so a plain substring test was satisfied by the
    # prefixed declaration alone. Third time this substring hazard has appeared
    # in this gate — the self-test found each one.
    if not re.search(r"(?<!-)box-decoration-break:clone", strike):
        fails.append("the strike lacks box-decoration-break:clone — it would draw once, not per line")
    if not re.search(r"background-size:0(px)? 2px|background-size:02px", strike.replace(" ", "")):
        fails.append(f"the strike does not start at zero width: {strike}")
    if "transition:background-size" not in strike:
        fails.append("the strike does not transition background-size")
    if re.search(r"transition:[^;]*\bwidth\b(?!-)", strike.replace("background-size", "")):
        fails.append("the strike transitions `width` — that relayouts the row every frame")
    if "background-position:0" not in strike:
        fails.append(f"the strike does not draw from the left: {strike}")
drawn = rule(".in.declined.svc-name.strike")
if drawn is None or "background-size:100%2px" not in (drawn or "").replace(" ", ""):
    fails.append("the strike never reaches full width on reveal")

# ---------- 2. both degradations leave it DRAWN ----------
for label, cond in [
    ("reduced-motion", "prefers-reduced-motion:reduce"),
    ("no-JS", "scripting:none"),
]:
    body = media_body(cond)
    if not body:
        fails.append(f"no @media block for {label}")
        continue
    # NOT preceded by `.in` — in flattened form `.declined.svc-name.strike` is a
    # SUBSTRING of `.in.declined.svc-name.strike`, so an unanchored findall let
    # the revealed-state rule vouch for the degradation rule and the check could
    # not fail. The self-test caught it.
    bodies = re.findall(r"(?<!\.in)\.declined\.svc-name\.strike\{([^}]*)\}", body)
    if not any("background-size:100%2px" in b.replace(" ", "") for b in bodies):
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
