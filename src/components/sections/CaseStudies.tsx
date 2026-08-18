import { Section, Container } from "@/components/layout";
import { SectionHeader, AccentWord } from "@/components/ui";
import { caseStudies, sections } from "@/config/offer";
import { cn } from "@/lib/utils";
import type { BlobClass } from "@/lib/blob";
import { CaseStudySketch } from "./CaseStudySketch";

// The two full case studies (redesign-v3 Bundle V8, content from
// HANDOFF-redesign-v3.md §7). Deliberately NOT the RecentWork badge-card
// treatment: that section is a lightweight roll-call, this one is the evidence.
// One generously-padded block per study rather than a grid — these are meant to
// be read, and two studies side by side would halve the reading width for no
// gain.
//
// Blob choice: blob-2 and blob-1. RecentWork (the section immediately above)
// cycles blob-3 / blob-4 / blob-1 across its three columns, so its LAST tile is
// blob-1 — putting blob-1 first here would stack the same gradient across the
// section boundary, the exact adjacency RecentWork's own comment documents
// avoiding. blob-2 leads; blob-1 is far enough down the page to be clear of it.
const STUDY_BLOBS: BlobClass[] = ["blob-2", "blob-1"];

export function CaseStudies() {
  return (
    <Section id="case-studies" variant="default" className="reveal">
      <Container>
        <SectionHeader
          label={sections.caseStudies.label}
          title={<AccentWord text={sections.caseStudies.title} word="detail" />}
          description={sections.caseStudies.description}
          className="mb-16"
        />

        <div className="flex flex-col gap-12 lg:gap-16">
          {caseStudies.map((study, index) => (
            <article
              key={study.name}
              className={cn(
                "reveal card-soft overflow-hidden",
                "border border-[var(--border)] bg-white dark:bg-gray-800",
                "p-6 sm:p-8 lg:p-10"
              )}
            >
              {/* Header — name, relationship, stack */}
              <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{study.name}</h3>
                <span
                  className={cn(
                    "btn-pill inline-flex items-center",
                    "px-3 py-1 text-xs font-semibold uppercase tracking-[0.08em]",
                    // bg-brand-fill, never bare bg-brand: this is a solid fill
                    // under white text, which is the role the *-fill token pair
                    // exists for (V0's dual-role-token finding).
                    "bg-brand-fill text-white"
                  )}
                >
                  {study.relationship}
                </span>
              </div>

              <p className="mt-2 text-gray-600 dark:text-gray-400">{study.context}</p>

              {/* Headline stat on its own blob-gradient panel. The blob utility
                  sets a near-white foreground and carries V0's built-in dark
                  scrim, so text on it is FULL opacity and nothing lightening is
                  layered on top (V1/V2 findings). `.accent` declares its OWN
                  colour, which beats the colour it would inherit here — so the
                  accent word is passed an explicit `text-white` (V6 finding). */}
              <div
                className={cn(
                  STUDY_BLOBS[index % STUDY_BLOBS.length],
                  "card-soft mt-6 p-6 sm:p-8"
                )}
              >
                <p className="text-xl sm:text-2xl font-bold leading-snug">
                  <AccentWord text={study.headline} word={study.headlineAccent} className="text-white" />
                </p>
              </div>

              <p className="mt-6 leading-relaxed text-gray-600 dark:text-gray-400">{study.background}</p>

              {/* What shipped + the architecture sketch. Single column until lg:
                  — the sketch has a fixed aspect ratio and a real minimum
                  legible width, and pairing it with the list any earlier
                  squeezes both (the ungated-grid trap from V5). */}
              <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10">
                <div>
                  <h4 className="text-[13px] font-semibold uppercase tracking-[0.12em] text-brand">
                    What shipped
                  </h4>
                  <ul className="mt-4 flex flex-col gap-3">
                    {study.whatShipped.map((item) => (
                      <li key={item} className="flex items-start gap-3 text-[0.95rem] leading-relaxed">
                        <span
                          className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-fill"
                          aria-hidden="true"
                        />
                        <span className="text-gray-600 dark:text-gray-400">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="text-gray-900 dark:text-white">
                  <h4 className="text-[13px] font-semibold uppercase tracking-[0.12em] text-brand">
                    How it fits together
                  </h4>
                  <div className="mt-4">
                    <CaseStudySketch sketch={study.sketch} />
                  </div>
                </div>
              </div>

              {/* Stack tags — reuse the pill language, muted so they read as
                  metadata rather than competing with the headline. */}
              <ul className="mt-8 flex flex-wrap gap-2 border-t border-[var(--border)] pt-6">
                {study.stack.map((tag) => (
                  <li
                    key={tag}
                    className={cn(
                      "btn-pill inline-flex items-center",
                      "px-3 py-1 text-xs font-semibold",
                      "bg-gray-50 dark:bg-gray-900",
                      "border border-[var(--border)]",
                      "text-gray-600 dark:text-gray-400"
                    )}
                  >
                    {tag}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </Container>
    </Section>
  );
}
