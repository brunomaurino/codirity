import Link from "next/link";
import { TrackedLink } from "@/components/ui";
import { BRAND, LEGAL_ENTITY, CONTACT_EMAIL, hero } from "@/config/offer";
import { cn } from "@/lib/utils";

// The footer (Bundle W6) — the continuation of the closing dark band, and the
// LAST surface on the site never touched by any redesign.
//
// Two things it was carrying that this bundle removes:
//
//   1. A pre-voice-gate marketing blurb: "AI-powered automation and system
//      development that transforms businesses and accelerates growth." Every
//      clause of that is the register §4 exists to keep off the site — it makes
//      a promise about the READER's outcome that nothing on the page supports.
//      Replaced with `hero.trustLine`, which is a checkable fact.
//   2. Four invented "service" categories — Process Automation, System
//      Development, AI Integration, Legacy Modernization — none of which appear
//      in offer.ts, all four linking to the SAME anchor. That is the same
//      fabrication class as v3's case-study defects, just older and quieter.
//      The nav now points at real sections only.
//
// `font-mono` is gone with it (retired since v3 V0; v4 is ONE family), as is
// the white/opacity soup in favour of the fixed ground tokens.

const nav = [
  { href: "#services", label: "What we build" },
  { href: "#process", label: "How it works" },
  { href: "#terms", label: "Pricing" },
  { href: "#work", label: "Clients" },
  { href: "#about", label: "Who does the work" },
  { href: "#faq", label: "FAQ" },
];

const socialLinks = [
  {
    href: "https://www.linkedin.com/company/codirity",
    label: "LinkedIn",
    icon: (
      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    ),
  },
  {
    href: "https://x.com/codirity",
    label: "X",
    icon: (
      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
];

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative z-10 bg-ground text-chalk">
      <div className="wrap-v4">
        <div className="grid grid-cols-1 gap-10 border-t border-[var(--rule)] py-14 md:grid-cols-[1.2fr_1fr] md:py-20">
          <div>
            <Link
              href="/"
              className="mb-5 inline-flex items-center gap-2 text-2xl font-medium tracking-tight text-chalk"
            >
              <span>{BRAND}</span>
              <span className="h-2.5 w-2.5 rounded-full bg-mint" aria-hidden="true" />
            </Link>
            <p className="lede max-w-xs">{hero.trustLine}</p>
            <div className="mt-7 flex gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className={cn(
                    "flex h-11 w-11 items-center justify-center rounded-full",
                    "border border-[var(--rule)] text-chalk-dim",
                    "transition-colors duration-300 hover:border-mint hover:text-mint"
                  )}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          <nav aria-label="Footer">
            <ul className="grid grid-cols-2 gap-x-6 gap-y-3.5">
              {nav.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-[0.95rem] text-chalk-dim transition-colors duration-300 hover:text-chalk"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* S9: legal entity + brand, contact email, privacy link only (no ToS in v1) */}
        <div className="border-t border-[var(--rule)] py-6">
          <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
            <p className="text-sm text-chalk-dim">
              © {currentYear} {BRAND}. Operated by {LEGAL_ENTITY}. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              {/* Emailing us directly is a lead action, so it is tracked. The
                  `location` property separates it from the same address in the
                  close. */}
              <TrackedLink
                href={`mailto:${CONTACT_EMAIL}`}
                event="email_click"
                eventParams={{ location: "footer" }}
                className="text-sm text-chalk-dim transition-colors duration-300 hover:text-chalk"
              >
                {CONTACT_EMAIL}
              </TrackedLink>
              <Link
                href="/privacy"
                className="text-sm text-chalk-dim transition-colors duration-300 hover:text-chalk"
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
