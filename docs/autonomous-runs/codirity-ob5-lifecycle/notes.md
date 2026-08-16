Started: 2026-08-16T02:08:11Z

## Execution context

Reused this session's already-established probe results (Bundles 1-4 ran earlier in the same
session): `Workflow`/`Agent` present + callable, `worktreeNative: true` (EnterWorktree/ExitWorktree
resolve — used successfully for Bundles 1-4's worktree entry/exit), args round-trip OK, `effortTiers:
true`, `customAgents: false` (this build cannot resolve the `at-reviewer`/`at-qa`/`at-verifier` custom
agent types from a Workflow `agentType` call — confirmed in Bundle 1, `wf_cda83614-f73`'s failure
diagnostics; the battery falls back to `general-purpose` inline prompts for every bundle this session).
Did not re-run the mechanical probes — no reason to expect the build capability changed mid-session.

Origin-bundle prefix: `B5` (`--bundle-id 5`). Identifier: `client-onboarding Bundle 5` (plan-qualified
via `--plan-slug client-onboarding`).

`--bundle-id` is set, so Step 0.6's resume-watchdog cron is skipped per the skill's own instruction —
the bundle-loop's original watchdog (cron `badb362d`, per
`docs/autonomous-runs/bundle-loop-client-onboarding-2026-08-14/notes.md`) already covers the whole
plan's idle-wedge risk.

## Task description (echoed)

Build Bundle 5 (lifecycle events, v1.1) of Codirity client onboarding — handle
`customer.subscription.deleted` (cancel), `customer.subscription.updated` with a `pause_collection`
null→non-null transition (billing-portal pause — the actual pause path the welcome email advertises;
does NOT emit `.subscription.paused`), and `customer.subscription.paused` (trial-end pause,
completeness) in the same Stripe webhook route, under the existing lease-fenced idempotency mechanism.
On any of the three, create a "Revoke access — {clientName}" ops card (Appendix E checklist verbatim)
and fire the founder alert. Map subscription → client via `stripe.customers.retrieve(customerId)`
(PRIMARY), not the eventId-keyed Bundle-1 store. This is the FINAL bundle of the v1 plan (v1.1 scope) —
also carries forward B4-D-opsidempotency1 (deferred from Bundle 4): design the alert/check-in-card
crash-window idempotency vocabulary once, covering BOTH Bundle 4's day-5 card and this bundle's
revoke-access card + alert, since there's no further bundle to defer to.

## Task interpretation (Phase 1.5 prompt-pinning)

**Concrete deliverable:** a new lifecycle-event branch inside `src/app/api/webhooks/stripe/route.ts`
(handling `customer.subscription.deleted` / `.updated` with a pause_collection transition /
`.paused`), a new `revokeAccessCheckin()`-equivalent function in `src/lib/onboarding/ops.ts` (or a
sibling module) that creates the "Revoke access — {clientName}" card, and the crash-window
idempotency/reconcile mechanism for BOTH the day-5 card (Bundle 4) and this bundle's revoke-access
card + both bundles' founder alerts (closing B4-D-opsidempotency1).

**Acceptance test:** `stripe trigger customer.subscription.deleted` in test mode produces exactly one
"Revoke access" ops card + one founder alert, idempotent on event id (sequential + concurrent replay);
the SAME outcome is independently exercised via a `customer.subscription.updated` event carrying a
real `pause_collection` null→non-null transition (not a bare `.paused` trigger, which never fires on a
portal-initiated pause); a `.updated` event WITHOUT that specific transition returns 200 and creates
nothing; `lint`/`tsc`/`build` all green; the reconcile mechanism is proven live (not just unit-level)
against a simulated crash between the external call succeeding and the record being persisted, for at
least one of the two card types.

Concrete and fillable from the brief + HANDOFF §3.5/Appendix E — no HS-3 needed.

## Plan

**Files to touch:**
- `src/lib/onboarding/trello.ts` — export `EVENT_MARKER_PREFIX` (currently module-private) so
  `ops.ts` can reuse the SAME marker vocabulary for card reconcile that boards already use.
- `src/lib/onboarding/ops.ts` — generalize card creation into a shared
  `createTrackedCard(opsBoardId, eventId, {name, desc, due?})` that reconciles-by-marker (list the
  ops board's OPEN cards, filter by `desc` containing `codirity-event:{eventId}`, reuse if found)
  before creating — mirrors `copyBoard`'s exact board-reconcile pattern, just scoped to cards on one
  board instead of boards in a workspace. `createCheckin()` becomes a thin wrapper (gains an
  `eventId` param — call site in route.ts updates). New `createRevokeAccessCard({clientName, eventId,
  customerId})` wraps the same helper for the pause/cancel path. This closes the CARD half of
  **B4-D-opsidempotency1**.
- `src/lib/onboarding/idempotency.ts` — extend `OnboardingEventRecord` with an optional
  `subscriptionId?: string` field for lifecycle-record traceability (reuses the existing `cardId`/
  `alertSent` fields — no collision risk since each event gets its own record keyed by ITS OWN event
  id, and a single record only ever produces one card of one kind).
- `src/app/api/webhooks/stripe/route.ts` — new `handleLifecycleEvent()` branch: filters
  `customer.subscription.deleted` / `.paused` / a genuine `.updated` pause_collection null→non-null
  transition (checked via `event.data.previous_attributes?.pause_collection === null &&
  event.data.object.pause_collection != null` — confirmed `previous_attributes?: Partial<Subscription>`
  exists on the installed Stripe SDK types for subscription events); every other `.updated` delivery
  returns 200 with no store interaction (nothing to make idempotent — no side effect occurs). Reuses
  the EXACT same `reserveEvent`/`persistStep`/`LeaseLostError` pattern as the signup flow. Resolves
  `customerId` from the subscription object, then `stripe.customers.retrieve(customerId)` for
  name/email (PRIMARY per the brief) — a deleted/unretrievable customer falls back to
  `clientName = name?.trim() || email || customerId` (customerId is always present from the event
  itself, so this fallback chain can never bottom out empty, unlike the signup flow's harder
  "email/customerId missing entirely" terminal case).

**Card copy:** Appendix E's on-pause/cancel checklist, VERBATIM per-item wording, reformatted from
`·`-joined inline text into a line-per-item list (a formatting transform, not a copy paraphrase — same
precedent as Bundle 4's day-5 card reformatting Appendix D's paragraph unchanged). No invented framing
sentence beyond the card title, which already states "Revoke access — {clientName}".

**Alert copy:** distinct message per lifecycle action (`cancelled` vs `paused`), naming the client and
that a revoke-access card was created — mirrors Bundle 4's "New client: …" alert's level of detail.

**B4-D-opsidempotency1 resolution (closing it here, no further bundle to defer to):** the CARD half
gets the real marker-based reconcile fix described above (robust to the founder moving cards between
lists — unlike a title/list-name scan — and only skips ARCHIVED cards, matching Bundle 2's own
deliberate `filter=open` scoping for boards). The ALERT half is NOT given a matching dedup mechanism:
nodemailer/SMTP has no query API to check "was this already sent" without a new persistent sent-log or
provider idempotency-key support (neither exists here), and the residual risk is a rare, narrow,
founder-only, non-customer-facing duplicate email in the specific crash window where an Upstash write
fails for a non-lease-loss reason immediately after a successful external call — a risk already
massively narrowed by the existing lease-fence (which already fully covers lease-loss, concurrent
delivery, and sequential replay). Documented as an accepted, bounded residual risk rather than solved
with a fragile ad-hoc mechanism — this was the exact hasty-fix failure mode Bundle 4's notes.md
originally flagged.

**Tests / verification:** `npm run lint`, `npx tsc --noEmit`, `npm run build`; `stripe trigger
customer.subscription.deleted` in test mode → one card + one alert, idempotent on event id (sequential
+ concurrent replay); the pause path exercised via `stripe trigger customer.subscription.updated
--override` setting `pause_collection` (a bare `.paused` trigger alone does NOT validate this path per
the brief); a `.updated` WITHOUT the transition → 200, no card; crash-after-card-creation-before-persist
reconcile, re-tested live through the full route (mirroring Bundle 4's mandatory board-reconcile
re-verification) for at least one card type.

**Open questions resolved (see "Decisions made unilaterally" for reasoning):**
- Reuse `cardId` for the revoke-access card (not a new field) — same event-scoped-record reasoning
  as Bundle 4.
- Deleted-customer fallback chain for `clientName`.
- Card-reconcile marker mechanism generalized from `trello.ts`'s board pattern rather than invented
  fresh.

## Decisions made unilaterally

(see Plan above for the primary ones; more added during build)

## Stop attempts

(none)

## Drift flags

(none)

## Round-skip requests

(none)

## Review findings + resolutions

(filled in Phase 4/5)

## Areas examined and rejected

(filled in Phase 4/5)

## Open items NOT addressed in this PR

(filled in Phase 7)

## Durable handles

- marker: /Users/brunomaurino/.claude/autonomous-active/autonomous-task-codirity-ob5-lifecycle
- worktree: /Users/brunomaurino/projects/codirity-ob5-lifecycle
- worktree_entry: path
