/**
 * price_id → plan map for the onboarding webhook. Server-only env vars (no
 * `NEXT_PUBLIC_` prefix) — these are read exclusively inside the webhook route
 * handler and must never be bundled into client JS, unlike offer.ts's public
 * Payment Link vars.
 */

export type PlanId = "standard" | "pro" | "founding";

function planMap(): Record<string, PlanId> {
  const map: Record<string, PlanId> = {};
  if (process.env.STRIPE_PRICE_ID_STANDARD) {
    map[process.env.STRIPE_PRICE_ID_STANDARD] = "standard";
  }
  if (process.env.STRIPE_PRICE_ID_PRO) {
    map[process.env.STRIPE_PRICE_ID_PRO] = "pro";
  }
  if (process.env.STRIPE_PRICE_ID_FOUNDING) {
    map[process.env.STRIPE_PRICE_ID_FOUNDING] = "founding";
  }
  return map;
}

/** Returns the plan for a Stripe price id, or `null` if it isn't a recognized plan price. */
export function planForPriceId(priceId: string): PlanId | null {
  return planMap()[priceId] ?? null;
}
