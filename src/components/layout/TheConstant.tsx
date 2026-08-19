"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { tiers } from "@/config/offer";

// The constant (HANDOFF-redesign-v4 §1.7): once the hero scrolls out,
// "<price>/mo — the number that doesn't move" sits fixed and vertical on the
// right margin. Everything on the page moves past it; the price never moves —
// the flat-rate promise made behavior instead of copy. The figure COMPOSES
// from tiers[0] (battery finding: the first draft hardcoded it while claiming
// derivation — the one number the design is named after had no drift guard).
//
// Inert to every input surface: aria-hidden, pointer-events none, never
// focusable. Without JS it stays hidden — §1.7 wants it hidden until past the
// hero, and with no JS the managing classes never apply, so permanent-hidden
// is the correct degradation (not the old scripting:none opacity:1 force,
// which showed it chalk-dim over paper at ~1.8:1).
//
// Effects re-arm on EVERY route change (battery finding: a root-layout
// component never unmounts under App Router client navigation, so a
// once-bound effect left `past-hero` stuck across routes — the folio rendered
// chalk-dim on /privacy's white ground and never re-found a new #hero).
export function TheConstant() {
  const pathname = usePathname();

  useEffect(() => {
    // Reset before re-binding: whatever the previous route left on <body> is
    // stale by definition.
    document.body.classList.remove("past-hero", "on-light");

    const hero = document.getElementById("hero");
    const heroIO = hero
      ? new IntersectionObserver(([e]) =>
          document.body.classList.toggle("past-hero", !e.isIntersecting)
        )
      : null;
    if (hero && heroIO) heroIO.observe(hero);
    // No hero on this route → past-hero stays false → the folio never shows.
    // That is the intended behavior for secondary pages.

    // on-light: a SET of currently-intersecting light sections, not a
    // per-batch .some() — IO callbacks after the first carry only CHANGED
    // entries, so with adjacent light sections a single leave-event used to
    // wipe the class while another light section was still under the folio
    // (battery finding: folio rendered chalk-dim over paper for most of the
    // light run).
    const lightUnderFolio = new Set<Element>();
    const lightIO = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) lightUnderFolio.add(e.target);
          else lightUnderFolio.delete(e.target);
        });
        document.body.classList.toggle("on-light", lightUnderFolio.size > 0);
      },
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
  }, [pathname]);

  return (
    <span className="constant" aria-hidden="true">
      {tiers[0].price}
      {tiers[0].period} — the number that doesn&apos;t move
    </span>
  );
}
