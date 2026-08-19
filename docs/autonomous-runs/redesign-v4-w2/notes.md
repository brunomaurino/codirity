# autonomous-task run notes — redesign-v4 Bundle W2 (the terms band)

**Started:** 2026-08-19T01:04:31Z

## Execution context

- Probes reused (session `0556b7db`): Workflow ✅ Agent ✅ args ✅ effortTiers ✅
  **customAgents FALSE** (V6 incident) · worktreeNative ✅.
- Prefix `B403`, identifier **`redesign-v4 Bundle 403`**. Branch `feat/redesign-v4-w2` off
  `origin/main` @ `c1dfe2f` (carries W0+W1). `cp -Rl` node_modules. Loop cron `39880892`.

## Task description (echoed)

Replace Pricing with the mockup's four-row terms ledger (#terms): Standard / Pro / Guarantee /
Founding (gated + interpolated), prices at the 99px tier in brass with hanging `$` and baseline
units, per-tier `Get started` → real `stripeUrl` with `checkout_click_*` byte-identical, rules-draw
motion (prices never animate), `pricing_viewed` preserved, anchor renamed `#terms` with a working
`#pricing` alias, `hero.primaryCta.href` updated. Gates: standard + SSR + CTA verification + perf.

## Task interpretation (Phase 1.5 prompt-pinning)

**Deliverable.** One PR: `Pricing.tsx` becomes the dark-ground terms band per the mockup;
`PricingCard.tsx` (no other consumers) deleted; the checkout funnel provably intact.

**Acceptance test.**
- SSR renders 4 rows with figures `$3,995`, `$6,995`, `7 days` + `50% back`, `$2,995` (founding
  gated on `foundingRate.active`, slots interpolated); zero `75%`.
- The three `checkout_click_*` JSX emitters match `main` exactly (names + params) and each CTA
  href threads the tier's real `stripeUrl` env chain.
- `pricing_viewed` still fires: the tracker's `#pricing` target still exists with REAL height (the
  alias must not be a zero-height sentinel — the tracker's own docstring warns why).
- `#terms` and `#pricing` both scroll to the band; `hero.primaryCta.href === "#terms"`.
- Figures' digits align across all four rows (hanging `$` in a reserved gutter); nothing clips the
  viewport at 375px — **measured at the boundary, per the three-strikes lesson**.
- Band emits `data-ground="dark"`; no 600/700 weight; brass on figures only; reduced-motion
  complete; lint/tsc/build green; doc perf delta vs 29,543 gz (W1).

## Plan

Step 0: no incoming deferrals (W1's commitments target W2 with three awareness items — the anchor
rename, the folio `data-ground`, the boundary lesson — all folded into the acceptance test).
Build: `sections.terms` copy into offer.ts (+ `primaryCta.href` → `#terms`); terms-band CSS into
globals (rules-draw, hanging-`$`-in-gutter — see Decisions); `Pricing.tsx` rewritten as the band
with a full-height `#pricing` alias layer; `PricingCard.tsx` deleted + exports pruned.

## Decisions made unilaterally

- **The hanging `$` moved into a RESERVED GUTTER inside the row** (`.term-v { padding-left: .74em }`
  + `.cur { position: absolute; left: 0 }`) instead of the mockup's `translateX(-105%)` overhang —
  the mockup's version clips ~4px past the viewport at 375px, where the symbol outgrows the 24px
  page padding. Digit alignment across all four rows is preserved because every `.term-v` carries
  the same gutter (measured: all four figures start at x=40 at 375px). A mockup deviation, flagged
  per the HANDOFF's deviation rule — it fixes a defect in the contract without changing the look.
- **The four notes are the approved mockup's own lines** (the guarantee row is `guarantee.description`
  verbatim; the founding note interpolates `foundingRate.slots`). The Standard/Pro notes are the
  mockup's approved compositions of real tier facts, not offer.ts strings verbatim — recorded so the
  battery can weigh that provenance explicitly.
- **`#pricing` alias is a full-height absolute layer**, not a zero-height anchor — the tracker's own
  docstring documents why a zero-height sentinel never fires an IO; the alias keeps
  `PricingViewedTracker` working UNMODIFIED and old inbound links landing on the band.
- **`PricingCard.tsx` deleted** (zero remaining consumers); the v3 trust boxes and founding banner
  die with the old section — their facts live on in the band's own rows and the FAQ.
- **The sr-only `<h2>`** keeps the document outline (`sections.terms.title`) while the visible
  framing is the mockup's single eyebrow line.

## Stop attempts

(none)

## Drift flags

(none)

## Round-skip requests

(none)

## Review findings + resolutions

**16 findings, all confirmed 3/3 by the resumed battery, all applied.** The degraded first pass
(1/1 voters) surfaced 11; the resume found five more *including the BLOCKER* — the strongest
argument yet for the V6 rule that a partially-dead battery is resumed, never accepted.

### BLOCKER — price/note collision, 900–1030px

Two independent causes compounded. `Pricing.tsx` nested `.wrap-v4` inside the legacy `<Section>`,
whose own `px-4 md:px-8` doubled the page gutter to 80px/side and pushed the band's left edge 32px
off the hero's; and `.term-v` reserved a `0.74em` hanging-`$` gutter where the `$` glyph measures
`0.381em`, adding ~0.36em (25–36px) of dead space per figure.

Fixes: the band is now a **bare `<section>`** carrying its own ground (exactly like W1's hero), and
the gutter is `0.42em`.

**My own 900px gate was a false negative, and that is the more important finding.** It asserted "no
horizontal overflow" — but `body { overflow-x: hidden }` hides intra-*grid* collision entirely, so
the check could never have failed for this class of bug. The replacement measures **element bounding
boxes** (`.term-k`/`.term-v`/`.term-note`/`.term-cta`, pairwise, vertical-intersection gated) and is
**proven to fail** before it is trusted: forcing a collision makes it report 202.2px.

### The rest

| # | What | Resolution |
|---|---|---|
| 1 | Breakpoint was `900px`; the mockup says `860px` | `860px`, the contract's value verbatim |
| 3 | `.term-v` gutter overshot the `$` glyph | `0.42em` (glyph is `0.381em`) |
| 4 | Founding CTA label hardcoded | `foundingRate.cta` |
| 5 | Five **required** fields with zero consumers | `sections.pricing`, `Tier.description`, `Tier.highlighted`, `FoundingRate.label`, `Guarantee.title` deleted |
| 6 | No-JS rendered the conversion band **blank** | `@media (scripting: none)` now covers `.term > *` and `.term::after` |
| 7 | Eyebrow hardcoded "four" while the 4th row is gated | `"…in {n} numbers"`, spelled from the rendered row count |
| 8 | Pro note assembled to "at a time, running in parallel" | `Tier.note` holds the mockup's wording; `tasks` keeps its standalone phrasing for the hero + Trello |
| 9 | CTA's transition **replaced** the row entrance | `.term > .term-cta` composes opacity/transform on the same stagger |
| 10 | `Section` docstring still carried v3's one-ink-section rule | marked SUPERSEDED — v4 inverts the premise |
| 11–13 | Stale comments (`#pricing` target, alias consumers, tracker) | corrected |
| 14 | `JsonLd` offer URL pointed at the `#pricing` shim | `${base}/#terms` |
| 15 | `Section` ink variant painted `bg-gray-900 text-white` | `bg-ground text-chalk` — pure white was never `--chalk` |
| — | `guarantee` figures hardcoded in the component | `guarantee.days` / `refundPct`; `foundingRate.period` added so the band splits `price` without string-guessing |

### Gates written for this bundle (all self-tested)

`scripts/w2-*.py`, parameterised so they run anywhere:

- **`w2-copy-gate.py`** — the band's rendered copy vs the approved mockup, **both directions**. The
  negative half exists because v3's fact-provenance gate only checked that expected strings were
  PRESENT, which is blind to substitutions and additions — it passed two fabrications.
- **`w2-copy-gate-selftest.py`** — proves that gate can fail: substitution / figure-drift /
  eyebrow-count / dropped-row all **caught**, unmutated **passes**. `GATE ARMED`.
- **`w2-css-gate.py`** — asserts the W2 contracts in the **compiled chunk**, not in source (Lightning
  CSS drops the second of two identical-value declarations, and a source grep is comment-blind).
  Caught its own over-literal assertion: the compiler normalises `::after` → `:after`.
- **`w2-killswitch-check.py`** — flipping `foundingRate.active` removes the row, the checkout CTA,
  the FAQ entry and the eyebrow's count **together**, with no stranded prose. Verified: 3 rows,
  "in three numbers", zero `founding` mentions outside the flight payload.

## Pre-battery verification (Phase 6 evidence)

- tsc ✅ eslint ✅ clean build ✅ — **28 gates ALL PASS on first run**: all four rows' figures + notes
  verbatim in SSR; zero `75%`; `#terms` + full-height `#pricing` alias; `hero.primaryCta.href`
  updated; checkout emitters identical to main (names, `external`, no params); `stripeUrl` threading;
  founding gated + interpolated; `.term-v` carries no transition/animation (figures never animate);
  rules-draw compiled; reduced-motion covers the band; gutter hang compiled; `data-ground="dark"`;
  brass on exactly the three prices; banned words 0.
- **Boundary measurements in-browser** (the three-strikes lesson): at 375px — no horizontal
  overflow, no `$` clip (all `cur` at x=40), all four figures' digits aligned; at 900px (the 4-column
  grid's own boundary) — 4 columns, no row overflow, notes at equal width.
- **Perf: document 27,713 B gz — −1,830 B vs W1.** Four bundles in, v4 has cut the homepage document
  by 3,905 B (~12.6%) while replacing the entire visual system.

## Post-fix verification (after applying all 16)

- `tsc --noEmit` ✅ · `eslint src/` ✅ · clean `next build` ✅ (10/10 static pages).
- **Collision gate, production build, 257 widths 320→1600px:** worst overlap **0px**, band gutter
  matches the hero's at **every** width (`gutterDelta 0`), no document overflow. Measured with all
  motion disabled so the boxes are settled — a per-child entrance stagger puts siblings at different
  `translateY`, which silently defeats the vertical-intersection test. **Gate armed** (reports
  202.2px when a collision is forced).
- **Clearance, not just absence of overlap:** the tightest figure↔note gap is a constant **36px**
  (the grid's own column gap) across every side-by-side width — the columns never squeeze, so this
  is not shipping one pixel from the edge.
- Copy gate ✅ both directions against the **production** document · self-test **GATE ARMED** ·
  kill-switch ✅ · compiled-CSS gate ✅.
- **Computed styles on the live production page** (not source): ground `#0A1712`, text `#F4F7F2`,
  brass `#C8A24A` on exactly the three price figures with `Guarantee` correctly left in chalk (the
  mockup gives it no `.term-n`), mint `#6EE7A8` only on the three CTAs, pill radius `999px`, rules
  at `rgba(244,247,242,0.14)`, family `apfel`, and **zero elements above weight 500** anywhere in
  the band.
- **Perf: document 27,967 B gz — −1,576 B vs W1** (29,543). Applying the 16 findings cost +254 B,
  almost entirely the `Tier.note` strings in the RSC flight payload — which *is* a real client cost,
  per the W8 lesson that server-component markup reaches the browser.

## Areas examined and rejected

- **Adding `Tier.note` looks like re-adding the `Tier.description` this same bundle deleted.** It is
  not: `description` had zero consumers, while `note` is rendered by the band. The alternative —
  interpolating the note from `tasks` — is what produced the defect.
- **Pointing `PricingViewedTracker` at `#terms` and deleting the `#pricing` alias.** Rejected: the
  alias is also the landing target for old inbound links, and `pricing_viewed` is a live analytics
  series whose continuity is worth more than one removed div.
- **Reproducing the original BLOCKER by regressing the CSS.** Attempted (restoring `0.74em` plus a
  40px gutter) and it did **not** reproduce, so that reconstruction is not offered as evidence. The
  gate's credibility rests on the forced-collision self-test instead, which does fire.

## Open items NOT addressed in this PR

- **Operator-owned, still open:** the live Trello `[TEMPLATE] Codirity Client Board` still promises
  **"75% back"**. The codebase says 7 days / 50% everywhere; only a manual Trello edit closes this.
  Carried since v3 — it is the one place a customer can still read the wrong number.
- **`dark:` classes still on the page.** v4 neutralised the variant (`@custom-variant dark` can never
  match), so they compile to dead weight rather than wrong colour. **W6 sweeps them.**
- **`.glass-dark` now has zero consumers** (PricingCard was deleted here). W6 can drop it outright.
- **`Section`'s `ink` variant is now v4-correct but still legacy-shaped.** W3–W6 use it freely; the
  component itself is a W6 question.

## Durable handles

- marker: $HOME/.claude/autonomous-active/autonomous-task-redesign-v4-w2 (+ .json sidecar)
- worktree: /Users/brunomaurino/projects/codirity-rv4-w2
- worktree_entry: path
- battery_run_id: `wf_ca4b8ee3-a2a` (2+2, mixed finder, 3 voters, customAgents false).
  **Session-kill incident (2026-08-19 ~00:00–01:00):** the battery's first pass lost ALL 16 verify
  voters to the account's session limit (reset 1am America/Cordoba) and returned with MAJORs
  adjudicated at 1/1 instead of 3/3 — degraded verdicts, 8/24 agents done. The owning Claude
  process then exited; the external watchdog resumed the session at ~09:47. Per the V6 lesson
  (resume a partially-dead battery, never accept it), the battery was RESUMED with
  `resumeFromRunId` — cached finders/dedup replay, only the dead voters re-run at full strength.
  The degraded first-pass verdicts are NOT applied until the resumed adjudication lands.
