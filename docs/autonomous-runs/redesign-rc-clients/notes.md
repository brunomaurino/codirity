# Autonomous run — feat/redesign-rc-clients (redesign Bundle 3 / RC)

Started: 2026-07-28T16:33:14Z

## Task description

> Redesign Bundle RC — clients ledger (eDairyCorp · Meshio · Vivi). Framing approved by Bruno
> 2026-07-28: Option A "Already on the board", provenance tags client/ours, Vivi honestly
> pre-launch, closer row "next row: yours_". Section under the hero, artifact treatment, all
> strings in offer.ts, server component. `--bundle-id 3 --plan-slug redesign`

## Execution context

- Probes reused (same session/build): Workflow ✓, Agent ✓, args ✓, effortTiers ✓,
  **customAgents: false**, worktreeNative ✓. Watchdog: bundle-loop's `ef65bb95`.
- Prefix **B3** · identifier **redesign Bundle 3**. Worktree `redesign-rc-clients` (name form),
  branch `feat/redesign-rc-clients` off `9c9a4ac` (includes R0+R1).
- Incoming commitments: none (R0/R1 shipped with zero deferrals).

## Task interpretation (Phase 1.5)

**Deliverable.** (1) `ClientEntry` interface + `clients` array + `sections.clients` copy in
`offer.ts`, carrying the APPROVED storytelling §1 strings: intro (Option A), one ledger row per
venture (name · tagline · provenance tag `client`/`ours` · status · detail line), and the closer
`next row: yours_`. (2) New server component `src/components/sections/Clients.tsx` rendering the
section as a hairline/mono artifact — filled green dot for in-production (eDairyCorp, Meshio),
outlined green for Vivi's pre-launch, provenance as bordered mono chips; closer row reuses the
`.wb-caret` blink. (3) Mounted in `page.tsx` directly after `<Hero />`; barrel export updated.
No client JS, no new events, no new deps.

**Acceptance.** Gates green; SSR-stripped HTML carries the intro, the three rows with their
provenance tags, and the closer; banned-word grep zero; §5 checklist; perf delta reported;
the honesty constraints hold (Vivi visibly pre-launch, `ours` tags visible, no fake-client
framing anywhere).

## Decisions made unilaterally

- **D-RC-1 — Section id is `clients` and sits between Hero and Process.** "Directly under the
  hero's proof line" per the launch command; the nav is untouched (nav links are R-scope frozen).
- **D-RC-2 — Vivi's dot is OUTLINED GREEN (the in-progress treatment), not gray.** Pre-launch
  means actively being built — the same semantic as the hero vignette's in-progress row; gray
  outlined is reserved for queued/inert. Consistent with green-means-live.
- **D-RC-3 — The longer §1b story paragraphs are NOT rendered here.** The approved section spec
  is ledger rows + intro + closer; the 3-line stories belong to R8's case studies. Rows carry the
  two-line ledger format from the storytelling doc verbatim (lightly cased for the UI).
- **D-RC-4 — The closer row is plain text (mono + caret), not a link.** Making it a CTA would
  add an analytics decision (new event) that is out of scope; the contact CTAs 300px below carry
  the conversion. Revisit if funnel data says the section needs its own CTA.

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

- `marker: $HOME/.claude/autonomous-active/autonomous-task-redesign-rc-clients`
- `worktree: /Users/brunomaurino/projects/codirity/.claude/worktrees/redesign-rc-clients`
- `worktree_entry: name`
- `cron: (none — bundle-loop owns ef65bb95)`
