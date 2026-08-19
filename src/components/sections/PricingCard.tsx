import { Check, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { CalPopupButton, TrackedLink } from "@/components/ui";
import type { AnalyticsEvent } from "@/lib/analytics";

export interface PricingCardProps {
  name: string;
  price: string;
  priceSubtext?: string;
  /** Short emphasized line under the price, e.g. the active-task limit. */
  tasks?: string;
  description: string;
  features: string[];
  ctaText: string;
  ctaHref: string;
  /** External link target (e.g. Stripe). When true, opens in a new tab with rel=noopener. */
  ctaExternal?: boolean;
  /** Conversion event fired on CTA click (e.g. checkout_click_standard). Goes to
   *  both GA4 and Vercel Web Analytics — see src/lib/analytics.ts. */
  analyticsEvent?: AnalyticsEvent;
  calLink?: string;
  featured?: boolean;
  /** Applied to the outermost element this card renders. NOTE: that is the card
   *  itself when `featured` is false, but the positioning wrapper around it when
   *  `featured` is true (the wrapper owns the blob halo). Layout/spacing classes
   *  work in both cases; card-surface classes (background, border, radius) only
   *  land on the card in the non-featured branch. */
  className?: string;
}

export function PricingCard({
  name,
  price,
  priceSubtext,
  tasks,
  description,
  features,
  ctaText,
  ctaHref,
  ctaExternal,
  analyticsEvent,
  calLink,
  featured,
  className,
}: PricingCardProps) {
  const buttonStyles = cn(
    "inline-flex items-center justify-center gap-2 w-full",
    "px-8 py-4 text-base font-medium rounded-full",
    "transition-all duration-300",
    features.length === 0 && "mt-2",
    featured
      ? [
          "bg-white text-brand-dark",
          "hover:bg-gray-100 hover:-translate-y-0.5 hover:shadow-lg",
        ]
      : [
          "bg-brand-fill text-white",
          "hover:bg-brand-fill-dark hover:-translate-y-0.5 hover:shadow-brand",
        ]
  );

  const cta =
    calLink ? (
      <CalPopupButton calLink={calLink} className={buttonStyles}>
        {ctaText}
        <ArrowRight className="w-5 h-5" />
      </CalPopupButton>
    ) : analyticsEvent ? (
      <TrackedLink
        href={ctaHref}
        event={analyticsEvent}
        external={ctaExternal}
        className={buttonStyles}
      >
        {ctaText}
        <ArrowRight className="w-5 h-5" />
      </TrackedLink>
    ) : (
      <a
        href={ctaHref}
        {...(ctaExternal
          ? { target: "_blank", rel: "noopener noreferrer" }
          : {})}
        className={buttonStyles}
      >
        {ctaText}
        <ArrowRight className="w-5 h-5" />
      </a>
    );

  const body = (
    <>
      {/* Plan Name */}
      <div
        className={cn(
          "inline-block px-4 py-1.5 rounded-full text-sm font-medium mb-6",
          featured ? "bg-white/15 text-white" : "bg-brand-pale text-brand-dark"
        )}
      >
        {name}
      </div>

      {/* Price */}
      <div className="mb-4">
        <span
          className={cn(
            "font-serif text-5xl md:text-6xl font-medium tracking-tight",
            featured ? "text-white" : "text-gray-900 dark:text-white"
          )}
        >
          {price}
        </span>
        {priceSubtext && (
          <span
            className={cn(
              "text-lg ml-2",
              featured ? "text-white/70" : "text-gray-500 dark:text-gray-400"
            )}
          >
            {priceSubtext}
          </span>
        )}
      </div>

      {/* Active-task limit */}
      {tasks && (
        <p
          className={cn(
            "mb-6 text-sm font-medium",
            featured ? "text-white/90" : "text-brand-dark dark:text-brand"
          )}
        >
          {tasks}
        </p>
      )}

      {/* Description */}
      <p
        className={cn(
          "mb-8 leading-relaxed",
          featured ? "text-white/85" : "text-gray-600 dark:text-gray-400"
        )}
      >
        {description}
      </p>

      {/* Features — two columns from sm: up (HANDOFF-redesign-v3 §1, Bundle
          V5). Gated at sm: (found in Phase 4/5 review): ungated, this
          forced 2 columns even at 320-375px phone widths, wrapping the
          smaller 0.85rem feature text to 2-4 ragged lines each on the
          site's primary conversion section — the trust boxes added in the
          same bundle already gate their own 2-up grid this way. */}
      {features.length > 0 && (
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3 mb-10">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start gap-2">
              <div
                className={cn(
                  "flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center mt-0.5",
                  featured ? "bg-white/20" : "bg-brand-pale"
                )}
              >
                <Check
                  className={cn("w-3 h-3", featured ? "text-white" : "text-brand")}
                />
              </div>
              <span
                className={cn(
                  "text-[0.85rem] leading-snug",
                  featured ? "text-white/90" : "text-gray-700 dark:text-gray-300"
                )}
              >
                {feature}
              </span>
            </li>
          ))}
        </ul>
      )}

      {cta}
    </>
  );

  if (!featured) {
    return (
      <div
        className={cn(
          "relative overflow-hidden rounded-2xl p-8 md:p-10",
          "transition-all duration-400",
          "bg-white dark:bg-gray-800 border border-[var(--border)]",
          "hover:-translate-y-2 hover:shadow-xl hover:border-brand/30",
          className
        )}
      >
        {body}
      </div>
    );
  }

  // Featured tier: a glassmorphic dark card over its own blob-gradient
  // companion visual (HANDOFF-redesign-v3 §1 — mirrors the pitch
  // artifact's pricing section). The blob sits behind the card, blurred
  // and bleeding past its edges, visible through .glass-dark's
  // translucency; `.glass-dark` itself already supplies the dark base
  // + backdrop-blur (V0). Wrapper carries `className` (the `reveal`
  // scroll-animation class from Pricing.tsx) so it doesn't fight with the
  // card's own `transition-all` on the same element — same discipline
  // established in Benefits.tsx/RecentWork.tsx after V2's review battery
  // caught that exact same-element cascade conflict.
  return (
    <div className={cn("relative", className)}>
      {/* Clipped to a 12px halo (found in Phase 4/5 review): the original
          -inset-6 (24px) exactly matched the grid's own gap-6, and
          blur-2xl's spread reaches well beyond that regardless of inset
          size, so the blob painted over the adjacent card's edge (and the
          mobile-stacked card below it). Nesting the blur inside its own
          overflow-hidden, inset-3 (12px) container clips the effect to a
          tight glow that can never reach the 24px gap, while still giving
          the card a distinct color halo at its own edges. */}
      <div
        className="absolute -inset-3 overflow-hidden rounded-[32px] -z-10"
        aria-hidden="true"
      >
        <div className="blob-4 absolute inset-0 blur-2xl opacity-60" />
      </div>
      <div
        className={cn(
          "glass-dark card-soft relative overflow-hidden p-8 md:p-10",
          "transition-all duration-400",
          "shadow-brand"
        )}
      >
        {body}
      </div>
    </div>
  );
}
