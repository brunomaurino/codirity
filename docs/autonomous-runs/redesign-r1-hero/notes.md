# Autonomous run — feat/redesign-r1-hero (redesign Bundle 2 / R1)

Started: 2026-07-28T15:02:08Z

## Task description

> Redesign Bundle R1 — hero workbench vignette. Replace HeroCards with the terminal-queue
> vignette (pure CSS/SSR), promote "pause or cancel any month · no contracts" to hero microcopy,
> move the pedigree line into the hairline-topped proof line. Keep H1 + both CTAs (instrumented).
> `--bundle-id 2 --plan-slug redesign`

## Execution context

- Probes reused from this session (same build): Workflow ✓, Agent ✓, args ✓, effortTiers ✓,
  **customAgents: false**, worktreeNative ✓. Watchdog owned by bundle-loop (`ef65bb95`).
- Prefix **B2** · identifier **redesign Bundle 2**. Worktree `redesign-r1-hero` (name form),
  branch renamed to `feat/redesign-r1-hero` off `4fbeabf` (includes R0's merged voice pass).
- Incoming commitments: none (R0 produced zero deferrals).

## Task interpretation (Phase 1.5)

**Deliverable.** (1) New server component `src/components/sections/HeroWorkbench.tsx` rendering
the approved queue vignette (storytelling §2: rows #231–#235 + prompt line) as a mono/hairline
artifact — green dots ONLY on shipped rows, CSS-only typing cursor with a
`prefers-reduced-motion` static fallback; it replaces `<HeroCards />` in Hero.tsx and
HeroCards.tsx is deleted. (2) Hero microcopy line (mono) under the CTA row with the exact string
"pause or cancel any month · no contracts". (3) The pedigree line moves out of the CTA column
into a hairline-topped proof line spanning the hero bottom, with the approved string (singular,
no n8n, Córdoba). (4) Vignette visible on ALL breakpoints — stacks below the copy on mobile with
rows 4–5 hidden (reduced height per spec; the old HeroCards was desktop-only, `hidden lg:block`).
Queue rows + proof-line segments live in `offer.ts` as typed config, matching the repo's
single-source-of-truth ground rule.

**Acceptance.** Gates green; SSR-stripped HTML carries the queue rows, microcopy, and proof line;
`hero_cta_click` still fires; perf delta vs the 200.8 KB gz baseline reported in the PR; §5
checklist honest; reduced-motion query present in the shipped CSS.

## Decisions made unilaterally

- **D-R1-1 — Queue data and proof line are typed config in offer.ts** (`workbenchQueue`,
  `proofLine`, `hero.microcopy` replacing `trustLine`), not hardcoded JSX — ground rule 1 of the
  original plan ("never hardcode a price, URL, or copy string in a component").
- **D-R1-2 — Vignette shows on mobile** (3 rows + prompt) instead of inheriting HeroCards'
  desktop-only behavior: the vignette IS the thesis image (HANDOFF §6.R1) and mobile is most of
  the traffic; the reduced-height stacking is exactly what the spec prescribes.
- **D-R1-3 — Day figures kept on shipped rows** (`· 1d`…`· 4d`): approved in the storytelling doc
  and traceable to the day-log record; the vignette is labeled by its own content as
  illustrative (generic labels, no client names).

## Stop attempts

_(none)_

## Drift flags

_(none)_

## Round-skip requests

_(none)_

## Review findings + resolutions

Battery `wf_227b3048-935` (2 adv + 2 QA, 3 verify voters): **14 raw → 5 unique → 5 confirmed,
0 refuted. 58 areas examined. 0 deferrals, 0 escalations. All 5 applied.**

| # | Sev | Finding | Resolution |
|---|---|---|---|
| 1 | MAJOR | **The blinking caret was invisible in every rendering state** — `::after` on the clipped typing span lands at [17ch,18ch), outside the `overflow:hidden` box. Confirmed by all 7 finder sources | Caret moved to a sibling span of the clipped element; as the width animates, the caret rides the typing edge. Verified visible in the browser after the fix |
| 2 | MAJOR | Proof line shipped "Córdoba, AR — working your timezone" — an unapproved clause beyond Bruno's resolved string, and false for most visitors | Trimmed to the approved "Córdoba, AR" |
| 3 | MAJOR | Prompt text hardcoded in JSX (source-of-truth violation) with the 17ch/steps(17) coupling enforced only by a comment | `workbenchPrompt` exported from offer.ts; width + step count now derived mechanically (`--wb-w` custom property + inline `animation-timing-function` from `.length`) — a copy edit cannot desynchronize the animation |
| 4 | MINOR | aria-label hardcoded the queue's composition (stale after any config refresh) | Label now composed from `workbenchQueue` counts at render |
| 5 | MINOR | Docstring claimed "the only green is the shipped dot" while the code also greens the in-progress outline, ▸, and caret (all sanctioned by §1 rule 2's status-dots + active-line carve-out) | Docstring now names exactly the sanctioned green elements |

## Areas examined and rejected

**58 areas** examined by the battery (full list in `wf_227b3048-935`); highlights: server-component
purity (no hooks/handlers — no hydration risk); no dangling HeroCards/trustLine references
(runtime greps clean; remaining hits are historical docs); 17-char count verified exact;
`animation-delay-700` added once (the pre-existing delay-600 duplicate is on main, untouched);
green-discipline verdict — outlined in-progress dot and active-line green are *within* §1 rule 2;
queue rows match the approved storytelling strings exactly, no client names, no fabricated
numbers; pedigree preserved across proof line + meta + FAQ + About; width animation causes no
CLS (fixed-height single-line row); reduced-motion fallback correct.

## Items deferred from this PR

**None — all review findings resolved.** (0 proposed deferrals.)

## Durable handles

- `marker: $HOME/.claude/autonomous-active/autonomous-task-redesign-r1-hero`
- `worktree: /Users/brunomaurino/projects/codirity/.claude/worktrees/redesign-r1-hero`
- `worktree_entry: name`
- `cron: (none — bundle-loop owns ef65bb95)`
- `dev_server_pid: 47301 (stopped)`
- `battery_run_id: wf_227b3048-935`
