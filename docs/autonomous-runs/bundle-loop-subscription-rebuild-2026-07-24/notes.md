# Bundle-loop session notes — subscription-rebuild

- **HANDOFF:** `docs/HANDOFF-subscription-rebuild.md`
- **Plan-name:** `subscription-rebuild`
- **Started:** 2026-07-24
- **Orchestrator worktree / parent-repo:** `/Users/brunomaurino/projects/codirity`
- **Repo:** `brunomaurino/codirity` (main unprotected; Vercel auto-deploys `main` → prod)
- **GH identity:** active account switched `brunoiwp` → `maurino72` for the run (WRITE on repo,
  per ground-rule 9). Restore to `brunoiwp` at loop exit (Phase 3).
- **Merge policy:** FULL unattended auto-merge for all 7 bundles, authorized by Bruno in-session
  (ground-rule 9). Each merges on green gate (lint + tsc + next build) after its review battery.

## Bundle list snapshot at start (§2)

| Bundle | Scope | Status |
|---|---|---|
| 0 | Fix server rendering (remove ThemeProvider mount-gate) | [ ] not started |
| A | SEO & metadata foundation (OG, sitemap, robots, JSON-LD) | [ ] not started |
| B | Offer config source of truth (`src/config/offer.ts`) | [ ] not started |
| C | Hero + How it works + What we build + Benefits (S1–S4) | [ ] not started |
| D | Pricing two-tier + Stripe + Recent work (S5–S6) | [ ] not started |
| E | FAQ + JSON-LD FAQPage + Book a call + Footer (S7–S9) | [ ] not started |
| F | Analytics events + performance close-out + acceptance | [ ] not started |

Bundle-id mapping (ordinal in §2): 0→0, A→1, B→2, C→3, D→4, E→5, F→6.
`--plan-slug subscription-rebuild` passed to every autonomous-task.

## Run infrastructure

- Heartbeat: background task `bwpehewa7`, HEARTBEAT_PID=54211 (30-min interval).
- Resume-watchdog: CronCreate job `68c4211a` (*/15, idle-gated). CronDelete at loop exit.
- Other autonomous-active markers present at start (not mine, left untouched):
  `autonomous-task-feat-onboarding-cap-table-collapse`, `autonomous-task-reports-rd1-deltas`.
- Status dashboard: https://claude.ai/code/artifact/2f247ee0-f635-4601-870d-7267de77cbe5
  (scratchpad file `bundle-loop-subscription-rebuild-dashboard.html`; redeploy at bundle boundaries).

## PR ledger

- **Bundle 0** — PR [#1](https://github.com/brunomaurino/codirity/pull/1) MERGED at `f04838a` (squash).
  Status update: `877c4e1`. Battery: 3 MINOR (2 applied, 1 resolved-by-analysis), 0 deferrals.
- **Bundle A** — PR [#2](https://github.com/brunomaurino/codirity/pull/2) MERGED at `3ca3d9f` (squash).
  Status update: `00c4d16`. Battery: 2 MAJOR (both applied: per-page canonical + privacy title),
  0 refuted. 1 planned deferral: B1-D-jsonld1 (Service.offers + FAQPage JSON-LD → Bundle E).
- **Bundle B** — PR [#3](https://github.com/brunomaurino/codirity/pull/3) MERGED at `b24bb2d` (squash).
  Status update: `d4e8348`. Battery: 2 MAJOR + 2 MINOR (all applied: accurate guarantee title,
  numeric priceAmount+CURRENCY for JSON-LD, de-dup task line, /mo period), 0 refuted, 0 deferrals.
  offer.ts is the source of truth for C/D/E; priceAmount readies B1-D-jsonld1 for Bundle E.
- **Bundle C** — PR [#4](https://github.com/brunomaurino/codirity/pull/4) MERGED at `59b2287` (squash).
  Battery: 5 MINOR (all applied: offer-sourced scope labels, Benefits hover group, trust-line
  stagger, accurate "Book an intro call" CTA since the Cal event is 30-min), 0 refuted, 0 deferrals.
  Hero flipped to subscription positioning; offer.ts extended with hero/sections/scopeLabels copy.
- **Bundle D** — PR [#5](https://github.com/brunomaurino/codirity/pull/5) MERGED at `f627236` (squash).
  Battery: 1 MAJOR + 1 MINOR (both applied: OG image copy flipped subscription-forward, Pricing
  header from offer.sections.pricing), 0 refuted, 0 deferrals. Two-tier pricing + Stripe env-wired
  CTAs + founding banner + guarantee; metadata/OG flipped subscription-forward (closes Bundle A's
  deferral). ⚠️ NOTE: a GitHub Pull Requests MAJOR OUTAGE (documented incident, ~33 min of HTTP 500
  on PR-create) delayed opening PR #5 — rode it out with patient retries per the transient-error
  doctrine (branch was safely pushed; no work lost).

## Orchestrator decisions

- 2026-07-24 loop start: switched gh active account to maurino72 (documented above).
- Merge gate: the Claude Code auto-mode classifier blocked `gh pr merge`; operator GRANTED merge
  permission (AskUserQuestion, 2026-07-24) → loop runs unattended through all 7 bundles.

## Cross-bundle drift / surfaced concerns (carry into every remaining bundle)

1. **node_modules symlink is INCOMPATIBLE with Next 16 Turbopack** — `next build` panics
   ("Symlink node_modules is invalid, it points out of the filesystem root"). Do NOT symlink;
   run a real `npm ci` in each bundle's worktree instead (adds ~30s). Applies to A–F.
2. **gh active account intermittently reverts to `brunoiwp`** (a different concurrent session
   switches it). RE-ASSERT `gh auth switch --user maurino72` immediately before EVERY gh write
   (pr create / merge / status push). brunoiwp lacks merge permission on the repo.
3. **Vercel PREVIEW deployments have Deployment Protection** (login wall) — unauthenticated curl
   of a preview URL returns Vercel's login page. Verify the ground-rule-8 script-stripped
   acceptance on the LOCAL production build (`next build` + `next start`), not the preview.
   Production (`www.codirity.com`) is public and can be checked post-merge.
4. **Repo is `npm`** (package-lock.json), not pnpm — use `npm ci` / `npm run build|lint`.
