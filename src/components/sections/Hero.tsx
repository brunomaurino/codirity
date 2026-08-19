import { ArrowRight } from "lucide-react";
import { CalPopupButton, TrackedLink } from "@/components/ui";
import { hero, CAL_LINK } from "@/config/offer";
import { cn } from "@/lib/utils";

// v4 hero (Bundle W1) — docs/redesign-v4/approved-mockup.html is the contract.
// The fixed dark ground, the three hand-set headline lines on the masked
// line-rise, and the 13px ledger sitting on the H1's baseline carrying the
// REAL numbers. Two structural adaptations from the mockup, both deliberate:
//
//  - The mockup draws a nav INSIDE the hero; on the site that nav IS the
//    shared fixed <Header/>, restyled dark-aware in this same bundle. Padding
//    top clears it. (Building a second nav here would double the chrome.)
//
//  - The mockup's hero-foot carries lede + one CTA; this hero keeps BOTH
//    existing instrumented CTAs (hero_cta_click via TrackedLink and the Cal
//    popup) — analytics continuity outranks a one-button composition, and the
//    mockup's own nav carries the booking CTA anyway.
//
// The v3 HeroVisual/HeroBackground (stat cards, floating shapes) are DELETED
// with this bundle — the v4 ground is deliberately still. That removes the
// `location: "hero_visual"` emitter of hero_cta_click; the event itself
// survives on the primary CTA (see notes.md).
//
// Line breaks are HAND-SET: hero.headline is split at fixed word boundaries
// so each line rises in sequence. The split is derived from the copy, not
// duplicated — a copy change in offer.ts falls back to a single unsplit line
// rather than drifting (same no-duplicate rule the old accent logic followed).
const LINE_BREAKS = ["Your AI &", "automation team,", "on subscription."] as const;
const heroLines: readonly string[] = LINE_BREAKS.join(" ") === hero.headline
  ? LINE_BREAKS
  : [hero.headline];

// The ledger's three lines are verbatim reconstructions of offer.ts facts
// (tiers[0].price + "/mo flat" per hero pricing language, tiers[0].tasks,
// benefits' pause line) — no new claims. Brass goes on the PRICE only.
const LEDGER = [
  { text: "$3,995/mo flat", brass: true },
  { text: "one active task at a time", brass: false },
  { text: "pause or cancel anytime", brass: false },
];

export function Hero() {
  return (
    <section
      id="hero"
      data-ground="dark"
      className={cn(
        "relative flex min-h-[92svh] flex-col justify-between",
        "bg-ground text-chalk",
        // padding-top LONGHAND (§0 shorthand trap) — clears the fixed Header.
        "pt-28 md:pt-32"
      )}
    >
      <div className="wrap-v4 w-full">
        <p className="label" style={{ marginBottom: "28px" }}>
          {hero.trustLine}
        </p>
        <div className="hero-grid">
          <h1 className="display d-xl">
            {heroLines.map((line, i) => (
              <span key={line} className="line" style={{ "--l": i } as React.CSSProperties}>
                <span>{line}</span>
              </span>
            ))}
          </h1>
          <p
            className="hero-ledger fade"
            style={{ "--l": 4 } as React.CSSProperties}
          >
            {LEDGER.map(({ text, brass }) => (
              <span key={text} className={cn("block", brass && "text-brass")}>
                {text}
              </span>
            ))}
          </p>
        </div>
      </div>

      <div className="wrap-v4 w-full">
        <div className="hero-foot">
          <p className="lede fade" style={{ "--l": 5 } as React.CSSProperties}>
            {hero.subhead}
          </p>
          <div
            className="fade flex flex-wrap items-center gap-4"
            style={{ "--l": 6 } as React.CSSProperties}
          >
            {/* Top of the funnel: hero_cta_click is the denominator for
                pricing_viewed. Event name + params byte-identical to main. */}
            <TrackedLink
              href={hero.primaryCta.href}
              event="hero_cta_click"
              eventParams={{ location: "hero_primary" }}
              className={cn(
                "inline-flex items-center justify-center gap-3",
                "btn-pill px-8 py-4 text-base font-medium",
                "bg-mint text-ground",
                "transition-transform duration-300 hover:-translate-y-0.5"
              )}
            >
              {hero.primaryCta.label}
              <ArrowRight className="h-5 w-5" aria-hidden="true" />
            </TrackedLink>
            {/* No analyticsLocation: main's hero Cal button emitted a bare
                call_booked, and this bundle's gate is byte-identical events.
                Labeling it is a one-line follow-up once the funnel owner wants
                the breakdown. */}
            <CalPopupButton
              calLink={CAL_LINK}
              className={cn(
                "inline-flex items-center justify-center gap-2",
                "btn-pill px-8 py-4 text-base font-medium",
                "border border-[var(--rule)] text-chalk",
                "transition-all duration-300 hover:border-mint hover:text-mint",
                "cursor-pointer"
              )}
            >
              {hero.secondaryCta.label}
            </CalPopupButton>
          </div>
        </div>
      </div>
    </section>
  );
}
