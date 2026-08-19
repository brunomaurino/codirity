import { howItWorks, sections } from "@/config/offer";

// How it works (Bundle W5, v4 treatment) — three ruled steps on paper.
//
// The 01/02/03 numbering is the ONE place ordinal numbering is legitimate on
// this page: this is genuinely a sequence, not a scoreboard. It composes from
// `howItWorks[].number`, never from the map index, so the config stays the
// source of truth if a step is ever added or reordered.

export function Process() {
  return (
    <section id="process" data-ground="light" className="paper relative pb-16 md:pb-24 lg:pb-28">
      <div className="wrap-v4">
        <h2 className="label rv fade" style={{ marginBottom: "clamp(24px, 3vw, 44px)" }}>
          {sections.howItWorks.label}
        </h2>
        <div className="steps rv">
          {howItWorks.map((step, i) => (
            <div
              key={step.number}
              className="step fade"
              style={{ "--l": i } as React.CSSProperties}
            >
              <h3>
                {step.number} — {step.title}
              </h3>
              <p>{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
