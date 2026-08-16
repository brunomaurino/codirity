# autonomous-bundle-loop session notes — client-onboarding

**HANDOFF:** `docs/HANDOFF-client-onboarding.md`
**Plan-name:** `client-onboarding`
**Started:** 2026-08-14 (session `9ddef8ab-5417-4799-aa93-32a4f171aaad`)
**Merge policy (O0, operator-confirmed 2026-08-14):** hard-stop for operator review on Bundles 1 and 4
(the Stripe webhook + the end-to-end wiring); auto-merge on Bundles 2/3/5.
**Merge policy AMENDED 2026-08-15 (operator, in-session):** Bundle 1 merged by the operator (PR #15,
`e75d700`). Operator is stepping away from the computer and explicitly authorized full auto-merge for
the REMAINDER of the plan, including Bundle 4 (the other originally-hard-stop bundle) — "quiero que vos
mergees todo y sigas con todo." From here on, every remaining bundle (2, 3, 4, 5) runs with auto-merge
armed; no further pause for operator review unless a genuine hard-stop (HS-1..HS-6) fires.
**gh account note:** active `gh` account on this machine is `brunoiwp`; the HANDOFF §0 push/PR identity
is `maurino72` — every `gh`/push call must be scoped `GH_TOKEN=$(gh auth token -u maurino72) gh …` per
the doc's own convention (not switching the machine's active account).
**Dashboard:** https://claude.ai/code/artifact/350a76ea-3b3c-41f0-beae-e8ae840f099a
**Heartbeat (resumed 2026-08-15 after Bundle 1 merge):** background task `bs5fc2ime`, PID `54799`, every
1800s. (Original `b84kmzw53`/PID `86399` killed when the loop paused for Bundle 1's operator review.)
**Resume-watchdog (resumed 2026-08-15):** cron job `badb362d`, every 15 min — now instructed to continue
autonomously through merge decisions per the operator's full-auto-merge authorization. (Original
`6acea15f` deleted at the same pause point.) External launchd watchdog NOT installed on this machine —
a session kill will not self-recover automatically; resume manually if that happens.

## Bundle list snapshot at start

| Bundle | Scope | Depends on | Status |
|---|---|---|---|
| 1 | Stripe webhook + idempotency store + price_id→plan map | O1, O6 | `[x]` complete |
| 2 | Trello provisioning module + seed-trello-template script | 1, O3 | `[x]` complete |
| 3 | Welcome email (Resend + React Email) | 1, O2, O9 | `[x]` complete |
| 4 | Founder ops + wire 2/3/4 into the webhook end-to-end | 2, 3, O4 | `[x]` complete |
| 5 | Lifecycle events (pause/cancel), v1.1 | 4 | `[ ]` not started |

## O-prerequisites status at launch (all resolved by the operator 2026-08-14)

- O0 merge policy: hard-stop 1 & 4, auto-merge 2/3/5
- O1 idempotency store: Upstash Redis (free tier) — env vars in Vercel (Prod+Preview) + `.env.local`
- O2 email: Resend, domain already verified, sender `support@codirity.com`
- O3 Trello: API key/token generated via a Trello Power-Up app ("Support Codirity"); workspace id
  `6a7f78e4fb6122c8f90af34c`; ops board id `qO77WeRE`; env vars in Vercel + `.env.local`
- O4 founder alert channel: email, `maurinobruno7@gmail.com` (no Slack)
- O5 access form: Tally, published at `https://tally.so/r/EkVev4`
- O6 Stripe: CLI installed + logged into the Codirity account (was previously only `edairy-test`)
- O7 credential handoff: **changed from the original plan** — Bitwarden Send (free one-time link)
  instead of a paid 1Password Business vault. HANDOFF updated 2026-08-14 (commit `93a4682`/`c658e12`)
  across §1, §4 O7, §5, Appendix B Card 6, Appendix C Q8/Q10 — matches the Tally form copy already live.
- O9 Customer Portal: deferred — operator + Claude will do this together around Bundle 3/4, does not
  block loop start.

## Decisions made by the orchestrator

- (none yet)

## PR ledger across bundles

| Bundle | PR # | Merge SHA | Status |
|---|---|---|---|
| 1 | [#15](https://github.com/brunomaurino/codirity/pull/15) | `e75d700` | ✅ merged (by operator) |
| 2 | [#16](https://github.com/brunomaurino/codirity/pull/16) | `7e44a20` | ✅ merged (auto, full authorization) |
| 3 | [#17](https://github.com/brunomaurino/codirity/pull/17) | `9c2dcb4` | ✅ merged (auto, full authorization) |
| 4 | [#18](https://github.com/brunomaurino/codirity/pull/18) | `88cd185` | ✅ merged (auto, full authorization) |

## gh account correction (Bundle 4)

The active `gh` account defaulted to `brunoiwp`, which produced "must be a collaborator" on
`gh pr create` (the repo is owned by `brunomaurino`). Fixed with `gh auth switch --user
brunomaurino` (not `maurino72` as an earlier note guessed) — that account has `repo` scope and is
already logged in via keyring. Worked cleanly for both PR creation and auto-merge. Future bundles:
run `gh auth switch --user brunomaurino` up front if PR creation fails with a collaborator error.

## Bundle 4 — review battery + escalation

Battery `wf_ef246830-3b7` (verify-voters 3): 6 MAJOR + 3 MINOR confirmed and applied (clientName
fallback consistency across board/card/alert surfaces, nodemailer timeouts, a founder alert that
now names which steps are still missing on a partial failure, `.env.example`/HANDOFF drift, safer
non-PII error logging); 1 finding refuted correctly (`inviteSent` read-back — no reachable gap). One
escalation (alert/check-in-card crash-window idempotency) came up main-thread since the operator was
away — resolved by siding with the cooperative reviewer's dissent (a naive board-scan reconcile
would be actively wrong on Bruno's manually-curated ops board) rather than force-applying. Tracked as
**B4-D-opsidempotency1**, targeting Bundle 5 (which already touches the ops board + alerts for
lifecycle events — the natural place to design this once). Full reasoning in
`docs/autonomous-runs/codirity-ob4-ops/notes.md` and `commitments.md`.

Also re-verified live, through the FULL route (not just `copyBoard()` in isolation): the mandatory
crash-after-board-copy-before-persist scenario — simulated a crash by calling `copyBoard()` directly
for a fresh synthetic event id with no Redis record, then fired a real signed webhook for the same
event id at the running dev server. Retry reconciled onto the identical board id; zero duplicates.
Test boards/card/Redis key cleaned up afterward.

## ⚠️ Second operator flag, from Bundle 3

No `RESEND_API_KEY` was available this session (creating a new Resend account is outside what I can do
myself). The welcome-email send call was verified by reading the installed SDK's actual types + by
rendering the template — but never exercised against the real Resend API. **Add a real key to
`.env.local` + Vercel and send one test email before Bundle 4 wires this in.**

Also resolved O9 (Stripe Customer Portal) via the API since you were away — TEST mode only, default
feature set (not a reviewed business decision on cancellation/proration copy). Live-mode setup is a
separate later step, same two-stage pattern as O6.

## ⚠️ Operator flag from Bundle 2 (not a code deferral)

Appendix B Card 1's copy is self-contradictory once substituted for Pro/Founding clients: "We move one
task at a time to 🔨 In Progress (two active tasks at a time)." This is verbatim HANDOFF spec content
(§1.8 forbids paraphrasing client-facing copy without authorization), so it was flagged rather than
silently rewritten. Fix is a one-line edit to `docs/HANDOFF-client-onboarding.md` Appendix B + the live
Trello template board's Card 1 (board id in `TRELLO_TEMPLATE_BOARD_ID`) once Bruno decides the wording.

## Loop paused after Bundle 1 (RESOLVED — operator merged + authorized full auto-merge)

Bundle 1 (Stripe webhook + idempotency) built, reviewed (7 MAJOR + 12 MINOR findings applied, 1
refuted), tested (incl. two previously-untested paths: lease-expired CAS takeover and lease-fencing),
and PR #15 opened — but per the operator's O0 decision (hard-stop on Bundles 1 and 4), auto-merge was
deliberately NOT armed. The loop does not advance to Bundle 2 (which depends on Bundle 1 per the HANDOFF
§2 table) until PR #15 is merged. Resume by re-invoking `/autonomous-bundle-loop
docs/HANDOFF-client-onboarding.md` after merging, or ask me to continue once you've reviewed.

## Cross-bundle drift / surfaced concerns

- (none yet)
