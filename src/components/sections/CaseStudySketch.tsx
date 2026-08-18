import type { CaseStudy } from "@/config/offer";

/**
 * Hand-drawn-feel architecture sketches for the case studies.
 *
 * WHY these exist, and why they are hand-drawn rather than polished: v1's
 * `HANDOFF-redesign.md` §6.R8 argued that the category's tell is fabricated-
 * looking testimonials, and that a real architecture diagram is the one piece of
 * proof that can't be faked casually. That reasoning survives the visual-system
 * change; the treatment is deliberately a sketch, never isometric stock art and
 * never a screenshot.
 *
 * ⚠️ A DIAGRAM IS A FACTUAL CLAIM. Every labelled node below names a component
 * `HANDOFF-redesign-v3.md` §7 states was actually built. Nothing is added for
 * visual balance — an invented box is an invented fact, and it is a harder one
 * to catch than invented prose because a diagram reads as documentation. Two
 * consequences worth stating so a later edit doesn't undo them:
 *   - Meshio's Stripe tiers are NOT drawn. §7 says they were "specced", not
 *     shipped, and a box in an architecture diagram asserts a built thing. The
 *     prose says "specced" and that is the only place it appears.
 *   - No LLM vendor or model is named anywhere. §7 forbids committing to one.
 *
 * Rendering notes: pure inline SVG, no dependency, no raster asset. Strokes and
 * text use `currentColor` so the sketch inherits the card's foreground in both
 * themes rather than hardcoding a colour that only works in one. The wobble is
 * hand-authored into the path coordinates (a few px of irregularity per edge),
 * not generated — it must be identical between server and client render, and a
 * randomised roughness would hydrate-mismatch.
 */

const STROKE = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

/** A slightly-wobbly rounded box. Coordinates are hand-offset so no two edges
 *  are perfectly parallel — that irregularity is the whole "drawn by a person"
 *  effect. */
function Box({ x, y, w, h, label, sub }: { x: number; y: number; w: number; h: number; label: string; sub?: string }) {
  const d = [
    `M ${x + 6} ${y + 1}`,
    `L ${x + w - 5} ${y - 1}`,
    `Q ${x + w + 2} ${y + 2} ${x + w} ${y + 8}`,
    `L ${x + w + 1} ${y + h - 6}`,
    `Q ${x + w - 1} ${y + h + 1} ${x + w - 8} ${y + h}`,
    `L ${x + 7} ${y + h + 1}`,
    `Q ${x - 2} ${y + h - 1} ${x} ${y + h - 8}`,
    `L ${x - 1} ${y + 7}`,
    `Q ${x + 1} ${y - 1} ${x + 6} ${y + 1}`,
    "Z",
  ].join(" ");
  return (
    <g>
      <path d={d} {...STROKE} />
      <text
        x={x + w / 2}
        y={sub ? y + h / 2 - 2 : y + h / 2 + 5}
        textAnchor="middle"
        fontSize="15"
        fontWeight="600"
        fill="currentColor"
      >
        {label}
      </text>
      {sub && (
        <text x={x + w / 2} y={y + h / 2 + 15} textAnchor="middle" fontSize="12" fill="currentColor" opacity="0.72">
          {sub}
        </text>
      )}
    </g>
  );
}

/** A wobbly arrow. `dx`/`dy` bow the midpoint so the line isn't mechanically straight. */
function Arrow({ x1, y1, x2, y2, bow = 4 }: { x1: number; y1: number; x2: number; y2: number; bow?: number }) {
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2 - bow;
  const angle = Math.atan2(y2 - my, x2 - mx);
  const head = 6;
  return (
    <g>
      <path d={`M ${x1} ${y1} Q ${mx} ${my} ${x2} ${y2}`} {...STROKE} />
      <path
        d={`M ${x2} ${y2} L ${x2 - head * Math.cos(angle - 0.5)} ${y2 - head * Math.sin(angle - 0.5)}
            M ${x2} ${y2} L ${x2 - head * Math.cos(angle + 0.5)} ${y2 - head * Math.sin(angle + 0.5)}`}
        {...STROKE}
      />
    </g>
  );
}

function EdairymarketSketch() {
  return (
    <svg
      viewBox="0 0 620 250"
      role="img"
      aria-labelledby="sketch-edairymarket"
      className="h-auto w-full min-w-[520px]"
    >
      <title id="sketch-edairymarket">
        Architecture sketch: buyers reach a Next.js server-rendered storefront, which calls NestJS APIs;
        a React admin panel calls the same APIs. The APIs handle Stripe seller subscriptions. The
        storefront, admin panel and APIs run on isolated AWS infrastructure that deploys automatically on
        merge to trunk.
      </title>

      {/* The AWS boundary — §7: "migration ... onto isolated AWS infra with
          merge-to-trunk auto-deploy".

          ⚠️ WHAT IT ENCLOSES IS ITSELF A CLAIM. An earlier version drew this
          around EVERYTHING, including the Buyers actor and Stripe — asserting
          that end users and a third-party payment provider run inside the
          client's AWS account. §7 supports only prod/dev/admin moving onto
          isolated infra, so the boundary now contains exactly the three
          services it moved and nothing else. Caught in Phase 4/5 review, which
          also noted the accessible description repeated the wrong claim to
          screen readers. */}
      <path
        d="M 136 46 L 470 42 Q 476 44 475 52 L 476 232 Q 474 240 466 239 L 142 241 Q 135 239 136 231 Z"
        {...STROKE}
        strokeDasharray="7 6"
        opacity="0.5"
      />
      <text x="146" y="34" fontSize="11.5" fontWeight="700" fill="currentColor" opacity="0.72" letterSpacing="0.05em">
        ISOLATED AWS · AUTO-DEPLOY ON MERGE TO TRUNK
      </text>

      {/* Buyers sit OUTSIDE the boundary — they are actors, not deployed services. */}
      <Box x={12} y={104} w={104} h={52} label="Buyers" />

      <Box x={152} y={62} w={150} h={60} label="Next.js storefront" sub="server-rendered" />
      {/* §7 lists the admin panel as a rebuilt surface and as one endpoint of the
          server-side filter system. It does NOT say who uses it, and an earlier
          version drew a Sellers → admin panel arrow asserting seller-facing use —
          unsourced, and admin panels are conventionally internal. The actor box
          and that arrow are both gone; the panel is labelled for what §7 supports. */}
      <Box x={152} y={158} w={150} h={60} label="React admin panel" />

      <Box x={330} y={106} w={126} h={64} label="NestJS APIs" sub="server-side filtering" />

      <Arrow x1={118} y1={128} x2={148} y2={100} />
      <Arrow x1={304} y1={96} x2={326} y2={126} />
      <Arrow x1={304} y1={186} x2={326} y2={152} bow={-4} />

      {/* Stripe is third-party, so it sits outside the AWS boundary — §7:
          "Stripe seller subscriptions (three tiers)". */}
      <Box x={496} y={110} w={112} h={56} label="Stripe" sub="seller subs" />
      <Arrow x1={458} y1={138} x2={492} y2={138} bow={2} />
    </svg>
  );
}

function MeshioSketch() {
  return (
    <svg
      viewBox="0 0 620 210"
      role="img"
      aria-labelledby="sketch-meshio"
      className="h-auto w-full min-w-[520px]"
    >
      <title id="sketch-meshio">
        Architecture sketch: an onboarding state machine running New, then Niche set, then Voice set,
        then Activated — where activated means the first post is published. OAuth sign-in is required
        only at the last step, after the user has already seen the product.
      </title>

      <text x="16" y="28" fontSize="11.5" fontWeight="700" fill="currentColor" opacity="0.72" letterSpacing="0.05em">
        ONBOARDING STATE MACHINE
      </text>

      <Box x={16} y={54} w={116} h={52} label="New" />
      <Box x={172} y={54} w={116} h={52} label="Niche set" />
      <Box x={328} y={54} w={116} h={52} label="Voice set" />
      <Box x={484} y={54} w={120} h={52} label="Activated" sub="first post published" />

      <Arrow x1={134} y1={80} x2={168} y2={80} />
      <Arrow x1={290} y1={80} x2={324} y2={80} />
      <Arrow x1={446} y1={80} x2={480} y2={80} />

      {/* §7: "OAuth sign-in deliberately deferred until the point the user
          actually needs it". Drawn at the LAST transition, which is the claim —
          placing it anywhere earlier would invert the decision the study is about. */}
      <path d="M 463 132 L 463 106" {...STROKE} strokeDasharray="5 5" />
      <Box x={396} y={132} w={150} h={44} label="OAuth sign-in" sub="deferred to here" />

      <text x={16} y={192} fontSize="12.5" fill="currentColor" opacity="0.72">
        Friction lands after the user has seen the product, not before.
      </text>
    </svg>
  );
}

export function CaseStudySketch({ sketch }: { sketch: CaseStudy["sketch"] }) {
  return sketch === "edairymarket" ? <EdairymarketSketch /> : <MeshioSketch />;
}
