import { clients, sections } from "@/config/offer";

// The clients strip — "who's on the board" (Bundle W4, v4 treatment).
//
// Every name, tag and story comes from `offer.ts` `clients[]`. The tag set is
// COMPOSED, not written: every entry carries "client" (the 2026-08-18 D6
// amendment recorded in offer.ts presents all three that way), plus
// "pre-launch" when `preLaunch` is true. Hardcoding the tags would let the
// badge drift from the flag — and "pre-launch" is a factual claim about
// whether an app has shipped, not decoration.

export function RecentWork() {
  if (clients.length === 0) return null;
  return (
    // `id="work"` is preserved from the pre-rework section: it is a PUBLIC
    // anchor, and dropping it would silently 404 any inbound link to
    // /#work. Same precedent as W2 keeping `#pricing` alive inside `#terms`.
    <section
      id="work"
      data-ground="dark"
      className="relative bg-ground text-chalk py-16 md:py-24 lg:py-28"
    >
      <div className="wrap-v4">
        {/* The mockup's eyebrow here IS the section's title ("Already on the
            board"), so it ships as a real <h2> wearing `.label` rather than as
            a <p> plus a duplicate sr-only heading — visually identical, and the
            section keeps a heading in the outline without saying it twice. */}
        <h2 className="label rv fade" style={{ marginBottom: "clamp(28px, 4vw, 52px)" }}>
          {sections.recentWork.title}
        </h2>
        <div className="clients rv">
          {clients.map((client, i) => (
            <div
              key={client.name}
              className="client fade"
              style={{ "--l": i } as React.CSSProperties}
            >
              <h3>
                {client.name}
                <span className="tag">client</span>
                {client.preLaunch && <span className="tag">pre-launch</span>}
              </h3>
              <p>{client.story}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
