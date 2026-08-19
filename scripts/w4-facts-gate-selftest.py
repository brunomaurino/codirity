# Proves scripts/w4-facts-gate.py can actually FAIL — and specifically that it
# catches THE TWO FABRICATIONS THAT ACTUALLY SHIPPED in v3.
#
# This is not a formality. v3's fact gate passed both of them, because it only
# asserted that the expected strings were PRESENT: a substituted noun leaves
# every expected string intact, and so does an added sentence. Until this
# self-test shows the gate failing on those exact mutations, the gate is not
# evidence of anything (HANDOFF §0).
#
# Mutations run against COPIES in a temp dir — the working tree is never
# written to (the W3 lesson).
#
# Usage: python3 scripts/w4-facts-gate-selftest.py <rendered-page.html>
import os
import re
import shutil
import subprocess
import sys
import tempfile

if len(sys.argv) < 2:
    sys.exit("usage: w4-facts-gate-selftest.py <rendered-page.html>")
PAGE = sys.argv[1]
page_orig = open(PAGE, encoding="utf-8").read()

MUTATIONS = {
    # ---- the two that actually shipped in v3 ----
    "v3-guest-carts-substitution": lambda p: p.replace(
        "Buyer favorites, with guest favorites merged into the account on login",
        "Buyer carts, with guest carts merged into the account on login",
        1,
    ),
    # The anchor must exist in the RENDERED html — apostrophes arrive escaped as
    # `&#x27;` and the tag nesting is not what a hand-written guess assumes, so
    # a mutation keyed off the source string silently becomes a no-op and the
    # self-test reports a pass it never earned.
    "v3-invented-meshio-sentence": lambda p: p.replace(
        '<ul class="shipped-list">',
        "<p>Signup asked for everything up front and measured nothing that mattered.</p>"
        '<ul class="shipped-list">',
        1,
    ),
    # ---- the other ways this section can lie ----
    "invented-percentage": lambda p: p.replace(
        "Found and fixed.", "Found and fixed. Conversion rose 38%.", 1
    ),
    "found-and-fixed-dropped": lambda p: p.replace("Found and fixed.", "", 1),
    "stat-drifts-from-headline": lambda p: p.replace(
        '<span class="stat-big">27</span>', '<span class="stat-big">42</span>', 1
    ),
    "meshio-given-a-number": lambda p: p.replace(
        '<div class="sm"',
        '<div class="stat"><span class="stat-big">3</span>'
        '<span class="stat-of">x activation</span></div><div class="sm"',
        1,
    ),
    "llm-vendor-named": lambda p: p.replace(
        "An AI content-ideation product",
        "An OpenAI GPT-4 content-ideation product",
        1,
    ),
    "specced-upgraded-to-shipped": lambda p: p.replace(
        "Stripe subscription tiers specced", "Stripe subscription tiers shipped", 1
    ),
    "client-story-dropped": lambda p: p.replace(
        "An outfit-scoring iOS app we&#x27;re building pre-launch", "", 1
    ),
    "prelaunch-tag-dropped": lambda p: p.replace('<span class="tag">pre-launch</span>', "", 1),
}

work = tempfile.mkdtemp(prefix="w4-selftest-")
results = {}
try:
    copy = os.path.join(work, "page.html")

    def gate():
        return subprocess.run(
            [sys.executable, "scripts/w4-facts-gate.py", copy], capture_output=True
        ).returncode

    for name, mutate in MUTATIONS.items():
        mutated = mutate(page_orig)
        if mutated == page_orig:
            results[name] = "MUTATION-NOOP (self-test is broken)"
            continue
        open(copy, "w", encoding="utf-8").write(mutated)
        results[name] = "caught" if gate() != 0 else "MISSED"

    open(copy, "w", encoding="utf-8").write(page_orig)
    clean = gate()
finally:
    shutil.rmtree(work, ignore_errors=True)

for k, v in results.items():
    print(f"  {k:32s} {v}")
print(f"  {'unmutated':32s} {'passes' if clean == 0 else 'FAILS'}")

ok = all(v == "caught" for v in results.values()) and clean == 0
print("\nGATE ARMED" if ok else "\nGATE NOT TRUSTWORTHY")
sys.exit(0 if ok else 1)
