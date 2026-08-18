"use client";

import { useCallback, useRef } from "react";
import { track } from "@/lib/analytics";

interface CalPopupButtonProps {
  calLink: string;
  children: React.ReactNode;
  className?: string;
  /** Optional side effect to run on click, alongside (never instead of) the
   *  embed load + `call_booked` tracking below — e.g. closing a mobile nav
   *  menu the button sits inside so the Cal popup isn't left rendering over
   *  a still-open menu. */
  onOpen?: () => void;
}

// The Cal.com embed API is a page-level singleton shared by every
// CalPopupButton on the page (Hero, Faq, ContactInfo, PricingCard, and the
// Header's desktop + mobile nav — six instances as of redesign-v3 Bundle V1;
// mounted from the root layout, so every route renders at least the two nav
// instances now, not just the ones on the homepage), so the booking listener
// must be registered exactly once. Registering per instance would emit one
// duplicate `call_booking_completed` per mounted button for a single real
// booking.
//
// The latch lives on `window`, not in module scope, because a module-scope flag
// is reset by React Fast Refresh while the listener it guards — held by the Cal
// singleton on the same `window` — survives the refresh. That mismatch would
// re-register a second listener during development and double-count bookings.
declare global {
  interface Window {
    __codirityCalBookingListener?: boolean;
  }
}

export function CalPopupButton({
  calLink,
  children,
  className,
  onOpen,
}: CalPopupButtonProps) {
  const ready = useRef(false);
  const loading = useRef(false);

  // Lazily load the Cal.com embed on first interaction so @calcom/embed-react is
  // NOT part of the initial bundle — it splits into an on-demand chunk that only
  // loads when a visitor actually engages a "book a call" button. Arm on hover /
  // focus / pointer-down so the embed's click delegation is ready by click time.
  // `ready` is only latched on SUCCESS (and `loading` guards concurrent calls), so a
  // failed chunk load — e.g. a stale-chunk error after a redeploy — is retried on the
  // next interaction rather than permanently disabling the button. Errors are caught
  // internally, so the fire-and-forget callers never see an unhandled rejection.
  const ensureCal = useCallback(async () => {
    if (ready.current || loading.current) return;
    loading.current = true;
    try {
      const { getCalApi } = await import("@calcom/embed-react");
      const cal = await getCalApi();
      cal("ui", {
        // --green-main #127a44 (globals.css) — was the pitch artifact's
        // literal #189656, which globals.css documents rejecting for
        // measuring 3.17:1 on paper (AA-large only); on Cal's own white-text
        // primary-action buttons #189656 measured ~3.79:1, still below AA.
        // #127a44 clears 5.39:1. Found + fixed in Phase 4/5 review — this
        // was the same rejected hex leaking back in through a component
        // that sets it as a literal string, not a CSS var reference.
        styles: { branding: { brandColor: "#127a44" } },
        hideEventTypeDetails: false,
        layout: "month_view",
      });
      if (!window.__codirityCalBookingListener) {
        // The real conversion, as opposed to the `call_booked` click above.
        // `bookingSuccessfulV2` is the supported action — the older
        // `bookingSuccessful` is marked deprecated in @calcom/embed-core and
        // carries the organizer's name and email, which we have no reason to
        // touch. The payload is ignored entirely: the event name is the signal.
        cal("on", {
          action: "bookingSuccessfulV2",
          callback: () => {
            track("call_booking_completed");
          },
        });
        window.__codirityCalBookingListener = true;
      }
      ready.current = true;
    } catch {
      // Leave `ready` false so a later interaction retries the load.
    } finally {
      loading.current = false;
    }
  }, []);

  return (
    <button
      type="button"
      data-cal-link={calLink}
      data-cal-config='{"layout":"month_view"}'
      onPointerEnter={ensureCal}
      onFocus={ensureCal}
      onPointerDown={ensureCal}
      onClick={() => {
        void ensureCal();
        track("call_booked");
        onOpen?.();
      }}
      className={className}
    >
      {children}
    </button>
  );
}
