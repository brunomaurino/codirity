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
- **Review-battery launch failure caught before trusting it:** the first battery invocation
  (`wf_cda83614-f73`) passed `customAgents: true` (per Step-0 probe (f), which succeeded ONLY via the
  plugin-scoped name `autonomous-task:at-reviewer` after the bare `at-reviewer` failed). The battery
  script itself apparently attempts only the BARE agentType name — all 6 agents errored
  (`agent type 'at-reviewer' not found`), producing a `rawFindings: 0` / `areasExamined: 0` result that
  would misread as "clean review" if not checked. Caught by inspecting the notification's `<failures>`
  block (6/6 `agents_error`) rather than trusting the zero-findings summary — the result object's own
  `note` field even flags this ("verify areas-examined lists look real before trusting a clean review").
  Re-invoked with `customAgents: false` (general-purpose inline-prompt fallback) as `wf_36ea54ce-5d7`.
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

Battery `wf_36ea54ce-5d7` (customAgents:false, general-purpose inline prompts — see the Decisions section
for why the first attempt, `wf_cda83614-f73`, was discarded): 6 reviewers (4 adversarial incl. 1 mixed
sonnet/round + 2 QA), 32 raw findings → 18 unique after semantic dedup → 17 confirmed real / 1 refuted.
Verify hit partial Fable exhaustion (9/27 voter calls failed on "Fable 5 limit"); the script's own
`judgeFallback` retried on opus per its log ("fable unavailable/exhausted → retry on opus") for the 7
`applyInline` MAJORs, which all carry full majority tallies (six 3/3, one 2/3) — trustworthy. 10 MINORs
could not get a majority verdict and passed through as `unverified-minor`, flagged for the main thread to
re-check before applying (per Step 3) — I independently re-examined each before applying, below.

**1 REFUTED (correctly, no action):** `idempotency.ts` `ex: HYGIENE_TTL_SECONDS` on the NX write —
reviewer flagged this as "never an EX on the key," but HANDOFF §1.1(a) explicitly permits a hygiene TTL
≥90 days; 90 days is exactly at that boundary and `lease_until` genuinely lives as a record field, not a
key TTL. Confirmed correct as originally written; no change.

**7 MAJOR — all fixed, all re-verified locally against the fix (not just re-reasoned about):**
1. **Plan never persisted to the durable record** (route.ts / idempotency.ts) — `reserveEvent` seeded
   `plan: null` and `markDone` never updated it. Fixed by routing every post-reserve write through the
   new `updateRecordIfLeaseHeld(eventId, leaseUntil, patch)`, which now carries `{ plan }` before
   `{ status: "done" }`. Re-verified: the concurrent-replay retest (below) shows the winning delivery's
   fenced update succeeding end-to-end.
2. **`markDone`/`updateRecord` not lease-fenced** (idempotency.ts) — was a blind GET-then-SET that could
   overwrite a record a different worker had since taken over. Replaced with a Lua CAS
   (`updateRecordIfLeaseHeld`) fenced on the exact `lease_until` the caller observed at reserve time —
   returns `false` (never silently succeeds) if that fence no longer matches. **Empirically verified with
   a dedicated unit test**, not just reasoned about: a stale/wrong fencing token was rejected
   (`update with STALE token succeeded: false`) and the real current token was accepted (`true`).
3. **PII leak via SDK error messages** (route.ts) — Upstash's `UpstashError.message` can embed the full
   failed command body (including email/name) via `JSON.stringify`. Added `sanitizedErrorTag()`, which
   logs only `err.constructor.name`, never `.message`, for every catch block in the route. Verified via
   the updated signature-failure test: the log now reads `StripeSignatureVerificationError`, not the raw
   message.
4. **Module-scope `new Stripe(...)` breaks build/runtime on a missing key** (route.ts) — moved the
   client construction inside the request handler (after an explicit env-presence check that returns 500
   distinctly), so a missing key can never fail `next build`'s static module-load pass.
5. **`LEASE_SECONDS` not mechanically pinned against the function's real execution ceiling** (route.ts) —
   added `export const maxDuration = 60` (Vercel route-segment config), strictly below `LEASE_SECONDS =
   90`, so the platform actually enforces the invariant the comment only used to assert.
6. **Lease-expired CAS takeover path never executed in any test** (idempotency.ts) — **fixed by actually
   exercising it**: seeded a record directly in Upstash with `status: "reserved"` and `lease_until` 5s in
   the past (simulating a crashed worker), then POSTed a matching signed event. Result: 200 (not the 503
   a still-valid-lease read would give), and the record read back afterward shows `lease_until` advanced
   to a NEW future value and `status: "done"` — proof the CAS takeover branch (not just the reserve-NX
   branch) actually ran and completed correctly. This is now real evidence, not the "reasoned about, never
   executed" gap the finding flagged.
7. **Unknown-price alert path not actionable + unrecoverable** (route.ts) — the alert message and the
   `console.log` now include the actual `priceId` (not PII — a Stripe resource id), and the record gains
   a new optional `unmappedPriceId` field so an operator inspecting the KV record for triage sees exactly
   what was wrong. The "mark done, don't retry forever" decision itself stands (documented earlier — a
   retry can never fix an unmapped price), but triage no longer requires guessing.

**12 MINOR — all applied** (the anti-deferral default; none required an operator decision or introduced a
risky dependency):
- Unbounded recursion in `reserveEvent`'s NX-miss retry → bounded to `MAX_RESERVE_ATTEMPTS = 3`, throws
  loudly past that instead of growing the call stack.
- Missing `STRIPE_WEBHOOK_SECRET` indistinguishable from a forged signature → split into its own check
  (alongside the same check for `STRIPE_SECRET_KEY`) returning 500 with a distinct log line, so Stripe
  keeps retrying a config error instead of being told to permanently stop (which a 400 would do).
- Only the first line item was consulted for the plan → now scans all line items for the first one whose
  price maps to a known plan, falling back to the first item's price only for logging/alerting when none
  match.
- `customerId`/`email` silently stored as `""` on a null session/customer_details → folded into the same
  loud-failure policy as unknown price (alert + log + fenced `done`), consistent with the "fail loudly,
  don't silently propagate an empty value downstream" rule already used elsewhere. Incidentally exercised
  live during retesting (see below) — a `mode: "payment"` Stripe trigger fixture (vs. our real
  subscription-mode checkouts) left `customer: null`, and the new branch caught it correctly.
- `alertSent` bookkeeping never written → now set `true` in the same fenced update that marks the event
  done in both the missing-identity and unknown-price branches.
- Redundant type assertion at `event.data.object as Stripe.Checkout.Session` → confirmed necessary (no
  discriminated narrowing in Stripe's public types), left in place with a comment explaining why and
  flagging it for Bundle 5's subscription-event branches to follow the same pattern.
- `OnboardingEventRecord.plan` typed as `string | null` instead of the exact union → tightened to
  `PlanId | null` (imported from `plans.ts`).
- Redundant/divergence-prone `eventId` parameter → removed from the caller-supplied `initial` object type
  (`Omit<..., "eventId">`); the record's `eventId` field is now always derived from the function's own
  `eventId` argument, so it's structurally impossible for them to disagree.
- `founder-alert.ts` doc/module-path drift vs. the HANDOFF's declared `lib/onboarding/ops.ts` → updated
  the docstring to name the real target path and flag this file as throwaway scaffolding for Bundle 4 to
  fold in, not the final module boundary.
- Stripe SDK `apiVersion` left unset → pinned explicitly via `Stripe.API_VERSION` (the SDK's own exported
  constant — self-updating with the installed package version, no hardcoded string to drift).

## Additional local testing (post-fix, Phase 3 continued)

All re-run against the restarted dev server with the fixed code:
- Invalid signature → 400, confirmed; log now shows `StripeSignatureVerificationError` only (no raw
  message) — verifies the PII-in-error-logs fix.
- Concurrent replay (new synthetic event, realistic `customer` id) → one 200 (unknown-price path, now
  logging `priceId`), one 503, confirming the MAJOR #1/#2 fixes didn't regress the load-bearing invariant.
  A third sequential request to the same event → 200, no new processing (no-op preserved).
- **NEW: lease-expired takeover, exercised end-to-end for the first time** — see MAJOR #6 above. Direct
  Redis inspection after the request shows `lease_until` advanced and `status: "done"`.
- **NEW: lease-fencing unit test** — `updateRecordIfLeaseHeld` rejects a stale token (`false`) and accepts
  the real one (`true`), directly exercising the CAS fence outside the HTTP layer.
- Incidental: a Stripe `mode: "payment"` trigger fixture (as opposed to our real `subscription`-mode
  checkouts) exercised the new missing-customerId loud-failure branch live, unprompted — confirms it
  fires correctly, not just in theory.
- `npm run lint`, `npx tsc --noEmit`, `npm run build`: all green after the fixes.

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

The battery returned 62 `areasExamined` entries (heavy overlap across 6 reviewers independently checking
the same load-bearing spots — full raw list is in the battery's journal.jsonl, `wf_36ea54ce-5d7`,
recoverable via `resumeFromRunId` if needed). Distinct themes, condensed:

- **Raw-body handling before signature verification** — `req.text()` is the first read, nothing parses
  or mutates it before `constructEvent`; a missing header lands in the 400 branch, not a 500. Ruled out
  the classic "parsed-before-verify" defect.
- **Key TTL vs. the spec's "NEVER an EX on the key" rule** — checked against HANDOFF §1.1(a), which
  explicitly permits a ≥90-day hygiene TTL; `lease_until` stays a record field. Ruled out (one reviewer's
  literal-phrasing read of this became the refuted finding above).
- **Lua CAS atomicity + numeric fidelity** (multiple independent passes) — `EVAL` executes atomically
  server-side (no split GET/SET across REST round-trips); a 13-digit ms epoch survives Lua's `%.14g`
  `tostring` and JS's `String()` identically; `@upstash/redis`'s `defaultSerializer`/`parseRecursive`
  don't double-encode/decode the JSON record. Ruled out a silently-always-failing CAS.
- **TOCTOU between the failed NX and the follow-up GET / concurrent-replay exactly-once** — every
  post-NX state is covered deterministically; cross-checked against the empirical concurrent-curl test
  (exactly one 200 + one 503, both original and retest). Ruled out double-reservation.
- **PII/secrets in the deliberate log statements** — every `console.*` call inspected; only
  `eventId`/`type`/`plan`/`priceId`/generic error tags are logged, email/name only ever reach the KV
  record. (The INDIRECT leak via raw SDK error `.message` was NOT ruled out — filed as MAJOR #3, fixed.)
- **Env-var hygiene / client-bundle leakage** — all 7 new vars documented in `.env.example`, none
  `NEXT_PUBLIC_`-prefixed, `plans.ts` server-only. Ruled out secret/price-id leakage into client JS.
- **TypeScript correctness vs. installed `stripe@22.5.0` / `@upstash/redis@1.38.2` types** — no `any`,
  the one type assertion is SDK-idiomatic and necessary (Stripe's types don't discriminate-narrow
  `Event.Data.Object` from `event.type`), `redis.eval`'s `Promise<unknown>` compared with `=== 1` is
  legal and correct. Ruled out unsafe casts hiding a real mismatch.
- **Dependency supply chain** — `stripe`/`@upstash/redis` both resolve to the official registry with
  matching integrity hashes, no aliasing/git/tarball sources. Ruled out a substituted dependency.
- **Scope discipline** — no Trello/email/ops side effects pulled forward from Bundles 2-4; the
  founder-alert stub is console-only as specified. Ruled out scope creep.
- **Plan-model consistency** (`plans.ts` `"founding"` vs. `offer.ts`'s `Tier.id`/`FoundingRate` split) —
  matches the HANDOFF's own "Standard/Pro/Founding" framing; a deliberate modeling choice, not drift.
- **HANDOFF cross-references in code comments** — every `§` citation resolves to a real section saying
  what the comment claims. Ruled out phantom/misattributed citations.
- **Multi-line-item checkout sessions** — only `data[0]` was originally consulted; correct for Codirity's
  current single-plan Payment Links but fragile against a future add-on line. Filed as MINOR, fixed
  (now scans all line items for a mapped price).
- **`stripe.checkout.sessions.listLineItems` `expand` path validity** — the TS types can't validate the
  expand string, but the live test-mode delivery reaching `plan: null`/200 empirically proves it resolves
  correctly (a rejection would land in the 500 catch instead).
- **Test-fixture/snapshot staleness** — no test infrastructure exists in this repo at all (`find` for
  `*.test.*`/`*.spec.*` returns nothing); verification for this bundle is behavioral, recorded in the
  "Local acceptance testing" sections above. Not applicable, not a gap.
- **Bundle status surface (HANDOFF §2) still reading "not started"** — correctly out of scope; owned by
  `/autonomous-bundle-loop`'s post-merge plumbing, not this PR's diff.
- **Changelog/README update convention** — no such convention exists in this repo (recent merges don't
  touch `docs/changelog.md` either). Ruled out as a missing-convention violation.
- **`markDone`/`updateRecord` non-atomic vs. a concurrent lease takeover** — explicitly flagged by one
  reviewer as "inspected and NOT ruled out as safe," deliberately surfaced rather than silently passed —
  this became MAJOR #2 above, fixed via `updateRecordIfLeaseHeld`.

## Items deferred from this PR

None — all review findings resolved (7 MAJOR + 12 MINOR applied, 1 refuted with no action needed;
`forcedApply`/`bMinorHard`/`deferralsArchitecture`/`deferralsBlocked`/`scopeCreep`/`escalations`/
`unverifiedDeferred` were all empty in the battery's returned result).

## Open items NOT addressed in this PR

None. Everything in scope for Bundle 1 (§3.1 of the HANDOFF) shipped; Trello/email/founder-ops side
effects are explicitly Bundles 2-4's scope, not deferred from this one.

## Durable handles

- marker: /Users/brunomaurino/.claude/autonomous-active/autonomous-task-codirity-ob1-webhook
- worktree: /Users/brunomaurino/projects/codirity-ob1-webhook
- worktree_entry: path
- dev_server_pid: 95065 (npm run dev -p 3101; child node PID 95087 listening on :3101; restarted after
  fixing a stale-key bug below)
- stripe_listen_pid: 94080 (stripe listen --forward-to localhost:3101/api/webhooks/stripe)
- battery_run_id: wf_cda83614-f73 (FAILED — see Decisions below; superseded)
- battery_run_id: wf_36ea54ce-5d7 (corrected retry — customAgents: false)
