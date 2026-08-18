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

(filled in Phase 4/5)

## Areas examined and rejected

(filled in Phase 4/5)

## Open items NOT addressed in this PR

(filled in Phase 7)

## Durable handles

- marker: /Users/brunomaurino/.claude/autonomous-active/autonomous-task-redesign-v3-v1
- worktree: /Users/brunomaurino/projects/codirity-rv3-v1
- worktree_entry: path
- dev_server_pid: 64869 (port 3002)
