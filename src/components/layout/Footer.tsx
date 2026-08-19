import Link from "next/link";
import { TrackedLink } from "@/components/ui";
import { BRAND, LEGAL_ENTITY, CONTACT_EMAIL } from "@/config/offer";
import { cn } from "@/lib/utils";

const footerLinks = {
  services: [
    { href: "#services", label: "Process Automation" },
    { href: "#services", label: "System Development" },
    { href: "#services", label: "AI Integration" },
    { href: "#services", label: "Legacy Modernization" },
  ],
  company: [
    { href: "#about", label: "About Us" },
    { href: "#process", label: "Our Process" },
    { href: "#contact", label: "Contact" },
  ],
};

const socialLinks = [
  {
    href: "https://www.linkedin.com/company/codirity",
    label: "LinkedIn",
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    ),
  },
  {
    href: "https://x.com/codirity",
    label: "X",
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
];

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-white relative z-10">
      <div className="max-w-[1400px] mx-auto px-4 md:px-8 lg:px-16">
        {/* Main Footer Content */}
        <div className="py-12 md:py-16 lg:py-20">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 lg:gap-16">
            {/* Brand Column */}
            <div className="md:col-span-2 lg:col-span-1">
              <Link
                href="/"
                className="inline-flex items-center gap-2 font-mono text-2xl font-medium text-white tracking-tight mb-6"
              >
                <span>{BRAND}</span>
                <span className="w-2.5 h-2.5 bg-brand rounded-full animate-pulse-dot" />
              </Link>
              <p className="text-white/60 text-[0.95rem] leading-relaxed max-w-xs mb-6">
                AI-powered automation and system development that transforms
                businesses and accelerates growth.
              </p>
              {/* Social Links */}
              <div className="flex gap-3">
                {socialLinks.map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                    className={cn(
                      "w-11 h-11 rounded-xl",
                      "flex items-center justify-center",
                      "bg-white/5 border border-white/10",
                      "text-white/60",
                      "transition-all duration-300",
                      "hover:bg-brand-fill hover:border-brand-fill hover:text-white",
                      "hover:-translate-y-1"
                    )}
                  >
                    {social.icon}
                  </a>
                ))}
              </div>
            </div>

            {/* Services Column */}
            <div>
              <h4 className="text-xs font-medium text-white uppercase tracking-[0.15em] mb-6">
                Services
              </h4>
              <ul className="space-y-4">
                {footerLinks.services.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className={cn(
                        "text-white/60 text-[0.95rem]",
                        "transition-colors duration-300",
                        "hover:text-brand"
                      )}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company Column */}
            <div>
              <h4 className="text-xs font-medium text-white uppercase tracking-[0.15em] mb-6">
                Company
              </h4>
              <ul className="space-y-4">
                {footerLinks.company.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className={cn(
                        "text-white/60 text-[0.95rem]",
                        "transition-colors duration-300",
                        "hover:text-brand"
                      )}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Footer Bottom (S9): legal entity + brand, contact email, privacy link only (no ToS in v1) */}
        <div className="py-6 border-t border-white/10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-white/40 text-sm">
              © {currentYear} {BRAND}. Operated by {LEGAL_ENTITY}. All rights
              reserved.
            </p>
            <div className="flex items-center gap-6">
              {/* Emailing us directly is a lead action, so it is tracked. The
                  `location` property separates it from the same address in the
                  contact section. */}
              <TrackedLink
                href={`mailto:${CONTACT_EMAIL}`}
                event="email_click"
                eventParams={{ location: "footer" }}
                className="text-white/40 text-sm hover:text-brand transition-colors duration-300"
              >
                {CONTACT_EMAIL}
              </TrackedLink>
              <Link
                href="/privacy"
                className="text-white/40 text-sm hover:text-brand transition-colors duration-300"
              >
                Privacy Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
