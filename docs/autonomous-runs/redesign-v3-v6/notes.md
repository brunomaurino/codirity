# autonomous-task run notes — redesign-v3 Bundle V6 (FAQ + final CTA close)

**Started:** 2026-08-18T19:09:53Z

## Execution context

- Probe: Workflow ✅ + Agent ✅ (both present and callable) — main conversation, full review rigor.
- Capability probes (`wf_69274f40-58c`): `args` round-trip **PASS** (`argsType: "object"`, sentinel
  intact) → battery invoked via `scriptPath` + real JSON `args`, never a /tmp fork.
  `effort` opt **accepted** → `effortTiers: true`. Custom `agentType` resolves **scoped only**
  (`autonomous-task:at-reviewer` ✅, bare `at-reviewer` ✗) → `customAgents: true` using the scoped
  names. `EnterWorktree`/`ExitWorktree` both resolve → **`worktreeNative: true`**.
- Origin-bundle prefix: `B207`. This bundle's identifier: **`redesign-v3 Bundle 207`**
  (`--bundle-id 207 --plan-slug redesign-v3`).
- Run slug: `redesign-v3-v6` (not `--accumulate`; branch slug is the run slug).
- gh account: `brunomaurino` (active, re-verified before worktree creation — this repo's `gh` auth
  silently reverts to `brunoiwp`, see the loop notes; re-check before every push/PR).
- Orchestrated by `/autonomous-bundle-loop` (session `0556b7db`, resumed after session 1 was killed
  by the usage limit mid-V5). The loop armed the resume-watchdog cron, so Step 0.6 is skipped here
  per the no-double-arm rule.

## Task description (echoed)

Redesign v3 Bundle V6 — FAQ + final CTA close. Deepen `Faq.tsx` from its current 6 questions toward
the ~12 that v1's `HANDOFF-redesign.md` §6.R6 names (register-agnostic reference for WHICH questions,
not how to answer them — every answer in the warmer Monthly Club voice per `HANDOFF-redesign-v3.md`
§4). Update the FAQPage JSON-LD to match. Rework `Contact.tsx`'s final CTA into the black-band close
(near-black, per HANDOFF §1 rule 4 — the ONE deliberate palette contrast beat in the whole site),
keeping the existing contact form + Cal booking button, real copy only.
Gates: standard (lint + tsc + build + SSR + banned-word grep) + perf delta + SSR check on the new
FAQ copy.

## Task interpretation (Phase 1.5 prompt-pinning)

**Concrete deliverable.** One PR that:

1. Grows `faq` in `src/config/offer.ts` from 6 → ~12 entries. The 5 genuinely-new objections from
   §6.R6 (the other two on that list are already answered by existing entries — see "Decisions"):
   *Why not just hire? · Who actually writes the code, you or the AI? · Why limited spots? · Who owns
   the code and the accounts? · What if it breaks a month later?* — plus one more grounded in a real,
   already-live site fact to land on 12. Every answer written in the §4 voice, every fact traceable
   to `offer.ts`/existing site copy — no invented figure, no invented policy.
2. Restyles `Faq.tsx` to the Monthly Club system (V0 tokens; `.accent` one-word headline treatment)
   without breaking the always-in-DOM answer rule the component documents (crawlable content must keep
   matching the FAQPage JSON-LD exactly).
3. Reworks `Contact.tsx` (+ `ContactInfo.tsx`) into the near-black band close, keeping `ContactForm`
   and the Cal booking button working and instrumented, and replacing the PRE-redesign slop copy
   still living in `ContactInfo.tsx` ("Let's Build Something Great Together", "transform your
   business with AI-powered solutions", "Prefer a Live Conversation?") with real §4-voice copy.

**Acceptance test (concrete + observable).**

- `faq.length >= 11` and every question/answer string appears in the script-stripped SSR HTML of `/`.
- The FAQPage JSON-LD's `mainEntity` array has exactly one entry per `faq` item, questions and answers
  byte-identical to the rendered copy (they share the same array — assert the count matches).
- Zero banned words (§4 grep) across the new copy; zero occurrences of "75%".
- The final CTA section's computed background is the near-black token in BOTH themes, and every
  foreground element inside it clears WCAG AA against it (measured, not assumed).
- `npm run lint`, `npx tsc --noEmit`, `npm run build` all green; perf delta vs `main` reported.

## Plan

**Phase 2 Step 0 — cross-run commitments check.** Globbed all 24 sibling
`docs/autonomous-runs/*/commitments.md`. Sections targeting `redesign-v3 Bundle V6` exist in
`redesign-v3-v2` and `redesign-v3-v3` and both read **(none)** — every finding in V0–V5 was applied
inline, so this bundle inherits **0 commitments**. Three `STATUS: OPEN` lines exist elsewhere and
none belong to this bundle: `B4-D-opsidempotency1` targets the *client-onboarding* plan (different
plan token — not auto-included per the plan-qualified match rule), and the two `B1-D-jsonld1` hits
are the immutable historical OPEN line in `feat-codirity-ba-seo` plus a restatement in
`feat-codirity-bd-pricing` — that commitment was properly closed by a
`[STATUS: COMPLETED-IN-B5]` amendment in `feat-codirity-be-faq-footer`, so it is not a zombie and
needs no action. Total open commitments across all plans: 1 (the onboarding one), unchanged.

**Copy source discovered — this is the load-bearing find of Phase 2.** `docs/redesign-storytelling.md`
§"FAQ" already carries a **Bruno-approved 12-question FAQ draft with answers** written for exactly
this bundle. v1's §6.R6 (which the brief points at) only lists WHICH questions; the storytelling doc
has approved draft ANSWERS. So the new copy is adapted from an approved source, not invented — with
three corrections the draft itself needs (see Decisions).

**What I'm building.**

1. `src/config/offer.ts` — `faq` 6 → 12. Six new entries adapted from the storytelling draft into
   the warmer Monthly Club voice; one existing entry (pause/cancel) deepened with the non-financial
   reassurance from that draft. `sections.contact` added (the Contact copy is currently hardcoded in
   the component, against this project's "offer.ts is the source of truth for all copy" convention).
2. `src/components/sections/Faq.tsx` — Monthly Club restyle: `.accent` one-word headline via the
   shared `AccentWord`, card radius/shape per V0, keeping the always-in-DOM collapsed-answer
   mechanism intact (it is what keeps the crawlable copy byte-identical to the FAQPage JSON-LD).
3. `src/components/layout/Section.tsx` — new `variant="ink"` (near-black band). A shared-component
   addition rather than a one-off `className` so the footer's existing near-black and this band are
   one named token pair, and any later bundle needing the beat reuses it.
4. `src/components/sections/Contact.tsx` + `ContactInfo.tsx` — the black-band close. The
   pre-redesign slop copy still live in `ContactInfo.tsx` gets replaced with §4-voice copy from
   `offer.ts`.
5. `ContactForm.tsx` — **not restyled for dark**: it stays a light card floating on the band (see
   Decisions). Its heading copy is voice-passed in place (form microcopy stays in the component,
   matching how its labels and placeholders already live there); the only string it takes from
   `offer.ts` is the shared response-time claim.

*(Corrected post-review: an earlier draft of this Plan said the heading copy "moves to `offer.ts`",
which contradicted what actually shipped two sections down. Flagged by the battery as a durable
false record for the next bundle to read — the notes are only worth committing if they're true.)*

**FAQPage JSON-LD needs no edit** — `FaqPageJsonLd` maps over the same `offer.faq` array, so it
tracks the new questions automatically. The brief's "update the JSON-LD to match" is satisfied
structurally; the acceptance test asserts entry-count parity rather than assuming it.

**Verification.** `npm run lint`, `npx tsc --noEmit`, `npm run build`, script-stripped SSR check of
all 12 Q+A strings and the new CTA copy, banned-word grep (§4 list) over the diff, `75%` grep,
measured WCAG AA contrast for every foreground element on the band in BOTH themes, perf delta vs
`main` (gzip of `.next/static/chunks`, same method as V5).

**Open questions resolved during planning** — see "Decisions made unilaterally".

## Decisions made unilaterally

- **The FAQ copy comes from `docs/redesign-storytelling.md`'s approved 12-question draft, not from
  scratch** — v1's §6.R6 (which the brief cites) lists only WHICH questions; the storytelling doc
  carries Bruno-approved draft ANSWERS written for this site. Adapted to the warmer Monthly Club
  voice rather than copied verbatim (that draft was written for v1's dry ledger register), with
  **three corrections the draft itself needed**:
  1. Its "Why not just hire?" answer ends *"The receipt above is the whole argument"* — the receipt
     is v1's **Ledger section, which does not exist in v3** (V2 shipped blob benefit tiles instead).
     Copying it would point at nothing. Rewritten to carry the argument itself.
  2. Its "Why limited spots?" answer says *"When we're full, the site says so and you wait."*
     **D5 RESOLVED: no capacity badge ships.** That sentence promises a surface this plan
     deliberately does not build. Dropped; the answer keeps the real mechanism (one engineer, one
     queue) and the real `foundingRate` facts (5 seats, price locked for life).
  3. Its guarantee line was already corrected to 50% by V5's battery — the new "What if I don't like
     the result?" entry (pre-existing) already says 50%, and the SSR gate greps for zero `75%`.
- **Two of §6.R6's seven questions were NOT added as new entries, because existing entries already
  answer them** — *"What does one request mean in practice?"* is the existing "What counts as one
  task?", and *"What happens when I pause?"* is the existing "Can I pause or cancel?". Adding
  near-duplicates to hit a number would make the FAQ worse. Instead the pause entry was DEEPENED
  with the draft's non-financial reassurance ("your board, your code, and your history stay put").
  Net: 6 existing + 6 new = **12**, the brief's target.
- **Deliberately did NOT publish the pause/cancel BILLING mechanics.** The onboarding Trello template
  (`docs/HANDOFF-client-onboarding.md` Appendix B) states "Billing cycles are 31 days. Pause anytime:
  unused days are banked" — real, approved, and more generous than the storytelling draft's "billing
  stops at the end of the cycle". Publishing either on the marketing site makes a **new public
  financial commitment to prospects**, which is Bruno's call, not a build decision — and V5's battery
  just demonstrated what a half-propagated commitment figure costs. Recorded as an open item instead.
- **`Section` gains a `variant="ink"` rather than a one-off `className` on Contact.** The band and the
  footer must be the SAME black or the "one deliberate contrast beat" reads as two mismatched dark
  blocks; a named variant pinned to the footer's existing `gray-900` token pair makes that structural.
  Its docstring states the one-per-site rule so a later bundle doesn't add a second band.
- **`SectionHeader` gains `tone="ink"` — this one is a latent-bug fix, not styling.** Its `h2` is
  hardcoded `text-gray-900 dark:text-white`; on the ink band in LIGHT mode `text-gray-900` resolves to
  `#0a0a08`, which is the band's own background — **invisible near-black on near-black**, the same
  class of failure V0's battery caught on `--white`. Any future `variant="ink"` consumer would have
  hit it. `tone="ink"` pins title/description/label to values tuned for a permanently-dark surface in
  BOTH themes.
- **`ContactForm` stays a LIGHT card on the black band** rather than being restyled dark. Every
  `Input`/`Select`/`Button` inside it is already contrast-tuned for a light surface; inverting the
  form would mean re-tuning ~8 shared primitives for a single consumer — the exact dual-role-token
  trap V0 documented. A light card floating on the band is also the Designjoy treatment the HANDOFF
  points at. Only its heading copy changed (voice pass), plus `text-gray-500 → text-gray-600`, which
  was the identical 4.47:1 sub-AA value V5's battery flagged one section earlier.
- **`Contact` drops `padding="hero"` (min-h-screen).** A full extra viewport of black separated the
  CTA from the footer into a void instead of one continuous closing band.
- **Pre-redesign copy in `ContactInfo.tsx` was rewritten, not preserved** — "Let's Build Something
  Great Together", "Ready to transform your business with AI-powered solutions?", "Prefer a Live
  Conversation?". This copy predates the §4 voice gate (v1's R0 pass never reached Contact; per
  HANDOFF-redesign-v2 the tree still carries pre-redesign components for sections no bundle has
  reworked). "Real copy only" in the brief cannot mean keeping copy the voice gate bans. The new
  copy lives in `offer.ts` as `sections.contact` per the project's source-of-truth convention, and
  `ContactInfo` now imports `CAL_LINK`/`CONTACT_EMAIL` from `offer.ts` instead of re-hardcoding the
  Cal link, which it had been duplicating.
- **Anti-slop list conflict resolved in favour of v3.** v1 §5's checklist bans "glassmorphism" and
  requires "mono + hairline + square artifacts"; v3 §1 rule 5 restates the list WITHOUT those
  visual-system-specific items (it keeps: no invented stats, no fake testimonials, no logo
  marquees/carousels, no stock illustrations or AI faces, no fake urgency, banned-word grep). v3 is
  the operative list — v1's visual clauses describe a system v3 replaced (V5 shipped a glassmorphic
  card on purpose). Only the REGISTER carries forward, which is what §4 governs and what was gated.
- **The FAQ's own "Prefer to talk first? / Book a call" block was KEPT**, even though the new band
  directly beneath it also offers a Cal button. Removing a live, instrumented conversion element is a
  conversion decision, not a build decision. Flagged as an open item instead.
- **`node_modules` is a real hardlink copy, not the symlink the skill's Phase 1 prescribes.**
  Turbopack rejects a symlinked `node_modules` outright (`Symlink node_modules is invalid, it points
  out of the filesystem root` — a hard build panic, not a warning). `cp -Rl` from the parent checkout
  gives a real directory sharing the same inodes: same cost, same lockfile, and the build works.
  Worth knowing for every future bundle in this repo.

## Stop attempts

(none)

## Drift flags

(none)

## Round-skip requests

(none)

## Review findings + resolutions

Battery `wf_6352c39e-5cc` (13 agents, 2 adversarial + 2 QA rounds, mixed opus/sonnet finders,
3 verify voters): **24 raw → 12 after semantic dedup (7 clusters merged) → 11 confirmed, 1 refuted,
73 areas examined.** 0 proposed deferrals, 0 forced-apply, 0 escalations, 0 `unverifiedDeferred`.
**All 11 applied inline.**

The first attempt at this battery died mid-run when one finder hit a Cloudflare 521 (`adversarial-r2`
— origin down, explicitly `retryable`). Transient failures are retryable, never terminal, and round
counts are floors, so it was RESUMED via `resumeFromRunId` rather than accepted as-is. That was not
bookkeeping: the resumed round took the set from 8 findings to 11, and two of the three additions are
MAJOR (the founding-rate gating and the `.accent` contrast, the latter independently re-found by the
resumed finder). Accepting the partial run would have shipped both.

| # | Sev | Where | Resolution |
|---|---|---|---|
| 1 | MAJOR 3/3 | `ContactInfo.tsx:35` + `AccentWord.tsx` | **Fixed — and it is the one my own audit missed.** `.accent` declares its own `color: var(--green-dark)`, which beats the colour the span merely INHERITS from the white `h2`; on the ink band that is #0f6b3d on #0a0a08 = **~3.01:1** in light mode, scraping past AA-large by 0.01 and failing normal-text AA. My Phase-6 contrast table measured the `h2`'s colour and never isolated the span inside it — I measured *around* the broken element. `AccentWord` gained a `className` prop (it had no way to apply the override `globals.css` already documented); the call site passes `text-white`. Now **19.81:1 light / 17.97:1 dark**, re-measured. |
| 2 | MAJOR 3/3 | `offer.ts` — "Do I have to get on a call first?" | **Fixed.** Answer ended "plenty of people skip it" — behavioural social proof with no source, on a product with zero recorded checkouts (`foundingRate` still active and unfilled, `caseStudies` empty). Straight violation of the site's own "if a stat can't be defended, it doesn't ship". Clause removed. |
| 3 | MAJOR 3/3 | `offer.ts` — founding-seats answer | **Fixed, and the premise was wrong, not just the wording.** My answer justified scarcity with "one engineer works one queue, one task at a time" — which contradicts the Pro tier's two-active-tasks promise AND the "What counts as one task?" answer two entries above it, both rendered in the same accordion. Worse, it asserted a capacity cap that does not exist: `foundingRate` is a launch PRICE promo, not a limit on how many clients we take, so the sentence manufactured urgency out of nothing. Rewritten to say exactly what is true — a launch price, not a waiting list, with the work identical either way. |
| 4 | MAJOR 3/3 | `ContactForm.tsx:231` | **Fixed.** The privacy note kept `text-gray-500` at 4.474:1 — the identical sub-AA value this same diff had already fixed 90 lines earlier in the same file. One of two instances; I fixed the one I had touched and never grepped the file for the other. |
| 5 | MAJOR 3/3 | `offer.ts` founding-seats entry | **Fixed structurally.** The entry hardcoded "five founding seats" and "price for life" as a plain always-rendered array item, while every other founding-rate surface is gated on `foundingRate.active`. Flipping that documented one-line kill-switch when the seats fill would have left the FAQ — and the FAQPage JSON-LD served to Google — advertising an expired offer. The entry is now conditionally spread on `foundingRate.active` and interpolates `slots` and `price`, so it cannot drift and disappears on its own. |
| 6 | MINOR | `offer.ts:449` | **Fixed.** "that's why the \"no\" list exists" named a section that exists in v1's layout, not v3 (the real heading is "Not included"). Reworded to reference what actually renders. |
| 7 | MINOR | `ContactInfo.tsx` + `ContactForm.tsx` | **Fixed.** The response-time promise appeared twice in one viewport with two different figures ("within 24 hours" vs "answer within a day") and neither lived in `offer.ts` — under a comment of mine claiming copy now follows the source-of-truth convention. Both now render the new `RESPONSE_TIME_CLAIM` export. |
| 8 | MINOR | `ContactInfo.tsx:80` | **Fixed.** "Book a call **instead**" had no antecedent on mobile, where this column stacks ABOVE the form it is an alternative to. Now "Book a call" under a "Rather talk it through?" lead-in, which reads correctly in either stacking order. The same finding noted both Cal CTAs fired an identical unparameterized `call_booked` — `CalPopupButton` gained an optional `analyticsLocation`, and the FAQ's and the close's buttons are now distinguishable in the funnel. |
| 9 | MINOR | `globals.css:27-30` | **Fixed.** The comment justifying `--green-light` cited the gradient icon tiles this very bundle deleted, while the token silently acquired a new and much tighter constraint: it is the accent/link colour on the ink band at **4.76:1 — 0.26 over the AA floor**. Comment rewritten to record the real binding constraint and warn against darkening it. |
| 10 | MINOR | this file | **Fixed.** The committed Plan section said ContactForm's heading copy "moves to `offer.ts`", contradicting the Decisions section of the same file — a durable false record for the next bundle to read. Corrected in place, with the correction marked. |
| 11 | MINOR | `ContactForm.tsx:116-119` | **Fixed.** A comment asserted the card's foreground pairs were unchanged, four lines above a hunk that changed one. Rewritten to state which two pairs changed and why. |

**Also applied though the resumed run did not re-raise it** (it appeared in the first pass and the
resumed run's `areasExamined` addressed only the narrower Section-variant question): `design-system.md`
had no guidance for a permanently-dark surface, and presented `text-gray-900 dark:text-white` as THE
text pattern unqualified — on the ink band that pattern is the invisible one. Added a
"Permanently-dark surfaces" subsection with the measured foreground table and the `.accent` caveat.
`CLAUDE.md` names that file as the authority for all styling decisions, so leaving it silent about the
site's newest surface primitive was worth closing regardless of adjudication.

**Refuted (1/12), correctly:** the claim that adding `Section variant="ink"` stranded documentation —
`design-system.md` carries no Section-variant table and `CLAUDE.md`'s summary lists shape/colour
utilities, not the variant union, so there was nothing to strand. (The doc gap I did fix is a
different one: the text-pattern guidance, not a variant table.)

### Post-fix re-verification

`tsc` ✅ `eslint` ✅ clean `npm run build` ✅. SSR gate re-run and extended to assert each applied
finding is gone from the RENDERED output (not just from source) — `PASS — 12 FAQ entries,
JSON-LD↔render parity, all 11 findings verified applied, 0 banned words`; it also asserts the
founding answer carries `foundingRate.price`/`slots` rather than prose, and that the accent span
ships with its explicit `text-white`. Contrast re-measured live in BOTH themes with the accent span
explicitly probed this time: **zero failures**, accent span 19.81 / 17.97, everything else at or
above its threshold.

**Final perf delta vs `main` @ `45089e7`** (gzip -9, clean production build): JS **+1,518 B**
(206,991 vs 205,473), CSS **+216 B** (11,959 vs 11,743). No new dependencies.

## Pre-battery verification (Phase 6 evidence)

All measured, none assumed.

- `npx tsc --noEmit` ✅ · `npx eslint <7 changed files>` ✅ · `npm run build` ✅ (clean `.next`).
- **SSR + JSON-LD parity + banned-word gate** — throwaway `scripts/ssr-check-v6.mjs` (NOT committed)
  over the prerendered `.next/server/app/index.html`, scripts AND tags stripped (the `.accent`
  treatment wraps one headline word in a `<span>`, so the sentence is only contiguous once markup is
  gone — and stripping tags also keeps the banned-word grep off class names, where a hit would be a
  false positive). Result: **`PASS — 12 FAQ entries, JSON-LD↔render parity ok, contact copy
  rendered, slop gone, 0 banned words`**. The parity assertion runs JSON-LD → rendered body, which is
  the direction that can actually break: `FaqPageJsonLd` maps the same `offer.faq` array the
  accordion renders, so the JSON-LD is a faithful projection of source by construction, whereas a
  component could still truncate or escape an answer. It also asserts the four removed pre-redesign
  strings are gone and that `75%` appears nowhere.
- **WCAG AA on the ink band, MEASURED live in BOTH themes** (dev server, `getComputedStyle` +
  computed contrast, with `transition:none !important` injected first — see the false reading below).
  Zero failures either theme; threshold applied per element (3:1 for ≥24px, else 4.5:1):

  | element | light (`#0a0a08`) | dark (`#171713`) |
  |---|---|---|
  | h2 (white) | 19.81 | 17.97 |
  | eyebrow label 13px | 4.76 | 11.54 |
  | description 18px | 11.61 | 10.53 |
  | email link 18px | 4.76 | 11.54 |
  | fact item 14px | 11.61 | 10.53 |
  | Cal pill text on its own white | 19.81 | 17.97 |
  | form-card sub-copy on card | 6.74 | 5.60 |

  Every element's `opacity` was also read and is `1` — no `opacity-NN` on text, per V2's finding.
  The band and the footer measure the **same** background in both themes (`#0a0a08` / `#171713`), so
  they render as one continuous closing band rather than two mismatched dark blocks.
- **A false contrast finding was caught and discarded during this pass** — worth recording, because
  it is exactly the failure mode V5's "examined and rejected" entry got wrong in the other direction.
  The first dark-mode reading showed the email link at `#3f8a68` → **4.32:1, under AA**. It survived
  a 900 ms settle and looked real. It was not: the link carries `transition-colors`, and flipping
  `data-theme` at runtime leaves the computed color mid-animation for far longer than expected.
  Proof it was an artifact, not a cascade bug: freshly-created anchors with byte-identical classes in
  the same container computed `#7ce3b2` immediately, and setting `style.transition = 'none'` on the
  real link snapped it to `#7ce3b2` (11.54:1). Every number in the table above was therefore taken
  with all transitions killed BEFORE the theme flip. **Do not measure computed colors across a
  runtime theme flip without disabling transitions first.**
- **Perf delta vs `main` @ `45089e7`** (gzip -9 over `.next/static/chunks/`, clean production build,
  same method as V5): JS **206,752 B** vs 205,473 (**+1,279 B**, +0.6%), CSS **11,925 B** vs 11,743
  (**+182 B**, +1.5%). The JS growth is the six new FAQ answers — `Faq.tsx` is a client component and
  imports `offer.faq`, so FAQ copy is client-bundle weight by design. No new dependencies.

## Areas examined and rejected

- **Restyling `ContactForm` for a dark surface** — rejected, see Decisions. Consequence accepted and
  measured: in DARK mode the light card (`#242420`) against the band (`#171713`) is only a 1.15:1
  surface step. Not a text-contrast failure (all copy inside the card clears AA against the card),
  and the card carries a visible `rgba(242,242,236,0.12)` border that defines its edge — but flagged
  here rather than left silent, since "the card looks flat against the band in dark mode" is a
  legitimate visual call a reviewer might make differently.
- **Migrating `Hero.tsx` to the shared `AccentWord` component** — still not done (outstanding since
  V2, noted in `AccentWord`'s own docstring). Out of this bundle's scope; touching an already-shipped,
  already-reviewed file from another bundle to fix a non-defect is exactly the drift the plan avoids.
- **Extending the voice pass to `Footer.tsx`** — it carries the same class of pre-redesign copy this
  bundle removed from `ContactInfo` ("AI-powered automation and system development that transforms
  businesses and accelerates growth") and still renders the brand mark in `font-mono`, though V0
  retired Space Mono as a system voice. Real, but the footer is not this bundle's surface; recorded
  as an open item rather than silently widened into.

(the battery's own `areasExamined` are appended after Phase 4/5)

## Open items NOT addressed in this PR

Full list with reasoning in `commitments.md`. Headline items, all operator-owned:

- **The live Trello `[TEMPLATE] Codirity Client Board` still says "75% back"** (carried from V5, still
  open — only a manual Trello edit closes it; every new client currently lands in a board that
  contradicts the site's 50%).
- **Whether to publish the pause/cancel billing mechanics** ("31-day cycles, unused days banked") —
  real and approved internally, more generous than what the site says, but publishing it is a new
  public financial commitment and therefore Bruno's call.
- **Three book-a-call prompts now stack in a row** (FAQ header line, FAQ button, closing band). All
  live and instrumented, so none were removed unilaterally.
- **`Footer.tsx`** still carries pre-redesign slop copy and a `font-mono` brand mark although V0
  retired Space Mono. Not V6's surface.
- **`Hero.tsx`** still hasn't migrated to the shared `AccentWord` (outstanding since V2).

## Durable handles

- marker: $HOME/.claude/autonomous-active/autonomous-task-redesign-v3-v6 (+ .json sidecar)
- worktree: /Users/brunomaurino/projects/codirity-rv3-v6
- worktree_entry: path
- cron: (none of this run's own — the bundle-loop's `1b0f0c50` covers the whole loop)
- battery_run_id: `wf_33e76c82-22e` — **VOID, do not resume or trust.** See the skill-bug note below.
- battery_run_id: `wf_6352c39e-5cc` — the real battery (2 adversarial + 2 QA rounds, mixed finder,
  3 verify voters, `effortTiers: true`, `customAgents: **false**`).
  **If this session dies mid-battery, RESUME it** —
  `Workflow({scriptPath: "<skill>/templates/review-battery.js", resumeFromRunId: "wf_6352c39e-5cc"})`
  — do NOT re-run from scratch; read `journal.jsonl` in its transcript dir first to see how far it
  got. That is exactly what salvaged V5.

### Skill bug worth reporting — a battery that reports CLEAN while reviewing nothing

The first battery invocation (`wf_33e76c82-22e`) returned
`{rawFindings: 0, confirmedReal: 0, areasExamined: 0, applyInline: []}` — a clean review — while
**all 6 finder agents had errored**: `agent type 'at-reviewer' not found`. This build resolves the
custom review-agent types ONLY plugin-scoped (`autonomous-task:at-reviewer`), never bare
(`at-reviewer`); Step-0 probe (f) measured exactly that (`customBare: false, customScoped: true`),
but `customAgents: true` makes the shipped `review-battery.js` call the **bare** names, so every
finder died on spawn and the aggregate came back empty.

Two things make this dangerous rather than merely annoying: the failures are reported in the
task-notification's `<failures>` block, NOT in the returned object, and an empty result is
structurally identical to a genuinely clean review. Only the script's own hedge (`"Verify the
areas-examined lists look real before trusting a clean review"`) plus `areasExamined: 0` and
`agents_error: 6` distinguish them. A run that trusted the return value would have shipped an
entirely UNREVIEWED bundle while its notes and PR body claimed a clean battery.

Fix applied: re-invoked with `customAgents: false`, the documented fallback (built-in
`general-purpose` inline prompts — identical finding behavior, only the per-repo `memory: project`
priors are lost). Suggested upstream fix: probe (f) should record WHICH form resolved and the
battery should use that form, or the script should try scoped→bare; and a battery returning zero
findings with zero `areasExamined` should hard-fail rather than return a clean verdict.
