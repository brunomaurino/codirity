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
  /** One-line summary of the active-task limit. Rendered standalone by the hero
   *  ledger and the Trello onboarding copy, so it must read as a full clause. */
  tasks: string;
  /** The terms band's note for this tier, VERBATIM from the approved mockup
   *  (docs/redesign-v4/approved-mockup.html #terms). Held separately rather than
   *  interpolated from `tasks`: the band's wording is "Two active tasks, running
   *  in parallel", while `tasks` says "Two active tasks at a time" — assembling
   *  one from the other produced "at a time, running in parallel" (Phase 4/5
   *  review). Keep the active-task count here consistent with `tasks`. */
  note: string;
  /** Bullet feature list, in display order. */
  features: string[];
  /** Stripe Payment Link (env-configured; "#" placeholder until set). */
  stripeUrl: string;
  /** Call-to-action label. */
  cta: string;
}

export interface FoundingRate {
  /** Gates the founding row of the terms band AND the founding FAQ entry (the
   *  v3 launch banner it originally gated was deleted in W2). Flip to false —
   *  one line — when the slots fill, and both surfaces disappear together. */
  active: boolean;
  /** Display price (spec-mandated verbatim), e.g. "$2,995/mo". */
  price: string;
  /** Machine-readable monthly amount, for structured data / analytics. */
  priceAmount: number;
  slots: number;
  /** Billing period suffix, matching Tier.period. Declared explicitly so the
   *  terms band can split `price` into figure + unit without string-guessing —
   *  the first draft stripped "/mo" and re-appended a hardcoded one, which
   *  would corrupt silently if `price`'s format ever changed (Phase 4/5
   *  review). `price` stays the spec-mandated verbatim string. */
  period: string;
  /** Call-to-action label for the founding row. */
  cta: string;
  /** Stripe Payment Link for the founding rate (env-configured). */
  stripeUrl: string;
}

export interface Guarantee {
  /** Days from subscription start the refund window covers. */
  days: number;
  /** Percentage refunded inside that window. */
  refundPct: number;
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

/** A full case study (redesign v3 Bundle V8).
 *
 *  This SHAPE replaces a placeholder written before the content existed
 *  (`title`/`summary`/`result`/`industry`/`href`), which never matched what
 *  `HANDOFF-redesign-v3.md` §7 actually resolved to and had zero consumers —
 *  the array was empty. Keeping it alongside a second, real array would have
 *  left one dead shape and one live one to drift apart.
 *
 *  EVERY field here is filled verbatim from §7. §7 is the source of truth and
 *  the ONLY permitted source: it carries explicit per-study "Do NOT include"
 *  exclusions (no WordPress cost-savings figure for eDairyMarket, no
 *  activation-rate percentage for Meshio) precisely because those numbers were
 *  never recorded. Do not enrich these entries from the codebase, from
 *  `redesign-storytelling.md`, or from memory. */
export interface CaseStudy {
  /** Product name as it ships publicly. */
  name: string;
  /** Relationship tag. Both studies are "client" per the 2026-08-18 D6
   *  amendment (see the NOTE on `ClientEntry`); §7 already reflects it. */
  relationship: string;
  /** One-line description of what the product IS, for readers who don't know it. */
  context: string;
  /** The headline. §7's rule: since no real before/after conversion number
   *  exists for either study, the headline is the concrete TECHNICAL fact
   *  itself, never a fabricated percentage. */
  headline: string;
  /** The word inside `headline` the retired `.accent` treatment emphasized.
   *  v4 W0: renders as plain text (AccentWord is a pass-through); W4's case-
   *  study rework removes the field. */
  headlineAccent: string;
  /** Longer context paragraph — the situation the work happened in. */
  background: string;
  /** What was actually built. Each item is a §7 "What shipped" bullet. */
  whatShipped: string[];
  /** Stack tags, exactly as §7 lists them. */
  stack: string[];
  /** Selects the architecture sketch. A union, not a free string, so a study
   *  can never silently render no diagram — or another study's. */
  sketch: "edairymarket" | "meshio";
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
  /** The page's single <h1>. */
  headline: string;
  subhead: string;
    /** Always a link (currently to #terms) — see LinkCta. */
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
  terms: SectionCopy;
  faq: SectionCopy;
  contact: SectionCopy;
  caseStudies: SectionCopy;
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

/** The response-time promise, stated ONCE. It is a real commitment to anyone who
 *  writes in, and Bundle V6's review battery caught it restated twice in the same
 *  viewport with two different figures ("within 24 hours" in the contact facts vs.
 *  "answer within a day" in the form) — two strings free to drift apart, and one
 *  of them silently wider than the other. Both call sites now render this. */
export const RESPONSE_TIME_CLAIM = "We reply within 24 hours";

export const hero: HeroContent = {
  headline: "Your AI & automation team, on subscription.",
  subhead:
    "Unlimited requests, senior engineering, and AI-accelerated delivery — for one flat monthly rate. Pause or cancel anytime.",
  // "#terms" since W2 renamed the section; a full-height "#pricing" alias
  // layer inside the band keeps old inbound links and the tracker working.
  primaryCta: { label: "See pricing", href: "#terms" },
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
  caseStudies: {
    label: "Case studies",
    // No count in the prose: "Two of them, in detail" hardcoded a number with no
    // link to `caseStudies.length`, so adding or removing a study would silently
    // contradict the heading (Phase 4/5 review).
    title: "In detail",
    description:
      "What was actually built, what it replaced, and the diagram of how it fits together.",
  },
  // The v4 terms band (W2, from the approved mockup): a single eyebrow line
  // over the four-figure ledger. `title` is the sr-only heading that keeps the
  // document outline; the visible framing is the label.
  terms: {
    // "{n}" is replaced with the SPELLED-OUT count of rows the band actually
    // renders (Pricing.tsx). The literal "four" was hardcoded while the founding
    // row is gated on foundingRate.active — flipping that documented kill-switch
    // left three rows under a promise of four (Phase 4/5 review).
    label: "The whole offer, in {n} numbers",
    title: "Simple, monthly pricing",
  },
  faq: {
    label: "FAQ",
    title: "Questions, answered",
    description:
      "Everything you might want to know before subscribing. Still unsure? Book a quick call.",
  },
  // The final CTA — rendered on the site's one near-black band
  // (HANDOFF-redesign-v3.md §1 rule 4). Replaces the pre-redesign copy that
  // was hardcoded in ContactInfo.tsx ("Let's Build Something Great Together" /
  // "transform your business with AI-powered solutions"), which predated the
  // §4 voice gate and never went through it.
  contact: {
    label: "Start here",
    title: "Tell us what's eating your week",
    description:
      "Send it over and we'll tell you whether it's a task, a build, or something we'd talk you out of. If you'd rather just start, pick a plan above.",
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
    note: "One active task at a time. Unlimited requests in the queue behind it.",
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
  },
  {
    id: "pro",
    name: "Pro",
    price: "$6,995",
    priceAmount: 6995,
    period: "/mo",
    tasks: "Two active tasks at a time",
    note: "Two active tasks, running in parallel. Priority delivery.",
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
  },
];

export const foundingRate: FoundingRate = {
  active: true,
  price: "$2,995/mo",
  priceAmount: 2995,
  slots: 5,
  period: "/mo",
  cta: "Get started",
  stripeUrl: stripeLink(process.env.NEXT_PUBLIC_STRIPE_LINK_FOUNDING),
};

export const guarantee: Guarantee = {
  // The band renders these two figures at the 99px tier; they were hardcoded in
  // Pricing.tsx until Phase 4/5 review. They are a REAL financial commitment —
  // `description` below restates the same terms in prose and must stay in sync.
  days: 7,
  refundPct: 50,
  // D3 RESOLVED 2026-08-18 (redesign v3): 50% refund if cancelled within
  // the first 7 days of a NEW subscription — a real financial commitment,
  // use this exact figure (see docs/HANDOFF-redesign-v3.md §6). Titled to
  // match the actual terms (50% back, not a full refund) — the heading
  // must not overstate it.
  description:
    "Cancel within your first 7 days on a new subscription and get 50% back, no questions asked.",
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
      "Unlimited revisions are included, so we iterate until it's right. Every new subscription is also backed by our guarantee: cancel in the first 7 days and get 50% back, no questions asked.",
  },
  {
    question: "Can I pause or cancel?",
    answer:
      "Anytime. Pause your subscription when your queue is empty and resume when you need us again. Your board, your code, and your history stay put while you're away. No contracts, no lock-in.",
  },
  {
    question: "Why not just hire someone?",
    answer:
      "If you have forty hours a week of engineering work, hire — we'll tell you so on the call. If you have five or fifteen, a full-time salary is the expensive way to get them, and you're still doing the recruiting.",
  },
  {
    question: "Who actually writes the code, you or the AI?",
    answer:
      "Engineers. The AI drafts; we own what ships. Nothing reaches your repo that a senior engineer hasn't read, changed, and put their name on.",
  },
  {
    question: "Who owns the code and the accounts?",
    answer:
      "You do. Repos in your org, infrastructure in your cloud accounts, credentials in your vault. If we disappeared tomorrow you'd lose a vendor, not a system.",
  },
  {
    question: "What if something breaks a month later?",
    answer:
      "Add a card. Fixes to things we built are requests like any other, and ongoing fixes are part of the subscription. We don't ship what we can't maintain — it's why the list of what we don't do is short and specific.",
  },
  // Gated on `foundingRate.active`, and the number and price are read from that
  // object rather than written into the prose. Both are required, not tidiness:
  // this answer is the only place the founding offer would have been stated as a
  // plain always-rendered string, so flipping the documented one-line kill-switch
  // when the seats fill would have left the FAQ — and the FAQPage JSON-LD served
  // to Google — advertising an expired price. Found in Phase 4/5 review.
  ...(foundingRate.active
    ? [
        {
          question: `Why only ${foundingRate.slots} founding seats?`,
          // Deliberately NOT framed as a capacity cap. `foundingRate` is a launch
          // PRICE promo, not a limit on how many clients we take, and the earlier
          // draft of this answer ("one engineer works one queue, one task at a
          // time... we cap how many queues exist") both invented that cap and
          // contradicted the Pro tier's two-active-tasks promise two entries
          // above it. Also found in Phase 4/5 review.
          answer: `It's a launch price, not a waiting list. The first ${foundingRate.slots} subscriptions keep ${foundingRate.price} for as long as they stay on it; after that the rate is the one listed above. The work is identical either way — same queue, same delivery.`,
        },
      ]
    : []),
  {
    question: "Do I have to get on a call first?",
    answer:
      "No. Pick a plan, check out, and add your first task the same day. The call is there if you'd rather talk it through first.",
  },
  {
    question: "What don't you do?",
    answer:
      "We focus on AI, automation, and custom systems. We don't do native mobile apps, brand or marketing design, or staffing for manual operations. If we're not the right fit, we'll tell you.",
  },
];

/** D1 RESOLVED 2026-08-18 — eDairyMarket + Meshio. Every string below is
 *  transcribed from `docs/HANDOFF-redesign-v3.md` §7, which is Bruno-approved
 *  and itself traceable to `docs/redesign-storytelling.md` §1b. Nothing here is
 *  inferred, rounded, or enriched.
 *
 *  Two exclusions §7 states explicitly, both because the number was never
 *  recorded — a missing number is not an invitation to estimate one:
 *   - eDairyMarket: NO WordPress-fleet cost figure and no "saved $X" claim.
 *     The before-cost exists (~$770-800/mo) but the after-cost does not, so no
 *     savings can be printed; this bundle prints neither.
 *   - Meshio: NO before/after activation-rate percentage. That onboarding was
 *     rebuilt around ONE measurable activation event IS the story; a claimed
 *     lift would be fabricated.
 *  Also per §7: do not name an LLM model or vendor for Meshio — the existing
 *  site copy doesn't commit to one either. */
export const caseStudies: CaseStudy[] = [
  {
    name: "eDairyMarket",
    relationship: "Client",
    context: "A B2B dairy marketplace, part of the eDairyCorp group.",
    // The concrete technical fact, per §7's headline rule — not a metric.
    // §7's headline ends "Found and fixed." — restored in Phase 4/5 review. Without
    // it the section's largest claim reads as a live unresolved defect on a named
    // client's production catalog rather than as delivered work, inverting §7's
    // outcome-first intent.
    headline: "27 of 273 product pages were returning 404 — 10% of the catalog, still listed in the sitemap Google was crawling. Found and fixed.",
    headlineAccent: "404",
    background:
      "A 20+ year old marketplace doing around 17k visits a month on a legacy Angular and Node stack, rebuilt in place — new NestJS APIs, a Next.js SSR storefront, a React admin panel — without dropping the SEO traffic the old stack was still serving.",
    whatShipped: [
      "Stripe seller subscriptions across three tiers",
      // "guest FAVORITES", not "guest carts". §7 and redesign-storytelling.md both
      // say buyer favorites merge guest→account on login; an earlier draft of this
      // line said "carts", which invented a shipped e-commerce feature for a real
      // client. Caught as a BLOCKER in Phase 4/5 review — and it slipped the
      // builder's own fact-provenance gate because that gate asserted §7's strings
      // were PRESENT and never checked for substituted nouns.
      "Buyer favorites, with guest favorites merged into the account on login",
      "A product-page revamp — seller cards, related products — with seller identity resolved server-side so crawlers see it",
      "Server-side table filtering across two APIs and the admin panel",
      "A move off a shared box that had run prod, dev and admin together for years, onto isolated AWS infra with merge-to-trunk auto-deploy",
    ],
    stack: ["NestJS", "Next.js (SSR)", "React", "Stripe", "AWS"],
    sketch: "edairymarket",
  },
  {
    name: "Meshio",
    relationship: "Client",
    context:
      "An AI content-ideation product that drafts post ideas in your own voice for X, LinkedIn and Threads.",
    headline:
      "Onboarding rebuilt around one activation metric — first post published — instead of a generic signup flow.",
    headlineAccent: "published",
    // Rewritten in Phase 4/5 review. The previous opener — "Signup asked for
    // everything up front and measured nothing that mattered." — was a
    // characterization of the prior product state that §7 never makes. It read as
    // fact and was invented; a plausible inference about a real client's product is
    // still a fabrication. Every clause below now restates §7's own words:
    // "rebuilt around ONE activation metric — first post published — instead of a
    // generic signup flow" and "OAuth sign-in deliberately deferred until the point
    // the user actually needs it (pushed friction past the moment the user has
    // already seen the product, not before)".
    background:
      "Onboarding became a state machine with a single destination — the first published post — rather than a generic signup flow. Sign-in is deferred to the point a user actually needs an account, which puts the friction after they have already seen the product rather than before.",
    whatShipped: [
      "A New → Niche Set → Voice Set → Activated state machine",
      "OAuth sign-in deliberately deferred until the point the user actually needs it — friction pushed past the moment they have already seen the product, not before",
      "Stripe subscription tiers specced",
    ],
    stack: ["Next.js", "Stripe"],
    sketch: "meshio",
  },
];

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
