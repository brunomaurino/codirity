import nodemailer from "nodemailer";
import { requiredEnv } from "./env";
import { trelloRequest, EVENT_MARKER_PREFIX } from "./trello";

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

/**
 * §1.1(d)-style reconcile, generalized from trello.ts's board reconcile to Trello CARDS:
 * scans the ops board's OPEN cards for one already carrying this event's marker before ever
 * creating a new one. Deliberately scoped to `filter=open` — mirrors copyBoard's own
 * reasoning: once the founder has archived a card (task handled), a late/replayed delivery
 * must not resurrect or duplicate it. The marker is APPENDED to the card's own description
 * (never replacing it — a checklist/pulse-check card's desc IS its content) as a trailing
 * line; reconcile only needs the marker to be a substring, so whatever list the founder has
 * since moved the card to, or however they've edited the visible text, the marker still
 * matches.
 */
async function findExistingCard(opsBoardId: string, eventId: string): Promise<{ id: string } | null> {
  const marker = `${EVENT_MARKER_PREFIX}${eventId}`;
  const cards = (await trelloRequest(`/boards/${opsBoardId}/cards?fields=id,desc&filter=open`)) as Array<{
    id: string;
    desc: string;
  }>;
  const match = cards.find((c) => c.desc.includes(marker));
  return match ? { id: match.id } : null;
}

interface CreateTrackedCardParams {
  eventId: string;
  name: string;
  desc: string;
  due?: string;
}

/**
 * Shared card-creation path for BOTH the day-5 check-in (createCheckin) and the
 * revoke-access card (createRevokeAccessCard) — reconcile-then-create, mirroring copyBoard's
 * board-reconcile pattern in trello.ts. Closes the card half of the crash-window gap flagged
 * in Bundle 4 (B4-D-opsidempotency1): if the Redis persist after a successful card creation
 * fails for a non-lease-loss reason, a retry finds the SAME card via its marker instead of
 * creating a duplicate. (The alert half of that gap is deliberately NOT given a matching
 * mechanism — see route.ts's lifecycle handler for why.)
 */
async function createTrackedCard({ eventId, name, desc, due }: CreateTrackedCardParams): Promise<{ cardId: string }> {
  const opsBoardId = requiredEnv("TRELLO_OPS_BOARD_ID");

  const existing = await findExistingCard(opsBoardId, eventId);
  if (existing) {
    return { cardId: existing.id };
  }

  const lists = (await trelloRequest(`/boards/${opsBoardId}/lists?fields=name`)) as Array<{
    id: string;
    name: string;
  }>;
  const list = lists.find((l) => l.name === OPS_LIST_NAME);
  if (!list) {
    throw new Error(`createTrackedCard: no "${OPS_LIST_NAME}" list found on the ops board`);
  }

  const marker = `${EVENT_MARKER_PREFIX}${eventId}`;
  const params = new URLSearchParams({
    idList: list.id,
    name,
    desc: `${desc}\n\n${marker}`,
    ...(due ? { due } : {}),
  });
  const card = (await trelloRequest(`/cards?${params.toString()}`, { method: "POST" })) as { id: string };
  return { cardId: card.id };
}

export interface CreateCheckinParams {
  clientName: string;
  eventId: string;
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
export async function createCheckin({ clientName, eventId }: CreateCheckinParams): Promise<CreateCheckinResult> {
  const due = nextBusinessDaysFrom(new Date(), 5);
  return createTrackedCard({
    eventId,
    name: `Day-5 check-in — ${clientName}`,
    desc: checkinDescription(clientName),
    due: due.toISOString(),
  });
}

export interface CreateRevokeAccessCardParams {
  clientName: string;
  eventId: string;
}

export interface CreateRevokeAccessCardResult {
  cardId: string;
}

/**
 * Appendix E of docs/HANDOFF-client-onboarding.md, "On pause/cancel" checklist — seeded
 * VERBATIM per item (§1.8), reformatted from the doc's `·`-joined inline text into one
 * bullet per line; no framing sentence invented beyond what the card TITLE already states.
 */
function revokeAccessDescription(): string {
  return [
    "- Revoke all access (walk the registry)",
    "- Remove from vault",
    "- Transfer any repos/assets they own",
    "- Confirmation email sent",
    "- Registry archived",
  ].join("\n");
}

/**
 * Creates the "Revoke access — {clientName}" card on the ops board when a subscription is
 * cancelled or paused (§3.5, Appendix E) — no due date, unlike the day-5 check-in: this is an
 * immediate action item, not a scheduled one.
 */
export async function createRevokeAccessCard({
  clientName,
  eventId,
}: CreateRevokeAccessCardParams): Promise<CreateRevokeAccessCardResult> {
  return createTrackedCard({
    eventId,
    name: `Revoke access — ${clientName}`,
    desc: revokeAccessDescription(),
  });
}
