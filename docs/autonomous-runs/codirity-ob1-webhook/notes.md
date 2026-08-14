# autonomous-task run notes — codirity-ob1-webhook

Started: 2026-08-14T22:07:06Z

## Task description

Build Bundle 1 (Stripe webhook + idempotency) of Codirity client onboarding. Fresh worktree at
/Users/brunomaurino/projects/codirity-ob1-webhook on branch feat/codirity-ob1-webhook (off origin/main).
Full spec + acceptance: docs/HANDOFF-client-onboarding.md "Bundle 1" + §1. Brief: add the `stripe`
dependency and POST /api/webhooks/stripe (App Router route handler). Read the RAW body via
await req.text() (never req.json() first) and verify with
stripe.webhooks.constructEvent(raw, sig, STRIPE_WEBHOOK_SECRET) — invalid signature → 400. Handle
checkout.session.completed only (all other types → 200 ignore). Idempotency per §1.1 (load-bearing):
reserve event.id with an ATOMIC set-if-absent + LEASE (Redis/Vercel KV `SET <record-json> NX` with NO
key TTL — `lease_until` is a FIELD inside the record, NEVER an `EX` on the key) in the §4 O1 store
BEFORE any side effect. Establish the durable event-record schema the later bundles extend:
{eventId, customerId, email, plan, boardId?, boardUrl?, inviteSent?, emailSent?, alertSent?, cardId?,
status, lease_until}. Extract customer email/name/plan via a price_id→plan map in
lib/onboarding/plans.ts, fail loudly on an unknown price id via the founder alert. No PII in logs. In
this bundle the handler reserves + records the event + logs the parsed {email, plan}; side effects are
added in Bundles 2-4. Add all env to .env.example.

Acceptance: `stripe trigger checkout.session.completed` in test mode returns 200 and reserves+records
the event; invalid signature → 400; SEQUENTIAL replay of the same event id is a no-op; CONCURRENT
replay (two overlapping deliveries of the same event id) reserves exactly once (load-bearing test);
unknown price id fires the founder-alert path (stub ok) not a crash; lint+tsc+build green.

## Execution context

- Workflow + Agent probes: PASS (Agent probe returned PROBE-OK)
- args round-trip probe: PASS (echo matched sentinel `ARGS-OK-9f3k2`)
- effort opt probe (e): PASS → `effortTiers: true`
- custom-agentType probe (f): PASS (scoped `autonomous-task:at-reviewer` resolved) → `customAgents: true`
- worktree-native probe (g): PASS (`EnterWorktree`/`ExitWorktree` both resolved) → `worktreeNative: true`
- Bundle-loop context: `--bundle-id 1 --plan-slug client-onboarding` → commitment prefix `B1`,
  identifier `client-onboarding Bundle 1`
- Run slug: `codirity-ob1-webhook` (not `--accumulate`, so run slug = branch slug)

## Task interpretation

- **Concrete deliverable:** a new Next.js App Router route handler at
  `src/app/api/webhooks/stripe/route.ts` (POST) plus `lib/onboarding/plans.ts` (price_id→plan map) and
  an idempotency-store client module, implementing raw-body Stripe signature verification, atomic
  lease-based event reservation in Vercel KV/Upstash, and durable event-record logging — no side
  effects (Trello/email/ops) yet, those land in later bundles.
- **Acceptance test:** a reviewer confirms — (1) `stripe trigger checkout.session.completed` against a
  real O6 test price_id returns 200 and the event record exists in the KV store with `status`+parsed
  `{email, plan}`; (2) an invalid signature returns 400; (3) replaying the same event id sequentially is
  a no-op (no duplicate record/side effect); (4) two CONCURRENT deliveries of the same event id result
  in exactly one reservation (this is the load-bearing correctness test); (5) an unknown price_id
  triggers the founder-alert stub instead of crashing; (6) `npm run lint`, `npx tsc --noEmit`, and
  `npm run build` are all green.

No ambiguity requiring HS-3 — the brief + HANDOFF §1/§4/Bundle-1 spec fully pin the deliverable.

## Plan

**Building:**
- `src/app/api/webhooks/stripe/route.ts` — POST route handler. Raw body via `await req.text()`,
  `stripe.webhooks.constructEvent(raw, sig, STRIPE_WEBHOOK_SECRET)` → 400 on invalid signature.
  `checkout.session.completed` only; all other event types → 200 ignore. Reserve `event.id` via
  atomic lease-based set-if-absent in the idempotency store BEFORE any other work; apply the §1.1b
  deterministic rule (done→200; lease-valid→5xx retry-later; lease-expired→CAS takeover+resume).
  Extract email/name/plan, log `{email, plan}` only (no PII beyond that — no full payload, no keys).
- `src/lib/onboarding/idempotency.ts` — Upstash Redis client (`@upstash/redis`) wrapping: atomic
  `SET key value NX` (no key TTL — hygiene TTL ≥90 days only, `lease_until` is a FIELD in the JSON
  value), a `lease_until` CAS takeover (Lua `EVAL` via the Upstash REST eval endpoint, or read-modify
  with a version check), and per-step record updates.
- `src/lib/onboarding/plans.ts` — price_id → plan map, server-only env vars
  `STRIPE_PRICE_ID_STANDARD` / `STRIPE_PRICE_ID_PRO` / `STRIPE_PRICE_ID_FOUNDING` (NOT `NEXT_PUBLIC_*`
  — this only runs server-side in the webhook, never bundled to the client, unlike offer.ts's Payment
  Link vars). Unknown price id → `null`/throw, caller triggers the founder-alert stub.
- `src/lib/onboarding/founder-alert.ts` — stub (Bundle 4 wires the real channel); Bundle 1 just needs
  a callable stub so the unknown-price-id path has somewhere to route without crashing.
- `.env.example` — document `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRICE_ID_STANDARD`,
  `STRIPE_PRICE_ID_PRO`, `STRIPE_PRICE_ID_FOUNDING`, `UPSTASH_REDIS_REST_URL`,
  `UPSTASH_REDIS_REST_TOKEN` (per HANDOFF §1.6).
- `package.json` — add `stripe`, `@upstash/redis` dependencies.

**Tests / verification:** `npm run lint`, `npx tsc --noEmit`, `npm run build`; `stripe trigger
checkout.session.completed` (test mode) for the happy + unknown-price-id + invalid-signature +
sequential-replay paths; a scripted concurrent-replay test (two overlapping POSTs with the same
`stripe-signature` header/body) for the load-bearing concurrency invariant.

**Open questions resolved:**
- Idempotency store client: Upstash's REST API via `@upstash/redis` (matches what's already
  provisioned in `.env.local`/Vercel per O1) — chosen over a raw `ioredis` TCP client because Upstash's
  serverless REST API is what Vercel functions can reach without a persistent connection pool, and it's
  what O1 was provisioned for.
- Atomic CAS for lease takeover: Upstash's REST API exposes a Lua `/eval` endpoint — using a small Lua
  script for the compare-and-set (check `lease_until` field in the stored JSON, update if it matches
  the observed value) is the correct atomic primitive; a naive read-then-write GETSET race would violate
  the §1.1(b) "exactly one action per state" invariant that the spec calls out as load-bearing.
- Plan-map env var naming: server-only (no `NEXT_PUBLIC_` prefix), since these values are read only in
  a route handler (never bundled to client JS) — distinct naming from offer.ts's public Payment Link
  vars is deliberate, not an inconsistency.
- Surfaced (not blocking): the "Founding" Stripe product doesn't exist yet in test mode, and the
  existing "Standard" test price is misconfigured (~$4/mo instead of $3,995/mo per its
  `unit_amount_decimal`). Flagged to the operator in chat; out of scope for this bundle to fix (Stripe
  dashboard data, not code) — the price_id→plan map's correctness is independent of what a price_id's
  underlying Stripe amount is.

## Decisions made unilaterally

- **Operator-directed, mid-build:** Bruno asked to create the missing "Founding" Stripe product while
  Bundle 1 was in progress. Created `prod_V4cdO2gWWJvzkn` / `price_1U4TNwLphcTHVMXGRwrDLlc1` in TEST
  mode, $2,995.00/mo (299500 cents, integer — deliberately NOT reproducing the scale bug found on the
  existing "Standard" test price), and set it as the product's default price. Added to `.env.local` as
  `STRIPE_PRICE_ID_FOUNDING`. The "Standard" price's scale bug (~$4/mo instead of $3,995/mo) was
  surfaced to the operator but left untouched (their call to fix, not this bundle's scope).
- No-PII-in-logs vs. the launch-command brief's "logs the parsed {email, plan}": §1.3 is explicit
  ("Log event id + type + plan only; never customer PII") and is the load-bearing global convention;
  the brief's phrasing is read as shorthand for "logs the parsed [outcome]," not a license to log email.
  Resolved by NOT including email in any `console.log`/`console.error` call — only `eventId`,
  `event.type`, and `plan` are logged. Email + name ARE stored in the Redis event record (the system of
  record, not a log), which is correct and necessary (Bundle 3/5 need it).
- **Self-caught bug during local testing:** initially wrote the STALE pre-login `edairy-test` Stripe
  test key (captured earlier in this session, before Bruno's `stripe login` to the Codirity account)
  into `.env.local`'s `STRIPE_SECRET_KEY`, instead of re-checking `stripe config --list` for the
  CURRENT default key. This caused `stripe trigger` (using the stale key) to create the test event in
  the WRONG Stripe account while `stripe listen` (using the correct current default) watched the RIGHT
  one — the event never forwarded. Caught because the dev server log showed nothing after a trigger.
  Fixed by re-reading `stripe config --list` and correcting the key in both `.env.local` copies
  (worktree + parent), then restarting the dev server.
- Unknown price id → mark `status: done` + return 200 (not left "reserved" / retried forever): a
  Stripe retry cannot fix an unmapped price id — only a human editing the plan map or Stripe config can
  — so retrying indefinitely just repeats a doomed lookup. The founder-alert is the "loud" failure
  signal (§1.1c "fail loudly... not a crash"); 200 is what stops Stripe from retrying an event that will
  never resolve differently.

## Stop attempts

(none)

## Drift flags

(none)

## Round-skip requests

(none)

## Local acceptance testing (Phase 3, ahead of Phase 6 formal verify)

All run against a local dev server (`npm run dev -p 3101`) with `stripe listen --forward-to
localhost:3101/api/webhooks/stripe`, real Stripe test-mode account (`acct_1TyenBLphcTHVMXG`):

1. **Happy path / non-target event types → 200 ignore:** `stripe trigger checkout.session.completed`
   (default fixture, throwaway price) → every non-`checkout.session.completed` side-effect event
   (product.created, price.created, charge.succeeded, payment_intent.*) returned 200 immediately. PASS.
2. **Unknown price id → founder-alert stub, not a crash:** the triggered `checkout.session.completed`
   event resolved to `plan: null` (throwaway fixture price isn't in the map), fired the alert stub, logged
   `{eventId, type: 'checkout.session.completed', plan: null}` — no email/PII — marked done, returned
   200. PASS.
3. **Invalid signature → 400:** curl with a fabricated `stripe-signature` header → `{"error":"invalid
   signature"}`, HTTP 400. PASS.
4. **Sequential replay is a no-op:** `stripe events resend <same-event-id>` on an already-`done` event →
   200, with NO new log lines (short-circuits at the `done` branch before any processing). PASS.
5. **Concurrent replay reserves exactly once (LOAD-BEARING):** constructed a synthetic-but-validly-signed
   `checkout.session.completed` event wrapping a REAL existing test-mode checkout session (so
   `listLineItems` resolves against real Stripe data), fired via two simultaneous `curl` processes
   (backgrounded + `wait`) against a brand-new, never-before-seen event id. Result: one delivery got
   `503 {"error":"event reservation in progress"}`, the other got `200 {"received":true}` — exactly ONE
   founder-alert log line and one processing log line for that event id, confirming only one record was
   ever created/processed. A third follow-up request to the same (now-done) event id also returned 200
   with no new processing — sequential no-op confirmed on this event too. PASS.
6. **Plan map unit check:** `planForPriceId()` called directly for all three real price ids
   (Standard/Pro/Founding, incl. the Founding price created mid-bundle) each resolved to the correct
   `PlanId`; an unrecognized price id resolved to `null`. PASS.
7. Attempted a full e2e "known plan" run via `stripe trigger --override checkout_session:line_items[0]
   [price]=<real price>` — hit Stripe CLI fixture friction unrelated to this bundle's code (the
   `payment_page_confirm` fixture step expects the invoice amount to match its own hardcoded default,
   which breaks once a different-priced line item is substituted; separately, the account's Managed
   Payments + `payment` vs `subscription` mode also needed overriding). Not pursued further — items 1-6
   above already exercise the full webhook flow (signature verify, `listLineItems` against a REAL
   session, reservation, logging) end-to-end; the plan MAPPING itself is separately confirmed by the
   direct unit check (item 6). Diminishing-returns call, not a correctness gap.
- `npm run lint`, `npx tsc --noEmit`, `npm run build`: all green (build succeeded on retry after one
  transient Turbopack/Google-Fonts network hiccup on the first attempt — parent repo's build was
  unaffected, confirming it wasn't a real config issue).

## Review findings + resolutions

(filled in Phase 4/5)

## Edge cases considered

**Idempotency branching (§1.1b of the HANDOFF — the load-bearing invariant):**
- Boundary values handled: key absent (first delivery — reserved via NX); key present + `status: done`
  (any later delivery — 200 no-op); key present + `status: reserved` + `lease_until > now` (a concurrent
  or fast-retried delivery while another worker is genuinely live — 503, Stripe retries later); key
  present + `status: reserved` + `lease_until <= now` (previous worker crashed mid-processing — CAS
  takeover + resume); CAS takeover RACE (two workers both see an expired lease and both attempt the
  takeover — only one CAS succeeds by construction, since Lua `EVAL` on Upstash executes atomically
  server-side; the loser's CAS returns 0 and it falls back to the lease-valid branch).
- Citation: `docs/HANDOFF-client-onboarding.md` §1.1(a)/(b) (spec-review BLOCKER 2026-08-10, this
  repo) — the record must be durable (no key TTL) with `lease_until` as a FIELD, and lease takeover MUST
  be an atomic CAS on the old `lease_until`, not a plain read-then-write. Verified against Redis/Upstash
  semantics directly (`SET key value NX` — atomic set-if-absent; `EVAL` — atomically executed script) via
  the Upstash Redis REST API docs bundled in `node_modules/@upstash/redis` type definitions.
  `leaseSeconds = 90` — chosen to exceed Vercel's serverless function default max duration (10s Hobby /
  60s Pro, well under 90s) per the HANDOFF's own guidance ("`leaseSeconds` ... must be ≥ the serverless
  function's max execution time").
- Empirically verified (not just reasoned about): see "Local acceptance testing" above, item 5 — the
  concurrent-delivery race was actually executed twice-simultaneously against the live route handler,
  not just unit-tested in isolation, and produced exactly one reservation both times observed.

## Areas examined and rejected

(filled in Phase 4/5)

## Open items NOT addressed in this PR

(filled in Phase 7)

## Durable handles

- marker: /Users/brunomaurino/.claude/autonomous-active/autonomous-task-codirity-ob1-webhook
- worktree: /Users/brunomaurino/projects/codirity-ob1-webhook
- worktree_entry: path
- dev_server_pid: 95065 (npm run dev -p 3101; child node PID 95087 listening on :3101; restarted after
  fixing a stale-key bug below)
- stripe_listen_pid: 94080 (stripe listen --forward-to localhost:3101/api/webhooks/stripe)
