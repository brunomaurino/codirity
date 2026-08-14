import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { reserveEvent, markDone } from "@/lib/onboarding/idempotency";
import { planForPriceId } from "@/lib/onboarding/plans";
import { alertFounder } from "@/lib/onboarding/founder-alert";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

// Must be >= this serverless function's max execution time, so a still-running
// delivery is never mistaken for a crashed one while genuinely in flight.
const LEASE_SECONDS = 90;

export async function POST(req: NextRequest) {
  // Read the RAW body first — req.json() would parse-and-mutate it, breaking
  // Stripe's signature verification (§1.2).
  const raw = await req.text();
  const signature = req.headers.get("stripe-signature");

  let event: Stripe.Event;
  try {
    if (!signature) {
      throw new Error("missing stripe-signature header");
    }
    event = stripe.webhooks.constructEvent(raw, signature, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    console.error("onboarding webhook: signature verification failed", err instanceof Error ? err.message : err);
    return NextResponse.json({ error: "invalid signature" }, { status: 400 });
  }

  if (event.type !== "checkout.session.completed") {
    return NextResponse.json({ received: true }, { status: 200 });
  }

  const session = event.data.object as Stripe.Checkout.Session;
  const eventId = event.id;
  const customerId = typeof session.customer === "string" ? session.customer : (session.customer?.id ?? "");
  const email = session.customer_details?.email ?? "";
  const name = session.customer_details?.name ?? null;

  const reserveResult = await reserveEvent(eventId, { eventId, customerId, email, name, plan: null }, LEASE_SECONDS);

  if (reserveResult.outcome === "done") {
    // Already fully processed — sequential replay is a strict no-op.
    return NextResponse.json({ received: true }, { status: 200 });
  }
  if (reserveResult.outcome === "lease-valid") {
    // Another delivery is live on this event id — back off, let Stripe retry later.
    return NextResponse.json({ error: "event reservation in progress" }, { status: 503 });
  }

  // "reserved" (won the initial NX) or "lease-expired-took-over" — this delivery
  // does the work. Only one concurrent delivery ever reaches this branch per event id.
  try {
    const lineItems = await stripe.checkout.sessions.listLineItems(session.id, {
      expand: ["data.price"],
    });
    const priceId = lineItems.data[0]?.price?.id;
    const plan = priceId ? planForPriceId(priceId) : null;

    if (!plan) {
      await alertFounder(
        `Unknown Stripe price id on checkout.session.completed (event ${eventId}) — no plan mapping, needs manual follow-up.`
      );
      // §1.3: log event id + type + plan only — never customer PII, keys, or payloads.
      console.log("onboarding webhook: unknown price id", { eventId, type: event.type, plan: null });
      // Retrying will never resolve an unmapped price — ack so Stripe stops, alert is
      // the "loud" failure signal a human acts on instead.
      await markDone(eventId);
      return NextResponse.json({ received: true }, { status: 200 });
    }

    console.log("onboarding webhook: reserved event", { eventId, type: event.type, plan });
    await markDone(eventId);
    return NextResponse.json({ received: true }, { status: 200 });
  } catch (err) {
    console.error("onboarding webhook: processing error", err instanceof Error ? err.message : err);
    // Non-2xx so Stripe retries and the resume path (lease-expired takeover) re-enters.
    return NextResponse.json({ error: "processing error" }, { status: 500 });
  }
}
