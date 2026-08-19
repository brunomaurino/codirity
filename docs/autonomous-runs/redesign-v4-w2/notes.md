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

(Phase 4/5)

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

## Areas examined and rejected

(battery)

## Open items NOT addressed in this PR

(Phase 7)

## Durable handles

- marker: $HOME/.claude/autonomous-active/autonomous-task-redesign-v4-w2 (+ .json sidecar)
- worktree: /Users/brunomaurino/projects/codirity-rv4-w2
- worktree_entry: path
