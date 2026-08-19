import { cn } from "@/lib/utils";

interface SectionProps {
  id?: string;
  children: React.ReactNode;
  className?: string;
  /**
   * Background variant for the section
   * - default: white background
   * - gray: light gray background
   * - gradient: green gradient background
   * - ink: the v4 dark ground. SUPERSEDED RULE: v3 allowed exactly ONE ink
   *   section site-wide (the closing CTA) because the page was otherwise light.
   *   v4 inverts that premise — the brand green IS the ground
   *   (HANDOFF-redesign-v4.md §1.2), so dark sections are the norm and the
   *   one-per-site restriction no longer applies. W3-W6 may use this freely.
   *   Uses the same `gray-900` token pair the footer already uses (#0A1712 (v4 ground, via the re-pointed gray-900 token)
   *   light / #171713 dark) so the CTA and footer are the same black, and
   *   `text-white` — true white in BOTH themes, the correct foreground for a
   *   permanently-dark surface (see the `--white` note in globals.css).
   */
  variant?: "default" | "gray" | "gradient" | "ink";
  /**
   * Padding size
   * - default: standard section padding
   * - compact: reduced padding
   * - hero: extra padding for hero sections
   */
  padding?: "default" | "compact" | "hero";
}

export function Section({
  id,
  children,
  className,
  variant = "default",
  padding = "default",
}: SectionProps) {
  // data-ground: consumed by TheConstant's tone-flip IO (W1). Only `ink`
  // is a dark ground; `gradient` is a light green TINT over the page (so it
  // maps to light), and default/gray are light surfaces.
  const groundTone = variant === "ink" ? "dark" : "light";
  return (
    <section
      id={id}
      data-ground={groundTone}
      className={cn(
        "relative z-10",
        // Padding variants
        padding === "default" && "py-16 md:py-24 lg:py-28 px-4 md:px-8",
        padding === "compact" && "py-12 md:py-16 px-4 md:px-8",
        padding === "hero" &&
          "min-h-screen py-24 md:py-32 lg:py-40 px-4 md:px-8 lg:px-16",
        // Background variants
        variant === "default" && "bg-white dark:bg-gray-900",
        variant === "gray" && "bg-gray-50 dark:bg-gray-800",
        // v4 tokens directly: the legacy pair resolved the ground correctly
        // but painted pure white instead of --chalk (Phase 4/5 review).
        variant === "ink" && "bg-ground text-chalk",
        variant === "gradient" && [
          "bg-[linear-gradient(180deg,_rgba(50,_205,_50,_0.06)_0%,_rgba(89,_243,_89,_0.1)_50%,_rgba(50,_205,_50,_0.06)_100%)]",
          "dark:bg-[linear-gradient(180deg,_rgba(50,_205,_50,_0.1)_0%,_rgba(89,_243,_89,_0.15)_50%,_rgba(50,_205,_50,_0.1)_100%)]",
        ],
        className
      )}
    >
      {children}
    </section>
  );
}
