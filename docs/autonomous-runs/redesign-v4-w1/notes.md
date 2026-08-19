# autonomous-task run notes — redesign-v4 Bundle W1 (hero + nav + the constant)

**Started:** 2026-08-19T00:03:13Z

## Execution context

- Probes reused from this session: Workflow ✅, Agent ✅, args ✅, `effortTiers: true`,
  **`customAgents: false`** (never true in this repo — V6 incident), `worktreeNative: true`.
- Origin-bundle prefix: `B402`. Identifier: **`redesign-v4 Bundle 402`**.
- Branch: `feat/redesign-v4-w1` off `origin/main` @ `4c31bcb` (carries W0's foundations).
- `node_modules` via `cp -Rl` (Turbopack symlink panic). gh: `brunomaurino` (re-verify pre-push).
- Loop cron `39880892` covers this run.

## Task description (echoed)

W1 — hero + nav + the folio constant, matching `docs/redesign-v4/approved-mockup.html` exactly:
justified nav (brandmark + mint dot + pill CTA), eyebrow = `hero.trustLine`, three hand-set
headline lines with the masked line-rise, the 13px hero ledger (real numbers, brass on the price
only), the lede, primary CTA "See pricing". Replace HeroVisual/HeroBackground with the fixed dark
ground. Folio per §1.7. `.d-xl` single-line verified in-browser at 375/980/1280. Both hero CTAs
stay instrumented byte-identical. Gates: standard + SSR + measured line-wrap + perf delta.

## Task interpretation (Phase 1.5 prompt-pinning)

**Deliverable.** One PR that replaces the light v3 hero (stat-card visual + badge + slide-up
animations) with the mockup's dark-ground hero, restyles the nav for the dark hero WITHOUT breaking
it over the light sections it overlays when sticky, and adds the site-wide folio constant.

**Acceptance test.**
- Hero section computes `background #0A1712`; H1 renders the exact `hero.headline` text split as
  the mockup's three lines, each measured single-line at 375/980/1280 (real font, real browser).
- Eyebrow text === `hero.trustLine` verbatim; ledger lines are the three real facts with brass
  ONLY on `$3,995/mo`; lede === `hero.subhead` verbatim.
- Both CTAs fire the same analytics events as `main` (names + params diffed).
- Folio: `aria-hidden="true"`, `pointer-events: none`, hidden until the hero exits, `--ink-dim`
  tone over light sections; absent from the tab order.
- Header legible at scroll-top over the dark hero AND scrolled over light sections (measured).
- Reduced motion: hero fully visible and static. SSR: all hero copy in the script-stripped body.
- lint/tsc/build green; banned-word grep clean; doc perf delta vs the 30,965 gz W0 baseline.

## Plan

Phase 2 Step 0: `redesign-v4-w0/commitments.md` targets W1 with three awareness items (themeColor
interim → closed by this bundle; `.d-xl` re-verification → in the acceptance test; reveal system's
first consumers → this hero). No formal deferrals inherited.

Build: Hero.tsx rewritten to the mockup structure (min-h-[92svh] flex column, nav row inside the
hero per mockup, `width:100%` rows against the column-flex trap, `padding-top` longhand against the
shorthand trap); HeroVisual/HeroBackground deleted with their imports; Header restyled dark-aware
(ground/95 over the hero via sentinel IO — it must also survive light sections); Folio as a small
client component in layout; `.constant` CSS added to globals per mockup.

## Decisions made unilaterally

- **The mockup's in-hero nav is realized by the SHARED `<Header/>`, restyled dark-aware** — building
  a second nav inside the hero would double the chrome. ~~The existing `isScrolled` state drives
  TONE as well~~ **superseded by battery BLOCKER #0**: tone now tracks the GROUND via a
  hero-sentinel IO, not scroll distance (see findings). `font-mono` dropped (retired since W0);
  dot and nav CTA move to mint.
- **Both instrumented CTAs stay** (mockup's foot shows one): analytics continuity outranks
  composition, and the mockup's own nav carries the booking CTA anyway.
- **The Cal button stays UNLABELED** (no `analyticsLocation`): main's hero Cal emitted a bare
  `call_booked`, and this bundle's gate is byte-identical events. First drafted WITH a label;
  reverted on the gate. Labeling is a one-liner when the funnel owner wants it.
- **`hero_visual` emitter removed WITH the visual** — the brief mandates deleting
  HeroVisual/HeroBackground; that file was the only `location: "hero_visual"` emitter of
  `hero_cta_click`. The event name set is unchanged (gate-verified as the ONLY delta). GA4's
  hero_cta_click total now equals the primary-CTA count.
- **Hand-set headline lines carry a drift fallback**: the three-line split is compared against
  `hero.headline` at module scope — a future copy edit renders one unsplit line instead of stale
  fragments (the same no-duplicate rule the old accent logic followed).
- ~~**`.in` lands via rAF for the hero**~~ **superseded by battery MAJOR #6**: the rAF gate
  blanked the LCP until hydration; the hero entrance is now pure CSS keyframes that paint at first
  frame (see findings). The `scripting:none` block survives for the below-the-fold `.rv` system
  only.
- **Folio tone detection via `Section`'s new `data-ground` attribute** rather than class-sniffing —
  W2–W6 sections inherit it automatically as they migrate.

## Stop attempts

(none)

## Drift flags

(none)

## Round-skip requests

(none)

## Review findings + resolutions

Battery `wf_8719eb7c-d4f` (16 agents, 2+2 rounds, mixed finders, 3 voters): **42 raw → 11 after
dedup (10 clusters merged) → 11 confirmed (2 BLOCKER, 5 MAJOR, 4 MINOR), 0 refuted, 66 areas
examined, 0 deferrals.** All 11 applied.

| # | Sev | Where | Resolution |
|---|---|---|---|
| 0 | **BLOCKER** 3/3 | Header tone driver | **Fixed.** `scrollY > 50` had no relationship to the ground: /privacy rendered chalk-on-white (~1.1:1, invisible) and 90% of the hero's scroll depth showed a hard white bar over the dark ground. Tone now tracks the GROUND via a hero-sentinel IO (viewport shrunk to the header band); routes without a hero keep the light chrome by default — which is also the legible pre-hydration flash direction on every ground. `isScrolled` is gone entirely. |
| 1 | MAJOR 3/3 | `TheConstant` lifecycle | **Fixed.** A root-layout component never unmounts under App Router client navigation, so the once-bound effect left `past-hero` stuck across routes and never re-found a new `#hero`. Effects now re-arm on `usePathname()` with a class reset first. |
| 2 | **BLOCKER** 3/3 | hero-grid breakpoint | **Fixed — and it is the same class of error I credited myself with catching in the mockup, reintroduced one breakpoint over.** 1040 was chosen by arithmetic; the battery MEASURED a −0.59px deficit at exactly 1040 (column 772.09 vs the 7.284em line at 772.69), wrapping until ~1044 and wider with a scrollbar. Breakpoint → **1100** (worst-case margin ≈ +8px with a 15px scrollbar), and this time measured in-browser at 1099/1100 — single-column single-line below, two-column single-line at the boundary. |
| 3 | MAJOR 3/3 | folio `on-light` | **Fixed.** Per-batch `.some()` over IO entries wipes the class when one section's leave-event arrives while another light section is still under the folio (callbacks after the first carry only CHANGED entries). Now a tracked Set of currently-intersecting targets. |
| 4 | MAJOR 3/3 | brass scope | **Fixed.** The whole string "$3,995/mo flat" wore brass; §1.2 scopes brass to defensible NUMBERS and the mockup leaves "flat" chalk-dim. The row model now carries `num`/`text` separately — a structural fix, since the old per-row boolean couldn't express the split. |
| 5 | MAJOR 3/3 | price provenance | **Fixed.** "$3,995/mo" was HARDCODED in the hero ledger and the site-wide folio — while both files' comments claimed derivation, and while the headline had a drift guard the price lacked. The one number the design is named after now composes from `tiers[0].price + period` in both places. |
| 6 | MAJOR 3/3 | LCP gated on hydration | **Fixed.** The `.in`-gated entrance painted a BLANK hero (H1 = the LCP candidate, ledger, lede, CTAs) until JS hydrated — a regression vs main's pure-CSS animation. The hero entrance is now pure CSS keyframes (`.line-rise`/`.fade-rise`, auto-playing at first paint); the IO system keeps the below-the-fold scroll reveals where hydration timing is invisible. |
| 7 | MINOR | `Section` comment | **Fixed** — the comment claimed `gradient` maps dark; the code (correctly) maps it light. |
| 8 | MINOR | `offer.ts` orphans | **Fixed.** `hero.badge` + `hero.visualHeadline` had zero consumers after the visual's deletion but stayed REQUIRED on the interface, reading as live copy. Both removed. |
| 9 | MINOR | folio no-JS | **Fixed.** `scripting:none` forced the folio visible — permanently chalk-dim over paper (~1.8:1) and visible over the hero §1.7 says it must hide behind. Without JS it now stays hidden (the correct degradation for an ornament whose states are JS-managed). |
| 10 | MINOR | folio reduced-motion | **Fixed.** `.constant`'s transition wasn't in the kill-list; the comment claiming otherwise was wrong. Added. |

### Post-fix re-verification

tsc ✅ eslint ✅ clean build ✅. **27 final gates ALL PASS** — including: brass span is exactly the
price; hero AND folio compose from `tiers[0]` (comment-stripped source check); keyframe entrance
compiled with reduced-motion + no-JS coverage; breakpoint 1100 compiled and measured at
1099/1100 in-browser; header has no scroll-distance tone driver; analytics delta is exactly the
removed `hero_visual` emitter. Environment note: the verification browser reports
`prefers-reduced-motion: reduce` and runs hidden (IOs paused), so the OBSERVED states were the
reduced-motion static hero (visible, correct) and the header's pre-signal light default (legible,
correct) — the animated/chalk paths are keyframe- and 4-line-IO-driven respectively and were
verified at the code + compiled-chunk level. Document: **29,543 B gz, −1,422 vs the W0 baseline.**

## Pre-battery verification (Phase 6 evidence)

- tsc ✅ eslint ✅ clean build ✅. 16 gates ALL PASS: all hero copy verbatim in the script-stripped
  SSR body; folio `aria-hidden` in markup; event names preserved with the removed `hero_visual`
  emitter as the ONLY delta (JSX-emitters diff vs `origin/main`, comments excluded); banned words 0;
  `75%` 0.
- **Line-wrap, measured in-browser at all three widths** (real Apfel, real layout): 1280 → 131px,
  three lines single-line; 980 → 100px single-column, single-line; 375 → 38.3px, single-line, no
  horizontal overflow.
- **The gate caught a REAL mockup bug**: at 980px the two-column grid cost the H1 column ~260px and
  "automation team," (measured **7.284em** at Apfel Mittel, −.018em tracking) overflowed — the
  mockup's own "verified at 980" was false. The two-column breakpoint moved 980 → **1040** (the math
  clears from vw≈1012); the SIZE derivation stays the mockup's exact curve. This is the second time
  this scale has needed the derived-from-the-line discipline — W0's battery caught the inequivalent
  clamp, this gate caught the unaccounted grid subtraction.
- Contrast on the dark hero (computed): eyebrow 8.88, h1 16.98, lede 8.88, ledger 8.88 / brass 7.62,
  ghost Cal 16.98, header logo over hero 16.98; primary CTA text vs its own mint 11.94.
- Folio at top: opacity 0, `pointer-events: none`, `writing-mode: vertical-rl`, aria-hidden.
- **Perf: document 29,471 B gz — −1,494 B vs the W0 baseline** (HeroVisual/HeroBackground markup
  deleted). Two bundles in, v4 has now cut the document by 2,147 B total.
- Visual: screenshot at 1280 matches the approved mockup's hero — dark ground, 131px Apfel 500,
  ledger on the baseline, mint nav CTA.

## Areas examined and rejected

(battery)

## Open items NOT addressed in this PR

All in `commitments.md` as W2/W6 awareness — none are deferrals. Operator-owned: the hero Cal
button's optional analytics label; the Trello template board's stale "75%" (since v3).

## Durable handles

- marker: $HOME/.claude/autonomous-active/autonomous-task-redesign-v4-w1 (+ .json sidecar)
- worktree: /Users/brunomaurino/projects/codirity-rv4-w1
- worktree_entry: path
- battery_run_id: `wf_8719eb7c-d4f` (2+2 rounds, mixed finder, 3 voters, `customAgents: false`).
  On session death RESUME via `resumeFromRunId`; read `journal.jsonl` first.
