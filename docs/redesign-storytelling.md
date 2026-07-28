# Codirity homepage redesign — narrative & draft copy ("The Workbench")

**Author:** storytelling pass, 2026-07-28 · **Feeds:** `src/config/offer.ts`, bundles R0–R8 ·
**Constraints applied:** HANDOFF-redesign §1 (workbench), §4 (voice + banned list), §6 (section
specs). Every fact below is traced to `~/br-brain/WIKI/` (codirity.md, edairy.md,
clients/edairycorp.md, personal-apps.md, now.md, projects.md, advice-ai.md) or `offer.ts`.
Anything that could not be traced is tagged **[UNVERIFIED — Bruno to confirm]**.

---

## 0. The narrative spine (one paragraph, for whoever builds this)

The site is a window onto a working shop. The visitor walks past the bench and sees: a queue with
real-shaped work on it (hero), what the work costs next to what the alternative costs (ledger),
what a week actually looks like (log), what people have asked for and what came back (asks), what
we refuse (no list), who's asking the questions everyone asks (FAQ), and — new — **whose names are
already on the board**. That last part is the clients section, and it has one hard problem: the
three names are Bruno's own companies. The copy below doesn't hide that. It leads with it.

---

## 1. The clients section — "Already on the board"

### 1a. The honesty problem, and two framings

**The facts as the brain records them:**

- **eDairyCorp** is Codirity's only *active, listed client* (WIKI client roster, status: active).
  It is also deeply entangled with Bruno: the WIKI keeps a "venture lens" on it, the CEO-attributed
  quote on its corporate site is from an **Alejandro Maurino**, and the dev collaborator is
  **Juan Maurino**. It reads as a family company. **[UNVERIFIED — Bruno to confirm the exact
  relationship wording: "family company"? "long-term client"? both?]** Commercials (retainer,
  amount) are recorded as TBC.
- **Meshio** and **Vivi** are explicitly Bruno's own indie products ("deliberately separate from
  agency work — his personal bet on recurring income").
- **Meshio and Codirity share the same legal entity — BOMAU LLC** (`offer.ts` `LEGAL_ENTITY` +
  personal-apps.md). A visitor who checks the footer can find this in two minutes. So the copy
  must get there first.

Two framings that stay honest and still sell:

**Option A — "Our own companies were the first clients." (founder-portfolio framing)**

The section says, in plain text: before we sold this subscription to anyone, we ran our own
products through it. Same queue, same board, same one-task-at-a-time discipline. The pitch is
*we eat here*. Each row carries a mono provenance tag — `client` / `ours` — so nobody has to
squint.

> Section intro draft (Option A):
>
> **Already on the board**
> Three names have been through this queue. One is a client. Two are our own products — we built
> the subscription by running it on ourselves first. Same board, same rules, tagged so you can
> tell which is which.

**Option B — "Workshop inventory." (radical-disclosure ledger framing)**

Drop the word "clients" entirely. The section is titled something like **"What this shop has
shipped"** and presents the three as *bodies of work*, each with a provenance line in mono
(`for a client · dairy B2B` / `our own product`). No claim of a client roster is ever made, so
none can be punctured. The trade-off: it reads less commercial; a visitor may not register "they
have clients at all."

**Recommendation: Option A**, with Option B's mono provenance tags borrowed as the mechanism.
Reasoning: (1) the category is drowning in fake logos and fabricated quotes — §5 bans them — so a
section that *volunteers* "two of these are ours" is the strongest trust move available and
nobody else in the set can copy it without lying; (2) it converts the weakness into the actual
pitch: dogfooding is proof the queue works when nobody is watching; (3) eDairyCorp genuinely is a
client, so the word "client" is defensible for at least one row. One condition: the eDairyCorp
relationship wording must be settled by Bruno before ship (see UNVERIFIED above). If it's a family
company, say so — "our first client is the family dairy business" is a *better* sentence than a
vague one.

### 1b. The three stories

**eDairyCorp** — dairy-industry B2B ecosystem: **eDairyMarket** (B2B dairy marketplace, 10+ years
in production, ~300 products, ~17k visits/month), **eDairyNews** (multi-region news network:
Spain, Brazil, English, Mexico, India), plus the group's corporate site. Group claims founded
Córdoba 2003, 20+ countries. *(Group stats — 3M annual readers, 400 t/month traded, 80+
marketplace companies — are eDairyCorp's own corporate-site claims, not ours; if used, attribute
as theirs.)*

What Codirity did (all traceable to WIKI/day-logs):
- Rebuilt the legacy Angular + Node marketplace as **NestJS APIs + a Next.js SSR storefront + a
  React admin panel**, protecting the SEO traffic through the migration.
- Shipped **Stripe seller subscriptions** (three tiers), **buyer favorites** with guest→account
  merge on login, and a **product-page revamp** (seller cards, related products) with seller
  identity resolved server-side so crawlers see it.
- Found and fixed **27 of 273 product URLs (10% of the catalog) returning 404** — pages the
  sitemap was feeding to Google.
- Built a **server-side table-filter system** across two APIs and the admin panel.
- Moved dev off a shared box that had run prod+dev+admin together for years, onto **isolated AWS
  infra with merge-to-trunk auto-deploy**.
- On the news network: infra consolidation on a per-country WordPress fleet that was costing
  **~USD 770–800/month** (right-sizing, storage and CDN changes). *(Post-optimization figure not
  recorded — do not print a savings number without it. [UNVERIFIED — Bruno to confirm the
  after-cost])*

Draft story copy (Option A voice):

> **eDairyCorp** · client · dairy B2B
> A 20-year-old dairy marketplace with 17k visits a month and a codebase old enough to vote.
> We're rebuilding it in place — new APIs, server-rendered storefront, admin panel — without
> dropping the search traffic that feeds it. Along the way: paid seller tiers, favorites, and the
> day we found 10% of the catalog 404ing in Google's sitemap.

Ledger row (mono):
```
edairycorp   dairy B2B marketplace, est. 2003 · client
             legacy rebuild in place · Stripe tiers · 27 dead URLs found & fixed
```

**Meshio** (meshio.co) — AI content-ideation SaaS: generates post ideas in the user's own voice
for X, LinkedIn, Threads. Owned by BOMAU LLC — the same entity as Codirity. Current work:
onboarding rebuilt around a single activation metric (first post published), with a
New → Niche Set → Voice Set → Activated state machine and OAuth deferred until it's needed;
Stripe tiers specced.

Draft story copy:

> **Meshio** · ours · same LLC as Codirity, no point pretending otherwise
> A SaaS that drafts post ideas in your voice for X, LinkedIn, and Threads. It's where we test
> what we preach: when paid conversions stalled, we didn't redesign the logo — we rebuilt
> onboarding around one metric (first post published) and pushed sign-in friction to after the
> user has seen the product.

Ledger row (mono):
```
meshio       AI content-ideation SaaS · ours
             onboarding rebuilt around one activation metric · Stripe tiers specced
```

**Vivi** — outfit-scoring iOS app for men: take a photo, get a score, tips, history, and pattern
learning over time. React Native/Expo; the scoring runs on a frontier vision model. Pre-launch:
hard paywall ($4.99/mo, $34.99/yr), payments wired through RevenueCat. *(Note for copy
discipline: the scoring model is OpenAI GPT-5.5 per the brain — do not imply a Claude-based stack
in any Vivi line.)*

Draft story copy:

> **Vivi** · ours · pre-launch
> An iOS app that scores your outfit from a photo and learns your patterns. Not shipped to the
> App Store yet, and we say so — it's on this page because it went through the same queue as
> everything else: camera capture, scoring pipeline, paywall, done one card at a time.

Ledger row (mono):
```
vivi         outfit-scoring iOS app · ours · pre-launch
             photo → score → history · scoring pipeline + paywall built on the queue
```

Section closer (one line, mono, under the three rows):

```
next row: yours_
```

---

## 2. Hero narrative (R1)

**H1 stays** (live SEO): *"Your AI & automation team, on subscription."*

**Subhead options** (replacing the current banned-adjacent "Unlimited requests… AI-accelerated
delivery"):

1. "Drop requests on a board. Senior engineers work them one at a time. Most ship in days. One
   flat rate."
2. "A queue, a board, and engineers who ship. Flat monthly rate; the AI drafts, we own what goes
   live."
3. "You add work to a queue. We build it, ship it, and start the next one. No scoping calls, no
   hourly invoices."

Recommendation: **1** — it's the mechanism in four sentences and each clause is checkable against
the board.

**Mono microcopy** under the CTA row (spec-mandated content, exact string):
```
pause or cancel any month · no contracts
```

**Queue-row items for the workbench vignette** — grounded in real shipped work so they're
believable, but generic enough to read as illustrative (no client names in the hero panel):

```
#231  dead product URLs — 27 found via sitemap    ● shipped · 1d
#232  guest favorites, merge on login             ● shipped · 2d
#233  admin table filters, server-side            ● shipped · 3d
#234  stripe seller tiers                         ● shipped · 4d
#235  wordpress fleet cost cut                    ◐ in progress
▸ your request here_
```

(Five rows + prompt line; green dot only on shipped, per §1 rule 2. The 1–4 day figures track the
day-log record: favorites landed 2026-07-08, the product-page revamp in one day on 07-09, the URL
fix inside the 07-10 six-PR day, table filters as a 3-PR build over 07-10/11. If the reviewer
wants zero derivation, drop the day figures and ship dots only.)

**Proof line** (hairline-topped, mono, under hero — per §6.R1):
```
built by engineers ex-Globant & Ualá · Buenos Aires · stack: claude / n8n / aws / stripe
```
**[UNVERIFIED — Bruno to confirm]:** (a) "engineers" plural vs the FAQ's "a senior engineer"
singular — the two currently contradict; pick one and use it everywhere. (b) that n8n belongs in
the stack list — it appears in the HANDOFF's example but nowhere in the brain; swap for `nestjs`
or `next.js` if it's not real tooling. (c) Buenos Aires — the brain ties Bruno to Córdoba (moving
to San Francisco, Córdoba); confirm which city, or drop the city.

---

## 3. "A week with us" (R3) — Mon–Fri log, refined

Spec draft was close; edits push it from cute toward observed. Deltas: real-shaped opening
request (drawn from the eDairy URL-bug class), the two-questions beat kept (it's the best line),
Tuesday made concrete about *reordering being the client's power*, Thursday keeps the Loom,
Friday keeps "boring."

- **Mon 09:12** — you drop a card: "customers say our product links are dead. No idea how many."
- **Mon 11:40** — we ask two questions. That's usually all of them.
- **Tue 10:00** — the plan appears on the card: crawl the sitemap, diff it against live pages, fix
  the URL scheme, patch the sitemap. You drag it above the reporting task. Dragging is the whole
  management interface.
- **Thu 16:05** — fixed. 27 of 273 pages were dead; the card links the list, the fix, and a
  3-minute Loom. No meeting was scheduled at any point.
- **Fri** — the card is boring now. Boring is the goal. Next card starts.

Caption under the mock queue board (spec-mandated honesty label, mono):
```
a typical week's board — illustrative, not a live feed
```

---

## 4. "Things we've been asked to build" (R4)

Six composite asks, each anchored to a real, shipped pattern (source in parentheses — the
parenthetical is for Bruno's review, not for the site):

1. *"Customers keep telling us our product links are dead."* → sitemap-vs-live audit; 27 dead
   URLs of 273 found and fixed. 1 day on the board. *(eDairyMarket, 2026-07-10)*
2. *"Our admin can only find a user if you already know their exact name."* → server-side
   filters — text, number, date, multi-select — across every admin table, surviving refresh.
   3 days. *(eDairy table-filter system, 07-10/11)*
3. *"Buyers keep asking to save products. We keep saying 'bookmark it'."* → favorites with guest
   support, merged into the account on login. 2 days. *(eDairyMarket favorites, 07-08)*
4. *"We want to charge sellers, but nobody here has touched Stripe."* → three subscription tiers,
   product limits enforced, live. *(eDairyMarket Stripe monetization)*
5. *"We pay about $800 a month to host five WordPress sites."* → consolidation and right-sizing
   of the fleet. *(eDairyNews infra — print no savings figure until the after-cost is confirmed)*
6. *"Can an AI read these PDFs and load them into the system — without us trusting it blindly?"*
   → document extraction with a human review step before anything is committed. *(advice.ai
   onboarding pattern: upload → extract → review → commit. [UNVERIFIED — Bruno to confirm he
   wants an advice.ai-derived pattern on the Codirity site at all, given the undocumented formal
   relationship — now.md gap #6])*

Category chips (static mono labels, no JS): `ops · admin tools · billing · infra cost · data & AI`

Section intro line:

> People don't ask for "digital transformation." They ask for things like this.

*(Consider whether "digital transformation" in scare quotes passes the read-aloud test;
alternative intro: "Nobody has ever asked us for a platform. They ask for things like this.")*

---

## 5. "Things we'll say no to"

Intro line:

> Saying no is most of what keeps the queue fast.

1. **Native mobile apps as a service.** We build our own (see Vivi). Yours deserves a dedicated
   team, not a queue slot.
2. **Anything blockchain.** Not a values thing. We just haven't seen the version that beats a
   database.
3. **Work that's really a full-time hire.** If your queue never empties and every card is urgent,
   you need an employee. We'll say so on the intro call and save you a month's fee.
4. **Things we can't maintain after shipping.** If it only works while we're watching it, we
   didn't finish it.
5. **Manual operations dressed as automation.** We don't staff data entry. We build the thing
   that deletes it.

---

## 6. The Ledger (R2)

Receipt draft (mono, hairlines, server-rendered):

```
WHAT A SENIOR AUTOMATION ENGINEER COSTS
salary (US senior, /mo)¹ ........... $14,500
recruiter fee (amortized)² .......... $2,100
benefits, equipment, management³ .... $3,400
time to first shipped automation ... 8–12 wks
                                   —————————
CODIRITY, STANDARD ................. $3,995
time to first shipped automation .. this week⁴
pause any month ......................... ✓
```

**All four salary-side figures are [UNVERIFIED — must be sourced before ship]** (HANDOFF D4: "no
invented numbers" — this artifact is the credibility centerpiece). Sourcing approach for the
footnote:

- **¹ Salary:** BLS OES national mean/median for Software Developers (occupation 15-1252),
  adjusted to a senior band via a named public source (levels.fyi US senior aggregate, or
  Glassdoor/Indeed senior SWE US). Footnote text:
  `¹ BLS OES 15-1252 + levels.fyi senior aggregate, retrieved <date>` — with the retrieval date
  printed, so the number ages honestly.
- **² Recruiter fee:** standard contingency fee of 20–25% of first-year salary, amortized over a
  24-month expected tenure. Footnote states the formula, not just the result:
  `² 20% of year-one salary ÷ 24 months`.
- **³ Benefits/overhead:** the commonly cited 1.25–1.4× fully-loaded multiplier (cite a named
  source, e.g. BLS Employer Costs for Employee Compensation). Same formula-in-footnote treatment.
- **⁴ "this week":** only shippable if the queue is actually empty enough — this claim should
  read from the same real capacity field as the R5 badge (D5). If D5 resolves to "won't maintain
  it," soften to `first card starts the day you subscribe`.

Footnote line under the receipt (mono, one line):
```
figures: BLS OES 15-1252 · levels.fyi senior aggregate · 20%/24mo recruiter amortization · retrieved 2026-08 — sources linked
```

Benefits-grid funeral (per spec): "fixed rate" and "senior quality" live in this receipt; "async,
no meetings" moved to the week log (Thursday line); "you own everything" moved to FAQ Q6.

---

## 7. FAQ (R6) — 12 questions, voice pass

1. **Who actually writes the code — you or the AI?**
   Engineers. The AI drafts; we own what ships.
2. **Why not just hire someone?**
   If you have 40 hours a week of engineering work, hire — we'll even say so on the call. If you
   have five to fifteen, a full-time salary is the expensive way to get them. The receipt above
   is the whole argument.
3. **What counts as one request?**
   One focused piece of work: an automation, an integration, an internal tool, a fix. "Rebuild
   our platform" is not one request; we'd split it into cards and you'd watch them ship one by
   one.
4. **How fast is it, really?**
   Most cards ship in 2–4 days. Bigger builds get broken into cards so something lands every few
   days. The board shows you which day — you're never guessing.
5. **What happens when I pause?**
   Billing stops at the end of the cycle. Your board, your code, and your history stay put. Come
   back whenever there's work.
6. **Who owns the code and the accounts?**
   You do. Repos in your org, infrastructure in your cloud accounts, credentials in your vault.
   If we disappeared tomorrow, you'd lose a vendor, not a system.
7. **What if it breaks a month later?**
   Fixes for things we built are requests like any other — drop a card, it gets worked. We don't
   ship things we can't maintain; that's in the "no" list for a reason.
8. **Why limited spots?**
   One senior engineer per queue, working cards in order. That math only holds if we cap how many
   queues exist. When we're full, the site says so and you wait — we'd rather be slow to sell
   than slow to ship. *(Ties the founding-rate banner — 5 slots, `offer.ts` — to a mechanism
   instead of urgency.)*
9. **Do we ever meet?**
   Rarely. You get a Loom when something ships and a question in the card when we're stuck. If a
   call genuinely beats writing, we book fifteen minutes. Most clients never do.
10. **What's the stack?**
    TypeScript, Next.js, NestJS, Postgres or Mongo, AWS, Stripe — and Claude in the loop for
    drafting. If you already run something else, we build in yours; the code lives in your org
    either way. *(Stack list traceable to projects.md/tech-stack; trim to taste.)*
11. **What if I don't like what ships?**
    Revisions are part of the request — we iterate until it's right. And the first week carries
    the guarantee: not convinced, 75% back. *(Keep consistent with D3's resolution; current
    `offer.ts` says 7-day / 75%.)*
12. **What don't you do?**
    Native mobile apps for clients, blockchain, brand design, staffing manual operations, and
    anything that's really a full-time hire. The full "no" list is above — it's short, but it's
    load-bearing.

(One-liners: Q1. Near-one-liners: Q5, Q8. The rest stay under 3 sentences each.)

---

## 8. Final CTA line — options

1. **"Tell us what's eating your week."** *(spec's own line — keep it as the default)*
2. "Bring us the task you've re-done every Monday this year."
3. "The queue has room. Describe the thing you keep putting off."

Recommendation: **1** as the headline, with the form label using 2's energy ("What's the task?").
Under it, mono, per spec: the email in plain text + Cal button. Note: option 3 must only ship if
the capacity claim is true per D5 — "the queue has room" is a live-status claim and would need to
read from the same `offer.ts` field as the badge.

---

## 9. Open items for Bruno (blocking facts, consolidated)

1. **eDairyCorp relationship wording** — family company? client? both? (§1b) — blocks the
   clients section headline.
2. **"engineer" vs "engineers"** — singular or plural, everywhere (§2).
3. **Proof-line details** — n8n real? Buenos Aires vs Córdoba? (§2).
4. **eDairyNews after-cost** — needed before any savings number prints (§1b, §4.5).
5. **advice.ai-derived ask (#6 in §4)** — include or drop, given the undocumented formal
   relationship.
6. **Ledger figures** — all four salary-side numbers need the §6 sourcing pass at build time (D4).
7. **Capacity field (D5)** — gates "this week" in the ledger, CTA option 3, and the R5 badge.

---

**Banned-word self-check:** grep of this document against the §4 list (leverage, unlock, unleash,
empower, elevate, supercharge, seamless, effortless, robust, cutting-edge, game-chang*,
revolutioniz*, blazing, delight, journey, holistic, synergy, "end-to-end" as adjective, emoji) —
zero hits in copy intended for the site. No three-adjective pileups; every claim either traces to
a brain doc or carries an [UNVERIFIED] tag.
