import { Section, Container } from "@/components/layout";
import { SectionHeader, StatusDot } from "@/components/ui";
import { sections, weekLog, weekBoard, weekBoardCaption } from "@/config/offer";
import { cn } from "@/lib/utils";

/**
 * "A week with us" (HANDOFF-redesign §6.R3) — the abstract 3-step process
 * becomes the diary of a real-shaped request, followed by the mock queue board.
 * Server component, zero JS, artifact grammar (mono timestamps, hairlines,
 * square corners). The board is honestly captioned as illustrative.
 *
 * Section id stays `process` — the nav anchors to it.
 */
export function Process() {
  return (
    // variant="gray", not "gradient": the gradient variant is a green
    // background wash, which §1 rule 2 bans outright — removing only the radial
    // overlay while keeping the green gradient would have been half a sweep.
    <Section id="process" variant="gray" className="relative">
      <Container size="narrow">
        <SectionHeader
          label={sections.howItWorks.label}
          title={sections.howItWorks.title}
          description={sections.howItWorks.description}
          className="mb-14 reveal"
        />

        {/* The week log */}
        <div className="max-w-2xl mx-auto reveal">
          <div className="border-l border-[var(--border)] ml-1.5 pl-6 flex flex-col gap-7">
            {weekLog.map((entry) => (
              <div key={entry.when} className="relative">
                <span className="absolute -left-[30px] top-[5px]">
                  <StatusDot variant={entry.done ? "live" : "inert"} />
                </span>
                <div className="font-mono text-[11px] text-gray-500 dark:text-gray-400 mb-1">
                  {entry.when}
                </div>
                <p className="text-[0.95rem] leading-relaxed text-gray-700 dark:text-gray-300">
                  {entry.text}
                  {entry.quote && (
                    <span className="text-gray-500 dark:text-gray-400">
                      {" "}
                      &ldquo;{entry.quote}&rdquo;
                    </span>
                  )}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* The mock queue board */}
        <div className="max-w-3xl mx-auto mt-14 reveal">
          <div className="hairline bg-white dark:bg-gray-900 grid grid-cols-1 md:grid-cols-3">
            {weekBoard.map((column, i) => (
              <div
                key={column.label}
                className={cn(
                  "p-4",
                  i > 0 &&
                    "border-t md:border-t-0 md:border-l border-[var(--border)]"
                )}
              >
                <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-gray-500 dark:text-gray-400 mb-3">
                  <StatusDot variant={column.dot} />
                  {column.label}
                </div>
                <div className="flex flex-col gap-2">
                  {column.cards.map((card) => (
                    <div
                      key={card}
                      className="hairline px-3 py-2 font-mono text-xs text-gray-700 dark:text-gray-300"
                    >
                      {card}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <p className="mt-3 font-mono text-[10px] text-gray-400 dark:text-gray-500">
            {weekBoardCaption}
          </p>
        </div>
      </Container>
    </Section>
  );
}
