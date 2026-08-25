"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X, ArrowRight } from "lucide-react";
import { CalPopupButton, Logo } from "@/components/ui";
import { hero, CAL_LINK, BOOKING_ENABLED } from "@/config/offer";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "#services", label: "Services" },
  { href: "#process", label: "Process" },
  { href: "#contact", label: "Contact" },
];

export function Header() {
  // overDark: is the DARK hero still under the header band? This replaces the
  // old `scrollY > 50` driver, which had no relationship to the ground — it
  // painted chalk-on-white on /privacy (no hero, ~1.1:1, invisible) and a
  // hard white bar over 90% of the hero's scroll depth (battery BLOCKER).
  // Default false: pre-hydration every route shows the LIGHT chrome, which is
  // legible on every ground (a bar over the hero for one frame beats
  // invisible chrome on light routes); home upgrades to chalk on hydration.
  const [overDark, setOverDark] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const hero = document.getElementById("hero");
    // No hero on this route → overDark keeps its initial false (light chrome).
    if (!hero) return;
    // Shrink the observation viewport to the header band (~88px): overDark
    // while any part of the hero is still inside it.
    const io = new IntersectionObserver(
      ([e]) => setOverDark(e.isIntersecting),
      { rootMargin: "0px 0px -88px 0px" }
    );
    io.observe(hero);
    return () => io.disconnect();
  }, []);

  // Close mobile menu on resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-400",
        "px-4 py-5 md:px-8 lg:px-16",
        // v4 W1 (battery-corrected): tone tracks the GROUND via the hero
        // sentinel IO — transparent chalk while the dark hero is under the
        // header band, the light chrome everywhere else, including routes
        // that have no hero at all.
        !overDark
          ? [
              "py-4",
              "bg-white/95 backdrop-blur-xl",
              "border-b border-[var(--border)]",
              "shadow-sm",
            ]
          : "text-chalk"
      )}
    >
      <nav className="max-w-[1400px] mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link
          href="/"
          className={cn(
            "flex items-center text-2xl font-medium tracking-tight",
            // font-mono retired with the v3 system (W0); tone follows ground.
            !overDark ? "text-gray-900" : "text-chalk"
          )}
        >
          <Logo />
        </Link>

        {/* Desktop Navigation */}
        <ul className="hidden lg:flex items-center gap-12">
          {navLinks.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className={cn(
                  "relative text-[0.95rem] font-medium",
                  !overDark
                    ? "text-gray-600 hover:text-gray-900"
                    : "text-chalk-dim hover:text-chalk",
                  "transition-colors duration-300",
                  "after:content-[''] after:absolute after:-bottom-1.5 after:left-0",
                  "after:w-0 after:h-0.5 after:bg-brand",
                  "after:transition-[width] after:duration-300",
                  "hover:after:w-full"
                )}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Desktop CTAs — Book a call / See pricing pill pair (HANDOFF-redesign-v3 §1,
            mirrors the hero's own two-CTA pattern in the persistent nav) */}
        <div className="hidden lg:flex items-center gap-3">
          {/* BOOK-A-CALL DISABLED — offer.ts BOOKING_ENABLED */}
          {BOOKING_ENABLED && (
          <CalPopupButton
            calLink={CAL_LINK}
            className={cn(
              "btn-pill inline-flex items-center justify-center",
              "px-5 py-2.5 text-sm font-medium",
              !overDark
                ? "text-gray-700 border border-gray-200 hover:border-brand hover:text-brand hover:bg-brand-pale"
                : "text-chalk border border-[var(--rule)] hover:border-mint hover:text-mint",
              "transition-all duration-300 cursor-pointer"
            )}
          >
            Book a call
          </CalPopupButton>
          )}
          <Link
            href={hero.primaryCta.href}
            className={cn(
              "btn-pill inline-flex items-center gap-2",
              "px-5 py-2.5 text-sm font-medium",
              !overDark
                ? "bg-brand-fill text-white hover:bg-brand-fill-dark hover:shadow-brand"
                : "bg-mint text-ground",
              "transition-all duration-300",
              "hover:-translate-y-0.5"
            )}
          >
            {hero.primaryCta.label}
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="lg:hidden p-2 -mr-2"
          aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
        >
          {isMobileMenuOpen ? (
            <X className={cn("w-6 h-6", !overDark ? "text-gray-800" : "text-chalk")} />
          ) : (
            <Menu className={cn("w-6 h-6", !overDark ? "text-gray-800" : "text-chalk")} />
          )}
        </button>
      </nav>

      {/* Mobile Menu */}
      <div
        className={cn(
          "lg:hidden",
          "fixed inset-x-0 top-[72px]",
          "bg-white border-b border-[var(--border)]",
          "shadow-lg",
          "transition-all duration-300 ease-[var(--transition-smooth)]",
          isMobileMenuOpen
            ? "opacity-100 translate-y-0 pointer-events-auto"
            : "opacity-0 -translate-y-4 pointer-events-none"
        )}
      >
        <nav className="px-4 py-6">
          <ul className="flex flex-col gap-4">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    "block py-3 px-4 rounded-xl",
                    "text-gray-700 text-lg font-medium",
                    "transition-colors duration-200",
                    "hover:bg-gray-50 hover:text-gray-900"
                  )}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-6 pt-6 border-t border-gray-100 flex flex-col gap-3">
            {/* BOOK-A-CALL DISABLED — offer.ts BOOKING_ENABLED */}
            {BOOKING_ENABLED && (
            <CalPopupButton
              calLink={CAL_LINK}
              onOpen={() => setIsMobileMenuOpen(false)}
              className={cn(
                "flex items-center justify-center",
                "w-full px-6 py-4 rounded-full",
                "text-gray-700 border border-gray-200",
                "font-medium text-base",
                "transition-all duration-300 cursor-pointer"
              )}
            >
              Book a call
            </CalPopupButton>
            )}
            <Link
              href={hero.primaryCta.href}
              onClick={() => setIsMobileMenuOpen(false)}
              className={cn(
                "flex items-center justify-center gap-2",
                "w-full px-6 py-4 rounded-full",
                "bg-brand-fill text-white",
                "font-medium text-base",
                "transition-all duration-300",
                "hover:bg-brand-fill-dark"
              )}
            >
              {hero.primaryCta.label}
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
}
