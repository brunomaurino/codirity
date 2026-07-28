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

import type { StatusDotVariant } from "@/components/ui/StatusDot";

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

/**
 * One line of the cost-comparison receipt (HANDOFF-redesign §6.R2). Every
 * dollar value MUST trace to the sourced-figures table in the R2 run notes —
 * D4 bans invented numbers, and this artifact is the credibility centerpiece.
 */
export interface LedgerRow {
  label: string;
  value: string;
  /** Superscript footnote marker rendered after the label. */
  footnote?: number;
  /** Render the value as the green checkmark (green-means-live). Explicit flag
   *  rather than string-matching "✓", so no future row goes green by accident. */
  check?: boolean;
}

export interface CostLedger {
  /** Small-caps mono heading inside the receipt. */
  heading: string;
  /** The hire side, one row per cost line. */
  hire: LedgerRow[];
  /** The Codirity side, below the rule. First row renders bold as the total. */
  us: LedgerRow[];
  /** Mono sources line under the receipt — sources + retrieval date. */
  footnote: string;
}

/**
 * One entry of the "a week with us" log (HANDOFF-redesign §6.R3) — the diary
 * of a typical request. `done` entries wear the filled green dot; the open
 * Friday entry stays inert.
 */
export interface WeekLogEntry {
  /** Mono timestamp, e.g. "mon 09:12". */
  when: string;
  text: string;
  /** Optional client quote rendered inside the entry. */
  quote?: string;
  done: boolean;
}

/** One column of the mock queue board rendered under the week log. */
export interface BoardColumn {
  label: string;
  /** Status-dot variant for the column header — derived from the shared
   *  StatusDot primitive (type-only import, erased at compile time; keeps this
   *  file rendering-free while preventing the two unions from drifting). */
  dot: StatusDotVariant;
  cards: string[];
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

/**
 * One row of the clients ledger (HANDOFF-redesign §6.RC). The honesty framing
 * is load-bearing: `provenance` is rendered as a visible tag so a visitor never
 * has to guess which names are clients and which are our own products, and a
 * pre-launch product says so instead of wearing a "live" dot.
 */
export interface ClientEntry {
  name: string;
  /** What it is, in a few words — rendered next to the name. */
  tagline: string;
  provenance: "client" | "ours";
  status: "in_production" | "pre_launch";
  /** The second ledger line: what went through the queue for this name. */
  detail: string;
}

/** Header copy (eyebrow label + title + optional description) for a marketing section. */
export interface SectionCopy {
  label: string;
  title: string;
  description?: string;
}

export interface SectionsContent {
  clients: SectionCopy;
  howItWorks: SectionCopy;
  whatWeBuild: SectionCopy;
  ledger: SectionCopy;
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
  costLedger: CostLedger;
  weekLog: WeekLogEntry[];
  weekBoard: BoardColumn[];
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
  // Approved framing (Bruno, 2026-07-28): Option A from the storytelling doc —
  // lead with the honesty, don't bury it. Two of the three names are ours and
  // the copy says so before any visitor has to find it in the footer.
  clients: {
    label: "Clients",
    title: "Already on the board",
    description:
      "Three names have been through this queue. One is a client. Two are our own products — we built the subscription by running it on ourselves first. Same board, same rules, tagged so you can tell which is which.",
  },
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
  ledger: {
    label: "The ledger",
    title: "What the alternative costs",
    description:
      "A senior hire is the honest comparison. Here is that receipt, next to ours.",
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

/**
 * The cost-comparison receipt. Every figure is SOURCED and rounded DOWN (the
 * conservative direction — the receipt understates the hire cost). Derivations
 * + sources: docs/autonomous-runs/redesign-r2-ledger/notes.md, and the mono
 * footnote below renders them on the page. Retrieved 2026-07-28.
 */
export const costLedger: CostLedger = {
  heading: "What a senior engineer costs",
  hire: [
    // BLS OES 15-1252 (2025): 75th percentile $171,980/yr as the senior proxy.
    { label: "salary (US senior, /mo)", value: "$14,300", footnote: 1 },
    // 20% contingency on year-one salary, amortized over 24 months of tenure.
    { label: "recruiter fee (amortized)", value: "$1,400", footnote: 2 },
    // BLS ECEC: private-industry benefits = 29.8% of comp ≈ 42% of wages.
    { label: "benefits & employer overhead", value: "$6,000", footnote: 3 },
    // Workable global engineering time-to-fill ≈ 62 days; seniors run slower.
    { label: "time to a signed offer", value: "~9 weeks", footnote: 4 },
  ],
  us: [
    // Derived from the Standard tier — the single authoritative price — so a
    // tier change can never silently drift from this receipt.
    {
      label: "Codirity, Standard",
      value: `${tiers[0].price}${tiers[0].period}`,
    },
    // D5 (capacity number) unresolved, so no "this week" claim — this line is
    // true by construction: the board exists the day the subscription starts.
    { label: "first card starts", value: "day one" },
    { label: "pause any month", value: "✓", check: true },
  ],
  footnote:
    "figures, rounded down · ¹ BLS OES 15-1252 (2025), 75th percentile $171,980/yr as the senior proxy · ² 20% of year-one salary ÷ 24 mo · ³ BLS ECEC, private-industry benefits 29.8% of compensation · ⁴ Workable engineering time-to-fill ≈ 62 days · retrieved 2026-07-28",
};

/**
 * The Mon–Fri log — storytelling doc §3, verbatim. A diary of a real-shaped
 * request (drawn from the eDairy dead-URL class of work), not abstract steps.
 */
export const weekLog: WeekLogEntry[] = [
  {
    when: "mon 09:12",
    text: "you drop a card:",
    quote: "customers say our product links are dead. No idea how many.",
    done: true,
  },
  {
    when: "mon 11:40",
    text: "we ask two questions. That's usually all of them.",
    done: true,
  },
  {
    when: "tue 10:00",
    text: "the plan appears on the card: crawl the sitemap, diff it against live pages, fix the URL scheme, patch the sitemap. You drag it above the reporting task. Dragging is the whole management interface.",
    done: true,
  },
  {
    when: "thu 16:05",
    text: "fixed. 27 of 273 pages were dead; the card links the list, the fix, and a 3-minute Loom. No meeting was scheduled at any point.",
    done: true,
  },
  {
    when: "fri",
    text: "the card is boring now. Boring is the goal. Next card starts.",
    done: false,
  },
];

/**
 * The mock queue board under the log. Every card traces to the approved
 * universe: In-progress/Shipped reuse the hero vignette's rows with CONSISTENT
 * states, and the Queued card is the storytelling doc's approved §4 ask #6 (the
 * anonymized AI-document-extraction composite). A near-empty queue is also the
 * honest picture. Labeled illustrative by weekBoardCaption (mandatory, §3).
 */
export const weekBoard: BoardColumn[] = [
  {
    label: "Queued",
    dot: "inert",
    cards: ["AI document extraction, human review step"],
  },
  {
    label: "In progress",
    dot: "active",
    cards: ["wordpress fleet cost cut"],
  },
  {
    label: "Shipped",
    dot: "live",
    cards: ["dead product URLs — 27 found · 1d", "admin table filters · 3d"],
  },
];

/** Mandatory honesty caption (storytelling §3) — rendered mono under the board. */
export const weekBoardCaption = "a typical week's board — illustrative, not a live feed";

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

/**
 * The clients ledger (storytelling doc §1, approved 2026-07-28). Facts trace to
 * the brain record: eDairyCorp is the active client (est. 2003, marketplace
 * rebuild in place); Meshio and Vivi are our own products, tagged `ours`; Vivi
 * has not shipped to the App Store and says so.
 */
export const clients: ClientEntry[] = [
  {
    name: "eDairyCorp",
    tagline: "dairy B2B marketplace, est. 2003",
    provenance: "client",
    status: "in_production",
    detail:
      "legacy rebuild in place · stripe seller tiers · 27 dead URLs found & fixed",
  },
  {
    name: "Meshio",
    tagline: "AI content-ideation SaaS",
    provenance: "ours",
    status: "in_production",
    detail:
      "onboarding rebuilt around one activation metric · sign-in friction pushed past first value",
  },
  {
    name: "Vivi",
    tagline: "outfit-scoring iOS app",
    provenance: "ours",
    status: "pre_launch",
    detail:
      "photo → score → history · scoring pipeline + paywall, built one card at a time",
  },
];

/** Closer row under the ledger — the open slot. Rendered with the blinking caret. */
export const clientsCloser = "next row: yours";

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
  costLedger,
  weekLog,
  weekBoard,
  faq,
  caseStudies,
};

export default offer;
