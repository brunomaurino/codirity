import { TrackedLink } from "@/components/ui";
import { tiers, foundingRate, guarantee, sections } from "@/config/offer";
import { PricingViewedTracker } from "./PricingViewedTracker";

// The terms band (redesign-v4 Bundle W2) — docs/redesign-v4/approved-mockup.html
// #terms is the contract. Where the reference site fills this surface with
// raised-capital numbers, this page puts the price and the terms at the 99px
// tier, because for a subscription those ARE the numbers.
//
// EVERY figure, label, note and CTA composes from offer.ts. The founding row is
// GATED on foundingRate.active and interpolates slots/price/cta, so flipping the
// documented kill-switch removes the row, its checkout CTA, the FAQ entry and
// the eyebrow's own count together — the offer can never strand in prose.
//
// The FIGURES never animate — no count-ups, ever. The row entrance (rules
// drawing in, content fading up) is the section's only motion.
//
// Layout: a BARE <section> carrying the ground itself, exactly like W1's hero —
// NOT the legacy <Section>, whose px-4/md:px-8 padding nested inside .wrap-v4
// doubled the page gutter to 80px/side, misaligned the band's left edge from
// the hero's by 32px, and compounded into a price/note overlap between
// ~900-1030px (Phase 4/5 review BLOCKER).
//
// Anchor contract: the section id is `terms` (hero.primaryCta points here). The
// absolutely-positioned full-height layer below carries the old `pricing` id —
// old inbound links and PricingViewedTracker's IntersectionObserver (which needs
// an element with REAL height) still resolve. The Service JSON-LD points at
// `#terms` directly. Do not remove the alias without updating that tracker.

type Row = {
  key: string;
  label: string;
  /** Currency symbol; rendered in the figure's hanging gutter. */
  cur?: string;
  num: string;
  unit?: string;
  /** Brass is for defensible numbers — the prices (HANDOFF §1.2). */
  brass: boolean;
  note: string;
  cta?: {
    label: string;
    href: string;
    event: "checkout_click_standard" | "checkout_click_pro" | "checkout_click_founding";
  };
};

const standard = tiers[0];
const pro = tiers[1];

// The band spells small counts out in prose ("The first five", "in four
// numbers") while rendering them as digits in labels ("Founding — 5 seats"),
// exactly as the approved mockup does. Declared ABOVE ROWS: the rows read it
// during module evaluation, so a later `const` would hit the temporal dead zone.
const COUNT_WORDS = ["zero", "one", "two", "three", "four", "five", "six"];
const spell = (n: number) => COUNT_WORDS[n] ?? String(n);

const ROWS: Row[] = [
  {
    key: "standard",
    label: standard.name,
    cur: "$",
    num: standard.price.replace("$", ""),
    unit: standard.period,
    brass: true,
    note: standard.note,
    cta: { label: standard.cta, href: standard.stripeUrl, event: "checkout_click_standard" },
  },
  {
    key: "pro",
    label: pro.name,
    cur: "$",
    num: pro.price.replace("$", ""),
    unit: pro.period,
    brass: true,
    note: pro.note,
    cta: { label: pro.cta, href: pro.stripeUrl, event: "checkout_click_pro" },
  },
  {
    key: "guarantee",
    label: "Guarantee",
    num: `${guarantee.days} days`,
    unit: `${guarantee.refundPct}% back`,
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
          num: foundingRate.price.replace("$", "").replace(foundingRate.period, ""),
          unit: foundingRate.period,
          brass: true,
          note: `A launch price, not a waiting list. The first ${spell(foundingRate.slots)} keep it for as long as they stay.`,
          cta: {
            label: foundingRate.cta,
            href: foundingRate.stripeUrl,
            event: "checkout_click_founding" as const,
          },
        },
      ]
    : []),
];

// The eyebrow states how many numbers the band shows, so it must follow the
// gated row count rather than hardcoding "four" (Phase 4/5 review).
const eyebrow = sections.terms.label.replace("{n}", spell(ROWS.length));

export function Pricing() {
  return (
    <section
      id="terms"
      data-ground="dark"
      className="relative bg-ground text-chalk py-16 md:py-24 lg:py-28"
    >
      {/* Old-anchor alias: full-height so the tracker's IntersectionObserver
          has a real box to intersect (a zero-height sentinel never fires). */}
      <div id="pricing" aria-hidden="true" className="absolute inset-0 -z-10" />
      <PricingViewedTracker />
      <div className="wrap-v4">
        <h2 className="sr-only">{sections.terms.title}</h2>
        <p className="label rv fade" style={{ marginBottom: "clamp(28px, 4vw, 56px)" }}>
          {eyebrow}
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
                  {row.cta.label}
                </TrackedLink>
              ) : (
                <span aria-hidden="true" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
