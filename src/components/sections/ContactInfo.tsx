import { CalPopupButton, TrackedLink } from "@/components/ui";
import { sections, CAL_LINK, CONTACT_EMAIL, RESPONSE_TIME_CLAIM } from "@/config/offer";
import { cn } from "@/lib/utils";

// The close (Bundle W6, v4 treatment) — the left half of the final band, on the
// dark ground that runs from the ownership quote straight into the footer.
//
// ANALYTICS ARE LOAD-BEARING and unchanged: `email_click` with
// `location: "contact_section"`, and `call_booked` with
// `analyticsLocation="contact_close"` — the label that distinguishes this
// booking from the FAQ's Cal CTA, which fired an identical unparameterized event
// until v3's review. A restyle must never quietly renumber the funnel.
//
// The response-time promise is IMPORTED, not retyped: it is a real commitment,
// and V6's battery caught it stated twice in one viewport with two different
// figures. One string, one home.

// The headline's lines live in offer.ts as `sections.contact.titleLines`, and
// scripts/w6-close-gate.py asserts they rejoin to `sections.contact.title`
// exactly. The first draft hardcoded them HERE behind a comment claiming that
// gate existed — it did not, and the text had already drifted from the config
// by a trailing period (Phase 4/5 review). A claimed invariant with no gate
// behind it is worse than no claim.

export function ContactInfo() {
  return (
    <div>
      <h2 className="display d-lg rv" style={{ maxWidth: "14ch" }}>
        {sections.contact.titleLines.map((line, i) => (
          <span key={line} className="line" style={{ "--l": i } as React.CSSProperties}>
            <span>{line}</span>
          </span>
        ))}
      </h2>

      <div className="rv fade" style={{ "--l": 2 } as React.CSSProperties}>
        <p className="lede" style={{ marginTop: "28px" }}>
          {sections.contact.description}
        </p>

        {/* The address in plain text, as its own loud control — §6.R6's close is
            "form + Cal button + the email address in plain text". */}
        <TrackedLink
          href={`mailto:${CONTACT_EMAIL}`}
          event="email_click"
          eventParams={{ location: "contact_section" }}
          className="close-cta"
        >
          {CONTACT_EMAIL}
          <span aria-hidden="true">↗</span>
        </TrackedLink>

        <p className="trust" style={{ marginTop: "36px" }}>
          <span className="bar" aria-hidden="true" />
          {RESPONSE_TIME_CLAIM} · Remote-first, worldwide
        </p>

        {/* Cal booking — same CAL_LINK, same popup, same analyticsLocation.
            Secondary to the address above it, so it is an outline control
            rather than a second filled one: two filled pills in one block read
            as two primary actions. */}
        <p className="lede" style={{ marginTop: "36px", marginBottom: "12px" }}>
          Rather talk it through?
        </p>
        <CalPopupButton
          calLink={CAL_LINK}
          analyticsLocation="contact_close"
          className={cn(
            "inline-flex items-center justify-center rounded-full",
            "border border-[var(--chalk-dim)] px-7 py-3.5 text-[15px] font-medium",
            "text-chalk transition-transform duration-300 hover:-translate-y-0.5",
            "cursor-pointer"
          )}
        >
          Book a call
        </CalPopupButton>
      </div>
    </div>
  );
}
