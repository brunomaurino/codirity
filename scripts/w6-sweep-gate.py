# W6 retirement-sweep gate — the plan's closing check.
#
# Asserts that the v3 system is GONE, both in `src/` and in the COMPILED chunk.
# The compiled half is the load-bearing one: a class can vanish from source
# while its CSS still ships (Tailwind emits from a content scan, and a rule that
# nothing references is still bytes on the wire), and the whole point of a
# retirement sweep is that the dead weight actually stops being sent.
#
# Usage: python3 scripts/w6-sweep-gate.py [chunk.css ...]
import glob
import pathlib
import re
import sys

fails = []

# ---------- 1. source: the retired vocabulary is gone ----------
SRC = [p for p in pathlib.Path("src").rglob("*") if p.suffix in {".ts", ".tsx", ".css"}]

# `dark:` as the TAILWIND VARIANT — not Button's `dark` CVA variant name and not
# the `--*-dark` token names, neither of which is the variant.
DARK_VARIANT = re.compile(r'(?<=[\s"\'`])dark:[a-z0-9[\]-]')
RETIRED = {
    "the `.accent` italic treatment": re.compile(r'className=[^>]*\baccent\b|\.accent\s*\{'),
    "`.blob-*` gradient aliases": re.compile(r'\bblob-[1-4]\b|animate-blob'),
    "`.glass-dark`": re.compile(r"glass-dark"),
    "`gradient-text`": re.compile(r"gradient-text"),
    # The UTILITY class, not the theme variable: `--font-mono: initial` is how
    # Tailwind's own default is DELETED, so it must not read as a usage.
    "`font-mono` (v4 is ONE family)": re.compile(r"(?<!-)\bfont-mono\b"),
    "`font-serif` (v4 is ONE family)": re.compile(r"(?<!-)\bfont-serif\b"),
    "`font-bold` (hierarchy comes from SIZE)": re.compile(r"\bfont-bold\b"),
    "the retired Figtree/Instrument Serif faces": re.compile(r"Figtree|Instrument_Serif|Instrument Serif"),
}

for p in SRC:
    text = p.read_text(encoding="utf-8")
    # Comments legitimately NAME the retired things while explaining the sweep.
    code = re.sub(r"/\*.*?\*/", "", text, flags=re.S)
    code = re.sub(r"^\s*//[^\n]*$", "", code, flags=re.M)
    if DARK_VARIANT.search(code):
        hits = DARK_VARIANT.findall(code)
        fails.append(f"{p}: {len(hits)} surviving `dark:` variant(s) — v4 is single-theme")
    for label, rx in RETIRED.items():
        if rx.search(code):
            fails.append(f"{p}: still references {label}")

# The neutralizing @custom-variant must be PRESENT. This assertion was written
# backwards at first — "nothing consumes it, so delete it" — and deleting it
# immediately regrew a real `@media (prefers-color-scheme: dark)` block in the
# compiled chunk: Tailwind v4 scans the WHOLE project, and the `dark:` utilities
# quoted inside docs/autonomous-runs/** were enough to re-enable OS dark mode
# against fixed grounds. The guard is load-bearing, not leftovers.
gl = pathlib.Path("src/app/globals.css").read_text(encoding="utf-8")
if "@custom-variant dark" not in re.sub(r"/\*.*?\*/", "", gl, flags=re.S):
    fails.append(
        "globals.css no longer neutralizes the `dark:` variant — Tailwind will re-enable "
        "real OS dark mode from any `dark:` class anywhere in the project"
    )

# ---------- 2. compiled: the dead CSS actually stopped shipping ----------
chunks = sys.argv[1:] or glob.glob(".next/static/chunks/*.css")
if not chunks:
    fails.append("no compiled CSS chunk — run `npm run build` first")
    css = ""
else:
    css = "\n".join(open(c, encoding="utf-8").read() for c in chunks)
flat = css.replace(" ", "")

if css:
    for label, needle in [
        ("`.blob-*` aliases", r"\.blob-[1-4]"),
        ("the blob-float keyframes", r"@keyframesblob-float"),
        ("`.glass-dark`", r"\.glass-dark"),
        ("`gradient-text`", r"\.gradient-text"),
        ("a prefers-color-scheme:dark block", r"prefers-color-scheme:dark"),
        ("the `--font-mono` remap", r"--font-mono:"),
        ("the `--font-serif` remap", r"--font-serif:"),
    ]:
        if re.search(needle, flat):
            fails.append(f"COMPILED CHUNK still ships {label}")

    # And the v4 system is present — a sweep that deleted too much would fail here.
    # `.panel-deep` was REMOVED from this list: it was the v3 deep-surface
    # alias whose last consumer (Benefits) is gone, and requiring it here
    # actively blocked finishing the sweep (Phase 4/5 review).
    for needed in [".close-cta", ".ownblockquote", ".trust", ".wrap-v4"]:
        if needed.replace(" ", "") not in flat:
            fails.append(f"COMPILED CHUNK is missing {needed} — the sweep took too much")

print(f"source files scanned={len(SRC)} · chunks={len(chunks)}")
if fails:
    print("\nFAIL:")
    for f in fails:
        print(" -", f)
    sys.exit(1)
print("\nPASS — the v3 system is gone from source AND from the shipped bytes.")
