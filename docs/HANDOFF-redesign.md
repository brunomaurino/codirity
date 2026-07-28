# HANDOFF — Codirity Redesign: "The Workbench" (execution plan)

**Date:** 2026-07-28 · **Author:** Fable 5 session with Bruno · **Repo:** `brunomaurino/codirity`
**Basis:** competitive teardown of 12 productized-subscription sites (2026-07-28), the shipped
analytics funnel (PR #8, 12 events live), `docs/design-system.md`, and the subscription rebuild
(Bundles 0→F, complete).

---

## §0 — How to execute this plan

Same machinery as `HANDOFF-subscription-rebuild.md`: run bundles via `/autonomous-bundle-loop
docs/HANDOFF-redesign.md`, or individual bundles via the §3 launch commands. One bundle = one PR.
The §2 table is the durable status surface; mark bundles complete there. All ground rules from the
subscription rebuild (§2 of that doc) remain in force — offer.ts as source of truth, server
components by default, gate list `npm run lint` + `npx tsc --noEmit` + `npm run build`,
script-stripped SSR verification, maurino72 gh identity — **plus the new ones in §4 (voice) and §5
(anti-slop gate), which reviewers must enforce.**

**Merge policy:** same as the rebuild — Bruno authorized unattended auto-merge on green gates
(2026-07-24, ground-rule 9). `main` deploys straight to prod.

**Measurement:** the 12-event funnel is live as of `cbb5a22`. Where possible, let each redesigned
section run against its baseline metric (§8). Do not ship R1–R4 in the same week; stagger so the
funnel can attribute.

---

## §1 — The concept: a workbench, not a brochure

Every site in the competitive set says a version of the same sentence — *unlimited requests, flat
rate, pause anytime* — over the same furniture: centered hero, logo marquee, 3-step cards,
6-benefit grid, testimonial carousel. The category has a template, and the template is now
invisible. Following it means looking like the 12th screenshot in a folder.

Codirity's actual differentiators are things the template can't hold: the work is real engineering,
the people have verifiable pedigree (Globant, Ualá), and the delivery mechanism — a queue you drop
requests into and things come back working — is genuinely interesting to watch.

**So the concept is: the site behaves like a window onto the operation, not a brochure about it.**
Every section is an artifact of real work — a board, a log, a ledger, a week, the people — designed
with the care of a good internal tool. The visitor should leave with the feeling of having *seen
the workshop*, not of having read a pitch.

Three rules fall out of this:

1. **Evidence over adjectives.** If a claim can be shown as an artifact (a queue row, a receipt
   line, a diff, a date), show the artifact and cut the adjective. Where we have no evidence yet
   (case studies, faces), the section waits for content — it does not fake it.
2. **Green means live.** The brand green (`#32CD32`) stops being decoration. It appears ONLY on
   things that are true right now or actionable right now: status dots, shipped checkmarks, CTAs,
   the active line in the terminal. Never as a background wash, never as decorative gradient.
   Scarcity of the accent is what makes it read as signal.
3. **Two voices of type.** Outfit speaks to humans (headlines, prose). Space Mono speaks as the
   system (statuses, timestamps, labels, IDs, prices-as-data). Today Space Mono is a metrics
   garnish; in the redesign it is the second narrator. When something is an artifact, it is set in
   mono with hairline rules and square corners. When something is an interface for the human
   (buttons, nav), it keeps the rounded brand language. That contrast — soft controls, hard
   artifacts — IS the visual system.

What this is **not**: not a dark-mode brutalist cosplay, not a fake dashboard with invented
numbers, not a terminal theme slapped on everything. The current palette, fonts, and light-first
feel stay. The register changes: fewer shadows, more hairlines; fewer cards, more tables; fewer
claims, more receipts.

---

## §2 — Bundle status surface

| Bundle | Scope | Depends on | Status | PR # | Merge SHA |
|---|---|---|---|---|---|
| **R0** | Voice pass + anti-slop sweep over ALL existing copy + hairline/green-discipline groundwork | — | [x] complete | [#9](https://github.com/brunomaurino/codirity/pull/9) | `3a318d6` |
| **R1** | Hero rework: workbench vignette (terminal-queue), microcopy, proof line | R0 | [x] complete | [#10](https://github.com/brunomaurino/codirity/pull/10) | `029a772` |
| **RC** | Clients ledger — eDairyCorp, Meshio, Vivi (honest portfolio framing) | R0, storytelling doc | [x] complete | [#11](https://github.com/brunomaurino/codirity/pull/11) | `fddcf15` |
| **R2** | The Ledger (cost comparison as receipt) + kill/fold Benefits grid | R0 | [ ] pending | | |
| **R3** | "A week with us" (process rework) + mock queue board | R0 | [ ] pending | | |
| **R4** | "Things we've been asked to build" (services rework) + "Things we'll say no to" | R0 | [ ] pending | | |
| **R5** | Pricing as rate card + payback calculator + guarantee cluster | R2, decisions D3/D5 | [ ] pending | | |
| **R6** | FAQ deepen (~12 Qs, voice-rewritten) + final CTA close | R0 | [ ] pending | | |
| **R7** | "The people" — real engineers section | decision D2 | [ ] blocked on content | | |
| **R8** | Case studies with architecture sketches | decision D1 | [ ] blocked on content | | |

R1–R4 and R6 are independent after R0 and can interleave. R7/R8 ship whenever content exists.

## §3 — Per-bundle launch commands

### §3.R0
```
/autonomous-task Redesign Bundle R0 — voice pass + anti-slop sweep. Read docs/HANDOFF-redesign.md §1 (concept), §4 (voice rules incl. banned-word list), §5 (anti-slop gate), §6.R0. Rewrite ALL existing user-facing copy in src/config/offer.ts and section components to the §4 voice (no new sections, no layout change yet); replace shadow-heavy card styling with the hairline/green-discipline utilities described in §6.R0; every copy string must pass the banned-word grep and the read-aloud test. Gates: lint + tsc + build + script-stripped SSR copy check + §5 checklist in the PR body.
```
### §3.R1
```
/autonomous-task Redesign Bundle R1 — hero workbench vignette. Read docs/HANDOFF-redesign.md §6.R1. Replace the floating stat cards with the terminal-queue vignette (pure CSS/SSR, no libs), promote "Pause or cancel anytime" to hero microcopy, move the Globant/Ualá line into the proof line under the hero. Keep H1 text and both CTAs (instrumented). Gates: standard + perf delta vs 200.8KB baseline reported in PR + §5 checklist.
```
### §3.RC
```
/autonomous-task Redesign Bundle RC — clients ledger. Read docs/HANDOFF-redesign.md §6.RC and the approved storytelling doc (framing + one-liners for eDairyCorp, Meshio, Vivi). Build the clients section as ledger rows (artifact treatment) directly under the proof line; all strings in offer.ts. Do NOT launch until Bruno approves the storytelling framing. Gates: standard + §5 checklist.
```
### §3.R2
```
/autonomous-task Redesign Bundle R2 — the Ledger. Read docs/HANDOFF-redesign.md §6.R2. Build the cost-comparison section as a receipt/ledger artifact (server-rendered, zero JS), fold the Benefits grid's surviving content into it and delete the Benefits section. Gates: standard + §5 checklist.
```
### §3.R3
```
/autonomous-task Redesign Bundle R3 — a week with us. Read docs/HANDOFF-redesign.md §6.R3. Rework Process into the Mon–Fri log timeline and add the mock queue board (static, labeled illustrative). Gates: standard + §5 checklist.
```
### §3.R4
```
/autonomous-task Redesign Bundle R4 — things we've been asked to build. Read docs/HANDOFF-redesign.md §6.R4. Rework Services into verbatim-ask quotes mapped to what shipped, elevate the not-included list as "Things we'll say no to". All strings in offer.ts. Gates: standard + §5 checklist.
```
### §3.R5
```
/autonomous-task Redesign Bundle R5 — rate card + payback calculator. Read docs/HANDOFF-redesign.md §6.R5 and decisions D3/D5 (must be resolved). Restyle pricing as rate card, add the hours→payback calculator (one leaf client component, no deps, new analytics event calculator_used added to the AnalyticsEvent union), add the guarantee cluster and honest capacity badge from offer.ts. Gates: standard + perf delta + §5 checklist.
```
### §3.R6
```
/autonomous-task Redesign Bundle R6 — FAQ deepen + close. Read docs/HANDOFF-redesign.md §6.R6. Extend FAQ to ~12 questions in the §4 voice, update FAQPage JSON-LD, rework the final CTA per spec. Gates: standard + §5 checklist.
```
*(R7/R8 briefs get written when their content exists — do not launch on placeholders.)*

---

## §4 — Voice: how Codirity writes

The copy is a founder-engineer talking to another operator. Short sentences. Concrete nouns.
Numbers where we have them, silence where we don't. It is allowed to be dry and occasionally
funny; it is never excited.

**Banned words/patterns (enforced by grep in review — the AI-slop list):** leverage, unlock,
unleash, empower, elevate, supercharge, seamless(ly), effortless(ly), robust, cutting-edge,
game-chang*, revolutioniz*, "take your X to the next level", "in today's fast-paced world",
blazing, delight*, "we're passionate", journey, holistic, synergy, "end-to-end" (as adjective),
🚀 and all decorative emoji in site copy. Also banned: three-adjective pileups ("fast, reliable,
and scalable") and any sentence that could appear unchanged on a competitor's site.

**Before → after examples (the register):**

- ~~"We leverage cutting-edge AI to deliver seamless automation solutions."~~ →
  "The AI writes the first draft. Our engineers own what ships."
- ~~"Unlock your team's full potential with our robust processes."~~ →
  "Your ops team stops doing the same thing twice."
- ~~"Fast turnaround times you can count on."~~ →
  "Most requests ship in 2–4 days. The board shows you which day."
- ~~"We'd love to hear about your project!"~~ →
  "Tell us what's eating your week. We'll tell you if a bot can do it."

**Honesty is a feature.** "Things we'll say no to" is a designed section, not a footnote. If a
stat can't be defended, it doesn't ship (D4). If a testimonial doesn't exist, there is no
testimonial section — the category is drowning in fabricated-looking quotes and visitors can smell
them.

## §5 — The anti-slop gate (added to every bundle's review)

Every redesign PR body must include this checklist, checked honestly; the review battery is
instructed to verify it:

- [ ] Banned-word grep over the diff returns zero hits.
- [ ] Read-aloud test: a reviewer reads the new copy out loud; anything that sounds like a
      LinkedIn post gets rewritten before merge.
- [ ] No logo marquees, no auto-rotating carousels, no purple/blue gradient washes, no
      glassmorphism, no emoji bullets, no stock illustrations, no fake avatars, no invented
      stats, no fake urgency (capacity badge only from real `offer.ts` data).
- [ ] Green appears only on live/actionable elements (§1 rule 2).
- [ ] Artifacts are mono + hairline + square; controls keep the rounded brand language (§1 rule 3).
- [ ] Perf: first-party JS gz delta vs the 200.8 KB baseline reported; no new runtime deps
      without explicit justification in the PR.
- [ ] Script-stripped SSR check passes for all new copy.

---

## §6 — Section specifications

### R0 — Voice pass + groundwork (ships first, touches no layout)

Rewrite every user-facing string (offer.ts + components) into the §4 voice. Add the two utility
patterns the later bundles need: a `hairline` border treatment (1px, `var(--border)`, square
corners) for artifacts, and the green-discipline sweep (remove decorative green washes; green
stays on CTAs, status dots, checkmarks). This bundle is cheap, de-risks everything after it, and
immediately changes how the current site reads without moving a single section.

### R1 — Hero: the workbench vignette

Left: H1 (unchanged text — it's live SEO), new subhead in voice, the two existing CTAs, and
`pause or cancel anytime` as a mono annotation under the CTA row (the category's de-facto second
headline; Designjoy leads with it).

Right, replacing the three floating stat cards: **the workbench vignette** — a hairline-bordered
panel, mono type, styled like a cross between a terminal and a job board. Four to five rows of
realistic work items, one of them "typing" via CSS steps animation:

```
#143  slack→notion invoice bot        ● shipped · 2d
#144  legacy CSV importer rewrite     ● shipped · 3d
#145  lead-routing agent              ◐ in progress
#146  weekly KPI digest email         ○ queued
▸ your request here_
```

Green dot = shipped (the only green in the panel). Pure CSS/SSR — no JS, no library. The rows are
illustrative and read as such (they are believable work items, not client claims). On mobile the
panel stacks below the copy at reduced height. This is the single image that says "queue,
engineers, things actually ship" — the three things the whole category asserts in prose.

Under the hero, one slim **proof line** (not a marquee): hairline-topped row, mono:
`built by engineers ex-Globant & Ualá · Buenos Aires · stack: claude / n8n / aws / stripe`.
Tool names as text, not logo salad — logos join only if/when client logos do (D6).

### RC — The clients ledger (added 2026-07-28, Bruno's call)

A clients section with **eDairyCorp, Meshio, and Vivi**, placed directly under the proof line.
Treatment: ledger rows (artifact — mono, hairlines, status dots), NOT a logo grid — three logos
would look thin; three one-line stories don't:

```
eDairyCorp — b2b dairy marketplace      ● in production
Meshio     — <one-liner>                ● in production
Vivi       — <one-liner>                ◐ building
```

**The honesty problem is the design problem.** These are Bruno's own ventures, not arm's-length
clients (except eDairyCorp — a client, per Bruno 2026-07-28). **FRAMING APPROVED by Bruno
2026-07-28: Option A** from `docs/redesign-storytelling.md` §1 — "Already on the board"; one is a
client, two are our own products, we built the subscription by running it on ourselves first;
mono provenance tags `client` / `ours` per row; closer row `next row: yours_`. Copy and the three
one-liners come from the storytelling doc (facts resolved, including: Vivi is `pre-launch` and
says so). Status dots must reflect reality — three identical "live" dots that aren't true are
banned by §5. RC is CLEAR TO LAUNCH.

### R2 — The Ledger (cost comparison) + Benefits funeral

The category does this as a checkmark table (Poket Dev, Flowjot, Automatio). We do it as a
**receipt** — the artifact a founder actually looks at:

```
WHAT A SENIOR AUTOMATION ENGINEER COSTS
salary (US senior, /mo) ............ $14,500
recruiter fee (amortized) ........... $2,100
benefits, equipment, management ..... $3,400
time to first shipped bot ......... 8–12 wks
                                  —————————
CODIRITY, STANDARD ................. $3,995
time to first shipped bot ........ this week
pause any month ......................... ✓
```

Server-rendered, mono, hairlines, zero JS. Figures must be sourced (BLS/levels.fyi-style ranges,
linked in a footnote) — this artifact is the credibility centerpiece and cannot contain invented
numbers. The Benefits grid dies in this bundle: "fixed rate" and "senior quality" live here;
"async, no meetings" and "you own everything" move to the week log (R3) and FAQ (R6). Six-card
benefit grids are the most template-worn furniture in the category; we simply don't have one.

### R3 — A week with us (process) + the board

Replace the abstract 3-step process with a **Mon–Fri log** — the diary of a typical request,
specific enough to feel observed:

- **Mon 09:12** — you drop "our invoices live in Slack threads and I hate it" on the board.
- **Mon 11:40** — we ask two questions. That's usually all of them.
- **Tue** — you see the plan on the card: parser + Notion DB + a weekly digest. You reorder the
  queue; this jumps the line.
- **Thu 16:05** — bot goes live behind a feature flag. You get a Loom, not a meeting.
- **Fri** — it's boring now. Boring is the goal. Next card starts.

Below it, the **mock queue board**: the same board aesthetic as the hero vignette but expanded —
3–4 cards with states and ETAs, hairline kanban, explicitly captioned "a typical week's board."
GetAutomated proved this visual carries "unlimited queue" better than any paragraph; ours is
honest about being illustrative instead of pretending to be live (a real shipped-feed is a future
project, noted in §9).

### R4 — Things we've been asked to build (services)

Replace the service-category prose with **verbatim asks** — the way clients actually talk,
quoted, mapped to what shipped:

- *"Can Slack stop being our database?"* → invoice parser + searchable archive, 3 days.
- *"Every Monday I lose 3 hours making the same report."* → automated KPI digest, 2 days.
- *"Our CRM and our billing tool don't talk."* → two-way sync with conflict rules, 5 days.
- *"Can an AI answer the first support email?"* → triage agent with human handoff, 4 days.

(Asks are composites of real request patterns until R8's case studies land — they must stay
plausible and modest; no "$2M saved" fantasies.) Category chips (sales / ops / finance / support /
AI agents) in mono as filters-that-aren't-filters (static labels, no JS).

Then **"Things we'll say no to"** — the existing not-included list, promoted to a designed block
with the same hairline treatment: full mobile apps, blockchain, projects that are really a
full-time hire, anything we can't maintain after shipping. Saying no in public is the cheapest
trust signal in the set and nobody uses it above the footnotes.

### R5 — The rate card + payback calculator (gated on D3, D5)

Pricing keeps both tiers + founding banner (all instrumented) but restyles as a **rate card** —
ledger continuity, prices in mono, hairline table instead of shadow cards. Featured tier marked
with a green status dot, not a "MOST POPULAR" ribbon.

**The payback calculator** — the one new client component: a single slider ("hours/week your team
spends on work a bot could do") → mono readout: `≈ 14 h/wk × $65 loaded cost = $3,640/mo burned ·
standard plan pays back in week 5`. Assumptions visible and editable (loaded hourly cost).
Research gap this fills: Poket Dev calculates salary-vs-subscription; nobody calculates
hours→payback, which is the actual SMB automation question. No deps, ~2 KB, new event
`calculator_used` (extend the `AnalyticsEvent` union; fires once per session on first interaction).

Beside the card, the **risk-reversal cluster** (whichever guarantee D3 resolves to) and the
**capacity badge** reading from a real `offer.ts` field Bruno maintains (D5) — e.g.
`● 2 spots open — August`. If Bruno won't maintain it, the badge doesn't ship; a stale badge is
worse than none.

### R6 — FAQ + close

Extend 6 → ~12 questions; the additions are the ones competitors answer and we don't: *Why not
just hire? Who actually writes the code — you or the AI? What does "one request" mean in
practice? Why limited spots? What happens when I pause? Who owns the code and the accounts?
What if it breaks a month later?* Answers in the §4 voice — some one-liners ("**Who writes the
code?** Engineers. The AI drafts; we own what ships."). Update the FAQPage JSON-LD. `faq_opened`
analytics will tell us which objections are real — review the event data before finalizing the
question set if ≥2 weeks of data exists.

Final CTA: one hairline block, one sentence — "Tell us what's eating your week." — form + Cal
button + the email address in plain text (mono). No closing hero, no gradient send-off.

### R7 — The people (blocked on D2)

Real names, real faces, mono personnel-file captions: `maría g. — ex Ualá payments · builds the
things banks are afraid of`. One line each, written by them, edited for voice. Photos: real,
consistent treatment (same background/crop), never AI-generated, never stock. If nobody will
appear, fall back to a founder note in first person (Designjoy's proven pattern) — but faces beat
anonymity decisively in this category, where NO checkout-first competitor shows real engineers.

### R8 — Case studies (blocked on D1)

Two or three, deep: outcome metric as the headline, 3-line story, stack tags, and a **hand-drawn-
feel SVG architecture sketch** (draw.io-to-SVG cleaned up, or hand-traced — visibly human, not
isometric stock). The research's clearest finding on trust: the category's quotes look fabricated;
architecture diagrams can't be faked casually. No client permission for the name → anonymize the
company but keep the diagram real.

---

## §7 — Decisions Bruno owns

| ID | Decision | Blocks | Status |
|---|---|---|---|
| D1 | 2–3 real case studies (metric + stack + sketchable architecture) | R8 | open |
| D2 | Which engineers appear, with photos | R7 | open |
| D3 | The guarantee (7-day preview / first-week partial refund / none) | R5 | open |
| D4 | Which aggregate stats are real enough to publish (else: none ship) | R1 proof line | open |
| D5 | Maintain a real capacity number in `offer.ts` (else: no badge) | R5 | open |
| D6 | Client logos with permission (else: text-only proof line stays) | R1 | **updated 2026-07-28**: Bruno named eDairyCorp, Meshio, Vivi → RC bundle; framing pending storytelling approval |

## §8 — Measurement

Baseline = the funnel live since `cbb5a22` (2026-07-28). Per-section success metrics:
R1 → `hero_cta_click` rate; R2+R5 → `pricing_viewed`→`checkout_click_*` conversion;
R3/R4 → scroll-depth proxy via `pricing_viewed` reach; R6 → `faq_opened` distribution +
`call_booked`; overall → `contact_form_success` + `checkout_click_*` totals. Compare ≥2 weeks
pre/post per bundle. Vercel dashboard covers pageviews/referrers; GA4 carries the events
(Vercel custom events pending the team's plan — see PR #8 notes).

## §9 — Out of scope (recorded, not forgotten)

- **Live runnable demo agent** in the hero (research differentiation #1) — real engineering,
  own project, revisit after R1–R6 ship.
- **Genuinely live shipped-work feed** (vs the illustrative board) — needs plumbing + privacy
  rules; the mock board is the honest interim.
- `@vercel/speed-insights` + perf-budget re-baseline — one conversation, still open from Bundle F.
- Dark-mode-specific art direction pass (the system inherits, but nobody has tuned it).
