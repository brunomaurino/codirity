# autonomous-task run notes — codirity-ob2-trello

Started: 2026-08-15T21:45:35Z

## Task description

Build Bundle 2 (Trello provisioning) of Codirity client onboarding. Fresh worktree at
/Users/brunomaurino/projects/codirity-ob2-trello on branch feat/codirity-ob2-trello (off origin/main;
Bundle 1 merged). Full spec: docs/HANDOFF-client-onboarding.md "Bundle 2" + Appendix B. Brief:
lib/onboarding/trello.ts — copyBoard({clientName, eventId, email, plan}): FIRST reconcile per §1.1d —
enumerate the boards visible to the token filtered to TRELLO_WORKSPACE_ID and REUSE any board whose
description carries the marker "codirity-event:{eventId}". Else copy TRELLO_TEMPLATE_BOARD_ID via ONE
call (name, desc=marker, idOrganization all in the SAME request — atomic with the copy). THEN
substitute {accessFormUrl}/{activeTasksNote} placeholders in the copied board's cards. THEN invite the
client email as a member (PUT, not POST). ALSO scripts/seed-trello-template.ts building the
"[TEMPLATE] Codirity Client Board" from Appendix B verbatim. Do NOT wire trello.ts into the webhook yet
(Bundle 4). Acceptance: seed script matches Appendix B exactly; copyBoard substitutes+invites+returns a
URL with no residual {placeholders}; calling copyBoard twice with the same eventId returns the SAME
board (crash-after-copy reconcile); no secrets in logs; lint+tsc+build green.

## Execution context

- Workflow + Agent probes: PASS (Agent probe returned PROBE-OK)
- Capability probes (d) args round-trip, (e) effortTiers, (f) customAgents, (g) worktreeNative: REUSED
  from Bundle 1's Step-0 probes earlier this SAME session (same build/environment, no reason to expect
  drift) rather than re-run: `argsRoundTrip: true`, `effortTiers: true`, `customAgents: false` (the
  battery script only resolves the SCOPED agentType name in this build, not the bare one — confirmed by
  Bundle 1's first battery attempt failing 6/6 with `customAgents: true`), `worktreeNative: true`.
- Bundle-loop context: `--bundle-id 2 --plan-slug client-onboarding` → commitment prefix `B2`,
  identifier `client-onboarding Bundle 2`
- Run slug: `codirity-ob2-trello`
- **Merge policy: full auto-merge authorized** — operator stepped away from the computer 2026-08-15 and
  explicitly authorized merging every remaining bundle (2-5) without pause, overriding the original O0
  hard-stop-on-1-and-4 policy (Bundle 1 already merged under the original policy). See the bundle-loop
  session notes (`docs/autonomous-runs/bundle-loop-client-onboarding-2026-08-14/notes.md`) for the
  verbatim operator instruction.

## Task interpretation

- **Concrete deliverable:** `src/lib/onboarding/trello.ts` exporting `copyBoard()` (reconcile-then-copy,
  atomic marker+workspace placement, placeholder substitution, member invite) and
  `scripts/seed-trello-template.ts` (builds the template board from Appendix B verbatim).
- **Acceptance test:** a reviewer confirms — (1) running the seed script creates a board matching
  Appendix B's lists/card order/copy exactly, prints a board id; (2) `copyBoard()` invoked once returns
  a board URL with no `{curlyPlaceholder}` residue in any card; (3) `copyBoard()` invoked TWICE with the
  same `eventId` (simulating a crash after copy, before the caller persisted `boardId`) returns the SAME
  board id both times — exactly one board for that eventId exists in the workspace; (4) no secrets in
  logs; (5) lint+tsc+build green.

No ambiguity requiring HS-3 — the brief + HANDOFF §1.1d/Bundle-2/Appendix-B spec fully pin the
deliverable.

## Plan

**Building:**
- `src/lib/onboarding/trello.ts` — `copyBoard({ clientName, eventId, email, plan })`:
  1. Reconcile: `GET /1/members/me/boards?fields=name,desc&key=...&token=...`, filter to boards whose
     description contains `codirity-event:{eventId}`, further scoped to `TRELLO_WORKSPACE_ID` (checked
     via each board's `idOrganization`, fetched in the same call via `fields` — Trello's `/members/me/
     boards` doesn't return `idOrganization` by default, so request it explicitly). If found, reuse
     (skip straight to placeholder substitution — idempotent no-op if already substituted, matching the
     "no residual placeholders" acceptance for a REUSE too) and skip the invite re-send only if the
     member is already present (check board members first).
  2. Else copy: `POST /1/boards/?idBoardSource=TRELLO_TEMPLATE_BOARD_ID&keepFromSource=cards` with
     `name`, `desc=codirity-event:{eventId}`, `idOrganization=TRELLO_WORKSPACE_ID` ALL in the request
     body of this one call (atomicity requirement).
  3. Substitute: for each list's cards, `PUT /1/cards/{id}` replacing `{accessFormUrl}` →
     `ACCESS_FORM_URL` and `{activeTasksNote}` → `"one active task at a time"` (standard) /
     `"two active tasks at a time"` (pro/founding) in the card `desc`.
  4. Invite: `PUT /1/boards/{id}/members?email=...&type=normal`.
  5. Return `{ boardId, boardUrl }`.
- `src/lib/onboarding/plans.ts` — reuse `PlanId` (already exported from Bundle 1); add the
  activeTasksNote mapping here or inline in trello.ts (deciding: inline in trello.ts, since it's a
  Trello-copy concern, not a Stripe-plan concern — plans.ts stays Stripe-only).
- `scripts/seed-trello-template.ts` — builds `[TEMPLATE] Codirity Client Board` per Appendix B verbatim
  (6 lists, 7 cards in "👋 Start Here" incl. card 7 explicitly placed in "📥 Backlog" per the doc's own
  note), leaves `{accessFormUrl}`/`{activeTasksNote}` as literal braces (template keeps placeholders).
  Creates via `POST /1/boards/` (new board, `idOrganization=TRELLO_WORKSPACE_ID`), then `POST /1/lists/`
  ×6, then `POST /1/cards/` per card. Prints the board id for `TRELLO_TEMPLATE_BOARD_ID`. Run via
  `npx tsx scripts/seed-trello-template.ts` — add `tsx` as a devDependency.
- `.env.example` — document `TRELLO_TEMPLATE_BOARD_ID` (produced by the seed script, not set yet) if not
  already present from Bundle 1 (it wasn't — Bundle 1 only added Stripe/Upstash vars).
- Do NOT wire `trello.ts` into the webhook route (Bundle 4's job).

**Tests / verification:** `npm run lint`, `npx tsc --noEmit`, `npm run build`; run the seed script
against the REAL test Trello workspace and inspect the created board against Appendix B; invoke
`copyBoard()` directly (via a throwaway script, matching Bundle 1's pattern) with a fresh `eventId`,
inspect the returned board for residual placeholders; invoke `copyBoard()` AGAIN with the SAME
`eventId` and confirm it returns the identical `boardId` (crash-after-copy reconcile test) rather than
creating a second board.

**Open questions resolved:**
- Reconcile scoping to `TRELLO_WORKSPACE_ID`: Trello's `/1/members/me/boards` doesn't filter by
  workspace server-side in a single query param that also returns `desc` cheaply, so the plan fetches
  `fields=name,desc,idOrganization` and filters client-side — matches the HANDOFF's own description
  ("Trello has no server-side description search; the token sees every board it created" — same
  reasoning extends to the workspace filter).
- `activeTasksNote` casing: brief specifies lowercase ("one active task at a time"), which reads
  correctly mid-sentence in Card 1's parenthetical; `offer.ts`'s capitalized "One active task..." is
  for standalone bullet display, a different context — not an inconsistency, a deliberate casing choice
  for where each string is used.
- Founding plan gets the SAME `activeTasksNote` as Pro ("two active tasks at a time") — matches
  `offer.ts`'s modeling (Founding is a rate on the Pro-tier task limit, not a separate limit) and the
  brief's explicit "Pro/Founding" grouping.

## Decisions made unilaterally

(none yet)

## Stop attempts

(none)

## Drift flags

(none)

## Round-skip requests

(none)

## Local acceptance testing (Phase 3)

All run against the real Trello test workspace (`TRELLO_WORKSPACE_ID=6a7f78e4fb6122c8f90af34c`):

1. **Seed script matches Appendix B exactly** — ran `npx tsx scripts/seed-trello-template.ts`, created
   board `6a80df391a07688a7c11e5ce`. Fetched the board back via the API and diffed against Appendix B:
   6 lists in the exact order, 7 cards with byte-for-byte matching copy, card 7 correctly placed in
   "📥 Backlog" (not "👋 Start Here"), placeholders left as literal `{accessFormUrl}`/
   `{activeTasksNote}` braces (template, not substituted). PASS. This is now `TRELLO_TEMPLATE_BOARD_ID`
   in `.env.local`/Vercel.
2. **`copyBoard()` — first call** — copied the template, substituted both placeholders (`{accessFormUrl}`
   → the real Tally URL, `{activeTasksNote}` → "one active task at a time" for a `standard` plan),
   invited the test email. Fetched all cards back: 0 residual `{placeholder}` strings across all 7
   cards. PASS.
3. **`copyBoard()` — SAME eventId, second call (crash-after-copy reconcile, load-bearing)** — invoked
   again with the identical `eventId` used in test 2. Returned the IDENTICAL `boardId` — confirmed via
   the API that exactly ONE board exists for that eventId in the workspace, not two. PASS.
4. **Invite verified** — fetched board memberships: the invited email appears as `memberType: "normal"`,
   `unconfirmed: true` (expected Trello behavior for an email invite to a non-existent account). PASS.
5. Test client board closed (archived) after verification to avoid leaving debris in the real
   workspace; the TEMPLATE board (item 1) was kept — it's the actual deliverable.
- `npm run lint`, `npx tsc --noEmit`, `npm run build`: all green.

## Review findings + resolutions

(filled in Phase 4/5)

## Areas examined and rejected

(filled in Phase 4/5)

## Items deferred from this PR

(filled in Phase 7)

## Open items NOT addressed in this PR

(filled in Phase 7)

## Durable handles

- marker: /Users/brunomaurino/.claude/autonomous-active/autonomous-task-codirity-ob2-trello
- worktree: /Users/brunomaurino/projects/codirity-ob2-trello
- worktree_entry: path
