# Autonomous run — feat/redesign-r2-ledger (redesign Bundle 4 / R2)

Started: 2026-07-28T17:03:57Z

## Task description

> Redesign Bundle R2 — the Ledger (cost comparison as a receipt, all figures SOURCED per D4) +
> delete the Benefits grid, folding its surviving content per spec.
> `--bundle-id 4 --plan-slug redesign`

## Execution context

- Probes reused (same session/build): Workflow ✓, Agent ✓, args ✓, effortTiers ✓,
  **customAgents: false**, worktreeNative ✓. Watchdog: bundle-loop's `ef65bb95`.
- Prefix **B4** · identifier **redesign Bundle 4**. Worktree `redesign-r2-ledger` (name form),
  branch `feat/redesign-r2-ledger` off `9699f6f` (includes R0+R1+RC).
- Incoming commitments: none.

## Sourced figures (the D4 gate — retrieved 2026-07-28)

| Line | Value shipped | Source + derivation |
|---|---|---|
| Senior salary /mo | **$14,300** | BLS OES 15-1252, 2025 data (via O*NET national wages): 75th percentile $171,980/yr as the senior proxy (median $135,980; p90 $214,670) → ÷12 = $14,331 → rounded DOWN |
| Recruiter fee (amortized) /mo | **$1,400** | Standard 20% contingency on year-one salary ÷ 24-month expected tenure: 0.20 × $171,980 ÷ 24 = $1,433 → rounded DOWN |
| Benefits & employer overhead /mo | **$6,000** | BLS ECEC: private-industry benefits = 29.8% of total comp (June 2025 release) → ≈42.4% of wages → 0.424 × $14,300 = $6,070 → rounded DOWN |
| Time to a signed offer | **~9 weeks** | Workable global engineering time-to-fill ≈ 62 days; senior roles run slower — "~9 weeks" understates the senior case |

Every rounding is DOWNWARD (against our own argument), so the receipt understates the hire cost.
The storytelling draft's placeholder figures ($14,500 / $2,100 / $3,400 / 8–12 wks) were replaced
by these sourced ones — notably overhead ROSE from the placeholder ($3,400 → $6,000) because the
ECEC ratio is higher than the draft guessed; the placeholder was never shipped anywhere.

The footnote line renders the sources + retrieval date in mono under the receipt, per the
storytelling §6 spec.

## Task interpretation (Phase 1.5)

**Deliverable.** (1) `CostLedger` typed config in offer.ts with the sourced figures + footnote;
(2) new server component `src/components/sections/Ledger.tsx` rendering the receipt artifact
(mono, hairline, dotted leaders, zero JS) with the section header in voice; per storytelling §6
footnote 4, the Codirity side says "first card starts — the day you subscribe" (D5 unresolved, so
no "this week" capacity claim); (3) **Benefits deleted end-to-end**: component, barrel entry,
`benefits` array + `Benefit` interface + `sections.benefits` + `Offer.benefits`, page.tsx mount —
with the Ledger mounted at Benefits' old position (after Services, before RecentWork). Grep-verify
no `#benefits` anchors exist before deletion.

**Acceptance.** Gates green; SSR carries the receipt lines + footnote; every dollar figure on the
page traces to the table above; no `benefits` references remain; banned grep zero; perf delta
reported; §5 checklist honest.

## Decisions made unilaterally

- **D-R2-1 — Senior proxy = OES 75th percentile.** "Senior" is not a BLS band; the 75th
  percentile of the occupation is the conservative, explainable mapping (p90 would overstate).
  Stated in the footnote so the mapping is auditable.
- **D-R2-2 — Time line is "time to a signed offer ~9 weeks"**, not the draft's "time to first
  shipped automation 8–12 wks": the sourced datum (Workable 62-day engineering time-to-fill)
  measures exactly offer-to-fill, and claiming ramp-up time on top would need a source we don't
  have. The narrower, checkable claim wins; it also pairs cleanly with "first card starts the day
  you subscribe".
- **D-R2-3 — ECEC private-industry ratio (29.8%), not civilian (31.6%)**: private industry is the
  correct comparator for a company hire; it is also the LOWER ratio (conservative).
- **D-R2-4 — Ledger takes Benefits' slot** (after Services, before RecentWork) with section id
  `ledger`. No anchors referenced `#benefits` (grep-verified), so the id can vanish safely.

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

- `marker: $HOME/.claude/autonomous-active/autonomous-task-redesign-r2-ledger`
- `worktree: /Users/brunomaurino/projects/codirity/.claude/worktrees/redesign-r2-ledger`
- `worktree_entry: name`
- `cron: (none — bundle-loop owns ef65bb95)`
