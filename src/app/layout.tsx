import type { Metadata } from "next";
import localFont from "next/font/local";
import { Header, Footer, TheConstant } from "@/components/layout";
import { Toaster } from "@/components/ui/Toaster";
import { Analytics } from "@vercel/analytics/next";
import { GoogleAnalytics } from "@/components/analytics/GoogleAnalytics";
import { OrganizationJsonLd } from "@/components/seo/JsonLd";
import { SITE_NAME, getSiteUrl } from "@/lib/site";
import "./globals.css";

// Redesign v4 ("The Number That Doesn't Move"): ONE family for everything —
// Apfel Grotezk (Collletttivo, OFL 1.1; license at src/fonts/APFEL-LICENSE.txt),
// self-hosted, the same one-family discipline the outcrowd.io reference applies
// with ITC Avant Garde. Regular (400) carries body text; Mittel (500) carries
// ALL display type — hierarchy comes from SIZE, never weight, which is why no
// 700 face ships at all (a stray `font-bold` utility would synthesize a faux
// bold; the --font-weight-bold remap in globals.css renders it 500 instead).
// Replaces Figtree AND Instrument Serif (the v3 `.accent` italic is retired
// with its utility — see HANDOFF-redesign-v4.md §1.1).
const apfel = localFont({
  src: [
    { path: "../fonts/ApfelGrotezk-Regular.woff2", weight: "400", style: "normal" },
    { path: "../fonts/ApfelGrotezk-Mittel.woff2", weight: "500", style: "normal" },
  ],
  variable: "--font-apfel",
  display: "swap",
});

// Subscription-forward copy (Bundle D): the live body now leads with the subscription
// model (Bundle C hero + Bundle D pricing), so the title/description/OG match it. This
// closes the positioning-neutral deferral from Bundle A — the OG card scrapers cache no
// longer contradicts the page.
const SITE_TITLE = "Codirity — Your AI & automation team, on subscription";
const SITE_DESCRIPTION =
  "Your AI & automation team, on subscription. Unlimited requests, senior engineering, and AI-accelerated delivery for one flat monthly rate — pause or cancel anytime.";

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: SITE_TITLE,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  // NOTE: canonical + openGraph.url are set PER-PAGE (page.tsx, privacy/page.tsx),
  // not here. Next merges metadata shallowly, so a canonical/url set on the root
  // layout would be inherited unchanged by every route — emitting the homepage
  // canonical on /privacy and risking search-engine consolidation of that page.
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
};

// v4 is SINGLE-THEME (HANDOFF-redesign-v4.md §1.3): the grounds are fixed
// regardless of OS preference, like the reference. The v3 theme machinery —
// ThemeProvider, ThemeToggle, the pre-paint theme-init script, the
// [data-theme] attribute — is removed, which also permanently retires the
// SSR-empty-body mount-gate quirk that machinery once carried. The browser
// UI chrome color is pinned to the fixed ground.
export const viewport = {
  themeColor: "#0A1712",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${apfel.variable} font-sans antialiased`}>
        {/* Header */}
        <Header />

        {/* Main Content */}
        <main>{children}</main>

        {/* Footer */}
        <Footer />

        {/* Toast Notifications */}
        <Toaster />

        {/* The constant — §1.7, visible past the hero (aria-hidden ornament) */}
        <TheConstant />

        {/* Organization structured data (server-rendered for crawlers) */}
        <OrganizationJsonLd />

        {/* Analytics. Two providers, deliberately: GA4 carries the conversion
            events and their history, while Vercel Web Analytics supplies the
            cookieless pageview/referrer/geo picture in the deploy dashboard.
            `@vercel/analytics/next` ships its own "use client" + Suspense
            boundary, so mounting it here keeps this layout a server component. */}
        <GoogleAnalytics />
        <Analytics />
      </body>
    </html>
  );
}
