"use client";

import { track, type AnalyticsEvent } from "@/lib/analytics";

interface TrackedLinkProps {
  href: string;
  event: AnalyticsEvent;
  external?: boolean;
  className?: string;
  children: React.ReactNode;
}

/** An anchor that fires a GA4 event on click (used for the Stripe checkout CTAs). */
export function TrackedLink({
  href,
  event,
  external,
  className,
  children,
}: TrackedLinkProps) {
  return (
    <a
      href={href}
      onClick={() => track(event)}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      className={className}
    >
      {children}
    </a>
  );
}
