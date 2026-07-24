/**
 * Canonical site metadata + environment-aware base URL.
 *
 * `getSiteUrl()` resolves the absolute origin used for `metadataBase`, canonical
 * URLs, `og:image`, the sitemap, and JSON-LD. It is environment-aware so that:
 *  - Production uses the real canonical domain.
 *  - Preview deployments use their own deployment URL, so `og:image` and other
 *    absolute URLs resolve against the preview instead of 404-ing against prod.
 *  - Local dev / build falls back to the production domain.
 *
 * Priority:
 *  1. NEXT_PUBLIC_SITE_URL          — explicit canonical (set in prod, per deploy docs)
 *  2. VERCEL_PROJECT_PRODUCTION_URL — only when VERCEL_ENV === "production"
 *  3. VERCEL_URL                    — the per-deployment URL (preview builds)
 *  4. https://www.codirity.com      — hardcoded production fallback
 */
export const SITE_NAME = "Codirity";

/** Public social profiles — used for JSON-LD `sameAs`. */
export const SOCIAL_LINKS = [
  "https://www.linkedin.com/company/codirity",
  "https://x.com/codirity",
];

export function getSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) return explicit.replace(/\/$/, "");

  if (
    process.env.VERCEL_ENV === "production" &&
    process.env.VERCEL_PROJECT_PRODUCTION_URL
  ) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  return "https://www.codirity.com";
}
