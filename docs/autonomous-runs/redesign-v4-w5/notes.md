# autonomous-task run notes — redesign-v4 Bundle W5 (services, process, founder, FAQ)

**Started:** 2026-08-19T18:40:00Z

## Execution context

- Probes reused (session `0556b7db`, which ran W2–W4): Workflow ✅ Agent ✅ args ✅ effortTiers ✅
  **customAgents FALSE** (V6 incident) · worktreeNative ✅.
- Prefix `B406`, identifier **`redesign-v4 Bundle 406`**. Branch `feat/redesign-v4-w5` off
  `origin/main` @ `e8a1744` (carries W0–W4). `cp -Rl` node_modules.
- Worktree `/Users/brunomaurino/projects/codirity/.claude/worktrees/rv4-w5`, `worktree_entry: path`.

## Task description (echoed)

Match the approved mockup's paper-ground run: What we build as the full-width ruled list (ALL 7
`included[]` + ALL 5 `notIncluded[]` verbatim — v3 shipped a paraphrase and a dropped item),
declined rows at .42 opacity with the self-drawing strike and "we say no"; How it works as the three
`howItWorks[]` steps (01/02/03 is legitimate — it IS a sequence); the founder block promoting the
"Who does the work?" FAQ answer to a display-size quote (text only, NO photo/avatar, §1.8); the FAQ
as the ruled details/summary accordion with ALL 12 entries (founding entry gated + interpolated),
preserving the always-in-DOM/JSON-LD parity invariant and `faq_opened`. The dark→paper `.band`
enters before this run and the paper→dark band exits after it. Services hover moves the inner span
via transform, never padding.

## Task interpretation (Phase 1.5 prompt-pinning)

**Deliverable.** One PR rewriting `Services.tsx`, `Process.tsx`, `About.tsx` (as the founder block)
and `Faq.tsx` in the v4 paper treatment, adding the `.svc-list/.steps/.founder/.faq` CSS, and
placing the two `.band` gradients that bound the paper run in `page.tsx`.

**Acceptance test.**
- All **7** `included[]` and all **5** `notIncluded[]` render, each string **character-identical**
  to `offer.ts` — asserted in BOTH directions, so a paraphrase or a dropped item fails (v3 shipped
  exactly those two defects).
- All **12** `faq[]` entries render question AND answer **in the server HTML**, and the set matches
  the FAQPage JSON-LD exactly — the parity invariant the current component's docstring protects.
- `faq_opened` still fires once per open, with the question payload.
- The founder quote is `faq[0].answer` composed from `offer.ts`, not a copy; no photo, no avatar.
- Declined rows carry the self-drawing strike and "we say no"; the strike is `transform: scaleX()`,
  never a width animation, and reduced-motion / no-JS leave it drawn.
- Services hover moves the inner span by `transform`, never padding (a padding hover reflows the
  row and drags every sibling).
- The paper run is bounded by `.band-dl` entering and `.band-ld` leaving — no hard ground cut.
- Standard gates + perf delta on the prerendered document.

## Plan

**Step 0 — cross-run commitments.** `redesign-v4-w4/commitments.md § Target: redesign-v4 Bundle W5`
carries five awareness items, all directly binding here: run the orphaned-animation CSS gate after
adding motion (the strike is new motion); re-derive hand-set line breaks for the REAL strings and
measure at the gutter boundary; `.d-*` needs `display`; use `--chalk-faint` rather than stacking
opacity — **note the declined rows are specified at `.42` opacity**, which needs measuring on PAPER
(the token is a dark-ground token); and `.band-ld`/`.band-dl` are now in use and this bundle owns
their placement.

**Files.** `src/components/sections/Services.tsx`, `Process.tsx`, `About.tsx`, `Faq.tsx`,
`src/app/page.tsx`, `src/app/globals.css`, `scripts/w5-*.py`.

**Open questions resolved.**

1. **`<details>` vs the current button+grid accordion.** The mockup uses native
   `<details>/<summary>`. That PRESERVES the parity invariant — `<details>` content ships in the
   server HTML and is crawlable — while deleting a pile of state, ARIA wiring and a JS-only
   disclosure. `faq_opened` moves to the native `toggle` event. Chosen over keeping the custom
   accordion: it is less code, works with no JS at all, and the invariant that mattered is intact.
2. **Does the founder block duplicate the FAQ answer?** Yes, deliberately — the brief says "promote
   the 'Who does the work?' FAQ answer to a display-size quote". It composes from `faq[0].answer`
   rather than repeating the string, so the two can never drift. The W4 lesson (a restatement is a
   duplicate, not a fact) does NOT apply: here the repetition is the specified device, and the two
   renderings are far apart on the page.
3. **`.42` opacity on declined rows vs the no-stacked-opacity commitment.** W3/W4's rule is about
   text that must stay readable on the DARK ground. These rows are on PAPER and are deliberately
   de-emphasised — but they are still readable content, so the resulting contrast gets MEASURED,
   and if `.42` lands under AA it becomes an explicit ink token like `--chalk-faint` did.
4. **01/02/03 numbering.** Legitimate per the brief because it IS a sequence — and it composes from
   `howItWorks[].number`, not from the map index, so config stays the source.

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

- marker: `$HOME/.claude/autonomous-active/autonomous-task-redesign-v4-w5` (+ `.json` sidecar)
- worktree: `/Users/brunomaurino/projects/codirity/.claude/worktrees/rv4-w5`
- worktree_entry: `path` (teardown = `ExitWorktree({action:"keep"})` + `git worktree remove`)
