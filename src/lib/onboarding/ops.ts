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
 * should not resurrect or duplicate it. The marker is APPENDED to the card's own description
 * (never replacing it — a checklist/pulse-check card's desc IS its content) as a trailing
 * line; reconcile only needs the marker to be a substring, so whatever list the founder has
 * since moved the card to, or however they've edited the visible text, the marker still
 * matches. NOT airtight: if the persist after a successful create fails for a non-lease-loss
 * reason AND the founder archives the card before Stripe's retry lands, the `filter=open`
 * scan misses it and the retry creates a genuine duplicate — a narrow, accepted race (see
 * createTrackedCard's own comment), not a claim that this eliminates every duplicate.
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
 * board-reconcile pattern in trello.ts. Closes the CARD half of the crash-window gap flagged
 * in Bundle 4 (B4-D-opsidempotency1): if the Redis persist after a successful card creation
 * fails for a non-lease-loss reason, a retry finds the SAME card via its marker instead of
 * creating a duplicate.
 *
 * The ALERT half of that same gap is deliberately NOT given a matching dedup mechanism —
 * this is a considered scope decision, not an oversight: nodemailer/SMTP has no query API
 * to check "was this already sent" without new persistent infrastructure (a sent-log, or a
 * provider with idempotency-key support — neither exists here), and the residual risk is a
 * rare, narrow, founder-only, non-customer-facing duplicate email in the crash window where
 * either (a) the Redis write fails for a non-lease-loss reason immediately after a
 * successful send, or (b) alertFounder's own connectionTimeout/socketTimeout (10s each)
 * elapses on the RESPONSE after the SMTP server already accepted the message — a risk
 * already narrowed by the existing lease-fence, which fully covers lease-loss, concurrent
 * delivery, and sequential replay (the vast majority of the retry surface).
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
  // Explicitly labeled and separated from the visible content by a rule — the day-5 card's
  // desc is the pulse-check MESSAGE the founder is meant to copy verbatim to the client
  // (Appendix D); an unlabeled trailing marker line would silently leak an internal
  // "codirity-event:evt_…" id into that outgoing correspondence if the founder selects the
  // whole description. The revoke-access card is founder-only, but the SAME labeled format
  // is used there too rather than a special case, so the marker's shape stays uniform for
  // findExistingCard's substring match.
  const params = new URLSearchParams({
    idList: list.id,
    name,
    desc: `${desc}\n\n---\n[Internal tracking — do not copy this line to the client]\n${marker}`,
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
 * another list or silently creating one. `eventId` (Bundle 5) is required — it's the
 * reconcile key: a retry for an event that already created this card returns the SAME
 * card via createTrackedCard's marker-based reconcile instead of creating a duplicate.
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
 * Appendix E of docs/HANDOFF-client-onboarding.md, "On pause/cancel" checklist — every word
 * of every item matches the source exactly; the only change is reformatting the doc's
 * `·`-joined inline text into one bullet per line, which also capitalizes each item's
 * leading letter as a natural consequence of the list format (the source is lowercase
 * inline). No framing sentence invented beyond what the card TITLE already states. Appendix
 * E is explicitly founder-only, so §1.8's client-facing-copy verbatim rule doesn't bind this
 * the way it binds Appendix D below.
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
 * immediate action item, not a scheduled one. Like createCheckin, a retry for an eventId that
 * already produced this card returns the EXISTING card (via createTrackedCard's marker-based
 * reconcile) rather than creating a duplicate — the caller cannot distinguish "created new"
 * from "found existing" from the return shape alone, by design (route.ts only needs the id).
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
