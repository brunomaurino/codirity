/**
 * One-off script: builds the "[TEMPLATE] Codirity Client Board" from
 * docs/HANDOFF-client-onboarding.md Appendix B, verbatim. Run once against the real
 * Trello workspace via `npx tsx scripts/seed-trello-template.ts`; prints the created
 * board's id to use as TRELLO_TEMPLATE_BOARD_ID.
 *
 * The TEMPLATE keeps {curlyPlaceholder} braces literal — only a COPIED client board
 * (trello.ts's copyBoard) substitutes them.
 */
import { existsSync } from "node:fs";
import { trelloRequest } from "../src/lib/onboarding/trello";

if (existsSync(".env.local")) {
  process.loadEnvFile(".env.local");
}

const BOARD_NAME = "[TEMPLATE] Codirity Client Board";
const LISTS = ["👋 Start Here", "📥 Backlog", "⏭️ Up Next", "🔨 In Progress", "👀 In Review", "✅ Done"] as const;

interface TemplateCard {
  name: string;
  desc: string;
  list: (typeof LISTS)[number];
}

const CARDS: TemplateCard[] = [
  {
    list: "👋 Start Here",
    name: "👋 Start here — how this works",
    desc: `Welcome! This board is your direct line to Codirity. The short version:
1. Add requests to 📥 Backlog — as many as you want.
2. Drag your priorities to ⏭️ Up Next. We always pull from the top.
3. We move one task at a time to 🔨 In Progress ({activeTasksNote}).
4. Delivered work lands in 👀 In Review — comment with changes (unlimited revisions) or drag to ✅ Done.
All communication happens in card comments. No meetings, no status calls — unless you book one.`,
  },
  {
    list: "👋 Start Here",
    name: "How to write a great request",
    desc: `Any format works: plain text, a linked Google Doc, a Loom video, screenshots, a Figma link. If it can be linked here, it's fair game. A great request answers three things: • What do you want? (the outcome, not the implementation) • Why? (the business context helps us make better calls) • What does "done" look like? Don't overthink it — we'll ask in the comments if anything's unclear.`,
  },
  {
    list: "👋 Start Here",
    name: "What counts as one task",
    desc: `A task is something we can ship in roughly 1–2 days: an automation, an AI agent integration, an API connection, a scraper, a dashboard view, a landing page, a web feature, a bug fix. Bigger projects? Totally fine — we break them down on our end and deliver progress every 24–48h until done. Out of scope: native mobile apps from scratch, 24/7 on-call, managing your infra, fixed-deadline contracts, massive data migrations.`,
  },
  {
    list: "👋 Start Here",
    name: "Delivery & communication",
    desc: `Average delivery: 2–3 business days per task (complex ones can take longer — we'll tell you upfront in the card). We work async from GMT-3, and you'll typically see progress overnight if you're in the US. Everything ships with a short Loom or written summary of what we did and how to use it.`,
  },
  {
    list: "👋 Start Here",
    name: "Pausing & billing",
    desc: `Billing cycles are 31 days. Pause anytime: unused days are banked and available whenever you return. Cancel anytime, no questions. First week not working for you? 75% back, no questions asked.`,
  },
  {
    list: "👋 Start Here",
    name: "🔐 Grant us access (do this first)",
    desc: `Before we can ship, we need access to your tools: {accessFormUrl}
Security rules we live by: • Never paste passwords or API keys in Trello, email, or Loom. • Share credentials with us via a secure one-time link (Bitwarden Send — no account needed) or your own secrets manager. • We request least-privilege access and keep a registry of everything you grant us — when you pause or cancel, we revoke it all and confirm in writing.`,
  },
  {
    list: "📥 Backlog",
    name: "✍️ Example request (steal this format)",
    desc: `Title: Auto-sync new Stripe customers to our CRM
What: When someone subscribes in Stripe, create/update the contact in HubSpot with plan + MRR, and tag them "customer".
Why: Sales is copy-pasting this manually every morning (~30 min/day).
Done looks like: New test subscription appears in HubSpot within 1 minute, correctly tagged. Loom walkthrough included.`,
  },
];

async function main() {
  const workspaceId = process.env.TRELLO_WORKSPACE_ID;
  if (!workspaceId) {
    throw new Error("TRELLO_WORKSPACE_ID not configured");
  }

  // Refuse to run twice against the same workspace — this is a manually-triggered
  // one-off, and creating a second identically-named template silently would leave the
  // operator unsure which board id is the real TRELLO_TEMPLATE_BOARD_ID.
  const existingBoards = (await trelloRequest(
    `/members/me/boards?fields=name,idOrganization&filter=open`
  )) as Array<{ id: string; name: string; idOrganization: string | null }>;
  const existingTemplate = existingBoards.find((b) => b.idOrganization === workspaceId && b.name === BOARD_NAME);
  if (existingTemplate) {
    throw new Error(
      `A board named "${BOARD_NAME}" already exists in this workspace (id ${existingTemplate.id}). ` +
        `Archive or rename it first if you intend to reseed a fresh template.`
    );
  }

  const boardParams = new URLSearchParams({
    name: BOARD_NAME,
    idOrganization: workspaceId,
    defaultLists: "false",
  });
  const board = (await trelloRequest(`/boards/?${boardParams.toString()}`, { method: "POST" })) as { id: string };
  console.log(`Created board ${board.id}`);

  const listIds: Record<string, string> = {};
  for (const [i, listName] of LISTS.entries()) {
    const listParams = new URLSearchParams({
      name: listName,
      idBoard: board.id,
      pos: String((i + 1) * 1000),
    });
    const list = (await trelloRequest(`/lists?${listParams.toString()}`, { method: "POST" })) as { id: string };
    listIds[listName] = list.id;
  }
  console.log(`Created ${LISTS.length} lists`);

  for (const card of CARDS) {
    const cardParams = new URLSearchParams({
      name: card.name,
      desc: card.desc,
      idList: listIds[card.list],
    });
    await trelloRequest(`/cards?${cardParams.toString()}`, { method: "POST" });
  }
  console.log(`Created ${CARDS.length} cards`);

  console.log(`\nTRELLO_TEMPLATE_BOARD_ID=${board.id}`);
}

main().catch((err) => {
  console.error("seed-trello-template failed:", err instanceof Error ? err.message : err);
  process.exit(1);
});
