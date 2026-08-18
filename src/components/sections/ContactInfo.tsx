import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { AccentWord, CalPopupButton, SectionHeader, TrackedLink } from "@/components/ui";
import { sections, CAL_LINK, CONTACT_EMAIL, RESPONSE_TIME_CLAIM } from "@/config/offer";

// The left half of the final CTA — rendered on the site's ONE near-black band
// (HANDOFF-redesign-v3.md §1 rule 4). Everything here is a permanently-dark
// surface, so foregrounds are pinned light in BOTH themes rather than carrying
// `dark:` pairs: the band is #0a0a08 in light mode and #171713 in dark, and a
// `text-gray-900 dark:text-white` pattern would render near-black on near-black
// in light mode (the same class of failure V0's battery caught on `--white`).
//
// The pre-redesign copy this replaces ("Let's Build Something Great Together",
// "Ready to transform your business with AI-powered solutions?", "Prefer a Live
// Conversation?") predated the §4 voice gate and never went through it; the new
// copy lives in `offer.ts` under `sections.contact` per this project's
// source-of-truth convention.

// Facts already live on the site before this bundle — restated compactly here,
// not invented. The response-time promise is imported rather than retyped: it is
// a real commitment, and V6's review battery caught it stated twice in one
// viewport with two different figures (here vs. the form's "answer within a
// day"). One string, one home.
const FACTS = [
  "Remote-first, worldwide",
  RESPONSE_TIME_CLAIM,
];

export function ContactInfo() {
  return (
    <div className="lg:sticky lg:top-[120px]">
      <SectionHeader
        tone="ink"
        align="left"
        maxWidth="full"
        label={sections.contact.label}
        title={
          // `text-white` is load-bearing, not decoration: `.accent` declares its
          // own `color: var(--green-dark)`, which overrides the colour this span
          // would otherwise inherit from the h2 — #0f6b3d on the #0a0a08 band is
          // ~3.01:1 in light mode. Found in Phase 4/5 review.
          <AccentWord text={sections.contact.title} word="week" className="text-white" />
        }
        description={sections.contact.description}
      />

      {/* Email — the plain-text address, per §6.R6's "form + Cal button + the
          email address in plain text" close. */}
      <p className="mt-10 text-lg">
        <TrackedLink
          href={`mailto:${CONTACT_EMAIL}`}
          event="email_click"
          eventParams={{ location: "contact_section" }}
          className={cn(
            "font-medium text-brand-light underline underline-offset-4",
            "decoration-brand-light/40 transition-colors hover:text-white hover:decoration-white"
          )}
        >
          {CONTACT_EMAIL}
        </TrackedLink>
      </p>

      <ul className="mt-6 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:gap-x-6">
        {FACTS.map((fact) => (
          <li key={fact} className="flex items-center gap-2 text-sm text-gray-300">
            <span
              className="h-1.5 w-1.5 shrink-0 rounded-full bg-brand-light"
              aria-hidden="true"
            />
            {fact}
          </li>
        ))}
      </ul>

      {/* Cal booking — same CAL_LINK and same popup as before, restyled for the
          band: a white pill on near-black is the highest-contrast control
          available here.

          Label is "Book a call", not "Book a call instead": on mobile this column
          stacks ABOVE the form, so "instead" pointed at something the reader had
          not seen yet. The lead-in line supplies the contrast the word was doing,
          and works in either stacking order. `analyticsLocation` distinguishes
          this booking from the FAQ's Cal CTA one section up — both previously
          fired an identical unparameterized `call_booked`. Both found in Phase
          4/5 review. */}
      <p className="mt-10 text-sm text-gray-300">Rather talk it through?</p>
      <CalPopupButton
        calLink={CAL_LINK}
        analyticsLocation="contact_close"
        className={cn(
          "mt-3 inline-flex items-center gap-3",
          "rounded-full px-8 py-4",
          "bg-white text-base font-medium text-gray-900",
          "transition-all duration-300 hover:-translate-y-0.5 hover:bg-gray-100",
          "cursor-pointer"
        )}
      >
        Book a call
        <ArrowRight className="h-[18px] w-[18px]" aria-hidden="true" />
      </CalPopupButton>
    </div>
  );
}
