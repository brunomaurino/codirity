import type { Metadata } from "next";
import { Outfit, Space_Mono } from "next/font/google";
import { Header, Footer } from "@/components/layout";
import { ThemeProvider } from "@/components/theme";
import { Toaster } from "@/components/ui/Toaster";
import { GoogleAnalytics } from "@/components/analytics/GoogleAnalytics";
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

export const metadata: Metadata = {
  title: "Codirity | AI-Powered Automation & Custom System Development",
  description:
    "Modernize your business with AI-powered automation and custom systems. Built by engineers from Globant & Ualá. Book a free consultation today.",
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

        {/* Analytics */}
        <GoogleAnalytics />
      </body>
    </html>
  );
}
