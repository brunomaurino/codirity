# autonomous-task run notes — codirity-ob3-email

Started: 2026-08-15T23:12:43Z

## Task description

Build Bundle 3 (welcome email) of Codirity client onboarding. Fresh worktree at
/Users/brunomaurino/projects/codirity-ob3-email on branch feat/codirity-ob3-email (off origin/main).
Full spec: docs/HANDOFF-client-onboarding.md "Bundle 3" + Appendix A. Brief: add `resend` +
`@react-email/components`; lib/onboarding/email.ts sends the Appendix A welcome email via Resend,
reply-to Bruno's address, using a React Email template with variables clientName (fallback "there" if
null), boardUrl, accessFormUrl, planName, plus an eventId param used ONLY for the idempotency key. Copy
is Appendix A VERBATIM. Include the Stripe billing-portal link in the footer from
STRIPE_BILLING_PORTAL_URL (permanent login link, never a per-session URL). Send with Resend
Idempotency-Key "{eventId}-welcome". Do NOT wire into the webhook yet (Bundle 4). Acceptance: a local
send renders the template with all variables filled and no missing-var placeholders; from/reply-to
correct; lint+tsc+build green.

## Execution context

- Workflow + Agent probes: PASS
- Capability probes (d)(e)(f)(g): REUSED from Bundle 1/2's Step-0 probes earlier this SAME session —
  `argsRoundTrip: true`, `effortTiers: true`, `customAgents: false`, `worktreeNative: true`.
- Bundle-loop context: `--bundle-id 3 --plan-slug client-onboarding` → prefix `B3`, identifier
  `client-onboarding Bundle 3`. Run slug: `codirity-ob3-email`.
- **Merge policy: full auto-merge authorized** (operator stepped away 2026-08-15, see bundle-loop
  session notes) — no pause for review, ship straight through unless a genuine hard-stop fires.

## Decisions made unilaterally (pre-build, config)

- **O2 sender — OVERRIDES the launch brief's "hello@codirity.com" default.** Earlier in this SAME
  session, the operator explicitly decided O2 during prerequisite setup: *"O2 - Ya esta listo. Podemos
  ir con support@codirity.com."* — i.e. the sender is `support@codirity.com`, not `hello@codirity.com`.
  The launch command text is stale (it predates that decision, carried over verbatim from the original
  HANDOFF §3.3 block). Building with `support@codirity.com` as the FROM address; will update the HANDOFF
  §3.3/§4-O2 text to match so it stops conflicting with the recorded decision.
- **O9 (STRIPE_BILLING_PORTAL_URL) resolved just now, TEST mode only**, since the operator is away from
  the computer and this only requires the Stripe API (no dashboard-only action needed — the CLI exposes
  `--login-page.enabled`). Created `billing_portal.configuration` `bpc_1U4pvOLphcTHVMXGAilKaXif` with a
  permanent login-page link (`https://billing.stripe.com/p/login/test_00w4gAbfe86a2XHcBrcwg00`) and a
  minimal-but-sensible feature set (payment-method update, invoice history, email/address update,
  cancel-at-period-end). **Flagging for the operator:** this is a DEFAULT feature configuration, not a
  business decision — cancellation proration, subscription-pause support (Codirity's own "pause anytime,
  days banked" model, which Stripe's built-in `subscription_pause` doesn't map to cleanly), and exact
  copy should be reviewed in the Stripe Dashboard at Bruno's convenience. The LOGIN LINK itself is stable
  regardless of later feature edits, so this doesn't block Bundle 3. LIVE-mode portal setup is a
  separate, later step (same two-stage pattern as O6's webhook: test now, live before real launch).

## Task interpretation

- **Concrete deliverable:** `src/lib/onboarding/email.ts` exporting `sendWelcomeEmail()`, plus a React
  Email template rendering Appendix A verbatim with the documented variables, sent via Resend from
  `support@codirity.com` with a deterministic `Idempotency-Key`.
- **Acceptance test:** a reviewer confirms — (1) a local render/send fills every variable with no
  missing-var placeholders left in the output; (2) from/reply-to headers are correct; (3) the
  billing-portal link in the footer is the permanent login link, never a per-session URL; (4)
  lint+tsc+build green.

No ambiguity requiring HS-3 — the brief + HANDOFF §1/§4/Bundle-3/Appendix-A spec, plus the two config
decisions above, fully pin the deliverable.

## Plan

**Building:**
- `src/lib/onboarding/email-template.tsx` — React Email component rendering Appendix A verbatim, props
  `{ clientName: string | null, boardUrl: string, accessFormUrl: string, planName: string,
  billingPortalUrl: string }`. `clientName` falls back to "there" when null (matches the {clientName}
  greeting; "there" reads naturally as "Hi there,").
- `src/lib/onboarding/email.ts` — `sendWelcomeEmail({ eventId, email, clientName, boardUrl, plan })`:
  resolves `planName` from `plan: PlanId` (reusing Bundle 1's type) to the display name Appendix A wants
  — capitalized ("Standard"/"Pro"/"Founding"), matching `offer.ts`'s `Tier.name`/a Founding display name
  (offer.ts's `foundingRate` has no `name` field — using "Founding" to match the HANDOFF's own casing).
  Sends via the Resend SDK, `from: "Codirity <support@codirity.com>"` (O2 decision), `reply_to:
  "bruno.maurino@codirity.com"` (matches the existing contact-form's pattern for "Bruno's address"),
  `headers: { "Idempotency-Key": \`${eventId}-welcome\` }` (Resend's send() accepts an
  `Idempotency-Key` per its docs — verifying the exact param shape during build).
- `.env.example` — document `RESEND_API_KEY` (§4 O2) if not already present (it isn't — Bundle 1/2
  never added it).
- Do NOT wire into the webhook (Bundle 4's job).
- **Also fixing pre-existing doc drift found before building:** the launch brief's sender
  (`hello@codirity.com`) and O9's "not yet done" framing are both stale relative to decisions already
  made earlier in this session — updated HANDOFF §4 O2/O9 text to match (see "Decisions made" above).

**Tests / verification:**
- `npm run lint`, `npx tsc --noEmit`, `npm run build`.
- Render the template via React Email's `render()` (no Resend API call needed) with realistic values
  for all 5 props AND with `clientName: null`, inspecting the output HTML/text for zero residual
  `{curlyPlaceholder}` tokens and the "there" fallback.
- **KNOWN GAP, flagged rather than silently skipped:** no `RESEND_API_KEY` is available in this session
  (Bruno confirmed the Resend account+domain exist but never shared a key, and creating a new Resend
  account is outside what I can do myself — account creation is off-limits). The actual `resend.emails.send()`
  API call is therefore NOT empirically exercised end-to-end in this bundle; only the template
  rendering + the send-call's construction (params, headers) are verified by inspection/type-checking.
  Flagging prominently for the operator rather than claiming a live send that didn't happen.

**Open questions resolved:**
- Sender: `support@codirity.com` (O2, decided earlier this session — see above).
- Reply-to: `bruno.maurino@codirity.com`, matching `src/app/api/contact/route.ts`'s existing recipient
  list, the closest existing convention for "Bruno's address" in this repo.
- `planName` display casing: Title Case ("Standard", "Pro", "Founding") to read naturally in "You're on
  the {planName} plan" — matches `offer.ts` `Tier.name` for standard/pro; Founding has no `name` field
  in offer.ts (it's a rate object, not a Tier) so "Founding" is chosen to match the HANDOFF's own
  capitalization in the Bundle-1 brief's "Standard / Pro / Founding" listing.

## Decisions made unilaterally

(see pre-build section above; more added during build)

## Stop attempts

(none)

## Drift flags

(none)

## Round-skip requests

(none)

## Local acceptance testing (Phase 3)

No `RESEND_API_KEY` available in this session (see "Decisions made" — flagged, not silently skipped),
so verification is template-rendering-only, via `@react-email/render`'s `render()`:

1. **Rendered with realistic values (all 5 props), both HTML and plain-text output** — 0 residual
   `{placeholder}` tokens in either. `boardUrl`, `accessFormUrl`, `billingPortalUrl`, and `planName` all
   present verbatim in the rendered HTML. PASS.
2. **Rendered with `clientName: null`** — greeting line reads "Hi there," (the documented fallback), 0
   residual placeholders. PASS.
3. **Full plain-text render visually diffed against Appendix A** — matches word-for-word, including the
   3 numbered sections, the P.S., and Bruno's sign-off; the only addition is the footer line with the
   billing-portal link (which Appendix A's P.S. references but doesn't spell out verbatim, since it's
   describing where the link lives, not dictating the footer's own copy).
4. `sendWelcomeEmail()`'s construction of the Resend `send()` call (from/replyTo/subject/react +
   `idempotencyKey` as the second-argument option, per the installed SDK's actual type signature —
   verified by reading `node_modules/resend/dist/index.d.mts` directly, not assumed) type-checks
   correctly but was NOT exercised against the real Resend API (no key available).
5. `npm run lint`, `npx tsc --noEmit`, `npm run build`: all green.

## Review findings + resolutions

(filled in Phase 4/5)

## Areas examined and rejected

(filled in Phase 4/5)

## Items deferred from this PR

(filled in Phase 7)

## Open items NOT addressed in this PR

(filled in Phase 7)

## Durable handles

- marker: /Users/brunomaurino/.claude/autonomous-active/autonomous-task-codirity-ob3-email
- worktree: /Users/brunomaurino/projects/codirity-ob3-email
- worktree_entry: path
