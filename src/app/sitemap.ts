import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site";

// Home + the two legal pages. The D6 note that kept /terms out of the sitemap is
// resolved: the page now exists and is linked from the footer, so excluding it
// here would leave a linked, indexable route the sitemap contradicts. The copy is
// still pending counsel review (see the GOVERNING_LAW placeholder in
// app/terms/page.tsx) — that gates treating it as binding, not listing it.
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
    {
      url: `${base}/terms`,
      lastModified,
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];
}
