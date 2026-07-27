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
  const initialized = useRef(false);

  // Lazily load the Cal.com embed on first interaction so @calcom/embed-react is
  // NOT part of the initial bundle — it splits into an on-demand chunk that only
  // loads when a visitor actually engages a "book a call" button. Arm on hover /
  // focus / pointer-down so the embed's click delegation is ready by click time.
  const ensureCal = useCallback(async () => {
    if (initialized.current) return;
    initialized.current = true;
    const { getCalApi } = await import("@calcom/embed-react");
    const cal = await getCalApi();
    cal("ui", {
      styles: { branding: { brandColor: "#32CD32" } },
      hideEventTypeDetails: false,
      layout: "month_view",
    });
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
