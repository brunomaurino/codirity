import type { PlanId } from "./plans";

const TRELLO_BASE = "https://api.trello.com/1";
const EVENT_MARKER_PREFIX = "codirity-event:";

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

function activeTasksNoteFor(plan: PlanId): string {
  return plan === "standard" ? "one active task at a time" : "two active tasks at a time";
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

/**
 * §1.1(d) reconcile — search the workspace for a board this eventId already produced,
 * before ever copying. Trello has no server-side description search, so this enumerates
 * every board the token can see and filters client-side (mirrors the HANDOFF's own
 * reasoning for the same limitation).
 */
async function findExistingBoard(eventId: string): Promise<{ id: string; url: string } | null> {
  const workspaceId = requiredEnv("TRELLO_WORKSPACE_ID");
  const boards = (await trelloRequest(
    "/members/me/boards?fields=name,desc,url,idOrganization"
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
  const templateId = requiredEnv("TRELLO_TEMPLATE_BOARD_ID");
  const workspaceId = requiredEnv("TRELLO_WORKSPACE_ID");
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
    if (!card.desc.includes("{accessFormUrl}") && !card.desc.includes("{activeTasksNote}")) {
      continue;
    }
    const newDesc = card.desc
      .replaceAll("{accessFormUrl}", accessFormUrl)
      .replaceAll("{activeTasksNote}", activeTasksNote);
    await trelloRequest(`/cards/${card.id}?${new URLSearchParams({ desc: newDesc }).toString()}`, {
      method: "PUT",
    });
  }
}

/** Trello's invite-by-email is PUT, not POST. Idempotent — re-inviting an existing member no-ops. */
async function inviteMember(boardId: string, email: string): Promise<void> {
  const params = new URLSearchParams({ email, type: "normal" });
  await trelloRequest(`/boards/${boardId}/members?${params.toString()}`, { method: "PUT" });
}

export async function copyBoard({ clientName, eventId, email, plan }: CopyBoardParams): Promise<CopyBoardResult> {
  const existing = await findExistingBoard(eventId);
  const board = existing ?? (await copyTemplateBoard(clientName, eventId));
  await substitutePlaceholders(board.id, plan);
  await inviteMember(board.id, email);
  return { boardId: board.id, boardUrl: board.url };
}
