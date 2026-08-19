# autonomous-task run notes — redesign-v4 Bundle W5 (services, process, founder, FAQ)

**Started:** 2026-08-19T18:40:00Z

## Execution context

- Probes reused (session `0556b7db`, which ran W2–W4): Workflow ✅ Agent ✅ args ✅ effortTiers ✅
  **customAgents FALSE** (V6 incident) · worktreeNative ✅.
- Prefix `B406`, identifier **`redesign-v4 Bundle 406`**. Branch `feat/redesign-v4-w5` off
  `origin/main` @ `e8a1744` (carries W0–W4). `cp -Rl` node_modules.
- Worktree `/Users/brunomaurino/projects/codirity/.claude/worktrees/rv4-w5`, `worktree_entry: path`.

## Task description (echoed)

Match the approved mockup's paper-ground run: What we build as the full-width ruled list (ALL 7
`included[]` + ALL 5 `notIncluded[]` verbatim — v3 shipped a paraphrase and a dropped item),
declined rows at .42 opacity with the self-drawing strike and "we say no"; How it works as the three
`howItWorks[]` steps (01/02/03 is legitimate — it IS a sequence); the founder block promoting the
"Who does the work?" FAQ answer to a display-size quote (text only, NO photo/avatar, §1.8); the FAQ
as the ruled details/summary accordion with ALL 12 entries (founding entry gated + interpolated),
preserving the always-in-DOM/JSON-LD parity invariant and `faq_opened`. The dark→paper `.band`
enters before this run and the paper→dark band exits after it. Services hover moves the inner span
via transform, never padding.

## Task interpretation (Phase 1.5 prompt-pinning)

**Deliverable.** One PR rewriting `Services.tsx`, `Process.tsx`, `About.tsx` (as the founder block)
and `Faq.tsx` in the v4 paper treatment, adding the `.svc-list/.steps/.founder/.faq` CSS, and
placing the two `.band` gradients that bound the paper run in `page.tsx`.

**Acceptance test.**
- All **7** `included[]` and all **5** `notIncluded[]` render, each string **character-identical**
  to `offer.ts` — asserted in BOTH directions, so a paraphrase or a dropped item fails (v3 shipped
  exactly those two defects).
- All **12** `faq[]` entries render question AND answer **in the server HTML**, and the set matches
  the FAQPage JSON-LD exactly — the parity invariant the current component's docstring protects.
- `faq_opened` still fires once per open, with the question payload.
- The founder quote is `faq[0].answer` composed from `offer.ts`, not a copy; no photo, no avatar.
- Declined rows carry the self-drawing strike and "we say no"; the strike is `transform: scaleX()`,
  never a width animation, and reduced-motion / no-JS leave it drawn.
- Services hover moves the inner span by `transform`, never padding (a padding hover reflows the
  row and drags every sibling).
- The paper run is bounded by `.band-dl` entering and `.band-ld` leaving — no hard ground cut.
- Standard gates + perf delta on the prerendered document.

## Plan

**Step 0 — cross-run commitments.** `redesign-v4-w4/commitments.md § Target: redesign-v4 Bundle W5`
carries five awareness items, all directly binding here: run the orphaned-animation CSS gate after
adding motion (the strike is new motion); re-derive hand-set line breaks for the REAL strings and
measure at the gutter boundary; `.d-*` needs `display`; use `--chalk-faint` rather than stacking
opacity — **note the declined rows are specified at `.42` opacity**, which needs measuring on PAPER
(the token is a dark-ground token); and `.band-ld`/`.band-dl` are now in use and this bundle owns
their placement.

**Files.** `src/components/sections/Services.tsx`, `Process.tsx`, `About.tsx`, `Faq.tsx`,
`src/app/page.tsx`, `src/app/globals.css`, `scripts/w5-*.py`.

**Open questions resolved.**

1. **`<details>` vs the current button+grid accordion.** The mockup uses native
   `<details>/<summary>`. That PRESERVES the parity invariant — `<details>` content ships in the
   server HTML and is crawlable — while deleting a pile of state, ARIA wiring and a JS-only
   disclosure. `faq_opened` moves to the native `toggle` event. Chosen over keeping the custom
   accordion: it is less code, works with no JS at all, and the invariant that mattered is intact.
2. **Does the founder block duplicate the FAQ answer?** Yes, deliberately — the brief says "promote
   the 'Who does the work?' FAQ answer to a display-size quote". It composes from `faq[0].answer`
   rather than repeating the string, so the two can never drift. The W4 lesson (a restatement is a
   duplicate, not a fact) does NOT apply: here the repetition is the specified device, and the two
   renderings are far apart on the page.
3. **`.42` opacity on declined rows vs the no-stacked-opacity commitment.** W3/W4's rule is about
   text that must stay readable on the DARK ground. These rows are on PAPER and are deliberately
   de-emphasised — but they are still readable content, so the resulting contrast gets MEASURED,
   and if `.42` lands under AA it becomes an explicit ink token like `--chalk-faint` did.
4. **01/02/03 numbering.** Legitimate per the brief because it IS a sequence — and it composes from
   `howItWorks[].number`, not from the map index, so config stays the source.

## Decisions made unilaterally

1. **THE PAGE REORDER — the significant one.** W5 turned four scattered sections to paper. Left in
   the v3 sequence they alternated with the dark run SIX times, needing six gradients and reading as
   a strobe; the brief's own wording ("the band enters before **this run** and exits after it")
   presupposes a contiguous run, and the mockup groups exactly these four. So they move together,
   in the mockup's own internal order, landing after the proof and the offer.
   **W4's commitments explicitly parked page order as operator-owned**, so this is me taking a
   decision that was surfaced-but-not-taken. What bounds it: the dark run's internal order is
   untouched, the FAQ still follows the price (as the mockup has it), and no section's CONTENT
   moved relative to its neighbours within either run. The review challenged this specifically and
   ruled it defensible — it enumerated every adjacent pair and found no missing band, no band
   between same-ground sections, and no broken anchor.
2. **`<details>` over the JS disclosure.** Keeps both invariants (answers in the server HTML;
   `faq_opened` on the native toggle) while deleting the state, the ARIA plumbing and the
   requirement that JS run. Verified: React 19 lists `toggle` in `nonDelegatedEvents`, so the
   listener attaches to the element — delegation would have been the failure mode and does not apply.
3. **`--ink-faint` instead of the mockup's `opacity: .42`.** On paper that composites to ~2.7:1, on
   rows that are real content. Measured 4.88:1.
4. **`Section`'s `default` variant repainted from `bg-white` to `--paper`.** The bands terminate at
   `--paper`; while `default` painted pure white, every adjacent band left a seam at exactly the
   boundary it exists to soften. Its only consumer is the v3 Benefits survivor.
5. **The founder entry is indexed (`FOUNDER_FAQ_INDEX`), not searched.** The first draft used a
   magic-string `.find()` and `return null`ed the whole section on a miss.

## Stop attempts

(none)

## Drift flags

- **Decision 1 above is scope the brief did not literally grant.** Flagged here rather than left in
  a code comment: the operator's surface for seeing that a parked decision was taken is this file,
  and the first draft left this section as the empty Phase-3 placeholder while `page.tsx` narrated
  the reorder at length — which the review caught as run-record drift.

## Round-skip requests

(none)

## Review findings + resolutions

Battery `wf_a6c76803-5fc`: 16/16 agents, 0 errors. 36 raw findings → 15 clusters →
**15 confirmed, 0 refuted, 0 deferrals**. All applied.

**The reorder survived the challenge.** The review was pointed directly at it and ruled it
defensible: it enumerated every adjacent section pair, found no ground change without a band and no
band between same-ground sections, confirmed `#services`/`#process`/`#contact`/`#faq`/`#about` all
still resolve (and that the header's nav order now MATCHES the page order, which it previously did
not), and confirmed the FAQ still follows the price. The only reorder finding was the band seam.

### BLOCKER — `.lede` on paper measured 1.76:1

"Prefer to talk first?" carried `.lede`, which hard-sets `--chalk-dim` — a DARK-ground token.
On paper that is effectively invisible. A `.lede-ink` utility had been staged in the repo for
exactly this and was never wired up. Fixed by binding it to the GROUND (`.paper .lede`, alongside
`.paper .label`) rather than remembering it at each call site. Measured after: **6.10:1**.

### MAJOR

| At | Finding | Resolution |
|---|---|---|
| `globals.css` | The mockup's `.faq{max-width:820px}` was never ported, so the accordion inherited ~1184px and `summary`'s space-between stranded the "+" far from the question while answers stayed at 62ch | ported; verified 820px |
| `offer.ts` | `scopeLabels` and six `SectionCopy` fields lost their only consumers — the exact dead-config class W2 set precedent for and W4's review restated | deleted; `howItWorks`/`whatWeBuild` narrowed to `Pick<…,"label">`, `faq` to `Pick<…,"title">` |
| `page.tsx` | The bands terminate at `--paper` but Benefits painted `bg-white` — a visible seam at exactly the boundary the band exists to soften | `Section`'s `default` variant repainted to `--paper`; verified Benefits now matches the band terminal exactly |
| `globals.css` | **The strike broke on wrapping rows.** `position:absolute; width:100%` assumes one line — 3 of the 5 declined rows wrap at 375px, leaving line 1 struck at the BOX's width and later lines unstruck | rebuilt as an inline box WRAPPING the text with `box-decoration-break: clone`, so it fragments per line. Measured at 375px: 1/2/3/1/3 line fragments, each struck |
| `Faq.tsx` | The Cal button's `--rule-ink` border composites to ~1.4:1 — under WCAG 1.4.11's 3:1, and identical to the page's non-interactive rules, so the control stopped reading as one | `--ink-dim`; measured **6.10:1**, tap target 53px |
| `About.tsx` | The founder block was located by magic-string `.find()` and `return null`ed the WHOLE section on a miss — no type, build or runtime signal, on the most edited file in the project | `FOUNDER_FAQ_INDEX` beside the array, and the component THROWS on a bad index instead of disappearing |
| `notes.md` | The reorder was narrated in a code comment while "Decisions made unilaterally" was still the empty placeholder — the operator's only surface for a parked decision being taken was blank | written up above, plus a drift flag |

### MINOR

- The strike kept the mockup's `opacity: .55`, which there composited over a row already at `.42`
  (≈.23 effective); with the row opacity replaced by a colour it rendered ~2.4× too heavy → `.23`.
- `ProcessStep` and `Badge` were orphaned, kept alive only by barrel re-exports (invisible to lint)
  → deleted with their exports.
- The footer still labelled `#about` "About Us" after it became a founder quote → "Who does the work".
- `.svc-name` had been added to the reduced-motion transition-kill list, contradicting the policy
  two lines above it (which explicitly KEEPS sub-300ms state feedback) → removed.
- `--ink-faint` (and `--chalk-faint`, from W3) were never aliased into `@theme inline`, which makes
  a future `text-ink-faint` a silent no-op → both aliased.
- My own copy gate shipped dead first-attempt code and an unused import → removed.

### The gates found three more holes in themselves

The self-test caught, in sequence: a mutation that deleted the wrong rule (the tail of a selector
LIST rather than the pin); `.declined.svc-name.strike` matching as a SUBSTRING inside
`.in.declined.svc-name.strike`, so the revealed-state rule vouched for the degradation rule; and
`box-decoration-break:clone` matching inside `-webkit-box-decoration-break:clone`. All three were
real weaknesses in the gate, not in the CSS. **15/15 mutations caught** after fixing them.

## Post-fix verification

- `tsc` ✅ · `eslint` ✅ · clean build ✅ · copy gate ✅ · CSS gate ✅ · **self-test 15/15, `GATES ARMED`**
- **Strike measured at 375px**: `display: inline`, `box-decoration-break: clone`, producing
  1/2/3/1/3 line fragments — three rows genuinely wrap, and each line now carries its own bar.
- **Contrast on paper, compositing the full opacity chain**: lede 6.10 (was 1.76), declined row
  4.88, "we say no" / step body / faq answer / eyebrow 6.10, questions and founder quote 15.61 —
  **nothing under AA**. Cal button border 6.10:1, tap target 53px.
- Benefits' ground now equals the bands' terminal colour exactly; `.faq` is 820px.
- **Perf: document 20,382 B gz — 3,224 B under W4** (23,606).

## Areas examined and rejected

The battery recorded **75 areas examined**. Worth carrying:

- **FAQ parity**: 12 `<details>`, 12 JSON-LD `mainEntity`, exact tuple equality in both directions
  including the interpolated founding entry. Native `<details>` keeps every answer in the server
  HTML whether open or closed.
- **`faq_opened` fires exactly once per open**: react-dom 19.2.1 lists `toggle` in
  `nonDelegatedEvents`, so React attaches the listener directly to the element — delegation would
  have been the failure mode and does not apply, and `toggle` does not bubble.
- **No AT regression from button+ARIA to `<details>`**: `<summary>` exposes `role=button` +
  `aria-expanded` natively and is focusable; the repo defines no custom focus styles, so the UA ring
  applies exactly as it did to the old button.
- **Every adjacent ground pair enumerated**: no dark↔light adjacency without a band, no band between
  two same-ground sections, footer's `bg-gray-900` resolves to `--ground` so contact→footer is not a
  cut.
- **`.paper` duplicating `Section`'s variants is correct here** — §0 forbids nesting `.wrap-v4`
  inside `Section`'s own `px-4 md:px-8`, which is why these four are bare `<section>`s.

## Open items NOT addressed in this PR

(Phase 7)

## Durable handles

- marker: `$HOME/.claude/autonomous-active/autonomous-task-redesign-v4-w5` (+ `.json` sidecar)
- worktree: `/Users/brunomaurino/projects/codirity/.claude/worktrees/rv4-w5`
- worktree_entry: `path` (teardown = `ExitWorktree({action:"keep"})` + `git worktree remove`)
- battery_run_id: `wf_a6c76803-5fc` (2+2, mixed finder, **3 verify voters**, customAgents false).
