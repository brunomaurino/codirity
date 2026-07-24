import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site";

// Home + /privacy only. No ToS entry in v1 (D6) — /terms is a pre-launch blocker
// pending counsel-reviewed copy, so it is intentionally absent from the sitemap.
export default function sitemap(): MetadataRoute.Sitemap {
  const base = getSiteUrl();
  const lastModified = new Date();

  return [
    {
      url: `${base}/`,
      lastModified,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${base}/privacy`,
      lastModified,
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];
}
