"use client";

import { useEffect, useRef } from "react";
import { track } from "@/lib/analytics";

/**
 * Fires the `pricing_viewed` conversion event once (to GA4 and Vercel Web
 * Analytics — see src/lib/analytics.ts), when the pricing section scrolls into
 * view. Observes `#pricing`, which since W2 is a full-height absolute alias layer
 * inside the `#terms` band (the section renamed; the alias preserves inbound
 * links, this observer, and the Service JSON-LD offer URLs). It must keep
 * REAL height — a zero-height sentinel never satisfies an IO threshold. Renders
 * nothing; the pricing data itself stays server-rendered.
 */
export function PricingViewedTracker() {
  const fired = useRef(false);

  useEffect(() => {
    const el = document.getElementById("pricing");
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && !fired.current) {
            fired.current = true;
            track("pricing_viewed");
            observer.disconnect();
          }
        }
      },
      // threshold 0 = fire as soon as any part of the (tall) pricing section enters
      // view; a higher threshold can be unreachable when the section is taller than
      // the viewport.
      { threshold: 0 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return null;
}
