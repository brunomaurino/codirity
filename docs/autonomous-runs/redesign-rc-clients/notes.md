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
  is ledger rows + intro + closer; the 3-line stories belong to R8's case studies. Rows follow the
  storytelling doc's two-line ledger FORMAT; the intro is verbatim, while two detail lines
  (Meshio, Vivi) are faithful paraphrases drawn from the same doc's approved §1b narrative rather
  than character-for-character copies of its mono block — every claim still traces to the doc.
  (Wording corrected per review finding: the original note overclaimed "verbatim".)
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

Battery `wf_4f6ace47-eec` (2 adv + 2 QA, 3 verify voters): **3 raw → 3 unique → 3 confirmed,
0 refuted. 64 areas examined. 1 escalation (resolved: applied). All 3 applied.**

| # | Sev | Finding | Resolution |
|---|---|---|---|
| 1 | MINOR (escalation) | Inserting the section shifts the `.reveal:nth-child` stagger of later sections (Services 0.4→0.5s; Benefits falls off the ladder to 0s) — a latent mis-scoped selector this PR's insertion exposes. Defense forced apply; coop argued impact is null-to-positive and deferral credible | **Applied** per the unattended-run anti-deferral default (reversible, ~6 lines). `main > .reveal:nth-child(n) { transition-delay: 0s }` pins every top-level section to a uniform delay, so page reorders can never reshuffle reveal timing again; the grid-item stagger (the rule's intended target) is untouched |
| 2 | MINOR | Status-dot classes duplicated between HeroWorkbench and Clients — no shared source of truth for the green-means-live grammar | Extracted `ui/StatusDot` (`live`/`active`/`inert` variants); both components now consume it |
| 3 | MINOR | notes.md D-RC-3 overclaimed "verbatim" for detail lines that are faithful paraphrases | Wording corrected in the decision entry |

**Escalation disposition (recorded per protocol):** the battery's cooperative defender disagreed
with the forced apply (its case: no user-observable degradation, pre-existing debt). No operator
was available mid-loop; the decision is reversible; the anti-deferral default says apply. Applied,
with the coop reasoning preserved here so Bruno can revert one small CSS block if he prefers the
accidental stagger.

## Areas examined and rejected

**64 areas** (full list in `wf_4f6ace47-eec`); highlights: intro copy is character-for-character
the approved Option A; every row claim traced to the storytelling doc / brain record (27 dead
URLs, est. 2003, Stripe seller tiers, Meshio onboarding narrative); outlined-green pre-launch dot
is the system's established in-motion semantic, not a new invention; server-component purity; no
anchor collision on `#clients`; JSON-LD untouched; SectionHeader props valid post-R0; `.wb-caret`
exists on this branch and renders standalone; provenance chips readable by screen readers with
dots aria-hidden; TS unions sound.

## Items deferred from this PR

**None — all review findings resolved.** (The battery proposed 1 deferral candidate — the reveal
stagger — which was applied instead, per the escalation disposition above.)

## Durable handles

- `marker: $HOME/.claude/autonomous-active/autonomous-task-redesign-rc-clients`
- `worktree: /Users/brunomaurino/projects/codirity/.claude/worktrees/redesign-rc-clients`
- `worktree_entry: name`
- `cron: (none — bundle-loop owns ef65bb95)`
- `battery_run_id: wf_4f6ace47-eec`
