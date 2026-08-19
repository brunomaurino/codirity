"use client";

import { faq, sections, CAL_LINK } from "@/config/offer";
import { CalPopupButton } from "@/components/ui";
import { track } from "@/lib/analytics";
import { cn } from "@/lib/utils";

// FAQ (Bundle W5, v4 treatment) — the ruled details/summary accordion on paper.
//
// TWO INVARIANTS survive the rework, and they are the reason this component
// exists rather than being inlined:
//
//   1. PARITY. Data comes from `offer.faq`, the SAME array that feeds the
//      FAQPage JSON-LD, so the crawlable copy and the structured data can never
//      disagree. Native <details> keeps every answer in the SERVER HTML whether
//      open or closed — the invariant the v3 component protected with a CSS
//      grid-rows collapse and a pile of ARIA wiring.
//   2. `faq_opened` still fires once per OPEN, carrying the question.
//
// Moving to native <details> deletes the disclosure state, the aria-expanded /
// aria-controls plumbing and the chevron, and makes the accordion work with no
// JS at all — while keeping both invariants. `onToggle` fires for keyboard,
// pointer and programmatic opens alike, so the analytics surface widened rather
// than narrowed.

export function Faq() {
  return (
    <section id="faq" data-ground="light" className="paper relative pb-16 md:pb-24 lg:pb-28">
      <div className="wrap-v4">
        <h2 className="label rv fade" style={{ marginBottom: "clamp(24px, 3vw, 40px)" }}>
          {sections.faq.title}
        </h2>

        <div className="faq rv fade" style={{ "--l": 1 } as React.CSSProperties}>
          {faq.map((item) => (
            <details
              key={item.question}
              onToggle={(e) => {
                // Only the OPEN edge is an event; `toggle` fires on close too.
                if ((e.currentTarget as HTMLDetailsElement).open) {
                  track("faq_opened", { question: item.question });
                }
              }}
            >
              <summary>{item.question}</summary>
              <p>{item.answer}</p>
            </details>
          ))}
        </div>

        {/* Book a call, framed as optional. `analyticsLocation` keeps this
            booking distinguishable from the closing band's Cal CTA — the two
            fired an identical unparameterized `call_booked` until v3's review. */}
        <div className="rv fade" style={{ marginTop: "clamp(32px, 5vw, 56px)" }}>
          <p className="lede" style={{ marginBottom: "14px" }}>
            Prefer to talk first?
          </p>
          <CalPopupButton
            calLink={CAL_LINK}
            analyticsLocation="faq"
            className={cn(
              "inline-flex items-center justify-center rounded-full",
              "border border-[var(--rule-ink)] px-7 py-3.5 text-[15px] font-medium",
              "text-ink transition-transform duration-300 hover:-translate-y-0.5",
              "cursor-pointer"
            )}
          >
            Book a call
          </CalPopupButton>
        </div>
      </div>
    </section>
  );
}
