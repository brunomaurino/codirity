import { ArrowRight } from "lucide-react";
import { Badge, CalPopupButton, TrackedLink } from "@/components/ui";
import { Container } from "@/components/layout";
import { HeroBackground } from "./HeroBackground";
import { HeroVisual } from "./HeroVisual";
import { hero, CAL_LINK } from "@/config/offer";
import { cn } from "@/lib/utils";

// The HANDOFF §1.2 one-word-per-headline emphasis technique applies to
// exactly one word. Split hero.headline (the single source of truth,
// offer.ts) around it at render time rather than hardcoding the headline
// text in JSX — so a future copy change in offer.ts can't silently drift
// out of sync with a duplicated string here. Falls back to the plain
// (un-accented) headline if the word is ever removed from the copy.
//
// Uses indexOf/slice, not split() (found in Phase 4/5 review: split() plus
// branching on the TAIL's truthiness silently dropped the accent word
// whenever the headline ended exactly on it — an empty tail was
// indistinguishable from "word not found" — and silently discarded
// everything after a second occurrence, since split() returns 3+ parts if
// the word repeats). indexOf/slice always reconstructs the full string and
// the presence check (`hasAccentWord`) is independent of whether the tail
// happens to be empty.
const ACCENT_WORD = "subscription";
const accentIndex = hero.headline.indexOf(ACCENT_WORD);
const hasAccentWord = accentIndex !== -1;
const headlineLead = hasAccentWord
  ? hero.headline.slice(0, accentIndex)
  : hero.headline;
const headlineTail = hasAccentWord
  ? hero.headline.slice(accentIndex + ACCENT_WORD.length)
  : "";

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
                "font-semibold leading-[1.1]",
                "text-gray-900 dark:text-white mb-6",
                "opacity-0 animate-slide-up animation-delay-300"
              )}
            >
              {hasAccentWord ? (
                <>
                  {headlineLead}
                  <span className="accent">{ACCENT_WORD}</span>
                  {headlineTail}
                </>
              ) : (
                headlineLead
              )}
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
                  "px-8 py-4 text-base font-semibold rounded-full",
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
                  "px-8 py-4 text-base font-semibold rounded-full",
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
