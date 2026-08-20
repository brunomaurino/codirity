/**
 * Checks that the LIVE Trello boards state the same guarantee the site does.
 *
 * Trello is the only customer-facing surface outside this repo, so it is the
 * only one no gate could see. It drifted for months: the site has said 7 days /
 * 50% since redesign-v4 W2 (composed from `guarantee.days` / `refundPct`) and
 * `seed-trello-template.ts` said 50% too, but the live template board had been
 * seeded from an earlier revision and still promised **75% back** — a number
 * the business does not honour. Corrected on the board 2026-08-19.
 *
 * This scans every OPEN board in the workspace, not just the template: a client
 * board copied before the fix inherited the wrong figure, and that copy is the
 * one an actual customer reads.
 *
 *   npx tsx scripts/trello-offer-parity.ts
 *
 * Exit 1 if any board states a refund percentage other than the configured one.
 * Not wired into `npm test`: it needs live Trello credentials, which CI has no
 * business holding. Run it after touching the guarantee, or the seed script.
 */
import { existsSync } from "node:fs";
import { trelloRequest } from "../src/lib/onboarding/trello";
import { guarantee } from "../src/config/offer";

if (existsSync(".env.local")) {
  process.loadEnvFile(".env.local");
}

interface Card {
  id: string;
  name: string;
  desc: string;
  shortUrl: string;
}
interface Board {
  id: string;
  name: string;
  closed: boolean;
}

// Any "<n>% back" claim. The point is to catch a percentage that disagrees with
// config, so this deliberately matches the SHAPE rather than a known-bad value.
const PCT_BACK = /(\d{1,3})\s*%\s*back/gi;

async function main() {
  const workspaceId = process.env.TRELLO_WORKSPACE_ID;
  if (!workspaceId) throw new Error("TRELLO_WORKSPACE_ID not set");

  const boards = (await trelloRequest(`/organizations/${workspaceId}/boards`)) as Board[];
  const open = boards.filter((b) => !b.closed);
  console.log(`configured guarantee: ${guarantee.days} days · ${guarantee.refundPct}% back`);
  console.log(`scanning ${open.length} open board(s) of ${boards.length}\n`);

  const wrong: string[] = [];
  let checked = 0;

  for (const b of open) {
    const cards = (await trelloRequest(`/boards/${b.id}/cards`)) as Card[];
    for (const c of cards) {
      checked++;
      const text = `${c.name}\n${c.desc || ""}`;
      for (const m of text.matchAll(PCT_BACK)) {
        const pct = Number(m[1]);
        if (pct !== guarantee.refundPct) {
          wrong.push(`${b.name} › ${c.name} — says ${pct}% back  ${c.shortUrl}`);
        }
      }
    }
  }

  console.log(`${checked} card(s) checked.`);
  if (wrong.length) {
    console.log(`\nFAIL — ${wrong.length} card(s) disagree with offer.ts:`);
    wrong.forEach((w) => console.log(`  - ${w}`));
    process.exit(1);
  }
  console.log(`PASS — every board states ${guarantee.refundPct}% back, matching offer.ts.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
