import nodemailer from "nodemailer";
import { requiredEnv } from "./env";
import { trelloRequest } from "./trello";

const OPS_LIST_NAME = "To Do";

/**
 * Founder alert — via the EXISTING nodemailer/SMTP setup already used by
 * api/contact/route.ts, not Resend and not a Slack webhook. The operator chose email over
 * Slack for O4; reusing the already-verified SMTP transporter avoids depending on the
 * still-missing RESEND_API_KEY for a plain internal alert that doesn't need React Email
 * templating at all.
 */
export async function alertFounder(message: string): Promise<void> {
  const host = process.env.SMTP_HOST || "smtp.gmail.com";
  const port = parseInt(process.env.SMTP_PORT || "587", 10);
  const user = requiredEnv("SMTP_USER");
  const pass = requiredEnv("SMTP_PASSWORD");
  const to = requiredEnv("FOUNDER_ALERT_EMAIL");

  // Explicit, well-under-maxDuration timeouts: an unbounded nodemailer connection can hang
  // up to its OS-level socket default (well past this route's 60s budget), which would
  // block every step queued after the alert on each retry instead of failing fast and
  // letting them proceed independently.
  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: false,
    auth: { user, pass },
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 10_000,
  });

  await transporter.sendMail({
    from: `"Codirity Ops" <${user}>`,
    to,
    subject: "Codirity onboarding alert",
    text: message,
  });
}

function nextBusinessDaysFrom(start: Date, days: number): Date {
  const result = new Date(start);
  let added = 0;
  while (added < days) {
    result.setUTCDate(result.getUTCDate() + 1);
    const day = result.getUTCDay();
    if (day !== 0 && day !== 6) {
      added++;
    }
  }
  return result;
}

export interface CreateCheckinParams {
  clientName: string;
}

export interface CreateCheckinResult {
  cardId: string;
}

/** Appendix D of docs/HANDOFF-client-onboarding.md, seeded VERBATIM (§1.8). */
function checkinDescription(clientName: string): string {
  return `Hey ${clientName} — quick pulse check, no reply pressure. How's the first week feeling? Anything about the rhythm, the deliveries, or how we communicate that you'd tweak? If something's off, tell me straight — I'd rather fix it now. And if you're happy, the best thing you can do is load up that backlog 🙂`;
}

/**
 * Creates the day-5 check-in card on the founder's ops board (TRELLO_OPS_BOARD_ID), due
 * 5 BUSINESS days out. Looks up the "To Do" list by name on that board — this is Bruno's
 * own manually-curated board, so a missing/renamed list fails loudly rather than guessing
 * another list or silently creating one.
 */
export async function createCheckin({ clientName }: CreateCheckinParams): Promise<CreateCheckinResult> {
  const opsBoardId = requiredEnv("TRELLO_OPS_BOARD_ID");
  const lists = (await trelloRequest(`/boards/${opsBoardId}/lists?fields=name`)) as Array<{
    id: string;
    name: string;
  }>;
  const list = lists.find((l) => l.name === OPS_LIST_NAME);
  if (!list) {
    throw new Error(`createCheckin: no "${OPS_LIST_NAME}" list found on the ops board`);
  }

  const due = nextBusinessDaysFrom(new Date(), 5);
  const params = new URLSearchParams({
    idList: list.id,
    name: `Day-5 check-in — ${clientName}`,
    desc: checkinDescription(clientName),
    due: due.toISOString(),
  });
  const card = (await trelloRequest(`/cards?${params.toString()}`, { method: "POST" })) as { id: string };
  return { cardId: card.id };
}
