import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { reserveEvent, updateRecordIfLeaseHeld } from "@/lib/onboarding/idempotency";
import { planForPriceId } from "@/lib/onboarding/plans";
import { alertFounder } from "@/lib/onboarding/founder-alert";

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
  // taken over, stranding its in-progress work.
  const leaseUntil = reserveResult.record.lease_until;

  // Loud, consistent failure policy: Stripe's subscription-checkout contract guarantees
  // customer_details + a created customer on a completed session, so an empty value here
  // means that contract didn't hold. Treat it the same as an unmapped price (fail loudly,
  // don't silently propagate an empty string into Bundle 3's welcome email / Bundle 5's
  // customer association) rather than storing "" and moving on.
  if (!email || !customerId) {
    await alertFounder(
      `checkout.session.completed (event ${eventId}) is missing customer email or id — cannot provision, needs manual follow-up.`
    );
    console.error("onboarding webhook: missing customer email/id", { eventId, type: event.type });
    const fenced = await updateRecordIfLeaseHeld(eventId, leaseUntil, { status: "done", alertSent: true });
    if (!fenced) {
      console.error("onboarding webhook: lost lease fence handling a missing-identity event", { eventId });
      return NextResponse.json({ error: "processing error" }, { status: 500 });
    }
    return NextResponse.json({ received: true }, { status: 200 });
  }

  try {
    const lineItems = await stripe.checkout.sessions.listLineItems(session.id, {
      expand: ["data.price"],
    });
    // Scan every line item for one whose price maps to a known plan — a checkout with a
    // fee/add-on line ahead of the plan line must not resolve off the wrong entry.
    const mappedItem = lineItems.data.find((li) => li.price?.id && planForPriceId(li.price.id));
    const priceId = mappedItem?.price?.id ?? lineItems.data[0]?.price?.id;
    const plan = priceId ? planForPriceId(priceId) : null;

    if (!plan) {
      await alertFounder(
        `Unknown Stripe price id "${priceId ?? "none"}" on checkout.session.completed (event ${eventId}) — no plan mapping, needs manual follow-up.`
      );
      // §1.3: log event id + type + plan only — never customer PII, keys, or payloads.
      // priceId is a Stripe resource id, not PII — safe to log for triage.
      console.log("onboarding webhook: unknown price id", { eventId, type: event.type, plan: null, priceId: priceId ?? null });
      // Retrying will never resolve an unmapped price — ack so Stripe stops, alert +
      // the stored unmappedPriceId are what a human uses to triage and fix the map.
      const fenced = await updateRecordIfLeaseHeld(eventId, leaseUntil, {
        status: "done",
        alertSent: true,
        unmappedPriceId: priceId,
      });
      if (!fenced) {
        console.error("onboarding webhook: lost lease fence handling an unknown-price event", { eventId });
        return NextResponse.json({ error: "processing error" }, { status: 500 });
      }
      return NextResponse.json({ received: true }, { status: 200 });
    }

    const fenced = await updateRecordIfLeaseHeld(eventId, leaseUntil, { plan, status: "done" });
    if (!fenced) {
      console.error("onboarding webhook: lost lease fence before marking done", { eventId });
      return NextResponse.json({ error: "processing error" }, { status: 500 });
    }
    console.log("onboarding webhook: reserved event", { eventId, type: event.type, plan });
    return NextResponse.json({ received: true }, { status: 200 });
  } catch (err) {
    console.error("onboarding webhook: processing error", sanitizedErrorTag(err));
    // Non-2xx so Stripe retries and the resume path (lease-expired takeover) re-enters.
    return NextResponse.json({ error: "processing error" }, { status: 500 });
  }
}
