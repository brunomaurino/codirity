# autonomous-bundle-loop session notes — redesign-v4 ("The Number That Doesn't Move")

**HANDOFF:** `docs/HANDOFF-redesign-v4.md`
**Plan-name:** `redesign-v4`
**Started:** 2026-08-18 (session `0556b7db-856d-4488-8df1-2cd5c38953b2` — the same session that
shipped v3's V5–V8, took Bruno's rejection of v3 as AI slop, ran the three-critique mockup cycle,
and got the v4 direction approved).
**Merge policy:** FULL auto-merge, every bundle — Bruno approved the exact visual system live (the
v4 direction artifact, three design critiques deep) BEFORE this HANDOFF existed, then said "me
gusta, armá el HANDOFF v4 y arrancá los bundles" (2026-08-18). The process failure of v1/v2/v3
(build first, show last) is fixed by the mockup-first gate having already happened.
**The contract:** `docs/redesign-v4/approved-mockup.html` (committed at `d7a8b5b` with the Apfel
Grotezk fonts + OFL license). Mockup wins visual disagreements; `offer.ts` wins factual ones.
**gh account:** `brunomaurino` (verified at loop start; re-verify before every push — it silently
reverts to `brunoiwp`).
**Driver model note:** the operator switched this session to Fable 5 mid-day and chose to keep it
for the loop after the skill's "don't drive on Fable" policy was surfaced. Sub-agent tiers are
pinned per role regardless (finders opus, volume sonnet, judges fable→opus), so review quality is
unaffected; only driver-side pool burn is higher.

## Bundle list snapshot at start

| Bundle | Scope | Depends on | Status |
|---|---|---|---|
| W0 | Foundation flip (Apfel, v4 tokens, single-theme, scale, reveal system, bands) | — | `[ ]` not started |
| W1 | Hero + nav + folio constant | W0 | `[ ]` not started |
| W2 | Terms band replaces Pricing | W0 | `[ ]` not started |
| W3 | Queue scene (signature motion) | W0 | `[ ]` not started |
| W4 | Case studies + clients strip | W0 | `[ ]` not started |
| W5 | Services + How it works + founder + FAQ | W0 | `[ ]` not started |
| W6 | Ownership + close + footer + retirement sweep + final gate | W0–W5 | `[ ]` not started |

## Decisions made by the orchestrator

- Step-0 probes reused from this session's earlier bundles (same build, same session): Workflow ✅,
  Agent ✅, args round-trip ✅, effortTiers ✅, `customAgents` **false** (scoped-only resolution —
  the V6 CLEAN-while-dead incident), worktreeNative ✅.
- Every bundle's battery gets the §0 trap list injected via `--review-context` at invocation time,
  on top of what the launch command already carries.

## PR ledger across bundles

| Bundle | PR | Merge SHA | Review battery | Notes |
|---|---|---|---|---|

## Cross-bundle drift / surfaced concerns

(accumulates during the run)

## Durable handles

- marker: /Users/brunomaurino/.claude/autonomous-active/autonomous-bundle-loop-redesign-v4 (+ .json sidecar)
- external watchdog: loaded (com.claude.autonomous-watchdog)
- heartbeat_pid: 95751 (bg task `bcuix6w8p`)
- cron: 39880892 (*/17)
- dashboard: https://claude.ai/code/artifact/5dce4966-9e4c-43d1-893f-839155990869
- dashboard generator: <scratchpad>/gen-dashboard-v4.py (+ dashboard-v4-state.json)
