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

Battery `wf_9f0e3697-1e8` (2 adv + 2 QA, verify-voters=2): 3 raw → 2 confirmed, 0 refuted, 0
deferrals, 59 areas examined. Both APPLIED:

1. **MAJOR (2/2) — OG image copy stale after the metadata flip.** opengraph-image.tsx still said
   "AI & automation engineering" (alt) + "...move faster" (body), contradicting the new
   subscription-forward og:title/og:description — defeating the flip's goal (the shared card must
   match the page). APPLIED: flipped the OG image alt + body to subscription-forward ("Your AI &
   automation team, on subscription. Unlimited requests, one flat monthly rate."). Rendered + visually
   confirmed the OG PNG (89.9 KB) shows the new copy and `&amp;` renders as `&`.
2. **MINOR — Pricing.tsx hardcoded its SectionHeader copy** (offer.ts had no sections.pricing).
   APPLIED: added `sections.pricing {label,title,description}` to offer.ts; Pricing sources from it —
   now consistent with every sibling section (single source of truth for section copy).

Post-apply: lint + tsc + build green; og:image:alt subscription-forward; OG image renders correctly.

## Areas examined and rejected

From battery `areasExamined` (59 entries; consolidated):
- **Stripe CTA wiring + safety** — each tier maps a distinct NEXT_PUBLIC_STRIPE_LINK_* via stripeLink();
  founding banner uses foundingRate.stripeUrl; all external links target=_blank rel=noopener noreferrer
  (no reverse tabnabbing). Rebuilt with test env → verbatim URLs in HTML; unset → "#". No hardcoded URL.
- **pricing accuracy** — $3,995 / $6,995 (highlighted) / $2,995, /mo, 75% guarantee all from offer.ts.
- **founding gating + framing** — banner only under foundingRate.active, slim pill above the grid
  (not the headline).
- **metadata flip no-regression** — only SITE_TITLE/SITE_DESCRIPTION strings changed; metadataBase,
  per-page canonical, twitter:card, opengraph-image auto-injection all intact (byte-diffed).
- **single h1** — only Hero; pricing/RecentWork use h2/h3.
- **SSR** — no 'use client' on the page; PricingCard imports the client CalPopupButton (standard);
  RecentWork returns null cleanly when caseStudies empty.
- **reveal** — new .reveal elements (banner/tiers/guarantee/RecentWork) observed + revealed.
- **offer.ts symmetry** — recentWork + pricing added to SectionsContent interface AND sections const.

## Open items NOT addressed in this PR
- caseStudies content (D5) — typed placeholder; RecentWork hidden until content exists.
- FAQ + JSON-LD FAQPage/Service + footer = Bundle E (B1-D-jsonld1 stays open).

## Durable handles
- marker: /Users/brunomaurino/.claude/autonomous-active/autonomous-task-feat-codirity-bd-pricing
- worktree: /Users/brunomaurino/projects/codirity-bd-pricing
- worktree_entry: path
- cron: (none — bundle-loop owns the resume-watchdog; --bundle-id set)
- battery_run_id: wf_9f0e3697-1e8 (Phase 4/5/5.5)
