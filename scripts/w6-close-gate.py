# W6 close gate — the invariant W6's first draft CLAIMED in a comment and did
# not actually have.
#
# `sections.contact.titleLines` joined with single spaces must equal
# `sections.contact.title` exactly. Same shape as W4's stat/headline
# reconstruction invariant, and for the same reason: a hand-set display split
# drifts silently from the string it was split out of. It had ALREADY drifted
# (a trailing period the config lacked) behind a comment asserting a gate that
# was never written — which is worse than no claim at all.
#
# Also pins the close's analytics surface: a restyle must never renumber the
# funnel.
#
# Usage: python3 scripts/w6-close-gate.py [rendered-page.html]
import html
import json
import re
import subprocess
import sys

PAGE = sys.argv[1] if len(sys.argv) > 1 else "/tmp/codirity-page.html"
page = open(PAGE, encoding="utf-8").read()
facts = json.loads(
    subprocess.run(
        ["npx", "tsx", "-e",
         "import {sections, faq, OWNERSHIP_FAQ_INDEX, CONTACT_EMAIL, RESPONSE_TIME_CLAIM, included} "
         "from './src/config/offer';"
         "process.stdout.write(JSON.stringify({sections, faq, OWNERSHIP_FAQ_INDEX, CONTACT_EMAIL,"
         "RESPONSE_TIME_CLAIM, included}))"],
        capture_output=True, text=True, check=True,
    ).stdout
)
squash = lambda t: re.sub(r"\s+", " ", html.unescape(re.sub(r"<[^>]+>", " ", t))).strip()
dom = re.sub(r"<script[^>]*>.*?</script>", "", page, flags=re.S)
fails = []

# ---------- the reconstruction invariant ----------
c = facts["sections"]["contact"]
rebuilt = " ".join(c["titleLines"])
if rebuilt != c["title"]:
    fails.append(
        f"the close headline's lines do NOT rejoin to sections.contact.title\n"
        f"    title:   {c['title']!r}\n"
        f"    rebuilt: {rebuilt!r}"
    )
for line in c["titleLines"]:
    if squash(line) not in squash(dom):
        fails.append(f"headline line missing from the rendered page: {line!r}")

# ---------- the ownership quote is the FAQ answer, verbatim ----------
own = facts["faq"][facts["OWNERSHIP_FAQ_INDEX"]]
quotes = [squash(m) for m in re.findall(r"<blockquote[^>]*>(.*?)</blockquote>", dom, re.S)]
if squash(own["answer"]) not in quotes:
    fails.append(
        f"the ownership quote is not verbatim faq[{facts['OWNERSHIP_FAQ_INDEX']}].answer\n"
        f"    expected: {own['answer'][:80]!r}\n"
        f"    rendered: {[q[:60] for q in quotes]}"
    )

# ---------- analytics: a restyle must not renumber the funnel ----------
for event, ctx in [
    ("email_click", "contact_section"),
    ("email_click", "footer"),
    ("call_booked", "contact_close"),
    ("contact_form_submitted", None),
    ("contact_form_success", None),
    ("contact_form_error", None),
]:
    src_files = subprocess.run(
        ["grep", "-rl", event, "src/"], capture_output=True, text=True
    ).stdout.split()
    if not src_files:
        fails.append(f"analytics event `{event}` no longer fires anywhere")
        continue
    if ctx:
        found = subprocess.run(
            ["grep", "-rn", ctx, "src/"], capture_output=True, text=True
        ).stdout
        if not found:
            fails.append(f"`{event}`'s `{ctx}` label is gone — the funnel loses its split")

# ---------- the close's own content ----------
for needed, label in [
    (facts["CONTACT_EMAIL"], "the contact address"),
    (facts["RESPONSE_TIME_CLAIM"], "the response-time commitment"),
    (squash(c["description"]), "the close's lede"),
]:
    if squash(needed) not in squash(dom):
        fails.append(f"{label} does not render: {needed[:60]!r}")

# ---------- the footer invents nothing ----------
# W6 deleted four fabricated service categories from the footer; the form on the
# same screen kept them until review. Every service option must now trace to
# `included[]`.
opts = re.findall(r"<option[^>]*>(.*?)</option>", dom, re.S)
allowed = {squash(x) for x in facts["included"]} | {"Other / Not Sure", "Select a service", ""}
for o in opts:
    if squash(o) not in allowed:
        fails.append(f"the contact form offers a service not in offer.ts: {squash(o)!r}")

print(f"headline={c['titleLines']} · options={len(opts)}")
if fails:
    print("\nFAIL:")
    for f in fails:
        print(" -", f)
    sys.exit(1)
print("\nPASS — the headline rejoins, the quote is verbatim, the funnel is intact.")
