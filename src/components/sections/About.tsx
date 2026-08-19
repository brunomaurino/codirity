import { faq } from "@/config/offer";

// The founder block (Bundle W5, v4 treatment) — the "Who does the work?" FAQ
// answer promoted to a display-size quote on paper.
//
// TEXT ONLY. No photo, no avatar (§1.8): the claim is what the person has
// built, not what they look like, and a stock-looking headshot on a one-person
// shop reads as the opposite of the credibility it is reaching for.
//
// The quote COMPOSES from `faq[0]` rather than repeating its string, so the
// promoted quote and the accordion entry can never drift apart. The repetition
// itself is deliberate and specified — unlike W4's Meshio case, where a
// restatement sat three lines from the thing it restated, these two renderings
// are sections apart and the second is the searchable/expandable form.

const WHO_DOES_THE_WORK = faq.find((f) => f.question === "Who does the work?");

export function About() {
  if (!WHO_DOES_THE_WORK) return null;
  return (
    <section
      id="about"
      data-ground="light"
      className="paper founder relative pb-16 md:pb-24 lg:pb-28"
    >
      <div className="wrap-v4 rv">
        {/* The question VERBATIM, question mark included. The mockup's eyebrow
            drops it, but stripping a character off a data value in the
            component is the case-munging W4's review flagged — and an eyebrow
            that reads "WHO DOES THE WORK?" is no worse for it. */}
        <h2 className="label fade" style={{ marginBottom: "clamp(24px, 3vw, 40px)" }}>
          {WHO_DOES_THE_WORK.question}
        </h2>
        <figure style={{ margin: 0 }}>
          <blockquote className="fade" style={{ "--l": 1 } as React.CSSProperties}>
            {WHO_DOES_THE_WORK.answer}
          </blockquote>
        </figure>
      </div>
    </section>
  );
}
