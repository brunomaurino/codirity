# autonomous-task run notes — redesign-v4 Bundle W3 (the queue scene)

**Started:** 2026-08-19T14:09:05Z

## Execution context

- Probes reused (session `0556b7db`, same session that ran W2): Workflow ✅ Agent ✅ args ✅
  effortTiers ✅ **customAgents FALSE** (V6 incident — `true` makes the battery call bare agent
  names this build cannot resolve; every finder dies and the battery reports CLEAN having reviewed
  nothing) · worktreeNative ✅.
- Prefix `B404`, identifier **`redesign-v4 Bundle 404`**. Branch `feat/redesign-v4-w3` off
  `origin/main` @ `3943f85` (carries W0+W1+W2). `cp -Rl` node_modules (Turbopack hard-panics on a
  symlinked `node_modules`).
- **Worktree path deviation:** this run's worktree is
  `/Users/brunomaurino/projects/codirity/.claude/worktrees/rv4-w3`, NOT the sibling
  `projects/codirity-rv4-w3` that W0–W2 used. `EnterWorktree` refuses to switch the session into a
  worktree outside `.claude/worktrees/`, and this session is worktree-isolated (it rejects
  `git -C <other-path>`), so the sibling layout would have left no way to run commands against the
  bundle at all. `worktree_entry: path`.

## Task description (echoed)

Implement the signature motion from `docs/redesign-v4/approved-mockup.html` `#queue` exactly: a
320vh scene with a sticky 100svh stage, four task chips on a horizontal track, discrete steps driven
by a rAF-gated scroll quantizer (the tween belongs to CSS transitions on the house curve — never 1:1
scroll-linked), chips flipping queued→active→shipped with the mint ring on the active slot, the
brass Shipped counter ticking (the ONE number allowed to animate, because there the number IS the
mechanic), and the label "An illustrative queue — you scroll, we ship. Not a client board." kept
VERBATIM — it is the honesty gate on this section. Reduced motion: static scene, height auto, step 1
tableau (one shipped, one active) — full information, zero motion. No scroll-jacking: native scroll
throughout; transform/opacity only; test on a touch viewport. Headline "One task active. The rest
wait in line." uses the shared line-rise.

## Task interpretation (Phase 1.5 prompt-pinning)

**Deliverable.** One PR adding `src/components/sections/Queue.tsx` — a client component rendering
the mockup's `#queue` scene — plus its CSS in `globals.css`, its illustrative chip content in
`src/config/offer.ts`, and its placement in `src/app/page.tsx` directly after `<Pricing />` (the
terms band), which is the mockup's own terms→queue adjacency.

**Acceptance test.**
- The scene renders four chips whose labels and the `q-note` honesty line are VERBATIM from the
  mockup; the headline is "One task active." / "The rest wait in line." on the shared line-rise.
- Driving `window.scrollY` across the scene fires steps **0→1→2→3**: at each step the track's
  `--step` matches, exactly one chip is `is-active`, all lower-index chips are `is-shipped`, each
  chip's status word reads queued/active/shipped correctly, and the brass counter equals the step.
- The tween is a CSS `transition` on `.q-track` — asserted in the COMPILED chunk. The scroll
  handler only ever writes a discrete integer; it never writes a scroll-proportional transform.
- Under `prefers-reduced-motion: reduce` the scene is `height: auto`, the stage is `position:
  static`, the track does not translate, and the **step-1 tableau** renders (chip 0 shipped, chip 1
  active) — full information, zero motion.
- No scroll-jacking: no `preventDefault` on wheel/touch, no `scrollTo`, no `scroll-behavior`
  override; the listener is `{ passive: true }`; only `transform`/`opacity` animate.
- Standard gates green, plus a scripted scroll test and a perf delta on the prerendered DOCUMENT
  (server-component markup ships in the RSC flight payload).

## Plan

**Step 0 — cross-run commitments.** Two files carry `## Target: … Bundle 3`, both from
`client-onboarding` — a DIFFERENT plan token, so the plan-qualified rule correctly excludes them.
This is exactly the bare-ordinal false match the rule exists for. The one real match is
`redesign-v4-w2/commitments.md § Target: redesign-v4 Bundle W3`: **zero deferrals**, four awareness
items (bare `<section>` not `<Section>`; the ink variant is v4-correct; a gate must be proven able
to fail; the boundary lesson). All four are honoured below.

**Files.**
- `src/components/sections/Queue.tsx` — NEW. Client component: the scene, the stage, the track, the
  quantizer.
- `src/config/offer.ts` — the four illustrative chip labels + the honesty note + the section copy.
- `src/app/globals.css` — the `.queue-*` / `.q-*` block, ported from the mockup.
- `src/app/page.tsx` — place `<Queue />` directly after `<Pricing />`.
- `src/components/sections/index.ts` — export.

**Verification.** `tsc` · `eslint` · clean build · a scripted scroll test driving the real scene in
a browser and asserting steps 0→3 · a reduced-motion assertion · a compiled-CSS assertion that the
tween is a CSS transition · a no-scroll-jacking source assertion · perf delta on the prerendered
document. Every gate self-tested against a mutation, per W2's lesson.

**Open questions resolved.**

1. **Where does the scene go?** The mockup runs hero → terms → queue → case studies, but this page
   still carries the v3 order (terms sits eighth, after About). A full reorder is W4–W6's scope, not
   W3's. Resolution: preserve the mockup's LOCAL adjacency — `<Queue />` immediately after
   `<Pricing />` — so terms→queue reads as the mockup intends without pre-empting another bundle's
   restructuring. Both sections are on the dark ground, so no `.band` is needed between them, which
   is also why this adjacency is the safe one: inserting the queue anywhere in the paper run would
   demand two new gradient bands and violate the no-hard-cut rule mid-bundle.
2. **Do the chip labels belong in `offer.ts`?** They are ILLUSTRATIVE, not facts — the section's own
   note says so. Config is still right: the v4 discipline is that rendered copy composes from
   `offer.ts`, and a `queue` block with an explicit "illustrative, not client work" comment makes
   the honesty constraint visible at the source rather than buried in JSX. Chosen over hardcoding.
3. **How discrete is "discrete"?** The brief bans 1:1 scroll-linking. Resolution: the handler
   computes an integer step and writes it ONLY when it changed; every visual change is a CSS
   transition on the house curve. No scroll-proportional value is ever written to the DOM.
4. **Is the ticking counter a violation of "prices never animate"?** No — and the distinction is
   the point. The rule protects the PRICES, whose stillness is the argument. The counter is not a
   price; it is the mechanic itself, and it changes by discrete integer swap, not a count-up tween.

## Decisions made unilaterally

1. **`useReducedMotion` via `useSyncExternalStore`, not `useState` + effect.** The mockup reads the
   media query once at mount. Ported literally, that trips the React Compiler's
   `react-hooks/set-state-in-effect` lint — and the lint is right: setting state from an effect to
   match a browser preference is a hydration-mismatch risk. `useSyncExternalStore` with a server
   snapshot of `false` is the correct shape, and it also picks up a LIVE change to the OS setting,
   which a one-shot read never does. The step becomes derived (`reduced ? 1 : scrollStep`) rather
   than pushed into state. New shared hook at `src/hooks/useReducedMotion.ts` — W4/W5 will want it.
2. **`overflow: clip` on the stage, not `hidden`.** `overflow: hidden` on an ancestor makes a
   sticky descendant clip against its own scroll container; `clip` gives the same visual bound
   without creating one. The mockup already uses `clip`; this records WHY so it is not "tidied".
3. **The no-JS collapse was written during the build, not after review.** W2 shipped a conversion
   band that rendered blank without JS. A 320vh scene whose quantizer never runs is the same defect
   — three viewports of dead scroll past a frozen queue — so `@media (scripting: none)` collapses
   the scene exactly as reduced-motion does. The SSR state (chip 0 active, counter 0) is coherent
   on its own, so nothing is lost.
4. **`aria-live="polite"` on the counter only.** Each chip already carries its status as TEXT
   ("queued"/"active"/"shipped"), so no state is conveyed by colour alone and the chips need no
   live region of their own — announcing four chips on every step would be noise.

## Test instrumentation used, and removed

The verification of the MOTION path required instrumenting the build, so it is recorded here rather
than implied:

- The in-app browser pane reports `prefers-reduced-motion: reduce`, which meant the **reduced-motion
  branch was verified against real rendering for free** — and it passed (static stage, `height:auto`,
  no translation, step-1 tableau).
- To exercise the motion branch, `useReducedMotion`'s snapshot was temporarily keyed off
  `sessionStorage`, and the reduced-motion CSS was overridden at RUNTIME with the motion values
  copied verbatim from `globals.css`. The quantizer itself was never modified.
- A hidden pane fires no `requestAnimationFrame` and paints no frames. Two consequences: the
  quantizer's `ticking` latch wedged on the first scroll (its rAF never fired), which is why the
  first attempt showed step 0 forever; and CSS transitions never advance, so `getComputedStyle`
  returns the FROM value indefinitely. Both were handled by the harness (a synchronous rAF shim
  plus a client-side remount so the shim was in scope, and a `transition: none` override to read
  the settled transform) — **not** by changing the code under test.
- `grep` confirms zero instrumentation remains in `src/`.

## Stop attempts

(none)

## Drift flags

(none)

## Round-skip requests

(none)

## Review findings + resolutions

Battery `wf_28e15a7c-9f1` ran clean: **16/16 agents, 0 errors, 0 empty results**. 29 raw findings →
13 clusters → **12 confirmed, 1 refuted, 0 deferrals, 0 escalations**. All 12 applied.

It also independently confirmed the two fixes made proactively while it ran (the composed `--slot`
and the resize re-quantization) and recorded them as already-fixed rather than reporting them.

### MAJOR

| At | Finding | Resolution |
|---|---|---|
| `Queue.tsx:100` (3/3) | The h2 rendered `d-md rv`; the mockup has **`display d-md rv`**. `.d-md` sets font-size ONLY, so the heading fell back to body's `line-height: 1.55` — a ~65% taller block, enough to overflow the clipped 100svh stage on a short viewport | Added `display`. Measured after: line-height **54.1px** (0.94) not 89px, tracking −0.012em |
| `globals.css` (3/3) | `.is-shipped{opacity:.35}` **compounded** with `small{opacity:.7}` → ~2.2:1 and 1.7:1 on `--ground`, far under AA — and the reduced-motion tableau pins chip 0 in that state permanently | The recede is now an explicit colour (`--chalk-faint`), not opacity, and `small` no longer multiplies. Measured: **5.28:1**. A deliberate, measured deviation from the mockup — §1.3's AA commitment outranks a literal opacity |
| `scripts/` (3/3) | The bundle's own "steps 0→3 fire" criterion had **no committed gate** — only an ad-hoc harness that proved it once and was deleted. Also not re-runnable: a headless pane reports reduced-motion, so the listener never attaches | Quantizer math extracted to a pure `src/lib/queueStep.ts`; `scripts/w3-quantizer-test.ts` (via `tsx`) asserts steps 0→3, discreteness, monotonicity, clamping, the `travel<=0` guard, the round boundaries and chip-count independence — **no browser required** |
| `w3-motion-gate-selftest.py` (3/3) | Mutated the **tracked source** and the built chunk in place with no `try/finally`; an interruption would leave an injected mutation in the working tree, one of which does not typecheck | Rewritten to mutate **copies in a temp dir** under `try/finally`. The working tree is never written to. `--source`/`--qsource` added to the gate so it can be pointed at copies |
| `w3-copy-gate.py` (3/3) | The honesty gate shipped with **no self-test** — violating §0's own rule | Five copy-gate mutations added (note drift, a chip reading as real client work, an EXTRA chip, headline drift, wrong SSR state). All caught |
| `globals.css:965` (2/3) | `.queue-stage` is a row flex and `.wrap-v4` has `margin-inline:auto`, so the wrap **shrink-wrapped to min-content** instead of filling — the page gutter stopped matching every other section. Exactly the trap the mockup patches for its hero (`.hero > .wrap{width:100%}`), never ported | `.queue-stage > .wrap-v4 { width: 100% }`. Measured after: wrap left edge **76px**, identical to the hero's and the terms band's |

### MINOR

- **`current` desync** — the effect-local counter reset to 0 on re-run while `scrollStep` survived, so toggling the OS reduced-motion preference off mid-session could strand a stale step. Now a `useRef` that outlives the effect.
- **Live-region scope** — `aria-live` on the bare digit announced a context-free "2". Moved to the whole line with `aria-atomic`; verified announcing **"Shipped 1"**.
- **`role="list"`** — Safari/VoiceOver strips list semantics from any list styled `list-style: none`, dropping exactly the ordering this section argues.
- **Comment drift** — the header claimed every transition uses the house curve; only `.q-track` does (`.q-task` uses plain `ease`, verbatim from the mockup). Comment corrected to the real split rather than the CSS changed.
- **`offer.ts` doc drift** — "The first is the active one" is true only at step 0; and `states` is keyed by name, so its "order" meant nothing.
- **`design-system.md` + `CLAUDE.md`** — the type-scale banner listed `.d-*` as if complete, which is plausibly what produced the missing `.display` above. Both now state that `.d-*` sets font-size only.

### Refuted (not applied)

- `useReducedMotion.ts:20` (**1/3**) — that `getServerSnapshot() === false` gives a no-JS reduced-motion reader the step-0 tableau rather than step-1. Adjudicated not real: with no JS there is no hydration at all, the CSS still collapses the scene, and step 0 is internally coherent (one active, three queued, counter 0). Recorded rather than silently dropped.

## Post-fix verification

- `tsc` ✅ · `eslint` ✅ · clean build ✅
- `scripts/w3-quantizer-test.ts` ✅ — steps 0→3 in order, every offset lands on an integer in
  `[0,3]`, monotonic across 400 samples, clamped above and below the scene, `null` on all three
  no-travel shapes, the `Math.round` boundaries documented, and chip-count independence.
- Motion gate ✅ · copy gate ✅ · **self-test: 15/15 mutations caught, both unmutated runs pass —
  `GATES ARMED`**, and it now leaves the working tree untouched (verified with `git status`).
- **Contrast measured in-browser on the live production page**, compositing each element's full
  opacity chain over the real ground: shipped chip **5.28:1** (was ~2.2 and ~1.7), active 16.98,
  queued 8.88 / 4.92, note 4.92, brass counter 7.62 — **nothing under AA**.
- **DOM after the fixes:** h2 is `display d-md rv` at line-height 54.1px; the wrap's left edge is
  76px, identical to the hero's and the terms band's; `role="list"` present; the live region is the
  whole `Shipped 1` line with `aria-atomic`.
- Fits at 375×568 through 1440×900 — the stage contains its content at every viewport, chips stay
  280px, no horizontal document overflow.
- **Perf: document 28,273 B gz — +306 B over W2 (27,967)** for the entire scene.

## Areas examined and rejected

The battery recorded **68 areas examined**. The ones worth carrying forward:

- **rAF latch / listener lifecycle** — ruled out a wedged quantizer: `ticking` is cleared at the TOP
  of the rAF callback, *before* the `travel <= 0` early return, so a short scene, a detached node or
  a fast scroll-past cannot permanently latch it. Both listeners are removed on cleanup.
- **React custom-property serialization** — ruled out a `--step: 3px` bug (React omits the px suffix
  for custom properties) and a `useSyncExternalStore` subscribe/getSnapshot loop (both are
  module-level constants returning a boolean, so `Object.is` settles immediately).
- **Focus and the sticky stage** — the scene contains no focusable elements, so `overflow: clip`
  cannot strand focus; `clip` rather than `hidden` is also what keeps the sticky stage from clipping
  against its own scroll container.
- **Ground continuity** — Queue carries `data-ground="dark"` and follows Pricing, which is also
  dark, so no `.band` is owed between them and no new hard cut is introduced (§1.5).
- **Shorthand/longhand trap** — the mockup's `margin:30px 0 0` and `padding:clamp(…) 0` shorthands
  were deliberately rewritten as longhands so `.wrap-v4`'s horizontal padding survives composition.
- **`offer.ts` consumer contract** — `queue` is a new required field on the exported `Offer`
  interface, but `offer` is its only construction site and every consumer imports named bindings, so
  nothing breaks structurally.
- **Review-target volatility** — the branch went from one commit to three *during* the review. The
  battery restated every finding against the final committed state and recorded the two mid-flight
  fixes as already-applied rather than reporting them.

## Open items NOT addressed in this PR

- **Page section ORDER still follows v3.** The mockup runs hero → terms → queue near the top; this
  page still has the v3 sequence with terms eighth. W3 preserved the mockup's terms→queue adjacency
  rather than reordering, because the reorder is W4–W6's scope and moving the queue into the paper
  run would demand two new gradient bands.
- **Operator-owned, still open:** the live Trello `[TEMPLATE] Codirity Client Board` still promises
  **"75% back"** where the codebase says 7 days / 50%. Carried since v3; only a manual Trello edit
  closes it.
- **`dark:` classes and `.glass-dark`** remain for W6's sweep (unchanged by this bundle).
- **The repo still has no test runner.** `w3-quantizer-test.ts` runs via the already-installed
  `tsx`, which is the first committed executable test in the repo but is invoked by hand, not by CI.
  Wiring an `npm test` script and a CI job is a repo-level decision, not this bundle's.

## Durable handles

- marker: `$HOME/.claude/autonomous-active/autonomous-task-redesign-v4-w3` (+ `.json` sidecar)
- worktree: `/Users/brunomaurino/projects/codirity/.claude/worktrees/rv4-w3`
- worktree_entry: `path` (teardown = `ExitWorktree({action:"keep"})` + `git worktree remove`)
- battery_run_id: `wf_28e15a7c-9f1` (2+2 rounds, mixed finder, **3 verify voters**, customAgents
  false). Resume with `Workflow({scriptPath, resumeFromRunId})` on any death — W2's battery lost all
  16 voters to a session limit and returned MAJORs adjudicated 1/1; resuming took it from 11
  degraded findings to 16 confirmed 3/3, including a BLOCKER the degraded pass never found.
