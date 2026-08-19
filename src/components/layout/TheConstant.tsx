"use client";

import { useEffect } from "react";

// The constant (HANDOFF-redesign-v4 §1.7): once the hero scrolls out,
// "$3,995/mo — the number that doesn't move" sits fixed and vertical on the
// right margin. Everything on the page moves past it; the price never moves —
// the flat-rate promise made behavior instead of copy.
//
// Deliberately inert to every input surface: aria-hidden (screen readers get
// the price from the hero ledger and the terms band, not an ornament),
// pointer-events none, and never focusable — it cannot trap focus or overlap
// a focus ring because it does not participate in interaction at all. The
// figure is the same real tiers[0].price every other surface renders.
//
// Two body classes drive its CSS (globals `.constant`): `past-hero` (visible
// once #hero has left the viewport) and `on-light` (ink tone while a
// light-ground section is under the folio's position). Both are IO-driven;
// under prefers-reduced-motion the CSS transition is inert but the states
// still apply — the folio simply appears/recolors without animating.
export function TheConstant() {
  useEffect(() => {
    const hero = document.getElementById("hero");
    const heroIO = hero
      ? new IntersectionObserver(([e]) =>
          document.body.classList.toggle("past-hero", !e.isIntersecting)
        )
      : null;
    if (hero && heroIO) heroIO.observe(hero);

    // Light-ground detection: Section renders data-ground on every section
    // (light for the paper/white variants). The rootMargin band approximates
    // the folio's bottom-right position.
    const lightIO = new IntersectionObserver(
      (entries) =>
        document.body.classList.toggle(
          "on-light",
          entries.some((e) => e.isIntersecting)
        ),
      { rootMargin: "-75% 0px -18px 0px" }
    );
    document
      .querySelectorAll('[data-ground="light"]')
      .forEach((s) => lightIO.observe(s));

    return () => {
      heroIO?.disconnect();
      lightIO.disconnect();
      document.body.classList.remove("past-hero", "on-light");
    };
  }, []);

  return (
    <span className="constant" aria-hidden="true">
      $3,995/mo — the number that doesn&apos;t move
    </span>
  );
}
