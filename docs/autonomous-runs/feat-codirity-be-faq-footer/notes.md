# Autonomous run — Bundle E (FAQ + JSON-LD + Book a call + Footer, S7–S9)

Started: 2026-07-24T20:10:13Z

## Execution context
- Probes reused (session-stable). Prefix B5 (--bundle-id 5). id: subscription-rebuild Bundle 5.
  gh=maurino72. Worktree off origin/main @1530338. Real npm ci.
- CLOSES commitment B1-D-jsonld1 (Service.offers + FAQPage JSON-LD, deferred from Bundle A).

## Task interpretation
- **Deliverable:** FAQ accordion (leaf client component from offer.faq) with a "Prefer to talk
  first?" Book-a-call (S8); Service.offers + FAQPage JSON-LD (single source = offer.faq/offer.tiers)
  in JsonLd.tsx; Footer S9 (BOMAU LLC + Codirity + privacy-only + contact email, from offer.ts).
- **Acceptance:** FAQ opens/closes client-side; questions in server HTML; FAQPage + Service JSON-LD
  validate and match offer.faq/offer.tiers exactly; footer links resolve; single <h1>; build green.

## Plan / Decisions
- **offer.ts:** add `sections.faq` header copy (consistent with the sections pattern).
- **JsonLd.tsx:** add `ServiceJsonLd` (Service with `offers`: each tier → an Offer {price:priceAmount,
  priceCurrency:CURRENCY, name, url, category}) + `FaqPageJsonLd` (FAQPage: offer.faq → Question/
  acceptedAnswer). Both server-side, static JSON.stringify. Update Organization deferral note (done).
- **Faq.tsx (new, "use client"):** accordion from offer.faq, useState per-item open/close; questions
  render server-side (client comps SSR their initial markup). Section header from sections.faq.
  Fold S8 Book-a-call at the bottom: "Prefer to talk first?" + CalPopupButton(CAL_LINK) — optional.
  id="faq".
- **page.tsx:** render `<ServiceJsonLd/>` + `<FaqPageJsonLd/>` (home only, server) + add `<Faq/>`
  after Pricing (S6→S7). FAQPage co-located with the on-page FAQ ⇒ matches by construction.
- **Footer.tsx:** source BRAND/LEGAL_ENTITY/CONTACT_EMAIL from offer.ts; add "BOMAU LLC" + a mailto
  contact-email link to the bottom bar; keep Privacy-only (no ToS, D6). Leave nav links as-is.
- Leave Contact section as-is (out of S7–S9 scope); do NOT add a 2nd <h1> (Faq/Footer use h2/h3).

## Stop attempts / Drift flags / Round-skip requests
_(none)_

## Verification (Phase 6 evidence)

- lint + tsc + build green; `/` prerenders static; single <h1>.
- **FAQ (server HTML + client):** questions + answers all in script-stripped HTML (answers kept in
  DOM, CSS-collapsed — crawlable + matches JSON-LD). Accordion works client-side (DOM test: 6 items,
  first open by default, click toggles single-open, click-again closes). "Prefer to talk first?" +
  "Book a call" CalPopupButton present.
- **JSON-LD (3 blocks: Service, FAQPage, Organization):** Service.offers = [(Standard,3995,USD),
  (Pro,6995,USD)] from offer.tiers.priceAmount+CURRENCY; FAQPage = 6 Questions incl. "Who does the
  work?" from offer.faq — both parse valid, match on-page copy by construction (same offer.ts arrays).
  Closes B1-D-jsonld1.
- **Footer S9:** "BOMAU LLC" + Codirity brand (from offer) + contact email (mailto support@codirity.com)
  + Privacy Policy link ONLY (no ToS/Terms — D6). All from offer.ts.

## Review findings + resolutions
_(Phase 4/5)_

## Areas examined and rejected
_(battery)_

## Open items NOT addressed in this PR
- Contact section still consultative copy (out of S7–S9 scope; could align in a follow-up). Bundle F
  is analytics + perf close-out + acceptance.

## Durable handles
- marker: /Users/brunomaurino/.claude/autonomous-active/autonomous-task-feat-codirity-be-faq-footer
- worktree: /Users/brunomaurino/projects/codirity-be-faq-footer
- worktree_entry: path
- cron: (none — bundle-loop owns the resume-watchdog; --bundle-id set)
