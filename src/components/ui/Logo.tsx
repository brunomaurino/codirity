import { cn } from "@/lib/utils";

/**
 * Codirity logo — concept B, "the aperture".
 *
 * A monoline C with pill terminals (the system's shape) and the live dot in the
 * aperture. Mint is the system's live/interactive colour and this dot is the
 * only place the logo is allowed to use it.
 *
 * The mark is INLINE rather than an `<img src="/logo-mark.svg">` for two
 * reasons: the ring paints in `currentColor`, so the header's ground-tracking
 * tone (`text-chalk` over the dark hero, `text-gray-900` on the light chrome)
 * carries into it for free; and the dot keeps the `animate-pulse-dot` class the
 * header has always carried, which an external file cannot be given.
 *
 * The wordmark is live text, not outlines — it is the page font at the page's
 * own tracking, so it stays selectable, scales with the type scale, and never
 * drifts from the rest of the site. `public/logo-lockup*.svg` are the outlined
 * cuts, for anywhere Apfel Grotezk is not loaded (email, decks, third parties).
 *
 * Geometry is generated from `docs/logo-explore/mark.py`, which solves the
 * stroke weight against Apfel Grotezk Mittel's round-letter stroke (114/1000em)
 * at the lockup's 1.45 mark-to-cap ratio. Keep the two in step.
 */

interface LogoProps {
  /** Hides the wordmark, leaving the mark alone (mobile chrome, avatars). */
  markOnly?: boolean;
  /** Stills the live dot. Set it wherever the mark is decorative, not chrome. */
  static?: boolean;
  className?: string;
}

export function Logo({ markOnly = false, static: isStatic = false, className }: LogoProps) {
  return (
    <span className={cn("inline-flex items-center gap-[0.34em]", className)}>
      {/* 1.45 x cap height: the mark's ink box is 91 units tall and the wordmark's
          cap is 0.65em, so 1.45 lands the mark at ~0.94em next to the type. */}
      <svg
        viewBox="14.5 14.5 93.5 91"
        fill="none"
        aria-hidden="true"
        focusable="false"
        className="h-[0.94em] w-auto shrink-0 overflow-visible"
      >
        <path
          d="M85.71 29.36A40 40 0 1 0 85.71 90.64"
          fill="none"
          stroke="currentColor"
          strokeWidth="11"
          strokeLinecap="round"
        />
        <circle
          cx="100"
          cy="60"
          r="8"
          fill="var(--mint)"
          className={cn(!isStatic && "animate-pulse-dot")}
          style={{ transformOrigin: "100px 60px" }}
        />
      </svg>
      {!markOnly && <span className="tracking-[-0.012em]">Codirity</span>}
      {markOnly && <span className="sr-only">Codirity</span>}
    </span>
  );
}
