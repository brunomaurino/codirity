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

function Study({ study, anchor }: { study: (typeof caseStudies)[number]; anchor?: string }) {
  const sm = study.stateMachine;
  return (
    // The FIRST study keeps `id="case-studies"` — a public anchor from the
    // pre-rework section, which would otherwise 404 for inbound links. Only one
    // section can own it, and the first is where the old anchor landed.
    <section
      id={anchor}
      data-ground="dark"
      className="relative bg-ground text-chalk py-16 md:py-24 lg:py-28"
    >
      <div className="wrap-v4 work">
        <div className="rv">
          {/* A real <h2>, not a <p>: the client's NAME is this section's
              identity, and rendering it as a paragraph dropped it out of the
              document outline entirely — heading navigation could no longer
              tell you whose work it was (Phase 4/5 review). `.label` is
              `text-transform: uppercase`, so `relationship` renders verbatim;
              no case-munging of a data value in the component. */}
          <h2 className="label" style={{ marginBottom: "clamp(24px, 3vw, 44px)" }}>
            {study.name} — {study.relationship}
          </h2>

          {/* Present only when the study HAS an honest figure.
              aria-hidden because the heading below carries the WHOLE claim —
              stat included — as its accessible name. Without that, the figure
              and its sentence were two disconnected fragments in the a11y tree
              and the heading read as a sentence missing its subject
              ("were returning 404 …"). */}
          {study.stat && (
            <div className="stat" aria-hidden="true">
              <span className="stat-big">{study.stat.value}</span>
              <span className="stat-of">{study.stat.of}</span>
            </div>
          )}

          {/* `display` carries the leading and tracking; `.d-md` is font-size
              only (W3 shipped a heading without it and the block ran ~65%
              taller). The lines are hand-set in offer.ts and gated to
              reconstruct `headline` exactly. */}
          {/* An <h3> under the name's <h2>, carrying the CANONICAL headline as
              its accessible name — so heading navigation gets the complete
              claim including the stat, in one place, exactly as offer.ts words
              it. The visible lines are the same sentence, hand-set.
              `--hl-ch` is MEASURED, not inherited from the mockup: offer.ts's
              strings are materially longer than the mockup's trimmed ones, and
              the mockup's 24ch re-wrapped them into 4-6 ragged lines, which
              defeats the whole hand-set device (Phase 4/5 review). */}
          <h3
            className="display d-md work-headline"
            aria-label={study.headline}
            style={{ marginTop: study.stat ? "24px" : 0 }}
          >
            {study.headlineLines.map((line, i) => (
              <span
                key={line}
                className="line"
                style={{ "--l": i } as React.CSSProperties}
                aria-hidden="true"
              >
                <span>{line}</span>
              </span>
            ))}
          </h3>

          {sm && (
            // The arrows are decorative; the aria-label carries the sequence as
            // a sentence so the machine is not conveyed by glyphs alone.
            // `role="img"` is load-bearing, not decoration: a bare <div> has
            // the implicit role `generic`, which ARIA PROHIBITS from carrying
            // an accessible name — Chromium and Gecko drop the aria-label
            // outright, so the sequence this diagram exists to communicate
            // reached assistive tech as four unordered pills (Phase 4/5
            // review). With role="img" the label IS the exposed content.
            <div
              className="sm"
              role="img"
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
      {caseStudies.map((study, i) => (
        <Study key={study.name} study={study} anchor={i === 0 ? "case-studies" : undefined} />
      ))}
    </>
  );
}
