# HANDOFF — Codirity Client Onboarding: Automation + Content Kit

**Derived from:** PRD "Codirity Client Onboarding: Automation + Content Kit" (Bruno, v1, 2026-07-24)
**Author of handoff:** Claude Code · **Date:** 2026-07-24
**Repo:** `~/projects/codirity` (Next.js 16, App Router) · **Deploy:** Vercel (`www.codirity.com`)
**Consumer:** `/autonomous-bundle-loop` → `/autonomous-task` (one bundle = one PR).

> **Sequencing (load-bearing):** this plan lives in the SAME repo as the subscription rebuild, which is
> currently shipping via its own `/autonomous-bundle-loop`. **Do not run this loop until the rebuild loop
> has fully merged** — concurrent loops on the same repo/`main` race each other's fast-forwards, and the
> onboarding webhook's `price_id → plan` map depends on the rebuild's Stripe Payment Links being finalized
> (rebuild decision D2). Onboarding is otherwise near-independent (all-new files: `api/webhooks/stripe`,
> `lib/onboarding/`, `scripts/`, email templates) — near-zero overlap with the rebuild's SEO/landing bundles.

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
   - **(a) Atomic reservation WITH A LEASE.** Reserve `event.id` with an *atomic set-if-absent that also
     writes a lease expiry* (Vercel KV `SET key <record> NX EX <leaseSeconds>` — e.g. 90s; or a DB row
     with `INSERT … ON CONFLICT DO NOTHING` + a `lease_until` column). The value written IS the initial
     event record (so reservation and record are one atomic write). Only the delivery that WINS proceeds.
   - **(b) Deterministic action when the key is already present** (this is the piece the first draft left
     contradictory — one rule, no ambiguity):
     · `status: done` → return **200** (no-op, the work is finished).
     · reserved, not done, **lease still valid** → another worker is live; return **non-2xx (5xx)** so
       Stripe retries later — do NOT touch the event.
     · reserved, not done, **lease EXPIRED** (previous worker crashed) → atomically renew the lease (take
       over) and **resume the missing steps**. A live winner and a crashed one are distinguished by the
       lease, so there is exactly one action per state — never both "do nothing" and "resume" at once.
   - **(c) Per-step records + resume.** Record each step's completion under the event record
     `{ boardId, boardUrl, inviteSent, emailSent, alertSent, cardId, status, lease_until }`. On resume,
     do only the steps whose record is missing. Mark `status: done` and return **200** only after every
     step is recorded; on any step failure return **non-2xx** (so Stripe retries and the resume path runs)
     AND fire the founder alert. Recovery is by safe resume, never "alert and give up".
   - **(d) The non-idempotent Trello board-copy needs its OWN reconcile** (the reserve→copy→persist-id
     window: a crash after Trello returns the board but before `boardId` is stored would otherwise make a
     SECOND board). Stamp the `eventId` into the copied board (in its description) at creation; **before
     copying, search the workspace for an existing board whose description carries this `eventId` and
     REUSE it** if found. This closes the post-copy/pre-persist window — `POST /1/boards/?idBoardSource`
     has no idempotency key, so the reconcile is the only thing that makes the copy effectively
     exactly-once. (Do NOT over-claim "a retry never double-provisions" without this reconcile in place.)
   This is where an error hurts most (duplicate board + duplicate welcome email, or a silently-dropped
   email, to a paying client) — spend the deepest verification here. Test **concurrent** replay (reserve
   once), **forced-single-step-failure → retry resumes** the missing step reusing the same board, AND a
   **crash-after-board-copy** case (the reconcile finds and reuses the board, no second board).
2. **Raw body for signature verification.** In App Router, read the raw payload with `await req.text()`
   and pass it to `stripe.webhooks.constructEvent(rawBody, sig, secret)`. Do **not** `await req.json()`
   first — parsing mutates the body and breaks signature verification.
3. **No secrets in logs.** Log event id + type + plan only; never customer PII, keys, or full payloads.
   Client credentials NEVER flow through Trello/email (that's the access form + 1Password, §4 O5/O7).
4. **Side effects are independently guarded AND per-step recorded (§1.1c).** Wrap each of Trello /
   invite / email / founder-alert / ops-card in its own try/catch; on success, record that step's
   completion (and any id it produced) in the event record before the next step. A step failure does not
   abort the *remaining independent* steps, but the handler then returns **non-2xx** (per §1.1c —
   returning 200 would tell Stripe to STOP retrying and permanently strand the failed step) so a Stripe
   retry re-enters and resumes only the missing steps (each guarded by its per-step record so completed
   steps are skipped, not re-run). Also surface the partial failure via the founder alert + logs. Return
   200 only when every step has its completion record and `status: done`.
5. **Unhandled event types → 200 + ignore.** Only `checkout.session.completed` (v1) and the Phase-5
   subscription events (v1.1) do work.
6. **All env via Vercel** (Production + Preview scoped): `STRIPE_WEBHOOK_SECRET`, `STRIPE_SECRET_KEY`,
   `TRELLO_KEY`, `TRELLO_TOKEN`, `TRELLO_TEMPLATE_BOARD_ID`, `TRELLO_OPS_BOARD_ID`, `RESEND_API_KEY`,
   `FOUNDER_ALERT_WEBHOOK_URL`, plus the idempotency-store creds (§4 O1). Document all in `.env.example`.
7. **Gate list per touched file:** `npm run lint` AND `npx tsc --noEmit` AND `npm run build`.
8. **All copy in English**, seeded verbatim from the PRD Appendices (A–E) — do not paraphrase client-facing copy.

## §2 — Bundle status surface

| Bundle | Scope | Depends on | Status | PR # | Merge SHA |
|---|---|---|---|---|---|
| **1** | Stripe webhook endpoint + idempotency store + `price_id → plan` map | O1, O6 | [ ] not started | — | — |
| **2** | Trello provisioning module + `seed-trello-template` script | 1, O3 | [ ] not started | — | — |
| **3** | Welcome email (Resend + React Email, Appendix A) | 1, O2 | [ ] not started | — | — |
| **4** | Founder ops (alert + day-5 card) + wire 2/3/4 into the webhook end-to-end | 2, 3, O4 | [ ] not started | — | — |
| **5** | Lifecycle events (pause/cancel → revoke card, Appendix E) — v1.1 | 4 | [ ] not started | — | — |

## §3 — Per-bundle launch commands

Each block is the verbatim `/autonomous-task` brief; the loop appends `--bundle-id` + `--plan-slug`. Full
scope + acceptance is in "Bundle specifications" below.

### §3.1 — Bundle 1

```
Build Bundle 1 (Stripe webhook + idempotency) of Codirity client onboarding. Fresh worktree at /Users/brunomaurino/projects/codirity-ob1-webhook on branch feat/codirity-ob1-webhook (off origin/main). Full spec + acceptance: docs/HANDOFF-client-onboarding.md "Bundle 1" + §1. Brief: add the `stripe` dependency and POST /api/webhooks/stripe (App Router route handler). Read the RAW body via await req.text() (never req.json() first) and verify with stripe.webhooks.constructEvent(raw, sig, STRIPE_WEBHOOK_SECRET) — invalid signature → 400. Handle checkout.session.completed only (all other types → 200 ignore). Idempotency per §1.1 (load-bearing): reserve event.id with an ATOMIC set-if-absent + LEASE (Vercel KV `SET <record> NX EX 90` / DB row with lease_until) in the §4 O1 store BEFORE any side effect — the NX value IS the initial record. Only the winner proceeds; a delivery finding the key present follows the deterministic §1.1b rule (done→200; lease-valid→non-2xx retry-later; lease-expired→take over + resume). Establish the durable event-record schema the later bundles extend: {eventId, customerId, email, plan, boardId?, boardUrl?, inviteSent?, emailSent?, alertSent?, cardId?, status, lease_until} — also carries the customerId→boardId/clientName association Bundle 5 needs. Extract customer email (session.customer_details.email), name (session.customer_details.name — may be null, fall back gracefully), and plan via a price_id→plan map; the price_id comes from the session's line items (may need stripe.checkout.sessions.listLineItems / expand — STRIPE_SECRET_KEY is provisioned for that), map in lib/onboarding/plans.ts, fail loudly on an unknown price id via the founder alert. No PII in logs. In this bundle the handler reserves + records the event + logs the parsed {email, plan}; side effects are added in Bundles 2-4. Add all env to .env.example. Acceptance: `stripe trigger checkout.session.completed` in test mode returns 200 and reserves+records the event; invalid signature → 400; SEQUENTIAL replay of the same event id is a no-op; CONCURRENT replay (two overlapping deliveries of the same event id) reserves exactly once (only one record, no double-processing) — this is the load-bearing test, not just sequential; unknown price id fires the founder-alert path (stub ok) not a crash; lint+tsc+build green.
```

### §3.2 — Bundle 2

```
Build Bundle 2 (Trello provisioning) of Codirity client onboarding. Fresh worktree at /Users/brunomaurino/projects/codirity-ob2-trello on branch feat/codirity-ob2-trello (off origin/main; Bundle 1 merged). Full spec: docs/HANDOFF-client-onboarding.md "Bundle 2" + Appendix B. Brief: lib/onboarding/trello.ts — copyBoard(clientName, eventId): FIRST reconcile per §1.1d — search the workspace for an existing board whose description carries this eventId (a marker like "codirity-event:{eventId}") and REUSE it if found (closes the crash-after-copy/pre-persist window; the copy has no idempotency key). Else copy TRELLO_TEMPLATE_BOARD_ID via POST /1/boards/?idBoardSource=... (keepFromSource=cards), rename to "Codirity × {clientName}", and write "codirity-event:{eventId}" into the new board's description. Then invite the client email as a normal member (POST /1/boards/{id}/members). Return the board id + URL. All via fetch with TRELLO_KEY/TRELLO_TOKEN; guarded per §1.4. ALSO scripts/seed-trello-template.ts — a one-off Node script that builds the "[TEMPLATE] Codirity Client Board" from Appendix B VERBATIM (lists 👋 Start Here · 📥 Backlog · ⏭️ Up Next · 🔨 In Progress · 👀 In Review · ✅ Done; the 7 Start-Here/Backlog cards with exact copy, {activeTasksNote} and {accessFormUrl} left as template placeholders per Appendix B) and prints the board ID for TRELLO_TEMPLATE_BOARD_ID. Do NOT wire trello.ts into the webhook yet (Bundle 4 does the wiring). Acceptance: running the seed script against a test Trello workspace creates a board matching Appendix B exactly (lists, card order, copy); trello.ts unit-invoked copies+renames+invites and returns a URL; no secrets in logs; lint+tsc+build green.
```

### §3.3 — Bundle 3

```
Build Bundle 3 (welcome email) of Codirity client onboarding. Fresh worktree at /Users/brunomaurino/projects/codirity-ob3-email on branch feat/codirity-ob3-email (off origin/main). Full spec: docs/HANDOFF-client-onboarding.md "Bundle 3" + Appendix A. Brief: add `resend` + `@react-email/components`; lib/onboarding/email.ts sends the Appendix A welcome email via Resend from hello@codirity.com, reply-to Bruno's address, using a React Email template with variables clientName (fallback "there" if null), boardUrl, accessFormUrl, planName. Copy is Appendix A VERBATIM (subject "Welcome to Codirity — your board is ready"; the 3 numbered steps; the P.S. with plan name + billing-portal note). Include the Stripe billing-portal link in the footer (from the session's customer, or a configured portal URL). Do NOT wire into the webhook yet (Bundle 4). Guarded per §1.4. Acceptance: a local send (test API key or Resend test mode) renders the template with all variables filled and no missing-var placeholders; from/reply-to correct; lint+tsc+build green. NOTE: hello@codirity.com must be a Resend-verified domain sender (§4 O2) — flag if unverified rather than failing silently.
```

### §3.4 — Bundle 4

```
Build Bundle 4 (founder ops + end-to-end wiring) of Codirity client onboarding. Fresh worktree at /Users/brunomaurino/projects/codirity-ob4-ops on branch feat/codirity-ob4-ops (off origin/main; Bundles 1-3 merged). Full spec: docs/HANDOFF-client-onboarding.md "Bundle 4" + Appendices D. Brief: lib/onboarding/ops.ts — (a) founder alert on new client via FOUNDER_ALERT_WEBHOOK_URL (Slack incoming webhook or email per §4 O4): "New client: {name} — {plan}"; (b) create a check-in card on TRELLO_OPS_BOARD_ID titled "Day-5 check-in — {clientName}", due +5 BUSINESS days (skip weekends), description = Appendix D copy verbatim. THEN wire Bundles 2/3/4 into /api/webhooks/stripe: on a reserved checkout.session.completed (§1.1), orchestrate trello.copyBoard(clientName, eventId) → email.sendWelcome (boardUrl from trello) → ops.alertFounder + ops.createCheckin, each independently guarded (§1.4) and RECORDING its per-step completion (+ any id) in the event record before the next step; the board copy REUSES a stored boardId if present, and on a retry with no stored boardId reconciles by eventId (§1.1d) so it never creates a second board; on any step failure return non-2xx (so Stripe retries + the resume path runs), mark status:done + return 200 only when all steps recorded. Acceptance (PRD end-to-end): `stripe trigger checkout.session.completed` in test mode → board created + client invited + welcome email delivered + founder alert + day-5 ops card, all within ~5 min; a replayed event id (sequential AND concurrent) produces NO duplicates of any of them; a FORCED failure in one step (e.g. email) does not abort the others, and the Stripe retry RESUMES only the missing step (email) reusing the same board (no second board) — verify resume, not just "alert"; no secrets in logs; lint+tsc+build green.
```

### §3.5 — Bundle 5

```
Build Bundle 5 (lifecycle events, v1.1) of Codirity client onboarding. Fresh worktree at /Users/brunomaurino/projects/codirity-ob5-lifecycle on branch feat/codirity-ob5-lifecycle (off origin/main). Full spec: docs/HANDOFF-client-onboarding.md "Bundle 5" + Appendix E. Brief: handle customer.subscription.paused and customer.subscription.deleted in the webhook (same idempotency + guard rules). On either, create an ops card "Revoke access — {clientName}" on TRELLO_OPS_BOARD_ID with the Appendix E on-pause/cancel checklist as the description, and fire the founder alert. Optional: pause/cancel confirmation email to the client (behind a flag, off by default). Map subscription→client via the Stripe customer id (store the customer→clientName/boardId association at onboarding time in Bundle 1's store, or look it up via the Stripe customer). Acceptance: `stripe trigger customer.subscription.deleted` (and .paused) in test mode → one "Revoke access" ops card + founder alert, idempotent on event id; lint+tsc+build green.
```

---

## 1. Phase 0 — Discovery findings (VERIFIED against the repo, 2026-07-24)

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
- **O2 — Email provider.** *Recommend Resend* (per PRD; React Email templating). Create the account, verify
  the `codirity.com` domain, and confirm `hello@codirity.com` as a sender + Bruno's reply-to. (Alt: reuse
  the existing nodemailer/SMTP — cheaper, uglier templating.)
- **O3 — Trello.** API key + token (which account owns the client boards?), a workspace for client boards,
  and the ops board ID (`TRELLO_OPS_BOARD_ID`). The `seed-trello-template` script (Bundle 2) produces the
  template board ID.
- **O4 — Founder alert channel.** Slack incoming webhook URL, or a plain email address. *Recommend Slack if
  you have a workspace, else email.*
- **O5 — Access form (Tally).** Build the Tally form from Appendix C; give the loop the public URL for
  `accessFormUrl`. No build in v1.
- **O6 — Stripe webhook + prices.** Register the endpoint (`/api/webhooks/stripe`) in Stripe (test + prod),
  capture `STRIPE_WEBHOOK_SECRET`, and give the exact `price_id`s for Standard / Pro / Founding (must match
  the rebuild's Payment Links, D2).
- **O7 — 1Password shared vault** for client secrets (process, not code; Appendix C references it).
- **O8 — Sequencing.** Launch this loop only after the rebuild loop has merged all its bundles.

## 5. Out of scope (v1)
Native access-form page (Tally in v1, native in v2), a client dashboard/portal, automated secret exchange
(1Password invite is manual), analytics on onboarding funnel, multi-seat/team provisioning.

## 6. Acceptance (whole plan) — from the PRD
1. Stripe CLI end-to-end in test mode: board created + invite sent + email delivered + ops card created, < 5 min.
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
3. We move one task at a time to 🔨 In Progress ({activeTasksNote}).
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
Security rules we live by: • Never paste passwords or API keys in Trello, email, or Loom. • We'll send you a 1Password shared-vault invite (or use your own secrets manager). • We request least-privilege access and keep a registry of everything you grant us — when you pause or cancel, we revoke it all and confirm in writing.

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
8. How will you share credentials? ○ Accept our 1Password vault invite ○ Your own secrets manager (tell us which) ○ Not sure — help me
9. Anything we should NOT touch? (production systems, data, tools) (long text)
10. Best email for the 1Password invite
11. Anything else we should know? (long text)

### Appendix D — Day-5 check-in (Bundle 4 — comment on their most recent card, or email)

Hey {clientName} — quick pulse check, no reply pressure. How's the first week feeling? Anything about the rhythm, the deliveries, or how we communicate that you'd tweak? If something's off, tell me straight — I'd rather fix it now. And if you're happy, the best thing you can do is load up that backlog 🙂

### Appendix E — Internal per-client ops checklist (Bundle 5 — founder only)

**On signup:** verify board invite accepted · access form received · credentials in vault (never elsewhere) · access registry started (tool, permission level, date granted) · first task identified & scheduled
**On pause/cancel:** revoke all access (walk the registry) · remove from vault · transfer any repos/assets they own · confirmation email sent · registry archived
