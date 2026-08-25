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
  clientLine,
  guaranteeNote,
  isCancellationRequested,
  isCancellationReverted,
  refundHowTo,
  stripeCustomerUrl,
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
// canceled_at is what the note measures from; the second arg is only the fallback.
const inside = (n: number) => guaranteeNote(sub({ canceled_at: START + n }), START).includes("INSIDE");
check("día 1 (0s) está adentro", inside(0), true);
check("día 3 está adentro", inside(3 * DAY), true);
check("exactamente 7x24h está adentro (el borde va a favor del cliente)", inside(7 * DAY), true);
check("7x24h + 1s ya está afuera", inside(7 * DAY + 1), false);
check("día 30 está afuera", inside(30 * DAY), false);
check("monto: 50% de USD 99.00 = USD 49.50", guaranteeNote(sub(), START).includes("USD 49.50"), true);
check("mide desde canceled_at, no desde el evento", guaranteeNote(sub({ canceled_at: START + 30 * DAY }), START).includes("no refund owed"), true);
check("sin canceled_at cae al timestamp del evento", guaranteeNote(sub(), START + 30 * DAY).includes("no refund owed"), true);
check("suma por cantidad: 2 x 9900 → USD 99.00", guaranteeNote(sub({ items: { data: [{ quantity: 2, price: { unit_amount: 9900 } }] } }), START).includes("USD 99.00"), true);
check("el número de día es correcto (día 4 a las 72h)", guaranteeNote(sub({ canceled_at: START + 3 * DAY }), START).startsWith("Day 4 "), true);

console.log("\n── fecha de fin de acceso ──");
check("usa cancel_at cuando está", accessEndsOn(sub({ cancel_at: START + 12 * DAY })), "2025-06-27");
check("cae al current_period_end del item", accessEndsOn(sub()), "2025-07-15");
check("sin ninguno, texto de fallback", accessEndsOn(sub({ items: { data: [{ quantity: 1, price: { unit_amount: 9900 } }] } })), "the end of the current period");

console.log("\n── identidad y enlaces de la alerta ──");
check("nombre + email + plan", clientLine("Bruno Maurino", "b@acme.com", "cus_1", "Standard"), "Bruno Maurino <b@acme.com> (Standard)");
check("sin email no inventa <>", clientLine("Bruno Maurino", "", "cus_1", "Pro"), "Bruno Maurino (Pro)");
check("sin plan no inventa ()", clientLine("Bruno Maurino", "b@acme.com", "cus_1", null), "Bruno Maurino <b@acme.com>");
check("customer borrado: lo dice en vez de mostrar el id pelado",
  clientLine("cus_V8aCvN0XtL5nT8", "", "cus_V8aCvN0XtL5nT8", "Standard").includes("the Stripe customer was deleted"), true);
check("customer borrado: igual conserva el id", clientLine("cus_9", "", "cus_9", null).startsWith("cus_9"), true);
check("link de test lleva /test/", stripeCustomerUrl("cus_9", false), "https://dashboard.stripe.com/test/customers/cus_9");
check("link live NO lleva /test/", stripeCustomerUrl("cus_9", true), "https://dashboard.stripe.com/customers/cus_9");
check("los pasos de reembolso incluyen el link correcto", refundHowTo("cus_9", true).includes("https://dashboard.stripe.com/customers/cus_9"), true);
check("los pasos de reembolso son 3", refundHowTo("cus_9", true).split("\n").length, 4);

console.log(failures ? `\n⛔ ${failures} fallaron` : "\n✅ todo verde");
process.exit(failures ? 1 : 0);
