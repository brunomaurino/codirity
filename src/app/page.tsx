import type { Metadata } from "next";
import { RevealProvider } from "@/components/layout";
import { Hero, Services, Process, About, Pricing, Contact } from "@/components/sections";

// Per-page canonical (resolved against metadataBase in layout.tsx). Set here rather
// than on the root layout so it isn't inherited by other routes (e.g. /privacy).
export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export default function Home() {
  return (
    <RevealProvider>
      <Hero />
      <Services />
      <Process />
      <About />
      <Pricing />
      <Contact />
    </RevealProvider>
  );
}
