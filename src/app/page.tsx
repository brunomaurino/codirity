import type { Metadata } from "next";
import { RevealProvider } from "@/components/layout";
import { ServiceJsonLd, FaqPageJsonLd } from "@/components/seo/JsonLd";
import {
  Hero,
  Pricing,
  Queue,
  CaseStudies,
  RecentWork,
  Services,
  Process,
  About,
  Faq,
  Ownership,
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
        {/* SECTION ORDER — the approved mockup's, exactly
            (docs/redesign-v4/approved-mockup.html).

            redesign-v4 shipped W0–W6 with the v3 sequence still underneath:
            `Benefits` sat second, the offer landed after the proof, and the two
            case studies came after the clients strip. W5 grouped the paper run
            and recorded the rest as an open design decision; this closes it by
            matching the contract rather than leaving the page half-ported.

            What changed, and why it reads better:
            - The OFFER now follows the hero directly. The mockup leads with the
              price because the price IS the argument — a flat monthly number a
              reader can act on before any persuading. The proof then answers
              "can they actually do it", instead of preceding a question nobody
              has asked yet.
            - The two case studies come BEFORE the clients strip: the detailed
              evidence first, the roll-call as the summary after it.
            - `Benefits` is GONE. All six of its promises restated things the
              page already says where they belong — four were character-identical
              to `tiers[].features` — which is why the approved mockup has no
              such section. Removing a duplicate is not trimming a claim;
              nothing it carried is now unstated.

            The page is one dark run, one paper run, and TWO transitions — down
            from four bands, because Benefits' light island is gone. */}
        <Hero />

        {/* ——— the dark run: the offer, then the proof ——— */}
        {/* The terms band (W2) and the queue scene (W3) stay adjacent per the
            mockup's own terms → queue pairing, and every section here is dark,
            so no band sits between any of them. */}
        <Pricing />
        <Queue />
        {/* eDairyMarket + Meshio — the detailed evidence. */}
        <CaseStudies />
        {/* "Who's on the board" — the roll-call that summarises it. */}
        <RecentWork />

        <div className="band band-dl" aria-hidden="true" />
        {/* ——— the paper run (W5) ——— */}
        <Services />
        <Process />
        <About />
        <Faq />
        <div className="band band-ld" aria-hidden="true" />

        {/* ——— the closing band (W6) ———
            Ownership → close → footer are one continuous dark surface, not
            three stacked slabs: the band above is the ONLY transition they
            need. */}
        <Ownership />
        <Contact />
      </RevealProvider>
    </>
  );
}
