# autonomous-task run notes — redesign-v3 Bundle V8 (case studies)

**Started:** 2026-08-18T20:17:49Z

## Execution context

- Probe: Workflow ✅ + Agent ✅. The Step-0 capability probes were **reused from this session's V6
  run** (`wf_69274f40-58c`) rather than re-run: same session, same build, and every probe measures a
  build capability that cannot change between two bundles of one loop. Re-probing would cost a
  Workflow plus four agents to re-derive identical booleans. Values in force:
  `args` round-trip **PASS** (`argsType: "object"`) → battery invoked via `scriptPath` + real JSON
  `args`; `effort` opt accepted → `effortTiers: true`; custom `agentType` resolves **scoped only**
  → **`customAgents: false`** (see the V6 note below — this one is load-bearing);
  `EnterWorktree`/`ExitWorktree` resolve → `worktreeNative: true`.
- ⚠️ **`customAgents` MUST be false in this repo.** V6's first battery returned a CLEAN review while
  all six finders had died on `agent type 'at-reviewer' not found` — the shipped script calls the
  BARE names, which this build cannot resolve, and the failures surface only in the task
  notification's `<failures>` block, never in the returned object. An empty result is structurally
  identical to a genuinely clean review. Full writeup in `../redesign-v3-v6/notes.md`.
- Origin-bundle prefix: `B208`. Identifier: **`redesign-v3 Bundle 208`**.
- Run slug / branch: `redesign-v3-v8` / `feat/redesign-v3-v8`, cut off `origin/main` @ `e2e316d`
  (which carries V6, so this bundle inherits `Section variant="ink"`, `SectionHeader tone="ink"`,
  `AccentWord`'s new `className` prop, and `CalPopupButton`'s `analyticsLocation`).
- `node_modules` is a `cp -Rl` hardlink copy, NOT the symlink the skill prescribes — Turbopack hard-
  panics on a symlinked `node_modules` in a worktree (`Symlink node_modules is invalid, it points out
  of the filesystem root`). Established in V6.
- gh account: `brunomaurino` (re-verify before every push/PR — it reverts to `brunoiwp`).
- Orchestrated by `/autonomous-bundle-loop` (session `0556b7db`); the loop's cron `1b0f0c50` covers
  the whole run, so Step 0.6 is skipped per the no-double-arm rule.
- **Last bundle of the redesign-v3 plan.**

## Task description (echoed)

Redesign v3 Bundle V8 — case studies. Read `docs/HANDOFF-redesign-v3.md` §7 IN FULL before writing
anything; it carries the complete, Bruno-approved content briefs for eDairyMarket and Meshio, with
verbatim facts and explicit per-study "Do NOT include" exclusions. Invent no fact, metric, or detail
beyond §7. Build a new case-studies section (new component under `src/components/sections/`, wired
into the page) using V0's tokens: a blob-gradient accent behind each headline stat, the `.accent`
italic-word treatment on each headline, Figtree body copy, stack tags per study, and one simple
hand-drawn-feel SVG architecture sketch per study (an honest, simplified diagram of what was actually
built — never isometric stock art, never a screenshot). Place after Clients (V4) and before Pricing
(V5); document any different position. Gates: standard + perf delta + banned-word grep.

## Task interpretation (Phase 1.5 prompt-pinning)

**Concrete deliverable.** One PR that adds a case-studies section rendering the two §7 studies, with
every printed fact traceable to a §7 line, and wires it into the homepage between the clients section
and pricing.

**Acceptance test (concrete + observable).**

- Both studies' headline, context, what-shipped items and stack tags appear in the script-stripped
  SSR HTML of `/`.
- **Fact-provenance gate:** every number, percentage, product name, technology name and
  relationship claim rendered by the new section appears in §7. Specifically: `27`, `273`, `10%`,
  `~17k visits/month`, `20+ year`; the stacks `NestJS · Next.js (SSR) · React · Stripe · AWS` and
  `Next.js · Stripe`. And the two exclusions hold — **no** WordPress cost figure (`770`, `800`,
  "saved") anywhere, and **no** activation-rate percentage for Meshio.
- No LLM vendor or model name is printed anywhere in the new copy (§7 forbids committing to one).
- Meshio's Stripe tiers are described as **specced**, never as shipped, and do not appear in its
  architecture sketch (a diagram asserts what was built).
- Both architecture sketches are inline SVG whose every labelled node names a component §7 states
  was built; each carries an accessible name.
- The `.accent` word on each headline sits on a blob-gradient (dark) surface and therefore passes
  an explicit colour — verified by MEASURED contrast in both themes, not assumed.
- Exactly one `Section variant="ink"` on the page (the closing CTA); this section adds none.
- `npm run lint`, `npx tsc --noEmit`, `npm run build` green; banned-word grep clean; perf delta
  reported.

## Plan

**Phase 2 Step 0 — cross-run commitments.** Globbed all sibling `commitments.md`. The only section
targeting `redesign-v3 Bundle V8` is in `redesign-v3-v6` (V2/V3/V4 also list a V8 target) and every
one reads **(none)** — 0 incoming commitments. V6's file adds four awareness notes, all folded into
the review context and the build below. The single `STATUS: OPEN` item elsewhere belongs to the
client-onboarding plan (different plan token, correctly not auto-included).

**What I'm building.**

1. `src/config/offer.ts` — **repurpose the existing `CaseStudy` type and empty `caseStudies` array**
   rather than adding a second parallel shape. The current type (`summary`/`result`/`industry`/`href`)
   was a placeholder written before §7 existed and does not fit it; the array is empty and has ZERO
   consumers (only a comment in `page.tsx` mentions it). Two arrays — one dead, one real — would be
   exactly the drift this project keeps catching. New shape carries what §7 actually provides:
   relationship, headline, context, whatShipped[], stack[], and a `sketch` discriminator.
2. `sections.caseStudies` copy added alongside the other section headers.
3. `src/components/sections/CaseStudies.tsx` — one generously-padded block per study: header
   (name + relationship pill + stack tags), the headline stat on its own blob-gradient panel with the
   `.accent` word, context prose, a "what shipped" list, and the architecture sketch.
4. `src/components/sections/CaseStudySketch.tsx` — the two hand-drawn-feel inline SVGs, keyed by the
   `sketch` discriminator so the component can't render a diagram for a study that has none.
5. `src/app/page.tsx` — mount **immediately after `RecentWork`**, i.e. before `About` and therefore
   before `Pricing`, satisfying "after Clients and before Pricing". Chosen over
   after-`About`-before-`Pricing` so the proof narrative runs clients → deep case studies
   uninterrupted, and the reader reaches pricing having just read the strongest evidence.

**Verification.** lint · tsc · build · script-stripped SSR check asserting every §7 fact renders AND
both exclusion sets are absent · banned-word grep · measured WCAG AA on the accent word and all
blob-panel text in BOTH themes · one-`ink`-section assertion · perf delta vs `main` @ `e2e316d`.

## Decisions made unilaterally

- **Repurposed the existing `CaseStudy` type + `caseStudies` array instead of adding a second one.**
  The old shape (`title`/`summary`/`result`/`industry`/`href`) was written as a placeholder before §7
  existed and does not fit it; the array was empty and had ZERO consumers (grep found only a comment
  in `page.tsx`). Shipping a new populated array beside a dead placeholder is how a codebase ends up
  with two sources of truth, which is the drift this plan's batteries keep catching. The new shape
  carries exactly what §7 provides.
- **`sketch` is a `"edairymarket" | "meshio"` union, not a free string.** A typo in a string prop
  would silently render the WRONG study's architecture — i.e. print false claims about a client's
  system — and no test would catch it. Same reasoning as `BlobClass` in `src/lib/blob.ts`.
- **Meshio's Stripe tiers are in the prose as "specced" and NOT in its diagram.** §7 says specced,
  not shipped. Prose can carry that qualifier; a box in an architecture diagram cannot — a diagram
  asserts a built thing. This is written into the component's header comment so a later edit adding
  the box for visual balance has to argue with it first.
- **No LLM vendor or model is named anywhere**, per §7 ("do not name a specific model/vendor unless
  Bruno confirms one; the existing site copy doesn't commit to one either"). The SSR gate asserts
  this rather than trusting the copy — it greps for OpenAI/GPT-/Claude/Anthropic/Gemini/Llama/
  Mistral/Copilot.
- **Neither exclusion is printed even partially.** §7 permits stating eDairyMarket's before-cost
  alone (~$770-800/mo) if the angle is used at all. I printed neither: a lone before-cost invites
  the reader to infer a saving that was never measured, which is the same fabrication the exclusion
  exists to prevent, just outsourced to the reader. The gate greps for `770`, `800`, `WordPress` and
  savings phrasings.
- **Placed immediately after `RecentWork`, before `About`** (the brief allows anywhere "after
  Clients and before Pricing"; `About` sits between them). Chosen so the proof runs clients → the two
  deep studies in one uninterrupted stretch and the reader reaches pricing straight off the strongest
  evidence, rather than having the team blurb interrupt it. Recorded per the brief's "document if a
  different position is chosen".
- **Blob choice `blob-2` then `blob-1`.** `RecentWork` — the section immediately above — cycles
  blob-3 / blob-4 / blob-1 across its columns, so its LAST tile is blob-1; leading with blob-1 here
  would stack the same gradient across the section boundary, the exact adjacency `RecentWork`'s own
  comment documents avoiding.
- **One block per study, not a two-up grid.** These are meant to be read; two side by side halves the
  reading width for no gain. The inner what-shipped/sketch split is gated at `lg:` (not `sm:` or
  `md:`) because the sketch has a real minimum legible width — the ungated-grid trap from V5, applied
  at the breakpoint the content actually needs rather than the one habit suggests.
- **The sketches' wobble is hand-authored into the path coordinates, not generated.** A randomised
  roughness would differ between server and client render and hydrate-mismatch. Strokes and text use
  `currentColor` so they inherit the card foreground in both themes instead of hardcoding a colour
  that only works in one.
- **`bg-brand-fill` (not `bg-brand`) on the relationship pill and the list bullets** — those are
  solid fills under white text, which is the role the `*-fill` token pair exists for (V0's dual-role
  finding). Measured: 5.39:1 light / 5.22:1 dark.
- **The section is a SERVER component** — no `"use client"`, no state, no handlers. That is why the
  perf delta is nearly nothing despite adding two case studies and two inline SVGs (see below).

## Stop attempts

(none)

## Drift flags

(none)

## Round-skip requests

(none)

## Review findings + resolutions

Battery `wf_1daa7d60-fc4` (16 agents, 2 adversarial + 2 QA rounds, mixed opus/sonnet finders, 3 verify
voters): **27 raw → 10 after semantic dedup (6 clusters merged) → 9 confirmed, 1 refuted, 76 areas
examined.** 0 deferrals, 0 forced-apply, 0 escalations. **All 9 applied inline.**

**Two BLOCKERs, and both were fabrications this bundle wrote — in the one bundle whose entire premise
was "invent no fact beyond §7", behind a gate built specifically to catch that.** Recording that
plainly because the lesson is the finding.

| # | Sev | Where | Resolution |
|---|---|---|---|
| 1 | **BLOCKER** 3/3 | `offer.ts` eDairyMarket whatShipped | **Fixed.** The bullet read "Buyer favorites, with **guest carts** merged into the account on login". §7 (and `redesign-storytelling.md`) say buyer **favorites** merge guest→account on login. Never carts. A one-noun substitution inside an otherwise-correct sentence invented a shipped e-commerce feature for a **named real client**, and it rendered in the SSR HTML. Reverted to §7's noun. |
| 2 | **BLOCKER** 3/3 | `offer.ts` Meshio background | **Fixed.** The paragraph opened "Signup asked for everything up front and measured nothing that mattered." §7 says no such thing — it states only that onboarding was rebuilt around one activation metric instead of a generic signup flow, with OAuth deferred. A plausible inference about a real client's prior product, written as fact, is still a fabrication. Rewritten so every clause restates §7's own words. |
| 3 | MAJOR 3/3 | `CaseStudySketch.tsx` eDairyMarket | **Fixed.** The diagram drew a `Sellers → React admin panel` arrow and baked "sellers reach a React admin panel" into the accessible title. §7 lists the admin panel as a rebuilt surface and as one endpoint of the filter system — it never says who uses it, and admin panels are conventionally internal. The Sellers actor box and that arrow are both removed. The diagram was asserting an architecture fact about a client's system to sighted readers AND screen-reader users. |
| 4 | MAJOR 3/3 | `CaseStudySketch.tsx` AWS boundary | **Fixed.** The dashed "ISOLATED AWS INFRA" enclosure wrapped everything — including the Buyers actor and the third-party Stripe box — asserting that end users and a SaaS payment provider run inside the client's AWS account. §7 supports only prod/dev/admin moving onto isolated infra. The boundary now contains exactly the three services that moved; Buyers and Stripe sit outside it. The accessible description was repeating the same wrong claim and is rewritten. **What an enclosure contains is itself a claim** — that is now written into the component. |
| 5 | MAJOR 3/3 | both sketches | **Fixed.** Fixed 620-unit viewBox scaled by `w-full h-auto` with no floor: at a 375px viewport the ~295px column rendered 12.5px node labels at **~5.9 CSS px** (~4.8px at 320px) — illegible across the whole phone band, on the section's marquee proof deliverable. Labels bumped to 15/12, `min-w-[520px]` on each SVG, and an `overflow-x-auto` container so the reader pans instead of squinting. My Phase-6 audit had measured the labels' CONTRAST and never their rendered SIZE. |
| 6 | MAJOR 3/3 | this file | **Fixed — my perf model was wrong.** I reported +76 B JS / +75 B CSS and wrote that a server component's markup "never enters the client bundle". It does: React serializes it into the **RSC flight payload** alongside the HTML. Re-measured myself rather than taking the reviewer's number: the prerendered document goes **24,903 → 31,614 B gzipped, +6,711 B** (raw 152,858 → 192,217, +39,359) versus `main` @ `e2e316d`. Static chunks move only +72 B JS / +131 B CSS, which is what I had measured — a real number answering the wrong question. Corrected in full below. |
| 7 | MAJOR 3/3 | `offer.ts` eDairyMarket headline | **Fixed.** The headline transcribed §7's 404/sitemap fact but dropped its closing "**Found and fixed.**", and no whatShipped bullet covered the remediation either — so the section's largest, most prominent claim read as an unresolved live defect on a named client's production catalog. Inverted §7's outcome-first intent. Restored verbatim. |
| 8 | MINOR | `offer.ts` section title | **Fixed.** "Two of them, in detail" hardcoded the count with no link to `caseStudies.length`; adding a third study would silently contradict the heading. Now "In detail". |
| 9 | MINOR | `CaseStudies.tsx` stack list | **Fixed.** The stack-tag `<ul>` had no heading or accessible name, unlike the other two lists in the article, so a screen reader announced an unlabelled 5-item list. Now `aria-label="<study> — stack"`. |

**Refuted (1/10)** — correctly.

### Why the gate passed a diff containing two BLOCKERs, and what changed

My `scripts/ssr-check-v8.mjs` asserted that §7's strings were **present**. That catches omission and
nothing else. Both blockers were an ADDITION and a SUBSTITUTION *inside otherwise-correct sentences* —
"guest carts" where §7 says favorites, and an invented opening sentence. A presence check is blind to
those by construction, and I had described that gate as a "fact-provenance gate", which oversold what
it could actually refute.

The gate now carries a NEGATIVE half: an explicit forbidden-phrase list drawn from what the review
caught (`guest cart`, `measured nothing that mattered`, `asked for everything up front`,
`sellers reach`), an assertion that the sketch's accessible description scopes the AWS boundary
correctly, plus the legibility floor and the a11y/structure checks. It re-runs green.

The honest conclusion is not "the gate is fixed" — a gate can only refute claims it is told to look
for, so it will always trail the review. The adversarial battery is what caught these, four of the
five finders independently flagging #2. That is the layer that earned its cost on this bundle.

### Post-fix re-verification

`tsc` ✅ `eslint` ✅ clean `npm run build` ✅. Hardened gate: **PASS** — §7 facts render, all 9 findings
verified applied (including both BLOCKER phrases asserted absent), exclusions absent, sketches
claim-scoped with a legibility floor, structure correct, 0 banned words.

**Corrected perf delta vs `main` @ `e2e316d`** (clean production builds both sides):

| | main | V8 | delta |
|---|---|---|---|
| Prerendered document (gzip) | 24,903 B | 31,614 B | **+6,711 B** |
| Prerendered document (raw) | 152,858 B | 192,217 B | +39,359 B |
| Static chunks JS (gzip) | 206,991 B | 207,063 B | +72 B |
| Static chunks CSS (gzip) | 11,959 B | 12,090 B | +131 B |

The document number is the one that matters and the one I originally got wrong. Roughly half of the
raw growth is the RSC flight payload duplicating the section's markup — inherent to server components,
not a defect — and the two inline SVGs are verbose by nature. No new dependencies. Flagged for
Bruno rather than silently accepted: **+6.7 KB gzipped on the homepage document is a real cost** for
two case studies, and if it matters more than the proof does, the sketches are the first thing to
trim.

## Pre-battery verification (Phase 6 evidence)

- `npx tsc --noEmit` ✅ · `npx eslint <5 changed/added files>` ✅ · clean `npm run build` ✅.
- **Fact-provenance gate** (throwaway `scripts/ssr-check-v8.mjs`, NOT committed) over the prerendered
  page. This gate is deliberately not a "did the copy render" check — it asserts that every printed
  fact is one §7 states, and that both exclusion sets are genuinely absent:
  `PASS — all §7 facts render, both exclusion sets absent, no LLM vendor named, sketches accessible +
  claim-clean, page order + single-ink-section correct, 0 banned words`.
  It checks: each §7 fact string (27/273, 10% of the catalog, sitemap-Google, 20+ year, 17k
  visits/month, legacy Angular and Node, all five whatShipped bullets, both stacks, Meshio's state
  machine and deferred OAuth, "Stripe subscription tiers **specced**"); absence of `770`/`800`/
  `WordPress`/savings phrasing; absence of any percentage in the section other than `10%`; absence of
  eight LLM vendor/model names; that Meshio's sketch title does NOT mention Stripe; that
  eDairyMarket's sketch draws the three nodes §7 names; both sketches carry accessible names; page
  order `work < case-studies < pricing`; **exactly one** `ink` section on the page; and the §4
  banned-word list.
- **Two false alarms in my own gate, both fixed rather than relaxed** — worth recording because each
  would have been a plausible-looking "finding":
  1. A page-wide percentage sweep flagged `50%` ×3 as invented stats. Those are the guarantee (V5's
     D3), legitimate and pre-existing. The claim under test is what THIS bundle prints, so the sweep
     is now scoped to the case-studies section's own markup.
  2. The single-ink-section check reported **5** ink bands. Every light section carries
     `dark:bg-gray-900`, which contains `bg-gray-900` as a substring. Now `(?<!dark:)`.
- **Contrast on the blob panels — the analytic worst case, not a single computed-style read.** My
  first probe walked up from the text to find a background colour and got the WHITE CARD, because
  `.blob-*` paints via `background-image` and its `backgroundColor` is transparent; it reported white
  text at 1.0:1 in light mode. That was the probe, not the page. The correct method, given the blob
  is layered gradients: take the LIGHTEST colour stop each blob can paint, composite it under V0's
  top-layer `rgba(0,0,0,0.5)` scrim, and measure against it — i.e. the darkest possible pixel
  anywhere under the text. Both blobs this section uses clear AA for **normal** text (not merely
  large) in BOTH themes:

  | blob | lightest stop | after scrim | body `#f4fbf6` | accent `#fff` |
  |---|---|---|---|---|
  | blob-1 | `--blob-gold` `#fce38a` | `rgb(126,114,69)` | **4.56** | **4.79** |
  | blob-2 | `--blob-mint` `#7ce3b2` | `rgb(62,114,89)` | **5.32** | **5.59** |

  Identical in dark mode (the two governing stops are theme-invariant). Every measured element also
  reported `opacity: 1` — no `opacity-NN` on blob-surface text (V2's finding).
- **Non-blob elements, measured live in both themes, zero failures:** study name 19.81/15.58,
  relationship pill on `bg-brand-fill` 5.39/5.22, "What shipped"/"How it fits together" subheads
  5.39/8.63, list items 6.74/5.60, stack tags 6.17/6.46, sketch labels 19.81/15.58.
- ~~**Perf delta vs `main` @ `e2e316d`**: JS **+76 B**, CSS **+75 B**. Two full case studies and two
  inline SVGs for 151 bytes total because `CaseStudies` is a **server** component — its copy and
  markup never enter the client bundle.~~ **WRONG — see finding #6 and the corrected table below.**
  The static-chunk numbers were accurate but answered the wrong question: a server component's markup
  DOES reach the client, serialized into the RSC flight payload. The real document delta is
  **+6,711 B gzipped**. Struck through rather than deleted so the mistaken reasoning stays visible.

## Areas examined and rejected

- **Reusing `RecentWork.tsx`'s badge-card treatment** — rejected, and `offer.ts`'s own comment
  already called for this: that section is a lightweight roll-call, these are the evidence blocks.
  Reusing it would have forced the case studies into a 3-up grid sized for one-liners.
- **Naming the LLM behind Meshio's ideation pipeline** — not rejected on taste, forbidden by §7.
  Asserted absent by the gate rather than left to reviewer attention.
- **Printing eDairyMarket's before-cost alone** — permitted by §7 but rejected; see Decisions.
- **A second dark band for the case studies** — considered (the blob panels are dark and a full ink
  section would have unified them) and rejected: HANDOFF §1 rule 4 makes the ink band one-per-site,
  and V6's `commitments.md` carried that forward explicitly to this bundle. The gate asserts exactly
  one ink section survives.

(the battery's own `areasExamined` are appended after Phase 4/5)

## Open items NOT addressed in this PR

Full list in `commitments.md`. All operator-owned; none block anything, and this is the plan's last
bundle.

- **The live Trello `[TEMPLATE] Codirity Client Board` still says "75% back"** — open since V5, only
  a manual Trello edit closes it. The one genuinely user-facing loose end the whole plan leaves.
- **+6.7 KB gzipped on the homepage document** for this section (finding #6). Real; the SVG sketches
  are the first thing to trim if page weight ever outranks the proof.
- Publishing the pause/cancel billing mechanics; the three stacked book-a-call prompts;
  `Footer.tsx`'s pre-redesign copy and retired `font-mono`; `Hero.tsx`'s un-migrated `AccentWord`.
- **V7 (real team photos)** stays gated on D2 — deferred at plan launch, not dropped.

## Durable handles

- marker: $HOME/.claude/autonomous-active/autonomous-task-redesign-v3-v8 (+ .json sidecar)
- worktree: /Users/brunomaurino/projects/codirity-rv3-v8
- worktree_entry: path
- cron: (none of this run's own — the bundle-loop's `1b0f0c50` covers the loop)
- battery_run_id: `wf_1daa7d60-fc4` (2 adversarial + 2 QA rounds, mixed finder, 3 verify voters,
  `effortTiers: true`, **`customAgents: false`**). If this session dies mid-battery, RESUME it —
  `Workflow({scriptPath: "<skill>/templates/review-battery.js", resumeFromRunId: "wf_1daa7d60-fc4"})`
  — never re-run from scratch; read `journal.jsonl` in its transcript dir first.
