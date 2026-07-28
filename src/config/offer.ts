/**
 * Single source of truth for the Codirity offer.
 *
 * Pure data — this module intentionally imports nothing from React and contains no
 * JSX, so it can be imported from both server and client components (pricing cards,
 * FAQ accordion, JSON-LD, sitemap copy, etc.). Icons are referenced by lucide-react
 * NAME (a string) and mapped to a component by the consumer; that keeps this file a
 * plain config with no rendering concerns.
 *
 * Ground rule (non-negotiable): every price, tier, URL, and FAQ string lives here.
 * Components import from this module and never hardcode these values.
 */

/** Stripe Payment Links come from env with a safe placeholder so the site builds
 *  without real URLs in v1 (D2). Set the real Production-scoped values in Vercel. */
const STRIPE_PLACEHOLDER = "#";
function stripeLink(value: string | undefined): string {
  return value && value.length > 0 ? value : STRIPE_PLACEHOLDER;
}

export interface Tier {
  id: "standard" | "pro";
  name: string;
  /** Display price, e.g. "$3,995". */
  price: string;
  /** Machine-readable monthly amount (no symbol/separator), for Service.offers JSON-LD. */
  priceAmount: number;
  /** Billing period suffix, e.g. "/mo". */
  period: string;
  /** One-line summary of the active-task limit. */
  tasks: string;
  /** Short positioning line under the price. */
  description: string;
  /** Bullet feature list, in display order. */
  features: string[];
  /** Stripe Payment Link (env-configured; "#" placeholder until set). */
  stripeUrl: string;
  /** Call-to-action label. */
  cta: string;
  /** Visually emphasized tier (Pro). */
  highlighted: boolean;
}

export interface FoundingRate {
  /** Gates the home launch banner. Flip to false (one line) when the slots fill. */
  active: boolean;
  /** Display price (spec-mandated verbatim), e.g. "$2,995/mo". */
  price: string;
  /** Machine-readable monthly amount, for structured data / analytics. */
  priceAmount: number;
  slots: number;
  label: string;
  /** Stripe Payment Link for the founding rate (env-configured). */
  stripeUrl: string;
}

export interface Guarantee {
  title: string;
  description: string;
}

export interface Benefit {
  /** lucide-react icon name (mapped to a component by the consumer). */
  icon: string;
  title: string;
  description: string;
}

export interface HowItWorksStep {
  number: string;
  title: string;
  description: string;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface CaseStudy {
  title: string;
  client: string;
  industry?: string;
  summary: string;
  /** Headline outcome, e.g. "40 hrs/week saved". */
  result: string;
  tags: string[];
  href?: string;
}

export interface Cta {
  label: string;
  href?: string;
}

/**
 * A CTA that definitely navigates somewhere. `Cta.href` is optional because
 * some CTAs are buttons (the Cal.com popup), but a link CTA without a target
 * is not a link — this narrows the two cases apart at the type level.
 */
export interface LinkCta extends Cta {
  href: string;
}

export interface HeroContent {
  badge: string;
  /** The page's single <h1>. */
  headline: string;
  subhead: string;
  /** Always a link (currently to #pricing) — see LinkCta. */
  primaryCta: LinkCta;
  /** Secondary CTA opens the Cal.com popup (no href — uses calLink). */
  secondaryCta: Cta;
  /** Mono annotation under the CTA row (the category's de-facto second headline). */
  microcopy: string;
}

/** One row of the hero workbench vignette (HANDOFF-redesign §6.R1). */
export interface WorkbenchItem {
  /** Board id, e.g. "#231". Illustrative but shaped like the real board. */
  id: string;
  label: string;
  status: "shipped" | "in_progress" | "queued";
  /** Days on the board — shown only for shipped rows. */
  days?: number;
}

/** Header copy (eyebrow label + title + optional description) for a marketing section. */
export interface SectionCopy {
  label: string;
  title: string;
  description?: string;
}

export interface SectionsContent {
  howItWorks: SectionCopy;
  whatWeBuild: SectionCopy;
  benefits: SectionCopy;
  recentWork: SectionCopy;
  pricing: SectionCopy;
  faq: SectionCopy;
}

export interface Offer {
  brand: string;
  legalEntity: string;
  contactEmail: string;
  calLink: string;
  hero: HeroContent;
  sections: SectionsContent;
  tiers: Tier[];
  foundingRate: FoundingRate;
  guarantee: Guarantee;
  included: string[];
  notIncluded: string[];
  benefits: Benefit[];
  howItWorks: HowItWorksStep[];
  faq: FaqItem[];
  caseStudies: CaseStudy[];
}

export const BRAND = "Codirity";
/** ISO 4217 currency for all prices — used by Service.offers structured data (Bundle E). */
export const CURRENCY = "USD";
export const LEGAL_ENTITY = "BOMAU LLC";
export const CONTACT_EMAIL = "support@codirity.com";
/** Cal.com link (namespace/event) used by CalPopupButton. */
export const CAL_LINK = "support-codirity-lz8rjc/30min";

export const hero: HeroContent = {
  badge: "AI & automation, on subscription",
  headline: "Your AI & automation team, on subscription.",
  // Storytelling doc §2 option 1 — the mechanism in four checkable sentences.
  subhead:
    "Drop requests on a board. A senior engineer works them one at a time. Most ship in days. One flat rate.",
  primaryCta: { label: "See pricing", href: "#pricing" },
  // Duration-neutral: the configured Cal event (CAL_LINK) is a 30-minute call, so a
  // "15-min" label would understate the actual booking. Kept short and low-friction.
  secondaryCta: { label: "Book an intro call" },
  microcopy: "pause or cancel any month · no contracts",
};

/**
 * The hero workbench vignette — the queue as the hero image. Rows are
 * illustrative but shaped like real board items (each traces to shipped work in
 * the day-log record; day figures approved in docs/redesign-storytelling.md §2).
 * Green status dots appear ONLY on shipped rows — the green-means-live rule.
 */
export const workbenchQueue: WorkbenchItem[] = [
  { id: "#231", label: "dead product URLs — 27 found via sitemap", status: "shipped", days: 1 },
  { id: "#232", label: "guest favorites, merge on login", status: "shipped", days: 2 },
  { id: "#233", label: "admin table filters, server-side", status: "shipped", days: 3 },
  { id: "#234", label: "stripe seller tiers", status: "shipped", days: 4 },
  { id: "#235", label: "wordpress fleet cost cut", status: "in_progress" },
];

/** Prompt text for the vignette's typed row. The typing animation derives its
 *  width and step count from this string's length mechanically (see
 *  HeroWorkbench.tsx), so editing it cannot break the animation. */
export const workbenchPrompt = "your request here";

/**
 * Proof line under the hero — evidence, not a logo marquee. Singular engineer,
 * Córdoba, and the real stack per the resolved facts (2026-07-28, storytelling §2).
 */
export const proofLine: string[] = [
  "built by a senior engineer, ex-Globant & Ualá",
  "Córdoba, AR",
  "stack: claude / next.js / nestjs / aws / stripe",
];

/** Column headings for the "What we build" included / not-included lists. */
export const scopeLabels = {
  included: "What's included",
  notIncluded: "Not included",
} as const;

export const sections: SectionsContent = {
  howItWorks: {
    label: "How it works",
    title: "You add a card. We ship it.",
    description:
      "Subscribe, drop requests on the board, and we work them one at a time. No scoping calls, no contracts.",
  },
  whatWeBuild: {
    label: "What we build",
    title: "AI, automation, and custom systems",
    description:
      "If it's software that deletes manual work, it's probably in scope. Here's where we focus — and what we'll say no to.",
  },
  benefits: {
    label: "The subscription",
    title: "What the flat rate buys you",
    description:
      "The parts of an agency you actually want, without hourly billing or lock-in.",
  },
  recentWork: {
    label: "Recent work",
    title: "What we've shipped",
    description:
      "Recent automations and systems, and the manual work each one deleted.",
  },
  pricing: {
    label: "Pricing",
    title: "One flat rate",
    // Task counts live in each tier card (one lane on Standard, two on Pro) —
    // this shared header must not state a count that only fits one tier.
    description:
      "Unlimited queue. Pick your lane count below. Pause or cancel any month.",
  },
  faq: {
    label: "FAQ",
    title: "The questions everyone asks",
    // 30 minutes — must match the configured Cal event (see CAL_LINK comment).
    description:
      "Answered plainly. Anything else — book a 30-minute call or write to us.",
  },
};

export const tiers: Tier[] = [
  {
    id: "standard",
    name: "Standard",
    price: "$3,995",
    priceAmount: 3995,
    period: "/mo",
    tasks: "One active task at a time",
    description: "For teams with a steady stream of automation and build work.",
    // The active-task limit lives in `tasks` (rendered prominently); it is not
    // repeated here to keep a single authoritative copy of that fact.
    features: [
      "Unlimited requests & revisions",
      "A senior engineer on your queue; the AI drafts",
      "Async delivery on a shared Trello board",
      "Pause or cancel any month",
    ],
    stripeUrl: stripeLink(process.env.NEXT_PUBLIC_STRIPE_LINK_STANDARD),
    cta: "Get started",
    highlighted: false,
  },
  {
    id: "pro",
    name: "Pro",
    price: "$6,995",
    priceAmount: 6995,
    period: "/mo",
    tasks: "Two active tasks at a time",
    description: "For teams that need two things moving at once.",
    // Active-task limit lives in `tasks` (not repeated here); Priority delivery is
    // the Pro-only differentiator and stays in the list.
    features: [
      "Priority delivery",
      "Unlimited requests & revisions",
      "A senior engineer on your queue; the AI drafts",
      "Async delivery on a shared Trello board",
      "Pause or cancel any month",
    ],
    stripeUrl: stripeLink(process.env.NEXT_PUBLIC_STRIPE_LINK_PRO),
    cta: "Get started",
    highlighted: true,
  },
];

export const foundingRate: FoundingRate = {
  active: true,
  price: "$2,995/mo",
  priceAmount: 2995,
  slots: 5,
  label: "first 5 clients, price locked for life",
  stripeUrl: stripeLink(process.env.NEXT_PUBLIC_STRIPE_LINK_FOUNDING),
};

export const guarantee: Guarantee = {
  // Titled to match the actual terms (75% back, not a full refund) — the FAQ and the
  // description below state 75%, so the heading must not overstate it.
  title: "7-day 75%-back guarantee",
  description:
    "Try it for a week. Not convinced? Get 75% back, no questions asked.",
};

export const included: string[] = [
  "Process & workflow automation",
  "Custom internal tools & dashboards",
  "AI integrations (LLMs, chatbots, agents)",
  "API & third-party integrations",
  "Data pipelines, scripts & migrations",
  "Legacy system modernization",
  "Ongoing fixes & iterative improvements",
];

export const notIncluded: string[] = [
  "Native mobile apps",
  "Brand & marketing design",
  "Ongoing manual data entry or operations staffing",
  "Hardware or on-site IT",
  "Work that needs a dedicated full-time team",
];

export const benefits: Benefit[] = [
  {
    icon: "CreditCard",
    title: "One flat monthly rate",
    description:
      "No hourly billing, no surprise invoices. The price is the price.",
  },
  {
    icon: "Infinity",
    title: "Unlimited requests & revisions",
    description:
      "Queue as much as you like; revise each card until it's right.",
  },
  {
    icon: "Zap",
    title: "The AI drafts. An engineer owns it.",
    description:
      "Every line that ships was reviewed and owned by a senior engineer.",
  },
  {
    icon: "Rocket",
    title: "Async, no meetings",
    description:
      "Most cards ship in days. Everything lives on a shared board — you get a Loom, not a call.",
  },
  {
    icon: "PauseCircle",
    title: "Pause or cancel any month",
    description:
      "Pause when the queue is empty; come back when there's work.",
  },
  {
    icon: "TrendingUp",
    title: "Two lanes when you need them",
    description:
      "Move to Pro when you need two cards moving at once.",
  },
];

export const howItWorks: HowItWorksStep[] = [
  {
    number: "01",
    title: "Subscribe",
    description:
      "Pick a plan. The board is yours the same day — drop the first card whenever you're ready.",
  },
  {
    number: "02",
    title: "Request",
    description:
      "Add cards to the queue in your own words. We ask two questions — that's usually all of them.",
  },
  {
    number: "03",
    title: "Ship",
    description:
      "Review, revise, done. The next card starts the moment one ships.",
  },
];

export const faq: FaqItem[] = [
  {
    question: "Who actually writes the code — you or the AI?",
    answer:
      "Engineers. The AI drafts; a senior engineer — ex-Globant, ex-Ualá — owns what ships. You talk to the person building your systems, not an account manager.",
  },
  {
    question: "How fast is it, really?",
    answer:
      "Most cards ship in 2–4 days. Bigger builds get split into cards, so something lands every few days — the board shows you which day.",
  },
  {
    question: "What counts as one task?",
    answer:
      "One focused piece of work: an automation, an integration, a tool, a fix. Standard works one at a time, Pro two; the next starts the moment one ships.",
  },
  {
    question: "What if I don't like the result?",
    answer:
      "Revisions are part of the request — we iterate until it's right. And the first week carries the guarantee: not convinced, 75% back.",
  },
  {
    question: "Can I pause or cancel?",
    answer:
      "Any month. Billing stops at the end of the cycle; your board, your code, and your history stay put. Come back when there's work.",
  },
  {
    question: "What don't you do?",
    answer:
      "Native mobile apps, brand design, staffing manual operations, and anything that's really a full-time hire. If we're not the fit, we'll say so and save you a month's fee.",
  },
];

/** Typed placeholder — real case studies supplied later (D5). */
export const caseStudies: CaseStudy[] = [];

export const offer: Offer = {
  brand: BRAND,
  legalEntity: LEGAL_ENTITY,
  contactEmail: CONTACT_EMAIL,
  calLink: CAL_LINK,
  hero,
  sections,
  tiers,
  foundingRate,
  guarantee,
  included,
  notIncluded,
  benefits,
  howItWorks,
  faq,
  caseStudies,
};

export default offer;
