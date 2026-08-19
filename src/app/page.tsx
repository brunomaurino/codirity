import type { Metadata } from "next";
import { RevealProvider } from "@/components/layout";
import { ServiceJsonLd, FaqPageJsonLd } from "@/components/seo/JsonLd";
import {
  Hero,
  Process,
  Services,
  Benefits,
  RecentWork,
  CaseStudies,
  About,
  Pricing,
  Queue,
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
        {/* GROUND ORDER (W5). W5 turned four scattered sections to paper, and
            the brief bounds them with ONE dark→paper band entering and ONE
            paper→dark band leaving — which only makes sense if they form a
            contiguous RUN. Left in the v3 sequence they alternated with the
            dark sections six times, needing six gradients and reading as a
            strobe. So the four move together, in the APPROVED MOCKUP'S OWN
            internal order (what we build → how it works → founder → FAQ), and
            land where the mockup puts them: after the proof and the offer.

            The page is now two runs and four transitions, every one softened:
              dark hero → band → light Benefits → band → DARK RUN (clients,
              studies, terms, queue) → band → PAPER RUN (W5's four) → band →
              dark close.

            What this deliberately does NOT do is re-order the dark run or move
            the offer relative to the proof; the FAQ still follows the price,
            as the mockup has it. Benefits is a v3 survivor with no counterpart
            in the mockup and is left in place for W6's sweep to decide on. */}
        <Hero />
        {/* S4 — Membership benefits: a v3 survivor with no mockup counterpart.
            The bands terminate at `--paper`, so the section is pinned to the
            SAME ground rather than its legacy `bg-white` — otherwise each
            gradient lands on #EDEDE6 against a #FFFFFF section and leaves a
            visible seam at exactly the boundary it exists to soften (Phase 4/5
            review). Retiring or reworking the section itself is W6's. */}
        <div className="band band-dl" aria-hidden="true" />
        <Benefits />
        <div className="band band-ld" aria-hidden="true" />

        {/* ——— the dark run: proof, then the offer ——— */}
        {/* S5 — Clients (D6): "who's on the board", from offer.clients —
            always renders, not gated on offer.caseStudies. */}
        <RecentWork />
        {/* S5b — Case studies (D1): eDairyMarket + Meshio, content from
            HANDOFF-redesign-v3.md §7 — the proof runs clients → the two
            studies in one uninterrupted stretch. */}
        <CaseStudies />
        {/* S6 — the terms band (W2) */}
        <Pricing />
        {/* S6b — the queue scene (W3): the signature motion, kept directly
            after the terms band per the mockup's own terms → queue adjacency.
            Both are dark, so the pair needs no band between them. */}
        <Queue />

        <div className="band band-dl" aria-hidden="true" />
        {/* ——— the paper run (W5) ——— */}
        <Services />
        <Process />
        <About />
        <Faq />
        <div className="band band-ld" aria-hidden="true" />

        {/* S8 — the closing band, on dark. */}
        <Contact />
      </RevealProvider>
    </>
  );
}
