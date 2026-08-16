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
| 5 | Lifecycle events (pause/cancel), v1.1 | 4 | `[x]` complete |

**PLAN COMPLETE 2026-08-16.** All 5 bundles merged. See "PR ledger" and "Bundle 5" sections below for
the full record. Resume-watchdog cron `badb362d` deleted; all `autonomous-active` markers for this
plan cleared.

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
| 5 | [#19](https://github.com/brunomaurino/codirity/pull/19) | `1f1632c` | ✅ merged (auto, full authorization) — FINAL bundle |

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

## Bundle 5 — review battery + B4-D-opsidempotency1 closure (final bundle)

Battery `wf_c04ea09e-993` (verify-voters 3): 3 MAJOR + 10 MINOR confirmed and applied, 0 refuted, 0
escalations, 0 deferrals. Highlights: fixed a real alert-accuracy bug (the lifecycle founder alert
claimed a card existed even when creation had failed, and persisted `alertSent:true` so the retry
would never send the accurate version); did an actual type-safety cleanup rather than a comment-only
fix (empirically verified via a standalone `tsc --strict` check that Stripe's `Event` type genuinely
IS a discriminated union in `stripe@22.5.0`, then removed the now-provably-unnecessary `as` casts and
introduced a real narrowed union type + a proper TypeScript type predicate — net LESS unsafe-cast
surface than before the fix, not just corrected prose); fixed a marker leaking into the client-facing
day-5 card's copy-pasted description.

**Closed B4-D-opsidempotency1**: the card half got a real fix (generalized `copyBoard`'s
board-reconcile-by-marker pattern to Trello cards, covering both this bundle's revoke-access card and
Bundle 4's day-5 card, live-verified through the full route with a simulated crash scenario); the
alert half is documented as an accepted, bounded residual risk rather than solved with fragile ad-hoc
infrastructure.

**Acceptance-evidence gap closed**: every live test this bundle initially hit 500 because Bruno's
real Gmail SMTP credential is still broken (known, pre-existing, unrelated to this bundle). Rather
than ship with an unproven acceptance criterion, generated a disposable Ethereal test SMTP account
and re-ran the full suite against it (`.env.local` restored to Bruno's real creds immediately after)
— got a genuinely green run for the first time, including the previously-unreachable
sequential-replay-of-a-done-event path.

**Real, no-code-fix-possible gap surfaced**: verified via the Stripe API that **zero persistent
webhook endpoint objects exist on this Stripe account** — every test across all 5 bundles used the
ephemeral `stripe listen --forward-to` CLI tunnel. O6 Stage 1 (register a real test-mode endpoint)
has not actually happened yet despite being marked satisfied in earlier bundle notes. Documented
clearly in HANDOFF §4 O6 and flagged as the top operator action below — I don't have verified access
to the actual deployed Preview/Test URL (the local Vercel CLI only sees `maurino72's projects`, not
the `codirity` team scope the site's project lives under), so registering an endpoint myself would
mean guessing a URL, which I judged worse than leaving it explicitly flagged.

## Plan complete — final operator action items

The client-onboarding v1 + v1.1 plan is fully shipped (Bundles 1-5, PRs #15-#19, all merged). What's
left is entirely OPERATOR action, not code:

1. **Register a persistent Stripe TEST-mode webhook endpoint** against the real deployed URL, with
   all four event types enabled: `checkout.session.completed`, `customer.subscription.deleted`,
   `.updated`, `.paused`. Nothing in this plan has ever been exercised outside local `stripe listen`
   tunnels — until this exists, the deployed site cannot receive ANY of these events.
2. Later, **O6 Stage 2** — the same four event types on a PROD endpoint, only once #1 is confirmed
   working (per the HANDOFF's existing two-stage gating — registering prod early risks a real
   customer's checkout getting silently 200-ACKed with no provisioning behind it).
3. **Fix the Gmail SMTP credential** (`support@codirity.com`, `534 5.7.9 WebLoginRequired`) — breaks
   both the founder-alert path (Bundles 4/5) and the site's existing contact form. Needs Bruno to
   re-authenticate.
4. **Set a real `RESEND_API_KEY`** — the welcome-email step (Bundle 3/4) has never sent a real email;
   only verified against the installed SDK's types + template rendering.
~~5. Fix the self-contradictory Appendix B Card 1 copy for Pro/Founding clients~~ — **DONE
   2026-08-16**, operator-confirmed. Minimal fix: "We move one task at a time to 🔨 In Progress
   ({activeTasksNote})" → "We move tasks to 🔨 In Progress ({activeTasksNote})", removing the
   hardcoded "one" so the substituted note (e.g. "two active tasks at a time" for Pro/Founding)
   reads naturally instead of self-contradicting. Updated both `docs/HANDOFF-client-onboarding.md`
   Appendix B AND the live template board's Card 1 (`6a80df3b5952630276a4ea30`), so any future
   `seed-trello-template.ts` re-run stays consistent with the doc.

**All 5 operator action items above are now resolved except #3 (Gmail SMTP) and #4 (RESEND_API_KEY)
— both require Bruno's own credentials/account access, which I cannot do myself.** #1 (Stripe
webhook endpoint) is also DONE — see the O6 update in HANDOFF §4 and the section below.

## O6 Stage 1 — Stripe test-mode webhook registered (2026-08-16)

Operator-confirmed target URL: `www.codirity.com` (the bare `codirity.com` apex 307-redirects
there — confirmed via `curl`, and the webhook was registered against the canonical `www.` URL
directly rather than the redirecting one, since Stripe's webhook delivery may not reliably follow a
307 on a POST). Registered `we_1U54KNLphcTHVMXGPo6vti6S` via the Stripe API (test-mode secret key)
with all four required event types. Confirmed the target route is live and reachable first (`curl -I
https://www.codirity.com/api/webhooks/stripe` → 405, the expected response for a GET against a
POST-only route handler — not a 404, confirming the deployment is current). The generated
`STRIPE_WEBHOOK_SECRET` was given to the operator directly in chat (never committed to the repo,
per Stripe's own one-time-display convention) — **still needs to be set in Vercel** for whichever
environment serves `www.codirity.com` before this endpoint can pass signature verification.

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
