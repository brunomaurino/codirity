import { SITE_NAME, SOCIAL_LINKS, getSiteUrl } from "@/lib/site";

/**
 * Organization structured data (JSON-LD), injected server-side so crawlers see it
 * in the initial HTML.
 *
 * NOTE: `Service` (with `offers` for both tiers) and `FAQPage` structured data are
 * intentionally DEFERRED to Bundle E, where the offer config (`offer.ts`) and the
 * FAQ content exist as a single source of truth — building them here would mean
 * duplicating (and risking desync of) pricing/FAQ strings that do not yet live in
 * the repo. Only the stable Organization block ships in Bundle A.
 */
export function OrganizationJsonLd() {
  const base = getSiteUrl();

  const data = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: base,
    logo: `${base}/logo-footer.png`,
    sameAs: SOCIAL_LINKS,
  };

  return (
    <script
      type="application/ld+json"
      // Static, developer-authored object — no user/request input is interpolated.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
