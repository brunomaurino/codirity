# Autonomous run — Bundle A (SEO & metadata)

Started: 2026-07-24T16:22:06Z

## Task description

Bundle A of the Codirity subscription rebuild (plan: subscription-rebuild). Deliver the SEO/metadata
foundation: Next Metadata API (env-aware metadataBase, canonical, openGraph 1200x630, twitter
summary_large_image), a generated 1200x630 OG image, sitemap.ts (home + /privacy), robots.ts,
vercel.json security headers, JSON-LD Organization (Service.offers + FAQPage deferred to Bundle E),
single <h1>, and positioning-NEUTRAL title/description (subscription-forward flip is Bundle D's).

## Execution context

- Probes reused from Bundle 0 (same session/build): Workflow+Agent present & callable, args
  round-trip=YES, effortTiers=true, customAgents=false, worktreeNative=true. Re-running the probe
  Workflow would be redundant in-session.
- Origin-bundle prefix: B1 (--bundle-id 1). Plan-qualified identifier: subscription-rebuild Bundle 1.
- gh account: maurino72 (re-assert before every gh write — reverts to brunoiwp intermittently).
- Worktree cut off origin/main @877c4e1 (includes Bundle 0). Real npm ci (no symlink — Turbopack).

## Task interpretation

- **Concrete deliverable:** `src/lib/site.ts` (env-aware site URL helper); full Metadata API in
  `src/app/layout.tsx`; `src/app/opengraph-image.tsx` (1200x630 ImageResponse, brand palette +
  Codirity wordmark); `src/app/sitemap.ts` (home + /privacy); `src/app/robots.ts`; `vercel.json`
  (security headers only); `src/components/seo/JsonLd.tsx` (Organization) wired into layout.
- **Acceptance test:** built HTML contains og:title/og:image (1200x630)/twitter:card; /sitemap.xml
  and /robots.txt return 200; JSON-LD parses/validates; exactly one <h1>; title/description are
  positioning-neutral (no "subscription"/"pricing"/"consultation"). lint + tsc + next build green.

## Plan

- `src/lib/site.ts`: `getSiteUrl()` = NEXT_PUBLIC_SITE_URL → (VERCEL_ENV=production &&
  VERCEL_PROJECT_PRODUCTION_URL) → VERCEL_URL → `https://www.codirity.com`. So og:image resolves on
  PREVIEW (VERCEL_URL) and canonical is prod on production. `SITE_NAME`, `SOCIALS` for sameAs.
- layout.tsx metadata: metadataBase=new URL(getSiteUrl()), title/description (neutral),
  alternates.canonical "/", openGraph {title,description,url,siteName,type:website,images 1200x630},
  twitter {card:summary_large_image,title,description,images}. Keep the Bundle 0 themeInitScript.
- opengraph-image.tsx: `size={width:1200,height:630}`, `contentType='image/png'`, ImageResponse with
  brand-dark bg + "Codirity" wordmark + brand dot + neutral tagline. next/og (built-in).
- sitemap.ts: [ '/', '/privacy' ] with lastModified. robots.ts: allow all, sitemap absolute.
- vercel.json: headers X-Content-Type-Options nosniff, X-Frame-Options SAMEORIGIN, Referrer-Policy
  strict-origin-when-cross-origin, conservative Permissions-Policy. No secrets/env logic.
- JsonLd.tsx (server): Organization {name,url,logo,sameAs LinkedIn+X}. Rendered in layout body.

## Decisions made unilaterally

- OG image via dynamic `opengraph-image.tsx` (ImageResponse) rather than a committed binary PNG:
  Next-native, no binary asset to hand-generate, brand-consistent, and auto-used as the twitter
  image fallback. D4 says "under public/ or opengraph-image.tsx" — chose the latter.
- metadataBase env resolution prioritizes NEXT_PUBLIC_SITE_URL (prod canonical), then prod domain
  only when VERCEL_ENV=production, else VERCEL_URL (so PREVIEW og:image resolves to the preview, not
  a 404 against prod), else hardcoded prod fallback (per §4a).
- Positioning-neutral copy: describe the company (AI/automation engineering), no subscription/pricing
  and no "book a consultation" (the consultative phrase is removed here; subscription-forward is D).
- Service.offers + FAQPage JSON-LD DEFERRED to Bundle E (needs offer.ts + FAQ). Organization ships now.

## Stop attempts
_(none)_

## Drift flags
_(none — carrying Bundle 0 operating notes)_

## Round-skip requests
_(none)_

## Review findings + resolutions

Battery `wf_d48f5463-d66` (2 adv + 2 QA, verify-voters=2): 4 raw → 2 unique → 2 confirmed, 0
refuted, 0 deferrals, 55 areas examined. Both MAJOR (2/2), both APPLIED:

1. **MAJOR — /privacy title double-suffix.** The new `title.template "%s | Codirity"` wrapped
   /privacy's literal `"Privacy Policy | Codirity"` → `"Privacy Policy | Codirity | Codirity"`.
   FIX: /privacy title → `"Privacy Policy"` (template adds the suffix once). Verified: /privacy
   now emits `<title>Privacy Policy | Codirity</title>`.
2. **MAJOR — canonical/og:url `"/"` inherited by /privacy.** Root layout hardcoded
   `alternates.canonical:"/"` + `openGraph.url:"/"`; Next's shallow metadata merge propagated the
   homepage canonical to /privacy (de-index risk). FIX: removed canonical + openGraph.url from the
   root layout; set canonical PER-PAGE — home `page.tsx` `canonical:"/"`, `privacy/page.tsx`
   `canonical:"/privacy"`. og:url left unset site-wide (a missing og:url is safe; scrapers use the
   fetched URL — a WRONG og:url was the problem). Verified: home canonical=`.../`,
   privacy canonical=`.../privacy`.

Post-apply re-verify: lint + tsc + build green; both pages emit correct title + canonical; og:image
+ og:title still present (shared from layout).

## Areas examined and rejected

From battery `areasExamined` (55 entries; distinct areas consolidated):
- **env-aware getSiteUrl + preview og:image** — Next overrides metadataBase with VERCEL_URL for the
  static OG route on preview and uses the prod domain on production; priority matches §4a matrix.
- **twitter:image auto-fallback** — twitter block omits `images`, so Next back-fills it from
  openGraph.images (populated by the opengraph-image.tsx file convention). summary_large_image resolves.
- **openGraph static image injection** — og:image + width/height/alt emitted from the file convention;
  type/siteName/title/description present.
- **JSON-LD Organization validity** — valid schema.org Organization; logo → /logo-footer.png (present);
  static object, no injection risk.
- **positioning-neutral copy** — no subscription/pricing/consultation; old consultation string removed.
- **sitemap/robots** — home + /privacy only (no /terms); robots allows '/', absolute sitemap URL, host valid.
- **vercel.json** — valid schema, source '/(.*)', the four §4a security headers, no secrets/env logic.
- **SSR render regression (Bundle 0)** — tree still renders (no mount-gate); JsonLd is a server-component
  script sibling. Single h1 preserved.
- **type/build safety** — tsc --noEmit exit 0 across all new files. OG image served 200 image/png 1200x630.

## Open items NOT addressed in this PR

- Service.offers + FAQPage JSON-LD → deferred to Bundle E (depends on offer.ts + FAQ). Tracked in
  commitments.md. Noted in PR body per HANDOFF "no silent drop".

## Durable handles
- marker: /Users/brunomaurino/.claude/autonomous-active/autonomous-task-feat-codirity-ba-seo
- worktree: /Users/brunomaurino/projects/codirity-ba-seo
- worktree_entry: path
- cron: (none — bundle-loop owns the resume-watchdog; --bundle-id set)
- battery_run_id: wf_d48f5463-d66 (Phase 4/5/5.5)
