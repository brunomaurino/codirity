# Off-page SEO plan — codirity.com (2026-10-02)

Trigger: a third-party audit flagged "Authority Score: no competitor data" and
"Nofollow vs Dofollow: insufficient data". Neither is a site defect. Both mean
the crawler found almost no sites linking to codirity.com. Off-page SEO is the
work of changing that: links, mentions and listings on OTHER sites.

Source for the channel list: `~/br-brain/WIKI/clients/_channels-2026-08-27-traffic.md`
(sweep of 2026-08-27). This plan orders it for backlinks rather than for traffic.

## Rules that apply to every item

- **Always submit `https://www.codirity.com`**, never the bare `codirity.com`.
  The apex answers with a 308 redirect to `www`, which Lighthouse measured at
  about 850 ms on mobile (2026-10-02), and the canonical tag already says `www`.
  A link to the canonical URL needs no redirect.
- **Same name, description and logo everywhere.** Use the site's meta
  description (`src/app/layout.tsx`, `SITE_DESCRIPTION`) as the short blurb.
- **No paid listings.** The budget is zero. DesignRush (from $1,500/yr),
  Clutch Verified ($499/yr) and GoodFirms PRO are out.
- **No empty profiles.** The audit asks for YouTube, Instagram and Facebook.
  Those are not ranking factors and are not where B2B buyers look. Open one only
  when there is content to put in it.
- When a profile goes live, add its URL to `SOCIAL_LINKS` in `src/lib/site.ts`.
  That list feeds the JSON-LD `sameAs`, which ties the profiles to the brand.

## Phase 1 — free directory listings (one afternoon, permanent links)

| # | Where | Cost | Status |
|---|---|---|---|
| 1 | Clutch — free profile | $0 | todo |
| 2 | GoodFirms — free registration | $0 | todo |
| 3 | UpCity — free basic profile | $0 | todo |
| 4 | productizedhq.com — exact category ("flat-price agencies") | unverified | todo |
| 5 | productizehub.com, productizedagencies.com | unverified | todo |
| 6 | Product Hunt product page — confirm it links to `www` | $0 | todo |
| 7 | LinkedIn company page and X profile — confirm the website field is `www` | $0 | todo |

Clutch and GoodFirms rank for "software development agency" searches on their own.
A listing there is both a backlink and a second page that can appear in results.
Client reviews on Clutch are worth asking for as soon as there is a client.

## Phase 2 — partner directories (applications, reviewed by the vendor)

| # | Where | Note |
|---|---|---|
| 8 | Stripe Partner Directory, Services track | Real qualifying work exists (Stripe subscriptions shipped for a client) |
| 9 | Vercel Partners, agency track | The site itself runs on Vercel |
| 10 | Zapier Solution Partner | Needs a certification exam first |
| 11 | n8n Experts | Closed pilot as of 2026-08-27; apply to join the queue |

## Phase 3 — links that are earned, not submitted

| # | What | Note |
|---|---|---|
| 12 | Answer journalist requests on Qwoted / Featured.com as the founder | Quotes in articles carry high-authority links |
| 13 | Publish anonymised Leak Report findings as an original data piece | Original numbers are what other writers cite and link |
| 14 | A small free tool or open-source repo that links home | Earns links without asking |
| 15 | Cross-post articles to dev.to / Hashnode with `canonical_url` pointing home | Needs a blog first (see the limit below) |

## The structural limit

`src/app/` has three indexable routes: `/`, `/privacy` and `/terms`. Every
backlink lands on the home page, and Google has nothing to rank except the brand
name. Phases 1 and 2 still help: they build authority and brand searches. Phase 3
needs pages worth linking to: a blog, case studies, or the Leak Report findings
as their own URL. That is a separate ticket and the next lever after the listings.

## How to know it is working

- Google Search Console, Links report: the count of linking sites goes up.
- Re-run the same audit in 30 days. "Authority Score" should return a number
  instead of "no competitor data".
