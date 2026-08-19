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

(Phase 4/5)

## Areas examined and rejected

(battery)

## Open items NOT addressed in this PR

(Phase 7)

## Durable handles

- marker: `$HOME/.claude/autonomous-active/autonomous-task-redesign-v4-w3` (+ `.json` sidecar)
- worktree: `/Users/brunomaurino/projects/codirity/.claude/worktrees/rv4-w3`
- worktree_entry: `path` (teardown = `ExitWorktree({action:"keep"})` + `git worktree remove`)
- battery_run_id: `wf_28e15a7c-9f1` (2+2 rounds, mixed finder, **3 verify voters**, customAgents
  false). Resume with `Workflow({scriptPath, resumeFromRunId})` on any death — W2's battery lost all
  16 voters to a session limit and returned MAJORs adjudicated 1/1; resuming took it from 11
  degraded findings to 16 confirmed 3/3, including a BLOCKER the degraded pass never found.
