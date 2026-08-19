# autonomous-task run notes — redesign-v4 Bundle W0 (foundation flip)

**Started:** 2026-08-18T23:08:56Z

## Execution context

- Probes reused from this session (same build): Workflow ✅, Agent ✅, args round-trip ✅
  (`argsType: "object"`), `effortTiers: true`, **`customAgents: false`** (scoped-only resolution —
  the V6 CLEAN-while-dead incident; never true in this repo), `worktreeNative: true`.
- Origin-bundle prefix: `B401`. Identifier: **`redesign-v4 Bundle 401`**.
- Run slug / branch: `redesign-v4-w0` / `feat/redesign-v4-w0`, cut off `origin/main` @ `487dd06`.
- `node_modules` is a `cp -Rl` hardlink copy (Turbopack panics on symlinks — established v3).
- gh account: `brunomaurino` (re-verify before push/PR).
- Orchestrated by `/autonomous-bundle-loop` (session `0556b7db`); loop cron `39880892` covers the
  run, Step 0.6 skipped per no-double-arm.
- **Driver is Fable 5** by operator choice (flagged; sub-agent tiers pinned per role regardless).

## Task description (echoed)

Redesign v4 Bundle W0 — foundation flip per `docs/HANDOFF-redesign-v4.md` §1 with
`docs/redesign-v4/approved-mockup.html` as the visual contract. Apfel Grotezk via `next/font/local`;
v4 token flip; single-theme commitment (remove data-theme toggle, dark remaps, theme-init,
`.blob-*`/`.glass-dark`); §1.4 type scale; reveal system + house curve + scoped reduced-motion;
`.band` gradients; weight discipline (no 700 in display). NO structural/section changes.
Gates: lint + tsc + build + SSR + banned-word grep + measured contrast vs fixed grounds + perf
delta on the prerendered DOCUMENT.

## Task interpretation (Phase 1.5 prompt-pinning)

**Concrete deliverable.** One PR that swaps the site's foundations — fonts, tokens, theme
machinery, type scale, motion primitives — while every existing section keeps rendering legibly
with its current structure. The v4 SECTIONS arrive in W1–W6; W0 is the soil, not the plants.

**The two interpretation calls this brief forces (resolved in Decisions):**
1. Retiring `.blob-*`/`.glass-dark` while five current sections still consume them cannot mean
   "delete and let sections break" — consumers get a minimal interim v4 surface so nothing ships
   illegible.
2. "Single-theme" must kill the MECHANISM (the `dark:` variant, the toggle, the remaps) without
   requiring every `dark:` class to be hand-stripped today — the sweep is W6's; W0 makes them inert.

**Acceptance test (concrete + observable).**
- Computed `font-family` on `body` and on every heading resolves to Apfel; Figtree/Instrument
  requests are gone from the build.
- With the OS in dark mode, the rendered page is IDENTICAL to light mode (single theme): no
  `prefers-color-scheme` block and no `[data-theme]` selector survives in the compiled CSS chunk,
  and no `dark:` variant can fire.
- Script-stripped SSR body is NON-empty (the ThemeProvider mount-gate is gone).
- No element at display size computes `font-weight` ≥ 600.
- `.d-xl/.d-lg/.d-md/.label/.lede/.band-dl/.band-ld/.line/.fade` exist in the compiled chunk with
  the §1 values; `--ease` token present.
- Every section still renders with AA contrast (measured, both grounds); zero invisible text.
- lint/tsc/build green; banned-word grep clean; document-level perf delta recorded as the plan
  baseline.

## Plan

**Phase 2 Step 0 — commitments.** Globbed `docs/autonomous-runs/*/commitments.md`: no section
targets `redesign-v4` (first bundle of a new plan). v3's final bundle recorded operator follow-ups
only. 0 incoming.

**Build order:**
1. `src/fonts/` already carries the woff2s (HANDOFF commit). `layout.tsx`: `next/font/local`
   (Apfel 400+500, `--font-apfel`), remove Figtree/Instrument imports, remove ThemeProvider +
   theme-init script, `themeColor` → `#0A1712`.
2. `globals.css`: v4 tokens per §1.2; DELETE the `[data-theme="dark"]` block, the
   `prefers-color-scheme` remaps, `.accent`, `.blob-1..4`, `.glass-dark`, `.gradient-text`;
   ADD type-scale utilities, reveal system CSS, `.band-dl/.band-ld`, `--ease`.
   **Neutralize the `dark:` variant** via `@custom-variant dark (&:is(.__theme-dark-retired__ *))`
   — a never-matching selector, so every surviving `dark:` class compiles to dead weight instead
   of re-theming under OS dark mode. W6's sweep deletes the classes; W0 kills the mechanism.
   **Map `--font-weight-bold: 500`** in `@theme` — Apfel ships 400/500 only, so a stray
   `font-bold` would synthesize a faux 700; the token remap makes every `font-bold` render 500
   as a safety net UNDER the call-site conversion.
3. Interim surface for retired utilities: `.blob-*` call sites (Process, Benefits, RecentWork,
   CaseStudies) → `.panel-deep` (ground-2 bg, chalk text, card radius — a quiet v4 surface);
   `.glass-dark` (PricingCard) → the same. Sections keep their structure; W2–W5 rework them.
4. `.accent` consumers → plain text: `AccentWord` renders the word unwrapped (component kept as a
   pass-through so call sites don't all churn in W0; W5/W6 remove it); Hero's inline accent logic
   deleted.
5. Display-weight conversion: `font-bold` → `font-medium` on every heading/display-size call site
   (grep-driven, all sections).
6. `Section.tsx`: variants re-point to v4 grounds (`default`→paper, `gray`→paper-2, `ink`→ground);
   body bg → ground.
7. Reveal: extend `RevealProvider` to also arm `.rv`/`.line` (450ms delay), keep `.reveal`
   working for current sections.

**Verification:** the acceptance list above, measured live (dev server + computed styles for the
dark-mode-identical check and weight audit), compiled-chunk greps for the dead selectors, SSR
script-stripped body check, document gzip delta vs `main` @ `487dd06`.

## Decisions made unilaterally

- **The retired `.blob-*`/`.glass-dark` NAMES survive one plan-phase as aliases to a single quiet
  v4 surface** (`.panel-deep`: ground-2 under chalk). Five not-yet-reworked sections reference the
  names and their children assume a dark surface with light text; deleting the selectors outright
  would have shipped white-ish text on paper across half the page. The GRADIENTS and the BLUR —
  the visual system being retired — are gone from the compiled chunk (gate-verified); the alias is
  one flat rule, loudly commented, deleted in W6's sweep with the last consumer.
- **The `dark:` MECHANISM is killed; the classes are left inert.** `@custom-variant dark` now
  targets a never-matching selector, so ~150 surviving `dark:` classes compile to dead weight
  instead of re-theming the fixed grounds under OS dark mode. Hand-stripping them all in W0 would
  have churned every file W1–W6 is about to rework anyway; W6's sweep deletes them.
- **Legacy color aliases keep their v3 VALUES** (green-main/dark/light, gray ramp) rather than
  being re-pointed to v4 colors: those values are AA-verified against the surfaces that still
  consume them, and re-pointing them under unchanged consumers is how a token flip ships invisible
  text (v3 V0's `--white` incident). Only three tokens moved: `--gray-900`→ink `#0A1712`,
  `--gray-800`→ground-2, `--ink`→`#0A1712`. ~~strictly darker on light surfaces, contrast
  improves~~ **Corrected by the battery: WRONG — `#0A1712` is LIGHTER than the old `#0a0a08` in
  every channel.** As text on light surfaces the delta is negligible (both ≈19:1), but as the ink
  BAND's background the lightening dropped `text-brand-light` under AA — battery finding #0, fixed
  by re-tuning `--green-light` to `#45936F` (4.94:1). The unverified directional claim entered the
  audit trail as fact; struck through rather than deleted.
  New v4 tokens live alongside; W1–W6 migrate consumers; W6 deletes the aliases.
- **`--font-weight-bold: 500` remap in `@theme` PLUS call-site conversion** (`font-bold`/
  `font-semibold` → `font-medium`, 22 files). Apfel ships 400/500 only; without the remap a stray
  bold utility from any future edit would synthesize a faux 700. Belt and braces: the remap is the
  invariant, the conversion is the readable intent.
- **`Section.tsx` untouched.** Its `ink` variant already resolves to the v4 ground via the
  `--gray-900` re-point, and its light variants stay light — the page-level dark→paper
  choreography is W1–W6's job, not the foundation's.
- **`.bg-pattern` (the fixed dot grid behind everything) removed with the ThemeProvider.** v4's
  ground is deliberately still — "the stillness of the ground is the brand statement" per the
  approved motion critique. Not flagged as its own line in the HANDOFF; flagging here.
- **`gradientTitle` prop + `.gradient-text` deleted** — zero call sites (grep-verified before
  removal).
- **`AccentWord` becomes a pass-through** rather than being deleted: ~6 call sites belong to
  sections W2–W5 rework; churning them in W0 would double-touch every file. The search logic is
  left intact so the diff shows what was disabled; W6 deletes the file.
- **ThemeProvider/ThemeToggle/theme-init deleted entirely** (`src/components/theme/`). Header
  never mounted the toggle (grep), so no UI hole. `viewport.themeColor` pinned to `#0A1712`.
- **Two gate FALSE POSITIVES fixed in the gate, not waived**: Tailwind's own `backdrop-blur-*`
  utilities legitimately survive (Header/HeroVisual/Benefits still use them until their bundles)
  and emit webkit-first/unprefixed-LAST — the order that survives Lightning CSS; and `.transition`
  lists both properties in `transition-property` without colons. The gate now asserts the real
  invariant: every rule DECLARING `-webkit-backdrop-filter:` also keeps the unprefixed
  declaration.

## Stop attempts

(none)

## Drift flags

(none)

## Round-skip requests

(none)

## Review findings + resolutions

Battery `wf_205956aa-717` (19 agents, 2 adversarial + 2 QA, mixed opus/sonnet finders, 3 verify
voters): **40 raw → 15 after semantic dedup (9 clusters merged) → 15 confirmed, 0 refuted, 62
areas examined.** 0 deferrals, 0 escalations. **All 15 applied inline.**

| # | Sev | Where | Resolution |
|---|---|---|---|
| 0 | MAJOR 3/3 | `--gray-900` re-point | **Fixed.** Lightening the ink band to `#0A1712` dropped `text-brand-light` to 4.41:1 on it (mailto link + ink eyebrow) — and this diff had DELETED the v3 comment that warned about exactly this pair. `--green-light` re-tuned to `#45936F` (4.94:1 on the band), with the warning comment restored in v4 form. |
| 1 | MINOR 6-source | `Card.tsx` + `ServiceCard.tsx` | **Fixed.** Featured gradients still referenced the deleted `--blob-forest`; Tailwind's `@property` initial makes the to-stop TRANSPARENT under white text. Both now `bg-ground-2`. The dead utility also kept compiling because `design-system.md`'s historical sample carries the literal class and Tailwind scans docs — sample neutralized. |
| 2 | MAJOR 3/3 | `opengraph-image.tsx` | **Fixed.** The launch command required the OG check; theme-color was updated but this file was missed — it still painted the retired v3 gradient at fontWeight 800. Now the v4 fixed ground, mint dot, chalk-dim line, weight 500. |
| 3 | MAJOR 3/3 | `.lede` | **Fixed.** The mockup defines paper-ground overrides for both `.label` and `.lede`; only `.label-ink` was ported, leaving `.lede` at ~1.76:1 on paper for W5's first consumer. `.lede-ink` added. |
| 4 | MAJOR 3/3 | `.d-xl` | **Fixed.** My rem+vw "improvement" of the mockup's clamp was an INEQUIVALENT curve — ~32% larger at 375px, overflowing the hero's longest line. Mockup's exact curve restored, with the bare-vw trade-off documented in place (rem floor/cap bound the zoom concern; W1 re-verifies). |
| 5 | MAJOR 3/3 | reduced-motion | **Fixed.** The kill-list covered only the NEW system (zero consumers) while ~15 live v3 animations kept running. Now `[class*="animate-"]` is killed AND `animate-slide-up`/`fade-in` force `opacity:1` — several call sites pair `opacity-0` with the animation, so killing it alone would have left content permanently invisible. |
| 6 | MAJOR 2/3 | flat-surface chips | **Fixed.** `bg-black/20` scrims computed ~1.06:1 against the flat interim panel (WCAG 1.4.11 needs 3:1 for component boundaries). Hairline `--rule` borders on the 5 chip sites (HeroVisual ×2, Benefits, RecentWork ×2) until their bundles rework them. |
| 7 | MAJOR 3/3 | native `<strong>`/`<b>` | **Fixed.** The remap intercepts Tailwind utilities, not Preflight's `b,strong{font-weight:bolder}` — the privacy page's ~18 `<strong>` tags synthesized the exact faux-bold the remap exists to kill. `strong,b{font-weight:500}` in `@layer base`. |
| 8 | MINOR 3/3 | `@theme` | **Fixed.** None of the v4 tokens were exposed as utilities (a future `text-mint` would silently no-op) and `--color-brass` changed meaning without an audit. All v4 tokens aliased, with a loud brass caveat: numbers-on-dark only, ~2:1 on paper. |
| 9 | MAJOR 3/3 | `CLAUDE.md` + `design-system.md` | **Fixed.** The declared styling authorities still described the deleted v3 system. CLAUDE.md's design bullets rewritten to v4; design-system.md gets a SUPERSEDED banner pointing at the HANDOFF + mockup, with the v3 body kept as marked historical reference until W6 replaces the file. |
| 10 | MINOR | this file | **Fixed.** My "strictly darker, contrast improves" claim was directionally WRONG (`#0A1712` is lighter than `#0a0a08` in every channel) and had entered the audit trail unverified — struck through with the correction, not deleted. |
| 11 | MINOR | `viewport.themeColor` | **Accepted + documented** (the one non-edit resolution): near-black browser chrome above the still-light hero is visibly odd for the W0→W1 interim, correct as the end state. W1 is the next bundle and flips the hero dark; re-pointing to paper now would mean re-flipping in days. Recorded here and in the PR body. |
| 12 | MINOR | stale comments | **Fixed.** `Section.tsx`/`SectionHeader.tsx`/`ContactInfo.tsx` still cited `#0a0a08`/dark-mode facts from the deleted world. |
| 13 | MINOR | `blob.ts` + `PricingCard` | **Fixed.** The blob-rotation apparatus is now a no-op that read as intentional; marked as interim no-op (W2–W5 rework, W6 deletes). |
| 14 | MINOR | `AccentWord` TSDoc + `offer.ts` | **Fixed.** Both described the retired mechanism as load-bearing; now marked pass-through/retired with the removal owner named. |

### Post-fix re-verification

`tsc` ✅ `eslint` ✅ clean `npm run build` ✅. 13 post-fix gates ALL PASS (green-light in chunk +
≥4.5 on the band, `.lede-ink` compiled, mockup `.d-xl` curve restored, `strong/b` pinned,
`animate-*` covered with forced visibility, v4 tokens aliased, no `--blob-forest` refs, v3 OG
palette gone, chip borders present). Document: **30,965 B gz** — still **−653 B vs main**.

## Pre-battery verification (Phase 6 evidence)

- `npx tsc --noEmit` ✅ · `npx eslint src/` ✅ · clean `npm run build` ✅.
- **24 compiled-chunk gates, ALL PASS** (throwaway `scripts/w0-gates.py`, not committed): no
  `[data-theme]`, no dark `prefers-color-scheme` remap, dark variant neutralized, no theme-init,
  SSR body non-empty, all 8 v4 utilities compiled, line-rise + house curve + reduced-motion block
  present, blob gradients + glass blur + Instrument/Figtree gone, `font-bold` remapped to 500, no
  600/700 weight anywhere in the compiled CSS, webkit/unprefixed pairing intact, ground token in
  chunk.
- **Live (dev server, computed styles):** Apfel 400+500 loaded; body and every heading compute
  `apfel` at weight 500; **zero display-tier elements ≥600**; **zero dark-scheme color rules in
  any stylesheet**; no `data-theme` attribute. Contrast probed per section: **0 failures** (range
  5.73–18.35), and the interim `.panel-deep` surfaces measure **15.06** (chalk on ground-2).
- Banned-word grep over the rendered body: **none**. Zero `75%`.
- **Perf delta vs `main` @ `487dd06`** (clean builds both sides): document **30,928 B gz vs
  31,618 (−690 B)**, raw −1,942; JS chunks **−1,502 B gz**; CSS **−592 B gz**. Self-hosted font
  payload 40,416 B across two woff2 files, replacing the Google-hosted Figtree×4 + Instrument
  requests — the foundation flip makes the site smaller AND removes the third-party font
  dependency. **This W0 build is the plan's perf baseline: doc 30,928 gz.**

## Areas examined and rejected

(filled from the battery)

## Open items NOT addressed in this PR

All tracked in `commitments.md` as W1/W6 awareness items — none are deferrals: the themeColor
interim (closes with W1's hero), the `.d-xl` re-verification against the real hero (W1), and the
W6 retirement-sweep list this bundle created (aliases, inert `dark:` classes, legacy reveal,
`blob.ts`/`AccentWord`, design-system.md rewrite). Operator-owned and unchanged: the live Trello
template board still says "75% back".

## Durable handles

- marker: $HOME/.claude/autonomous-active/autonomous-task-redesign-v4-w0 (+ .json sidecar)
- worktree: /Users/brunomaurino/projects/codirity-rv4-w0
- worktree_entry: path
- cron: (loop's `39880892` covers this run)
- battery_run_id: `wf_205956aa-717` (2 adversarial + 2 QA, mixed finder, 3 verify voters,
  `effortTiers: true`, `customAgents: false`). If this session dies mid-battery, RESUME via
  `resumeFromRunId` — read `journal.jsonl` in the transcript dir first; never re-run from scratch.
