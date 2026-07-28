import { Section, Container } from "@/components/layout";
import { SectionHeader } from "@/components/ui";
import { sections, clients, clientsCloser } from "@/config/offer";
import { cn } from "@/lib/utils";

/**
 * The clients ledger (HANDOFF-redesign §6.RC) — "Already on the board".
 * Server component, artifact treatment: mono, hairline, square corners.
 *
 * The honesty framing IS the section: provenance tags (`client` / `ours`) are
 * rendered on every row, and Vivi's pre-launch status shows as an outlined dot
 * (work in motion) rather than a false "live" claim. Green-means-live: filled
 * dot = in production, outlined green = actively being built.
 */

const STATUS: Record<
  "in_production" | "pre_launch",
  { text: string; dotClass: string }
> = {
  in_production: { text: "in production", dotClass: "bg-brand" },
  pre_launch: {
    text: "pre-launch",
    dotClass: "border-[1.5px] border-brand bg-transparent",
  },
};

export function Clients() {
  return (
    <Section id="clients" variant="default" className="reveal">
      <Container size="narrow">
        <SectionHeader
          label={sections.clients.label}
          title={sections.clients.title}
          description={sections.clients.description}
          className="mb-10"
        />

        <div className="hairline bg-white dark:bg-gray-900 font-mono text-[13px] max-w-3xl mx-auto">
          {clients.map((client) => (
            <div
              key={client.name}
              className="border-b border-[var(--border)] px-4 py-4 md:px-6"
            >
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <span className="font-bold text-gray-900 dark:text-white">
                  {client.name}
                </span>
                <span className="text-gray-500 dark:text-gray-400">
                  {client.tagline}
                </span>
                <span
                  className={cn(
                    "text-[10px] uppercase tracking-wider px-1.5 py-0.5",
                    "border border-[var(--border)] text-gray-500 dark:text-gray-400"
                  )}
                >
                  {client.provenance}
                </span>
                <span className="ml-auto whitespace-nowrap text-gray-500 dark:text-gray-400">
                  <span
                    aria-hidden="true"
                    className={cn(
                      "inline-block w-[7px] h-[7px] rounded-full mr-2 align-middle",
                      STATUS[client.status].dotClass
                    )}
                  />
                  {STATUS[client.status].text}
                </span>
              </div>
              <p className="mt-1.5 text-gray-600 dark:text-gray-400 text-xs leading-relaxed">
                {client.detail}
              </p>
            </div>
          ))}
          <div className="px-4 py-4 md:px-6 text-gray-500 dark:text-gray-400">
            <span className="whitespace-nowrap">
              {clientsCloser}
              <span aria-hidden="true" className="wb-caret" />
            </span>
          </div>
        </div>
      </Container>
    </Section>
  );
}
