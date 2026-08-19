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
    # The anchor must exist in the RENDERED html AND belong to the right
    # entity. Two ways this mutation has already been wrong: apostrophes arrive
    # escaped as `&#x27;` (so a source-string anchor silently no-ops), and the
    # FIRST `<ul class="shipped-list">` belongs to eDairyMarket, not Meshio — so
    # a mutation named "meshio" was reported "caught" while never touching
    # Meshio's block at all (Phase 4/5 review). Anchor on Meshio's own text.
    "v3-invented-meshio-sentence": lambda p: p.replace(
        "Sign-in is deferred to the point",
        "Signup asked for everything up front and measured nothing that mattered. "
        "Sign-in is deferred to the point",
        1,
    ),
    # ---- the other ways this section can lie ----
    # Anchor on the VISIBLE span, not on the first occurrence of the phrase:
    # the headline's `aria-label` now carries the same sentence and appears
    # EARLIER in the document, so `replace(phrase, …, 1)` silently hit the
    # attribute and left the rendered text untouched (Phase 4/5 review — the
    # same anchor-drift class as the Meshio mutation).
    "invented-percentage": lambda p: p.replace(
        "<span>was crawling. Found and fixed.</span>",
        "<span>was crawling. Found and fixed. Conversion rose 38%.</span>",
        1,
    ),
    "found-and-fixed-dropped": lambda p: p.replace(
        "<span>was crawling. Found and fixed.</span>", "<span>was crawling.</span>", 1
    ),
    # The accessible name is the only form of the claim AT receives — it must
    # be checked as a rendered fact in its own right.
    "aria-label-drifted": lambda p: p.replace(
        'Google was crawling. Found and fixed."',
        'Google was crawling."',
        1,
    ),
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
    # ---- the four holes the Phase 4/5 review demonstrated LIVE against this
    # gate. Every one of these passed the first draft. They are the reason the
    # provenance check is now exact per-field membership over every owned
    # section with no length floor, rather than a substring test against one
    # flat concatenation of the two studies. ----
    "fabricated-client-sentence": lambda p: p.replace(
        "one queue item at a time, the same way every other request comes through.",
        "one queue item at a time. Backed by a $2.4M seed round, with 87% of "
        "pre-orders converting in the first week.",
        1,
    ),
    "fabricated-short-stack-pill": lambda p: p.replace(
        "<li>AWS</li>", "<li>AWS</li><li>Shopify</li>", 1
    ),
    "fabricated-short-state": lambda p: p.replace(
        '<span class="sm-state">New</span>',
        '<span class="sm-state">New</span><span class="sm-state">Paid</span>',
        1,
    ),
    "stat-figure-mutated": lambda p: p.replace(
        '<span class="stat-big">27</span>', '<span class="stat-big">404</span>', 1
    ),
    # A truncation that DROPS a load-bearing qualifier still leaves a substring
    # of the original, so a substring-based gate cannot see it.
    "specced-qualifier-truncated": lambda p: p.replace(
        "Stripe subscription tiers specced", "Stripe subscription tiers", 1
    ),
    # A fact copied from one study into the other's section.
    "fact-borrowed-across-studies": lambda p: p.replace(
        "<li>Next.js</li><li>Stripe</li>",
        "<li>Next.js</li><li>Stripe</li><li>NestJS</li>",
        1,
    ),
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
