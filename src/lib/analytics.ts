/**
 * Tiny GA4 event helper. Safely forwards a named event to gtag (loaded by
 * GoogleAnalytics.tsx) and no-ops on the server or when gtag isn't present
 * (e.g. no NEXT_PUBLIC_GA_MEASUREMENT_ID, or an ad-blocker).
 */

// The 5 conversion events instrumented for the subscription launch (TR-4).
export type AnalyticsEvent =
  | "pricing_viewed"
  | "checkout_click_standard"
  | "checkout_click_pro"
  | "call_booked"
  | "faq_opened";

type Gtag = (
  command: "event",
  eventName: string,
  params?: Record<string, unknown>
) => void;

declare global {
  interface Window {
    gtag?: Gtag;
  }
}

export function track(
  event: AnalyticsEvent,
  params?: Record<string, unknown>
): void {
  if (typeof window === "undefined") return;
  if (typeof window.gtag !== "function") return;
  window.gtag("event", event, params);
}
