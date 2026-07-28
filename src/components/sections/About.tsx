import { Section, Container } from "@/components/layout";
import { SectionHeader } from "@/components/ui";
import { cn } from "@/lib/utils";

export function About() {
  return (
    <Section id="about" variant="default" className="reveal">
      <Container size="narrow">
        <SectionHeader
          label="About us"
          title="Two brothers, one workshop"
          className="mb-12"
        />

        <div className="max-w-3xl mx-auto">
          <div
            className={cn(
              "bg-white dark:bg-gray-800 rounded-3xl p-8 md:p-12",
              "border border-[var(--border)]"
            )}
          >
            <p className="text-lg md:text-xl text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
              We&apos;re two brothers who spent years building software at
              Globant, Ualá, and Kelity. We started Codirity after watching
              too many businesses pay people to do, by hand and every week,
              work a machine should have taken over years ago.
            </p>
            <p className="text-lg md:text-xl text-gray-700 dark:text-gray-300 leading-relaxed mb-8">
              The AI made that work cheap to automate. It didn&apos;t make it
              automatic — someone still has to build the thing, connect it to
              your systems, and own it when it breaks. That&apos;s the job we do.
            </p>
            <p className="text-gray-900 dark:text-white font-semibold text-lg">
              Bring us the task your team redoes every Monday.
            </p>
          </div>
        </div>
      </Container>
    </Section>
  );
}
