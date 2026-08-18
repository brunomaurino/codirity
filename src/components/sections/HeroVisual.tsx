import { ArrowRight } from "lucide-react";
import { TrackedLink } from "@/components/ui";
import { hero } from "@/config/offer";
import { cn } from "@/lib/utils";

/**
 * The hero's single blob-gradient card (Monthly Club, HANDOFF-redesign-v3 §1),
 * replacing the old three-floating-stat-card treatment (HeroCards.tsx,
 * retired in this bundle). Its headline (`hero.visualHeadline`, offer.ts) is
 * a short trim of the real hero.subhead — not new marketing copy — and its
 * CTA pill reuses hero.primaryCta verbatim, so the card reinforces the same
 * action as the hero's own primary CTA rather than introducing a second,
 * different one.
 *
 * The badge/CTA pill use a DARKENING translucent fill (black/20), not a
 * lightening one (found in Phase 4/5 review: a white/15 overlay lightened
 * .blob-1's brightest hotspot — the radial gold highlight this card sits
 * directly over — undoing the utility's own 50%-black scrim and dropping
 * the inherited white text to as low as ~2.9:1). Darkening can only move
 * contrast further from the already-AA-safe scrimmed baseline, never
 * toward it, so it's the safe direction regardless of exactly where on the
 * gradient the pill lands.
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
            "bg-black/20 backdrop-blur-sm",
            "text-sm font-medium"
          )}
        >
          <span className="w-2 h-2 bg-white rounded-full animate-pulse-dot" />
          Start today
        </div>

        <div>
          <p className="text-2xl md:text-[1.75rem] font-medium leading-snug mb-6">
            {hero.visualHeadline}
          </p>

          {/* Same conversion action as Hero.tsx's own primary CTA — see that
              file's comment for why both carry a `location` param instead of
              being left bare (Phase 4/5 review). */}
          <TrackedLink
            href={hero.primaryCta.href}
            event="hero_cta_click"
            eventParams={{ location: "hero_visual" }}
            className={cn(
              "btn-pill inline-flex items-center justify-center gap-2",
              "px-6 py-3 text-sm font-medium",
              "bg-black/20 hover:bg-black/30",
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
