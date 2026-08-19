# W4 fact-provenance gate.
#
# This is the gate that matters most in this bundle, because this is the section
# where v3 shipped two fabrications about a REAL, NAMED client:
#   - "guest carts" where the record says buyer FAVORITES — an invented
#     e-commerce feature attributed to a real engagement;
#   - an invented sentence characterising Meshio's product before the work.
# Both slipped a fact gate that asserted only that the expected strings were
# PRESENT. Presence-checking is structurally blind to a substitution and to an
# addition, so it could not have caught either one.
#
# Therefore this gate is BIDIRECTIONAL and non-vacuous:
#   (a) every fact in offer.ts renders;
#   (b) every content string rendered inside these sections traces back to
#       offer.ts — anything else is a fabrication, whatever it says;
#   (c) the structured display fields RECONSTRUCT the canonical prose fact they
#       were carved out of, so the split cannot drift;
#   (d) no number appears that offer.ts does not contain.
#
# Usage: python3 scripts/w4-facts-gate.py [rendered-page.html]
import html
import json
import re
import subprocess
import sys

PAGE = sys.argv[1] if len(sys.argv) > 1 else "/tmp/codirity-page.html"
page = open(PAGE, encoding="utf-8").read()

# Read the FACTS from offer.ts by executing it, not by regexing it — a regex
# over the source would drift from what actually ships.
facts = json.loads(
    subprocess.run(
        ["npx", "tsx", "-e",
         "import {caseStudies, clients} from './src/config/offer';"
         "process.stdout.write(JSON.stringify({caseStudies, clients}))"],
        capture_output=True, text=True, check=True,
    ).stdout
)
studies, clients = facts["caseStudies"], facts["clients"]

strip = lambda t: html.unescape(re.sub(r"<[^>]+>", " ", t))
squash = lambda t: re.sub(r"\s+", " ", strip(t)).strip()

# Drop the RSC flight payload: it repeats every string as JSON and would make
# the "nothing extra" half impossible to evaluate.
dom = re.sub(r"<script[^>]*>.*?</script>", "", page, flags=re.S)

fails = []

# ---------- (c) the structured split reconstructs the canonical fact ----------
for s in studies:
    parts = []
    if s.get("stat"):
        parts += [s["stat"]["value"], s["stat"]["of"]]
    parts += s["headlineLines"]
    rebuilt = " ".join(parts)
    if rebuilt != s["headline"]:
        fails.append(
            f"{s['name']}: the display split does NOT reconstruct the headline fact\n"
            f"    headline: {s['headline']!r}\n"
            f"    rebuilt:  {rebuilt!r}"
        )
    # The state machine may not claim a state the written record does not.
    sm = s.get("stateMachine")
    if sm:
        bullet = next((b for b in s["whatShipped"] if "state machine" in b.lower()), None)
        if not bullet:
            fails.append(f"{s['name']}: a state machine renders but no whatShipped bullet names one")
        else:
            for st in sm["states"] + [sm["goal"]]:
                if st.lower() not in bullet.lower():
                    fails.append(
                        f"{s['name']}: state {st!r} is not in the whatShipped bullet that names "
                        f"the machine ({bullet!r})"
                    )

# ---------- (a) every fact renders ----------
def section_of(anchor):
    """The rendered markup around a study/client, bounded by <section>."""
    i = dom.find(anchor)
    if i == -1:
        return ""
    start = dom.rfind("<section", 0, i)
    end = dom.find("</section>", i)
    return dom[start:end] if start != -1 and end != -1 else ""


for s in studies:
    blob = squash(section_of(s["headlineLines"][0]))
    if not blob:
        fails.append(f"{s['name']}: section did not render")
        continue
    expected = (
        [s["context"], s["background"]]
        + s["headlineLines"]
        + s["whatShipped"]
        + s["stack"]
        + ([s["stat"]["value"], s["stat"]["of"]] if s.get("stat") else [])
    )
    for want in expected:
        if squash(want) not in blob:
            fails.append(f"{s['name']}: MISSING {want[:70]!r}")

# "Found and fixed." is called out in the brief as load-bearing: without it the
# section's largest claim reads as a live unresolved defect on a named client's
# production catalog rather than as delivered work.
if "Found and fixed." not in squash(dom):
    fails.append("'Found and fixed.' does not render — the 404 claim reads as unresolved")

def client_block(name):
    """The rendered `.client` div for one entry."""
    for m in re.finditer(r'<div class="client[^"]*"[^>]*>(.*?)</div>', dom, re.S):
        if squash(m.group(1)).startswith(name):
            return m.group(1)
    return ""


for c in clients:
    block = client_block(c["name"])
    if not block:
        fails.append(f"client {c['name']}: block did not render")
        continue
    if squash(c["story"]) not in squash(block):
        fails.append(f"client {c['name']}: story MISSING")
    # Scoped to THIS client's block, and matched as the TAG ELEMENT — not as the
    # word anywhere on the page. Vivi's own story contains the phrase
    # "we're building pre-launch", so a substring search over the document was
    # satisfied by the prose and could never fail (caught by the self-test).
    tags = {squash(t).lower() for t in re.findall(r'<span class="tag">(.*?)</span>', block, re.S)}
    if "client" not in tags:
        fails.append(f"client {c['name']}: no `client` tag renders (tags: {sorted(tags)})")
    if c.get("preLaunch") and "pre-launch" not in tags:
        fails.append(f"client {c['name']}: preLaunch is true but no pre-launch TAG renders")
    if not c.get("preLaunch") and "pre-launch" in tags:
        fails.append(f"client {c['name']}: a pre-launch tag renders but preLaunch is not set")

# ---------- (b) nothing rendered that offer.ts does not carry ----------
# Sentence-level provenance over the case-study + clients sections.
KNOWN = " ".join(
    squash(x)
    for s in studies
    for x in [s["name"], s["relationship"], s["context"], s["background"], s["headline"]]
    + s["headlineLines"] + s["whatShipped"] + s["stack"]
    + ([s["stat"]["value"], s["stat"]["of"]] if s.get("stat") else [])
    + ((s["stateMachine"]["states"] + [s["stateMachine"]["goal"], s["stateMachine"]["goalNote"]])
       if s.get("stateMachine") else [])
) + " " + " ".join(squash(c["name"]) + " " + squash(c["story"]) for c in clients)
# Chrome the treatment legitimately adds (tags, the section title, the arrow).
CHROME = {"client", "pre-launch", "already on the board", "→", "—", ""}

# The provenance unit is a TEXT RUN — the contiguous text between two tags —
# not a sentence carved out of a flattened blob. Flattening concatenates
# ADJACENT elements (the label and the headline, a stack pill and the bullet
# after it) into strings no element ever contained, which reports legitimate
# copy as fabricated. Each text node the browser actually paints must trace
# back to offer.ts on its own.
for s in studies:
    blob = section_of(s["headlineLines"][0])
    for run in re.split(r"<[^>]+>", blob):
        t = squash(run)
        if not t or t.lower() in CHROME or len(t) < 12:
            continue
        if t not in KNOWN:
            fails.append(f"{s['name']}: EXTRA text not traceable to offer.ts:\n    {t[:150]!r}")

# ---------- (d) no invented numbers ----------
allowed_nums = set(re.findall(r"\d[\d,.]*", KNOWN))
for s in studies:
    for run in re.split(r"<[^>]+>", section_of(s["headlineLines"][0])):
        for n in re.findall(r"\d[\d,.]*", squash(run)):
            if n.rstrip(".,") not in {a.rstrip(".,") for a in allowed_nums}:
                fails.append(f"{s['name']}: number {n!r} appears but is not in offer.ts")
# Meshio in particular must carry NO display-tier figure.
meshio = next((s for s in studies if s["name"] == "Meshio"), None)
if meshio and meshio.get("stat"):
    fails.append("Meshio has a `stat` — §7 records no honest number for it; the state machine is the story")
if meshio and re.search(r'class="stat-big"', section_of(meshio["headlineLines"][0])):
    fails.append("Meshio renders a stat-big figure")

print(f"studies={[s['name'] for s in studies]} clients={[c['name'] for c in clients]}")
if fails:
    print("\nFAIL:")
    for f in fails:
        print(" -", f)
    sys.exit(1)
print("\nPASS — every fact renders, nothing extra does, and the splits reconstruct.")
