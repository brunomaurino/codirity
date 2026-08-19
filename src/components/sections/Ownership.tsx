import { faq, OWNERSHIP_FAQ_INDEX } from "@/config/offer";

// The ownership block (Bundle W6, v4 treatment) — the "Who owns the code and
// the accounts?" FAQ answer promoted to a display-size quote on the dark ground.
//
// This is the site's HONEST SUBSTITUTE FOR AN AWARDS WALL. There are no logos to
// show, no funding to announce, no testimonials to quote — so the closing claim
// is the one thing that is both true and unusual to say out loud: the client
// keeps the repos, the infrastructure and the credentials, and could fire us
// without losing the system.
//
// Read by INDEX, not by searching for the question text: W5's founder block
// used a magic-string `.find()` and `return null`ed the whole section on a miss,
// with no type, build or runtime signal (Phase 4/5 review). A bad index throws
// at module load instead.

const OWNERSHIP = faq[OWNERSHIP_FAQ_INDEX];
if (!OWNERSHIP) {
  throw new Error(
    `OWNERSHIP_FAQ_INDEX (${OWNERSHIP_FAQ_INDEX}) is out of range for faq[] (length ${faq.length}).`
  );
}

export function Ownership() {
  return (
    <section
      id="ownership"
      data-ground="dark"
      className="own relative bg-ground text-chalk pt-16 md:pt-24 lg:pt-28"
    >
      <div className="wrap-v4 rv">
        <h2 className="label fade" style={{ marginBottom: "clamp(24px, 3vw, 40px)" }}>
          {OWNERSHIP.question}
        </h2>
        <figure style={{ margin: 0 }}>
          <blockquote className="fade" style={{ "--l": 1 } as React.CSSProperties}>
            {OWNERSHIP.answer}
          </blockquote>
        </figure>
      </div>
    </section>
  );
}
