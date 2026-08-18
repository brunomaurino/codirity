import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { AccentWord, CalPopupButton, SectionHeader, TrackedLink } from "@/components/ui";
import { sections, CAL_LINK, CONTACT_EMAIL } from "@/config/offer";

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
// not invented. Kept out of `offer.ts` for now because they are labels for the
// SAME two claims the prior version showed, not new offer content.
const FACTS = [
  "Remote-first, worldwide",
  "We reply within 24 hours",
];

export function ContactInfo() {
  return (
    <div className="lg:sticky lg:top-[120px]">
      <SectionHeader
        tone="ink"
        align="left"
        maxWidth="full"
        label={sections.contact.label}
        title={<AccentWord text={sections.contact.title} word="week" />}
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
            "font-semibold text-brand-light underline underline-offset-4",
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

      {/* Cal booking — unchanged behaviour (same CAL_LINK, same popup), restyled
          for the band: a white pill on near-black is the highest-contrast
          control available here. */}
      <CalPopupButton
        calLink={CAL_LINK}
        className={cn(
          "mt-10 inline-flex items-center gap-3",
          "rounded-full px-8 py-4",
          "bg-white text-base font-semibold text-gray-900",
          "transition-all duration-300 hover:-translate-y-0.5 hover:bg-gray-100",
          "cursor-pointer"
        )}
      >
        Book a call instead
        <ArrowRight className="h-[18px] w-[18px]" aria-hidden="true" />
      </CalPopupButton>
    </div>
  );
}
