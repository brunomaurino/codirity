import type { PlanId } from "./plans";
import { tiers } from "@/config/offer";

const TRELLO_BASE = "https://api.trello.com/1";
const EVENT_MARKER_PREFIX = "codirity-event:";
const TRELLO_ID_PATTERN = /^[0-9a-f]{24}$/i;

function trelloAuthParams(): string {
  const key = process.env.TRELLO_KEY;
  const token = process.env.TRELLO_TOKEN;
  if (!key || !token) {
    throw new Error("TRELLO_KEY/TRELLO_TOKEN not configured");
  }
  return `key=${encodeURIComponent(key)}&token=${encodeURIComponent(token)}`;
}

/**
 * Low-level Trello REST call, shared by copyBoard() and scripts/seed-trello-template.ts.
 * Never includes the request URL (carries key/token) in a thrown error — only the path
 * (with its own query stripped) and the HTTP status, per the no-secrets-in-logs rule.
 */
export async function trelloRequest(path: string, init?: RequestInit): Promise<unknown> {
  const sep = path.includes("?") ? "&" : "?";
  const url = `${TRELLO_BASE}${path}${sep}${trelloAuthParams()}`;
  const res = await fetch(url, init);
  if (!res.ok) {
    throw new Error(`Trello API error ${res.status} on ${(init?.method ?? "GET")} ${path.split("?")[0]}`);
  }
  if (res.status === 204) {
    return null;
  }
  return res.json();
}

export interface CopyBoardParams {
  clientName: string;
  eventId: string;
  email: string;
  plan: PlanId;
}

export interface CopyBoardResult {
  boardId: string;
  boardUrl: string;
}

function lowerFirst(s: string): string {
  return s.length === 0 ? s : s.charAt(0).toLowerCase() + s.slice(1);
}

/**
 * Derived from src/config/offer.ts — the HANDOFF's designated canonical source for tier
 * copy — rather than a hardcoded duplicate, so a future change to offer.ts's task-limit
 * wording can't silently desync from new client boards. Founding has no separate tier in
 * offer.ts (it's a price-only variant layered on the Pro task limit, per foundingRate's
 * shape), so it explicitly maps to the "pro" tier's copy. The exhaustive switch + `never`
 * check means a future PlanId addition fails to COMPILE here instead of silently
 * defaulting to the wrong copy.
 */
function activeTasksNoteFor(plan: PlanId): string {
  switch (plan) {
    case "standard": {
      const tier = tiers.find((t) => t.id === "standard");
      if (!tier) throw new Error("activeTasksNoteFor: 'standard' tier missing from offer.ts");
      return lowerFirst(tier.tasks);
    }
    case "pro":
    case "founding": {
      const tier = tiers.find((t) => t.id === "pro");
      if (!tier) throw new Error("activeTasksNoteFor: 'pro' tier missing from offer.ts");
      return lowerFirst(tier.tasks);
    }
    default: {
      const exhaustiveCheck: never = plan;
      throw new Error(`activeTasksNoteFor: unhandled plan "${String(exhaustiveCheck)}"`);
    }
  }
}

interface TrelloBoardSummary {
  id: string;
  name: string;
  desc: string;
  url: string;
  idOrganization: string | null;
}

function requiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} not configured`);
  }
  return value;
}

/** Like requiredEnv, but also asserts the value is shaped like a Trello object id (24
 * hex chars) — Trello's `idOrganization`/create-board params accept either a workspace's
 * id OR its short name, but this module's OWN reconcile comparison (`idOrganization ===
 * workspaceId`) only ever matches against the id the API returns, so a name here would
 * make the reconcile silently match nothing, forever, with no error — this check turns
 * that into a loud failure at read time instead. */
function requiredTrelloId(name: string): string {
  const value = requiredEnv(name);
  if (!TRELLO_ID_PATTERN.test(value)) {
    throw new Error(`${name} must be a Trello object id (24 hex characters) — got a value that doesn't look like one (e.g. a workspace/board NAME instead of its id)`);
  }
  return value;
}

/**
 * §1.1(d) reconcile — search the workspace for a board this eventId already produced,
 * before ever copying. Trello has no server-side description search, so this enumerates
 * every OPEN board the token can see and filters client-side (mirrors the HANDOFF's own
 * reasoning for the same limitation). Scoped to `filter=open` deliberately: a board the
 * operator has since archived (e.g. on client cancellation, per Appendix E) must NOT be
 * silently reused/reactivated by a late/replayed webhook delivery.
 */
async function findExistingBoard(eventId: string): Promise<{ id: string; url: string } | null> {
  const workspaceId = requiredTrelloId("TRELLO_WORKSPACE_ID");
  const boards = (await trelloRequest(
    "/members/me/boards?fields=name,desc,url,idOrganization&filter=open"
  )) as TrelloBoardSummary[];
  const marker = `${EVENT_MARKER_PREFIX}${eventId}`;
  const match = boards.find((b) => b.idOrganization === workspaceId && b.desc.includes(marker));
  return match ? { id: match.id, url: match.url } : null;
}

/**
 * The marker (desc) and workspace placement (idOrganization) are passed in the SAME
 * request as the copy itself — no separate rename/describe step. A crash between the
 * copy and a later "stamp the marker" call would reopen the exact duplicate-board window
 * `findExistingBoard` exists to close; putting them in one atomic call closes it for good.
 */
async function copyTemplateBoard(clientName: string, eventId: string): Promise<{ id: string; url: string }> {
  const templateId = requiredTrelloId("TRELLO_TEMPLATE_BOARD_ID");
  const workspaceId = requiredTrelloId("TRELLO_WORKSPACE_ID");
  const params = new URLSearchParams({
    idBoardSource: templateId,
    keepFromSource: "cards",
    name: `Codirity × ${clientName}`,
    desc: `${EVENT_MARKER_PREFIX}${eventId}`,
    idOrganization: workspaceId,
  });
  const board = (await trelloRequest(`/boards/?${params.toString()}`, { method: "POST" })) as {
    id: string;
    url: string;
  };
  return { id: board.id, url: board.url };
}

// Matches any {word}-shaped template token, not just the two known ones — the
// post-substitution assertion below stays correct even if the template's placeholder
// vocabulary drifts from this list without both files being updated in lockstep.
const PLACEHOLDER_PATTERN = /\{[a-zA-Z]+\}/g;

/**
 * Idempotent by construction: replacing a placeholder that's already gone (a REUSED board
 * from a prior partial run) is a no-op diff, so this is safe to re-run unconditionally on
 * both the copy path and the reconcile-reuse path — it resumes correctly from a crash at
 * ANY point after the copy, not just after copyBoard() as a whole previously returned.
 */
async function substitutePlaceholders(boardId: string, plan: PlanId): Promise<void> {
  const accessFormUrl = requiredEnv("ACCESS_FORM_URL");
  const activeTasksNote = activeTasksNoteFor(plan);
  const boardCards = (await trelloRequest(`/boards/${boardId}/cards?fields=id,desc`)) as Array<{
    id: string;
    desc: string;
  }>;
  for (const card of boardCards) {
    if (!card.desc.match(PLACEHOLDER_PATTERN)) {
      continue;
    }
    const newDesc = card.desc
      .replaceAll("{accessFormUrl}", accessFormUrl)
      .replaceAll("{activeTasksNote}", activeTasksNote);
    // Post-condition: this function must remove every placeholder it claims to handle.
    // Any residue (an unrecognized/renamed token) means the template and this function's
    // vocabulary have drifted — fail loudly instead of silently shipping literal braces
    // to a paying client while still reporting success.
    const residual = newDesc.match(PLACEHOLDER_PATTERN);
    if (residual) {
      throw new Error(`substitutePlaceholders: unresolved placeholder(s) ${residual.join(", ")} on card ${card.id}`);
    }
    await trelloRequest(`/cards/${card.id}?${new URLSearchParams({ desc: newDesc }).toString()}`, {
      method: "PUT",
    });
  }
}

/**
 * Trello's invite-by-email is PUT, not POST. Called unconditionally on every copyBoard()
 * invocation, including a reconcile-reuse — verified (see notes.md) that a repeat call
 * for an already-member email returns success with no error and the membership persists
 * correctly. NOT independently verified: whether Trello sends a second invite
 * NOTIFICATION EMAIL on a repeat call (Trello's members API doesn't expose an existing
 * member's email for a pre-check, so this module can't cheaply guard against it itself).
 * Bundle 4 has the better vantage point to avoid this — the persisted event record
 * already carries `inviteSent`, so its orchestration layer can skip calling this a second
 * time for an event it already fully processed, rather than solving it here.
 */
async function inviteMember(boardId: string, email: string): Promise<void> {
  const params = new URLSearchParams({ email, type: "normal" });
  await trelloRequest(`/boards/${boardId}/members?${params.toString()}`, { method: "PUT" });
}

export async function copyBoard({ clientName, eventId, email, plan }: CopyBoardParams): Promise<CopyBoardResult> {
  // Validate all required config up front, before any side effect (board creation) —
  // a missing ACCESS_FORM_URL must never leave a half-provisioned board behind.
  requiredTrelloId("TRELLO_WORKSPACE_ID");
  requiredTrelloId("TRELLO_TEMPLATE_BOARD_ID");
  requiredEnv("ACCESS_FORM_URL");

  const existing = await findExistingBoard(eventId);
  const board = existing ?? (await copyTemplateBoard(clientName, eventId));
  await substitutePlaceholders(board.id, plan);
  await inviteMember(board.id, email);
  return { boardId: board.id, boardUrl: board.url };
}
