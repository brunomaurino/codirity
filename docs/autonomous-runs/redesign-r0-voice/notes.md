# Autonomous run — feat/redesign-r0-voice (redesign Bundle 1 / R0)

Started: 2026-07-28T14:26:29Z

## Task description

> Redesign Bundle R0 — voice pass + anti-slop sweep. Rewrite ALL existing user-facing copy in
> src/config/offer.ts and section components to the §4 voice (no new sections, no layout change
> yet); replace shadow-heavy card styling with the hairline/green-discipline utilities described
> in §6.R0. Gates: lint + tsc + build + script-stripped SSR copy check + §5 checklist in PR body.
> `--bundle-id 1 --plan-slug redesign`

## Execution context

- Step-0 probes: reused from this session's PR #8 run (same main conversation, same build):
  Workflow present+callable; Agent `PROBE-OK`; args round-trip PASS; `effortTiers: true`;
  **`customAgents: false`** (the corrected value — probe (f) originally passed on the
  plugin-scoped name but the battery calls bare names, which this build does not resolve; the
  first battery invocation of the PR #8 run false-cleaned on exactly this. Do not repeat.);
  `worktreeNative: true`.
- Step 0.6 resume-watchdog: SKIPPED — `--bundle-id` set; bundle-loop's watchdog `ef65bb95` covers
  the loop.
- Origin-bundle prefix: **B1** · plan-qualified identifier: **redesign Bundle 1**.
- Worktree: `EnterWorktree` name form → `.claude/worktrees/redesign-r0-voice`, branch renamed in
  place to `feat/redesign-r0-voice` off origin/main (`0e30a60`).
- Parent node_modules synced to lockfile first (`npm install` in parent — it lacked
  `@vercel/analytics` from PR #8), then symlinked into the worktree. No new deps in this bundle.
- Parent-clean canary: only the pre-existing untracked `docs/HANDOFF-client-onboarding.md`.
- gh identity: maurino72 via per-command `GH_TOKEN`.

## Task interpretation (Phase 1.5)

**Concrete deliverable.** A copy-and-styling pass with no structural change: (1) every
user-facing string in `src/config/offer.ts` and the section components rewritten into the
HANDOFF §4 voice, using `docs/redesign-storytelling.md`'s approved drafts where they exist
(hero subhead option 1, singular "a senior engineer" everywhere including the live trust line,
week-log/no-list phrasing stays for its own bundles); (2) a `hairline` utility added to
`globals.css` plus the green-discipline sweep — decorative green washes removed so green appears
only on CTAs, status dots, and checkmarks; (3) shadow-heavy card styling on artifact-like
elements toned to hairlines. NO new sections, NO section reordering, NO Benefits deletion (that
is R2), NO FAQ extension (that is R6 — existing 6 questions get voice-rewritten only).

**Acceptance test.** `grep -riE '<banned-word list>'` over the diff returns zero; `npm run lint`,
`npx tsc --noEmit`, `npm run build` green; script-stripped SSR HTML still carries the real H1 and
section copy; §5 checklist in the PR body with every box honestly checked; visual smoke shows the
same sections in the same order with the new voice.

## Plan (Phase 2)

Incoming commitments: none (grep for `redesign Bundle 1` across sibling commitments.md → empty;
the prior plan closed with 0 open items).

**Copy inventory.** All queue-facing copy lives in `src/config/offer.ts` (hero, sections, tiers,
benefits, howItWorks, faq, guarantee, founding). Hardcoded copy found in components:
`About.tsx` (worst offender — contains "leveraging", a banned word, plus "AI isn't just the
future—it's the present" and "Let's modernize your business together"), `ContactForm.tsx`
(labels + toasts), `ContactInfo.tsx`, `HeroCards.tsx` (dies in R1 — see decisions).

**Edits planned:**
1. `offer.ts` — full §4 voice pass: hero subhead → storytelling option 1; trust line → singular;
   sections/tiers/benefits/howItWorks/faq rewritten (6 FAQ questions stay 6 — extension is R6).
2. `About.tsx` — rewrite the three paragraphs in voice; keep the two-brothers founding fact
   (it is true and it is the founder story; "a senior engineer works your queue" remains the
   operational claim elsewhere — the two coexist).
3. `ContactForm.tsx` / `ContactInfo.tsx` — light voice pass on labels/toasts.
4. `globals.css` — add the `hairline` utility (1px var(--border), square corners) for later
   bundles; green-discipline sweep of clearly-decorative washes.
5. Banned-word grep over the whole src/ tree as the final gate.

**Verification:** lint + tsc + build; script-stripped SSR check on `/`; banned-word grep = 0;
visual smoke (same sections, same order).

## Decisions made unilaterally

- **D-R0-1 — HeroCards.tsx copy is NOT rewritten.** The three floating stat cards are deleted
  wholesale by R1 (the workbench vignette replaces them). Rewriting copy that dies in the next
  bundle is churn; the §5 checklist's banned-word grep still passes because their current copy
  contains no banned words. Recorded so the reviewer knows it was seen, not missed.
- **D-R0-2 — "Two brothers" stays in About.** Bruno's "engineer (singular)" decision governs who
  works a client's queue; the About section is the founding story, and two brothers founded the
  company. The rewrite keeps the fact, kills the slop around it.
- **D-R0-3 — Green-discipline scope.** R0 removes clearly-decorative green (gradient text washes,
  tinted section backgrounds) and adds the `hairline` utility. Green on interactive elements
  (CTAs, links), status dots, and the icon tiles inside cards survives R0 — each remaining
  section gets its full artifact restyle in its own bundle (R1–R6), and ripping the icon tiles
  out now would half-redesign sections this bundle is not allowed to restructure.

## Stop attempts

_(none)_

## Drift flags

_(none)_

## Round-skip requests

_(none)_

## Review findings + resolutions

_(Phase 4/5)_

## Areas examined and rejected

_(from battery)_

## Items deferred from this PR

_(Phase 5.5)_

## Durable handles

- `marker: $HOME/.claude/autonomous-active/autonomous-task-redesign-r0-voice`
- `worktree: /Users/brunomaurino/projects/codirity/.claude/worktrees/redesign-r0-voice`
- `worktree_entry: name`
- `cron: (none — bundle-loop owns the watchdog ef65bb95; do not delete it at this bundle's teardown)`
