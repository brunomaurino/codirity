import { ContactInfo } from "./ContactInfo";
import { ContactForm } from "./ContactForm";

// The close (Bundle W6, v4 treatment) — a bare <section> carrying the dark
// ground, continuous with the ownership quote above it and the footer below, so
// the three read as one closing band rather than three stacked slabs.
//
// The FORM STAYS. The approved mockup's close is headline + address + trust
// line with no form, but the form is a live conversion surface with its own
// instrumented events and an API route behind it — removing a working
// conversion path is not a visual matter, and the mockup is a direction
// artifact, not a funnel decision. The mockup's treatment is applied AROUND it.

export function Contact() {
  return (
    <section
      id="contact"
      data-ground="dark"
      className="relative bg-ground text-chalk py-16 md:py-24 lg:py-28"
    >
      <div className="wrap-v4">
        <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
          <ContactInfo />
          <div className="rv fade" style={{ "--l": 3 } as React.CSSProperties}>
            <ContactForm />
          </div>
        </div>
      </div>
    </section>
  );
}
