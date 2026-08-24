/**
 * Diagnostic for the Bundle 3 welcome email — the step that fails as
 * "still missing: welcome email" in the webhook's partial-failure alert, which names
 * the step but never the reason.
 *
 * Two phases, so it stays useful even with no Resend key on hand:
 *   1. RENDER (offline)  — proves the template puts the board link and the access-form
 *      link in the body. Needs no API key.
 *   2. SEND (live)       — only with RESEND_API_KEY set; reports Resend's own error
 *      verbatim instead of the webhook's swallowed one-liner.
 *
 *   npx tsx scripts/welcome-email-doctor.ts [recipient]
 */
import { existsSync } from "node:fs";
import { render } from "@react-email/render";
import { WelcomeEmail, WELCOME_EMAIL_SUBJECT } from "../src/lib/onboarding/email-template";

if (existsSync(".env.local")) process.loadEnvFile(".env.local");

async function main() {
  const REQUIRED = ["RESEND_API_KEY", "ACCESS_FORM_URL", "STRIPE_BILLING_PORTAL_URL"] as const;
  const mask = (v: string) => (v.length <= 8 ? "***" : `${v.slice(0, 4)}…${v.slice(-2)} (${v.length} chars)`);

  console.log("── env que sendWelcomeEmail() exige, en orden ──");
  const missing: string[] = [];
  for (const name of REQUIRED) {
    const v = process.env[name];
    if (!v) { missing.push(name); console.log(`  ✗ ${name}  → tira "${name} not configured"`); }
    else console.log(`  ✓ ${name}  ${name.includes("KEY") ? mask(v) : v}`);
  }

  // ---------- phase 1: render ----------
  const BOARD = "https://trello.com/b/DOCTOR01/codirity-test-board";
  const FORM = process.env.ACCESS_FORM_URL ?? "https://tally.so/r/PLACEHOLDER";
  const html = await render(WelcomeEmail({
    clientName: "Bruno Maurino", boardUrl: BOARD, accessFormUrl: FORM,
    planName: "Standard", billingPortalUrl: process.env.STRIPE_BILLING_PORTAL_URL ?? "https://billing.example",
  }));

  console.log(`\n── render (offline) — asunto: ${WELCOME_EMAIL_SUBJECT!} ──`);
  let renderOk = true;
  for (const [label, needle] of [["el link del TABLERO", BOARD], ["el FORM de acceso", FORM]] as const) {
    const hit = html.includes(needle);
    if (!hit) renderOk = false;
    console.log(`  ${hit ? "✓" : "✗"} ${label}: ${needle}`);
  }
  const leftovers = [...html.matchAll(/\{([a-zA-Z]+)\}/g)].map((m) => m[0]);
  console.log(`  ${leftovers.length ? "✗" : "✓"} placeholders sin sustituir: ${leftovers.length ? leftovers.join(", ") : "ninguno"}`);

  if (missing.length) {
    console.log(`\n⛔ falta ${missing.join(", ")} — el render ${renderOk ? "está sano" : "TIENE PROBLEMAS"}, pero no puedo enviar.`);
    process.exit(1);
  }

  // ---------- phase 2: live send ----------
  const to = process.argv[2] ?? "brunomaurino27@gmail.com";
  console.log(`\n── envío real vía Resend → ${to} ──`);
  const { sendWelcomeEmail } = await import("../src/lib/onboarding/email");
  try {
    const res = await sendWelcomeEmail({
      eventId: `doctor-${process.env.DOCTOR_RUN ?? "1"}`,
      email: to, clientName: "Bruno Maurino", boardUrl: BOARD, plan: "standard",
    });
    console.log(`  ✓ Resend aceptó — message id ${res.id}`);
  } catch (err) {
    console.log(`  ✗ ${err instanceof Error ? err.message : String(err)}`);
    process.exit(1);
  }
}

main();
