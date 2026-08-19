# autonomous-task run notes — redesign-v4 Bundle W4 (case studies + clients)

**Started:** 2026-08-19T16:20:00Z

## Execution context

- Probes reused (session `0556b7db` — the session that ran W2 and W3): Workflow ✅ Agent ✅ args ✅
  effortTiers ✅ **customAgents FALSE** (V6 incident) · worktreeNative ✅.
- Prefix `B405`, identifier **`redesign-v4 Bundle 405`**. Branch `feat/redesign-v4-w4` off
  `origin/main` @ `7ce0689` (carries W0–W3). `cp -Rl` node_modules.
- Worktree `/Users/brunomaurino/projects/codirity/.claude/worktrees/rv4-w4`, `worktree_entry: path`
  (same deviation as W3 — `EnterWorktree` only accepts worktrees under `.claude/worktrees/`).

## Task description (echoed)

Rework `CaseStudies.tsx` and `RecentWork.tsx` to match `docs/redesign-v4/approved-mockup.html`: the
eDairyMarket block (label, the 27/273 stat with its scroll-linked wipe via `animation-timeline:
view()` plus the `@supports` fallback, headline INCLUDING "Found and fixed.", the two-column
background + shipped-list, stack pills); the Meshio block (three-line headline, the
New → Niche set → Voice set → Activated state machine as the visual — deliberately NO number, the
state machine IS the story); the three-client strip with client/pre-launch tags. ALL copy verbatim
from `offer.ts` `caseStudies[]`/`clients[]`. Retire the v3 SVG sketches (delete
`CaseStudySketch.tsx`). Gates: standard + SSR fact-provenance + banned-word grep + perf delta.

## Task interpretation (Phase 1.5 prompt-pinning)

**Deliverable.** One PR rewriting `src/components/sections/CaseStudies.tsx` and
`RecentWork.tsx` in the v4 treatment, deleting `CaseStudySketch.tsx` and its export, adding the
`.work/.stat/.shipped-list/.stack/.sm/.clients` block to `globals.css`, and adding the structured
fields the blocks compose from to `src/config/offer.ts`.

**Acceptance test.**
- Every string rendered inside the two case-study sections and the clients strip is **verbatim from
  `offer.ts`** — checked in BOTH directions, so a substituted noun or an added clause fails, not
  just a missing one. "Found and fixed." renders. Zero percentages that `offer.ts` does not contain.
- The eDairyMarket stat renders `27` / `of 273 product pages`, and the stat plus the headline lines
  **reconstruct `caseStudies[0].headline` exactly** — asserted mechanically, so the display split
  can never drift from the fact it was split out of.
- Meshio renders NO figure at the stat tier, and its state machine renders four states ending in
  the goal, with a text `aria-label` describing the sequence.
- The stat wipe is scroll-linked via `animation-timeline: view()` with the `@supports not` fallback
  compiling; reduced-motion pins both to their finished state (no clipped, invisible number).
- `CaseStudySketch.tsx` is gone with no dangling imports; the page still builds.
- Standard gates green + perf delta on the prerendered document.

## Plan

**Files.** `src/config/offer.ts` (structured stat + hand-set headline lines + the state machine),
`src/components/sections/CaseStudies.tsx` (rewrite), `RecentWork.tsx` (rewrite),
`CaseStudySketch.tsx` (delete) + `index.ts`, `src/app/globals.css` (the v4 case-study block),
`scripts/w4-*.py` (gates + self-test).

**Open questions resolved.**

1. **The mockup's copy and `offer.ts` disagree — which wins?** `offer.ts`, on every factual matter;
   the mockup wins on layout. The mockup is a design artifact whose copy was abbreviated to fit:
   it drops "— 10% of the catalog" from the eDairyMarket headline, drops "new NestJS APIs, a
   Next.js SSR storefront, a React admin panel" from the background, shortens Meshio's OAuth bullet,
   and trims both client stories. The brief says "ALL copy verbatim from offer.ts", the HANDOFF says
   `offer.ts` wins on facts, and every one of those trims removes a TRUE claim. So: the mockup's
   structure, `offer.ts`'s strings.
2. **The stat is carved out of the headline — how, without string-slicing?** `caseStudies[0].headline`
   opens with "27 of 273 product pages", which the mockup renders as the stat block; rendering the
   full headline in the h2 as well would duplicate it. String-slicing at render time is exactly the
   fragility W2's review flagged. Resolution: `offer.ts` gains a `stat` object and
   `headlineLines[]`, with a **gated invariant** — `stat.value + " " + stat.of + " " +
   headlineLines.join(" ")` must equal `headline` character for character. The prose fact stays the
   canonical string; the structured fields are a view of it that cannot silently drift.
3. **Meshio's state machine — hardcode the diagram?** No. `whatShipped[0]` already asserts
   "A New → Niche Set → Voice Set → Activated state machine". A `stateMachine` field carries the
   states, and a gate asserts every state name appears in that bullet, so the diagram and the claim
   cannot diverge.
4. **The clients strip tags.** `ClientEntry` has `preLaunch?: boolean`. The mockup shows every entry
   tagged `client`, with Vivi carrying an additional `pre-launch`. That matches the 2026-08-18 D6
   amendment recorded in `offer.ts` (all three present as clients), so the tag set composes:
   always `client`, plus `pre-launch` when `preLaunch` is true.
5. **Is `headlineAccent` removed?** Yes — the `CaseStudy` doc comment already schedules its removal
   for this bundle, and the v4 treatment has no accent-word device.

## Decisions made unilaterally

(Phase 3)

## Stop attempts

(none)

## Drift flags

(none)

## Round-skip requests

(none)

## Review findings + resolutions

Battery `wf_c3279142-f9a`: 16/16 agents, 0 errors. 43 raw findings → 15 clusters →
**15 confirmed, 0 refuted, 0 deferrals**. All 15 applied. This is the most valuable battery run of
the plan: it caught a silently-dead flagship AND proved my own gate vacuous in four ways, each
demonstrated LIVE against the real page.

### BLOCKER — the scroll-linked wipe never ran

`@keyframes stat-wipe` was never ported. An undefined animation-name resolves to `none`, so on every
browser that *does* support `animation-timeline: view()` the wipe simply did not exist — and because
that `@supports` branch still matched, the `@supports not` fallback was suppressed too. Nothing
errored, and **my own browser verification could not see it**: a wipe that never ran looks exactly
like a wipe that finished. The named deliverable of this bundle was dead and green.

Fixed by porting the keyframes. Then closed as a CLASS: `scripts/w4-css-gate.py` now asserts that
**every** animation-name referenced anywhere in the compiled chunk has matching `@keyframes`.

### BLOCKER ×2 — my fact gate was vacuous

The gate whose self-test reported `GATE ARMED` was defeated four ways, each reproduced live:

| Hole | What passed |
|---|---|
| The "nothing extra" and "no invented numbers" sweeps iterated `for s in studies` only | An invented **$2.4M seed round** and an **87% pre-order** figure appended to a client card — clean PASS |
| Provenance was a SUBSTRING test against one flat concatenation of every field | A run spanning two field boundaries; a fact copied from one study into the other; a truncation dropping "**specced**" so specced work reads as shipped |
| A 12-character floor exempted short runs | An invented `Shopify` stack pill and an injected `Paid` state |
| The stat check asked whether "27" appeared in the section | "of 273 product pages" satisfied it, so mutating the displayed figure to "404" was not caught |

Rewritten: provenance is **exact membership of each rendered text run in the SET of `offer.ts`
field values**, scoped **per owning entity**, over **every section this bundle owns**, with **no
length floor**. A substring can no longer stand in for a field, and one study's facts can no longer
vouch for text rendered under another. The self-test grew all four as mutations — plus, after the
h3 gained `aria-label`, a fifth: the accessible name is now checked as a rendered fact in its own
right, because `squash()` strips attributes and would never have seen it drift.

**17/17 mutations caught**, including v3's two real fabrications.

### MAJOR

- **`maxWidth: 24ch` inherited from the mockup** — calibrated for the mockup's trimmed copy, not
  `offer.ts`'s fuller strings, so every hand-set line re-wrapped inside its own mask (4–6 ragged
  lines instead of three), defeating the line-rise device. Fixed by **re-balancing the lines to a
  40-char maximum** and setting `44ch`, both measured: the wrap band was 900–959px, where
  `.wrap-v4` doubles its gutter. Verified single-line across **81 widths, 860→1600px**.
- **`aria-label` on a bare `<div>`** — implicit role `generic`, which ARIA prohibits from carrying
  an accessible name, so the sequence reached AT as four unordered pills. Now `role="img"`.
- **Heading identity lost** — the client name had become a `<p>`, and the only `<h2>` was the
  headline *minus its subject* ("were returning 404 …"). Now `<h2>` = the client name, `<h3>` = the
  headline carrying the CANONICAL sentence (stat included) as its accessible name, with the stat
  block `aria-hidden` so it is not announced twice.

### MINOR

- Two **hard ground cuts** would have shipped (Benefits→clients, Meshio→About). Bruno's rule is
  explicit and the `.band-*` utilities have been unused since W0, so both gradients enter here
  rather than being logged as debt.
- Public anchors `#work` and `#case-studies` were silently dropped — restored.
- `.sm-arrow` stacked `opacity: .6` on a colour — the exact anti-pattern W3 flagged for W4.
  Now `--chalk-faint`, measured **5.28:1** (was ~3.9).
- The stat capped at 8.5rem, **above** the hero's 8.4rem, contradicting the mockup's own comment
  that it "caps AT the h1 size". Capped at 8.4rem — a 0.1rem deviation that makes the stated intent
  true, and the CSS gate now asserts it.
- Dead config deleted: `sections.caseStudies` entirely, `recentWork.label`/`.description`.
- Meshio's `background` opened by restating the headline, which the diagram also shows — three
  times in one screen. Removed. **Removing a duplicate is not trimming a true claim** (which is why
  the mockup's trims were rejected); nothing it carried is now unstated.
- Two self-test anchor bugs: the "meshio" mutation anchored on eDairyMarket's list, and two others
  hit the `aria-label` instead of the visible span. The NOOP guard caught the third instance
  itself.

## Post-fix verification

- `tsc` ✅ · `eslint` ✅ · clean build ✅
- **Fact gate ✅ both directions over all three sections** · **CSS gate ✅** (no orphaned animations;
  both degradations pin the stat; the stat no longer outsizes the h1) · **self-test 17/17 caught,
  unmutated passes — `GATE ARMED`**, mutating copies in a temp dir only.
- **Headline lines verified single-line across 81 widths, 860→1600px**, including the 899/900/901
  and 959/960/961 boundaries where the gutter changes. Zero horizontal overflow.
- **The wipe verified in the COMPILED chunk**, not visually: `@keyframes stat-wipe` present, the
  `@supports (animation-timeline: view())` branch carries `animation: … stat-wipe` with
  `animation-range: entry 20% cover 45%`, and the `@supports not` fallback compiles.
- **Contrast measured on the live page, compositing the full opacity chain**: arrow 5.28, states
  8.88, stat 7.62, bullets/pills/stories/tags 8.88, paragraphs 16.98 — **nothing under AA**.
- Heading outline: `H2 eDairyMarket — Client` → `H3` whose accessible name is the whole canonical
  sentence; `H2 Already on the board` → three `H3` client names. `role="img"` on the state machine.
- Both `.band` gradients render at 270px; `#work` and `#case-studies` both resolve.
- **Perf: document 23,606 B gz — 4,667 B UNDER W3** (28,273), since the v3 SVG sketches are gone.

## Areas examined and rejected

The battery recorded **67 areas examined**. Worth carrying:

- **Content honesty, machine-diffed both directions** — zero rendered runs lacking an exact
  `offer.ts` field; zero `offer.ts` strings unrendered. Buyer FAVORITES intact, no substituted noun,
  no added clause, no dropped true claim, no LLM vendor named, "specced" never upgraded. Rendered
  numeric tokens `{10%, 17, 2, 20, 2003, 27, 273, 404}` are all in `offer.ts`.
- **The reconstruction invariant is not vacuous** — because the join preserves every character, a
  re-break's only freedom is where single spaces fall; punctuation cannot migrate across a break and
  an empty line injects a double space that fails equality.
- **Deletion safety** — `CaseStudySketch`, `sketch`, `headlineAccent` have no surviving consumers;
  `AccentWord` and `SectionHeader` keep other consumers, so nothing became dead-but-exported.
- **`display: contents` on the state+arrow wrapper** — promotes both to direct flex items, so gap,
  baseline and wrapping behave exactly as the mockup's flat markup; the historical a11y-tree bug was
  fixed in Safari 15 / Chrome 89.
- **`npx tsx` fact extraction** — `tsx` is a local devDependency so npx never reaches the network,
  and `check=True` turns any error into an exception rather than a silent empty fact set.
- **Rendering both `context` and `background`** — confirmed the right call for eDairyMarket (the
  mockup's merge dropped the API/storefront detail); rejected for Meshio, where it was a
  restatement, and that one was fixed.
- **Section ORDER** — the mockup runs the studies before the clients strip; this page keeps v3's
  order. Out of W4's scope and already recorded as operator-owned by W3.

## Open items NOT addressed in this PR

- **Page section order is still v3's.** The mockup runs hero → terms → queue → studies → clients;
  this page keeps the v3 sequence. Operator-owned since W3; W5/W6 will surface it.
- **The two new `.band` gradients sit at boundaries W5 reworks.** W5's brief assigns the dark↔paper
  transitions around its own run, so it may reposition or absorb them.
- **Operator-owned, still open:** the live Trello `[TEMPLATE] Codirity Client Board` still promises
  **"75% back"** where the codebase says 7 days / 50%. Carried since v3.
- **No CI runs any of these gates.** `scripts/w2-*`, `w3-*` and `w4-*` are the only mechanical
  coverage these sections have and every one is invoked by hand. Wiring `npm test` + a CI job is a
  repo-level decision, and it is now the single highest-leverage change available — this bundle
  shipped a dead flagship that only an adversarial review caught.

## Durable handles

- marker: `$HOME/.claude/autonomous-active/autonomous-task-redesign-v4-w4` (+ `.json` sidecar)
- worktree: `/Users/brunomaurino/projects/codirity/.claude/worktrees/rv4-w4`
- worktree_entry: `path` (teardown = `ExitWorktree({action:"keep"})` + `git worktree remove`)
- battery_run_id: `wf_c3279142-f9a` (2+2 rounds, mixed finder, **3 verify voters**, customAgents
  false). Resume with `resumeFromRunId` on any death — W2's degraded battery went from 11 findings
  to 16 confirmed (including a BLOCKER) once resumed.
