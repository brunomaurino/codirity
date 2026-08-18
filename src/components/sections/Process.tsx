import { Section, Container } from "@/components/layout";
import { SectionHeader } from "@/components/ui";
import { ProcessStep } from "./ProcessStep";
import { howItWorks, sections } from "@/config/offer";

// Each step gets its OWN blob-gradient combination (HANDOFF-redesign-v3
// §1.3) — three distinct utilities, not one repeated. Benefits.tsx's 6-tile
// grid cycles through all 4 blobs (including blob-4); Process only needs 3
// of them, so blob-4 is deliberately left for Benefits alone here.
const STEP_BLOBS = ["blob-1", "blob-2", "blob-3"];

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

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
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
