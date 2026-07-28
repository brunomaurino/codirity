import { Section, Container } from "@/components/layout";
import { SectionHeader } from "@/components/ui";
import { sections, costLedger } from "@/config/offer";
import { cn } from "@/lib/utils";

/**
 * The Ledger (HANDOFF-redesign §6.R2) — the cost comparison rendered as the
 * artifact a founder actually reads: a receipt. Server component, zero JS,
 * mono/hairline/square. Every figure is sourced (see the footnote line and the
 * derivations in the R2 run notes); the category's usual checkmark-table is
 * exactly the furniture this replaces.
 *
 * The one green glyph is the ✓ on "pause any month" — a true, actionable fact,
 * within the green-means-live rule.
 */

function Row({
  label,
  value,
  footnote,
  bold,
}: {
  label: string;
  value: string;
  footnote?: number;
  bold?: boolean;
}) {
  return (
    <div className="flex items-baseline gap-2 py-[3px]">
      <span
        className={cn(
          bold
            ? "font-bold text-gray-900 dark:text-white"
            : "text-gray-600 dark:text-gray-400"
        )}
      >
        {label}
        {footnote !== undefined && (
          <sup className="text-[9px] text-gray-400 dark:text-gray-500">
            {footnote}
          </sup>
        )}
      </span>
      <span
        aria-hidden="true"
        className="flex-1 border-b border-dotted border-[var(--border)] translate-y-[-3px]"
      />
      <span
        className={cn(
          "whitespace-nowrap",
          bold
            ? "font-bold text-gray-900 dark:text-white"
            : "text-gray-800 dark:text-gray-200",
          value === "✓" && "text-brand"
        )}
      >
        {value}
      </span>
    </div>
  );
}

export function Ledger() {
  return (
    <Section id="ledger" variant="default" className="reveal">
      <Container size="narrow">
        <SectionHeader
          label={sections.ledger.label}
          title={sections.ledger.title}
          description={sections.ledger.description}
          className="mb-10"
        />

        <div className="max-w-md mx-auto">
          <div className="hairline bg-white dark:bg-gray-900 font-mono text-[13px] px-5 py-6 md:px-7">
            <div className="text-[10px] uppercase tracking-[0.14em] text-gray-500 dark:text-gray-400 mb-4">
              {costLedger.heading}
            </div>

            {costLedger.hire.map((row) => (
              <Row key={row.label} {...row} />
            ))}

            <div className="hairline-t my-4" />

            {costLedger.us.map((row, i) => (
              <Row key={row.label} {...row} bold={i === 0} />
            ))}
          </div>

          <p className="mt-3 font-mono text-[10px] leading-relaxed text-gray-400 dark:text-gray-500">
            {costLedger.footnote}
          </p>
        </div>
      </Container>
    </Section>
  );
}
