import { SITE_NAME, SOCIAL_LINKS, getSiteUrl } from "@/lib/site";
import { BRAND, CURRENCY, faq, tiers } from "@/config/offer";

/** Serializes a schema.org object into a server-rendered JSON-LD <script>. */
function JsonLdScript({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      // Static, developer-authored objects sourced from offer.ts — no user/request
      // input is interpolated, so there is no injection surface.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

/**
 * Organization structured data (site-wide; rendered from the root layout).
 */
export function OrganizationJsonLd() {
  const base = getSiteUrl();

  return (
    <JsonLdScript
      data={{
        "@context": "https://schema.org",
        "@type": "Organization",
        name: SITE_NAME,
        url: base,
        logo: `${base}/logo-footer.png`,
        sameAs: SOCIAL_LINKS,
      }}
    />
  );
}

/**
 * Service structured data with an `offer` per pricing tier. Prices come from
 * `offer.tiers` (numeric `priceAmount` + `CURRENCY`), the single source of truth —
 * so the structured-data prices can never drift from the rendered pricing cards.
 * (Completes the deferral from Bundle A — B1-D-jsonld1.)
 */
export function ServiceJsonLd() {
  const base = getSiteUrl();

  return (
    <JsonLdScript
      data={{
        "@context": "https://schema.org",
        "@type": "Service",
        name: `${BRAND} — AI & automation, on subscription`,
        serviceType: "AI & automation engineering",
        url: base,
        provider: {
          "@type": "Organization",
          name: BRAND,
          url: base,
        },
        offers: tiers.map((tier) => ({
          "@type": "Offer",
          name: tier.name,
          price: tier.priceAmount,
          priceCurrency: CURRENCY,
          url: `${base}/#pricing`,
        })),
      }}
    />
  );
}

/**
 * FAQPage structured data, sourced from the SAME `offer.faq` array that the on-page
 * FAQ accordion renders — so the structured data matches the visible copy exactly,
 * with no duplicated strings. (Completes the deferral from Bundle A — B1-D-jsonld1.)
 */
export function FaqPageJsonLd() {
  return (
    <JsonLdScript
      data={{
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: faq.map((item) => ({
          "@type": "Question",
          name: item.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: item.answer,
          },
        })),
      }}
    />
  );
}
