Started: 2026-08-18T15:48:43Z

## Execution context

Continuing the redesign-v3 bundle-loop within the same session as V0-V3, all merged (PRs #20-#23).
Reused probe results established earlier this session: `Workflow`/`Agent` present + callable,
`worktreeNative: true`, args round-trip OK, `effortTiers: true`, `customAgents: false`.

Origin-bundle prefix: `B205` (`--bundle-id 205`). Identifier: `redesign-v3 Bundle 205`
(plan-qualified via `--plan-slug redesign-v3`). Human-readable bundle label: **V4**.

## Task description (echoed)

Redesign v3 Bundle V4 — clients. Read docs/HANDOFF-redesign-v3.md §5 (the RESOLVED D6 content)
and docs/redesign-storytelling.md §1b in full for the exact facts and "Draft story copy" per
entity (eDairyCorp — client; Meshio and Vivi — ours, Vivi explicitly pre-launch). Rework
RecentWork.tsx into Designjoy-style badge cards — one blob-gradient tile per client/product, an
honest `client`/`ours` tag on each, a one-liner story adapted from the storytelling doc's draft
copy into the warmer Monthly Club voice (HANDOFF-redesign-v3.md §4) rather than copied verbatim
(that draft copy was written for the old ledger/mono register). The honesty discipline is
non-negotiable: never present Meshio or Vivi as arm's-length clients, Vivi must say "pre-launch."
Gates: standard + perf delta. --bundle-id 205 --plan-slug redesign-v3

## Task interpretation (Phase 1.5 prompt-pinning)

**Concrete deliverable:** a new `ClientEntry` data shape + `clients` array in `offer.ts`
(eDairyCorp/Meshio/Vivi, sourced facts + adapted one-liners), `RecentWork.tsx` reworked to render
it as 3 blob-gradient badge cards instead of the (currently empty, unused) `caseStudies` array.

**Acceptance test:** 3 cards render, each with the correct provenance tag (`client`/`ours`), Vivi
additionally tagged `pre-launch`, one-liner stories factually traceable to
`redesign-storytelling.md` §1b with no invented claims, no implication Meshio/Vivi are
arm's-length clients; `lint`/`tsc`/`build` green; SSR check passes; banned-word grep clean; perf
delta reported.

Read `docs/HANDOFF-redesign-v3.md` §5 and `docs/redesign-storytelling.md` §1 (§1a honesty
framing + §1b the three stories) in full BEFORE writing any copy — this is a content-sensitive
bundle, not a pure layout rework. No HS-3: the facts and the "Option A" framing decision are
already resolved (D6), documented, and traceable.

## Plan

**Files to touch:** `src/config/offer.ts` (new `ClientEntry` type + `clients` array — kept
SEPARATE from `CaseStudy`/`caseStudies`, which V8 owns for the D1 case-studies bundle via its own
new component), `src/components/sections/RecentWork.tsx` (full rework from the case-studies
renderer, currently unused since `caseStudies` is empty, into the D6 clients-badge renderer).

**Tests / verification:** `npm run lint`, `npx tsc --noEmit`, `npm run build`, SSR
script-stripped check (confirm all 3 names, both provenance tags, "pre-launch", and the adapted
one-liners' key facts all render), banned-word grep, perf delta vs. main, live/computed-style
check confirming 3 cards with distinct blobs and correct tags in both themes.

**Open questions to resolve during build:** none — every fact needed was in the two source docs,
read in full before writing.

## Decisions made unilaterally

- **Added a new `ClientEntry` type + `clients` array, kept separate from `CaseStudy`/
  `caseStudies`.** `RecentWork.tsx` previously rendered the empty `caseStudies` array (guarded to
  render nothing) — V8's own brief explicitly says it builds "a new component under
  src/components/sections/" for the D1 case studies, confirming clients (D6, this bundle) and
  case studies (D1, V8) are two genuinely separate content types (a lightweight provenance badge
  vs. a detailed metrics-bearing study) that should not share one array/shape. Repurposing
  `RecentWork.tsx` for D6 content does not block V8, which will add its own new file.
- **Adapted, not copied, the draft one-liners** — per the explicit instruction. Condensed each
  from the storytelling doc's 2-3 sentence draft into one sentence, verified every remaining
  claim against the source facts (§1b) rather than trusting the draft copy's own wording at face
  value. Caught and fixed one drift risk during this process: an early draft of the Meshio line
  said "when signups stalled," but the source fact is specifically "when PAID CONVERSIONS
  stalled" — a different funnel stage; corrected before shipping.
- **Explicitly surfaced the Meshio/Codirity shared-LLC fact in its one-liner** ("same LLC as
  Codirity, so we're not hiding it") rather than relying on the bare `ours` tag alone. The source
  doc is emphatic about this: "A visitor who checks the footer can find this in two minutes. So
  the copy must get there first." Judged this important enough to state directly, not just imply
  via the tag.
- **Vivi's line avoids any AI-vendor/model mention entirely** — the source doc flags "the scoring
  model is OpenAI GPT-5.5 per the brain — do not imply a Claude-based stack in any Vivi line."
  Rather than risk stating the wrong vendor or an outdated model name, the safest choice was to
  not name any AI vendor/model at all in the copy — the fact (photo → score) doesn't require it.
- **Card order preserved from the storytelling doc**: real client first (eDairyCorp), then the
  two "ours" products, Vivi (pre-launch) last — matches the doc's own stated order and its
  narrative logic (lead with the real client, the honesty-forward "ours" disclosures follow).
- **Blob assignment starts at `blob-3`**, not `blob-1` — the section immediately before this one
  on the page (Benefits, V2) ends its 6-tile cycle on `blob-2`; starting Clients on `blob-3`
  avoids repeating the adjacent section's last blob (the same adjacency discipline V1/V2 already
  established).
- Did not add screenshot files to this PR for the same tooling-access reason documented in prior
  bundles' notes.md — visual verification was live via browser automation + computed-style checks
  (confirmed 3 cards, correct names/tags/blob backgrounds/text color via `getComputedStyle`); this
  session's in-app Browser pane again hit its known scroll-position screenshot-capture glitch.

## Stop attempts

(none)

## Drift flags

(none)

## Round-skip requests

(none)

## Review findings + resolutions

(filled in Phase 4/5)

## Areas examined and rejected

(filled in Phase 4/5)

## Open items NOT addressed in this PR

(filled in Phase 7)

## Durable handles

- marker: /Users/brunomaurino/.claude/autonomous-active/autonomous-task-redesign-v3-v4
- worktree: /Users/brunomaurino/projects/codirity-rv3-v4
- worktree_entry: path
- dev_server_pid: 41712
- battery_run_id: wf_7132fe68-e08
