"use client";

import { useEffect, useRef } from "react";
import { track } from "@/lib/analytics";

/**
 * Fires the `pricing_viewed` GA4 event once, when the pricing section scrolls into
 * view. Renders an invisible marker (the pricing data itself stays server-rendered).
 */
export function PricingViewedTracker() {
  const ref = useRef<HTMLDivElement>(null);
  const fired = useRef(false);

  useEffect(() => {
    const el = ref.current;
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
      { threshold: 0.3 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return <div ref={ref} aria-hidden="true" />;
}
