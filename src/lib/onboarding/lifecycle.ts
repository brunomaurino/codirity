import type Stripe from "stripe";
import { guarantee } from "@/config/offer";

/**
 * Pure helpers for the subscription-lifecycle branch of the Stripe webhook. They live
 * outside route.ts for two reasons: a Next.js route module constrains what it may export,
 * and these are the only pieces of that flow that can be exercised without a signed
 * payload, a live Upstash lease and a Trello board — see scripts/lifecycle-selftest.ts.
 */

/**
 * The billing portal cancels at PERIOD END (`mode=at_period_end`), which is correct for a
 * monthly plan: the client paid the month and keeps access to its last day. The cost is
 * that `customer.subscription.deleted` — and with it the revoke card — does not fire until
 * that day, up to a month after the client actually decided to leave.
 *
 * These two guards catch the DECISION instead, the moment when the only two things that
 * matter about a cancellation are still actionable: winning the client back, and honouring
 * the published `guarantee` (offer.ts) — 50% back inside the first 7 days, which is a
 * MANUAL refund in Stripe and cannot be issued once the window has closed. Learning about
 * a day-3 cancellation on day 30 means the site promised something the ops flow could not
 * deliver.
 *
 * Same shape as isPortalPauseTransition: `previous_attributes` carries ONLY the fields that
 * changed, so requiring it is what proves this is a transition and not a redelivery of an
 * already-cancelling subscription.
 */
export function isCancellationRequested(event: Stripe.Event): event is Stripe.CustomerSubscriptionUpdatedEvent {
  if (event.type !== "customer.subscription.updated") {
    return false;
  }
  return (
    event.data.object.cancel_at_period_end === true &&
    event.data.previous_attributes?.cancel_at_period_end === false
  );
}

/** The client changed their mind before the period ended. Without this the founder is left
 * holding a "cancelling" flag forever and may revoke access from someone still paying. */
export function isCancellationReverted(event: Stripe.Event): event is Stripe.CustomerSubscriptionUpdatedEvent {
  if (event.type !== "customer.subscription.updated") {
    return false;
  }
  return (
    event.data.object.cancel_at_period_end === false &&
    event.data.previous_attributes?.cancel_at_period_end === true
  );
}

/** `USD 49.50`. The offer prices in USD; a zero-decimal currency (JPY, KRW) would render a
 * spurious ".00" — revisit if Codirity ever bills in one. */
export function formatMoney(cents: number, currency: string): string {
  return `${currency.toUpperCase()} ${(cents / 100).toFixed(2)}`;
}

/**
 * Turns `guarantee` (offer.ts — the same 7 days / 50% the site promises) into the one line
 * the founder needs to act: is a refund owed, and how much.
 *
 * The moment measured against is `canceled_at` — Stripe's own record of WHEN the client
 * asked to cancel, which is exactly what the promise is about. `eventCreated` is only the
 * fallback for a shape that carries no `canceled_at` (a reverted cancellation).
 *
 * Neither is wall-clock time, deliberately: a Stripe retry hours later must not recompute a
 * different day number than the delivery it retries. And `canceled_at` is the ONLY one of
 * the two that a test clock simulates — measured directly, `event.created` stays pinned to
 * real time even for a customer on a clock advanced nine days (probed 2026-08-25), so
 * measuring from the event would have silently reported "Day 1" for every scenario and made
 * the before/after-7-days tests indistinguishable.
 */
export function guaranteeNote(subscription: Stripe.Subscription, eventCreated: number): string {
  const requestedAt = subscription.canceled_at ?? eventCreated;
  const elapsed = requestedAt - subscription.start_date;
  const day = Math.floor(elapsed / 86_400) + 1; // signup day is day 1, not day 0
  // `<=` so a cancellation at exactly 7x24h still counts. "Within your first 7 days" is a
  // promise made to a paying client; the boundary should not be resolved against them.
  if (elapsed > guarantee.days * 86_400) {
    return `Day ${day} — past the ${guarantee.days}-day window, no refund owed.`;
  }
  const cents = subscription.items.data.reduce(
    (sum, item) => sum + (item.price.unit_amount ?? 0) * (item.quantity ?? 1),
    0
  );
  const refund = formatMoney(Math.round((cents * guarantee.refundPct) / 100), subscription.currency);
  return (
    `Day ${day} — INSIDE the ${guarantee.days}-day guarantee: owes ${guarantee.refundPct}% back ` +
    `= ${refund}. Stripe does NOT refund this automatically — issue it manually.`
  );
}

/** The day the client actually loses access. `cancel_at` is what the portal sets on an
 * at_period_end cancellation; the item's `current_period_end` is the fallback (this Stripe
 * version moved that field off the Subscription and onto its items). */
export function accessEndsOn(subscription: Stripe.Subscription): string {
  const unix = subscription.cancel_at ?? subscription.items.data[0]?.current_period_end ?? null;
  return unix ? new Date(unix * 1000).toISOString().slice(0, 10) : "the end of the current period";
}

