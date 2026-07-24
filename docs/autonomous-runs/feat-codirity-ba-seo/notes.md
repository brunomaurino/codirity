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
_(Phase 4/5)_

## Areas examined and rejected
_(from battery)_

## Open items NOT addressed in this PR

- Service.offers + FAQPage JSON-LD → deferred to Bundle E (depends on offer.ts + FAQ). Tracked in
  commitments.md. Noted in PR body per HANDOFF "no silent drop".

## Durable handles
- marker: /Users/brunomaurino/.claude/autonomous-active/autonomous-task-feat-codirity-ba-seo
- worktree: /Users/brunomaurino/projects/codirity-ba-seo
- worktree_entry: path
- cron: (none — bundle-loop owns the resume-watchdog; --bundle-id set)
