import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { reserveEvent, updateRecordIfLeaseHeld } from "@/lib/onboarding/idempotency";
import { planForPriceId, type PlanId } from "@/lib/onboarding/plans";
import { alertFounder, createCheckin, createRevokeAccessCard } from "@/lib/onboarding/ops";
import { copyBoard } from "@/lib/onboarding/trello";
import { sendWelcomeEmail } from "@/lib/onboarding/email";
import {
  accessEndsOn,
  clientLine,
  guaranteeNote,
  isCancellationRequested,
  isCancellationReverted,
  refundHowTo,
  stripeCustomerUrl,
} from "@/lib/onboarding/lifecycle";

// Must stay strictly BELOW LEASE_SECONDS — pins the platform's actual execution ceiling
// instead of relying on a comment. Vercel's own defaults (and Fluid Compute's up to 300s)
// can otherwise exceed the lease, making a still-running delivery falsely takeover-eligible.
export const maxDuration = 60;

// Must be >= this serverless function's max execution time (maxDuration above), so a
// still-running delivery is never mistaken for a crashed one while genuinely in flight.
const LEASE_SECONDS = 90;

// Never log a raw SDK error's `.message` for a store/PII-adjacent failure — Upstash's
// error messages can embed the failed command's full body (customer email/name) via
// JSON.stringify. Log only the error's constructor name, never its message, here.
function sanitizedErrorTag(err: unknown): string {
  return err instanceof Error ? err.constructor.name : typeof err;
}

// copyBoard/sendWelcomeEmail/createCheckin/createRevokeAccessCard all throw plain Errors
// whose own message text is ALREADY constructed to be safe — trelloRequest strips the
// key/token query string before throwing (Bundle 2), and Resend's SDK errors are generic
// ("Invalid `to` field", not the actual value — confirmed in Bundle 3). Logging that
// message in full turns "Error" into an actually diagnosable cause (revoked token vs
// renamed list vs bad board id) without regressing the no-PII policy above. This is an
// EXPLICIT allowlist, not a default: deliberately NOT used for the alert step (a raw SMTP
// rejection can echo the recipient address back in its message) NOR for raw Stripe SDK
// errors (stripe.customers.retrieve, below — a StripeAuthenticationError can embed a
// partially-redacted API key fragment). A new call site must be individually vetted
// before using this helper, not assumed safe by default.
function detailedErrorTag(err: unknown): string {
  return err instanceof Error ? err.message : typeof err;
}

/** Thrown when a fenced record write loses the lease — another worker has since taken
 * over this event. Continuing to write after this would race the new owner, so it always
 * aborts the whole request immediately rather than being caught per-step. */
class LeaseLostError extends Error {}

async function persistStep(
  eventId: string,
  leaseUntil: number,
  patch: Parameters<typeof updateRecordIfLeaseHeld>[2]
): Promise<void> {
  const ok = await updateRecordIfLeaseHeld(eventId, leaseUntil, patch);
  if (!ok) {
    throw new LeaseLostError(`lost lease fence for event ${eventId}`);
  }
}

/**
 * §3.5 (Bundle 5): a billing-portal pause — the pause path the welcome email itself
 * advertises — does NOT emit `customer.subscription.paused` (that fires only on the
 * trial-end status=paused transition). It emits `customer.subscription.updated` with
 * `pause_collection` transitioning from null to non-null. This is the ONLY `.updated`
 * shape this route acts on; every other `.updated` delivery (price change, quantity
 * change, an already-paused subscription's unrelated field changing, etc.) must return
 * 200 and touch nothing — there is no side effect to make idempotent for those.
 */
function isPortalPauseTransition(event: Stripe.Event): event is Stripe.CustomerSubscriptionUpdatedEvent {
  if (event.type !== "customer.subscription.updated") {
    return false;
  }
  // No cast needed here: stripe@22.5.0's Stripe.Event is a real discriminated union on
  // `type` (confirmed by reading node_modules/stripe/cjs/resources/Events.d.ts and by a
  // standalone tsc check), so the guard above already narrows `event` to
  // CustomerSubscriptionUpdatedEvent — `event.data.object`/`.previous_attributes` are
  // concretely typed as Stripe.Subscription / Partial<Stripe.Subscription> from here on.
  return event.data.object.pause_collection != null && event.data.previous_attributes?.pause_collection === null;
}

/** The three lifecycle event shapes handleLifecycleEvent accepts — narrowed here, once,
 * rather than inside the function, so its body reads `event.data.object` as a concrete
 * `Stripe.Subscription` with no cast. A plain `Stripe.Event` parameter would defeat this: a
 * type-predicate narrowing (`event.type === "..."`) does not cross a function-call boundary,
 * so the function itself would fall back to the union's generic, unnarrowed `data.object`
 * shape even though every individual call site is already narrowed at its own `if`. */
type SubscriptionLifecycleEvent =
  | Stripe.CustomerSubscriptionDeletedEvent
  | Stripe.CustomerSubscriptionUpdatedEvent
  | Stripe.CustomerSubscriptionPausedEvent;

/** Display name of the plan a subscription is on, or null when its price is not one of
 * ours (a legacy or manually-created price). Alerts read better with it and stay correct
 * without it. */
function planLabel(subscription: Stripe.Subscription): string | null {
  const priceId = subscription.items.data[0]?.price.id;
  const plan = priceId ? planForPriceId(priceId) : null;
  return plan ? plan.charAt(0).toUpperCase() + plan.slice(1) : null;
}

/** Shared by every subscription-lifecycle handler below. */
async function resolveClient(
  stripe: Stripe,
  customerId: string
): Promise<{ email: string; name: string | null; clientName: string }> {
  let email = "";
  let name: string | null = null;
  try {
    const customer = await stripe.customers.retrieve(customerId);
    if (!("deleted" in customer && customer.deleted)) {
      email = customer.email ?? "";
      name = customer.name ?? null;
    }
  } catch (err) {
    // sanitizedErrorTag, not detailedErrorTag: this is a raw Stripe SDK error, outside the
    // doc-audited set below (trelloRequest/Resend/createTrackedCard's own hand-authored,
    // pre-sanitized messages) — a StripeAuthenticationError from a rotated
    // STRIPE_SECRET_KEY embeds a partially-redacted key fragment in `.message`.
    console.error("onboarding webhook: customer lookup failed for a lifecycle event", sanitizedErrorTag(err));
  }
  // Unlike the signup flow's harder terminal case (missing email/customerId entirely),
  // customerId is ALWAYS present here (it comes off the event itself, not a lookup), so
  // this fallback chain can never bottom out empty — worst case the founder sees a raw
  // Stripe customer id instead of a name, still enough to trace the client via the
  // dashboard.
  return { email, name, clientName: name?.trim() || email || customerId };
}

/**
 * Handles the three lifecycle-event shapes (§3.5, Appendix E): cancellation
 * (`customer.subscription.deleted`), a billing-portal pause
 * (`customer.subscription.updated` with the pause_collection transition above), and a
 * trial-end pause (`customer.subscription.paused`, for completeness). Same idempotency +
 * per-step guard rules as the signup flow's checkout.session.completed handling
 * (inlined in POST() below) — a separate function only because the shape (no plan
 * resolution, no board/email steps, a different client-lookup strategy) doesn't share
 * meaningful code with it.
 */
async function handleLifecycleEvent(
  stripe: Stripe,
  event: SubscriptionLifecycleEvent,
  action: "cancelled" | "paused"
): Promise<NextResponse> {
  const subscription = event.data.object;
  const eventId = event.id;
  const customerId =
    typeof subscription.customer === "string" ? subscription.customer : subscription.customer.id;

  // PRIMARY per the brief: look up the customer directly rather than trusting the
  // Bundle-1 store, which is keyed by the SIGNUP event's id (not queryable by customer)
  // and is therefore only ever a best-effort association, never authoritative here.
  const { email, name, clientName } = await resolveClient(stripe, customerId);

  const reserveResult = await reserveEvent(
    eventId,
    { customerId, email, name, plan: null, subscriptionId: subscription.id },
    LEASE_SECONDS
  );

  if (reserveResult.outcome === "done") {
    return NextResponse.json({ received: true }, { status: 200 });
  }
  if (reserveResult.outcome === "lease-valid") {
    return NextResponse.json({ error: "event reservation in progress" }, { status: 503 });
  }

  const leaseUntil = reserveResult.record.lease_until;
  let record = reserveResult.record;

  try {
    let stepFailed = false;

    // Reuses the generic `cardId`/`alertSent` record fields — this record is keyed by
    // ITS OWN eventId (a lifecycle event's id, never a signup event's), so there's no
    // collision with a signup record's day-5 card.
    if (!record.cardId) {
      try {
        const card = await createRevokeAccessCard({ clientName, eventId });
        await persistStep(eventId, leaseUntil, { cardId: card.cardId });
        record = { ...record, cardId: card.cardId };
      } catch (err) {
        if (err instanceof LeaseLostError) throw err;
        console.error("onboarding webhook: revoke-access card failed", detailedErrorTag(err));
        stepFailed = true;
      }
    }

    // The alert step is independently guarded (§1.4) and can run even when the card step
    // above FAILED this same request — so its wording must reflect record.cardId's actual
    // state, not assume the card exists. Getting this wrong would ship a false "card
    // created" claim that also persists as alertSent:true, permanently suppressing the
    // one later retry that could have sent the accurate version.
    if (!record.alertSent) {
      const cardNote = record.cardId
        ? "Revoke-access card created on the ops board."
        : "Revoke-access card creation FAILED — needs manual follow-up.";
      try {
        await alertFounder(
          [
            `Client ${action}: ${clientLine(clientName, email, customerId, planLabel(subscription))}`,
            `Subscription ${subscription.id}`,
            stripeCustomerUrl(customerId, event.livemode),
            "",
            cardNote,
          ].join("\n")
        );
        await persistStep(eventId, leaseUntil, { alertSent: true });
        record = { ...record, alertSent: true };
      } catch (err) {
        if (err instanceof LeaseLostError) throw err;
        console.error("onboarding webhook: founder alert failed for a lifecycle event", sanitizedErrorTag(err));
        stepFailed = true;
      }
    }

    if (stepFailed || !record.cardId || !record.alertSent) {
      const missing = [!record.cardId && "revoke-access card", !record.alertSent && "founder alert"].filter(
        (step): step is string => Boolean(step)
      );
      try {
        await alertFounder(
          `Lifecycle event incomplete for ${clientName} (event ${eventId}, ${action}) — still missing: ${missing.join(", ")}. Stripe will retry.`
        );
      } catch (err) {
        console.error("onboarding webhook: lifecycle partial-failure alert itself failed", sanitizedErrorTag(err));
      }
      return NextResponse.json({ error: "processing incomplete" }, { status: 500 });
    }

    await persistStep(eventId, leaseUntil, { status: "done" });
    console.log("onboarding webhook: lifecycle event fully processed", { eventId, type: event.type, action });
    return NextResponse.json({ received: true }, { status: 200 });
  } catch (err) {
    if (err instanceof LeaseLostError) {
      console.error("onboarding webhook: lost lease fence mid-lifecycle-orchestration", { eventId });
    } else {
      console.error("onboarding webhook: lifecycle processing error", sanitizedErrorTag(err));
    }
    return NextResponse.json({ error: "processing error" }, { status: 500 });
  }
}

/**
 * Alert-only handler for the two cancel_at_period_end transitions. Deliberately creates NO
 * revoke-access card: the subscription is still paid and live, and revoking a paying
 * client's access weeks early would be the worst failure available here. The revoke card
 * stays on `customer.subscription.deleted`, where access genuinely ends.
 *
 * Reuses `alertSent` and the same reserve/lease discipline as every other handler, so a
 * Stripe retry re-sends nothing.
 */
async function handleCancellationIntent(
  stripe: Stripe,
  event: Stripe.CustomerSubscriptionUpdatedEvent,
  intent: "requested" | "reverted"
): Promise<NextResponse> {
  const subscription = event.data.object;
  const eventId = event.id;
  const customerId =
    typeof subscription.customer === "string" ? subscription.customer : subscription.customer.id;
  const { email, name, clientName } = await resolveClient(stripe, customerId);

  const reserveResult = await reserveEvent(
    eventId,
    { customerId, email, name, plan: null, subscriptionId: subscription.id },
    LEASE_SECONDS
  );
  if (reserveResult.outcome === "done") {
    return NextResponse.json({ received: true }, { status: 200 });
  }
  if (reserveResult.outcome === "lease-valid") {
    return NextResponse.json({ error: "event reservation in progress" }, { status: 503 });
  }
  const leaseUntil = reserveResult.record.lease_until;
  const record = reserveResult.record;

  const who = clientLine(clientName, email, customerId, planLabel(subscription));
  const link = stripeCustomerUrl(customerId, event.livemode);
  const note = guaranteeNote(subscription, event.created);
  const message =
    intent === "requested"
      ? [
          `Cancellation requested: ${who}`,
          `Access stays live until ${accessEndsOn(subscription)} — do NOT revoke before then.`,
          "",
          note,
          // Only when something is actually owed: click steps under "no refund owed" would
          // read as an instruction to refund anyway.
          ...(note.includes("INSIDE") ? ["", refundHowTo(customerId, event.livemode)] : []),
          "",
          `Subscription ${subscription.id}`,
          link,
        ].join("\n")
      : [
          `Cancellation reverted: ${who}`,
          "The subscription is active again. Do NOT revoke access.",
          "",
          `Subscription ${subscription.id}`,
          link,
        ].join("\n");

  try {
    if (!record.alertSent) {
      await alertFounder(message);
      await persistStep(eventId, leaseUntil, { alertSent: true });
    }
    await persistStep(eventId, leaseUntil, { status: "done" });
    console.log("onboarding webhook: cancellation intent handled", { eventId, intent });
    return NextResponse.json({ received: true }, { status: 200 });
  } catch (err) {
    if (err instanceof LeaseLostError) {
      console.error("onboarding webhook: lost lease fence on a cancellation intent", { eventId });
    } else {
      console.error("onboarding webhook: cancellation-intent alert failed", sanitizedErrorTag(err));
    }
    // Non-2xx so Stripe retries: an unsent cancellation alert is exactly the one this flow
    // cannot afford to drop, since the guarantee window keeps closing while it is missing.
    return NextResponse.json({ error: "processing incomplete" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  // Read the RAW body first — req.json() would parse-and-mutate it, breaking
  // Stripe's signature verification (§1.2).
  const raw = await req.text();
  const signature = req.headers.get("stripe-signature");

  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!stripeSecretKey || !webhookSecret) {
    // A missing secret is a deploy/config problem, not a forged signature — 500 so
    // Stripe keeps retrying (a 400 tells it to stop permanently, which is wrong for
    // something that resolves once the config is fixed), logged distinctly so it is
    // never mistaken for a signature-verification failure.
    console.error("onboarding webhook: missing Stripe env config", {
      hasSecretKey: Boolean(stripeSecretKey),
      hasWebhookSecret: Boolean(webhookSecret),
    });
    return NextResponse.json({ error: "webhook not configured" }, { status: 500 });
  }
  // Constructed per-request, never at module scope — a module-scope `new Stripe(...)`
  // throws when the key is falsy, and Next's build-time static analysis loads every
  // route module, so that would fail the entire site's build, not just this route.
  const stripe = new Stripe(stripeSecretKey, { apiVersion: Stripe.API_VERSION });

  let event: Stripe.Event;
  try {
    if (!signature) {
      throw new Error("missing stripe-signature header");
    }
    event = stripe.webhooks.constructEvent(raw, signature, webhookSecret);
  } catch (err) {
    console.error("onboarding webhook: signature verification failed", sanitizedErrorTag(err));
    return NextResponse.json({ error: "invalid signature" }, { status: 400 });
  }

  // §3.5 (Bundle 5) — checked BEFORE the checkout.session.completed guard below: these
  // are the only three shapes this route acts on besides a completed checkout.
  if (event.type === "customer.subscription.deleted") {
    return handleLifecycleEvent(stripe, event, "cancelled");
  }
  // Before the pause check: these are disjoint `.updated` shapes (cancel_at_period_end vs
  // pause_collection), but reading them in lifecycle order keeps the dispatch honest.
  if (isCancellationRequested(event)) {
    return handleCancellationIntent(stripe, event, "requested");
  }
  if (isCancellationReverted(event)) {
    return handleCancellationIntent(stripe, event, "reverted");
  }
  if (event.type === "customer.subscription.paused" || isPortalPauseTransition(event)) {
    return handleLifecycleEvent(stripe, event, "paused");
  }

  if (event.type !== "checkout.session.completed") {
    return NextResponse.json({ received: true }, { status: 200 });
  }

  // No cast needed: stripe@22.5.0's Stripe.Event is a real discriminated union on `type`
  // (confirmed by reading the installed SDK types and by a standalone tsc check — a prior
  // version of this comment claimed the opposite and was wrong), so the guard above
  // already narrows `event` to CheckoutSessionCompletedEvent and `event.data.object` is
  // concretely `Stripe.Checkout.Session` from here on.
  const session = event.data.object;
  const eventId = event.id;
  const customerId = typeof session.customer === "string" ? session.customer : (session.customer?.id ?? "");
  const email = session.customer_details?.email ?? "";
  const name = session.customer_details?.name ?? null;
  // Matches email-template.tsx's own `clientName?.trim() || "there"` fallback (Bundle 3) —
  // a whitespace-only name from Stripe must fall through too, not just a null/empty one.
  // This value also seeds the Trello board title and the day-5 card title, so a silent
  // "there" here would erase the client's identity from those surfaces as well, not just
  // the email.
  const clientName = name?.trim() || "there";

  const reserveResult = await reserveEvent(eventId, { customerId, email, name, plan: null }, LEASE_SECONDS);

  if (reserveResult.outcome === "done") {
    // Already fully processed — sequential replay is a strict no-op.
    return NextResponse.json({ received: true }, { status: 200 });
  }
  if (reserveResult.outcome === "lease-valid") {
    // Another delivery is live on this event id — back off, let Stripe retry later.
    return NextResponse.json({ error: "event reservation in progress" }, { status: 503 });
  }

  // "reserved" (won the initial NX) or "lease-expired-took-over" — this delivery does
  // the work. Only one concurrent delivery ever reaches this branch per event id. Every
  // subsequent write MUST be fenced on this exact lease_until (the fencing token) — an
  // unguarded write here could blindly overwrite a record a DIFFERENT worker has since
  // taken over, stranding its in-progress work. On a takeover, `record` already carries
  // whatever a prior crashed attempt completed and persisted — every step below resumes
  // from that state instead of redoing already-finished work.
  const leaseUntil = reserveResult.record.lease_until;
  let record = reserveResult.record;

  // Loud, consistent failure policy: Stripe's subscription-checkout contract guarantees
  // customer_details + a created customer on a completed session, so an empty value here
  // means that contract didn't hold. Treat it the same as an unmapped price (fail loudly,
  // don't silently propagate an empty string into the welcome email / customer
  // association) rather than storing "" and moving on.
  if (!email || !customerId) {
    console.error("onboarding webhook: missing customer email/id", { eventId, type: event.type });
    // The alert is best-effort here, deliberately NOT allowed to block marking this
    // TERMINAL, unfixable-by-retry state done: a missing identity can never resolve
    // differently on a later delivery, so an alert-channel outage must not turn it into
    // an infinite retry loop. A failed alert is logged, not silently lost.
    let alertSent = false;
    try {
      await alertFounder(
        `checkout.session.completed (event ${eventId}) is missing customer email or id — cannot provision, needs manual follow-up.`
      );
      alertSent = true;
    } catch (err) {
      console.error("onboarding webhook: founder alert failed for a missing-identity event", sanitizedErrorTag(err));
    }
    try {
      await persistStep(eventId, leaseUntil, { status: "done", alertSent });
    } catch (err) {
      console.error("onboarding webhook: failed persisting a missing-identity event", sanitizedErrorTag(err));
      return NextResponse.json({ error: "processing error" }, { status: 500 });
    }
    return NextResponse.json({ received: true }, { status: 200 });
  }

  try {
    let plan: PlanId | null = record.plan;

    if (!plan) {
      const lineItems = await stripe.checkout.sessions.listLineItems(session.id, {
        expand: ["data.price"],
      });
      // Scan every line item for one whose price maps to a known plan — a checkout with a
      // fee/add-on line ahead of the plan line must not resolve off the wrong entry.
      const mappedItem = lineItems.data.find((li) => li.price?.id && planForPriceId(li.price.id));
      const priceId = mappedItem?.price?.id ?? lineItems.data[0]?.price?.id;
      plan = priceId ? planForPriceId(priceId) : null;

      if (!plan) {
        // §1.3: log event id + type + plan only — never customer PII, keys, or payloads.
        // priceId is a Stripe resource id, not PII — safe to log for triage.
        console.log("onboarding webhook: unknown price id", { eventId, type: event.type, plan: null, priceId: priceId ?? null });
        // The alert is best-effort, deliberately NOT allowed to block marking this
        // TERMINAL, unfixable-by-retry state done — an unmapped price can never resolve
        // differently on a later delivery, so an alert-channel outage must not turn it
        // into an infinite retry loop (mirrors the missing-identity branch above).
        let alertSent = false;
        try {
          await alertFounder(
            `Unknown Stripe price id "${priceId ?? "none"}" on checkout.session.completed (event ${eventId}) — no plan mapping, needs manual follow-up.`
          );
          alertSent = true;
        } catch (err) {
          console.error("onboarding webhook: founder alert failed for an unknown-price event", sanitizedErrorTag(err));
        }
        // Retrying will never resolve an unmapped price — ack so Stripe stops; the
        // stored unmappedPriceId is what a human uses to triage and fix the map.
        await persistStep(eventId, leaseUntil, { status: "done", alertSent, unmappedPriceId: priceId });
        return NextResponse.json({ received: true }, { status: 200 });
      }

      await persistStep(eventId, leaseUntil, { plan });
      record = { ...record, plan };
    }

    // Each side effect below is independently guarded (§1.4): a failure is logged and
    // leaves that step's completion flag unset, but does NOT stop the remaining
    // independent steps from being attempted this same request. Every SUCCESSFUL step is
    // persisted immediately, so a retry resumes only what's still missing.
    let stepFailed = false;

    let boardId = record.boardId;
    let boardUrl = record.boardUrl;
    if (!boardId) {
      try {
        const board = await copyBoard({ clientName, eventId, email, plan });
        boardId = board.boardId;
        boardUrl = board.boardUrl;
        await persistStep(eventId, leaseUntil, { boardId, boardUrl, inviteSent: true });
        record = { ...record, boardId, boardUrl, inviteSent: true };
      } catch (err) {
        if (err instanceof LeaseLostError) throw err;
        console.error("onboarding webhook: board provisioning failed", detailedErrorTag(err));
        stepFailed = true;
      }
    }

    // Deliberately skipped rather than attempted without a board — it would have no board
    // link to send. This still counts toward `stepFailed` (below) exactly like a genuine
    // failure would: it must trigger the same non-2xx/retry path, since emailSent staying
    // unset is what makes a later retry (once the board step succeeds) send it.
    if (!record.emailSent) {
      if (boardUrl) {
        try {
          await sendWelcomeEmail({ eventId, email, clientName: name, boardUrl, plan });
          await persistStep(eventId, leaseUntil, { emailSent: true });
          record = { ...record, emailSent: true };
        } catch (err) {
          if (err instanceof LeaseLostError) throw err;
          console.error("onboarding webhook: welcome email failed", detailedErrorTag(err));
          stepFailed = true;
        }
      } else {
        stepFailed = true;
      }
    }

    if (!record.alertSent) {
      try {
        await alertFounder(`New client: ${clientName} — ${plan}`);
        await persistStep(eventId, leaseUntil, { alertSent: true });
        record = { ...record, alertSent: true };
      } catch (err) {
        if (err instanceof LeaseLostError) throw err;
        console.error("onboarding webhook: founder alert failed", sanitizedErrorTag(err));
        stepFailed = true;
      }
    }

    if (!record.cardId) {
      try {
        const checkin = await createCheckin({ clientName, eventId });
        await persistStep(eventId, leaseUntil, { cardId: checkin.cardId });
        record = { ...record, cardId: checkin.cardId };
      } catch (err) {
        if (err instanceof LeaseLostError) throw err;
        console.error("onboarding webhook: day-5 check-in card failed", detailedErrorTag(err));
        stepFailed = true;
      }
    }

    if (stepFailed || !record.boardId || !record.emailSent || !record.alertSent || !record.cardId) {
      // §1.1(c)/§1.4: a partial failure must be surfaced via the founder alert, not just
      // logs — best-effort, deliberately not allowed to change the response below (Stripe
      // must still see non-2xx and retry regardless of whether this alert itself lands).
      const missing = [
        !record.boardId && "board",
        !record.emailSent && "welcome email",
        !record.alertSent && "founder alert",
        !record.cardId && "day-5 check-in card",
      ].filter((step): step is string => Boolean(step));
      try {
        await alertFounder(
          `Onboarding incomplete for ${clientName} (event ${eventId}) — still missing: ${missing.join(", ")}. Stripe will retry.`
        );
      } catch (err) {
        console.error("onboarding webhook: partial-failure alert itself failed", sanitizedErrorTag(err));
      }
      // Non-2xx so Stripe retries; the resume path (lease-expired takeover, above) picks
      // up next time and only re-attempts what's still missing.
      return NextResponse.json({ error: "processing incomplete" }, { status: 500 });
    }

    await persistStep(eventId, leaseUntil, { status: "done" });
    console.log("onboarding webhook: client fully provisioned", { eventId, type: event.type, plan });
    return NextResponse.json({ received: true }, { status: 200 });
  } catch (err) {
    if (err instanceof LeaseLostError) {
      console.error("onboarding webhook: lost lease fence mid-orchestration", { eventId });
    } else {
      console.error("onboarding webhook: processing error", sanitizedErrorTag(err));
    }
    // Non-2xx so Stripe retries and the resume path (lease-expired takeover) re-enters.
    return NextResponse.json({ error: "processing error" }, { status: 500 });
  }
}
