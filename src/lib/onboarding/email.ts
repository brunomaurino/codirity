import { Resend } from "resend";
import type { PlanId } from "./plans";
import { WelcomeEmail } from "./email-template";

const FROM_ADDRESS = "Codirity <support@codirity.com>";
const REPLY_TO_ADDRESS = "bruno.maurino@codirity.com";

const PLAN_DISPLAY_NAMES: Record<PlanId, string> = {
  standard: "Standard",
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

function requiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} not configured`);
  }
  return value;
}

/**
 * Sends the Appendix A welcome email via Resend. `eventId` is used ONLY to derive the
 * Idempotency-Key ("{eventId}-welcome") — never included in the email body or logged —
 * so a webhook retry that crosses the send/record boundary can't duplicate the email.
 */
export async function sendWelcomeEmail({ eventId, email, clientName, boardUrl, plan }: SendWelcomeEmailParams): Promise<void> {
  const apiKey = requiredEnv("RESEND_API_KEY");
  const accessFormUrl = requiredEnv("ACCESS_FORM_URL");
  const billingPortalUrl = requiredEnv("STRIPE_BILLING_PORTAL_URL");

  const resend = new Resend(apiKey);
  const planName = PLAN_DISPLAY_NAMES[plan];

  const { error } = await resend.emails.send(
    {
      from: FROM_ADDRESS,
      to: email,
      replyTo: REPLY_TO_ADDRESS,
      subject: "Welcome to Codirity — your board is ready",
      react: WelcomeEmail({ clientName, boardUrl, accessFormUrl, planName, billingPortalUrl }),
    },
    { idempotencyKey: `${eventId}-welcome` }
  );

  if (error) {
    throw new Error(`Resend send failed: ${error.name} — ${error.message}`);
  }
}
