import { ArrowRight } from "lucide-react";
import { TrackedLink } from "@/components/ui";
import { hero } from "@/config/offer";
import { cn } from "@/lib/utils";

/**
 * The hero's single blob-gradient card (Monthly Club, HANDOFF-redesign-v3 §1),
 * replacing the old three-floating-stat-card treatment (HeroCards.tsx,
 * retired in this bundle). Its internal headline is a direct trim of the
 * real hero.subhead ("Unlimited requests... for one flat monthly rate.") —
 * not new marketing copy — and its CTA pill reuses hero.primaryCta verbatim,
 * so the card reinforces the same action as the hero's own primary CTA
 * rather than introducing a second, different one.
 */
export function HeroVisual() {
  return (
    <div className="relative opacity-0 animate-fade-in animation-delay-600">
      <div
        className={cn(
          "blob-1 card-soft",
          "p-8 md:p-10",
          "min-h-[420px] flex flex-col justify-between",
          "shadow-xl"
        )}
      >
        <div
          className={cn(
            "inline-flex w-fit items-center gap-2",
            "px-4 py-1.5 rounded-full",
            "bg-white/15 backdrop-blur-sm",
            "text-sm font-semibold"
          )}
        >
          <span className="w-2 h-2 bg-white rounded-full animate-pulse-dot" />
          Start today
        </div>

        <div>
          <p className="text-2xl md:text-[1.75rem] font-semibold leading-snug mb-6">
            Unlimited requests. One flat rate.
          </p>

          <TrackedLink
            href={hero.primaryCta.href}
            event="hero_cta_click"
            eventParams={{ surface: "hero_visual" }}
            className={cn(
              "btn-pill inline-flex items-center justify-center gap-2",
              "px-6 py-3 text-sm font-semibold",
              "bg-white/15 hover:bg-white/25",
              "transition-all duration-300"
            )}
          >
            {hero.primaryCta.label}
            <ArrowRight className="w-4 h-4" />
          </TrackedLink>
        </div>
      </div>
    </div>
  );
}
