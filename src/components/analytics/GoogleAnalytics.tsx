"use client";

import Script from "next/script";

export function GoogleAnalytics() {
  const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

  if (!gaId) return null;

  return (
    <>
      {/* gtag.js is ~178 KB. `afterInteractive` makes Next emit a <head>
          preload for it, so on mobile it competed with the CSS and fonts for
          first paint (Lighthouse, 2026-10-02). `lazyOnload` fetches it after
          the page has loaded. Nothing is lost meanwhile: the inline shim below
          stays `afterInteractive`, defines `gtag` and queues every call in
          `dataLayer`, which gtag.js replays when it arrives. */}
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
        strategy="lazyOnload"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${gaId}');
        `}
      </Script>
    </>
  );
}
