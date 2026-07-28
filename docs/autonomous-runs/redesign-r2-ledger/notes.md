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
| Benefits & employer overhead /mo | **$6,000** | BLS ECEC: private-industry benefits = 29.8% of total comp (June 2025 release) → 29.8/70.2 ≈ 0.4245 of wages → 0.4245 × $14,300 = $6,070 → rounded DOWN *(formula corrected per review: the earlier note showed the pre-rounded ratio 0.424, whose product is $6,063 — the shipped $6,000 is below both)* |
| Time to a signed offer | **~9 weeks** | Workable global engineering time-to-fill ≈ 62 days = 8.86 weeks → "~9 weeks" is nearest-week rounding (slightly UP), and still understates the senior case, which runs slower than the all-engineering average |

Every DOLLAR figure is rounded DOWNWARD to the nearest $100 (against our own argument), so the
receipt understates the hire cost; the one time figure rounds to the nearest week, stated as
approximate ("~").
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

Battery `wf_7a5eafab-037` (2 adv + 2 QA, 3 voters): **6 raw → 5 unique → 5 confirmed, 0 refuted.
59 areas examined. 0 deferrals, 0 escalations. All 5 applied.**

| # | Sev | Finding | Resolution |
|---|---|---|---|
| 1 | MAJOR | `$3,995/mo` hardcoded in the receipt, duplicating the Standard tier price — silent drift if the tier changes | Now derived: `` `${tiers[0].price}${tiers[0].period}` `` — single source of truth restored |
| 2 | MAJOR | The green ✓ rendered GRAY in dark mode: `dark:text-gray-200` beat `text-brand` in the cascade | Value color now branches exclusively — the check row is `text-brand` in both themes, with a comment naming the cascade bug it prevents |
| 3 | MINOR | Notes formula showed `0.424 × 14,300 = 6,070` (actually 6,063) | Corrected to the unrounded ratio 0.4245; shipped $6,000 is below both |
| 4 | MINOR | "Every rounding is downward" was false for `~9 weeks` (8.86 → 9 rounds up) | Notes now state: dollar figures round down; the time figure is nearest-week, marked "~", and still understates the senior case |
| 5 | MINOR | Green-✓ was gated on string equality (`value === "✓"`) — any future "✓" would silently go green | Explicit `check?: boolean` flag on LedgerRow; the config row sets it deliberately |

The battery independently re-derived all four figures by hand AND re-confirmed the sources live
(OES p75 $171,980; ECEC 29.8%; Workable 62 days) — the arithmetic on the credibility centerpiece
is verified twice over.

## Areas examined and rejected

**59 areas** (full list in `wf_7a5eafab-037`); highlights: all four derivations recomputed by
hand against live sources; footnote markers 1:1; benefits deletion complete (zero dangling refs,
tsc clean, no `#benefits` anchors, no orphaned lucide imports); RC's reveal-stagger guard covers
the new section; no rounded classes inside the artifact; dotted leaders aria-hidden with correct
reading order; server-component purity; `Offer.benefits` had no external consumer; voice check
clean on the new section copy.

## Items deferred from this PR

**None — all review findings resolved.**

## Durable handles

- `marker: $HOME/.claude/autonomous-active/autonomous-task-redesign-r2-ledger`
- `worktree: /Users/brunomaurino/projects/codirity/.claude/worktrees/redesign-r2-ledger`
- `worktree_entry: name`
- `cron: (none — bundle-loop owns ef65bb95)`
- `battery_run_id: wf_7a5eafab-037`
