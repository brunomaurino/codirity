import { Section, Container } from "@/components/layout";
import { SectionHeader } from "@/components/ui";
import { ProcessStep } from "./ProcessStep";
import type { BlobClass } from "@/lib/blob";
import { howItWorks, sections } from "@/config/offer";

// Each step gets its OWN blob-gradient combination (HANDOFF-redesign-v3
// §1.3) — three distinct utilities, not one repeated. Benefits.tsx's 6-tile
// grid cycles through all 4 blobs (including blob-4); Process only needs 3
// of them, so blob-4 is deliberately left for Benefits alone here.
//
// Starts at blob-2, not blob-1 (found in Phase 4/5 review): Hero.tsx's
// HeroVisual card (the section immediately above this one, no section in
// between) already uses blob-1, so opening Process on the same blob read as
// a repeat of the very last thing the visitor saw rather than a distinct
// color story.
const STEP_BLOBS: BlobClass[] = ["blob-2", "blob-3", "blob-1"];

export function Process() {
  return (
    <Section id="process" variant="gradient">
      <Container size="narrow">
        <SectionHeader
          label={sections.howItWorks.label}
          title={sections.howItWorks.title}
          description={sections.howItWorks.description}
          className="mb-16 reveal"
        />

        {/* md:grid-cols-3 (not sm:grid-cols-3, found in Phase 4/5 review):
            at the 640-767px band, 3 equal columns plus this card's p-8/
            md:p-10 padding squeezed description text to ~120px wide —
            worse than the pre-redesign layout. Deferring 3-up to md removes
            that band entirely (1 column below 768px). */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {howItWorks.map((step, index) => (
            <div key={step.number} className="reveal">
              <ProcessStep
                number={step.number}
                title={step.title}
                description={step.description}
                blobClass={STEP_BLOBS[index % STEP_BLOBS.length]}
              />
            </div>
          ))}
        </div>
      </Container>
    </Section>
  );
}
