import { Resend } from "resend";
import { render } from "@react-email/render";
import { tiers } from "@/config/offer";
import type { PlanId } from "./plans";
import { requiredEnv } from "./env";
import { WelcomeEmail, WELCOME_EMAIL_SUBJECT } from "./email-template";

// Resend only sends from a DNS-verified domain, so the FROM stays on codirity.com —
// gmail.com can never be verified as a sender there. FROM and REPLY_TO are now the same
// mailbox: support@ receives again since the Zoho cutover, so a client hitting Reply
// reaches a real inbox instead of the founder's personal Gmail.
const FROM_ADDRESS = "Codirity <support@codirity.com>";
const REPLY_TO_ADDRESS = "support@codirity.com";

function requiredTierName(id: "standard"): string {
  const tier = tiers.find((t) => t.id === id);
  if (!tier) throw new Error(`PLAN_DISPLAY_NAMES: '${id}' tier missing from offer.ts`);
  return tier.name;
}

// The live plan's name is DERIVED from src/config/offer.ts (the HANDOFF's canonical
// source), mirroring trello.ts's activeTasksNoteFor() — a tier-name change there desyncs
// this obviously, not silently. `pro` and `founding` are RETIRED plans (2026-09-14: one
// flat price) with no Tier entry left to read, so their names are literals: a
// subscription bought before that date still resolves through plans.ts and must still
// receive a welcome email that names the plan it actually pays for.
const PLAN_DISPLAY_NAMES: Record<PlanId, string> = {
  standard: requiredTierName("standard"),
  pro: "Pro",
  founding: "Founding",
};

export interface SendWelcomeEmailParams {
  eventId: string;
  email: string;
  clientName: string | null;
  boardUrl: string;
  plan: PlanId;
}

export interface SendWelcomeEmailResult {
  /** Resend's message id — for future delivery/bounce-status lookups (Bundle 4 may want
   * to persist this, mirroring copyBoard()'s boardId). */
  id: string;
}

/**
 * Sends the Appendix A welcome email via Resend. `eventId` is used ONLY to derive the
 * Idempotency-Key ("{eventId}-welcome") — never included in the email body or logged.
 * That key guards the narrow crash-between-send-and-record window within Resend's own
 * (undocumented-here, believed shorter-than-Stripe's-retry-horizon) retention window;
 * the DURABLE cross-retry guard is Bundle 1's per-step event record (`emailSent`), which
 * the caller must still check before calling this again for the same event.
 */
export async function sendWelcomeEmail({
  eventId,
  email,
  clientName,
  boardUrl,
  plan,
}: SendWelcomeEmailParams): Promise<SendWelcomeEmailResult> {
  const apiKey = requiredEnv("RESEND_API_KEY");
  const accessFormUrl = requiredEnv("ACCESS_FORM_URL");
  const billingPortalUrl = requiredEnv("STRIPE_BILLING_PORTAL_URL");

  const resend = new Resend(apiKey);
  const planName = PLAN_DISPLAY_NAMES[plan];
  const element = WelcomeEmail({ clientName, boardUrl, accessFormUrl, planName, billingPortalUrl });

  const { data, error } = await resend.emails.send(
    {
      from: FROM_ADDRESS,
      to: email,
      replyTo: REPLY_TO_ADDRESS,
      subject: WELCOME_EMAIL_SUBJECT,
      react: element,
      // resend's `react` path renders only an html body; without an explicit plain-text
      // part every welcome email ships HTML-only, which raises spam-score risk on a
      // paying client's very first touchpoint.
      text: await render(element, { plainText: true }),
    },
    { idempotencyKey: `${eventId}-welcome` }
  );

  if (error) {
    throw new Error(`Resend send failed: ${error.name} — ${error.message}`);
  }
  if (!data) {
    throw new Error("Resend send returned no data and no error");
  }
  return { id: data.id };
}
