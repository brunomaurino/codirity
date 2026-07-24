import type { Metadata } from "next";
import { RevealProvider } from "@/components/layout";
import {
  Hero,
  Process,
  Services,
  Benefits,
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
      <About />
      {/* Pricing still the consultative card until Bundle D (anchor #pricing resolves) */}
      <Pricing />
      <Contact />
    </RevealProvider>
  );
}
