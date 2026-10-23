import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { RevealProvider } from "@/components/layout";
import { AuditForm } from "@/components/sections/AuditForm";
import { audit, caseStudies } from "@/config/offer";
import { cn } from "@/lib/utils";

// The paid-search landing page. It is kept OUT of the index and the sitemap on
// purpose: it is written for one ad message ("free audit"), and letting it rank
// would put a second, narrower answer to "what is Codirity" beside the home page.
export const metadata: Metadata = {
  title: "Free Site Leak Audit",
  description: audit.lede,
  alternates: { canonical: "/audit" },
  robots: { index: false, follow: true },
};

// The proof is the real eDairyMarket finding, read from offer.ts rather than
// restated here, so the number cannot drift from the case study on the home page.
// Throws at build time if the study is ever renamed, instead of the proof block
// silently disappearing — the w4 facts gate only covers the home page.
const proof = (() => {
  const study = caseStudies.find((s) => s.name === "eDairyMarket");
  if (!study?.stat) {
    throw new Error("/audit: the eDairyMarket case study (with its stat) is missing from offer.ts");
  }
  return { ...study, stat: study.stat };
})();

export default function AuditPage() {
  return (
    <RevealProvider>
      <section
        id="hero"
        data-ground="dark"
        className="relative bg-ground text-chalk pt-32 pb-16 md:pt-40 md:pb-24"
      >
        <div className="wrap-v4">
          <p className="label" style={{ marginBottom: "28px" }}>
            {audit.label}
          </p>
          <h1 className="display d-lg" style={{ maxWidth: "14ch" }}>
            <span className="line line-rise" style={{ "--l": 0 } as React.CSSProperties}>
              <span>{audit.headline}</span>
            </span>
          </h1>
          <div
            className="fade-rise mt-10 flex flex-col gap-8 md:mt-14"
            style={{ "--l": 2 } as React.CSSProperties}
          >
            <p className="lede">{audit.lede}</p>
            <div className="flex flex-wrap items-center gap-4">
              <a
                href="#request"
                className={cn(
                  "inline-flex items-center justify-center gap-3",
                  "btn-pill px-8 py-4 text-base font-medium",
                  "bg-mint text-ground",
                  "transition-transform duration-300 hover:-translate-y-0.5"
                )}
              >
                {audit.cta}
                <ArrowRight className="h-5 w-5" aria-hidden="true" />
              </a>
            </div>
            <p className="text-sm text-chalk-dim" style={{ maxWidth: "48ch" }}>
              {audit.fit}
            </p>
          </div>

          <div className="mt-16 border-t border-[var(--rule)] pt-8 md:mt-24">
            <p className="label" style={{ marginBottom: "16px" }}>
              {proof.name}
            </p>
            <p className="display d-md">
              <span className="text-brass">{proof.stat.value}</span>{" "}
              {proof.stat.of}
            </p>
            {/* headlineLines is the rest of `headline` after the stat — the
                w4 facts gate holds that invariant, so the figure is not
                printed twice. */}
            <p className="lede mt-4" style={{ maxWidth: "52ch" }}>
              {proof.headlineLines.join(" ")}
            </p>
          </div>
        </div>
      </section>

      <div className="band band-dl" aria-hidden="true" />

      <section data-ground="light" className="paper relative py-16 md:py-24 lg:py-28">
        <div className="wrap-v4">
          <h2 className="label label-ink rv fade" style={{ marginBottom: "clamp(24px, 3vw, 44px)" }}>
            {audit.checksLabel}
          </h2>
          <ul className="svc-list rv">
            {audit.checks.map((check) => (
              <li
                key={check.title}
                style={{ flexDirection: "column", alignItems: "flex-start", gap: "12px" }}
              >
                <span className="svc-name">{check.title}</span>
                <span className="lede lede-ink" style={{ maxWidth: "60ch" }}>
                  {check.body}
                </span>
              </li>
            ))}
          </ul>

          <h2
            className="label label-ink rv fade"
            style={{ marginTop: "clamp(56px, 8vw, 112px)", marginBottom: "clamp(24px, 3vw, 44px)" }}
          >
            {audit.stepsLabel}
          </h2>
          <div className="steps rv">
            {audit.steps.map((step, i) => (
              <div
                key={step.number}
                className="step fade"
                style={{ "--l": i } as React.CSSProperties}
              >
                <h3>
                  {step.number} — {step.title}
                </h3>
                <p>{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="band band-ld" aria-hidden="true" />

      <section
        id="request"
        data-ground="dark"
        className="relative bg-ground text-chalk py-16 md:py-24 lg:py-28"
      >
        <div className="wrap-v4">
          <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
            <div>
              <h2 className="label" style={{ marginBottom: "16px" }}>
                {audit.afterLabel}
              </h2>
              <p className="lede">{audit.after}</p>
              <Link
                href="/"
                className="mt-6 inline-flex items-center gap-2 text-chalk-dim transition-colors duration-300 hover:text-mint"
              >
                See how the subscription works
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
            <AuditForm />
          </div>
        </div>
      </section>
    </RevealProvider>
  );
}
