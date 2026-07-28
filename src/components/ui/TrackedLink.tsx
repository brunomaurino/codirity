"use client";

import {
  track,
  type AnalyticsEvent,
  type AnalyticsParams,
} from "@/lib/analytics";

interface TrackedLinkProps {
  href: string;
  event: AnalyticsEvent;
  /** Optional event properties — e.g. which surface the link was clicked from. */
  eventParams?: AnalyticsParams;
  external?: boolean;
  className?: string;
  children: React.ReactNode;
}

/**
 * An anchor that fires a conversion event on click. Used for every outbound
 * lead action: the Stripe checkout CTAs, the founding-rate banner, the hero
 * CTA, and the mailto links.
 */
export function TrackedLink({
  href,
  event,
  eventParams,
  external,
  className,
  children,
}: TrackedLinkProps) {
  return (
    <a
      href={href}
      onClick={() => track(event, eventParams)}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      className={className}
    >
      {children}
    </a>
  );
}
