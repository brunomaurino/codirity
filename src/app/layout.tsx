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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
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
