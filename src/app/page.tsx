import type { Metadata } from "next";
import { RevealProvider } from "@/components/layout";
import {
  Hero,
  Process,
  Services,
  Benefits,
  RecentWork,
  About,
  Pricing,
  Contact,
} from "@/components/sections";

// Per-page canonical (resolved against metadataBase in layout.tsx). Set here rather
// than on the root layout so it isn't inherited by other routes (e.g. /privacy).
export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export default function Home() {
  return (
    <RevealProvider>
      <Hero />
      {/* S2 — How it works */}
      <Process />
      {/* S3 — What we build */}
      <Services />
      {/* S4 — Membership benefits */}
      <Benefits />
      {/* S5 — Recent work (hidden until offer.caseStudies has content) */}
      <RecentWork />
      <About />
      {/* S6 — Pricing (two-tier + Stripe + founding banner + guarantee) */}
      <Pricing />
      <Contact />
    </RevealProvider>
  );
}
