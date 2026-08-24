import { Resend } from "resend";
import { render } from "@react-email/render";
import { tiers } from "@/config/offer";
import type { PlanId } from "./plans";
import { requiredEnv } from "./env";
import { WelcomeEmail, WELCOME_EMAIL_SUBJECT } from "./email-template";

// Resend only sends from a DNS-verified domain, so the FROM stays on codirity.com —
// gmail.com can never be verified as a sender there. That mailbox is currently
// inactive, which is exactly why REPLY_TO points at the live inbox: a client hitting
// Reply reaches Bruno, not a dead Workspace address.
const FROM_ADDRESS = "Codirity <support@codirity.com>";
const REPLY_TO_ADDRESS = "brunomaurino27@gmail.com";

function requiredTierName(id: "standard" | "pro"): string {
  const tier = tiers.find((t) => t.id === id);
  if (!tier) throw new Error(`PLAN_DISPLAY_NAMES: '${id}' tier missing from offer.ts`);
  return tier.name;
}

// Derived from src/config/offer.ts (the HANDOFF's canonical source) for standard/pro,
// mirroring trello.ts's activeTasksNoteFor() — a future tier-name change in offer.ts then
// desyncs this at compile/runtime-obviously time, not silently. Founding has no Tier entry
// in offer.ts (foundingRate is a separate rate object with no `name` field), so it's
// hardcoded to match the HANDOFF's own "Standard / Pro / Founding" casing.
const PLAN_DISPLAY_NAMES: Record<PlanId, string> = {
  standard: requiredTierName("standard"),
  pro: requiredTierName("pro"),
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
