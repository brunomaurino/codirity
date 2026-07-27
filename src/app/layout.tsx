import type { Metadata } from "next";
import { Outfit, Space_Mono } from "next/font/google";
import { Header, Footer } from "@/components/layout";
import { ThemeProvider } from "@/components/theme";
import { Toaster } from "@/components/ui/Toaster";
import { GoogleAnalytics } from "@/components/analytics/GoogleAnalytics";
import { OrganizationJsonLd } from "@/components/seo/JsonLd";
import { SITE_NAME, getSiteUrl } from "@/lib/site";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

const spaceMono = Space_Mono({
  variable: "--font-space-mono",
  subsets: ["latin"],
  weight: ["400", "700"],
});

// Subscription-forward copy (Bundle D): the live body now leads with the subscription
// model (Bundle C hero + Bundle D pricing), so the title/description/OG match it. This
// closes the positioning-neutral deferral from Bundle A — the OG card scrapers cache no
// longer contradicts the page.
const SITE_TITLE = "Codirity — Your AI & automation team, on subscription";
const SITE_DESCRIPTION =
  "Your AI & automation team, on subscription. Unlimited requests, senior engineering, and AI-accelerated delivery for one flat monthly rate — pause or cancel anytime. Built by engineers from Globant & Ualá.";

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

// Blocking, pre-paint theme initialization. Runs before the body paints and sets
// the [data-theme] attribute on <html>, mirroring ThemeProvider's resolution
// (localStorage key "codirity-theme"; unstored -> "light"; "system" ->
// prefers-color-scheme). This prevents the flash of incorrect theme that the
// former ThemeProvider mount-gate guarded against, without nulling the server tree.
// <html> carries suppressHydrationWarning so the script-set attribute does not warn.
const themeInitScript = `(function(){try{var t=localStorage.getItem('codirity-theme');var m=(t==='light'||t==='dark'||t==='system')?t:'light';var r=m==='system'?(window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'):m;document.documentElement.setAttribute('data-theme',r);}catch(e){}})();`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body
        className={`${outfit.variable} ${spaceMono.variable} font-sans antialiased`}
      >
        <ThemeProvider>
          {/* Background Pattern */}
          <div className="bg-pattern" />

          {/* Header */}
          <Header />

          {/* Main Content */}
          <main>{children}</main>

          {/* Footer */}
          <Footer />

          {/* Toast Notifications */}
          <Toaster />
        </ThemeProvider>

        {/* Organization structured data (server-rendered for crawlers) */}
        <OrganizationJsonLd />

        {/* Analytics */}
        <GoogleAnalytics />
      </body>
    </html>
  );
}
