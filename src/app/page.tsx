import type { Metadata } from "next";
import { RevealProvider } from "@/components/layout";
import { ServiceJsonLd, FaqPageJsonLd } from "@/components/seo/JsonLd";
import {
  Hero,
  Process,
  Services,
  Benefits,
  RecentWork,
  About,
  Pricing,
  Faq,
  Contact,
} from "@/components/sections";

// Per-page canonical (resolved against metadataBase in layout.tsx). Set here rather
// than on the root layout so it isn't inherited by other routes (e.g. /privacy).
export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export default function Home() {
  return (
    <>
      {/* Service.offers + FAQPage structured data (server-rendered; sourced from offer.ts) */}
      <ServiceJsonLd />
      <FaqPageJsonLd />
      <RevealProvider>
        <Hero />
        {/* S2 — How it works */}
        <Process />
        {/* S3 — What we build */}
        <Services />
        {/* S4 — Membership benefits */}
        <Benefits />
        {/* S5 — Clients (D6): "who's on the board", from offer.clients —
            always renders, not gated on offer.caseStudies (that array is
            unrelated content V8 owns separately). */}
        <RecentWork />
        <About />
        {/* S6 — Pricing (two-tier + Stripe + founding banner + guarantee) */}
        <Pricing />
        {/* S7 — FAQ (accordion) + S8 — Book a call */}
        <Faq />
        <Contact />
      </RevealProvider>
    </>
  );
}
