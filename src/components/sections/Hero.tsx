import { ArrowRight } from "lucide-react";
import { Badge, CalPopupButton, TrackedLink } from "@/components/ui";
import { Container } from "@/components/layout";
import { HeroBackground } from "./HeroBackground";
import { HeroVisual } from "./HeroVisual";
import { hero, CAL_LINK } from "@/config/offer";
import { cn } from "@/lib/utils";

// v4 (Bundle W0): the `.accent` italic-word treatment is retired
// (HANDOFF-redesign-v4.md §1.1) — the headline renders as plain text in the
// one Apfel family. W1 rebuilds this hero to the approved mockup; this
// bundle only removes the retired treatment without restructuring.

export function Hero() {
  return (
    <section
      className={cn(
        "min-h-screen flex items-center",
        "pt-32 pb-24 px-4 md:px-8 lg:px-16",
        "relative z-[1]",
        "bg-gradient-to-b from-white to-gray-50",
        "dark:from-gray-900 dark:to-gray-800",
        "overflow-hidden"
      )}
    >
      {/* Background gradient overlay */}
      <div
        className={cn(
          "absolute top-0 right-0 w-[60%] h-full z-0",
          "bg-[radial-gradient(ellipse_at_70%_30%,rgba(30,92,70,0.07)_0%,transparent_60%)]"
        )}
      />

      <HeroBackground />

      <Container className="relative z-[1]">
        <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-8 lg:gap-16 items-center">
          {/* Hero Content */}
          <div className="relative">
            <Badge
              withDot
              className="mb-6 opacity-0 animate-slide-up animation-delay-200"
            >
              {hero.badge}
            </Badge>

            <h1
              className={cn(
                "text-4xl md:text-5xl lg:text-6xl xl:text-[4.25rem]",
                "font-medium leading-[1.1]",
                "text-gray-900 dark:text-white mb-6",
                "opacity-0 animate-slide-up animation-delay-300"
              )}
            >
              {hero.headline}
            </h1>

            <p
              className={cn(
                "text-lg md:text-xl text-gray-600 dark:text-gray-400",
                "max-w-[520px] leading-relaxed mb-10",
                "opacity-0 animate-slide-up animation-delay-400"
              )}
            >
              {hero.subhead}
            </p>

            <div
              className={cn(
                "flex flex-wrap gap-4",
                "opacity-0 animate-slide-up animation-delay-500"
              )}
            >
              {/* Top of the funnel: hero_cta_click (summed across both `location`
                  values below) is the denominator for pricing_viewed. HeroVisual's
                  card CTA (location: "hero_visual") fires the SAME event for the
                  same action reached a second way — tag both with `location` (the
                  param key every other TrackedLink site already uses, see
                  Footer.tsx/ContactInfo.tsx/privacy/page.tsx) so GA4 can break the
                  total down by entry point instead of only distinguishing them by
                  one having no param at all. */}
              <TrackedLink
                href={hero.primaryCta.href}
                event="hero_cta_click"
                eventParams={{ location: "hero_primary" }}
                className={cn(
                  "inline-flex items-center justify-center gap-2",
                  "px-8 py-4 text-base font-medium rounded-full",
                  "bg-brand-fill text-white",
                  "hover:bg-brand-fill-dark hover:-translate-y-0.5 hover:shadow-brand",
                  "transition-all duration-300"
                )}
              >
                {hero.primaryCta.label}
                <ArrowRight className="w-5 h-5" />
              </TrackedLink>
              <CalPopupButton
                calLink={CAL_LINK}
                className={cn(
                  "inline-flex items-center justify-center gap-2",
                  "px-8 py-4 text-base font-medium rounded-full",
                  "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700",
                  "hover:border-brand hover:text-brand dark:hover:text-brand hover:bg-brand-pale",
                  "transition-all duration-300 cursor-pointer"
                )}
              >
                {hero.secondaryCta.label}
              </CalPopupButton>
            </div>

            <p
              className={cn(
                "mt-6 text-sm font-medium text-gray-500 dark:text-gray-400",
                "opacity-0 animate-slide-up animation-delay-600"
              )}
            >
              {hero.trustLine}
            </p>
          </div>

          {/* Hero Visual */}
          <div>
            <HeroVisual />
          </div>
        </div>
      </Container>
    </section>
  );
}
