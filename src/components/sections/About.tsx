import { faq, FOUNDER_FAQ_INDEX } from "@/config/offer";

// The founder block (Bundle W5, v4 treatment) — the "Who does the work?" FAQ
// answer promoted to a display-size quote on paper.
//
// TEXT ONLY. No photo, no avatar (§1.8): the claim is what the person has
// built, not what they look like, and a stock-looking headshot on a one-person
// shop reads as the opposite of the credibility it is reaching for.
//
// The quote is READ FROM the faq array rather than repeating its string, so the
// promoted quote and the accordion entry can never drift apart. The repetition
// itself is deliberate and specified — unlike W4's Meshio case, where a
// restatement sat three lines from the thing it restated, these two renderings
// are sections apart and the second is the searchable/expandable form.
//
// It is indexed, not searched. The first draft did
// `faq.find(f => f.question === "Who does the work?")` and `return null`ed the
// whole section on a miss — so a copy edit to the most actively edited file in
// the project would have silently DELETED the founder block with no type,
// build or runtime signal (Phase 4/5 review). Now a bad index throws at module
// load, where it is impossible to miss.

const FOUNDER = faq[FOUNDER_FAQ_INDEX];
if (!FOUNDER) {
  throw new Error(
    `FOUNDER_FAQ_INDEX (${FOUNDER_FAQ_INDEX}) is out of range for faq[] (length ${faq.length}) — ` +
      `the founder block has no entry to promote.`
  );
}

export function About() {
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
          {FOUNDER.question}
        </h2>
        <figure style={{ margin: 0 }}>
          <blockquote className="fade" style={{ "--l": 1 } as React.CSSProperties}>
            {FOUNDER.answer}
          </blockquote>
        </figure>
      </div>
    </section>
  );
}
