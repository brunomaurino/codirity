# Proves scripts/w2-copy-gate.py can actually FAIL.
#
# A gate nobody has seen fail is not evidence. Both W2 gates that misled this
# build were false negatives that "passed": the 900px overflow check (hidden by
# body{overflow-x:hidden}) and v3's fact-provenance check (blind to
# substitutions). So each mutation below is a real historical failure mode.
import os
import re
import subprocess
import sys

#   python3 scripts/w2-copy-gate-selftest.py /tmp/page.html
# The file is read as the clean baseline, mutated into a sibling temp file, and
# left untouched on disk.
ORIG = sys.argv[1] if len(sys.argv) > 1 else "/tmp/codirity-page.html"
LIVE = ORIG + ".mutated"
base = open(ORIG, encoding="utf-8").read()

MUTATIONS = {
    # v3's actual failure: a fabricated feature spliced into real copy.
    "substitution": lambda s: s.replace(
        'term-note">Two active tasks, running in parallel.',
        'term-note">Two active tasks, running in parallel with guest carts.',
        1,
    ),
    # a price drifting away from offer.ts
    "figure-drift": lambda s: s.replace(
        'term-v term-n"><span class="cur">$</span>6,995',
        'term-v term-n"><span class="cur">$</span>6,950',
        1,
    ),
    # the eyebrow promising more numbers than the band renders
    "eyebrow-count": lambda s: s.replace(
        "The whole offer, in four numbers", "The whole offer, in five numbers", 1
    ),
    # a whole row silently dropping out
    "row-dropped": lambda s: re.sub(
        r'<div class="term" style="--i:3"[^>]*>.*?</div>', "", s, count=1, flags=re.S
    ),
}

results = {}
for name, mutate in MUTATIONS.items():
    mutated = mutate(base)
    if mutated == base:
        results[name] = "MUTATION-NOOP (self-test itself is broken)"
        open(LIVE, "w", encoding="utf-8").write(base)
        continue
    open(LIVE, "w", encoding="utf-8").write(mutated)
    rc = subprocess.run(
        [sys.executable, "scripts/w2-copy-gate.py", LIVE], capture_output=True
    ).returncode
    results[name] = "caught" if rc != 0 else "MISSED"

open(LIVE, "w", encoding="utf-8").write(base)
clean = subprocess.run(
    [sys.executable, "scripts/w2-copy-gate.py", LIVE], capture_output=True
)
os.remove(LIVE)

for k, v in results.items():
    print(f"  {k:16s} {v}")
print(f"  {'unmutated':16s} {'passes' if clean.returncode == 0 else 'FAILS'}")

ok = all(v == "caught" for v in results.values()) and clean.returncode == 0
print("\nGATE ARMED" if ok else "\nGATE NOT TRUSTWORTHY")
sys.exit(0 if ok else 1)
