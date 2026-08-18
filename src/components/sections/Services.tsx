import { X } from "lucide-react";
import { Section, Container } from "@/components/layout";
import { SectionHeader, AccentWord, Badge } from "@/components/ui";
import { included, notIncluded, scopeLabels, sections } from "@/config/offer";

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
          {/* Included — pill cloud. Reuses <Badge> (found in Phase 4/5
              review) instead of hand-rolled classes that had silently
              diverged from it in dark mode — the site's other Badge/pill
              consumers (Pricing.tsx, PricingCard.tsx) now automatically
              pick up the same fix via Badge's own variant, rather than
              this bundle fixing only its own copy of the styling. */}
          <div className="reveal">
            <h3 className="text-[13px] font-semibold uppercase tracking-[0.12em] text-brand mb-6 text-center">
              {scopeLabels.included}
            </h3>
            <ul className="flex flex-wrap justify-center gap-3 list-none">
              {included.map((item) => (
                <li key={item}>
                  <Badge size="lg">{item}</Badge>
                </li>
              ))}
            </ul>
          </div>

          {/* Not included — plain list, deliberately not pill-styled.
              text-gray-600 (not -500, found in Phase 4/5 review): -500 on
              this section's bg-gray-50 measured 4.09:1 in light mode,
              under WCAG AA (docs/design-system.md's own documented "Body
              text on paper: gray-600 minimum" rule) — undermining the
              brief's explicit "still honest, still visible" requirement
              for this exact list. */}
          <div className="reveal">
            <h3 className="text-[13px] font-semibold uppercase tracking-[0.12em] text-gray-600 dark:text-gray-400 mb-6 text-center">
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
                  <span className="text-gray-600 dark:text-gray-400 leading-relaxed">
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
