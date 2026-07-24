import { Check, X } from "lucide-react";
import { Section, Container } from "@/components/layout";
import { SectionHeader, Card } from "@/components/ui";
import { included, notIncluded, sections } from "@/config/offer";
import { cn } from "@/lib/utils";

export function Services() {
  return (
    <Section id="services" variant="gray" className="reveal">
      <Container>
        <SectionHeader
          label={sections.whatWeBuild.label}
          title={sections.whatWeBuild.title}
          description={sections.whatWeBuild.description}
          className="mb-16"
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {/* Included */}
          <Card padding="lg" className="reveal">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
              What&rsquo;s included
            </h3>
            <ul className="space-y-4">
              {included.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-pale text-brand">
                    <Check className="h-4 w-4" strokeWidth={2.5} />
                  </span>
                  <span className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </Card>

          {/* Not included */}
          <Card padding="lg" className="reveal">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
              Not included
            </h3>
            <ul className="space-y-4">
              {notIncluded.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span
                    className={cn(
                      "mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full",
                      "bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500"
                    )}
                  >
                    <X className="h-4 w-4" strokeWidth={2.5} />
                  </span>
                  <span className="text-gray-500 dark:text-gray-400 leading-relaxed">
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </Container>
    </Section>
  );
}
