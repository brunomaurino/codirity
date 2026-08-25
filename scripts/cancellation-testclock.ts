/**
 * End-to-end harness for the two cancellation scenarios the guarantee distinguishes:
 * a client who cancels INSIDE the 7-day window (50% owed) and one who cancels after it.
 *
 *   npx tsx scripts/cancellation-testclock.ts before   # cancels on day 3
 *   npx tsx scripts/cancellation-testclock.ts after    # cancels on day 10
 *   npx tsx scripts/cancellation-testclock.ts before --cleanup
 *
 * Waiting a real week is not an option, so this drives a Stripe TEST CLOCK: a simulated
 * timeline Stripe advances on command, emitting every event the real calendar would.
 *
 * Two things worth knowing before running it:
 *   - A Payment Link CANNOT be bound to a test clock, which is why the customer and the
 *     subscription are created through the API here instead of through checkout.
 *   - Stripe does NOT stamp `event.created` with simulated time — it stays pinned to real
 *     wall-clock even for a customer on a clock advanced nine days (probed 2026-08-25).
 *     The subscription's own `canceled_at` IS simulated, which is why lifecycle.ts measures
 *     the guarantee window from that field and not from the event.
 *   - The test-mode webhook endpoint points at PRODUCTION
 *     (https://www.codirity.com/api/webhooks/stripe), so these events exercise the
 *     DEPLOYED code. Push and let Vercel finish before reading anything into the result.
 *
 * The last step is the point of the whole script: it pulls the event Stripe actually
 * emitted and runs it through the same lifecycle.ts predicates the webhook uses, printing
 * the alert the deployed handler should have produced. That checks the logic against a
 * REAL Stripe payload — something the synthetic fixtures in lifecycle-selftest.ts cannot.
 */
import { existsSync } from "node:fs";
import Stripe from "stripe";
import { accessEndsOn, guaranteeNote, isCancellationRequested } from "../src/lib/onboarding/lifecycle";

if (existsSync(".env.local")) process.loadEnvFile(".env.local");

const DAY = 86_400;
const SCENARIOS = { before: 3, after: 10 } as const;

function need(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`${name} not configured — needed in .env.local`);
  return v;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function main() {
  const which = process.argv[2] as keyof typeof SCENARIOS;
  if (!(which in SCENARIOS)) {
    console.error("uso: npx tsx scripts/cancellation-testclock.ts before|after [--cleanup]");
    process.exit(2);
  }
  const cancelOnDay = SCENARIOS[which];
  const cleanup = process.argv.includes("--cleanup");

  const key = need("STRIPE_SECRET_KEY");
  if (!key.startsWith("sk_test")) {
    // A test clock cannot exist in live mode, but refusing loudly beats a confusing API
    // error — and beats any chance of touching a real customer.
    throw new Error("STRIPE_SECRET_KEY is not a test key. This harness only runs in test mode.");
  }
  const price = need("STRIPE_PRICE_ID_STANDARD");
  const stripe = new Stripe(key);

  console.log(`\n── escenario "${which}": cancela el día ${cancelOnDay + 1} ──`);

  const t0 = Math.floor(Date.now() / 1000) - 60;
  const clock = await stripe.testHelpers.testClocks.create({
    frozen_time: t0,
    name: `codirity cancel-${which}`,
  });
  console.log(`  reloj ${clock.id} congelado en ${new Date(t0 * 1000).toISOString().slice(0, 10)}`);

  const customer = await stripe.customers.create({
    name: "Test Clock Client",
    email: "testclock@example.com",
    test_clock: clock.id,
  });
  // attach() mints a NEW payment method and returns ITS id — the "pm_card_visa" token is
  // only an input. Reusing the token string as the default silently fails the invoice.
  const pm = await stripe.paymentMethods.attach("pm_card_visa", { customer: customer.id });
  await stripe.customers.update(customer.id, {
    invoice_settings: { default_payment_method: pm.id },
  });

  const created = await stripe.subscriptions.create({
    customer: customer.id,
    items: [{ price }],
  });
  console.log(`  suscripción ${created.id} activa (${created.status})`);

  // Advancing is asynchronous: Stripe replays every invoice/renewal the skipped days would
  // have produced, and the clock reports `advancing` until that backlog is drained.
  const target = t0 + cancelOnDay * DAY;
  console.log(`  avanzando el reloj ${cancelOnDay} días…`);
  await stripe.testHelpers.testClocks.advance(clock.id, { frozen_time: target });
  for (let i = 0; i < 60; i++) {
    const c = await stripe.testHelpers.testClocks.retrieve(clock.id);
    if (c.status === "ready") break;
    if (c.status === "internal_failure") throw new Error("el reloj falló al avanzar");
    await sleep(2000);
  }

  const cancelled = await stripe.subscriptions.update(created.id, { cancel_at_period_end: true });
  console.log(`  cancelación pedida — cancel_at_period_end=${cancelled.cancel_at_period_end}`);

  // ── the real check: what did Stripe actually emit, and what would the webhook say? ──
  let hit: Stripe.Event | undefined;
  for (let i = 0; i < 15 && !hit; i++) {
    const events = await stripe.events.list({ type: "customer.subscription.updated", limit: 25 });
    hit = events.data.find(
      (e) => (e.data.object as Stripe.Subscription).id === created.id && isCancellationRequested(e)
    );
    if (!hit) await sleep(2000);
  }

  if (!hit) {
    console.log("\n  ✗ Stripe no emitió ningún `.updated` que el guard reconozca como pedido de cancelación.");
    console.log("    Ese es el hallazgo: sin ese evento el webhook no puede avisarte de nada.");
  } else {
    const sub = hit.data.object as Stripe.Subscription;
    console.log(`\n  ✓ evento real ${hit.id} — el guard lo reconoce`);
    console.log("\n  La alerta que el webhook desplegado debería haber mandado:\n");
    console.log(
      `    Cancellation requested: ${customer.name} — access stays live until ` +
        `${accessEndsOn(sub)}. ${guaranteeNote(sub, hit.created)}`
    );
    const inside = guaranteeNote(sub, hit.created).includes("INSIDE");
    const shouldBeInside = which === "before";
    console.log(
      `\n  ${inside === shouldBeInside ? "✓" : "✗"} ventana de garantía: ` +
        `${inside ? "ADENTRO" : "afuera"} (para "${which}" se esperaba ${shouldBeInside ? "ADENTRO" : "afuera"})`
    );
  }

  console.log(`\n  Revisá el inbox: la alerta real la manda el webhook desplegado.`);
  if (cleanup) {
    await stripe.testHelpers.testClocks.del(clock.id);
    console.log(`  reloj ${clock.id} borrado (con customer y suscripción)`);
  } else {
    console.log(`  para limpiar: npx tsx scripts/cancellation-testclock.ts ${which} --cleanup borra uno nuevo,`);
    console.log(`  o borrá este a mano en el dashboard → Billing → Test clocks (${clock.id})`);
  }
}

main().catch((err) => {
  console.error(`\n⛔ ${err instanceof Error ? err.message : String(err)}`);
  process.exit(1);
});
