import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { reserveEvent, updateRecordIfLeaseHeld } from "@/lib/onboarding/idempotency";
import { planForPriceId, type PlanId } from "@/lib/onboarding/plans";
import { alertFounder, createCheckin } from "@/lib/onboarding/ops";
import { copyBoard } from "@/lib/onboarding/trello";
import { sendWelcomeEmail } from "@/lib/onboarding/email";

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

  if (event.type !== "checkout.session.completed") {
    return NextResponse.json({ received: true }, { status: 200 });
  }

  // Necessary, not redundant: Stripe's public types don't discriminate-narrow
  // `Event.Data.Object` from `event.type` (verified against the installed v22 types),
  // so this cast is the SDK-idiomatic way to recover the concrete shape after the
  // `event.type` guard above. Bundle 5 adding subscription-event branches should cast
  // similarly for each new type, not assume this one covers them.
  const session = event.data.object as Stripe.Checkout.Session;
  const eventId = event.id;
  const customerId = typeof session.customer === "string" ? session.customer : (session.customer?.id ?? "");
  const email = session.customer_details?.email ?? "";
  const name = session.customer_details?.name ?? null;
  const clientName = name ?? "there";

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
        console.error("onboarding webhook: board provisioning failed", sanitizedErrorTag(err));
        stepFailed = true;
      }
    }

    // Skipped (not counted as a failure) rather than attempted without a board — it would
    // have no board link to send. A later retry, once the board step succeeds, sends it.
    if (!record.emailSent) {
      if (boardUrl) {
        try {
          await sendWelcomeEmail({ eventId, email, clientName: name, boardUrl, plan });
          await persistStep(eventId, leaseUntil, { emailSent: true });
          record = { ...record, emailSent: true };
        } catch (err) {
          if (err instanceof LeaseLostError) throw err;
          console.error("onboarding webhook: welcome email failed", sanitizedErrorTag(err));
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
        const checkin = await createCheckin({ clientName });
        await persistStep(eventId, leaseUntil, { cardId: checkin.cardId });
        record = { ...record, cardId: checkin.cardId };
      } catch (err) {
        if (err instanceof LeaseLostError) throw err;
        console.error("onboarding webhook: day-5 check-in card failed", sanitizedErrorTag(err));
        stepFailed = true;
      }
    }

    if (stepFailed || !record.boardId || !record.emailSent || !record.alertSent || !record.cardId) {
      // Non-2xx so Stripe retries; the resume path (lease-expired takeover, above) picks
      // up next time and only re-attempts what's still missing.
      return NextResponse.json({ error: "processing incomplete" }, { status: 500 });
    }

    await persistStep(eventId, leaseUntil, { status: "done" });
    console.log("onboarding webhook: reserved event", { eventId, type: event.type, plan });
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
