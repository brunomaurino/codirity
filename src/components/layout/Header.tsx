"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "#services", label: "Services" },
  { href: "#process", label: "Process" },
  { href: "#contact", label: "Contact" },
];

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
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
        isScrolled && [
          "py-4",
          "bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl",
          "border-b border-[var(--border)]",
          "shadow-sm",
        ]
      )}
    >
      <nav className="max-w-[1400px] mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 font-mono text-2xl font-bold text-gray-900 dark:text-white tracking-tight"
        >
          <span>Codirity</span>
          <span className="w-2.5 h-2.5 bg-brand rounded-full animate-pulse-dot" />
        </Link>

        {/* Desktop Navigation */}
        <ul className="hidden lg:flex items-center gap-12">
          {navLinks.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className={cn(
                  "relative text-gray-600 dark:text-gray-400 text-[0.95rem] font-medium",
                  "transition-colors duration-300",
                  "hover:text-gray-900 dark:hover:text-white",
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

        {/* Desktop CTA */}
        <Link
          href="#contact"
          className={cn(
            "hidden lg:inline-flex items-center gap-2",
            "px-6 py-3 rounded-full",
            "bg-brand-fill text-white",
            "font-semibold text-sm",
            "transition-all duration-300",
            "hover:bg-brand-fill-dark hover:-translate-y-0.5",
            "hover:shadow-brand"
          )}
        >
          Contact Us
          <ArrowRight className="w-4 h-4" />
        </Link>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="lg:hidden p-2 -mr-2"
          aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
        >
          {isMobileMenuOpen ? (
            <X className="w-6 h-6 text-gray-800 dark:text-gray-200" />
          ) : (
            <Menu className="w-6 h-6 text-gray-800 dark:text-gray-200" />
          )}
        </button>
      </nav>

      {/* Mobile Menu */}
      <div
        className={cn(
          "lg:hidden",
          "fixed inset-x-0 top-[72px]",
          "bg-white dark:bg-gray-900 border-b border-[var(--border)]",
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
                    "text-gray-700 dark:text-gray-300 text-lg font-medium",
                    "transition-colors duration-200",
                    "hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"
                  )}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-800">
            <Link
              href="#contact"
              onClick={() => setIsMobileMenuOpen(false)}
              className={cn(
                "flex items-center justify-center gap-2",
                "w-full px-6 py-4 rounded-full",
                "bg-brand-fill text-white",
                "font-semibold text-base",
                "transition-all duration-300",
                "hover:bg-brand-fill-dark"
              )}
            >
              Contact Us
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
}
