# Proves scripts/w3-motion-gate.py and scripts/w3-copy-gate.py can actually
# FAIL.
#
# HANDOFF §0: a gate you have never seen fail is not evidence. Every mutation
# below is a way this section could plausibly regress — a scroll-jack creeping
# in, the quantizer degrading to 1:1 linking, the tween moving out of CSS, a
# degradation path losing its collapse, or the honesty note drifting.
#
# SAFETY (Phase 4/5 review): the first version mutated the TRACKED source file
# and the built CSS chunk in place, restoring by a bare second write with no
# try/finally — any interruption between the two left an injected mutation in
# the working tree, one variant of which does not even typecheck. Everything
# now runs against COPIES in a temp dir, so the working tree is never written
# to at all and an interrupted run leaves nothing behind.
#
# Usage: python3 scripts/w3-motion-gate-selftest.py [rendered-page.html]
import os
import re
import shutil
import subprocess
import sys
import tempfile

SRC = "src/components/sections/Queue.tsx"
CHUNKS = sorted(__import__("glob").glob(".next/static/chunks/*.css"))
if not CHUNKS:
    sys.exit("no compiled CSS chunk — run `npm run build` first")
CHUNK = CHUNKS[0]
PAGE = sys.argv[1] if len(sys.argv) > 1 else None

src_orig = open(SRC, encoding="utf-8").read()
css_orig = open(CHUNK, encoding="utf-8").read()

# --- motion gate -------------------------------------------------------------
SRC_MUTATIONS = {
    "scroll-jack-preventDefault": lambda s: s.replace(
        "const r = scene.getBoundingClientRect();",
        "e.preventDefault();\n        const r = scene.getBoundingClientRect();",
        1,
    ),
    # Mutate each listener SEPARATELY. The first-draft gate used a DOTALL regex
    # that matched across calls, so a non-passive scroll listener could hide
    # behind the resize listener's options — this self-test is what caught it.
    "non-passive-scroll": lambda s: s.replace(
        '"scroll", onScroll, { passive: true }', '"scroll", onScroll, { passive: false }', 1
    ),
    "non-passive-resize": lambda s: s.replace(
        '"resize", onScroll, { passive: true }', '"resize", onScroll, { passive: false }', 1
    ),
    "one-to-one-linking": lambda s: s.replace(
        "const next = stepForScroll(r.top, r.height, window.innerHeight, steps);",
        "const next = (-r.top / (r.height - window.innerHeight)) * steps;",
        1,
    ),
}
# The quantizer's own contract now lives in a separate module, so the gate has
# to be seen failing on THAT too — otherwise moving the math out of Queue.tsx
# would have quietly moved it out of review.
QSRC = "src/lib/queueStep.ts"
qsrc_orig = open(QSRC, encoding="utf-8").read()
QSRC_MUTATIONS = {
    "quantizer-unrounded": lambda s: s.replace(
        "return Math.round(progress * steps);", "return progress * steps;", 1
    ),
    "quantizer-unclamped": lambda s: s.replace(
        "const progress = Math.min(1, Math.max(0, -sceneTop / travel));",
        "const progress = -sceneTop / travel;",
        1,
    ),
    "quantizer-no-travel-guard": lambda s: s.replace("if (travel <= 0) return null;", "", 1),
}
CSS_MUTATIONS = {
    "tween-left-css": lambda c: re.sub(
        r"(\.q-track\{[^}]*?)transition:transform \.8s var\(--ease\)", r"\1", c, count=1
    ),
    "no-js-not-collapsed": lambda c: c.replace(
        ".queue-scene{height:auto", ".queue-scene{height:320vh", 1
    ),
    "reduced-motion-not-collapsed": lambda c: c.replace(
        ".queue-scene{height:auto", ".queue-scene{height:320vh", 2
    ),
}

results = {}
work = tempfile.mkdtemp(prefix="w3-selftest-")
try:
    src_copy = os.path.join(work, "Queue.tsx")
    qsrc_copy = os.path.join(work, "queueStep.ts")
    css_copy = os.path.join(work, "chunk.css")

    def motion_gate():
        return subprocess.run(
            [
                sys.executable, "scripts/w3-motion-gate.py",
                "--source", src_copy, "--qsource", qsrc_copy, css_copy,
            ],
            capture_output=True,
        ).returncode

    def stage(src=None, qsrc=None, css=None):
        open(src_copy, "w", encoding="utf-8").write(src if src is not None else src_orig)
        open(qsrc_copy, "w", encoding="utf-8").write(qsrc if qsrc is not None else qsrc_orig)
        open(css_copy, "w", encoding="utf-8").write(css if css is not None else css_orig)

    for group, orig, kw in (
        (SRC_MUTATIONS, src_orig, "src"),
        (QSRC_MUTATIONS, qsrc_orig, "qsrc"),
        (CSS_MUTATIONS, css_orig, "css"),
    ):
        for name, mutate in group.items():
            mutated = mutate(orig)
            if mutated == orig:
                results[name] = "MUTATION-NOOP (self-test is broken)"
                continue
            stage(**{kw: mutated})
            results[name] = "caught" if motion_gate() != 0 else "MISSED"

    # --- copy gate -----------------------------------------------------------
    # The honesty gate ships with the same burden of proof as the motion gate:
    # its negative half (EXTRA chips / a drifted note) is the load-bearing part,
    # so it must be seen failing on exactly that (Phase 4/5 review).
    if PAGE:
        page_orig = open(PAGE, encoding="utf-8").read()
        page_copy = os.path.join(work, "page.html")

        PAGE_MUTATIONS = {
            "honesty-note-drift": lambda p: p.replace(
                "An illustrative queue — you scroll, we ship. Not a client board.",
                "A live look at the queue — you scroll, we ship.",
                1,
            ),
            "chip-reads-as-real-client-work": lambda p: p.replace(
                "Ops dashboard v1", "eDairyMarket dashboard v1", 1
            ),
            "extra-chip-added": lambda p: p.replace(
                '<li class="q-task">Invoice OCR agent',
                '<li class="q-task">Meshio state machine<small>queued</small></li>'
                '<li class="q-task">Invoice OCR agent',
                1,
            ),
            "headline-drift": lambda p: p.replace("One task active.", "One task at a time.", 1),
            "ssr-state-not-step-0": lambda p: p.replace("<small>active</small>", "<small>shipped</small>", 1),
        }
        for name, mutate in PAGE_MUTATIONS.items():
            mutated = mutate(page_orig)
            if mutated == page_orig:
                results[name] = "MUTATION-NOOP (self-test is broken)"
                continue
            open(page_copy, "w", encoding="utf-8").write(mutated)
            rc = subprocess.run(
                [sys.executable, "scripts/w3-copy-gate.py", page_copy], capture_output=True
            ).returncode
            results[name] = "caught" if rc != 0 else "MISSED"

        open(page_copy, "w", encoding="utf-8").write(page_orig)
        clean_copy = subprocess.run(
            [sys.executable, "scripts/w3-copy-gate.py", page_copy], capture_output=True
        ).returncode
    else:
        clean_copy = 0
        print("  (no rendered page passed — copy-gate mutations skipped)\n")

    clean_motion = subprocess.run(
        [sys.executable, "scripts/w3-motion-gate.py"], capture_output=True
    ).returncode
finally:
    shutil.rmtree(work, ignore_errors=True)

for k, v in results.items():
    print(f"  {k:32s} {v}")
print(f"  {'unmutated (motion)':32s} {'passes' if clean_motion == 0 else 'FAILS'}")
if PAGE:
    print(f"  {'unmutated (copy)':32s} {'passes' if clean_copy == 0 else 'FAILS'}")

ok = (
    all(v == "caught" for v in results.values())
    and clean_motion == 0
    and clean_copy == 0
)
print("\nGATES ARMED" if ok else "\nGATES NOT TRUSTWORTHY")
sys.exit(0 if ok else 1)
