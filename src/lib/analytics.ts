/**
 * Conversion-event helper. Fans one named event out to BOTH analytics providers
 * the site runs, and stays silent wherever a provider isn't there:
 *
 * - **GA4**, through the `gtag` shim loaded by `analytics/GoogleAnalytics.tsx`.
 *   Absent when `NEXT_PUBLIC_GA_MEASUREMENT_ID` is unset or gtag.js was blocked.
 * - **Vercel Web Analytics**, through `<Analytics />` in the root layout. Its
 *   `track()` is a `window.va?.call(...)` internally, so it is a no-op — not an
 *   error — when the insights script hasn't loaded (ad-blocker, or a non-Vercel
 *   host such as a local `next start`).
 *
 * Neither provider can throw out of `track()`, so calling it straight from an
 * event handler is safe.
 *
 * NOTE on the Vercel side: custom events are a Pro/Enterprise feature. On a
 * Hobby account Vercel records pageviews and discards these events, while GA4
 * still records them. The wiring is identical either way, so an account upgrade
 * turns them on with no code change.
 */

import { track as vercelTrack } from "@vercel/analytics";

/**
 * The lead funnel, in the order a visitor moves through it. These strings are
 * the literal event names in both dashboards, so renaming one breaks continuity
 * with data already collected under the old name.
 */
export type AnalyticsEvent =
  // Arrival → pricing
  | "hero_cta_click"
  | "pricing_viewed"
  // Checkout intent, one per tier
  | "checkout_click_standard"
  | "checkout_click_pro"
  | "checkout_click_founding"
  // Call booking. `call_booked` is INTENT — it fires when a "book a call"
  // button is clicked, which is not the same thing as a booking. The actual
  // conversion is `call_booking_completed`, sourced from Cal.com's own
  // confirmation callback. `call_booked` keeps its imprecise name because GA4
  // history already exists under it.
  | "call_booked"
  | "call_booking_completed"
  // Contact form
  | "contact_form_submitted"
  | "contact_form_success"
  | "contact_form_error"
  // Other direct lead signals
  | "email_click"
  | "faq_opened";

/**
 * Property values Vercel Web Analytics accepts. GA4 accepts a superset, so the
 * narrower type governs; anything else is rejected by Vercel at runtime (thrown
 * in dev, silently stripped in prod), which this type prevents at compile time.
 */
export type AnalyticsPropertyValue = string | number | boolean | null;

export type AnalyticsParams = Record<string, AnalyticsPropertyValue>;

type Gtag = (
  command: "event",
  eventName: string,
  params?: AnalyticsParams
) => void;

declare global {
  interface Window {
    gtag?: Gtag;
  }
}

// Vercel caps event names, property keys, and property values at 255 characters
// each, and (on Pro) accepts at most 2 properties per event.
// https://vercel.com/docs/analytics/custom-events#limitations
//
// Only the VALUE cap is enforced below, and deliberately so: values are the one
// place free text enters — `faq_opened` carries a question string sourced from
// editable config, so a copy change could cross 255 characters with no type
// error. Event names and property keys are string literals written here in
// source, and the property count is visible at each call site, so both are
// reviewable rather than clamped at runtime.
const MAX_PROPERTY_VALUE_LENGTH = 255;

function clampPropertyValues(params: AnalyticsParams): AnalyticsParams {
  const clamped: AnalyticsParams = {};
  for (const [key, value] of Object.entries(params)) {
    clamped[key] =
      typeof value === "string" && value.length > MAX_PROPERTY_VALUE_LENGTH
        ? value.slice(0, MAX_PROPERTY_VALUE_LENGTH)
        : value;
  }
  return clamped;
}

/**
 * Emit a conversion event to every configured provider.
 *
 * Keep `params` to at most two properties: that is the per-event ceiling on
 * Vercel's Pro plan, and properties past it are dropped rather than reported.
 * This is a review-time rule, not a runtime check — see the note above.
 */
export function track(event: AnalyticsEvent, params?: AnalyticsParams): void {
  if (typeof window === "undefined") return;

  const data = params ? clampPropertyValues(params) : undefined;

  if (typeof window.gtag === "function") {
    window.gtag("event", event, data);
  }

  vercelTrack(event, data);
}
