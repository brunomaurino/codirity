/**
 * Self-test for the pure half of the subscription-lifecycle branch (lib/onboarding/
 * lifecycle.ts) — the part that decides whether a `.updated` delivery is a cancellation at
 * all, and whether the 7-day / 50% guarantee is owed.
 *
 * It exists because those two answers are the entire difference between the "cancels before
 * 7 days" and "cancels after 7 days" scenarios: if this logic is wrong, both tests produce
 * the same alert and the guarantee silently goes unhonoured.
 *
 * Run: npx tsx scripts/lifecycle-selftest.ts
 * A green run means nothing until you have watched it go red on an injected mutation.
 */
import type Stripe from "stripe";
import {
  accessEndsOn,
  guaranteeNote,
  isCancellationRequested,
  isCancellationReverted,
} from "../src/lib/onboarding/lifecycle";

const DAY = 86_400;
const START = 1_750_000_000; // arbitrary fixed epoch; nothing here reads wall-clock time
let failures = 0;

function check(label: string, actual: unknown, expected: unknown) {
  const ok = JSON.stringify(actual) === JSON.stringify(expected);
  if (!ok) failures++;
  console.log(`  ${ok ? "✓" : "✗"} ${label}`);
  if (!ok) console.log(`      esperado: ${JSON.stringify(expected)}\n      obtuve:   ${JSON.stringify(actual)}`);
}

function sub(over: Record<string, unknown> = {}): Stripe.Subscription {
  return {
    id: "sub_test", customer: "cus_test", currency: "usd", start_date: START,
    cancel_at: null, cancel_at_period_end: false, pause_collection: null,
    items: { data: [{ quantity: 1, current_period_end: START + 30 * DAY, price: { unit_amount: 9900 } }] },
    ...over,
  } as unknown as Stripe.Subscription;
}

function ev(object: unknown, previous: unknown, type = "customer.subscription.updated"): Stripe.Event {
  return { id: "evt_test", type, created: START, data: { object, previous_attributes: previous } } as unknown as Stripe.Event;
}

console.log("── guards: qué cuenta como pedido de cancelación ──");
check("false→true es un pedido", isCancellationRequested(ev(sub({ cancel_at_period_end: true }), { cancel_at_period_end: false })), true);
check("false→true NO es una reversión", isCancellationReverted(ev(sub({ cancel_at_period_end: true }), { cancel_at_period_end: false })), false);
check("true→false es una reversión", isCancellationReverted(ev(sub({ cancel_at_period_end: false }), { cancel_at_period_end: true })), true);
check("true→false NO es un pedido", isCancellationRequested(ev(sub({ cancel_at_period_end: false }), { cancel_at_period_end: true })), false);
check("redelivery ya-cancelando (sin previous) se ignora", isCancellationRequested(ev(sub({ cancel_at_period_end: true }), undefined)), false);
check("una pausa del portal NO es cancelación", isCancellationRequested(ev(sub({ pause_collection: { behavior: "void" } }), { pause_collection: null })), false);
check(".deleted no entra por acá", isCancellationRequested(ev(sub(), undefined, "customer.subscription.deleted")), false);
check("cambio irrelevante (metadata) se ignora", isCancellationRequested(ev(sub(), { metadata: {} })), false);

console.log("\n── garantía: 7 días / 50% ──");
const inside = (n: number) => guaranteeNote(sub(), START + n).includes("INSIDE");
check("día 1 (0s) está adentro", inside(0), true);
check("día 3 está adentro", inside(3 * DAY), true);
check("exactamente 7x24h está adentro (el borde va a favor del cliente)", inside(7 * DAY), true);
check("7x24h + 1s ya está afuera", inside(7 * DAY + 1), false);
check("día 30 está afuera", inside(30 * DAY), false);
check("monto: 50% de USD 99.00 = USD 49.50", guaranteeNote(sub(), START).includes("USD 49.50"), true);
check("suma por cantidad: 2 x 9900 → USD 99.00", guaranteeNote(sub({ items: { data: [{ quantity: 2, price: { unit_amount: 9900 } }] } }), START).includes("USD 99.00"), true);
check("afuera no promete plata", guaranteeNote(sub(), START + 30 * DAY).includes("no refund owed"), true);
check("el número de día es correcto (día 4 a las 72h)", guaranteeNote(sub(), START + 3 * DAY).startsWith("Day 4 "), true);

console.log("\n── fecha de fin de acceso ──");
check("usa cancel_at cuando está", accessEndsOn(sub({ cancel_at: START + 12 * DAY })), "2025-06-27");
check("cae al current_period_end del item", accessEndsOn(sub()), "2025-07-15");
check("sin ninguno, texto de fallback", accessEndsOn(sub({ items: { data: [{ quantity: 1, price: { unit_amount: 9900 } }] } })), "the end of the current period");

console.log(failures ? `\n⛔ ${failures} fallaron` : "\n✅ todo verde");
process.exit(failures ? 1 : 0);
