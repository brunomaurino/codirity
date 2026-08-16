# HANDOFF — Codirity Client Onboarding: Automation + Content Kit

**Derived from:** PRD "Codirity Client Onboarding: Automation + Content Kit" (Bruno, v1, 2026-07-24)
**Author of handoff:** Claude Code · **Date:** 2026-07-24 · **Revised:** 2026-08-10 (spec-review `wf_e8b0d24d-245`: 2 blockers + 4 majors + minors folded in)
**Repo:** `~/projects/codirity` (Next.js 16, App Router) · **Deploy:** Vercel (`www.codirity.com`)
**Consumer:** `/autonomous-bundle-loop` → `/autonomous-task` (one bundle = one PR).

> **Sequencing (load-bearing):** this plan lives in the SAME repo as the subscription rebuild, which is
> currently shipping via its own `/autonomous-bundle-loop`. **Do not run this loop until the rebuild loop
> has fully merged** — concurrent loops on the same repo/`main` race each other's fast-forwards, and the
> onboarding webhook's `price_id → plan` map depends on the rebuild's Stripe Payment Links being finalized
> (rebuild decision D2). Onboarding is otherwise near-independent (all-new files: `api/webhooks/stripe`,
> `lib/onboarding/`, `scripts/`, email templates) — near-zero overlap with the rebuild's SEO/landing bundles.
> **Status 2026-08-10:** the rebuild loop HAS fully merged (PRs #1–#7) — this gate is SATISFIED. The general
> rule still applies to any other loop on this repo (e.g. the redesign): never two loops at once on `main`.

---

## §0 — How to execute this plan

Run with (AFTER the rebuild loop is done, and AFTER the O-prerequisites in §4 are provisioned):

```
/autonomous-bundle-loop docs/HANDOFF-client-onboarding.md
```

Ships bundles **in §2 order** (1 → 2 → 3 → 4 → 5), one `/autonomous-task` PR each. Push/PR identity
**`maurino72`** (scope every `gh` call `GH_TOKEN=$(gh auth token -u maurino72) gh …`). `main` is unprotected
and Vercel auto-deploys → every merge ships to prod. **Merge policy:** confirm with Bruno at launch (the
webhook processes real payments + provisions real client boards/emails — the blast radius of a bug is a
paying customer, so this plan does NOT inherit the rebuild's blanket auto-merge; see §4 O0).

## §1 — Operating conventions (bundles inherit these)

1. **Idempotency is the load-bearing invariant — and a plain read-then-write is NOT enough** (spec-review
   MAJOR ×2). Stripe retries deliveries **only on a non-2xx response or a timeout** (a `2xx` tells Stripe
   "done, stop retrying"), and can deliver the same `event.id` **concurrently**. The design MUST be:
   - **(a) Atomic reservation WITH A LEASE — the record is DURABLE; the lease is a FIELD, never a key TTL.**
     (Spec-review BLOCKER, 2026-08-10: the earlier recipe `SET key <record> NX EX 90` was wrong — Redis `EX`
     is a TTL on the KEY, so at t+90s the ENTIRE record (per-step resume flags, `status`, Bundle 5's
     customerId association) would be silently deleted, making the lease-expired state unreachable and
     turning any Stripe retry past 90s into a full re-run of side effects. Never put a short TTL on the
     record key.) Reserve `event.id` with an *atomic set-if-absent whose value IS the initial event record
     and CONTAINS `lease_until` as a timestamp field*: Redis/Vercel KV `SET key <record-json> NX` with **no
     expiry** (a hygiene TTL ≥ 90 days is acceptable, never seconds); or a DB row
     `INSERT … ON CONFLICT DO NOTHING` with a `lease_until` column. Lease validity is decided by comparing
     the `lease_until` FIELD to now, in app code. Only the delivery that WINS the set-if-absent proceeds.
     `leaseSeconds` (e.g. 90s) must be ≥ the serverless function's max execution time.
   - **(b) Deterministic action when the key is already present** (this is the piece the first draft left
     contradictory — one rule, no ambiguity):
     · `status: done` → return **200** (no-op, the work is finished).
     · reserved, not done, **lease still valid** → another worker is live; return **non-2xx (5xx)** so
       Stripe retries later — do NOT touch the event.
     · reserved, not done, **lease EXPIRED** (previous worker crashed) → **take over via an atomic
       compare-and-set on the old `lease_until`** (Redis: Lua script or `WATCH`+`MULTI`; DB:
       `UPDATE … SET lease_until = <new> WHERE event_id = … AND lease_until = <old>`) and **resume the
       missing steps**. The CAS is the mutual-exclusion mechanism — two workers racing the same expired
       lease cannot both win; the loser re-reads and lands in the lease-valid branch. A live winner and a
       crashed one are distinguished by the lease, so there is exactly one action per state — never both
       "do nothing" and "resume" at once.
   - **(c) Per-step records + resume.** Record each step's completion under the event record
     `{ boardId, boardUrl, inviteSent, emailSent, alertSent, cardId, status, lease_until }`. On resume,
     do only the steps whose record is missing. Mark `status: done` and return **200** only after every
     step is recorded; on any step failure return **non-2xx** (so Stripe retries and the resume path runs)
     AND fire the founder alert. Recovery is by safe resume, never "alert and give up".
   - **(d) The non-idempotent Trello board-copy needs its OWN reconcile** (the reserve→copy→persist-id
     window: a crash after Trello returns the board but before `boardId` is stored would otherwise make a
     SECOND board). Stamp the `eventId` into the copied board (in its description) at creation; **before
     copying, search the workspace for an existing board whose description carries this `eventId` and
     REUSE it** if found. Mechanism: the marker is written ATOMICALLY with the copy (`desc` passed in the
     same `POST /1/boards/` call as `idBoardSource`), and the search is an enumeration —
     `GET /1/members/me/boards?fields=name,desc` filtered to `TRELLO_WORKSPACE_ID` + a client-side match on
     the marker (Trello has no server-side description search; the token sees every board it created). This
     closes the post-copy/pre-persist window — `POST /1/boards/?idBoardSource`
     has no idempotency key, so the reconcile is the only thing that makes the copy effectively
     exactly-once. (Do NOT over-claim "a retry never double-provisions" without this reconcile in place.)
     The welcome EMAIL gets the equivalent guarantee its own way: a deterministic Resend
     `Idempotency-Key "{eventId}-welcome"` (Bundle 3) — the emailSent record alone leaves a
     crash-between-send-and-record window that would re-send on the resumed retry.
   This is where an error hurts most (duplicate board + duplicate welcome email, or a silently-dropped
   email, to a paying client) — spend the deepest verification here. Test **concurrent** replay (reserve
   once), **forced-single-step-failure → retry resumes** the missing step reusing the same board, AND a
   **crash-after-board-copy** case (the reconcile finds and reuses the board, no second board).
2. **Raw body for signature verification.** In App Router, read the raw payload with `await req.text()`
   and pass it to `stripe.webhooks.constructEvent(rawBody, sig, secret)`. Do **not** `await req.json()`
   first — parsing mutates the body and breaks signature verification.
3. **No secrets in logs.** Log event id + type + plan only; never customer PII, keys, or full payloads.
   Client credentials NEVER flow through Trello/email (that's the access form + a secure one-time link, §4 O5/O7).
4. **Side effects are independently guarded AND per-step recorded (§1.1c).** Wrap each of Trello /
   invite / email / founder-alert / ops-card in its own try/catch; on success, record that step's
   completion (and any id it produced) in the event record before the next step. A step failure does not
   abort the *remaining independent* steps, but the handler then returns **non-2xx** (per §1.1c —
   returning 200 would tell Stripe to STOP retrying and permanently strand the failed step) so a Stripe
   retry re-enters and resumes only the missing steps (each guarded by its per-step record so completed
   steps are skipped, not re-run). Also surface the partial failure via the founder alert + logs. Return
   200 only when every step has its completion record and `status: done`.
5. **Unhandled event types → 200 + ignore.** Only `checkout.session.completed` (v1) and the Bundle-5
   lifecycle events (v1.1) do work: `customer.subscription.deleted`, `customer.subscription.paused`
   (trial-end case only), AND `customer.subscription.updated` where `pause_collection` transitions to
   non-null — a billing-portal pause emits `updated`+`pause_collection`, NOT `.paused` (see Bundle 5).
6. **All env via Vercel** (Production + Preview scoped): `STRIPE_WEBHOOK_SECRET`, `STRIPE_SECRET_KEY`,
   `STRIPE_BILLING_PORTAL_URL` (§4 O9), `TRELLO_KEY`, `TRELLO_TOKEN`, `TRELLO_TEMPLATE_BOARD_ID`,
   `TRELLO_OPS_BOARD_ID`, `TRELLO_WORKSPACE_ID` (§4 O3), `RESEND_API_KEY`, `FOUNDER_ALERT_EMAIL` (§4 O4 —
   DECIDED: plain email via the existing SMTP transporter, not a Slack webhook — see O4 below),
   `ACCESS_FORM_URL` (§4 O5), plus the idempotency-store creds (§4 O1). Document all in `.env.example`.
   **AND into the worktrees:** before launching the loop, Bruno also writes the TEST-scoped values into
   `.env.local` (gitignored) at the repo root — bundle worktrees run the behavioral acceptance locally and
   Vercel-scoped env never reaches them; without this every bundle stalls on a missing-credential hard-stop.
7. **Gate list per touched file:** `npm run lint` AND `npx tsc --noEmit` AND `npm run build`.
8. **All copy in English**, seeded verbatim from the PRD Appendices (A–E) — do not paraphrase client-facing copy.

## §2 — Bundle status surface

| Bundle | Scope | Depends on | Status | PR # | Merge SHA |
|---|---|---|---|---|---|
| **1** | Stripe webhook endpoint + idempotency store + `price_id → plan` map | O1, O6 | [x] complete | [#15](https://github.com/brunomaurino/codirity/pull/15) | `e75d700` |
| **2** | Trello provisioning module + `seed-trello-template` script | 1, O3 | [x] complete | [#16](https://github.com/brunomaurino/codirity/pull/16) | `7e44a20` |
| **3** | Welcome email (Resend + React Email, Appendix A) | 1, O2, O9 | [x] complete | [#17](https://github.com/brunomaurino/codirity/pull/17) | `9c2dcb4` |
| **4** | Founder ops (alert + day-5 card) + wire 2/3/4 into the webhook end-to-end | 2, 3, O4 | [x] complete | [#18](https://github.com/brunomaurino/codirity/pull/18) | `88cd185` |
| **5** | Lifecycle events (pause/cancel → revoke card, Appendix E) — v1.1 | 4 | [x] complete | [#19](https://github.com/brunomaurino/codirity/pull/19) | `1f1632c` |

## §3 — Per-bundle launch commands

Each block is the verbatim `/autonomous-task` brief; the loop appends `--bundle-id` + `--plan-slug`. Full
scope + acceptance is in "Bundle specifications" below.

### §3.1 — Bundle 1

```
Build Bundle 1 (Stripe webhook + idempotency) of Codirity client onboarding. Fresh worktree at /Users/brunomaurino/projects/codirity-ob1-webhook on branch feat/codirity-ob1-webhook (off origin/main). Full spec + acceptance: docs/HANDOFF-client-onboarding.md "Bundle 1" + §1. Brief: add the `stripe` dependency and POST /api/webhooks/stripe (App Router route handler). Read the RAW body via await req.text() (never req.json() first) and verify with stripe.webhooks.constructEvent(raw, sig, STRIPE_WEBHOOK_SECRET) — invalid signature → 400. Handle checkout.session.completed only (all other types → 200 ignore). Idempotency per §1.1 (load-bearing): reserve event.id with an ATOMIC set-if-absent + LEASE (Redis/Vercel KV `SET <record-json> NX` with NO key TTL — `lease_until` is a FIELD inside the record, NEVER an `EX` on the key: a key TTL would delete the whole record + resume state at expiry; / DB row with a lease_until column) in the §4 O1 store BEFORE any side effect — the NX value IS the initial record, and the record is DURABLE (Bundle 5 reads its customerId association later; lease takeover is an atomic compare-and-set on the old lease_until). Only the winner proceeds; a delivery finding the key present follows the deterministic §1.1b rule (done→200; lease-valid→non-2xx retry-later; lease-expired→take over + resume). Establish the durable event-record schema the later bundles extend: {eventId, customerId, email, plan, boardId?, boardUrl?, inviteSent?, emailSent?, alertSent?, cardId?, status, lease_until} — also carries the customerId→boardId/clientName association Bundle 5 needs. Extract customer email (session.customer_details.email), name (session.customer_details.name — may be null, fall back gracefully), and plan via a price_id→plan map; the price_id comes from the session's line items (may need stripe.checkout.sessions.listLineItems / expand — STRIPE_SECRET_KEY is provisioned for that), map in lib/onboarding/plans.ts, fail loudly on an unknown price id via the founder alert. No PII in logs. In this bundle the handler reserves + records the event + logs the parsed {email, plan}; side effects are added in Bundles 2-4. Add all env to .env.example. Acceptance: `stripe trigger checkout.session.completed` in test mode returns 200 and reserves+records the event; invalid signature → 400; SEQUENTIAL replay of the same event id is a no-op; CONCURRENT replay (two overlapping deliveries of the same event id) reserves exactly once (only one record, no double-processing) — this is the load-bearing test, not just sequential; unknown price id fires the founder-alert path (stub ok) not a crash; lint+tsc+build green.
```

### §3.2 — Bundle 2

```
Build Bundle 2 (Trello provisioning) of Codirity client onboarding. Fresh worktree at /Users/brunomaurino/projects/codirity-ob2-trello on branch feat/codirity-ob2-trello (off origin/main; Bundle 1 merged). Full spec: docs/HANDOFF-client-onboarding.md "Bundle 2" + Appendix B. Brief: lib/onboarding/trello.ts — copyBoard({clientName, eventId, email, plan}): FIRST reconcile per §1.1d — enumerate the boards visible to the token (GET /1/members/me/boards?fields=name,desc, filtered to TRELLO_WORKSPACE_ID) and REUSE any board whose description carries the marker "codirity-event:{eventId}" (closes the crash-after-copy/pre-persist window; the copy has no idempotency key). Else copy TRELLO_TEMPLATE_BOARD_ID via ONE call — POST /1/boards/?idBoardSource=...&keepFromSource=cards passing name="Codirity × {clientName}", desc="codirity-event:{eventId}" AND idOrganization=TRELLO_WORKSPACE_ID in the SAME request (marker + workspace placement must be atomic with the copy; no separate rename/describe step, or the crash window reopens). THEN substitute the template placeholders in the copied board's card descriptions via PUT /1/cards/{id}: {accessFormUrl} → ACCESS_FORM_URL, {activeTasksNote} → per plan ("one active task at a time" for Standard; "two active tasks at a time" for Pro/Founding — mirror src/config/offer.ts, the canonical source). THEN invite the client email as a normal member — PUT /1/boards/{id}/members (Trello's invite-by-email is PUT, not POST). Return the board id + URL. All via fetch with TRELLO_KEY/TRELLO_TOKEN; guarded per §1.4. ALSO scripts/seed-trello-template.ts — a one-off script run via `npx tsx scripts/seed-trello-template.ts` (add `tsx` as devDependency) that builds the "[TEMPLATE] Codirity Client Board" from Appendix B VERBATIM (lists 👋 Start Here · 📥 Backlog · ⏭️ Up Next · 🔨 In Progress · 👀 In Review · ✅ Done; the 7 Start-Here/Backlog cards with exact copy, {activeTasksNote} and {accessFormUrl} left as template placeholders per Appendix B — the TEMPLATE keeps the braces; only COPIED client boards get substitution) and prints the board ID for TRELLO_TEMPLATE_BOARD_ID. Do NOT wire trello.ts into the webhook yet (Bundle 4 does the wiring). Acceptance: running the seed script against a test Trello workspace creates a board matching Appendix B exactly (lists, card order, copy); trello.ts unit-invoked copies+substitutes+invites and returns a URL, and the COPIED board contains NO residual {curlyPlaceholders} in any card; calling copyBoard twice with the same eventId (simulating a crash after the copy, before the caller persisted boardId) returns the SAME board — exactly one board for that eventId exists in the workspace; no secrets in logs; lint+tsc+build green.
```

### §3.3 — Bundle 3

```
Build Bundle 3 (welcome email) of Codirity client onboarding. Fresh worktree at /Users/brunomaurino/projects/codirity-ob3-email on branch feat/codirity-ob3-email (off origin/main). Full spec: docs/HANDOFF-client-onboarding.md "Bundle 3" + Appendix A. Brief: add `resend` + `@react-email/components`; lib/onboarding/email.ts sends the Appendix A welcome email via Resend from support@codirity.com (sender per §4 O2, decided 2026-08-15 — matches the site's canonical contact), reply-to Bruno's address, using a React Email template with variables clientName (fallback "there" if null), boardUrl, accessFormUrl (= ACCESS_FORM_URL), planName, plus an eventId param used ONLY for the idempotency key. Copy is Appendix A VERBATIM (subject "Welcome to Codirity — your board is ready"; the 3 numbered steps; the P.S. with plan name + billing-portal note). Include the Stripe billing-portal link in the footer from STRIPE_BILLING_PORTAL_URL (the permanent Customer-portal login link, §4 O9) — NEVER a per-session portal URL (portal-session URLs are short-lived/single-use and would be dead when the client clicks). Send with Resend Idempotency-Key "{eventId}-welcome" so a webhook retry that crosses the send/record boundary cannot duplicate the email. Do NOT wire into the webhook yet (Bundle 4). Guarded per §1.4. Acceptance: a local send (test API key or Resend test mode) renders the template with all variables filled and no missing-var placeholders; from/reply-to correct; lint+tsc+build green. NOTE: support@codirity.com must be a Resend-verified domain sender (§4 O2) — flag if unverified rather than failing silently.
```

### §3.4 — Bundle 4

```
Build Bundle 4 (founder ops + end-to-end wiring) of Codirity client onboarding. Fresh worktree at /Users/brunomaurino/projects/codirity-ob4-ops on branch feat/codirity-ob4-ops (off origin/main; Bundles 1-3 merged). Full spec: docs/HANDOFF-client-onboarding.md "Bundle 4" + Appendices D. Brief: lib/onboarding/ops.ts — (a) founder alert on new client via FOUNDER_ALERT_WEBHOOK_URL (Slack incoming webhook or email per §4 O4): "New client: {name} — {plan}"; (b) create a check-in card on TRELLO_OPS_BOARD_ID titled "Day-5 check-in — {clientName}", due +5 BUSINESS days (skip weekends), description = Appendix D copy verbatim. THEN wire Bundles 2/3/4 into /api/webhooks/stripe: on a reserved checkout.session.completed (§1.1), orchestrate trello.copyBoard({clientName, eventId, email, plan}) → email.sendWelcomeEmail({eventId, email, clientName, boardUrl, plan}) (boardUrl from trello; returns {id} — the Resend message id, worth persisting alongside emailSent) → ops.alertFounder + ops.createCheckin, each independently guarded (§1.4) and RECORDING its per-step completion (+ any id) in the event record before the next step; the board copy REUSES a stored boardId if present, and on a retry with no stored boardId reconciles by eventId (§1.1d) so it never creates a second board; on any step failure return non-2xx (so Stripe retries + the resume path runs), mark status:done + return 200 only when all steps recorded. Acceptance (PRD end-to-end): drive a test-mode event whose line-item price IS one of the O6 test price_ids — complete a REAL test-mode checkout against an O6 test Payment Link, or `stripe trigger checkout.session.completed --override` pinning the price to an O6 test price_id (a BARE `stripe trigger` mints its own throwaway product/price, can only ever exercise the unknown-price path, and can NEVER validate the price→plan map — do not use it as the happy-path test) → board created + client invited + welcome email delivered (correct planName) + founder alert + day-5 ops card, all within ~5 min; a replayed event id (sequential AND concurrent) produces NO duplicates of any of them; a FORCED failure in one step (e.g. email) does not abort the others, and the Stripe retry RESUMES only the missing step (email) reusing the same board (no second board) — verify resume, not just "alert"; a SIMULATED CRASH after the Trello copy but BEFORE boardId is persisted (kill between the copy call and the record write) → the retry reconciles by eventId and reuses the board — exactly one board for that eventId in the workspace (the §1.1 crash-after-board-copy test, mandatory here); no secrets in logs; lint+tsc+build green. POST-MERGE (operator step, not the build): once this bundle is merged and the test-mode e2e is green, Bruno registers the PROD webhook endpoint + sets the prod STRIPE_WEBHOOK_SECRET (§4 O6 stage 2) — NEVER before this bundle.
```

### §3.5 — Bundle 5

```
Build Bundle 5 (lifecycle events, v1.1) of Codirity client onboarding. Fresh worktree at /Users/brunomaurino/projects/codirity-ob5-lifecycle on branch feat/codirity-ob5-lifecycle (off origin/main). Full spec: docs/HANDOFF-client-onboarding.md "Bundle 5" + Appendix E. Brief: handle the lifecycle events in the webhook (same idempotency + guard rules). CRITICAL (spec-review major): a billing-portal pause — the pause path the welcome email itself advertises — does NOT emit customer.subscription.paused (that event fires only on the trial-end status=paused transition); it emits customer.subscription.updated with pause_collection transitioning to non-null. Handle THREE cases: (1) customer.subscription.deleted (cancel); (2) customer.subscription.updated where data.object.pause_collection is non-null and previous_attributes shows it was null (portal pause — ignore all other .updated deliveries with 200 per §1.5); (3) customer.subscription.paused (trial-end pause, completeness). On any of them, create an ops card "Revoke access — {clientName}" on TRELLO_OPS_BOARD_ID with the Appendix E on-pause/cancel checklist as the description, and fire the founder alert. Optional: pause/cancel confirmation email to the client (behind a flag, off by default). Map subscription→client via the Stripe customer id — PRIMARY: stripe.customers.retrieve(event's customer id) for name/email (the Bundle-1 store is keyed by eventId and is not queryable by customer; treat its stored association as best-effort only). Acceptance: `stripe trigger customer.subscription.deleted` in test mode → one "Revoke access" ops card + founder alert, idempotent on event id; the PAUSE path is exercised via customer.subscription.updated with pause_collection set (pause a test subscription from the billing portal, or `stripe trigger customer.subscription.updated --override` setting pause_collection) → same card + alert — a bare `stripe trigger customer.subscription.paused` alone does NOT validate the real pause path; an .updated event WITHOUT a pause_collection transition → 200 ignore, no card; lint+tsc+build green.
```

---

## 1. Phase 0 — Discovery findings (VERIFIED against the repo, 2026-07-24)

> **Staleness note (2026-08-10):** these findings are as-of 2026-07-24, and the rebuild has since merged.
> `src/config/offer.ts` now carries `stripeLink()` / `NEXT_PUBLIC_STRIPE_LINK_*` env-placeholder Payment
> Links plus the canonical plan copy — treat **offer.ts as the source of truth** for plan names, task
> limits, and links. The "no Stripe code anywhere" bullet is stale in that narrow sense (there is still no
> webhook / server-side Stripe code, which is what matters here). Re-verify against current `main` at build
> time; the dependency baseline (no stripe/resend/KV deps) was re-confirmed 2026-08-10.

- **Stack is all-new.** `package.json` has only `nodemailer` among the relevant deps — **no `stripe`,
  `resend`, `@react-email/*`, Trello client, or any KV/DB**. Every integration in the PRD is net-new.
- **Only one existing API route:** `src/app/api/contact/route.ts` (nodemailer/SMTP via
  `SMTP_HOST/PORT/USER/PASSWORD`, from `"Codirity Contact" <${SMTP_USER}>`). No webhook/Stripe/idempotency
  code anywhere (`grep` clean).
- **No datastore in the repo.** It's a static marketing site on Vercel. The PRD's idempotency dedupe
  ("KV store or DB table") is **net-new infrastructure** — see O1. This is the single most load-bearing
  piece: without it, Stripe's automatic retries duplicate boards + welcome emails.
- **Email duplication risk.** The repo already emails via nodemailer (contact form); the PRD prescribes
  **Resend + React Email** for onboarding. That's a second email mechanism + a new account + domain
  verification (see O2). Decision, not a blocker.
- **Stripe model compatibility.** The rebuild uses **Stripe Payment Links**, which DO fire
  `checkout.session.completed`. From a Payment-Link session you get `customer_details.email`, `.name`
  (often null → handle), and line items → price → product. The `price_id → plan` map (O6) must match the
  exact prices behind the rebuild's Payment Links (rebuild D2) — cross-plan dependency.
- **Deploy:** Vercel serverless route handler is fine for the webhook; App Router's `req.text()` gives the
  raw body needed for signature verification.

## Bundle specifications (reference detail)

*(Each bundle's scope is captured in its §3 launch block above; the load-bearing invariants are in §1.
Client-facing copy is seeded VERBATIM from the PRD Appendices — reproduced in this repo doc so the build
does not depend on the PRD file: see the Appendix copy below.)*

- **Bundle 1** — foundation: route + signature verify + idempotency + `price_id→plan`. Deepest verification
  goes to the idempotency invariant (replay a stored event id → strict no-op).
- **Bundle 2** — Trello module + seed script (Appendix B copy verbatim). Not wired into the webhook yet.
- **Bundle 3** — Resend welcome email (Appendix A verbatim). Not wired yet.
- **Bundle 4** — founder ops + the end-to-end wiring + the PRD's full acceptance test.
- **Bundle 5** — lifecycle (pause/cancel) → revoke-access ops card (Appendix E). Ship after the first client.

## 4. Prerequisites & decisions for Bruno (BEFORE launching this loop)

These are external accounts / config the build cannot create; the loop verifies against them.

- **O0 — Merge policy.** The webhook touches real payments + provisions real client boards/emails. Decide:
  full auto-merge (like the rebuild) or hard-stop for your OK on the webhook bundles (1, 4). *Recommend:
  auto-merge 2/3/5 on green; hard-stop 1 + 4 for a human look, since they're the money/idempotency path.*
- **O1 — Idempotency store.** *Recommend Vercel KV (Upstash Redis)* — native to the Vercel deploy, tiny.
  Enable it in the Vercel dashboard and add its env creds. (Alt: Upstash direct, or a Postgres table.)
- **O2 — Email provider. DECIDED 2026-08-14/15 (operator).** Resend, domain already verified. Sender is
  `support@codirity.com` — matching the site's canonical contact (`src/config/offer.ts` `CONTACT_EMAIL`),
  NOT the `hello@codirity.com` this section originally proposed. Bundle 3 sends from support@ with
  Bruno's address as reply-to.
- **O3 — Trello.** API key + token (which account owns the client boards?), a workspace for client boards
  — capture its id as `TRELLO_WORKSPACE_ID` (client boards are created with `idOrganization` set to it,
  and the §1.1d reconcile filters on it) — and the ops board ID (`TRELLO_OPS_BOARD_ID`). The
  `seed-trello-template` script (Bundle 2) produces the template board ID.
- **O4 — Founder alert channel.** DECIDED (Bundle 4): plain email, via the existing nodemailer/SMTP
  transporter already used by `api/contact/route.ts` (`SMTP_HOST/PORT/USER/PASSWORD`), to
  `FOUNDER_ALERT_EMAIL`. Not Slack, not Resend — avoids a second alert channel and the still-missing
  `RESEND_API_KEY` for an internal alert that doesn't need React Email templating.
- **O5 — Access form (Tally).** Build the Tally form from Appendix C; the public URL becomes the
  `ACCESS_FORM_URL` env var (the source of the `{accessFormUrl}` placeholder). No build in v1.
- **O6 — Stripe webhook + prices — TWO-STAGE (spec-review blocker, 2026-08-10).** **Stage 1 (at launch):**
  register the endpoint (`/api/webhooks/stripe`) in **TEST mode only**, capture the test
  `STRIPE_WEBHOOK_SECRET`, and give the exact `price_id`s for Standard / Pro / Founding — test AND live
  (must match the rebuild's Payment Links, D2 — note D2 shipped env-placeholder links, so the real Payment
  Links + prices may still need to be CREATED first). **Stage 2 (ONLY after Bundle 4 merges + test e2e
  green):** register the PROD endpoint + set the prod secret. Registering prod earlier means a real
  checkout gets 200-ACKed by a handler with no provisioning behind it — Stripe stops retrying, the event is
  marked done, and that paying client silently never gets a board or email.
  **⚠️ Enabled-events list, updated by Bundle 5 (spec-review MAJOR, 2026-08-16):** whichever endpoint object
  you register (test now, prod later) MUST have ALL FOUR of these event types enabled, not just the
  original one — `checkout.session.completed`, `customer.subscription.deleted`,
  `customer.subscription.updated`, `customer.subscription.paused`. If the endpoint's enabled-events list is
  ever narrowed to only `checkout.session.completed` (e.g. a Dashboard default that doesn't auto-pick up
  new code), Bundle 5's entire lifecycle-event flow is a SILENT no-op in that environment — no delivery
  reaches the route at all, so nothing in the code can detect or alert on it.
  **Stage 1 DONE 2026-08-16.** Verified via the Stripe API that zero persistent webhook endpoint
  objects existed on this account before this — all prior local testing (Bundles 1-5) used `stripe
  listen --forward-to`, an ephemeral CLI tunnel, never a real Dashboard/API Endpoint. Registered a
  real TEST-mode endpoint (`we_1U54KNLphcTHVMXGPo6vti6S`) at `https://www.codirity.com/api/webhooks/stripe`
  (operator confirmed this is the correct target — `www.` since the bare `codirity.com` apex
  307-redirects there) with all four event types enabled. **Operator action still required:** set
  `STRIPE_WEBHOOK_SECRET` for this endpoint in Vercel's env for whichever environment serves
  `www.codirity.com` — the secret was generated at registration time and is NOT stored in this repo
  (Stripe only shows it once); get it from the Stripe Dashboard → Webhooks → this endpoint, or from
  wherever it was shared with you out-of-band. Until that env var is set, deliveries to this endpoint
  will fail signature verification (400), not silently succeed — safe, but non-functional until set.
  **Stage 2 (prod) still NOT done** — do this only after confirming Stage 1 works end-to-end with a
  real test-mode event.
- **O7 — Secure credential handoff (Bitwarden Send, decided 2026-08-14).** Free, no vault infrastructure
  to run: the client creates a one-time encrypted Bitwarden Send link (bitwarden.com/send) and drops it in
  the access form (Appendix C, Q10) — no account needed on their end, no per-client invite for Bruno to
  manage. Bruno opens it once and moves anything long-lived into his own secrets manager (process, not
  code; Appendix C references it).
- **O8 — Sequencing.** Launch this loop only after the rebuild loop has merged all its bundles.
  **SATISFIED 2026-08-10** — the rebuild merged completely (PRs #1–#7); the general one-loop-at-a-time
  rule still applies to any other loop (e.g. redesign).
- **O9 — Stripe Customer portal. TEST mode DONE 2026-08-15.** Created a `billing_portal.configuration`
  (`bpc_1U4pvOLphcTHVMXGAilKaXif`) with `login_page.enabled=true`, giving a permanent login link
  (`STRIPE_BILLING_PORTAL_URL`) — the welcome-email footer uses this; per-session portal URLs are
  single-use and must never go in an email. The configuration's FEATURES (cancellation flow/proration,
  whether to model Codirity's "pause, days banked" policy vs. Stripe's built-in subscription-pause,
  which fields customers can self-edit) were set to a reasonable default, not a reviewed business
  decision — revisit in the Stripe Dashboard at your convenience; the login link itself won't change if
  you edit them later. **LIVE mode is a separate, later step** (same two-stage pattern as O6): repeat
  with `--live` before real launch.

## 5. Out of scope (v1)
Native access-form page (Tally in v1, native in v2), a client dashboard/portal, automated secret exchange
(the Bitwarden Send link is client-initiated, no invite to manage), analytics on onboarding funnel,
multi-seat/team provisioning.

## 6. Acceptance (whole plan) — from the PRD
1. End-to-end in test mode with a REAL O6 test price (real test Payment-Link checkout, or `stripe trigger --override` pinning an O6 test price_id — never a bare `stripe trigger`, which mints a throwaway price and can't validate the plan map): board created + invite sent + email delivered with correct planName + ops card created, < 5 min.
2. Invalid signature → 400; replayed event id → no duplicate board/email/card.
3. Trello board matches Appendix B exactly (lists, card order, copy).
4. No secrets in logs; all keys via env.

---

## Appendix copy (seed VERBATIM — do not paraphrase)

> Reproduced inline so the build is self-contained (bundles run in worktrees off the repo and cannot see
> the PRD file). Bundles 2/3/4/5 seed this **verbatim**. `{curlyPlaceholders}` are template variables.

### Appendix A — Welcome email (Bundle 3)

**Subject:** Welcome to Codirity — your board is ready

Hi {clientName},

Welcome aboard! Here's everything you need to get rolling — no meetings required.

**1. Your request board**
We've set up your private board: {boardUrl}
Accept the invite and you're live. Everything about how to work with us lives on the board itself — start with the "👋 Start here" card.

**2. Add your first request today**
Seriously — do it now, even if it's rough. Write it, link a doc, or record a quick Loom. We'll pick the fastest win in your queue and aim to deliver within 2–3 business days.

**3. Grant us access (5 minutes)**
To ship automations and code we'll need access to your tools: {accessFormUrl}
Important: never paste passwords or API keys into Trello or email — the form explains how to share them securely.

That's it. All communication happens in card comments, and I personally reply to everything.

Bruno
Founder, Codirity

P.S. You're on the {planName} plan — pause or cancel anytime from the billing portal link in this email's footer.

### Appendix B — Trello template board (Bundle 2)

**Board name (template):** `[TEMPLATE] Codirity Client Board`
**Lists (left → right):** `👋 Start Here` · `📥 Backlog` · `⏭️ Up Next` · `🔨 In Progress` · `👀 In Review` · `✅ Done`

**Cards in "👋 Start Here":**

**Card 1 — "👋 Start here — how this works"**
Welcome! This board is your direct line to Codirity. The short version:
1. Add requests to 📥 Backlog — as many as you want.
2. Drag your priorities to ⏭️ Up Next. We always pull from the top.
3. We move tasks to 🔨 In Progress ({activeTasksNote}).
4. Delivered work lands in 👀 In Review — comment with changes (unlimited revisions) or drag to ✅ Done.
All communication happens in card comments. No meetings, no status calls — unless you book one.

**Card 2 — "How to write a great request"**
Any format works: plain text, a linked Google Doc, a Loom video, screenshots, a Figma link. If it can be linked here, it's fair game. A great request answers three things: • What do you want? (the outcome, not the implementation) • Why? (the business context helps us make better calls) • What does "done" look like? Don't overthink it — we'll ask in the comments if anything's unclear.

**Card 3 — "What counts as one task"**
A task is something we can ship in roughly 1–2 days: an automation, an AI agent integration, an API connection, a scraper, a dashboard view, a landing page, a web feature, a bug fix. Bigger projects? Totally fine — we break them down on our end and deliver progress every 24–48h until done. Out of scope: native mobile apps from scratch, 24/7 on-call, managing your infra, fixed-deadline contracts, massive data migrations.

**Card 4 — "Delivery & communication"**
Average delivery: 2–3 business days per task (complex ones can take longer — we'll tell you upfront in the card). We work async from GMT-3, and you'll typically see progress overnight if you're in the US. Everything ships with a short Loom or written summary of what we did and how to use it.

**Card 5 — "Pausing & billing"**
Billing cycles are 31 days. Pause anytime: unused days are banked and available whenever you return. Cancel anytime, no questions. First week not working for you? 75% back, no questions asked.

**Card 6 — "🔐 Grant us access (do this first)"**
Before we can ship, we need access to your tools: {accessFormUrl}
Security rules we live by: • Never paste passwords or API keys in Trello, email, or Loom. • Share credentials with us via a secure one-time link (Bitwarden Send — no account needed) or your own secrets manager. • We request least-privilege access and keep a registry of everything you grant us — when you pause or cancel, we revoke it all and confirm in writing.

**Card 7 — "✍️ Example request (steal this format)"** _(place in 📥 Backlog)_
Title: Auto-sync new Stripe customers to our CRM
What: When someone subscribes in Stripe, create/update the contact in HubSpot with plan + MRR, and tag them "customer".
Why: Sales is copy-pasting this manually every morning (~30 min/day).
Done looks like: New test subscription appears in HubSpot within 1 minute, correctly tagged. Loom walkthrough included.

### Appendix C — Access & kickoff form (Tally) (Bruno builds; Bundle references the URL)

**Intro text:** This takes ~5 minutes and unblocks everything. Skip anything that doesn't apply — we'll follow up in your board.

**Fields:**
1. Company name + website
2. What should we build or automate first? Top 3, in your words (long text)
3. What does success look like in 90 days? (long text)
4. Current stack & key tools (CRM, hosting, frameworks, no-code tools…) (long text)
5. GitHub org or repo URLs (we'll request an invite — never send credentials)
6. Hosting/cloud provider + who manages DNS
7. Third-party services we'll likely touch (Stripe, HubSpot, Zapier, etc.)
8. How will you share credentials? ○ Send us a secure one-time link (E.G: Bitwarden Send) ○ Use my own secrets manager (tell us which) ○ Not sure — help me
9. Anything we should NOT touch? (production systems, data, tools) (long text)
10. Best email for the secure link
11. Anything else we should know? (long text)

### Appendix D — Day-5 check-in (Bundle 4 — comment on their most recent card, or email)

Hey {clientName} — quick pulse check, no reply pressure. How's the first week feeling? Anything about the rhythm, the deliveries, or how we communicate that you'd tweak? If something's off, tell me straight — I'd rather fix it now. And if you're happy, the best thing you can do is load up that backlog 🙂

### Appendix E — Internal per-client ops checklist (Bundle 5 — founder only)

**On signup:** verify board invite accepted · access form received · credentials in vault (never elsewhere) · access registry started (tool, permission level, date granted) · first task identified & scheduled
**On pause/cancel:** revoke all access (walk the registry) · remove from vault · transfer any repos/assets they own · confirmation email sent · registry archived
