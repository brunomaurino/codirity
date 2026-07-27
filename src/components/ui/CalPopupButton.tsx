"use client";

import { useCallback, useRef } from "react";
import { track } from "@/lib/analytics";

interface CalPopupButtonProps {
  calLink: string;
  children: React.ReactNode;
  className?: string;
}

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
