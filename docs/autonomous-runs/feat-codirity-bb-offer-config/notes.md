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

Battery `wf_dfeb77c5-00a` (2 adv + 2 QA, verify-voters=2): 7 raw → 4 unique → 4 confirmed, 0
refuted, 0 deferrals, 61 areas examined. All 4 APPLIED:

1. **MAJOR — guarantee.title overstated.** "7-day money-back guarantee" implies a full refund but
   the description + FAQ say 75%. APPLIED: title → "7-day 75%-back guarantee" (accurate; the title
   was a non-spec builder addition).
2. **MAJOR — Tier.price display-only, no numeric value for Service.offers JSON-LD.** APPLIED: added
   `priceAmount: number` to Tier (3995/6995) + foundingRate (2995) and exported `CURRENCY = "USD"`,
   so Bundle E's Service.offers has a clean machine-readable value. (This directly readies the
   B1-D-jsonld1 deferral for Bundle E.)
3. **MINOR — active-task limit duplicated in `tasks` and `features[0]`.** APPLIED: removed the
   duplicate from each tier's `features` (kept only in `tasks`) — single authoritative copy, no
   double-render.
4. **MINOR — "/mo" vs "/month" inconsistency.** APPLIED: tier `period` "/month" → "/mo" to match the
   spec-mandated founding "$2,995/mo" (changed the tiers, not the spec-fixed founding value).

Post-apply: lint + tsc + build green; shape re-check confirms priceAmount/period/dedup/title.

## Areas examined and rejected

From battery `areasExamined` (61 entries; consolidated):
- **Price accuracy** — Standard $3,995, Pro $6,995, founding $2,995/mo match the HANDOFF exactly.
- **Pro emphasis** — 2 active tasks, Priority delivery, highlighted:true present.
- **foundingRate shape** — active/price/slots:5/label match spec field-for-field; active gates the banner.
- **'Who does the work?' FAQ** — present, answered openly (senior engineer, Globant/Ualá, AI-accelerated).
- **env fallback** — stripeLink() returns '#' for undefined AND empty; NEXT_PUBLIC_ static member access
  (Next inlines at build); tsc clean.
- **purity** — no React/JSX import; server+client importable; icons are plain strings.
- **.gitignore negation** — verified `git check-ignore`: .env.example NOT ignored (tracked), .env.local still ignored.
- **.env.example** — documents all 3 Stripe vars + site/GA/SMTP; only empty placeholders, no secrets.
- **lucide icon names** — CreditCard/Infinity/Zap/Rocket/PauseCircle/TrendingUp all resolve in lucide-react 0.561.
- **consumer type completeness** — every field D/E/footer/book-a-call obviously need is present.
- **caseStudies** — empty typed array is the intentional D5 placeholder.

## Open items NOT addressed in this PR
- caseStudies content is a typed placeholder (empty array) — real content supplied later (D5).
  Not a deferral; the interface + empty export is the deliverable.

## Durable handles
- marker: /Users/brunomaurino/.claude/autonomous-active/autonomous-task-feat-codirity-bb-offer-config
- worktree: /Users/brunomaurino/projects/codirity-bb-offer-config
- worktree_entry: path
- cron: (none — bundle-loop owns the resume-watchdog; --bundle-id set)
- battery_run_id: wf_dfeb77c5-00a (Phase 4/5/5.5)
