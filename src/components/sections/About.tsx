import { Section, Container } from "@/components/layout";
import { SectionHeader } from "@/components/ui";
import { cn } from "@/lib/utils";

export function About() {
  return (
    <Section id="about" variant="default" className="reveal">
      <Container size="narrow">
        <SectionHeader
          label="About Us"
          title="Two Brothers. One Mission."
          className="mb-12"
        />

        <div className="max-w-3xl mx-auto">
          <div
            className={cn(
              "bg-white dark:bg-gray-800 rounded-3xl p-8 md:p-12",
              "border border-[var(--border)]",
              "shadow-sm"
            )}
          >
            <p className="text-lg md:text-xl text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
              We&apos;re two brothers who&apos;ve spent years building technology at
              companies like Globant, Ualá, and Kelity. We started Codirity
              because we saw too many businesses stuck with outdated processes
              and systems that hold them back.
            </p>
            <p className="text-lg md:text-xl text-gray-700 dark:text-gray-300 leading-relaxed mb-8">
              We believe AI isn&apos;t just the future—it&apos;s the present. Every
              company, regardless of size, should be leveraging intelligent
              automation as their competitive advantage. That&apos;s what we&apos;re here
              to help you do.
            </p>
            <p className="text-brand font-semibold text-lg">
              Let&apos;s modernize your business together.
            </p>
          </div>
        </div>
      </Container>
    </Section>
  );
}
