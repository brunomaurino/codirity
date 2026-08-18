# HANDOFF — Codirity Redesign v3: "Monthly Club" (execution plan)

**Date:** 2026-08-18 · **Supersedes:** `docs/HANDOFF-redesign-v2.md` (La Firma — only V0 shipped,
`99b4d31`; V1–V8 never built). **Direction:** approved by Bruno 2026-08-18 from a live pitch
artifact built directly off a teardown of [designjoy.co](https://designjoy.co) — see §1.

---

## §0 — How to execute this plan

Same machinery as the prior two redesigns: `/autonomous-bundle-loop docs/HANDOFF-redesign-v3.md`,
or individual bundles via §3. One bundle = one PR. §2 is the durable status surface. Ground rules
carried forward unchanged from the subscription rebuild + v1: `offer.ts` as source of truth for
all copy/prices/links, server components by default, gates `npm run lint` + `npx tsc --noEmit` +
`npm run build`, script-stripped SSR verification, `gh auth switch --user brunomaurino` (not
`maurino72` — corrected 2026-08-17, see the client-onboarding bundle-loop notes), banned-word
voice gate (§4 below, carried from v1 — content register is unchanged, only the visual system is
new).

**MERGE POLICY — AMENDED 2026-08-18 (operator, full authorization).** The visual-checkpoint gate
below was the original plan; Bruno has since explicitly authorized full unattended auto-merge for
the ENTIRE plan, including V0, because he already approved the exact visual system live (the
"Monthly Club" pitch artifact — same tokens, same fonts, same colors V0 implements) before this
HANDOFF was written, unlike v1/v2 where the visual approval happened only after a bundle shipped.
**No bundle in this plan pauses for operator confirmation; every PR opens with auto-merge armed
and watches straight through to merge.** The original policy is kept below for the historical
record of why the gate existed:

~~V0 opens its PR with auto-merge NOT armed and posts screenshots (desktop + mobile, light + dark)
for Bruno's explicit approval; only after his OK does V0 merge and do the remaining bundles
inherit the standing auto-merge authorization.~~ Two direction misses (v1's terminal aesthetic
"read as AI-made"; v2 never finished) is why this gate existed in v1/v2 — it's superseded here
specifically because the direction is pre-approved, not because the lesson stopped mattering.

## §1 — The concept: Monthly Club

Codirity and Designjoy sell the literal same thing: a flat-rate, unlimited-request, pause-anytime
subscription for senior work, no contracts. Every word of Codirity's existing hero copy —
*"unlimited requests," "flat monthly rate," "pause or cancel anytime"* — already fits Designjoy's
own vocabulary without forcing anything. This plan doesn't invent a new metaphor (v1 tried
"workbench," v2 tried "the firm you'd trust your operation to"); it adopts the visual system of
the closest working competitor in the category, verified live against the deployed site
2026-08-18 (colors and fonts below are read off `getComputedStyle`, not guessed).

**Direction-picker artifact:** the approved pitch (title "Monthly Club") is the visual spec of
record — read it before building anything if a screenshot of intent is needed. Ask Bruno for the
link if it's not in this session's history.

### The visual system

1. **Palette — warm neutral, one confident accent.** Background is NOT white and NOT the "La
   Firma" warm cream — a warm neutral with a faint green bias:
   - `paper` **#EBEBE4** (light) / **#1C1C18** (dark) — page background.
   - `ink` **#0A0A08** (light) / **#F2F2EC** (dark) — near-black / near-white text. Not pure
     `#000`/`#FFF` — same "chosen, not inherited" principle as the neutral.
   - `green` **#189656** — the ONE vivid accent (Codirity's brand color, pushed brighter/more
     confident than any prior iteration — Designjoy's own accent is hot pink `#FF0084`; ours
     stays green for brand continuity, used with the SAME discipline: one accent color,
     everywhere it appears it's doing a job — CTAs, badges, the blob art).
   - `gold` **#E8A93D** — secondary blob-gradient color, never a UI/text color, only inside the
     organic gradient art (mirrors how Designjoy's blobs mix pink/orange/blue/yellow together).
2. **Typography — one family, weight does the work.** **Figtree** (variable, `next/font/google`)
   for EVERYTHING — headlines, body, nav, labels — the same one-family discipline Designjoy uses
   (their whole site is just Figtree at different weights/sizes). Retire Fraunces (La Firma) and
   Space Mono (Workbench) as system voices; neither survives into v3. One exception: **Instrument
   Serif Italic**, used for exactly one accent word per major headline (Designjoy licenses a
   custom hand-lettered face for this same job — "you'll never go back," "everyone" — we use a
   real Google Font that does the same expressive-emphasis job without claiming to be their
   custom type).
3. **Shape & color-as-art.** Organic gradient blobs (radial/conic gradients layered, CSS only —
   no images) as the background art inside key cards: the hero's featured card, each of the three
   process cards, the benefit tiles, the pricing card's companion visual. Each gets its OWN color
   story (not one repeated gradient) — that variety is load-bearing, a single reused gradient
   reads as a template. Pill-shaped buttons, generously rounded cards (16–22px), a glassmorphic
   dark pricing card (frosted, `backdrop-filter: blur`) floating over its own blob.
4. **One black band.** The whole site is light-on-warm-neutral except the final CTA + footer,
   which flips to near-black (`#0A0A08`) — Designjoy does the identical thing at its own footer.
   It's the one deliberate contrast beat in an otherwise consistent palette; don't add a second
   one elsewhere.
5. **Anti-slop checklist (unchanged from v1 §5, still enforced):** no invented stats, no fake
   testimonials, no logo marquees/auto-rotating carousels, no stock illustrations or AI-generated
   faces, no fake urgency. Banned-word grep (§4) still applies to all copy — the REGISTER of the
   writing doesn't change with the visual system, only its container.

## §2 — Bundle status surface

| Bundle | Scope | Depends on | Status | PR # | Merge SHA |
|---|---|---|---|---|---|
| **V0** | Foundation flip: palette tokens (paper/ink/green/gold, light+dark), Figtree + Instrument Serif Italic wired in, blob-gradient utility classes, pill/rounded shape system, across ALL existing components — no structural change · ~~visual checkpoint: NO auto-merge~~ auto-merged per the 2026-08-18 full-authorization override (§0) | — | [x] complete | #20 | f9a8985 |
| **V1** | Hero: nav restyle, blob-card hero visual (replaces the "Cost Reduction / Save"-style floating stat cards), "Start today" badge, trust line | V0 approved | [x] complete | #21 | 017e7f9 |
| **V2** | Process + Benefits: Subscribe/Request/Ship as three blob-gradient cards; membership-benefits grid as 5–6 blob-tile icons (replaces `Benefits.tsx`'s current treatment) | V0 | [x] complete | #22 | f2a21ba |
| **V3** | Services ("what we build") as a scope pill-cloud + headline, mirroring Designjoy's "Apps, websites, logos & more" block | V0 | [ ] pending | | |
| **V4** | Clients (`RecentWork.tsx`) — eDairyCorp / Meshio / Vivi, reusing the APPROVED honesty framing from `redesign-storytelling.md` §1 (client vs. ours, Vivi marked pre-launch), presented as Designjoy-style badge cards instead of ledger rows | V0, content in §5 below (already resolved) | [ ] pending | | |
| **V5** | Pricing: glassmorphic dark card over its own blob, two-column feature list, dashed-border trust boxes ("Pause anytime," "Fast delivery"), guarantee cluster (gated on D3) | V0, decision D3 | [ ] pending | | |
| **V6** | FAQ + final CTA — FAQ deepened per v1 §6.R6's question list (still valid, register-only, not visual-system-specific), final CTA becomes the black band close | V0 | [ ] pending | | |
| **V8** | Case studies — eDairyMarket + Meshio, full briefs in §7 | V0 | [ ] pending | | |

**V7 removed from this table entirely (not just marked incomplete)** — the bundle-loop mechanism
only recognizes `[ ]`/`[x]`, so a row with no §3 launch command left in the table would hard-stop
the whole run when it's picked up with nothing to execute. V7's scope was "the people — real
photos, gated on D2"; §6's D2 entry keeps that reference alive. Re-add it as a real row (with a §3
command) whenever Bruno supplies real team photos — it is deferred, not deleted.

## §3 — Per-bundle launch commands

### §3.V0
```
/autonomous-task Redesign v3 Bundle V0 — Monthly Club foundation flip. Read docs/HANDOFF-redesign-v3.md §1 (the full visual system) and v1's docs/HANDOFF-redesign.md §4 (voice + banned-word gate, still binding — content register doesn't change). Implement the token flip across the whole site with NO structural/section changes: globals.css palette swap to paper/ink/green/gold (+ dark equivalents, both prefers-color-scheme and data-theme paths, contrast-checked WCAG AA); Figtree via next/font/google wired into every heading AND body text (replacing Outfit); Instrument Serif Italic loaded and available as a `.accent` utility for the one-word-per-headline emphasis technique; retire Fraunces and Space Mono as system voices entirely; blob-gradient CSS utility classes (radial/conic layered gradients, no images, at least 4 distinct color combinations so later bundles don't reuse one gradient everywhere); pill-shaped button utility; card radius bump to 16-22px; a glassmorphic-card utility (backdrop-filter blur + translucent dark bg) for V5's future pricing card. Check the theme-init script/OG image colors don't hardcode the old palette. Gates: lint + tsc + build + SSR check + banned-word grep + perf delta. Post desktop+mobile, light+dark screenshots in the PR description for the record (operator has pre-approved this exact visual system via the pitch artifact — auto-merge stays armed per the 2026-08-18 policy amendment in §0, do NOT open with --no-merge). --bundle-id 201 --plan-slug redesign-v3
```
*(Per the 2026-08-18 full-authorization amendment in §0, every bundle below launches immediately
once the prior one merges — no operator pause between them. Each brief points its builder at the
approved "Monthly Club" pitch artifact for the literal layout to mirror, plus the real `offer.ts`
copy — never lorem, never invented content.)*

### §3.V1
```
/autonomous-task Redesign v3 Bundle V1 — hero. Read docs/HANDOFF-redesign-v3.md §1 (visual system, now merged from V0) and the approved "Monthly Club" pitch artifact's hero mockup for the literal layout to mirror: nav with a small green brand dot + "Book a call"/"See pricing" pill buttons, an asymmetric hero grid (copy left, blob-gradient card right), the blob card carries a "Start today" badge with a small pulse dot, a short headline, and a CTA pill. Replace Hero.tsx's current floating stat cards ("Cost Reduction / Save" etc.) entirely with this. Real offer.ts hero copy only (headline, subhead, both CTAs — text unchanged, both remain instrumented analytics events), apply the `.accent` italic-word treatment to exactly one word in the H1 ("on subscription"), trust line ("Built by engineers from Globant & Ualá") stays. Gates: lint + tsc + build + SSR check + banned-word grep + perf delta. --bundle-id 202 --plan-slug redesign-v3
```

### §3.V2
```
/autonomous-task Redesign v3 Bundle V2 — process + benefits. Read docs/HANDOFF-redesign-v3.md §1 and the pitch artifact's process-card and benefit-tile sections. Rework Process.tsx's Subscribe/Request/Ship (existing offer.ts howItWorks copy, text unchanged) into three blob-gradient cards, each with ITS OWN distinct color combination — reusing one gradient across all three is a defect, not a shortcut. Rework Benefits.tsx into a 5–6 tile grid, each tile its own blob-gradient background with a simple line icon, using the REAL existing offer.ts benefits content (do not invent new benefit copy or icons unrelated to what's already there). The benefits section headline uses the `.accent` italic-word treatment on exactly one word. Gates: standard (lint+tsc+build+SSR+banned-word grep) + perf delta. --bundle-id 203 --plan-slug redesign-v3
```

### §3.V3
```
/autonomous-task Redesign v3 Bundle V3 — services. Read docs/HANDOFF-redesign-v3.md §1. Services.tsx (the "what we build" included/not-included lists) doesn't have a literal mockup in the pitch artifact — extrapolate consistently with Designjoy's own "Apps, websites, logos & more" pill-cloud block (referenced in HANDOFF §1): render offer.ts's scope/category data as wrapped pill-shaped tags, headline using the `.accent` treatment on one word. Keep the not-included list's content intact and presented plainly (still honest, still visible — do not delete or bury it). Gates: standard + perf delta. --bundle-id 204 --plan-slug redesign-v3
```

### §3.V4
```
/autonomous-task Redesign v3 Bundle V4 — clients. Read docs/HANDOFF-redesign-v3.md §5 (the RESOLVED D6 content) and docs/redesign-storytelling.md §1b in full for the exact facts and "Draft story copy" per entity (eDairyCorp — client; Meshio and Vivi — ours, Vivi explicitly pre-launch). Rework RecentWork.tsx into Designjoy-style badge cards — one blob-gradient tile per client/product, an honest `client`/`ours` tag on each, a one-liner story adapted from the storytelling doc's draft copy into the warmer Monthly Club voice (HANDOFF-redesign-v3.md §4) rather than copied verbatim (that draft copy was written for the old ledger/mono register). The honesty discipline is non-negotiable: never present Meshio or Vivi as arm's-length clients, Vivi must say "pre-launch." Gates: standard + perf delta. --bundle-id 205 --plan-slug redesign-v3
```

### §3.V5
```
/autonomous-task Redesign v3 Bundle V5 — pricing. Read docs/HANDOFF-redesign-v3.md §1 and §6 (D3 RESOLVED: 50% refund if cancelled within the first 7 days of a NEW subscription — use this EXACT figure, it is a real financial commitment, do not alter it or invent a different one; D5 RESOLVED: no capacity badge ships, do not add one). Rework Pricing.tsx into the glassmorphic dark card over its own blob-gradient companion visual (mirroring the pitch artifact's pricing section), a two-column feature list per tier using real offer.ts tier data (Standard $3,995/mo, Pro $6,995/mo — prices unchanged), dashed-border trust boxes for "Pause anytime" and "Fast delivery" (reuse existing site claims for delivery time — do not invent a new figure), and a guarantee cluster stating the 50%-first-week-refund plainly in real prose. Keep both existing Stripe Payment Link CTAs and the founding-rate banner fully functional and instrumented (checkout_click_standard/pro/founding events unchanged) — verify the real hrefs still resolve; this must not regress checkout. Gates: standard + perf delta + manual click-through check that all three CTAs still link to the live Payment Links. --bundle-id 206 --plan-slug redesign-v3
```

### §3.V6
```
/autonomous-task Redesign v3 Bundle V6 — FAQ + final CTA close. Read docs/HANDOFF-redesign-v3.md §1 and §4, and v1's docs/HANDOFF-redesign.md §6.R6 for its still-valid extended FAQ question list (a REGISTER-agnostic reference for WHICH questions to add, not how to answer them — write every answer in the warmer Monthly Club voice per HANDOFF-redesign-v3.md §4, never v1's dry founder-engineer register). Deepen Faq.tsx from its current question count toward the ~12 questions that list names (Why not just hire? Who actually writes the code? What does "one request" mean? Why limited spots? What happens when I pause? Who owns the code? etc.), update FAQPage JSON-LD to match. Rework Contact.tsx's final CTA into the black-band close (near-black background, per HANDOFF §1 rule 4 — the ONE deliberate palette contrast beat in the whole site) keeping the existing contact form + Cal booking button, real copy only. Gates: standard + perf delta + SSR check on the new FAQ copy. --bundle-id 207 --plan-slug redesign-v3
```

### §3.V8
```
/autonomous-task Redesign v3 Bundle V8 — case studies. Read docs/HANDOFF-redesign-v3.md §7 IN FULL before writing anything — it contains the complete, Bruno-approved content briefs for both case studies (eDairyMarket, Meshio), verbatim facts and explicit "Do NOT include" exclusions per study (no WordPress cost-savings figure for eDairyMarket, no fabricated activation-rate percentage for Meshio). Do not invent any fact, metric, or detail beyond what §7 states. Build a new case-studies section (new component under src/components/sections/, wired into the page) presenting both studies using V0's established tokens: a blob-gradient accent behind each headline stat, the `.accent` italic-word treatment on each headline, Figtree body copy, stack tags per study, and one simple hand-drawn-feel SVG architecture sketch per study (an honest, simplified diagram of what was actually built, per v1's HANDOFF-redesign.md §6.R8 reasoning — never isometric stock art, never a literal screenshot). Place the section after Clients (V4) and before Pricing (V5) in page order — document if a different position is chosen and why. Gates: standard + perf delta + banned-word grep. --bundle-id 208 --plan-slug redesign-v3
```

## §4 — Voice: unchanged from v1

The copy register does not change with the visual system. Read `docs/HANDOFF-redesign.md` §4 in
full (banned-word list, before/after examples, the "honesty is a feature" principle) — it applies
verbatim to every bundle in this plan. The only adjustment: Designjoy's own tone is warmer and
more casual than the Workbench's dry-founder-engineer voice ("One subscription to rule them all,"
"It's 'you'll never go back' better") — lean slightly warmer/friendlier than v1's register allowed
(the banned-word list still bans corporate slop; it was never banning warmth), matching the new
visual system's friendlier register. When in doubt, prefer the existing `offer.ts` copy's own
tone (already close to this) over inventing new lines.

## §5 — Content that survives from prior plans (do not re-litigate)

- **Clients (D6 — RESOLVED 2026-07-28, still valid):** eDairyCorp (client), Meshio (ours), Vivi
  (ours, pre-launch) — full facts, sourced work history, and Bruno-approved framing ("Option A —
  already on the board," honest `client`/`ours` tags, Vivi explicitly marked pre-launch) in
  `docs/redesign-storytelling.md` §1. V4 REUSES this content, adapted from the old ledger-row
  visual (mono, status dots) to Designjoy-style badge cards (blob-tile + one-liner) — the FACTS
  and the honesty discipline carry forward; the ledger/terminal presentation does not.
- **What does NOT carry forward:** the rest of `redesign-storytelling.md` (the Mon–Fri week log,
  the receipt-style Ledger, "things we've been asked to build" verbatim-ask framing) was written
  specifically for the Workbench's terminal/artifact metaphor and doesn't fit Monthly Club's
  friendlier register or layout. V2/V3/V6 write fresh copy in the §4 voice rather than reusing
  those specific narrative devices — reference `offer.ts`'s existing content as the copy baseline
  instead.

## §6 — Decisions Bruno owns

| ID | Decision | Blocks | Status |
|---|---|---|---|
| D1 | 2–3 real case studies | V8 | **RESOLVED** 2026-08-18 — eDairyMarket + Meshio, full briefs in §7 |
| D2 | Which engineers appear, with photos | V7 | open — no photos supplied; **V7 stays unbuilt**, not blocking the rest of the plan |
| D3 | The guarantee | V5 | **RESOLVED** 2026-08-18 — 50% refund if cancelled within the first 7 days |
| D4 | Publishable aggregate stats | proof content, any section | open — no real numbers supplied; no bundle in this plan is gated on it, so no section publishes a stat unless `offer.ts` carries one |
| D5 | Real capacity number in `offer.ts` | badge content, if used | **RESOLVED** 2026-08-18 — no capacity badge ships |
| D6 | Client logos/identities with permission | V4 | **RESOLVED** 2026-07-28 — see §5 |

**V7 is explicitly OUT OF SCOPE for this run** — the plan builds V0–V6 and V8, and stops there. Do
not invent placeholder people/photos to force V7 through; re-open it as its own bundle whenever
Bruno supplies real photos.

## §7 — V8 case study content (resolved 2026-08-18 — use verbatim, do not invent metrics beyond these)

Two case studies, chosen by Bruno: **eDairyMarket** (the client relationship) and **Meshio** (the
owned product). Facts below are pulled from `docs/redesign-storytelling.md` §1b (traceable to
`~/br-brain` day-logs) — the SAME facts already approved for the D6 clients section, now given the
fuller case-study treatment (outcome-first headline, story, stack, since there is no real
before/after conversion number for either, per the "no invented stats" rule the headline is the
concrete technical fact itself, not a fabricated percentage).

### Case study 1 — eDairyMarket

- **Relationship:** client (eDairyCorp group — eDairyMarket is their B2B dairy marketplace).
- **Headline (the concrete fact, not an invented metric):** 27 of 273 product pages — 10% of the
  entire catalog — were returning 404 and still listed in the sitemap Google was crawling. Found
  and fixed.
- **Context:** a 20+ year old B2B dairy marketplace (~17k visits/month) running on a legacy
  Angular + Node stack, rebuilt in place — new NestJS APIs, a Next.js SSR storefront, a React
  admin panel — without dropping the SEO traffic the old stack was still serving.
- **What shipped:** Stripe seller subscriptions (three tiers); buyer favorites with guest→account
  merge on login; a product-page revamp (seller cards, related products) with seller identity
  resolved server-side so crawlers see it; a server-side table-filter system across two APIs and
  the admin panel; migration off a shared box that had run prod+dev+admin together for years, onto
  isolated AWS infra with merge-to-trunk auto-deploy.
- **Stack tags:** NestJS · Next.js (SSR) · React · Stripe · AWS.
- **Do NOT include:** the WordPress-fleet cost figure (`~$770–800/mo` pre-optimization) — the
  after-cost was never recorded, so no savings number can be printed (per `redesign-storytelling.md`'s
  own note). If this angle is used at all, state the before-cost only, never a "saved $X" claim.

### Case study 2 — Meshio

- **Relationship:** ours (owned by the same LLC as Codirity — say so plainly, the same honesty
  discipline as the D6 clients section; do not present it as an arm's-length client).
- **Headline:** onboarding rebuilt around ONE activation metric — first post published — instead
  of a generic signup flow.
- **Context:** Meshio (meshio.co) is an AI content-ideation SaaS that drafts post ideas in the
  user's own voice for X, LinkedIn, and Threads.
- **What shipped:** a New → Niche Set → Voice Set → Activated state machine; OAuth sign-in
  deliberately deferred until the point the user actually needs it (pushed friction past the
  moment the user has already seen the product, not before); Stripe subscription tiers specced.
- **Stack tags:** Next.js · Stripe · (the scoring/ideation pipeline runs on an LLM — do not name a
  specific model/vendor unless Bruno confirms one; the existing site copy doesn't commit to one
  either).
- **Do NOT include:** any specific before/after activation-rate percentage — none was recorded:
  the fact that it was rebuilt around a single measurable activation event IS the story, not a
  claimed lift.

Both studies want the hand-drawn-feel architecture sketch v1 §6.R8 specified (a real, simplified
diagram of what was actually built — not isometric stock art) — reuse that spec's reasoning
(fabricated-looking quotes are the category's tell; a real architecture sketch can't be faked
casually) even though the surrounding visual system changed. Present each study as its own
generously-padded block using V0's tokens (a blob-gradient accent behind the headline stat, the
`.accent` italic word on the headline, Figtree body) rather than the v1 ledger-row treatment.
