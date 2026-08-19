import { caseStudies } from "@/config/offer";

// Case studies in the v4 treatment (Bundle W4) —
// docs/redesign-v4/approved-mockup.html is the layout contract.
//
// CONTENT HONESTY IS THE POINT OF THIS FILE. Not one content string is written
// here: every headline, line, bullet, stack tag and state name comes from
// `offer.ts`, whose own comments record why. Two fabrications shipped past
// review in v3 and both were about a REAL, NAMED client:
//   - "guest carts" where the record says buyer FAVORITES — an invented
//     e-commerce feature attributed to a real engagement;
//   - an invented sentence characterising Meshio's product before the work.
// Both slipped a fact gate that only checked the expected strings were PRESENT.
// So `scripts/w4-facts-gate.py` checks BOTH directions: a substituted noun or
// an added clause fails it, not just a missing one.
//
// The two studies are deliberately asymmetric. eDairyMarket has a real,
// concrete number and it is set at the display tier. Meshio has NONE — §7
// records no activation percentage because none was ever measured — so its
// visual is the state machine instead. The empty slot is the honest output;
// filling it would be the failure.

function Study({ study }: { study: (typeof caseStudies)[number] }) {
  const sm = study.stateMachine;
  return (
    <section data-ground="dark" className="relative bg-ground text-chalk py-16 md:py-24 lg:py-28">
      <div className="wrap-v4 work">
        <div className="rv">
          {/* `.label` is `text-transform: uppercase`, so `relationship` renders
              verbatim — no case-munging of a data value in the component. */}
          <p className="label" style={{ marginBottom: "clamp(24px, 3vw, 44px)" }}>
            {study.name} — {study.relationship}
          </p>

          {/* Present only when the study HAS an honest figure. */}
          {study.stat && (
            <div className="stat">
              <span className="stat-big">{study.stat.value}</span>
              <span className="stat-of">{study.stat.of}</span>
            </div>
          )}

          {/* `display` carries the leading and tracking; `.d-md` is font-size
              only (W3 shipped a heading without it and the block ran ~65%
              taller). The lines are hand-set in offer.ts and gated to
              reconstruct `headline` exactly. */}
          <h2
            className="display d-md"
            style={{ marginTop: study.stat ? "24px" : 0, maxWidth: "24ch" }}
          >
            {study.headlineLines.map((line, i) => (
              <span key={line} className="line" style={{ "--l": i } as React.CSSProperties}>
                <span>{line}</span>
              </span>
            ))}
          </h2>

          {sm && (
            // The arrows are decorative; the aria-label carries the sequence as
            // a sentence so the machine is not conveyed by glyphs alone.
            <div
              className="sm"
              aria-label={`Onboarding state machine: ${[...sm.states, sm.goal].join(", then ")} — ${sm.goalNote}`}
            >
              {sm.states.map((state) => (
                <span key={state} style={{ display: "contents" }}>
                  <span className="sm-state">{state}</span>
                  <span className="sm-arrow" aria-hidden="true">
                    →
                  </span>
                </span>
              ))}
              <span className="sm-state is-goal">
                {sm.goal}
                <small>{sm.goalNote}</small>
              </span>
            </div>
          )}
        </div>

        <div className="work-grid rv fade">
          <div>
            {/* BOTH paragraphs. The mockup's left column carries one, having
                merged and trimmed the two to fit its layout — but `context`
                ("what the product IS, for readers who don't know it") and
                `background` hold different true facts, and the mockup's merge
                dropped some of them. Layout from the mockup, strings from
                offer.ts. */}
            <p>{study.context}</p>
            <p style={{ marginTop: "14px" }}>{study.background}</p>
            <ul className="stack">
              {study.stack.map((tech) => (
                <li key={tech}>{tech}</li>
              ))}
            </ul>
          </div>
          <ul className="shipped-list">
            {study.whatShipped.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

export function CaseStudies() {
  if (caseStudies.length === 0) return null;
  return (
    <>
      {caseStudies.map((study) => (
        <Study key={study.name} study={study} />
      ))}
    </>
  );
}
