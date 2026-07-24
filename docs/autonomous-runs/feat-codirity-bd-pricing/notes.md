# Autonomous run — Bundle D (Pricing + Stripe + Recent work, S5–S6)

Started: 2026-07-24T18:58:09Z

## Execution context
- Probes reused (session-stable). Prefix B4 (--bundle-id 4). id: subscription-rebuild Bundle 4.
  gh=maurino72. Worktree off origin/main @7e119db. Real npm ci.

## Task interpretation
- **Deliverable:** two-tier Pricing (Standard|Pro) from offer.tiers with Stripe env-link CTAs,
  founding-rate banner (gated on foundingRate.active), guarantee block, Recent-work S5 section
  (typed caseStudies placeholder), + flip layout.tsx metadata/OG to subscription-forward.
- **Acceptance:** both tier CTAs href-wired to env Stripe URLs; founding banner + guarantee render;
  pricing copy from offer.ts only; OG/metadata subscription-forward; server-side render; single <h1>.

## Plan / Decisions
- **layout.tsx:** flip SITE_TITLE/SITE_DESCRIPTION (used by title/description/openGraph/twitter) to
  subscription-forward; update the now-stale positioning-neutral comment. Keep metadataBase/per-page
  canonical (Bundle A) intact — layout has no canonical. Closes Bundle A's deferral.
- **PricingCard.tsx:** add optional `tasks?: string` prop (rendered as an emphasized line under the
  price), so a tier's active-task limit shows without cramming into features. CTA-as-link path
  (no calLink) already exists → used for Stripe href.
- **Pricing.tsx:** founding banner (if foundingRate.active) above; 2-col grid of PricingCard mapping
  offer.tiers (name/price/period→priceSubtext/tasks/description/features/cta/stripeUrl href/highlighted
  →featured); guarantee block below. NO toggle needed (single monthly price → fully server-rendered).
  Keep id="pricing" so the Hero anchor resolves. Copy from offer.ts only.
- **RecentWork.tsx (new, S5):** renders offer.caseStudies grid; returns null when empty (tasteful
  hide — the typed structure is the deliverable; Bruno adds content later, D5). Placed after Benefits.
- Stripe CTA safety: `<a href={tier.stripeUrl}>` with target/rel for external; placeholder "#".

## Stop attempts / Drift flags / Round-skip requests
_(none)_

## Verification (Phase 6 evidence)

- lint + tsc + build green; `/` prerenders static.
- **Metadata flip:** title + og:title = "Codirity — Your AI & automation team, on subscription";
  description subscription-forward ("on subscription", unlimited requests, pause/cancel). Closes
  Bundle A's positioning-neutral deferral. Per-page canonical (Bundle A) untouched.
- **Pricing (DOM + curl):** single <h1> (Hero); two tiers Standard $3,995/mo + Pro $6,995/mo with
  tasks lines; Founding banner $2,995 + label + slots (gated on foundingRate.active); guarantee
  "75% back"; all copy from offer.ts. `id="pricing"` intact (Hero anchor resolves).
- **Stripe env-wiring (end-to-end):** env UNSET → CTAs `href="#"`. Rebuilt with test env
  (NEXT_PUBLIC_STRIPE_LINK_STANDARD/_PRO/_FOUNDING) → the built HTML shows test_standard/test_pro/
  test_founding on the three CTAs (Standard, Pro, and the Founding banner), each `target=_blank
  rel=noopener`. So the CTAs genuinely open the env-configured Stripe URLs.
- **Recent work (S5):** RecentWork renders offer.caseStudies; returns null while empty (hidden, no
  empty state) — typed structure ready for D5 content.
- Browser screenshot glitched (blank) — capture flake; DOM inspection + curl authoritative.

## Review findings + resolutions
_(Phase 4/5)_

## Areas examined and rejected
_(battery)_

## Open items NOT addressed in this PR
- caseStudies content (D5) — typed placeholder; RecentWork hidden until content exists.
- FAQ + JSON-LD FAQPage/Service + footer = Bundle E (B1-D-jsonld1 stays open).

## Durable handles
- marker: /Users/brunomaurino/.claude/autonomous-active/autonomous-task-feat-codirity-bd-pricing
- worktree: /Users/brunomaurino/projects/codirity-bd-pricing
- worktree_entry: path
- cron: (none — bundle-loop owns the resume-watchdog; --bundle-id set)
