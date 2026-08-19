# Proves scripts/w5-copy-gate.py and scripts/w5-css-gate.py can actually FAIL.
#
# The first two mutations are what v3 ACTUALLY shipped in this section: a
# paraphrased service row and a silently dropped one. The rest are the ways the
# rework can quietly break an invariant — a FAQ answer leaving the server HTML
# (killing JSON-LD parity), the strike freezing undrawn in a degradation, the
# hover moving by padding.
#
# Everything runs against COPIES in a temp dir; the working tree is never
# written to (the W3 lesson).
#
# Usage: python3 scripts/w5-gate-selftest.py <rendered-page.html>
import os
import re
import shutil
import subprocess
import sys
import tempfile

if len(sys.argv) < 2:
    sys.exit("usage: w5-gate-selftest.py <rendered-page.html>")
PAGE = sys.argv[1]
page_orig = open(PAGE, encoding="utf-8").read()

chunks = sorted(__import__("glob").glob(".next/static/chunks/*.css"))
if not chunks:
    sys.exit("no compiled CSS chunk — run `npm run build` first")
css_orig = open(chunks[0], encoding="utf-8").read()

PAGE_MUTATIONS = {
    # ---- the two v3 actually shipped ----
    "v3-paraphrased-service-row": lambda p: p.replace(
        "Data pipelines, scripts &amp; migrations",
        "Data pipelines, scripts and migrations",
        1,
    ),
    "v3-dropped-service-row": lambda p: re.sub(
        r'<li><span class="svc-name">Legacy system modernization</span></li>', "", p, count=1
    ),
    # ---- the ways the rework can break an invariant ----
    "extra-service-row-invented": lambda p: p.replace(
        '<li><span class="svc-name">Legacy system modernization</span></li>',
        '<li><span class="svc-name">Legacy system modernization</span></li>'
        '<li><span class="svc-name">Blockchain integrations</span></li>',
        1,
    ),
    "declined-row-loses-we-say-no": lambda p: p.replace(
        '<span class="svc-no">we say no</span>', "", 1
    ),
    "declined-row-loses-its-strike": lambda p: p.replace(
        '<span class="strike" aria-hidden="true"></span>', "", 1
    ),
    "faq-answer-leaves-the-dom": lambda p: re.sub(
        r"(</summary>)<p[^>]*>.*?</p>", r"\1", p, count=1, flags=re.S
    ),
    "faq-question-reworded": lambda p: p.replace(
        "<summary>Can I pause or cancel?</summary>",
        "<summary>Can I pause or cancel anytime?</summary>",
        1,
    ),
    "founder-quote-drifts-from-the-faq": lambda p: p.replace(
        "no account managers, no offshore hand-offs.</blockquote>",
        "no account managers.</blockquote>",
        1,
    ),
    "founder-block-grows-a-photo": lambda p: p.replace(
        "<blockquote", '<img src="/founder.jpg" alt="" /><blockquote', 1
    ),
    # React emits `<!-- -->` separators between adjacent interpolations, so the
    # rendered markup is `01<!-- --> — <!-- -->Subscribe`, not the literal
    # string. A source-shaped anchor silently no-ops — the same anchor-drift
    # class that has now bitten in W3, W4 and here; the NOOP guard caught it.
    "step-number-decoupled-from-config": lambda p: p.replace(
        "<h3>01<!-- --> — <!-- -->Subscribe</h3>", "<h3>1<!-- --> — <!-- -->Subscribe</h3>", 1
    ),
}

CSS_MUTATIONS = {
    "strike-frozen-in-reduced-motion": lambda c: re.sub(
        r"(@media\s*\(prefers-reduced-motion:\s*reduce\)\{(?:[^{}]|\{[^{}]*\})*?)"
        r"\.declined\s*\.svc-name\s*\.strike\{[^}]*\}",
        r"\1",
        c,
        count=1,
    ),
    "strike-becomes-a-width-animation": lambda c: c.replace(
        "transition:transform .7s var(--ease)", "transition:width .7s var(--ease)", 1
    ).replace("transition:transform.7svar(--ease)", "transition:width.7svar(--ease)", 1),
    "hover-moves-by-padding": lambda c: re.sub(
        r"(\.svc-list li:hover \.svc-name\{)transform:translate\(14px\)",
        r"\1padding-left:14px",
        c,
        count=1,
    ).replace(".svc-list li:hover .svc-name{transform:translate(14px)}",
              ".svc-list li:hover .svc-name{padding-left:14px}", 1),
}

work = tempfile.mkdtemp(prefix="w5-selftest-")
results = {}
try:
    page_copy = os.path.join(work, "page.html")
    css_copy = os.path.join(work, "chunk.css")

    def copy_gate():
        return subprocess.run(
            [sys.executable, "scripts/w5-copy-gate.py", page_copy], capture_output=True
        ).returncode

    def css_gate():
        return subprocess.run(
            [sys.executable, "scripts/w5-css-gate.py", css_copy], capture_output=True
        ).returncode

    for name, mutate in PAGE_MUTATIONS.items():
        mutated = mutate(page_orig)
        if mutated == page_orig:
            results[name] = "MUTATION-NOOP (self-test is broken)"
            continue
        open(page_copy, "w", encoding="utf-8").write(mutated)
        results[name] = "caught" if copy_gate() != 0 else "MISSED"

    for name, mutate in CSS_MUTATIONS.items():
        mutated = mutate(css_orig)
        if mutated == css_orig:
            results[name] = "MUTATION-NOOP (self-test is broken)"
            continue
        open(css_copy, "w", encoding="utf-8").write(mutated)
        results[name] = "caught" if css_gate() != 0 else "MISSED"

    open(page_copy, "w", encoding="utf-8").write(page_orig)
    open(css_copy, "w", encoding="utf-8").write(css_orig)
    clean_copy, clean_css = copy_gate(), css_gate()
finally:
    shutil.rmtree(work, ignore_errors=True)

for k, v in results.items():
    print(f"  {k:36s} {v}")
print(f"  {'unmutated (copy)':36s} {'passes' if clean_copy == 0 else 'FAILS'}")
print(f"  {'unmutated (css)':36s} {'passes' if clean_css == 0 else 'FAILS'}")

ok = all(v == "caught" for v in results.values()) and clean_copy == 0 and clean_css == 0
print("\nGATES ARMED" if ok else "\nGATES NOT TRUSTWORTHY")
sys.exit(0 if ok else 1)
