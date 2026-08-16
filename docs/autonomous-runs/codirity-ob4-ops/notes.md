# autonomous-task run notes — codirity-ob4-ops

Started: 2026-08-16T00:11:10Z

## Task description

Build Bundle 4 (founder ops + end-to-end wiring) of Codirity client onboarding. Full spec:
docs/HANDOFF-client-onboarding.md "Bundle 4" + Appendix D. lib/onboarding/ops.ts: (a) founder alert via
the EXISTING nodemailer/SMTP setup (not Resend, not a webhook — operator decision, see below) to
FOUNDER_ALERT_EMAIL; (b) day-5 check-in ops card on TRELLO_OPS_BOARD_ID, Appendix D verbatim, +5
business days. Wire Bundles 2/3/4 into /api/webhooks/stripe: reserve → copyBoard → sendWelcomeEmail →
alertFounder + createCheckin, each independently guarded + per-step recorded via the lease-fenced
update pattern from Bundle 1, resumable on retry. Fold the Bundle-1 founder-alert.ts stub into ops.ts.
Acceptance: full e2e with a REAL O6 test price_id (not a bare `stripe trigger`); sequential + concurrent
replay produce no duplicates; forced single-step failure doesn't abort others and resumes correctly on
retry; crash-after-board-copy reconciles onto the same board; no secrets in logs; lint+tsc+build green.

## Execution context

- Workflow + Agent probes: PASS
- Capability probes (d)(e)(f)(g): REUSED from earlier this session — `argsRoundTrip: true`,
  `effortTiers: true`, `customAgents: false`, `worktreeNative: true`.
- Bundle-loop context: `--bundle-id 4 --plan-slug client-onboarding`, `--verify-voters 3` (this bundle's
  own request — highest-stakes bundle in the plan: full webhook orchestration, real money path). Prefix
  `B4`, identifier `client-onboarding Bundle 4`. Run slug: `codirity-ob4-ops`.
- **Merge policy: full auto-merge authorized.** Bundle 4 was ALSO originally a hard-stop bundle under
  O0 (alongside Bundle 1, already merged by the operator) — the operator's 2026-08-15 in-session
  authorization ("mergees todo y sigas con todo") explicitly extended to Bundle 4 by name. No pause for
  review; the loop ships this one through same as 2/3.

## Decisions made unilaterally (pre-build, config)

- **O4 founder-alert mechanism — nodemailer/SMTP, NOT a webhook, NOT Resend.** The HANDOFF's original
  §4 O4 text assumed either a Slack incoming webhook OR "a plain email address" and named the env var
  `FOUNDER_ALERT_WEBHOOK_URL`. The operator chose email, no Slack (decided earlier this session — see
  bundle-loop notes). For an internal, plain-text ops alert (no client-facing template needed), reusing
  the EXISTING, already-proven `src/app/api/contact/route.ts` nodemailer/SMTP setup is simpler and
  avoids depending on the still-missing `RESEND_API_KEY` (flagged twice already, Bundles 3 + carried
  here) for a piece of functionality that doesn't need React Email templating at all. Introduces
  `FOUNDER_ALERT_EMAIL` (already added to `.env.local`/Vercel this session: `maurinobruno7@gmail.com`)
  instead of the stale `FOUNDER_ALERT_WEBHOOK_URL` name.
- **RESEND_API_KEY gap, carried forward — turned into a real test asset.** Since the welcome-email step
  will genuinely fail every run without a key, this bundle deliberately uses that as the naturally-
  occurring single-step-failure case for the resume-logic acceptance test, rather than needing to
  simulate one artificially. See "Local acceptance testing" below for what this actually proved.

## Task interpretation

- **Concrete deliverable:** `src/lib/onboarding/ops.ts` (founder alert via nodemailer + day-5 Trello
  check-in card), plus the full orchestration wired into `src/app/api/webhooks/stripe/route.ts`
  (copyBoard → sendWelcomeEmail → alertFounder + createCheckin, each lease-fenced + per-step recorded),
  replacing the Bundle-1 `founder-alert.ts` stub.
- **Acceptance test:** a reviewer confirms — (1) a real e2e test-mode checkout (real O6 price id) ends
  with a board, invite, founder alert, and ops card all created within ~5 min (email is the one
  known-failing step, see above); (2) sequential + concurrent replay of the same event produce no
  duplicates of any side effect; (3) a step failure doesn't abort independent steps and a retry resumes
  only the missing one(s), reusing existing state (same board, no double invite/alert/card); (4) a
  simulated crash after the Trello copy but before `boardId` is persisted still reconciles onto the same
  board on retry; (5) no secrets in logs; (6) lint+tsc+build green.

No ambiguity requiring HS-3 — the brief + HANDOFF §1/§4/Bundle-4/Appendix-D spec, plus the O4 mechanism
decision above, fully pin the deliverable.

## Plan

**Building:**
- `src/lib/onboarding/ops.ts`:
  - `alertFounder(message: string)` — sends via the existing nodemailer/SMTP transporter
    (SMTP_HOST/PORT/USER/PASSWORD, same pattern as `api/contact/route.ts`) to `FOUNDER_ALERT_EMAIL`.
    Replaces + deletes `founder-alert.ts` (its own doc comment said Bundle 4 should fold it in here).
  - `createCheckin({ clientName }): Promise<{ cardId: string }>` — finds the "To Do" list on
    `TRELLO_OPS_BOARD_ID` (inspected live: board has To Do/Doing/Done, standard Trello starter
    structure) by name, creates a card titled `Day-5 check-in — {clientName}` with Appendix D copy
    verbatim, due +5 BUSINESS days from now (skip Sat/Sun), via `trelloRequest()`.
- Rewrite `src/app/api/webhooks/stripe/route.ts`'s success path (after plan resolution) to orchestrate:
  `copyBoard → sendWelcomeEmail → alertFounder + createCheckin`, each step:
  - Skipped entirely if the record (from `reserveResult`, which already reflects prior-attempt state on
    a lease-takeover) already shows it complete (`boardId`, `emailSent`, `alertSent`, `cardId`
    respectively).
  - Individually try/caught — a step's failure is logged and recorded as "not yet done" but does NOT
    stop the remaining steps from being attempted this same request (matches "independent steps" in the
    brief), EXCEPT email, which is skipped (not attempted, not counted as a failure worth blocking card/
    alert) if there's no `boardUrl` yet — it has nothing to say without one.
  - Each SUCCESSFUL step is persisted immediately via `updateRecordIfLeaseHeld` before moving to the
    next. If that persist ever fails (lost the lease fence — another worker took over), stop immediately
    and return 500 — continuing to write against a fence we no longer hold would race the new owner.
  - `status: done` + 200 only when ALL FOUR steps show complete; otherwise 500 (Stripe retries; the
    resume path — lease-expired takeover — reconciles via the ALREADY-implemented mechanisms in
    Bundle 1's `reserveEvent` and Bundle 2's `copyBoard` §1.1d reconcile).
  - Small `LeaseLostError` + `persistStep()` helper to avoid repeating the
    "call updateRecordIfLeaseHeld, check the boolean, throw/return-500 on false" boilerplate 5+ times.

**Tests / verification:** `npm run lint`, `npx tsc --noEmit`, `npm run build`; a REAL e2e test-mode
checkout against an O6 test price_id (not a bare `stripe trigger`); sequential + concurrent replay;
forced-single-step-failure + retry-resumes (the email step's real, naturally-occurring failure IS this
test — see "Decisions made"); crash-after-board-copy-before-persist reconcile (already covered by
Bundle 2's own test, re-exercised here through the full route).

**Open questions resolved:**
- Ops-board list for the check-in card: "To Do" (inspected the live board — standard Trello
  starter-template lists To Do/Doing/Done; a day-5 reminder is a task Bruno does, belongs in To Do).
  Fails loudly if that list is ever renamed/removed rather than guessing another list or auto-creating
  one on Bruno's manually-curated ops board.
- Step-failure independence granularity: board → email → {alert, card}. Alert and card don't need
  boardUrl so they're attempted even if the board step failed this round; email is skipped (not
  "failed") without a boardUrl since it would have nothing to link.
- `clientName` passed to `copyBoard`/`createCheckin` as `name ?? "there"` — matches the email
  template's own established null-fallback convention (Bundle 3), applied consistently here since
  Trello card titles/board names need SOME string, not a nullable one.

## Decisions made unilaterally

(see pre-build section above; more added during build)

## Stop attempts

(none)

## Drift flags

(none)

## Round-skip requests

(none)

## Bugs found + fixed during Bundle-3-testing (before the review battery)

- **Parent repo's `node_modules` was stale.** No bundle worktree's `npm install` ever propagated back
  to the parent (each worktree got its own real `node_modules`, then the worktree was deleted post-
  merge). This worktree's symlink-from-parent therefore couldn't resolve `stripe`/`resend`/
  `@upstash/redis`/etc. Fixed by running `npm install` in both this worktree AND the parent (so the
  NEXT bundle's symlink starts from a synced base) — process gap worth carrying into Bundle 5.
- **Two ADDITIONAL env vars were never synced to the parent's `.env.local`**, discovered only by
  actually running the orchestration: `TRELLO_TEMPLATE_BOARD_ID` (only ever lived in Bundle 2's deleted
  worktree) and `ACCESS_FORM_URL` (same). Added to both this worktree and the parent.
- **Real, non-code bug found via live testing: the "Standard" Stripe test price was STILL misconfigured**
  (flagged in Bundle 1, never fixed) — confirmed live by loading the actual Stripe Checkout page, which
  showed "$4.00/month" instead of $3,995. Since the operator is unattended and this directly blocked a
  legitimate e2e test (and would silently undercharge any real Standard subscriber by ~1000x), fixed it:
  created `price_1U4rncLphcTHVMXG0TVcP2UD` ($3,995.00, correct integer cents), set as the product's
  default price, archived the broken `price_1TyesOLphcTHVMXGtl3B77Pt`, updated `STRIPE_PRICE_ID_STANDARD`
  in both `.env.local` files. **Flag for the operator:** this is a live Stripe test-mode data fix, not a
  code change — the equivalent live-mode price (if one exists) should be checked too before real launch.
- **Real code bug found via live testing (not by the review battery): the missing-identity and
  unknown-price TERMINAL branches called `alertFounder()` un-isolated.** A real SMTP outage (see below)
  surfaced it immediately: `alertFounder` throwing meant the branch's `catch` returned 500 WITHOUT ever
  persisting `status: done` — turning a fundamentally unfixable-by-retry event (missing identity /
  unmapped price) into an infinite retry loop, exactly the failure mode §1.1(c) exists to prevent.
  Fixed: both branches now try/catch the alert independently, log a failure, and persist `status: done`
  (with `alertSent: false` if the alert failed) regardless — the alert is best-effort, never blocking on
  a terminal, unresolvable state. **Re-verified live**: re-triggered the missing-identity path with the
  real (still-broken) SMTP failure in play → 200, record shows `status: "done", alertSent: false`.

## Two REAL, currently-broken external credentials discovered during e2e testing (operator action needed)

1. **RESEND_API_KEY** — carried forward from Bundle 3, still absent. `sendWelcomeEmail` fails every
   attempt, as documented/expected.
2. **SMTP auth (`SMTP_USER`/`SMTP_PASSWORD` in `.env.local`) is CURRENTLY REJECTED by Gmail** with `534
   5.7.9 Please log in with your web browser and then try again... WebLoginRequired`. This is the SAME
   credential the pre-existing contact form (`api/contact/route.ts`) uses, and it is presently broken —
   this is an operator-side Gmail/Workspace security issue (expired app password, revoked access, or a
   security-verification hold on the account), not something fixable from code. **This means the
   contact form is also currently broken in production**, independent of anything in this bundle — worth
   flagging loudly since it predates and is outside this PR's scope, but is a live, silent failure.

These two gaps mean `emailSent` and `alertSent` cannot reach `true` in this session — see "Local
acceptance testing" below for how this was turned into a genuine, valuable test of the resume logic
rather than a blocker.

## Local acceptance testing (Phase 3) — REAL e2e, not simulated

All against the real Trello/Stripe test-mode APIs, via `stripe listen` forwarding to a local dev server,
using the Claude Browser tool to complete an ACTUAL Stripe Checkout (test card `4242 4242 4242 4242`)
against a real Payment Link for the (now-fixed) Standard price — not a bare `stripe trigger`, which
mints its own throwaway price and can never validate the price→plan map, exactly per the acceptance's
own warning.

1. **Real e2e checkout, first delivery** — completed a genuine $3,995.00 test-mode checkout via the
   browser. First webhook delivery: board provisioning AND founder alert both failed (missing
   `TRELLO_TEMPLATE_BOARD_ID`/`ACCESS_FORM_URL` env vars at that moment — fixed mid-test, see above) →
   500, correctly not marked done.
2. **Productive retry (`stripe events resend`) — the load-bearing resume test.** After fixing the env
   gaps, resent the SAME event id. Result: board created + client invited + day-5 ops card created, both
   persisted; welcome email FAILED (no Resend key) and founder alert FAILED (Gmail issue) — both
   INDEPENDENTLY, or the other steps would never have completed. Response: 500 (correct — not all 4
   steps done). Inspected the Redis record directly: `boardId`/`boardUrl`/`inviteSent`/`cardId` present,
   `emailSent`/`alertSent` absent, `status: "reserved"`.
3. **Immediate re-retry → 503 (lease still valid)** — confirms the deterministic §1.1(b) rule holds even
   for a same-event same-worker quick re-delivery; not a bug, the lease is timeout-based by design (a
   crashed vs. slow worker can't be distinguished any other way).
4. **Forced lease-expiry + retry — proves the SKIP-ALREADY-DONE behavior, not just "resume runs again."**
   Manually set `lease_until` into the past (mirroring Bundle 1's technique) and resent. Result:
   IDENTICAL `boardId` and `cardId` as step 2 (confirmed via direct record inspection) — board and card
   were NOT recreated, only email and founder-alert were re-attempted (and failed again, same reasons).
   This is real proof of "resume only the missing step(s), reusing existing state" — the acceptance
   criterion's exact wording — not simulated.
5. **Concurrent replay (load-bearing)** — fired two simultaneous signed deliveries of a brand-new
   synthetic event (real session data, fresh eventId). Exactly one `500` (processed, incomplete on
   email/alert as expected) and one `503` (rejected). Record inspection: exactly one `boardId`, one
   `cardId` — no duplicate provisioning under concurrency.
6. **Missing-identity terminal path, re-verified after the fix** — re-triggered a `stripe trigger`
   fixture that naturally produces `customer: null` (mode: payment). Before the fix: 500 (bug, see
   above). After the fix: 200, record shows `status: "done"`, `alertSent: false` (the real SMTP failure
   correctly didn't block the terminal state).
7. Test Trello boards created during testing were archived afterward.
8. `npm run lint`, `npx tsc --noEmit`, `npm run build`: all green (after both the env-sync fix and the
   node_modules fix).

**Not independently re-tested**: the unknown-price-id terminal branch's identical alert-isolation fix
(fixture friction — `stripe trigger --override` with `mode=subscription` hit an unrelated Stripe fixture
limitation). The fix is structurally identical to the missing-identity branch, which WAS re-verified
live; relying on that symmetry rather than burning further time on fixture workarounds.

## Review findings + resolutions

Battery `wf_ef246830-3b7` (adversarial + QA, `verifyVoters: 3`, `customAgents: false`). 6 MAJOR + 3
MINOR confirmed and applied; 1 finding refuted (correctly, see below); 1 escalation resolved
main-thread (see "Escalation resolved" below).

1. **MAJOR — `.env.example` missing `FOUNDER_ALERT_EMAIL`/`TRELLO_OPS_BOARD_ID`.** Both are hard-required
   via `requiredEnv()` in `ops.ts` but were never documented. Fixed: added both with comments explaining
   what reads them.
2. **MAJOR — `clientName = name ?? "there"` didn't match the established fallback convention and
   propagated a bare "there" into Trello board/card titles + the founder alert, not just the email.**
   `email-template.tsx` (Bundle 3) already established `clientName?.trim() || "there"` to also catch a
   whitespace-only name from Stripe. Fixed: `route.ts`'s `clientName` now uses the same
   `name?.trim() || "there"`, so a whitespace name falls through consistently on every surface it feeds
   (board title, card title, alert text), not just the email.
3. **MAJOR — nodemailer transporter had no timeout config, could hang well past the 60s `maxDuration`
   budget.** A hung SMTP connection would block every step queued after the alert on every retry. Fixed:
   added explicit `connectionTimeout`/`greetingTimeout`/`socketTimeout` (10s each) to the transporter in
   `ops.ts`.
4. **MAJOR — §1.1(c)/§1.4 requires surfacing a partial failure via the founder alert, not just logs; the
   only alert sent was the unconditional "New client" one, which doesn't reflect actual step outcomes.**
   Fixed: `route.ts` now sends a second, best-effort alert right before the `500` response whenever the
   request ends incomplete, listing exactly which steps are still missing (board/email/alert/card). This
   alert's own failure is caught and logged but never changes the response — Stripe must still see
   non-2xx regardless of whether this specific alert lands.
5. **MAJOR — the mandatory crash-after-board-copy-before-persist scenario (§1.1, explicitly required by
   the brief) had only been exercised at the `copyBoard()` unit level (Bundle 2's own test), never through
   the FULL route.** Re-tested live through the actual route: called `copyBoard()` directly for a fresh
   synthetic event id (simulating "worker A completed the Trello copy, then crashed before persisting
   `boardId`" — no Redis record written), then fired a real signed webhook for that SAME event id at the
   running dev server. Confirmed via direct Redis + Trello inspection: the retry's `boardId` matched the
   board from the first call EXACTLY, and exactly one board in the workspace carried that event's
   reconcile marker — no duplicate. Test artifacts (2 Trello boards, 1 card, 1 Redis key) archived/deleted
   afterward.
6. **MAJOR — HANDOFF doc drift: §1.6 still listed `FOUNDER_ALERT_WEBHOOK_URL` (the Slack-alternative name,
   never used) instead of `FOUNDER_ALERT_EMAIL`; §4 O4 had no DECIDED stamp and still recommended Slack.**
   Fixed both in `docs/HANDOFF-client-onboarding.md`.
7. **MINOR — the email-skip-without-`boardUrl` branch's comment ("not counted as a failure") contradicted
   the code (`stepFailed = true`).** Fixed the comment to state the actual behavior: it's skipped rather
   than attempted, but DOES count toward `stepFailed` exactly like a real failure would, since that's what
   makes a later retry send it once the board step succeeds.
8. **MINOR — stale success log message** ("reserved event") **left over from Bundle 1, no longer
   accurate once this bundle reaches full completion.** Changed to "client fully provisioned".
9. **MINOR — every step-level catch logged only the error's constructor name, losing real diagnosability**
   (a renamed ops list, a revoked Trello token, and a bad board id were all indistinguishable "Error"
   log lines). Resolved with a NEW `detailedErrorTag()` helper used for the board/email/card steps only —
   `trelloRequest` (Bundle 2) already strips the key/token query string before throwing, and Resend's SDK
   errors are generic (confirmed in Bundle 3), so those messages are safe to log in full. The alert step
   (raw SMTP/nodemailer) deliberately keeps the original constructor-name-only `sanitizedErrorTag()`,
   since an SMTP rejection can echo the recipient address back in its message — the one case where the
   original Bundle-1 no-PII policy still fully applies.

**Refuted (correctly, no action taken):** a finding claimed `inviteSent` needed to be read back to guard
a retry-specific re-invite. Rejected on inspection: `copyBoard()`'s internal ordering guarantees the
invite always completes BEFORE the function returns, and `boardId` is only ever persisted AFTER
`copyBoard()` returns successfully — so there's no reachable state where `boardId` is recorded but the
invite didn't happen. `inviteSent` is decorative in the current design, not a gap.

**Escalation resolved (main-thread, operator unavailable):** one escalation asked whether
`alertFounder`/`createCheckin` need their own crash-window idempotency/reconcile protection (mirroring
the board's marker-based reconcile), for the narrow case of a Redis write failing for reasons OTHER than
lease loss right after the external call succeeds. The defense agent wanted a force-apply; the
cooperative reviewer disagreed. I sided with the cooperative reviewer and did NOT apply a fix here:
- The spec's explicit crash-window protection requirement (§1.1) names the board (marker-based reconcile)
  and the email (idempotency key) specifically — it is not extended to the alert/card steps.
- A naive "reconcile by scanning the ops board's To Do list" fix would be WRONG on Bruno's manually-curated
  ops board — he moves/archives cards himself, so a completed-and-archived check-in card would silently
  get duplicated by a list-name scan. Building this now risks shipping something that LOOKS like a fix but
  isn't robust.
- Nodemailer's Message-ID is not a real dedup guarantee for an SMTP-idempotency scheme.
- The actual race window (Upstash itself failing transiently in the split second between the external
  call succeeding and `persistStep`'s own Upstash write) is narrow and founder-facing only, not
  customer-facing — MINOR real-world impact.
- Bundle 5 already touches the ops board + alerts (lifecycle events), making it the natural place to
  design this reconcile/dedup vocabulary once, for both bundles, rather than bolting on a possibly-wrong
  version here under time pressure with the operator unavailable to weigh in on the ops-board semantics.
Tracked as a commitment for Bundle 5 (see `commitments.md`), not silently dropped.

## Areas examined and rejected

See battery `wf_ef246830-3b7`'s `areasExamined` (68 entries) for the full list; nothing beyond the 6
MAJOR + 3 MINOR above required a code change.

## Items deferred from this PR

1. **Alert/check-in-card crash-window idempotency** (the resolved escalation above) — deferred to Bundle 5.
   See `commitments.md`.

## Open items NOT addressed in this PR

(filled in Phase 7)

## Durable handles

- marker: /Users/brunomaurino/.claude/autonomous-active/autonomous-task-codirity-ob4-ops
- worktree: /Users/brunomaurino/projects/codirity-ob4-ops
- worktree_entry: path
- battery_run_id: wf_ef246830-3b7
