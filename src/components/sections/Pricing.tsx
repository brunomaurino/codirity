import { Sparkles } from "lucide-react";
import { Section, Container } from "@/components/layout";
import { SectionHeader } from "@/components/ui";
import { PricingCard } from "./PricingCard";
import { tiers, foundingRate, guarantee, sections } from "@/config/offer";
import { cn } from "@/lib/utils";

export function Pricing() {
  return (
    <Section id="pricing" variant="default" className="reveal">
      <Container>
        <SectionHeader
          label={sections.pricing.label}
          title={sections.pricing.title}
          description={sections.pricing.description}
          className="mb-12"
        />

        {/* Founding-rate launch banner — a limited offer layered on the anchor prices,
            never the headline. Gated on the config flag so it disappears (one line) when
            the slots fill. Links to the founding-rate Stripe checkout. */}
        {foundingRate.active && (
          <div className="max-w-4xl mx-auto mb-10 reveal">
            <a
              href={foundingRate.stripeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                "group flex flex-col sm:flex-row items-center justify-center gap-x-3 gap-y-1 text-center",
                "rounded-2xl px-6 py-4",
                "bg-brand-pale text-brand-dark border border-brand/20",
                "transition-all duration-300 hover:border-brand/40 hover:shadow-brand/10 hover:shadow-lg"
              )}
            >
              <Sparkles className="h-5 w-5 text-brand shrink-0" strokeWidth={2} />
              <span className="font-semibold">Founding offer</span>
              <span>
                <span className="font-mono font-bold">{foundingRate.price}</span>{" "}
                — {foundingRate.label}
              </span>
              <span className="text-sm opacity-80">
                ({foundingRate.slots} spots)
              </span>
            </a>
          </div>
        )}

        {/* Two-tier grid — pricing data is server-rendered (no client toggle needed). */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto items-start">
          {tiers.map((tier) => (
            <PricingCard
              key={tier.id}
              name={tier.name}
              price={tier.price}
              priceSubtext={tier.period}
              tasks={tier.tasks}
              description={tier.description}
              features={tier.features}
              ctaText={tier.cta}
              ctaHref={tier.stripeUrl}
              ctaExternal
              featured={tier.highlighted}
              className="reveal"
            />
          ))}
        </div>

        {/* Guarantee block */}
        <div className="max-w-2xl mx-auto mt-14 text-center reveal">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
            {guarantee.title}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
            {guarantee.description}
          </p>
        </div>
      </Container>
    </Section>
  );
}
