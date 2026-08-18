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

/** The "who's on the board" clients section (redesign v3 Bundle V4).
 *  Deliberately a SEPARATE shape from `CaseStudy` — this is a lightweight
 *  badge, not a metrics-bearing case study; V8 builds its own new
 *  component for the full eDairyMarket/Meshio case studies rather than
 *  reusing this array or `RecentWork.tsx`.
 *
 *  NOTE (2026-08-18): all three entries are presented as "client" per
 *  Bruno's explicit direction in-session, superseding the original D6
 *  resolution (HANDOFF-redesign-v3.md §5/§6, 2026-07-28), which had
 *  distinguished eDairyCorp ("client") from Meshio/Vivi ("ours" — Bruno's
 *  own products, same LLC as Codirity) as a deliberate honesty discipline.
 *  Bruno confirmed this reversal explicitly after being shown the
 *  trade-off. The `provenance`/discriminated-`preLaunch` typing from that
 *  policy is removed since it no longer reflects any real distinction
 *  between entries — `preLaunch` is a plain fact (is this app live yet),
 *  independent of the tag. */
export interface ClientEntry {
  name: string;
  preLaunch?: boolean;
  story: string;
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
  /** Short trim of `subhead` for the hero's blob-gradient visual card
   *  (redesign v3 Bundle V1) — kept as its own field, not re-derived from
   *  `subhead` at render time, so the two can be edited independently
   *  without one silently going stale relative to the other. */
  visualHeadline: string;
  /** Always a link (currently to #pricing) — see LinkCta. */
  primaryCta: LinkCta;
  /** Secondary CTA opens the Cal.com popup (no href — uses calLink). */
  secondaryCta: Cta;
  trustLine: string;
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
  clients: ClientEntry[];
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
  subhead:
    "Unlimited requests, senior engineering, and AI-accelerated delivery — for one flat monthly rate. Pause or cancel anytime.",
  visualHeadline: "Unlimited requests. One flat rate.",
  primaryCta: { label: "See pricing", href: "#pricing" },
  // Duration-neutral: the configured Cal event (CAL_LINK) is a 30-minute call, so a
  // "15-min" label would understate the actual booking. Kept short and low-friction.
  secondaryCta: { label: "Book an intro call" },
  trustLine: "Built by engineers from Globant & Ualá",
};

/** Section headings for the "What we build" included / not-included lists
 *  (a pill cloud + a plain list, stacked — not columns, since
 *  redesign-v3 Bundle V3). */
export const scopeLabels = {
  included: "What's included",
  notIncluded: "Not included",
} as const;

export const sections: SectionsContent = {
  howItWorks: {
    label: "How it works",
    title: "From idea to shipped, on repeat",
    description:
      "Subscribe, add tasks to your queue, and we build them one at a time. No scoping calls, no contracts.",
  },
  whatWeBuild: {
    label: "What we build",
    title: "AI, automation, and custom systems",
    description:
      "If it's software that makes your business run faster, it's in scope. Here's where we focus — and where we don't.",
  },
  benefits: {
    label: "Membership benefits",
    title: "Why teams subscribe",
    description:
      "Everything an agency gives you, without the overhead, the hourly billing, or the lock-in.",
  },
  recentWork: {
    // Updated 2026-08-18 per Bruno's direction to present all three
    // entries as "client" (see the NOTE on `ClientEntry` in this file) —
    // the previous description explicitly called out the client/ours
    // split ("Tagged below so you can tell which is which"), which no
    // longer matches what the cards show.
    label: "Clients",
    title: "Already on the board",
    description: "A look at who's been through the queue.",
  },
  pricing: {
    label: "Pricing",
    title: "Simple, monthly pricing",
    description:
      "One flat rate, unlimited requests, and no contracts. Pause or cancel anytime.",
  },
  faq: {
    label: "FAQ",
    title: "Questions, answered",
    description:
      "Everything you might want to know before subscribing. Still unsure? Book a quick call.",
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
      "AI-accelerated senior engineering",
      "Async delivery, tracked in Trello",
      "Pause or cancel anytime",
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
    description: "For teams that need two things moving in parallel, faster.",
    // Active-task limit lives in `tasks` (not repeated here); Priority delivery is
    // the Pro-only differentiator and stays in the list.
    features: [
      "Priority delivery",
      "Unlimited requests & revisions",
      "AI-accelerated senior engineering",
      "Async delivery, tracked in Trello",
      "Pause or cancel anytime",
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
      "No hourly billing and no surprise invoices. One price, unlimited requests.",
  },
  {
    icon: "Infinity",
    title: "Unlimited requests & revisions",
    description:
      "Queue as many tasks as you like and revise each one until it's right.",
  },
  {
    icon: "Zap",
    title: "Senior engineering, AI-accelerated",
    description:
      "Work is shipped by senior engineers using AI to move faster than an agency.",
  },
  {
    icon: "Rocket",
    title: "Fast, async delivery",
    description:
      "Most tasks land in days. Track everything in a shared Trello board.",
  },
  {
    icon: "PauseCircle",
    title: "Pause or cancel anytime",
    description:
      "No lock-in. Pause when your queue is empty and resume when you need us.",
  },
  {
    icon: "TrendingUp",
    title: "Scales with you",
    description:
      "Move up to Pro when you need two tasks running in parallel.",
  },
];

export const howItWorks: HowItWorksStep[] = [
  {
    number: "01",
    title: "Subscribe",
    description:
      "Pick a plan and get instant access to your Trello board. Add your first task right away.",
  },
  {
    number: "02",
    title: "Request",
    description:
      "Add tasks to your queue. We work them one (or two) at a time and deliver async.",
  },
  {
    number: "03",
    title: "Ship",
    description:
      "Review, revise, and ship. Keep the queue full — we keep building.",
  },
];

export const faq: FaqItem[] = [
  {
    question: "Who does the work?",
    answer:
      "A senior engineer with years at companies like Globant and Ualá, working AI-accelerated. You work directly with the person building your systems — no account managers, no offshore hand-offs.",
  },
  {
    question: "How fast will I get my work?",
    answer:
      "Most individual tasks are delivered within a few days. Larger builds are broken into milestones so you see progress continuously.",
  },
  {
    question: "What counts as one task?",
    answer:
      "A task is a single focused piece of work — an automation, an integration, a tool, or a fix. We work one active task at a time on Standard and two on Pro, moving to the next as soon as one ships.",
  },
  {
    question: "What if I don't like the result?",
    answer:
      "Unlimited revisions are included, so we iterate until it's right. Every plan is also backed by our guarantee: try it for a week, and if you're not convinced, get 75% back.",
  },
  {
    question: "Can I pause or cancel?",
    answer:
      "Anytime. Pause your subscription when your queue is empty and resume when you need us again. No contracts, no lock-in.",
  },
  {
    question: "What don't you do?",
    answer:
      "We focus on AI, automation, and custom systems. We don't do native mobile apps, brand or marketing design, or staffing for manual operations. If we're not the right fit, we'll tell you.",
  },
];

/** Typed placeholder — real case studies supplied later (D1, RESOLVED
 *  2026-08-18 — eDairyMarket + Meshio; V8 builds the component that
 *  populates this). */
export const caseStudies: CaseStudy[] = [];

/** "Who's on the board" — underlying facts sourced from
 *  docs/redesign-storytelling.md §1b, adapted (not copied verbatim) into
 *  the warmer Monthly Club voice per HANDOFF-redesign-v3.md §4. All three
 *  are presented as "client" per Bruno's 2026-08-18 direction — see the
 *  NOTE on `ClientEntry` above for the superseded D6 policy this
 *  replaces. */
export const clients: ClientEntry[] = [
  {
    name: "eDairyCorp",
    story:
      "A dairy-industry marketplace running since 2003, with 17k visits a month. We're rebuilding it in place — new APIs, a server-rendered storefront — without losing that traffic. Along the way we found (and fixed) 10% of the catalog silently 404ing in the sitemap Google was crawling.",
  },
  {
    name: "Meshio",
    preLaunch: false,
    story:
      "An AI content app that drafts post ideas in your voice for X, LinkedIn, and Threads. When paid conversions stalled, we didn't redesign the logo: we rebuilt onboarding around getting a user's first post published.",
  },
  {
    name: "Vivi",
    preLaunch: true,
    story:
      "An outfit-scoring iOS app we're building pre-launch — camera, scoring, paywall — one queue item at a time, the same way every other request comes through.",
  },
];

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
  clients,
};

export default offer;
