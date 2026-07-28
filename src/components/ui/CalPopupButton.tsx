"use client";

import { useCallback, useRef } from "react";
import { track } from "@/lib/analytics";

interface CalPopupButtonProps {
  calLink: string;
  children: React.ReactNode;
  className?: string;
}

// The Cal.com embed API is a page-level singleton shared by every
// CalPopupButton on the page (Hero, Pricing, FAQ, Contact — four instances
// today), so the booking listener is registered once at module scope. Per
// instance it would emit one duplicate `call_booking_completed` per mounted
// button for a single real booking.
let bookingListenerRegistered = false;

export function CalPopupButton({
  calLink,
  children,
  className,
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
        styles: { branding: { brandColor: "#32CD32" } },
        hideEventTypeDetails: false,
        layout: "month_view",
      });
      if (!bookingListenerRegistered) {
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
        bookingListenerRegistered = true;
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
      }}
      className={className}
    >
      {children}
    </button>
  );
}
