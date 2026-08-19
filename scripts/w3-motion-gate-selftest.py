# Proves scripts/w3-motion-gate.py can actually FAIL.
#
# HANDOFF §0: a gate you have never seen fail is not evidence. Every mutation
# below is a way this section could plausibly regress — a scroll-jack creeping
# in, the quantizer degrading to 1:1 linking, the tween moving from CSS into JS,
# or a degradation path silently losing its collapse.
import os
import re
import shutil
import subprocess
import sys
import tempfile

SRC = "src/components/sections/Queue.tsx"
CHUNK = None
import glob

chunks = glob.glob(".next/static/chunks/*.css")
if not chunks:
    sys.exit("no compiled CSS chunk — run `npm run build` first")
CHUNK = chunks[0]

src_orig = open(SRC, encoding="utf-8").read()
css_orig = open(CHUNK, encoding="utf-8").read()

SRC_MUTATIONS = {
    "scroll-jack-preventDefault": lambda s: s.replace(
        "const r = scene.getBoundingClientRect();",
        "e.preventDefault();\n        const r = scene.getBoundingClientRect();",
        1,
    ),
    # Mutate the SCROLL listener specifically. Replacing the first
    # `{ passive: true }` anywhere is what let the loose first-draft regex pass:
    # it matched across calls and found the RESIZE listener's options instead.
    "non-passive-scroll": lambda s: s.replace(
        '"scroll", onScroll, { passive: true }', '"scroll", onScroll, { passive: false }', 1
    ),
    "non-passive-resize": lambda s: s.replace(
        '"resize", onScroll, { passive: true }', '"resize", onScroll, { passive: false }', 1
    ),
    "one-to-one-linking": lambda s: s.replace(
        "const next = Math.round(progress * steps);",
        "const next = progress * steps;",
        1,
    ),
}

CSS_MUTATIONS = {
    "tween-left-css": lambda c: re.sub(
        r"(\.q-track\{[^}]*?)transition:transform \.8s var\(--ease\)", r"\1", c, count=1
    ),
    "reduced-motion-not-collapsed": lambda c: c.replace(
        ".queue-scene{height:auto", ".queue-scene{height:320vh", 1
    ),
}

results = {}


def run_gate():
    return subprocess.run(
        [sys.executable, "scripts/w3-motion-gate.py"], capture_output=True
    ).returncode


for name, mutate in SRC_MUTATIONS.items():
    mutated = mutate(src_orig)
    if mutated == src_orig:
        results[name] = "MUTATION-NOOP (self-test is broken)"
        continue
    open(SRC, "w", encoding="utf-8").write(mutated)
    results[name] = "caught" if run_gate() != 0 else "MISSED"
    open(SRC, "w", encoding="utf-8").write(src_orig)

for name, mutate in CSS_MUTATIONS.items():
    mutated = mutate(css_orig)
    if mutated == css_orig:
        results[name] = "MUTATION-NOOP (self-test is broken)"
        continue
    open(CHUNK, "w", encoding="utf-8").write(mutated)
    results[name] = "caught" if run_gate() != 0 else "MISSED"
    open(CHUNK, "w", encoding="utf-8").write(css_orig)

clean = run_gate()
for k, v in results.items():
    print(f"  {k:30s} {v}")
print(f"  {'unmutated':30s} {'passes' if clean == 0 else 'FAILS'}")

ok = all(v == "caught" for v in results.values()) and clean == 0
print("\nGATE ARMED" if ok else "\nGATE NOT TRUSTWORTHY")
sys.exit(0 if ok else 1)
