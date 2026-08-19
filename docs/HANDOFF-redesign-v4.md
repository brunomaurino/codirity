# HANDOFF — Codirity Redesign v4: "The Number That Doesn't Move" (execution plan)

**Date:** 2026-08-18 · **Supersedes:** `docs/HANDOFF-redesign-v3.md` (Monthly Club — all 8 bundles
shipped, PRs #20–#27, then rejected on delivery by Bruno as reading like AI slop).
**Direction:** anchored on the CRAFT of [outcrowd.io](https://www.outcrowd.io/) and approved by
Bruno on 2026-08-18 from a live mockup that went through three independent design critiques
(motion, architecture/density, typography) before he saw it.

**THE APPROVED MOCKUP IS THE CONTRACT: `docs/redesign-v4/approved-mockup.html`.** Open it in a
browser before building anything. Where this document and the mockup disagree on a visual matter,
the mockup wins. Where either disagrees with `src/config/offer.ts` on a factual matter, `offer.ts`
wins.

---

## §0 — How to execute this plan

Same machinery as v3: `/autonomous-bundle-loop docs/HANDOFF-redesign-v4.md`, or individual bundles
via §3. One bundle = one PR. §2 is the durable status surface. Ground rules carried forward:
`offer.ts` is the source of truth for ALL copy/prices/links; server components by default; gates
`npm run lint` + `npx tsc --noEmit` + `npm run build` + script-stripped SSR verification;
`gh auth switch --user brunomaurino` before every push/PR (it silently reverts to `brunoiwp`);
banned-word voice gate (v1 §4, unchanged — the register never changes, only the container).

**MERGE POLICY — full unattended auto-merge, every bundle.** Bruno approved the exact visual
system live (the v4 direction artifact, 2026-08-18, "me gusta, armá el HANDOFF v4 y arrancá los
bundles") BEFORE this HANDOFF was written. The process failure of v1/v2/v3 — build everything,
merge everything, show Bruno last — is fixed by the mockup-first gate having already happened,
not by pausing mid-plan. No bundle pauses for confirmation.

**Process rule this plan exists under (recorded in project memory):** v4 is the FOURTH direction.
The mockup was approved before a single bundle launched. If mid-plan a bundle wants to deviate
visually from the mockup, it does NOT improvise — it flags the deviation in its PR body and
matches the mockup.

**Operational traps carried from v3's batteries (all incident-backed, all still live):**
- `customAgents: false` ALWAYS in this repo's review batteries — `customAgents: true` makes the
  battery call bare agent names this build can't resolve; all finders die and the battery reports
  CLEAN while having reviewed nothing (V6 incident).
- Turbopack hard-panics on a symlinked `node_modules` in a worktree — use `cp -Rl` from the parent.
- Lightning CSS drops whichever of two identical-value declarations comes second — unprefixed LAST,
  verify in the COMPILED chunk.
- A padding/margin/background SHORTHAND declared in a later class silently zeroes the longhand
  sides an earlier class set (the mockup's hero lost its side padding exactly this way). Prefer
  longhands when a class composes with `.wrap`/section classes.
- `container-type: inline-size` on a flex item whose class carries `margin: 0 auto` collapses it
  to content width / width 0 (measured in the mockup). Don't use container queries on `.wrap`.
- `margin: 0 auto` on a column-flex child disables cross-axis stretch — give hero-style rows
  `width: 100%`.
- A server component's markup ships in the RSC flight payload — perf deltas are measured on the
  prerendered DOCUMENT, not just static chunks (V8 finding: +76 B chunks hid +6.7 KB document).

## §1 — The visual system (from the approved mockup)

1. **One family: Apfel Grotezk** (Collletttivo, OFL 1.1 — committed at `src/fonts/`, license
   alongside). Regular (400) for body, **Mittel (500) for ALL display**. Wire via
   `next/font/local`. Figtree and Instrument Serif are RETIRED — no `.accent` italic-word
   treatment anywhere in v4. **`font-bold`/700 is BANNED in display type**: hierarchy comes from
   SIZE, never weight. (Outcrowd sets 124px headings at weight 500; that discipline is the single
   most-visible difference from v3.)
2. **The brand green is the GROUND, not an accent.** Tokens (from the mockup): ground `#0A1712`,
   ground-2 `#10241B`, paper `#EDEDE6`, paper-2 `#E2E2D9`, chalk `#F4F7F2`, chalk-dim `#A9B8AF`,
   ink `#0A1712`, ink-dim `#4C5B52`, **mint `#6EE7A8` ONLY on live/interactive elements**,
   **brass `#C8A24A` ONLY on defensible numbers**, rules `rgba(244,247,242,.14)` /
   `rgba(10,23,18,.16)`. House easing curve, everywhere: `cubic-bezier(.16,1,.3,1)`.
3. **Single committed look — v4 is theme-invariant.** The grounds are fixed regardless of OS
   theme, like the reference. The `data-theme` toggle, the dark-mode token remapping, and the
   dual-role `--green-fill` machinery are retired with the old palette. (This kills the entire
   class of dark-mode contrast bugs that consumed half of v3's review findings.) Contrast is
   measured once, against the actual fixed grounds. Verified in the mockup: chalk/ground 16.98,
   lede 8.88, brass 7.62, ink-dim/paper 6.1, mint-CTA text 11.94 — all comfortably over AA.
4. **Type scale** (mockup values): hero `.d-xl` derived from its longest hand-set line —
   `clamp(2.3rem, 10.2vw, 8.4rem)`, verified single-line at 1280px and 375px; section `.d-lg`
   → 124px cap; `.d-md` → 57.6px; **prices at the stat tier** `clamp(2.5rem, 1.3rem+5.5vw, 6.2rem)`
   (~99px); the eDairyMarket "27" caps AT the H1 (8.4rem), never above — one king per page.
   Tracking: −.012em base, −.018em at display sizes (geometric face — do not exceed). All clamps
   `rem + vw`, never bare vw (WCAG 1.4.4).
5. **Grounds never hard-cut (Bruno's explicit rule).** Transitions between the dark ground and
   paper sections go through `.band` gradient elements (~30vh, dark→`#39443C`→paper and reverse).
6. **Motion system** (from the critique, all in the mockup): ONE entrance gesture — the masked
   line-rise — repeated at every scale; the terms band's rules draw in like a contract; the
   queue scene is the signature (§3.W3); the "27" wipes in scroll-linked
   (`animation-timeline: view()` with `@supports` fallback); the "we say no" strikes draw
   themselves. **Prices NEVER animate** — no count-ups, ever. No parallax, no gradient drift, no
   cursor followers, no marquees. `prefers-reduced-motion` gets a complete static page (the
   queue's static tableau included) — scoped kill-list, not a universal `*{transition:none}`.
7. **The constant (folio):** once the hero scrolls out, `$3,995/mo — the number that doesn't
   move` sits fixed, vertical, on the right margin, flipping tone over paper sections. It is the
   flat-rate promise made behavior.
8. **Anti-slop checklist (v1 §5 lineage, v4 edition):** no invented stats, no fake testimonials,
   no logo marquees, no stock/AI imagery, no fake urgency, banned-word grep on all copy; the
   queue chips are LABELED illustrative; every number on the page traceable to `offer.ts` or the
   approved case-study content now living in `caseStudies[]`.

**Dashboard (view-only render of §2):** https://claude.ai/code/artifact/5dce4966-9e4c-43d1-893f-839155990869

## §2 — Bundle status surface

| Bundle | Scope | Depends on | Status | PR # | Merge SHA |
|---|---|---|---|---|---|
| **W0** | Foundation flip: Apfel via `next/font/local`, v4 token system, single-theme commitment (retire `data-theme` + dark remaps + blobs + glass + `.accent`), type scale, reveal system (line-rise + fade + IO, house curve), `.band` gradient utilities, weight discipline (no 700 in display) | — | [x] complete | #28 | `087a20c` |
| **W1** | Hero + nav + the folio constant | W0 | [x] complete | #29 | `c79249b` |
| **W2** | Terms band replaces Pricing: 4 ledger rows at the 99px tier, hanging `$`, baseline units, per-tier Stripe CTAs, rules-draw motion, prices never animate | W0 | [ ] not started | | |
| **W3** | The queue scene — signature pinned motion, illustrative chips, reduced-motion static tableau | W0 | [ ] not started | | |
| **W4** | Case studies + clients strip in the v4 treatment (eDairyMarket stat block + shipped list; Meshio state machine; 3-client strip) | W0 | [ ] not started | | |
| **W5** | What we build (list + strike-through "we say no") + How it works + founder block + FAQ restyle | W0 | [ ] not started | | |
| **W6** | Ownership quote + close + footer voice/format pass + dead-style retirement sweep + final perf/a11y gate | W0–W5 | [ ] not started | | |

## §3 — Per-bundle launch commands

### §3.W0
```
/autonomous-task Redesign v4 Bundle W0 — foundation flip. Open docs/redesign-v4/approved-mockup.html in a browser FIRST — it is the approved contract — then read docs/HANDOFF-redesign-v4.md §1 in full. Implement the system with NO structural/section changes: Apfel Grotezk via next/font/local from src/fonts/ (Regular 400 body, Mittel 500 display — Figtree and Instrument Serif retired, .accent utility deleted with its consumers' call sites converted to plain text); the v4 token flip in globals.css (§1.2 values verbatim); the SINGLE-THEME commitment per §1.3 — remove the data-theme toggle, the dark-mode token remapping, the theme-init script, and the .blob-*/.glass-dark utilities (check the OG-image and theme-color meta don't reference the old palette); the §1.4 type scale as utilities; the reveal system (masked line-rise + fade, one IntersectionObserver armed after 450ms, house curve token) with the §1.6 scoped reduced-motion discipline; the .band gradient utilities (§1.5). Enforce weight discipline: no font-bold in any display-size type — grep the tree for font-bold on heading elements and convert to size-based hierarchy. Beware the §0 cascade traps (shorthand-vs-longhand, Lightning CSS declaration order — verify in the compiled chunk). Gates: lint + tsc + build + SSR check + banned-word grep + measured contrast against the FIXED grounds (chalk/ground, dim/ground, ink-dim/paper, mint interactions) + perf delta on the prerendered DOCUMENT vs main. --bundle-id 401 --plan-slug redesign-v4
```

### §3.W1
```
/autonomous-task Redesign v4 Bundle W1 — hero + nav + the constant. Match docs/redesign-v4/approved-mockup.html's hero exactly: nav (brandmark + mint dot + pill CTA, justified — remember the column-flex stretch trap in HANDOFF §0), eyebrow = the trust line from offer.ts hero.trustLine, the three hand-set headline lines with the masked line-rise, the 13px hero ledger on the right carrying the real numbers ($3,995/mo flat · one active task at a time · pause or cancel anytime — brass on the price only), the lede, primary CTA "See pricing" → #terms. Replace Hero.tsx's HeroVisual/HeroBackground with this treatment. Implement the folio constant per §1.7: fixed vertical price on the right margin, appears past the hero, flips tone over paper sections; aria-hidden, pointer-events none. The .d-xl size is DERIVED from the longest hand-set line (§1.4) — verify single-line rendering at 1280px, 980px and 375px with the real font loaded, in the browser, not by arithmetic alone. Keep both hero CTAs instrumented (existing analytics events unchanged). Gates: standard + SSR + measured line-wrap check + perf delta. --bundle-id 402 --plan-slug redesign-v4
```

### §3.W2
```
/autonomous-task Redesign v4 Bundle W2 — the terms band. Replace the Pricing section with the mockup's four-row ledger (docs/redesign-v4/approved-mockup.html #terms): Standard $3,995/mo, Pro $6,995/mo, Guarantee 7 days · 50% back, Founding — 5 seats $2,995/mo, all values/notes verbatim from offer.ts (tiers, guarantee, foundingRate — the founding row stays gated on foundingRate.active and interpolates slots/price, per the offer.ts comment about the kill-switch). Typography per mockup: prices at the 99px tier in brass, hanging $ (absolute, translateX(-105%)), units at .38em baseline — never floating superscripts. Each purchasable row carries its Get started CTA wired to the tier's real stripeUrl with the existing checkout_click_* analytics events — this must not regress checkout. Motion: rules draw in scaleX with staggered rows on the house curve; PRICES NEVER ANIMATE (no count-ups — a number that wiggles reads as marketing). Preserve PricingViewedTracker's pricing_viewed behaviour on the new section. Gates: standard + SSR (all 4 rows' figures render, zero "75%") + CTA click-through verification + perf delta. --bundle-id 403 --plan-slug redesign-v4
```

### §3.W3
```
/autonomous-task Redesign v4 Bundle W3 — the queue scene. Implement the signature motion from docs/redesign-v4/approved-mockup.html #queue exactly: a 320vh scene with a sticky 100svh stage, four task chips on a horizontal track, discrete steps driven by a rAF-gated scroll quantizer (the tween belongs to CSS transitions on the house curve — never 1:1 scroll-linked), chips flipping queued→active→shipped with the mint ring on the active slot, the brass Shipped counter ticking (the ONE number allowed to animate, because there the number IS the mechanic), and the label "An illustrative queue — you scroll, we ship. Not a client board." kept VERBATIM — it is the honesty gate on this section. Reduced motion: static scene, height auto, step 1 tableau (one shipped, one active) — full information, zero motion. No scroll-jacking: native scroll throughout; transform/opacity only; test on a touch viewport. Headline "One task active. The rest wait in line." uses the shared line-rise. Gates: standard + a scripted scroll-position test asserting steps 0→3 fire and reduced-motion renders the tableau + perf delta. --bundle-id 404 --plan-slug redesign-v4
```

### §3.W4
```
/autonomous-task Redesign v4 Bundle W4 — case studies + clients in the v4 treatment. Rework CaseStudies.tsx and RecentWork.tsx to match docs/redesign-v4/approved-mockup.html (the eDairyMarket block: label, the 27/273 stat with its scroll-linked wipe — animation-timeline: view() with the @supports fallback — headline INCLUDING "Found and fixed." which is load-bearing, the two-column background + shipped-list, stack pills; the Meshio block: three-line headline, the New → Niche set → Voice set → Activated state-machine diagram as the visual — there is deliberately NO number for Meshio, the state machine IS the story; the three-client strip with client/pre-launch tags). ALL copy verbatim from offer.ts caseStudies[]/clients[] — content honesty is the highest-value review lens here, same as V8: no invented facts, no substituted nouns (the "guest carts" BLOCKER class), no LLM vendor named, Stripe tiers "specced" never drawn or claimed shipped. The v3 SVG architecture sketches are RETIRED with this treatment (delete CaseStudySketch.tsx and its exports). Gates: standard + SSR fact-provenance check (every §-sourced string renders; "Found and fixed." present; zero invented percentages) + banned-word grep + perf delta. --bundle-id 405 --plan-slug redesign-v4
```

### §3.W5
```
/autonomous-task Redesign v4 Bundle W5 — services, process, founder, FAQ. Match docs/redesign-v4/approved-mockup.html's paper-ground run: What we build as the full-width ruled list (ALL 7 included[] items + ALL 5 notIncluded[] items verbatim from offer.ts — v3 shipped a paraphrase and a dropped item, the review will diff strings literally), declined rows at .42 opacity with the self-drawing strike and "we say no"; How it works as the three howItWorks[] steps (01/02/03 numbering is legitimate here — it IS a sequence); the founder block promoting the "Who does the work?" FAQ answer to a display-size quote (text only — NO photo, NO avatar, §1.8); the FAQ restyled as the ruled details/summary accordion with ALL 12 faq[] entries (founding entry stays gated + interpolated), preserving the always-in-DOM/JSON-LD parity invariant and the faq_opened tracking. The dark→paper .band transition enters before this run and the paper→dark band exits after it (Bruno's no-hard-cut rule). Services hover moves the inner span via transform, never padding. Gates: standard + SSR (all 12 Q+A render; FAQPage JSON-LD parity; exact-string check on included/notIncluded) + banned-word grep + perf delta. --bundle-id 406 --plan-slug redesign-v4
```

### §3.W6
```
/autonomous-task Redesign v4 Bundle W6 — ownership, close, footer, retirement sweep. Match docs/redesign-v4/approved-mockup.html's closing run: the ownership quote block (the "Who owns the code" FAQ answer at display size — the honest substitute for an awards wall), the close (headline "Tell us what's eating your week." via line-rise, sections.contact copy from offer.ts, the mailto CTA + Cal booking with existing instrumentation and analyticsLocation labels, RESPONSE_TIME_CLAIM line), and the FOOTER — which has never been touched by any redesign: voice-pass its pre-redesign copy through the §4 gate, drop font-mono (retired since v3 V0), restyle to the v4 system as the continuation of the dark ground under the close. Then the retirement sweep: grep the tree for dead utilities and tokens (.accent, .blob-*, .glass-dark, gradient-text, old --green-* remaps, Figtree/Instrument imports, any surviving font-bold display type, any dark:-prefixed class now meaningless under single-theme) and delete them — verify in the COMPILED chunk that the dead CSS is actually gone (Lightning CSS trap). Final gates for the whole plan: standard + SSR + banned-word grep over the ENTIRE rendered page + measured WCAG on every section against the fixed grounds + document-level perf delta vs the pre-W0 baseline recorded in W0's notes + Lighthouse a11y pass. --bundle-id 407 --plan-slug redesign-v4
```

## §4 — Voice: unchanged

v1's `docs/HANDOFF-redesign.md` §4 applies verbatim (banned words, register, honesty-is-a-feature).
v4 adds one rule from the critique: **numbers hold still.** Copy may state a figure; the figure
never performs.

## §5 — Content constraints (all resolved — no open decisions block any bundle)

- All copy/prices/links from `offer.ts` — which already carries the battle-tested v3 content
  (12 FAQs, case studies with "Found and fixed.", clients, terms). No bundle writes new claims.
- No publishable third-party metrics exist (Bruno, 2026-08-18): no testimonials, no logos, no
  awards, no user counts. **The price and the terms are the numbers.** Sections that would need
  those assets (testimonial wall, logo strip) DO NOT EXIST in this plan rather than being faked.
- The queue chips are illustrative and labeled as such — that label ships, verbatim.
- D-photo (real founder/team photo) remains OPEN and blocks nothing: the founder block ships
  text-only. If Bruno supplies a photo later it's a follow-up PR, not a bundle.

## §6 — Measurement

Baseline: the funnel live since v3 (checkout_click_*, pricing_viewed, faq_opened, call_booked
with location labels, contact_form_*). No new events required; W2/W6 must not regress any.
Post-launch curiosity: whether faq_opened distribution shifts now that 12 questions render in a
ruled list, and whether checkout_click_founding moves with the terms band leading the page.

## §7 — Session notes for this plan

The bundle-loop session notes live at `docs/autonomous-runs/bundle-loop-redesign-v4-<date>/notes.md`.
V3's plan-closed retrospective (`docs/autonomous-runs/bundle-loop-redesign-v3-2026-08-18/notes.md`)
is required reading for the loop operator: its "process lessons" section is the trap list §0
summarizes.
