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
        {/* W4 turned this run dark, which would have introduced two HARD
            ground cuts — Benefits (light) → clients, and the last study →
            About (light). "Grounds never hard-cut" is Bruno's explicit rule
            (§1.5) and the `.band-*` utilities have existed unused since W0, so
            the pair of gradients enters here rather than being logged as debt.
            W5 reworks both neighbours and may reposition them. */}
        <div className="band band-ld" aria-hidden="true" />
        <RecentWork />
        {/* S5b — Case studies (D1): eDairyMarket + Meshio, content from
            HANDOFF-redesign-v3.md §7. Placed immediately after the clients
            roll-call and before Pricing, per the bundle brief. Chosen over
            after-About so the proof runs clients → the two studies in one
            uninterrupted stretch, and the reader reaches pricing having just
            read the strongest evidence rather than the team blurb. */}
        <CaseStudies />
        <div className="band band-dl" aria-hidden="true" />
        <About />
        {/* S6 — the terms band (W2) */}
        <Pricing />
        {/* S6b — the queue scene (W3): the signature motion. Placed directly
            after the terms band to preserve the approved mockup's own
            terms → queue adjacency. The mockup runs both near the TOP of the
            page; this page still carries the v3 section order, and reordering
            it belongs to W4–W6, not here. Both sections sit on the dark
            ground, so the pair needs no `.band` between them — inserting the
            queue anywhere in the paper run would have demanded two new
            gradient bands and broken the no-hard-cut rule mid-bundle. */}
        <Queue />
        {/* S7 — FAQ (accordion) + S8 — Book a call */}
        <Faq />
        <Contact />
      </RevealProvider>
    </>
  );
}
