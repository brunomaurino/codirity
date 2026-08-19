import { Section } from "@/components/layout";
import { TrackedLink } from "@/components/ui";
import { tiers, foundingRate, guarantee, sections } from "@/config/offer";
import { PricingViewedTracker } from "./PricingViewedTracker";

// The terms band (redesign-v4 Bundle W2) — docs/redesign-v4/approved-mockup.html
// #terms is the contract. Where the reference site fills this surface with
// raised-capital numbers, this page puts the price and the terms at the 99px
// tier, because for a subscription those ARE the numbers. Every figure and
// every note composes from offer.ts; the founding row is GATED on
// foundingRate.active and interpolates slots/price, so flipping the documented
// kill-switch removes the row — the offer can never strand in prose (the
// V6-class bug this structure exists to prevent).
//
// The FIGURES never animate — no count-ups, ever. The row entrance (rules
// drawing in, content fading up) is the section's only motion.
//
// Anchor contract: the section id is `terms` (hero.primaryCta points here).
// The absolutely-positioned full-height layer below carries the old `pricing`
// id — old inbound links land in the same place, and PricingViewedTracker
// (which observes #pricing and needs an element with REAL height, per its own
// docstring) keeps firing without modification.

type Row = {
  key: string;
  label: string;
  /** The figure. `cur` renders in the hanging gutter; `num` gets brass when it
   *  is a price (brass = defensible numbers only, §1.2). */
  cur?: string;
  num: string;
  unit?: string;
  brass: boolean;
  note: string;
  cta?: { href: string; event: "checkout_click_standard" | "checkout_click_pro" | "checkout_click_founding" };
};

const standard = tiers[0];
const pro = tiers[1];

const ROWS: Row[] = [
  {
    key: "standard",
    label: standard.name,
    cur: "$",
    num: standard.price.replace("$", ""),
    unit: standard.period,
    brass: true,
    // Approved mockup note — a composition of standard.tasks + the unlimited-
    // requests fact, framed for one line.
    note: "One active task at a time. Unlimited requests in the queue behind it.",
    cta: { href: standard.stripeUrl, event: "checkout_click_standard" },
  },
  {
    key: "pro",
    label: pro.name,
    cur: "$",
    num: pro.price.replace("$", ""),
    unit: pro.period,
    brass: true,
    note: "Two active tasks, running in parallel. Priority delivery.",
    cta: { href: pro.stripeUrl, event: "checkout_click_pro" },
  },
  {
    key: "guarantee",
    label: "Guarantee",
    num: "7 days",
    unit: "50% back",
    brass: false,
    // guarantee.description VERBATIM — a real financial commitment.
    note: guarantee.description,
  },
  ...(foundingRate.active
    ? [
        {
          key: "founding",
          label: `Founding — ${foundingRate.slots} seats`,
          cur: "$",
          num: foundingRate.price.replace("$", "").replace("/mo", ""),
          unit: "/mo",
          brass: true,
          note: `A launch price, not a waiting list. The first ${foundingRate.slots} keep it for as long as they stay.`,
          cta: { href: foundingRate.stripeUrl, event: "checkout_click_founding" as const },
        },
      ]
    : []),
];

export function Pricing() {
  return (
    <Section id="terms" variant="ink" className="relative">
      {/* Old-anchor alias: full-height so the tracker's IntersectionObserver
          has a real box to intersect (a zero-height sentinel never fires). */}
      <div id="pricing" aria-hidden="true" className="absolute inset-0 -z-10" />
      <PricingViewedTracker />
      <div className="wrap-v4">
        <h2 className="sr-only">{sections.terms.title}</h2>
        <p className="label rv fade" style={{ marginBottom: "clamp(28px, 4vw, 56px)" }}>
          {sections.terms.label}
        </p>
        <div className="terms rv">
          {ROWS.map((row, i) => (
            <div key={row.key} className="term" style={{ "--i": i } as React.CSSProperties}>
              <span className="term-k">{row.label}</span>
              <span className={row.brass ? "term-v term-n" : "term-v"}>
                {row.cur && <span className="cur">{row.cur}</span>}
                {row.num}
                {row.unit && <span className="unit">{row.unit}</span>}
              </span>
              <span className="term-note">{row.note}</span>
              {row.cta ? (
                <TrackedLink
                  href={row.cta.href}
                  event={row.cta.event}
                  external
                  className="term-cta"
                >
                  {standard.cta}
                </TrackedLink>
              ) : (
                <span aria-hidden="true" />
              )}
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}
