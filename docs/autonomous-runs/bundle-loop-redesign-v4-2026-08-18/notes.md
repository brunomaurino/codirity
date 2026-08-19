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
| W0 | Foundation flip (Apfel, v4 tokens, single-theme, scale, reveal system, bands) | — | `[x]` complete (PR #28, 087a20c) |
| W1 | Hero + nav + folio constant | W0 | `[x]` complete (PR #29, c79249b) |
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
| W1 | [#29](https://github.com/brunomaurino/codirity/pull/29) | `c79249b` | 42 raw → 11 confirmed (2 BLOCKER, 5 MAJOR, 4 MINOR), 0 refuted, 66 areas examined, 0 deferrals; all 11 applied | The battery earned its keep twice over. BLOCKER 1: the header's tone was driven by `scrollY > 50` — no relationship to the ground — rendering chalk-on-white (~1.1:1) on /privacy and a hard white bar over 90% of the hero's depth; replaced with a hero-sentinel IO. BLOCKER 2: the builder's 1040px breakpoint failed at exactly 1040 **by −0.59px** — the same unmeasured-boundary error class the builder credited himself with catching in the mockup, reintroduced one breakpoint over; now 1100, measured in-browser at the boundary. Also: the `.in`-gated hero entrance blanked the LCP until hydration (now pure CSS keyframes); the price was HARDCODED in the ledger and folio while comments claimed derivation; brass leaked onto "flat". The boundary lesson is now recorded as binding on W2+. NOTE: repo does not allow PR auto-merge (enablePullRequestAutoMerge off) — direct `gh pr merge --squash` used from W1 on |
| W0 | [#28](https://github.com/brunomaurino/codirity/pull/28) | `087a20c` | 40 raw → 15 deduped → 15 confirmed (8 MAJOR, 7 MINOR), 0 refuted, 62 areas examined, 0 deferrals; all 15 applied | Foundation flip under live consumers. Battery's headline catches: the `--gray-900` re-point LIGHTENED the ink band and sank `text-brand-light` under AA — while the same diff deleted the comment that warned about that exact pair; the OG image was still painting the v3 gradient at weight 800; the reduced-motion kill-list covered only the new (consumer-less) system while ~15 live animations kept running, and killing entrance animations naively would have left `opacity-0` content invisible; Preflight's `strong{bolder}` synthesized faux-700 past the weight remap. Perf: the flip made the site SMALLER (doc −653 B gz, JS −1.5 KB) and dropped the Google-Fonts dependency — doc 30,965 gz is the plan baseline. Also: Tailwind v4 scans DOCS for classes — a historical sample in design-system.md kept a dead utility compiling |

## Cross-bundle drift / surfaced concerns

(accumulates during the run)

## Durable handles

- marker: /Users/brunomaurino/.claude/autonomous-active/autonomous-bundle-loop-redesign-v4 (+ .json sidecar)
- external watchdog: loaded (com.claude.autonomous-watchdog)
- heartbeat_pid: 95751 (bg task `bcuix6w8p`)
- cron: 39880892 (*/17)
- dashboard: https://claude.ai/code/artifact/5dce4966-9e4c-43d1-893f-839155990869
- dashboard generator: <scratchpad>/gen-dashboard-v4.py (+ dashboard-v4-state.json)
