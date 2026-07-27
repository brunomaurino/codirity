# Autonomous run — Bundle F (analytics + performance close-out + acceptance)

Started: 2026-07-27T12:07:31Z

## Execution context
- Probes reused (session-stable). Prefix B6 (--bundle-id 6). id: subscription-rebuild Bundle 6.
  gh=maurino72. Worktree off origin/main @1d5f458. Real npm ci. FINAL bundle.

## Task interpretation
- **Deliverable:** 5 GA4 events (pricing_viewed, checkout_click_standard/pro, call_booked,
  faq_opened) via a typed track() helper; perf mitigation to trim first-party home JS; next/image
  audit; PRD §8 acceptance battery.
- **Acceptance:** events fire; JS budget met OR operator sign-off; PRD §8 items demonstrated.

## Decisions made unilaterally
- track() helper (src/lib/analytics.ts) no-ops when window/gtag absent. Events wired in leaf client
  components; pricing DATA stays server-rendered (only handlers client): pricing_viewed via an
  IntersectionObserver marker (PricingViewedTracker) in the server Pricing section; checkout_click_*
  via TrackedLink on the tier Stripe CTAs (event passed as a prop from Pricing by tier.id);
  call_booked on the CalPopupButton click; faq_opened on FAQ expand.
- **Perf mitigation:** lazy-load @calcom/embed-react on interaction (CalPopupButton dynamic import →
  0.8 KB async chunk, not referenced by home HTML); move sonner off the critical path (LazyToaster
  via next/dynamic ssr:false + deferred `toast` import in ContactForm). Result: 197.7 → 190.3 KB gz.
- **next/image audit:** NO raster <img> is rendered anywhere (logo-footer.png is only a JSON-LD logo
  URL string); nothing to convert. SVGs stay as-is. (No-op, documented.)

## Perf gate — framework floor analysis
- Baseline first-party home JS: 197.7 KB gz (11 chunks). After mitigation: 190.3 KB gz (12 chunks).
- Chunk identities: react-dom 65.5 + Next app-router runtime 38.5 + React core 24.8 + router/
  IntersectionObserver 22.3 = ~151 KB gz of UNAVOIDABLE framework (React 19 + Next 16 + React
  Compiler). The 150 KB gz budget sits BELOW this floor — unreachable without a stack change
  (react-dom alone is 65.5 KB gz).

## Operator decision (perf gate)
- 2026-07-27 — Bruno chose "Relax target, merge F" (AskUserQuestion): signed off on relaxing the
  150 KB hard-gate and merging Bundle F with 190.3 KB gz (real mitigation landed). Recommend
  re-baselining the perf budget to a realistic value / a Lighthouse-Perf-based gate. This is the
  explicit sign-off the HANDOFF's hard-gate rule requires — NOT a silent pass.

## Stop attempts / Drift flags / Round-skip requests
_(none — the perf gate was an authorized operator-decision pause, not a stop attempt)_

## Review findings + resolutions
_(Phase 4/5)_

## Areas examined and rejected
_(battery)_

## Open items NOT addressed in this PR
- Perf budget re-baseline (operator follow-up per Bruno's decision). Lighthouse CLI not run locally
  (env); OG/opengraph.xyz/LinkedIn are post-deploy checks. Contact section copy still consultative
  (out of scope). No open plan commitments (B1-D-jsonld1 closed in Bundle E).

## Durable handles
- marker: /Users/brunomaurino/.claude/autonomous-active/autonomous-task-feat-codirity-bf-analytics-perf
- worktree: /Users/brunomaurino/projects/codirity-bf-analytics-perf
- worktree_entry: path
- cron: (none — bundle-loop owns the resume-watchdog; --bundle-id set)
