# HANDOFF — Codirity Subscription Rebuild (execution plan)

**Derived from:** PRD "Codirity.com Rebuild: Productized Subscription Launch" (Bruno, v1, 2026-07-23)
**Author of handoff:** Claude Code · **Date:** 2026-07-24
**Repo:** `~/projects/codirity` (Next.js 16, App Router) · **Deploy:** Vercel (`www.codirity.com`)
**Consumer:** `/autonomous-task` (one bundle = one PR) and human review.

> This handoff is the buildable version of the PRD. Where the PRD's stated evidence no longer
> matches the live code, this document records the **verified current state** and re-scopes the
> work accordingly. Read §1 before trusting the PRD's problem list.

---

## 1. Phase 0 — Discovery findings (VERIFIED against code + live site, 2026-07-24)

Method: read the repo (`src/`), grepped `"use client"` boundaries, and curled the live site
(`curl -sL https://www.codirity.com/`). Evidence is inline below.

### 1.1 Stack (Verified)
- **Next.js 16.0.10, App Router** (`src/app/`), React 19.2 with React Compiler (`reactCompiler: true`).
- Tailwind CSS 4 (`@tailwindcss/postcss`), TypeScript strict, ESLint 9 (`eslint-config-next`).
- Fonts already self-hosted via `next/font/google` (Outfit + Space Mono) in `src/app/layout.tsx`.
- Cal.com already integrated via `@calcom/embed-react` (`src/components/ui/CalPopupButton.tsx`),
  current link constant `support-codirity-lz8rjc/30min`.
- GA4 already integrated (`src/components/analytics/GoogleAnalytics.tsx`, env
  `NEXT_PUBLIC_GA_MEASUREMENT_ID`, live id `G-L33EC99DTX`).
- Contact form + `nodemailer` API route at `src/app/api/contact/route.ts` (SMTP via env).

### 1.2 Rendering — the PRD's P1 premise is CORRECT; the served body IS empty (Verified, load-bearing)

> **Correction (2026-07-24, after spec-review + independent re-verification).** An earlier draft of
> this section claimed the site already server-renders and dismissed P1 as stale. **That was wrong.**
> It misread the RSC flight payload (copy inside `<script>` strings) as rendered DOM. The PRD's P1 is
> substantively **right**: the served `<body>` contains no rendered content.

**Root cause — a client mount-gate nulls the whole tree on the server pass.**
`src/components/theme/ThemeProvider.tsx:99-101` does `if (!mounted) return null;`, and
`src/app/layout.tsx` wraps the **entire** app (`Header`, `main`/children, `Footer`) inside
`<ThemeProvider>`. On the server (and first paint) `mounted` is false, so ThemeProvider returns
`null` and **nothing under it renders to HTML**. Content only appears after the client hydrates.

Evidence (verified 2026-07-24):
- `ThemeProvider.tsx:99-101`: `if (!mounted) { return null; }` — confirmed in source.
- Live `curl https://www.codirity.com/`: 50,215 bytes total, but **only 1,484 bytes of non-`<script>`
  markup**; the body is literally `<body ...><div hidden><!--$--><!--/$--></div></body>`. Grep of the
  script-stripped HTML: **0 `<h1>`, 0 `<header>`, 0 `<main>`, 0 `<footer>`.** All copy lives only in
  `self.__next_f` flight-payload script strings — which social scrapers and non-JS crawlers do not run.
- `next build` marks `/` as `○ (Static)` — but "static" here means a prerendered shell whose body is
  empty, because the mount-gate nulls the tree at prerender time. Static ≠ content-in-HTML.
- Note: the individual section files (`Hero`, `Services`, …) *are* server components with no
  `"use client"`; that is real but irrelevant while their common ancestor `ThemeProvider` returns
  `null` server-side. The children-as-props reasoning applies to `RevealProvider` (inner) but was
  wrongly extended past the **outer** `ThemeProvider` gate.

**Implication for TR-1 (real work, not a no-op).** TR-1 is genuine: the mount-gate must be removed so
the tree renders server-side. Standard fix: **never `return null`** for a flash-prevention gate —
render `children` always, and prevent the theme flash with a small blocking inline script in
`<head>` that sets the **`data-theme` attribute** on `<html>` before paint, relying on the
`suppressHydrationWarning` already present on `<html>`. **Set the attribute, NOT a class** — the app
themes exclusively off `[data-theme="dark"]` (`globals.css:4,54`) and `ThemeProvider` applies it via
`root.setAttribute("data-theme", resolved)` (`ThemeProvider.tsx:48-49`); a script that toggles a
`.dark` class would target a selector nothing reads and the flash would persist. This is the highest-risk piece of the whole
project (§Standing-orders: deepest verification goes here) and **gates P2's value** — OG/JSON-LD are
worthless to scrapers if the body is JS-only. It ships **first** as Bundle 0 (see §3).

### 1.3 SEO / metadata — P2 is REAL (Verified)
- **No Open Graph or Twitter Card tags** in the live HTML (`grep 'og:' / 'twitter:'` → 0 hits).
  Confirms P2. LinkedIn/X/Slack previews render blank.
- `metadata` in `layout.tsx` sets only `title` + `description` (still the old consultative copy).
- **No `robots.txt`, no `sitemap.xml`** (`src/app/robots.*` / `sitemap.*` absent, `public/robots.txt` absent).
- **No JSON-LD** structured data anywhere.
- Homepage has exactly one `<h1>` (in `Hero.tsx`), so the single-h1 requirement is already close.

### 1.4 Positioning / funnel — P3 is REAL (Verified)
- CTA is still consultative: 3 consultation CTAs render (2× "Book a free consultation" + 1× "Book a
  free 30-minute consultation call" in `ContactInfo.tsx`).
- **Pricing section is a single "Let's Talk / Book a Call" card** (`src/components/sections/Pricing.tsx`)
  — no tiers, no monthly price, no Stripe, no checkout.
- No Stripe dependency, no `src/config/` directory, no offer source-of-truth.
- Existing sections map loosely to the new spec: `Hero`→S1, `Process`→S2, `Services`→S3,
  `About`→credibility, `Pricing`→S6, `Contact`→S8. They are **reusable scaffolding**, not throwaway.

### 1.5 Net re-scope
| PRD item | PRD framing | Verified reality (2026-07-24) | Action |
|---|---|---|---|
| TR-1 Rendering | Migrate from CSR | **Body IS empty — ThemeProvider mount-gate nulls the tree server-side** | **Remove the mount-gate so the tree server-renders — Bundle 0, ships FIRST** |
| TR-2 SEO/OG | Missing | Confirmed missing | Build it (Bundle A) — real P0, but depends on Bundle 0 for scraper-visible HTML |
| TR-3 Perf | Budget | **Measured 195.5 KB gz first-party JS on `/` — already OVER the 150 KB gate**, before gtag.js | Real work: baseline now, trim early (not deferred to F) |
| TR-4 Analytics | Prefer Plausible, avoid GA4 unless in use | **GA4 already in use** | Decision D1; instrument events either way |
| P3 Subscription | New model | Consultative single card | Full rebuild (Bundles C–E) |

> **Two of this discovery's original "verified" claims were wrong** (SSR already done; light JS) and
> were caught by spec-review + re-measurement. Treat every "already fine" in a discovery doc as a
> claim to re-verify with script-stripped HTML / a real build, not prose.

---

## 2. Ground rules for the build

1. **Single source of truth for the offer.** All pricing, tiers, founding rate, Stripe Payment
   Link URLs, Cal link, scope lists (included / not included), benefits, and FAQ content live in
   **`src/config/offer.ts`** as typed constants. Components import from it. **Never hardcode a
   price, URL, or FAQ string in a component** (PRD execution note, non-negotiable).
2. **Env-configured external URLs.** Stripe Payment Links via
   `NEXT_PUBLIC_STRIPE_LINK_STANDARD`, `NEXT_PUBLIC_STRIPE_LINK_PRO`,
   `NEXT_PUBLIC_STRIPE_LINK_FOUNDING`. `offer.ts` reads these with safe placeholder fallbacks so
   the site builds without real URLs in v1. Document them in `.env.example`.
3. **Server components by default; interactivity in leaf client components only** (FAQ accordion,
   mobile nav, any pricing toggle). Page-level components stay server components.
4. **All copy in English (US market).** Draft copy in the PRD §5 is directional — refine tone to
   confident/direct, zero agency-speak (reference: designjoy.co).
5. **Gate list per touched file:** `npm run lint` AND `npx tsc --noEmit` AND `npm run build`
   must pass. `next build` is a gate (it prerenders and would surface an accidental
   `"use client"` at page level). Re-run after every file, tests included if any are added.
6. **Design system:** follow `docs/design-system.md` — brand green palette, Outfit/Space Mono,
   rounded-full buttons, rounded-3xl cards, Lucide icons. Reuse existing `ui/` + `layout/` primitives.
7. **One bundle = one PR**, small and independently reviewable. **Bundle 0 (render fix) ships
   first** — without it, Bundle A's OG/JSON-LD are invisible to scrapers. Bundle A ships second.
8. **Rendering is verified against script-stripped HTML, never raw byte count.** The acceptance for
   any rendering claim is: `curl <url> | strip <script> tags | grep '<h1'` returns the real H1 (and
   `<header>/<main>/<footer>` are present). Content inside `self.__next_f` flight-payload scripts
   does **not** count as rendered.
9. **Merge policy — FULL AUTO-MERGE, authorized by Bruno in-session 2026-07-24.** `main` is unprotected
   and Vercel auto-deploys, so every merge ships to prod live. Bruno **explicitly authorized unattended
   auto-merge for all 7 bundles (0→F), no per-bundle checkpoint** — this in-session authorization clears
   the auto-mode self-merge guardrail. Each bundle still merges only on a **green gate** (lint + tsc +
   `next build`) and after its `/autonomous-task` review battery. Push/PR identity is **`maurino72`**
   (collaborator on `brunomaurino/codirity`); scope **every** `gh` call
   `GH_TOKEN=$(gh auth token -u maurino72) gh …` (the active shell account may be a different one —
   never rely on it). Git push already uses maurino72's SSH key.

---

## 3. Bundles (each = one PR)

Ordered by dependency. **Bundle 0 unblocks A** (scraper-visible HTML); B unblocks C–E; F is the
final verification gate.

### Bundle 0 — Fix server rendering (TR-1, P0, ship FIRST) 🔴
The load-bearing fix. Until this lands, the served `<body>` is empty (§1.2) and every SEO/OG gate is
unsatisfiable.
- Remove the `if (!mounted) return null;` mount-gate in `src/components/theme/ThemeProvider.tsx:99-101`.
  Render `children` unconditionally.
- Prevent the theme flash the gate was guarding against with a **blocking inline script** in `<head>`
  (`src/app/layout.tsx`) that reads the persisted theme / `prefers-color-scheme` and sets the
  **`data-theme` attribute** (`"light"`/`"dark"`) on `<html>` before first paint — **matching how the
  app reads theme** (`[data-theme="dark"]` in `globals.css`; `ThemeProvider.tsx:48-49`
  `root.setAttribute("data-theme", …)`). **Do not toggle a CSS class** — nothing reads it. `<html>`
  already has `suppressHydrationWarning`. (~15-line inline script; no new dependency needed.)
- Verify no other client component in the layout ancestry gates its subtree on a mount/`useEffect`
  flag the same way (grep for `mounted`, `return null`, `typeof window`). ThemeProvider is the known
  one; confirm it is the only one.

**Acceptance 0 (blocking, per ground-rule 8):** `curl <preview-url>` piped through a `<script>`-stripper
shows the real `<h1>` ("…"), plus `<header>`, `<main>`, `<footer>`, and section copy — verified on the
Vercel **preview** deployment, not just localhost. Theme still applies with no flash on load in both
schemes. `next build` green.

### Bundle A — SEO & metadata foundation (P0, ship after Bundle 0)
Delivers TR-2. **Depends on Bundle 0** — OG cards and JSON-LD are worthless to non-JS scrapers until
the body renders server-side.
- Rewrite `metadata` in `layout.tsx` using the Next.js Metadata API: `title`, `description`,
  `metadataBase`, canonical (`alternates.canonical`), `openGraph` (`title`, `description`,
  `url`, `siteName`, `type: website`, `images: [{ url, width: 1200, height: 630, alt }]`),
  `twitter` (`card: summary_large_image`, `title`, `description`, `images`).
- Add an OG image asset (1200×630) under `public/` (or a dynamic `opengraph-image.tsx`). If no
  brand asset is supplied, generate a placeholder from brand palette + wordmark (Decision D4).
- Add `src/app/sitemap.ts` (home + `/privacy` only — no ToS entry in v1, D6) and
  `src/app/robots.ts` (allow all, point `sitemap` to the absolute URL).
- Add a minimal `vercel.json` with **security headers only** (§4a): `X-Content-Type-Options`,
  `X-Frame-Options: SAMEORIGIN`, `Referrer-Policy`, a conservative `Permissions-Policy`. No secrets,
  no env logic.
- Add JSON-LD via a server component injecting `<script type="application/ld+json">`:
  `Organization` (name, url, logo, sameAs), `Service` (with `offers` for both tiers — reads from
  `offer.ts` once Bundle B lands; until then, a minimal Organization block is acceptable and
  FAQPage/Service are completed in Bundle E). **Do not duplicate FAQ/pricing strings** — import
  from `offer.ts` when available.
- Semantic HTML pass: confirm exactly one `<h1>`, ordered heading hierarchy, descriptive `alt`
  on images.
- Fix the stale `title`/`description` copy (currently "Book a free consultation").
  **Guardrail (spec-review finding):** the current body is still consultative (no pricing tiers)
  until Bundles C/D land. Bundle A's `title`/`description`/OG **copy must stay positioning-neutral**
  (describe the company, not "subscription / pricing") so the OG card LinkedIn caches does not
  contradict the live body during the C→D window. Flip to subscription-forward OG copy in the
  bundle that ships the new positioning (C/D), not here.
- **`metadataBase` must be environment-aware:** use the Vercel-provided URL
  (`process.env.VERCEL_URL` / `VERCEL_PROJECT_PRODUCTION_URL`) with a production fallback, so
  `og:image` resolves on preview deployments instead of 404-ing against a hardcoded production URL.

**Acceptance A — split by when it is checkable (spec-review finding):**
- *Pre-merge (runnable in the build loop):* built HTML contains `og:title`, `og:image` (1200×630),
  `twitter:card`; `/sitemap.xml` and `/robots.txt` return 200; JSON-LD validates against a local
  schema check; single `<h1>`. These are the bundle's pass/fail gate.
- *Post-deploy (verify on the preview/prod URL after merge, NOT a merge blocker):* OG renders on
  opengraph.xyz + LinkedIn Post Inspector. Run this on the deployed preview URL (or prod after
  merge) since those tools require a public URL; a miss here is a follow-up, tracked in the PR, not
  a silent pass.

> Note: Bundle A can precede Bundle B. If so, land Organization + basic OG now and complete the
> `Service.offers` + `FAQPage` JSON-LD in Bundle E when `offer.ts` and the FAQ exist. Flag the
> deferral explicitly in the PR body (no silent drop).

### Bundle B — Offer config (source of truth, pure data, no UI)
- Create `src/config/offer.ts` exporting typed constants:
  - `tiers`: Standard ($3,995/mo, 1 active task) and Pro ($6,995/mo, 2 active tasks, priority),
    each with unlimited requests/revisions, pause/cancel anytime, feature list, and a
    `stripeUrl` read from env.
  - `foundingRate`: `{ active: true, price: '$2,995/mo', slots: 5, label: 'first 5 clients, price locked for life' }`.
    The `active` flag gates the home launch banner (D7): when the 5 slots fill, set `active=false`
    (one-line change) to remove the banner with no redesign. The banner reads as a limited founding
    offer layered on the $3,995/$6,995 anchor, never as the headline price.
  - `guarantee`: "Try it for a week. Not convinced? Get 75% back, no questions asked."
  - `included` / `notIncluded` scope lists (PRD §S3, verbatim item sets).
  - `benefits` grid (PRD §S4).
  - `howItWorks` 3 steps (PRD §S2).
  - `faq`: array of `{ question, answer }` (PRD §S7 minimum set).
  - `calLink`, contact email, legal entity string (Decision D3).
- Env plumbing: `NEXT_PUBLIC_STRIPE_LINK_STANDARD` / `_PRO` / `_FOUNDING` with placeholder
  fallbacks; add all to `.env.example` with comments.
- **No component changes in this bundle** — data only, so it reviews fast and unblocks B–E.

**Acceptance B:** `offer.ts` typechecks; importing it in a throwaway test/route yields the
expected shapes; `.env.example` documents the three Stripe vars.

### Bundle C — Hero + How it works + What we build + Benefits (S1–S4)
- Rebuild/adapt `Hero` (S1): new H1 "Your AI & automation team, on subscription.", sub-copy,
  primary CTA "See pricing" (anchor `#pricing`), secondary "Book a 15-min intro call" (Cal),
  trust line "Built by engineers from Globant & Ualá".
- `Process`→ "How it works" (S2), 3 steps from `offer.howItWorks`.
- `Services`→ "What we build" (S3): included + explicit not-included lists from `offer.ts`.
- New "Membership benefits" grid (S4) from `offer.benefits`.
- All server components; reuse `Section`/`Container`/`Card`/`Badge`. Keep reveal animation classes.

**Acceptance C:** sections render server-side (script-stripped HTML per ground-rule 8); copy sourced
from `offer.ts`; single `<h1>`; renders at 375/768/1440px.

> **C→D sequencing (spec-review finding).** Bundle C ships a subscription hero ("See pricing" → `#pricing`)
> while the old consultative "Let's Talk" card is still live until Bundle D merges. `#pricing` always
> resolves to a real section (no dead anchor), so the only risk is a transient positioning mismatch.
> **Merge C and D contiguously** (D immediately after C) to keep that window short; do not leave the
> subscription hero live over the consultative card across unrelated work.

### Bundle D — Pricing (S6) with Stripe + Recent work (S5)
- Replace the single "Let's Talk" card with a **two-tier pricing block** (Standard | Pro) from
  `offer.tiers`; each tier CTA links to its Stripe Payment Link (env). Founding-rate launch
  banner above the grid; guarantee block below.
- Pricing toggle (if any) is a leaf client component; the pricing data stays server-rendered.
- "Recent work" (S5): 3–6 case cards with a typed placeholder structure in `offer.ts`
  (`caseStudies`), content supplied by Bruno later (Decision D5).

- **Flip the metadata/OG copy to subscription-forward** (the deferral from Bundle A's positioning-neutral
  guardrail, §Bundle A). Update `title`/`description`/`openGraph` in `layout.tsx` to the subscription
  positioning now that the pricing is live. **This deliverable is owned here** (spec-review finding: it
  was previously deferred to "C/D" with no owning bundle — do not silently drop it); note it in the PR body.

**Acceptance D:** both tier CTAs open the configured Stripe URLs (placeholder URLs acceptable in
v1, verified to be `href`-wired from env); founding banner + guarantee render; pricing copy from
`offer.ts` only; metadata/OG copy is subscription-forward (deferral from Bundle A closed).

### Bundle E — FAQ (S7) + JSON-LD FAQPage + Book a call (S8) + Footer (S9)
- FAQ accordion as a **leaf client component**, data from `offer.faq`; the same array feeds the
  `FAQPage` JSON-LD (single source, no duplication). Include the "Who does the work?" answer
  (solo senior engineer, AI-accelerated — owned openly).
- Complete `Service.offers` + `FAQPage` JSON-LD deferred from Bundle A.
- "Book a call" (S8): reuse `CalPopupButton`, framed as optional ("Prefer to talk first?").
- Footer (S9): legal entity **"BOMAU LLC"** + brand **"Codirity"** (D3), **Privacy link only** (no ToS
  link in v1, D6), contact email. `/privacy` already exists.

**Acceptance E:** FAQ opens/closes client-side; `FAQPage` + `Service` JSON-LD validate and match
the on-page copy exactly; footer links resolve.

### Bundle F — Analytics events + performance close-out + acceptance gate
- Instrument TR-4 events (`pricing_viewed`, `checkout_click_standard`, `checkout_click_pro`,
  `call_booked`, `faq_opened`) on the platform chosen in Decision D1.
- `next/image` audit for any raster images; final client-JS measurement.
- Run the full acceptance battery (PRD §8): script-stripped copy check (ground-rule 8), OG
  validators, Lighthouse mobile (Perf ≥ 90, SEO ≥ 95, A11y ≥ 90), responsive 375/768/1440, all events fire.

**Acceptance F:** PRD §8 items 1–7 each demonstrated with evidence (numbers/screenshots/links in
the PR body). Any miss is reported, not hidden.

**Performance is REAL work, and starts at Bundle 0 — not deferred to F (spec-review MAJOR finding).**
The homepage already ships **195.5 KB gz of first-party JS** (measured 2026-07-24 from `next build`,
11 chunks, before `gtag.js`) — **already over the 150 KB gz gate.** So:
- **Baseline now, measure per bundle.** `next build` on Next 16/Turbopack prints **no** First-Load-JS
  table, so add a lightweight repeatable size check (e.g. gzip the chunks referenced by the built home
  HTML) and record the number after Bundle 0 and after each subsequent bundle — do not discover the
  overage in the last PR.
- **Trim candidates:** the Cal.com embed (`@calcom/embed-react`) is the biggest lever — lazy-load /
  dynamic-import it so it isn't in the initial bundle; gate/defer `gtag.js`; drop `sonner` from the
  critical path if only used post-interaction.
- **Gate, not disclosure:** if final Perf < 90 or JS > 150 KB gz, Bundle F does **not** pass on
  "reported" alone — it lands concrete mitigation or gets an explicit Bruno sign-off to relax the
  target (Decision, not a silent pass). The prior "favorable baseline / light JS" assumption was
  **wrong** (§1.5) — plan for real trimming.

---

## 4. Decisions (RESOLVED 2026-07-24 with Bruno)

- **D1 — Analytics → keep GA4.** GA4 is already in use (`G-L33EC99DTX`); add the 5 TR-4 events on it.
  No Plausible in v1.
- **D2 — Stripe Payment Links → env placeholders in v1.** `offer.ts` reads
  `NEXT_PUBLIC_STRIPE_LINK_STANDARD/_PRO/_FOUNDING` with safe fallbacks; Bruno sets the real URLs as
  **Production-scoped** env vars in Vercel before launch (see §4a).
- **D3 — Brand + legal entity → CONFIRMED.** Brand name displayed: **Codirity**. Footer legal entity:
  **BOMAU LLC**. (Supersedes the br-brain "Codedly?" ambiguity — Codirity is canonical.)
- **D4 — OG image → generated placeholder.** 1200×630 from the brand palette + "Codirity" wordmark;
  Bruno can swap a designed asset later.
- **D5 — Case studies → typed placeholders** (`offer.caseStudies`); Bruno supplies real content later.
- **D6 — ToS → OMIT in v1 (recommended).** Ship only `/privacy`; **do not** add a ToS footer link or a
  `/terms` sitemap entry with placeholder legal text (placeholder legal copy on a payment-taking site
  is a liability). Tracked as a **pre-launch blocker**: add `/terms` with real counsel-reviewed copy
  before taking live payments. Sitemap lists home + `/privacy` only until then.
- **D7 — Pricing → CONFIRMED public.** Standard **$3,995/mo**, Pro **$6,995/mo**. Founding **$2,995/mo
  (first 5 clients, price locked for life)** — **published on the home as a launch banner**, behind a
  config flag (see Bundle B), framed as a limited founding offer *on top of* the $3,995/$6,995 anchor,
  never as the headline price. Flip `foundingRate.active=false` in `offer.ts` (one line) once 5 slots
  fill.

## 4a. Deploy / environment setup (Vercel)

- **No `vercel.json` is needed to separate dev/prod** — Vercel maps `main` → **Production** and every
  other branch → **Preview** automatically. Environment-specific values are **per-environment env vars
  in the Vercel dashboard**, not in `vercel.json`.
- **Add a minimal `vercel.json`** (Bundle A) for **security headers only** (e.g.
  `X-Content-Type-Options: nosniff`, `X-Frame-Options: SAMEORIGIN`, `Referrer-Policy`, a conservative
  `Permissions-Policy`). Keep it small; do not put secrets or env logic here.
- **`metadataBase` is environment-aware** (Bundle A): derive from `VERCEL_PROJECT_PRODUCTION_URL` /
  `VERCEL_URL` with a production fallback, so `og:image` resolves on Preview deploys.
- **Env-var matrix (Bruno sets in Vercel dashboard before launch):**
  | Var | Production | Preview |
  |---|---|---|
  | `NEXT_PUBLIC_GA_MEASUREMENT_ID` | real `G-…` | blank or a test id (avoid polluting prod analytics) |
  | `NEXT_PUBLIC_STRIPE_LINK_STANDARD/_PRO/_FOUNDING` | real Payment Links | placeholders (`#`) |
  | `NEXT_PUBLIC_SITE_URL` (canonical) | `https://www.codirity.com` | (unset → falls back to `VERCEL_URL`) |
  This is a **launch checklist item**, not build work — the build ships with placeholder fallbacks.

---

## 5. Out of scope (v1) — carried from PRD §7
Client portal/dashboard (Trello handles the queue), blog/CMS, i18n (English only), custom Stripe
checkout/coupons/seats, native mobile. Content lives in the repo as typed constants (`offer.ts`),
not a CMS.

---

## 6. Suggested execution flow
1. **Bundle 0 first** (render fix) — remove the ThemeProvider mount-gate so the body server-renders.
   Nothing SEO-related is real until this lands. Baseline the JS size here.
2. **Bundle A** (SEO/OG) — ship + verify OG on LinkedIn to unblock outreach (now scraper-visible).
3. **Bundle B** (offer config) — unblocks the redesign.
4. **Bundles C → D → E** (landing rebuild), small PRs; re-measure JS size each bundle.
5. **Bundle F** (analytics + perf close-out + acceptance gate) last.
Work per bundle in a dedicated branch/worktree; `code-review` the diff before each PR; live-smoke
the deployed preview (curl the **script-stripped** HTML for copy + OG — ground-rule 8) before
calling a bundle done.

## 7. Acceptance criteria (whole project) — PRD §8, unchanged
1. `view-source` of the deployed home contains full H1, pricing, and FAQ copy.
2. Valid OG/Twitter cards (opengraph.xyz + LinkedIn Post Inspector).
3. Lighthouse mobile: Perf ≥ 90, SEO ≥ 95, A11y ≥ 90.
4. Both pricing CTAs open Stripe Payment Links; call CTA opens Cal.com.
5. `sitemap.xml`, `robots.txt`, JSON-LD validate without errors.
6. Renders correctly at 375 / 768 / 1440 px.
7. All analytics events fire (verified in the chosen analytics debug view).
