# autonomous-task run notes — redesign-v4 Bundle W4 (case studies + clients)

**Started:** 2026-08-19T16:20:00Z

## Execution context

- Probes reused (session `0556b7db` — the session that ran W2 and W3): Workflow ✅ Agent ✅ args ✅
  effortTiers ✅ **customAgents FALSE** (V6 incident) · worktreeNative ✅.
- Prefix `B405`, identifier **`redesign-v4 Bundle 405`**. Branch `feat/redesign-v4-w4` off
  `origin/main` @ `7ce0689` (carries W0–W3). `cp -Rl` node_modules.
- Worktree `/Users/brunomaurino/projects/codirity/.claude/worktrees/rv4-w4`, `worktree_entry: path`
  (same deviation as W3 — `EnterWorktree` only accepts worktrees under `.claude/worktrees/`).

## Task description (echoed)

Rework `CaseStudies.tsx` and `RecentWork.tsx` to match `docs/redesign-v4/approved-mockup.html`: the
eDairyMarket block (label, the 27/273 stat with its scroll-linked wipe via `animation-timeline:
view()` plus the `@supports` fallback, headline INCLUDING "Found and fixed.", the two-column
background + shipped-list, stack pills); the Meshio block (three-line headline, the
New → Niche set → Voice set → Activated state machine as the visual — deliberately NO number, the
state machine IS the story); the three-client strip with client/pre-launch tags. ALL copy verbatim
from `offer.ts` `caseStudies[]`/`clients[]`. Retire the v3 SVG sketches (delete
`CaseStudySketch.tsx`). Gates: standard + SSR fact-provenance + banned-word grep + perf delta.

## Task interpretation (Phase 1.5 prompt-pinning)

**Deliverable.** One PR rewriting `src/components/sections/CaseStudies.tsx` and
`RecentWork.tsx` in the v4 treatment, deleting `CaseStudySketch.tsx` and its export, adding the
`.work/.stat/.shipped-list/.stack/.sm/.clients` block to `globals.css`, and adding the structured
fields the blocks compose from to `src/config/offer.ts`.

**Acceptance test.**
- Every string rendered inside the two case-study sections and the clients strip is **verbatim from
  `offer.ts`** — checked in BOTH directions, so a substituted noun or an added clause fails, not
  just a missing one. "Found and fixed." renders. Zero percentages that `offer.ts` does not contain.
- The eDairyMarket stat renders `27` / `of 273 product pages`, and the stat plus the headline lines
  **reconstruct `caseStudies[0].headline` exactly** — asserted mechanically, so the display split
  can never drift from the fact it was split out of.
- Meshio renders NO figure at the stat tier, and its state machine renders four states ending in
  the goal, with a text `aria-label` describing the sequence.
- The stat wipe is scroll-linked via `animation-timeline: view()` with the `@supports not` fallback
  compiling; reduced-motion pins both to their finished state (no clipped, invisible number).
- `CaseStudySketch.tsx` is gone with no dangling imports; the page still builds.
- Standard gates green + perf delta on the prerendered document.

## Plan

**Files.** `src/config/offer.ts` (structured stat + hand-set headline lines + the state machine),
`src/components/sections/CaseStudies.tsx` (rewrite), `RecentWork.tsx` (rewrite),
`CaseStudySketch.tsx` (delete) + `index.ts`, `src/app/globals.css` (the v4 case-study block),
`scripts/w4-*.py` (gates + self-test).

**Open questions resolved.**

1. **The mockup's copy and `offer.ts` disagree — which wins?** `offer.ts`, on every factual matter;
   the mockup wins on layout. The mockup is a design artifact whose copy was abbreviated to fit:
   it drops "— 10% of the catalog" from the eDairyMarket headline, drops "new NestJS APIs, a
   Next.js SSR storefront, a React admin panel" from the background, shortens Meshio's OAuth bullet,
   and trims both client stories. The brief says "ALL copy verbatim from offer.ts", the HANDOFF says
   `offer.ts` wins on facts, and every one of those trims removes a TRUE claim. So: the mockup's
   structure, `offer.ts`'s strings.
2. **The stat is carved out of the headline — how, without string-slicing?** `caseStudies[0].headline`
   opens with "27 of 273 product pages", which the mockup renders as the stat block; rendering the
   full headline in the h2 as well would duplicate it. String-slicing at render time is exactly the
   fragility W2's review flagged. Resolution: `offer.ts` gains a `stat` object and
   `headlineLines[]`, with a **gated invariant** — `stat.value + " " + stat.of + " " +
   headlineLines.join(" ")` must equal `headline` character for character. The prose fact stays the
   canonical string; the structured fields are a view of it that cannot silently drift.
3. **Meshio's state machine — hardcode the diagram?** No. `whatShipped[0]` already asserts
   "A New → Niche Set → Voice Set → Activated state machine". A `stateMachine` field carries the
   states, and a gate asserts every state name appears in that bullet, so the diagram and the claim
   cannot diverge.
4. **The clients strip tags.** `ClientEntry` has `preLaunch?: boolean`. The mockup shows every entry
   tagged `client`, with Vivi carrying an additional `pre-launch`. That matches the 2026-08-18 D6
   amendment recorded in `offer.ts` (all three present as clients), so the tag set composes:
   always `client`, plus `pre-launch` when `preLaunch` is true.
5. **Is `headlineAccent` removed?** Yes — the `CaseStudy` doc comment already schedules its removal
   for this bundle, and the v4 treatment has no accent-word device.

## Decisions made unilaterally

(Phase 3)

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

- marker: `$HOME/.claude/autonomous-active/autonomous-task-redesign-v4-w4` (+ `.json` sidecar)
- worktree: `/Users/brunomaurino/projects/codirity/.claude/worktrees/rv4-w4`
- worktree_entry: `path` (teardown = `ExitWorktree({action:"keep"})` + `git worktree remove`)
