import { ArrowUpRight } from "lucide-react";
import { Section, Container } from "@/components/layout";
import { SectionHeader, Card, Badge } from "@/components/ui";
import { caseStudies, sections } from "@/config/offer";

// "Recent work" (S5). Renders the typed offer.caseStudies. While the list is empty
// (content supplied later — D5), the whole section is hidden so no empty state ships;
// the moment a case study is added to offer.ts, the section appears with no other change.
export function RecentWork() {
  if (caseStudies.length === 0) return null;

  return (
    <Section id="work" variant="gray" className="reveal">
      <Container>
        <SectionHeader
          label={sections.recentWork.label}
          title={sections.recentWork.title}
          description={sections.recentWork.description}
          className="mb-16"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {caseStudies.map((study) => {
            const CardWrapper = study.href ? "a" : "div";
            return (
              <Card
                key={study.title}
                padding="lg"
                className="group reveal flex flex-col"
              >
                <CardWrapper
                  {...(study.href
                    ? {
                        href: study.href,
                        target: "_blank",
                        rel: "noopener noreferrer",
                      }
                    : {})}
                  className="flex h-full flex-col"
                >
                  <div className="mb-4 flex items-center justify-between gap-2">
                    <span className="font-serif text-sm font-semibold text-brand">
                      {study.result}
                    </span>
                    {study.href && (
                      <ArrowUpRight className="h-4 w-4 text-gray-400 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                    )}
                  </div>
                  <h3 className="mb-2 text-lg font-bold text-gray-900 dark:text-white">
                    {study.title}
                  </h3>
                  <p className="mb-4 flex-1 text-[0.95rem] leading-relaxed text-gray-500 dark:text-gray-400">
                    {study.summary}
                  </p>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                      {study.client}
                    </span>
                    {study.tags.map((tag) => (
                      <Badge key={tag} variant="neutral" size="sm">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardWrapper>
              </Card>
            );
          })}
        </div>
      </Container>
    </Section>
  );
}
