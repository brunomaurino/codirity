import { Section, Container } from "@/components/layout";
import { ContactInfo } from "./ContactInfo";
import { ContactForm } from "./ContactForm";

// The close (HANDOFF-redesign-v3.md §1 rule 4): the whole site is light-on-warm-
// neutral except this band and the footer directly beneath it, which flip to
// near-black. It is the ONE deliberate palette contrast beat on the site — the
// `ink` variant exists for this section and should not be used a second time.
//
// `padding` drops from `hero` (min-h-screen) to the default: the band reads as a
// closing beat that runs into the footer, and a full extra viewport of black
// separated the two into a void rather than one continuous band.
export function Contact() {
  return (
    <Section id="contact" variant="ink">
      <Container size="narrow">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-12 lg:gap-16 items-start">
          <div className="reveal">
            <ContactInfo />
          </div>
          <div className="reveal">
            <ContactForm />
          </div>
        </div>
      </Container>
    </Section>
  );
}
