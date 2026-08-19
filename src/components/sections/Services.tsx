import { included, notIncluded, sections } from "@/config/offer";

// What we build (Bundle W5, v4 treatment) — one full-width ruled list on paper.
//
// The accepted and the DECLINED live in the SAME list, because that is the
// argument: what we say no to is part of the offer, not a footnote. Each
// declined row draws its own strike once the list enters view, and carries the
// words "we say no" — the refusal stated, not implied by styling alone.
//
// STRINGS ARE VERBATIM from offer.ts and rendered by mapping the arrays whole.
// v3 shipped a paraphrase here AND silently dropped one item, which is why
// scripts/w5-copy-gate.py diffs both arrays literally and in both directions —
// a reworded item and a missing one both fail.

export function Services() {
  return (
    <section id="services" data-ground="light" className="paper relative py-16 md:py-24 lg:py-28">
      <div className="wrap-v4">
        {/* The mockup's display heading here is the section's LABEL ("What we
            build"), not its `title` — the v4 treatment drops the explanatory
            title and description and lets the list itself do the explaining.
            `display` carries the leading and tracking; `.d-lg` is font-size
            only. */}
        <h2 className="display d-lg rv" style={{ marginBottom: "clamp(36px, 5vw, 72px)" }}>
          <span className="line">
            <span>{sections.whatWeBuild.label}</span>
          </span>
        </h2>

        <ul className="svc-list rv">
          {included.map((item) => (
            <li key={item}>
              <span className="svc-name">{item}</span>
            </li>
          ))}
          {notIncluded.map((item, i) => (
            <li key={item} className="declined">
              {/* `--l` staggers each strike; the empty span IS the strike rule
                  (an absolutely-positioned bar that scales from the left). */}
              <span className="svc-name" style={{ "--l": i } as React.CSSProperties}>
                {item}
                <span className="strike" aria-hidden="true" />
              </span>
              <span className="svc-no">we say no</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
