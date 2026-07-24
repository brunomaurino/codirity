# Autonomous run — Bundle B (offer config)

Started: 2026-07-24T17:44:30Z

## Task description

Bundle B of subscription-rebuild: create `src/config/offer.ts` (typed constants, single source of
truth for the offer) + document the three Stripe env vars in `.env.example`. Pure data, no UI.

## Execution context
- Probes reused from prior bundles (session-stable): Workflow+Agent, args=YES, effortTiers=true,
  customAgents=false, worktreeNative=true.
- Prefix B2 (--bundle-id 2). Plan-qualified id: subscription-rebuild Bundle 2. gh=maurino72.
- Worktree off origin/main @00c4d16. Real npm ci.

## Task interpretation
- **Deliverable:** `src/config/offer.ts` exporting typed interfaces + constants (brand, tiers,
  foundingRate, guarantee, included/notIncluded, benefits, howItWorks, faq, caseStudies placeholder,
  calLink, contactEmail, legalEntity) with Stripe URLs from `NEXT_PUBLIC_STRIPE_LINK_*` (`#`
  fallback); `.env.example` documenting the three vars.
- **Acceptance:** offer.ts typechecks (tsc); a throwaway import yields expected shapes; .env.example
  documents the 3 Stripe vars; lint + build green. No component changes.

## Consumer contract (from bundle-loop)
- tiers[] shape stable for Bundle D pricing cards; faq[] reused by Bundle E accordion AND FAQPage
  JSON-LD; howItWorks[] matches ProcessStep {number,title,description}; benefits[] {title,description,
  icon} (icon = lucide name string, mapped by the component — keeps offer.ts JSX-free/pure data);
  caseStudies typed placeholder for Bundle D.

## Decisions made unilaterally
- offer.ts is PURE DATA (no JSX/React imports) so it's importable from server + client. Icons are
  lucide NAME strings; consumers map name→component. Keeps the single-source-of-truth clean.
- Stripe URLs read `process.env.NEXT_PUBLIC_STRIPE_LINK_*` with `#` placeholder fallback (D2), so the
  site builds without real links; founding rate carries its own stripeUrl too.
- Copy authored confident/direct, zero agency-speak (ground rule 4; PRD copy is directional). "Who
  does the work?" answered openly (senior engineer, AI-accelerated). Scope lists (included/notIncluded)
  authored to match the AI/automation/custom-systems positioning.

## Stop attempts / Drift flags / Round-skip requests
_(none)_

## Review findings + resolutions
_(Phase 4/5)_

## Areas examined and rejected
_(from battery)_

## Open items NOT addressed in this PR
- caseStudies content is a typed placeholder (empty array) — real content supplied later (D5).
  Not a deferral; the interface + empty export is the deliverable.

## Durable handles
- marker: /Users/brunomaurino/.claude/autonomous-active/autonomous-task-feat-codirity-bb-offer-config
- worktree: /Users/brunomaurino/projects/codirity-bb-offer-config
- worktree_entry: path
- cron: (none — bundle-loop owns the resume-watchdog; --bundle-id set)
