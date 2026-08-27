import { Resend } from "resend";
import { requiredEnv } from "./onboarding/env";

/**
 * One place that sends plain notification mail, over Resend's HTTP API.
 *
 * This replaces a nodemailer/SMTP transport that authenticated as a personal Gmail
 * account. Two reasons the SMTP path had to go:
 *
 *  1. codirity.com's mailbox is moving to Zoho's free plan, which has **no SMTP, POP or
 *     IMAP access** — so there is no longer a credentialed SMTP server to relay through.
 *  2. Sending as a gmail.com address from a site that charges USD 2,995/mo undercut the
 *     offer at the exact moment a prospect looked closely.
 *
 * Resend was already configured and DNS-verified for this domain before this change:
 * DKIM at `resend._domainkey.codirity.com` and the Return-Path on `send.codirity.com`,
 * which is also why adding a root-level SPF record for Zoho does not disturb it — the
 * two are authenticated against different names.
 *
 * The welcome email (onboarding/email.ts) deliberately keeps its own call: it renders
 * React Email and carries a Stripe-derived idempotency key, and it works today. This
 * module is for the plain messages, and it follows that file's error contract exactly so
 * the two cannot drift.
 */

/** Any address at the verified domain is a legal sender. Overridable so a preview
 *  deployment can send from somewhere else without a code change. */
const FROM_ADDRESS = process.env.MAIL_FROM || "Codirity <support@codirity.com>";

/** Carried over from the nodemailer version, whose comment recorded the reason: an
 *  unbounded send can hang past the caller's own budget and block every step queued
 *  behind it. Resend is HTTP rather than a socket, but a stalled request stalls just the
 *  same, so the caller is still released on a deadline. This unblocks the caller; it
 *  does not cancel the in-flight request, which is the behaviour the original comment
 *  actually asked for ("failing fast and letting them proceed independently"). */
const SEND_TIMEOUT_MS = 10_000;

export interface SendMailParams {
  to: string | string[];
  subject: string;
  /** Required, never optional. An HTML-only message raises spam score, and these land in
   *  the founder's inbox and in prospects' reply threads — the same rule the welcome
   *  email follows by rendering an explicit plain-text part. */
  text: string;
  html?: string;
  replyTo?: string;
  /** Passed straight to Resend when the caller has a natural dedup key (a Stripe event
   *  id, say). Omit it for messages a retry should legitimately send again. */
  idempotencyKey?: string;
}

export interface SendMailResult {
  /** Resend's message id, for delivery/bounce lookups. */
  id: string;
}

export async function sendMail({
  to,
  subject,
  text,
  html,
  replyTo,
  idempotencyKey,
}: SendMailParams): Promise<SendMailResult> {
  const resend = new Resend(requiredEnv("RESEND_API_KEY"));

  const send = resend.emails.send(
    { from: FROM_ADDRESS, to, subject, text, html, replyTo },
    idempotencyKey ? { idempotencyKey } : undefined
  );

  let timer: ReturnType<typeof setTimeout> | undefined;
  const deadline = new Promise<never>((_, reject) => {
    timer = setTimeout(
      () => reject(new Error(`Resend send timed out after ${SEND_TIMEOUT_MS}ms`)),
      SEND_TIMEOUT_MS
    );
  });

  try {
    const { data, error } = await Promise.race([send, deadline]);
    // Same contract as onboarding/email.ts: the SDK reports failure in `error` rather
    // than throwing, so an unchecked call silently "succeeds" on a rejected send.
    if (error) {
      throw new Error(`Resend send failed: ${error.name} — ${error.message}`);
    }
    if (!data) {
      throw new Error("Resend send returned no data and no error");
    }
    return { id: data.id };
  } finally {
    clearTimeout(timer);
  }
}
