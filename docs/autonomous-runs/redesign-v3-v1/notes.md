Started: 2026-08-18T13:39:21Z

## Execution context

Continuing the redesign-v3 bundle-loop within the same session as V0 (already merged as PR #20).
Reused probe results established earlier this session: `Workflow`/`Agent` present + callable,
`worktreeNative: true`, args round-trip OK, `effortTiers: true`, `customAgents: false`.

Origin-bundle prefix: `B202` (`--bundle-id 202`). Identifier: `redesign-v3 Bundle 202`
(plan-qualified via `--plan-slug redesign-v3`). Human-readable bundle label: **V1**.

## Task description (echoed)

Redesign v3 Bundle V1 — hero. Read docs/HANDOFF-redesign-v3.md §1 (visual system, now merged
from V0) and the approved "Monthly Club" pitch artifact's hero mockup for the literal layout to
mirror: nav with a small green brand dot + "Book a call"/"See pricing" pill buttons, an
asymmetric hero grid (copy left, blob-gradient card right), the blob card carries a "Start
today" badge with a small pulse dot, a short headline, and a CTA pill. Replace Hero.tsx's
current floating stat cards ("Cost Reduction / Save" etc.) entirely with this. Real offer.ts
hero copy only (headline, subhead, both CTAs — text unchanged, both remain instrumented
analytics events), apply the `.accent` italic-word treatment to exactly one word in the H1 ("on
subscription"), trust line ("Built by engineers from Globant & Ualá") stays. Gates: lint + tsc +
build + SSR check + banned-word grep + perf delta. --bundle-id 202 --plan-slug redesign-v3

## Task interpretation (Phase 1.5 prompt-pinning)

**Concrete deliverable:** `Hero.tsx` rebuilt to replace the floating "Cost Reduction/Save,
24/7 Automation/Non-Stop, Faster Delivery/Quick" stat-card visual with a single blob-gradient
card (using V0's `.blob-*` utilities) carrying a "Start today" badge + pulse dot; nav restyled
per the pitch (brand dot + pill CTAs — `Header.tsx`); real `offer.ts` copy only, `.accent` on
exactly one H1 word.

**Acceptance test:** hero renders the new asymmetric grid (copy left, blob card right) on
desktop, stacks sensibly on mobile, both themes; nav shows the pill-button treatment; H1 has
exactly one `.accent`-treated word; all existing analytics events (`hero_cta_click`,
`call_booked`/`call_booking_completed`) still fire from the same real hrefs/handlers;
`lint`/`tsc`/`build` green; SSR check passes; banned-word grep clean; perf delta reported.

Concrete and fillable directly from HANDOFF-redesign-v3.md §1 + §3.V1 + the approved pitch
artifact (authored this session) — no HS-3 needed.

## Plan

**Files to touch:** `src/components/sections/Hero.tsx` (full rework), `src/components/sections/
HeroCards.tsx` (retired — its floating-stat-card treatment is exactly what's being replaced;
confirm no other consumer before deleting), `src/components/sections/HeroBackground.tsx`
(keep/adapt — decorative ambient shapes, check if still wanted alongside a blob card),
`src/components/layout/Header.tsx` (nav restyle: brand dot + pill CTAs — check current state
first, V0 already applied token-level styling, this bundle is about layout/shape, not tokens).

**Tests / verification:** `npm run lint`, `npx tsc --noEmit`, `npm run build`, SSR
script-stripped check, banned-word grep, perf delta vs. main, live browser check (desktop +
mobile, light + dark) confirming the new hero visual, exactly one `.accent` word, and that both
CTA click handlers/analytics events are unchanged.

**Open questions to resolve during build:** exact current Hero.tsx/HeroCards.tsx/HeroBackground.tsx
structure (read before editing) — investigation, not a content ambiguity.

## Decisions made unilaterally

- **HeroVisual card's internal content is derived from real copy, not invented marketing text.**
  The launch brief asks the blob card to carry "a short headline, and a CTA pill" beyond the
  "Start today" badge (given verbatim). Rather than write new marketing copy, the headline
  ("Unlimited requests. One flat rate.") is a direct trim of the real `hero.subhead` — every
  word traces back to existing copy — and the CTA pill reuses `hero.primaryCta` verbatim (same
  label, same `#pricing` href, same `hero_cta_click` event with an added `surface: "hero_visual"`
  param to distinguish it from the main hero CTA in analytics without inventing a new event name).
  Considered sourcing the card from the founding-rate banner content instead (also real,
  in `offer.ts`), but that's V5's (Pricing) territory — duplicating it here risks the two
  places drifting out of sync if V5 changes the offer.
- **Nav restyle: replaced the single "Contact Us" pill with the "Book a call"/"See pricing" pair**
  the brief specifies, mirroring the hero's own two-CTA pattern in the persistent nav (both
  desktop and mobile menu). Used the label "Book a call" (lowercase c) — the exact casing already
  used in `Faq.tsx`'s existing Cal booking button — rather than inventing a third variant of
  the "book a call" copy (the codebase already has both "Book a Call" in `ContactInfo.tsx` and
  "Book a call" in `Faq.tsx`; picked the latter since it matches the brief's own literal casing).
  "See pricing" reuses `hero.primaryCta` exactly. The nav's "See pricing" link is NOT
  analytics-instrumented, consistent with the existing (untracked) `Services`/`Process`/`Contact`
  nav links — only `CalPopupButton` instances are tracked (it has built-in `call_booked`
  tracking), matching the pre-existing pattern rather than introducing nav-specific tracking
  as a side effect of this bundle.
- **Kept `HeroBackground.tsx`'s ambient decorative layer** (blurred circles, floating shapes,
  pulsing dots, bottom wave) rather than removing it now that a solid blob-gradient card fills
  the right column. It renders behind/around the content as atmospheric texture, not competing
  visual weight, and the launch brief only calls out replacing the STAT CARDS
  (`HeroCards.tsx`, now deleted) — it says nothing about the separate ambient-background layer.
  Removing it would be a scope-expanding structural change beyond what was asked.
- **Retired `HeroCards.tsx` entirely** (deleted the file, removed its export from
  `sections/index.ts`) rather than keeping it unused — confirmed via grep it had exactly one
  consumer (`Hero.tsx`) before this change, so nothing else silently breaks.
- **`.accent` applied to "subscription" alone**, not "on subscription" — HANDOFF §1.2 and this
  bundle's own launch command both say "exactly one word"; the launch command's parenthetical
  `("on subscription")` is read as indicating WHERE in the headline the accent falls, not that
  both words are accented. Implemented as a runtime split of `hero.headline` around the literal
  word "subscription" (see the `ACCENT_WORD` constant in `Hero.tsx`) rather than hardcoding the
  headline text as JSX, so the single source of truth in `offer.ts` still governs the actual
  copy and can't silently drift from a duplicated string in the component.

## Stop attempts

(none)

## Drift flags

(none)

## Round-skip requests

(none)

## Review findings + resolutions

Phase 4/5 review battery (`wf_bc6a93d3-357`): 2 adversarial rounds + 1 mixed-model
round + 2 QA rounds + 3-voter verify. 30 raw findings → 7 unique after semantic
dedup → 7/7 confirmed real (0 refuted). All 7 `applyInline`, 0 deferrals.

**MAJOR (3):**
1. `HeroVisual`'s badge/CTA pill used a LIGHTENING `bg-white/15` translucent
   overlay directly on top of `.blob-1`'s brightest hotspot — undoing V0's
   50%-black scrim (added specifically so white text stays ≥4.5:1 anywhere
   in the blob) and dropping contrast to ~2.9-3.9:1. `HeroVisual` was the
   first real consumer of `.blob-1`, so this was previously only a
   theoretical risk. Fixed by switching to a DARKENING `bg-black/20` fill —
   can only move contrast further from the already-safe scrimmed baseline,
   never toward it.
2. `hero_cta_click` had two emitters (the original hero CTA and the new
   card's CTA) with no way to distinguish them in analytics except one
   having no param at all, silently inflating the "denominator for
   pricing_viewed" the original code comment describes, and the one param
   it did have (`surface`) diverged from every other site's convention
   (`location`, used by `Footer.tsx`/`ContactInfo.tsx`/`privacy/page.tsx`).
   Fixed: both CTAs now carry `eventParams={{ location: "hero_primary" }}`
   / `{{ location: "hero_visual" }}`, and the denominator comment now
   explains the breakdown.
3. `HeroVisual` hardcoded "Unlimited requests. One flat rate." directly in
   JSX instead of sourcing it from `offer.ts` — violated the bundle's own
   "real offer.ts copy only" scope and was internally inconsistent with
   `Hero.tsx`'s own `ACCENT_WORD` logic in the same diff, which exists
   specifically to avoid this kind of duplicated string. Fixed: added
   `hero.visualHeadline` to `offer.ts` (kept as its own field rather than
   re-derived from `subhead`, so the two can be edited independently) and
   imported it.

**MINOR (4):**
4. The `.accent`-word split branched on `headlineTail`'s truthiness instead
   of the already-computed `.includes()` check, and only kept 2 parts from
   `split()` — would have silently dropped the accent word if the headline
   ever ended exactly on it, and silently discarded text after a second
   occurrence of the word. Fixed: rewrote using `indexOf`/`slice` with a
   `hasAccentWord` boolean independent of tail emptiness.
5. The mobile-menu "Book a call" button never closed the menu on click
   (every sibling control did), leaving the Cal popup rendering over a
   still-open menu. `CalPopupButtonProps` had no way to pass an extra
   click side-effect. Fixed: added an optional `onOpen` prop to
   `CalPopupButton`, called alongside (never instead of) its own
   `ensureCal`/`track` calls, wired from Header's mobile instance to
   `setIsMobileMenuOpen(false)`.
6. Deleting `HeroCards.tsx` left its `float-card`/`progress-fill`
   `@keyframes` and their 4 utility classes as dead CSS (zero consumers
   left in `src/`, confirmed via grep) — shipped to every visitor for no
   reason. Removed both keyframe blocks and all 4 utilities from
   `globals.css`.
7. `CalPopupButton.tsx`'s listener-latch comment said "three instances
   today" (Hero, Faq, ContactInfo) — this bundle's two new Header instances
   (desktop + mobile nav) bring the real total to six, and since Header
   mounts from the root layout, every route now renders at least the two
   nav instances, not just the homepage. Updated the comment with the
   accurate count and the route-blast-radius note.

## Areas examined and rejected

- **Cal.com booking-event double-fire from the two new Header CalPopupButton
  instances** — the `bookingSuccessfulV2` listener is guarded by a
  `window`-scoped (not per-instance) latch, so 6 mounted buttons still
  register exactly one listener; `call_booked` fires per-click and only one
  Header button (`hidden lg:flex` vs. `lg:hidden`) is ever reachable at a
  time. No regression.
- **`.accent` word contrast in both themes on the new H1 span** — `.accent`
  sets its own `color: var(--green-dark)` directly on the span (V0's fix),
  so the h1's `dark:text-white` doesn't reach it; verified both themes'
  `--green-dark` values clear AA independently (5.50:1 light, 6.02:1 dark,
  both established in V0).
- **Whether `HeroBackground`'s decorative layer visually competes with the
  new solid `.blob-1` card** — reviewed live in both themes; the ambient
  blurred circles/dots/wave sit at low opacity behind/around the content,
  not fighting the blob card's visual weight. Not flagged as a defect.
- **`hero_cta_click`/`call_booked` event names and shapes** — unchanged from
  before this bundle; only the `eventParams` on `hero_cta_click`'s two call
  sites were touched (see MAJOR #2 above).
- **Whether the nav's new "See pricing" `Link` needed its own tracked
  event** — deliberately left untracked, consistent with the pre-existing
  (untracked) `Services`/`Process`/`Contact` nav links; only
  `CalPopupButton` instances carry built-in tracking site-wide.
- **`sections/index.ts` and other barrel exports for stale `HeroCards`
  references** — confirmed clean after the export removal; grepped the
  whole `src/` tree for any remaining `HeroCards` reference (none).
- **Gates** — `lint`/`tsc`/`build` all independently re-run clean by the
  reviewers; SSR script-stripped check confirmed real content renders
  (5859 chars, includes both new nav CTA labels); banned-word grep clean.

## Open items NOT addressed in this PR

(filled in Phase 7)

## Durable handles

- marker: /Users/brunomaurino/.claude/autonomous-active/autonomous-task-redesign-v3-v1
- worktree: /Users/brunomaurino/projects/codirity-rv3-v1
- worktree_entry: path
- dev_server_pid: 64869 (port 3002)
- battery_run_id: wf_bc6a93d3-357
