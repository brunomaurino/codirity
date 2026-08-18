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

**NEW MERGE POLICY — same visual checkpoint both prior attempts taught us to need, now for the
THIRD time.** V0 opens its PR with **auto-merge NOT armed** and posts screenshots (desktop +
mobile, light + dark) for Bruno's explicit approval; only after his OK does V0 merge and do the
remaining bundles inherit the standing auto-merge authorization. Two direction misses (v1's
terminal aesthetic "read as AI-made"; v2 never finished) is the reason this gate exists — it is
not optional this time either.

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
| **V0** | Foundation flip: palette tokens (paper/ink/green/gold, light+dark), Figtree + Instrument Serif Italic wired in, blob-gradient utility classes, pill/rounded shape system, across ALL existing components — no structural change · **visual checkpoint: NO auto-merge, Bruno approves screenshots** | — | [ ] pending | | |
| **V1** | Hero: nav restyle, blob-card hero visual (replaces the "Cost Reduction / Save"-style floating stat cards), "Start today" badge, trust line | V0 approved | [ ] pending | | |
| **V2** | Process + Benefits: Subscribe/Request/Ship as three blob-gradient cards; membership-benefits grid as 5–6 blob-tile icons (replaces `Benefits.tsx`'s current treatment) | V0 | [ ] pending | | |
| **V3** | Services ("what we build") as a scope pill-cloud + headline, mirroring Designjoy's "Apps, websites, logos & more" block | V0 | [ ] pending | | |
| **V4** | Clients (`RecentWork.tsx`) — eDairyCorp / Meshio / Vivi, reusing the APPROVED honesty framing from `redesign-storytelling.md` §1 (client vs. ours, Vivi marked pre-launch), presented as Designjoy-style badge cards instead of ledger rows | V0, content in §5 below (already resolved) | [ ] pending | | |
| **V5** | Pricing: glassmorphic dark card over its own blob, two-column feature list, dashed-border trust boxes ("Pause anytime," "Fast delivery"), guarantee cluster (gated on D3) | V0, decision D3 | [ ] pending | | |
| **V6** | FAQ + final CTA — FAQ deepened per v1 §6.R6's question list (still valid, register-only, not visual-system-specific), final CTA becomes the black band close | V0 | [ ] pending | | |
| **V7** | The people — real photos (gated on D2) | decision D2 | [ ] blocked on content | | |
| **V8** | Case studies (gated on D1) | decision D1 | [ ] blocked on content | | |

## §3 — Per-bundle launch commands

### §3.V0
```
/autonomous-task Redesign v3 Bundle V0 — Monthly Club foundation flip. Read docs/HANDOFF-redesign-v3.md §1 (the full visual system) and v1's docs/HANDOFF-redesign.md §4 (voice + banned-word gate, still binding — content register doesn't change). Implement the token flip across the whole site with NO structural/section changes: globals.css palette swap to paper/ink/green/gold (+ dark equivalents, both prefers-color-scheme and data-theme paths, contrast-checked WCAG AA); Figtree via next/font/google wired into every heading AND body text (replacing Outfit); Instrument Serif Italic loaded and available as a `.accent` utility for the one-word-per-headline emphasis technique; retire Fraunces and Space Mono as system voices entirely; blob-gradient CSS utility classes (radial/conic layered gradients, no images, at least 4 distinct color combinations so later bundles don't reuse one gradient everywhere); pill-shaped button utility; card radius bump to 16-22px; a glassmorphic-card utility (backdrop-filter blur + translucent dark bg) for V5's future pricing card. Check the theme-init script/OG image colors don't hardcode the old palette. Gates: lint + tsc + build + SSR check + banned-word grep + perf delta. OPEN THE PR WITH --no-merge AND post desktop+mobile, light+dark screenshots for Bruno's visual approval before any merge. --bundle-id 201 --plan-slug redesign-v3 --no-merge
```
*(V1–V8 briefs get written after V0 is APPROVED, mirroring v2's own discipline — the approved V0
system is their spec anchor. Do not launch anything beyond V0 without Bruno's visual OK. Each
later brief should point its builder at the matching section of the approved pitch artifact for
the literal layout to mirror, plus the real `offer.ts` copy — never lorem, never invented content.)*

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

## §6 — Decisions Bruno owns (carried forward, unchanged from v1/v2)

| ID | Decision | Blocks | Status |
|---|---|---|---|
| D1 | 2–3 real case studies | V8 | open |
| D2 | Which engineers appear, with photos | V7 | open |
| D3 | The guarantee | V5 | open |
| D4 | Publishable aggregate stats | proof content, any section | open |
| D5 | Real capacity number in `offer.ts` | badge content, if used | open |
| D6 | Client logos/identities with permission | V4 | **RESOLVED** 2026-07-28 — see §5 |
