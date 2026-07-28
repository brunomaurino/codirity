import { Section, Container } from "@/components/layout";
import { SectionHeader } from "@/components/ui";
import { ProcessStep } from "./ProcessStep";
import { howItWorks, sections } from "@/config/offer";
import { cn } from "@/lib/utils";

export function Process() {
  return (
    <Section
      id="process"
      variant="gradient"
      className={cn(
        "relative",
        "before:absolute before:inset-0",
        "before:bg-[radial-gradient(ellipse_at_50%_50%,rgba(50,205,50,0.08)_0%,transparent_70%)]",
        "before:pointer-events-none"
      )}
    >
      <Container size="narrow">
        <SectionHeader
          label={sections.howItWorks.label}
          title={sections.howItWorks.title}
          description={sections.howItWorks.description}
          className="mb-16 reveal"
        />

        <div className="relative">
          {/* Connecting Line */}
          <div
            className={cn(
              "hidden md:block absolute top-[50px] left-[16%] right-[16%]",
              "h-0.5 bg-gradient-to-r from-gray-200 via-brand to-gray-200",
              "z-0"
            )}
          />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {howItWorks.map((step) => (
              <div key={step.number} className="group reveal">
                <ProcessStep
                  number={step.number}
                  title={step.title}
                  description={step.description}
                />
              </div>
            ))}
          </div>
        </div>
      </Container>
    </Section>
  );
}
