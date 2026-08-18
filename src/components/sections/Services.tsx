import { X } from "lucide-react";
import { Section, Container } from "@/components/layout";
import { SectionHeader, AccentWord } from "@/components/ui";
import { included, notIncluded, scopeLabels, sections } from "@/config/offer";
import { cn } from "@/lib/utils";

// No literal mockup for this section in the pitch artifact — extrapolated
// from Designjoy's own "Apps, websites, logos & more" pill-cloud block
// (HANDOFF-redesign-v3 §1), rendering the real `included` scope items as
// wrapped pill tags instead of a vertical checklist. `notIncluded` stays a
// plain list, deliberately NOT pill-styled: the honesty discipline here is
// that what's OUT of scope should read as a plain, sober fact, not
// decorated like a feature highlight.
export function Services() {
  return (
    <Section id="services" variant="gray" className="reveal">
      <Container>
        <SectionHeader
          label={sections.whatWeBuild.label}
          title={<AccentWord text={sections.whatWeBuild.title} word="automation" />}
          description={sections.whatWeBuild.description}
          className="mb-16"
        />

        <div className="max-w-4xl mx-auto space-y-12">
          {/* Included — pill cloud */}
          <div className="reveal">
            <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-brand mb-6 text-center">
              {scopeLabels.included}
            </h3>
            <div className="flex flex-wrap justify-center gap-3">
              {included.map((item) => (
                <span
                  key={item}
                  className={cn(
                    "btn-pill inline-flex items-center",
                    "px-5 py-2.5 text-sm font-medium",
                    "bg-brand-pale text-brand-dark dark:text-brand",
                    "border border-brand/20"
                  )}
                >
                  {item}
                </span>
              ))}
            </div>
          </div>

          {/* Not included — plain list, deliberately not pill-styled */}
          <div className="reveal">
            <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-gray-500 dark:text-gray-400 mb-6 text-center">
              {scopeLabels.notIncluded}
            </h3>
            <ul className="max-w-xl mx-auto space-y-3">
              {notIncluded.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-3 justify-center text-center"
                >
                  <X
                    className="h-4 w-4 mt-1 shrink-0 text-gray-400 dark:text-gray-500"
                    strokeWidth={2.5}
                  />
                  <span className="text-gray-500 dark:text-gray-400 leading-relaxed">
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Container>
    </Section>
  );
}
