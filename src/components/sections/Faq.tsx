"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Section, Container } from "@/components/layout";
import { SectionHeader, CalPopupButton, AccentWord } from "@/components/ui";
import { faq, sections, CAL_LINK } from "@/config/offer";
import { track } from "@/lib/analytics";
import { cn } from "@/lib/utils";

// FAQ accordion (S7) — a leaf client component. Data comes from offer.faq, the SAME
// array that feeds the FAQPage JSON-LD (single source, no duplicated strings).
// Every answer is always rendered in the DOM and only visually collapsed (CSS grid
// rows), so the crawlable content matches the FAQPage structured data exactly and the
// questions + answers appear in the server HTML.
export function Faq() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <Section id="faq" variant="gray" className="reveal">
      <Container size="narrow">
        <SectionHeader
          label={sections.faq.label}
          title={<AccentWord text={sections.faq.title} word="answered" />}
          description={sections.faq.description}
          className="mb-12"
        />

        <div className="mx-auto flex max-w-3xl flex-col gap-3">
          {faq.map((item, index) => {
            const isOpen = openIndex === index;
            const answerId = `faq-answer-${index}`;
            return (
              <div
                key={item.question}
                className="reveal card-soft overflow-hidden border border-[var(--border)] bg-white dark:bg-gray-800"
              >
                <button
                  type="button"
                  onClick={() => {
                    if (!isOpen) track("faq_opened", { question: item.question });
                    setOpenIndex(isOpen ? null : index);
                  }}
                  aria-expanded={isOpen}
                  aria-controls={answerId}
                  className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
                >
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {item.question}
                  </span>
                  <ChevronDown
                    className={cn(
                      "h-5 w-5 shrink-0 text-brand transition-transform duration-300",
                      isOpen && "rotate-180"
                    )}
                    aria-hidden="true"
                  />
                </button>
                {/* Answer stays in the DOM (crawlable + matches JSON-LD); collapsed via CSS. */}
                <div
                  id={answerId}
                  aria-hidden={!isOpen}
                  className={cn(
                    "grid transition-all duration-300 ease-out",
                    isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                  )}
                >
                  <div className="overflow-hidden">
                    <p className="px-6 pb-5 leading-relaxed text-gray-600 dark:text-gray-400">
                      {item.answer}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* S8 — Book a call, framed as optional */}
        <div className="reveal mt-12 text-center">
          <p className="mb-4 text-gray-600 dark:text-gray-400">
            Prefer to talk first?
          </p>
          <CalPopupButton
            calLink={CAL_LINK}
            // Labelled so this booking is distinguishable from the closing
            // band's Cal CTA one section below — they fired an identical
            // unparameterized `call_booked` until now (Phase 4/5 review).
            analyticsLocation="faq"
            className={cn(
              "inline-flex items-center justify-center gap-2",
              "rounded-full px-8 py-4 text-base font-semibold",
              "bg-brand-fill text-white",
              "transition-all duration-300 hover:-translate-y-0.5 hover:bg-brand-fill-dark hover:shadow-brand",
              "cursor-pointer"
            )}
          >
            Book a call
          </CalPopupButton>
        </div>
      </Container>
    </Section>
  );
}
