import { Sparkles, PauseCircle, Rocket } from "lucide-react";
import { Section, Container } from "@/components/layout";
import { SectionHeader, TrackedLink } from "@/components/ui";
import { PricingCard } from "./PricingCard";
import { PricingViewedTracker } from "./PricingViewedTracker";
import { tiers, foundingRate, guarantee, sections } from "@/config/offer";
import { cn } from "@/lib/utils";

// Reused verbatim from existing offer.ts claims (HANDOFF-redesign-v3 §1,
// Bundle V5 — "reuse existing site claims for delivery time, do not invent
// a new figure"): both `detail` lines are the exact `benefits[].description`
// text for the matching entry (PauseCircle / Rocket icons — Rocket, not
// Zap, found in Phase 4/5 review: Zap is already the "Senior engineering,
// AI-accelerated" benefit's icon elsewhere on the page, and Rocket is what
// "Fast, async delivery" actually uses). Not imported from `benefits` —
// that array's shape (icon name + title + description) doesn't fit a
// compact trust-box label, so the exact same wording is restated here
// rather than reshaping shared data for one consumer. The "Pause anytime"
// detail was originally a bare restatement of its own label (found in
// Phase 4/5 review) — now the real benefit description instead, which
// adds information (resuming) rather than repeating the heading.
const TRUST_BOXES = [
  {
    icon: PauseCircle,
    label: "Pause anytime",
    detail: "No lock-in. Pause when your queue is empty and resume when you need us.",
  },
  { icon: Rocket, label: "Fast delivery", detail: "Most tasks land in days." },
];

export function Pricing() {
  return (
    <Section id="pricing" variant="default" className="reveal">
      <PricingViewedTracker />
      <Container>
        <SectionHeader
          label={sections.pricing.label}
          title={sections.pricing.title}
          description={sections.pricing.description}
          className="mb-12"
        />

        {/* Founding-rate launch banner — a limited offer layered on the anchor prices,
            never the headline. Gated on the config flag so it disappears (one line) when
            the slots fill. Links to the founding-rate Stripe checkout — tracked like
            the two tier CTAs, since it is a live checkout link and its click-through
            is what tells us whether the launch offer is doing any work. */}
        {foundingRate.active && (
          <div className="max-w-4xl mx-auto mb-10 reveal">
            <TrackedLink
              href={foundingRate.stripeUrl}
              event="checkout_click_founding"
              external
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
                <span className="font-serif font-bold">{foundingRate.price}</span>{" "}
                — {foundingRate.label}
              </span>
              <span className="text-sm opacity-80">
                ({foundingRate.slots} spots)
              </span>
            </TrackedLink>
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
              analyticsEvent={
                tier.id === "pro"
                  ? "checkout_click_pro"
                  : "checkout_click_standard"
              }
              featured={tier.highlighted}
              className="reveal"
            />
          ))}
        </div>

        {/* Trust boxes — dashed border, existing site claims only (no new
            figures) (HANDOFF-redesign-v3 §1, Bundle V5). */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto mt-10 reveal">
          {TRUST_BOXES.map(({ icon: Icon, label, detail }) => (
            <div
              key={label}
              className={cn(
                "flex items-center gap-3 rounded-2xl p-5",
                "border border-dashed border-gray-300 dark:border-gray-700"
              )}
            >
              <Icon className="h-5 w-5 text-brand shrink-0" strokeWidth={2} />
              <div>
                <div className="text-sm font-semibold text-gray-900 dark:text-white">
                  {label}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {detail}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Guarantee cluster */}
        <div className="max-w-2xl mx-auto mt-10 text-center reveal">
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
