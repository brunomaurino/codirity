# Autonomous run — feat/vercel-analytics

Started: 2026-07-28T12:40:02Z

## Task description

> we must add Analytics to vercel to know what our future leads do in our page.

## Execution context

- Probe (a) Workflow: **present**.
- Probe (b)/(c) Agent: **present and callable** (`PROBE-OK`). Running from the
  operator's main conversation — no sub-agent recursion degradation.
- Probe (d) Workflow `args` round-trip: **PASS** (`ARGS-OK-7431` echoed back).
  The review battery is therefore invoked via `scriptPath` + `args` with real
  JSON values (never a /tmp fork).
- Probe (e) `effort` opt: **PASS** → `effortTiers: true`.
- Probe (f) custom `agentType`: **PASS**, resolved as the plugin-scoped
  `autonomous-task:at-reviewer` → `customAgents: true`. No agent-def install
  fallback needed.
- Probe (g) worktree-native: **PASS** → `worktreeNative: true`. The session was
  re-pinned into the worktree with `EnterWorktree` (`name` form), so bare
  relative paths and bare commands are correct for this run.
- Origin-bundle prefix: `B-feat-vercel-analytics` (standalone invocation, no
  `--bundle-id`). This run's identifier is the branch slug `feat-vercel-analytics`.
- Parent-clean canary at Phase 1: parent checkout clean except the untracked
  `docs/HANDOFF-client-onboarding.md`, which predates this run (present in the
  session-start git status) — untracked, not a wrong-tree leak.
- gh identity for this repo is `maurino72` (per `~/agent-system/PROJECTS.md`);
  the shell's active account is `brunoiwp`, so every mutating `gh` call in this
  run scopes its token per-command with `GH_TOKEN=$(gh auth token -u maurino72)`.

### Degraded capability (recorded, not a hard stop)

- **Step 0.6 resume-watchdog cron could not be armed.** `CronCreate` was denied
  by the permission classifier ("Blocked by classifier"). Per the skill this is
  a self-recovery convenience, not a correctness gate, and no hard-stop
  condition (HS-1..HS-6) covers it. The run proceeds without an idle-recovery
  watchdog; if the run wedges on a transient failure it will need a manual nudge.

## Task interpretation (Phase 1.5 — prompt-pinning)

**Concrete deliverable.** Vercel Web Analytics wired into the site: the
`@vercel/analytics` package added to `package.json`, its `<Analytics />`
component mounted in `src/app/layout.tsx`, and the existing conversion-event
helper in `src/lib/analytics.ts` extended so each of the site's lead-intent
events is emitted to Vercel's custom-event API alongside the existing GA4
`gtag` call — plus instrumentation of any lead-conversion surface that is
currently uninstrumented, so "what our future leads do" is actually observable.

**Acceptance test.** A reviewer checks that (1) `npm run build` and
`npm run lint` pass; (2) the production build emits the Vercel insights script
into the rendered page; (3) `track()` fans each event out to BOTH gtag and
Vercel without throwing when either provider is absent (no GA id, ad-blocker,
non-Vercel environment); (4) every documented lead action on the page — pricing
CTA clicks, contact-form submit, call booking, FAQ opens — produces a named
event; and (5) the privacy policy reflects the added processor if the docs say
it collects visitor data.

## Plan (Phase 2)

### Incoming commitments

📋 Incoming commitments for this bundle (from prior `commitments.md`): **none.**
The subscription-rebuild plan (Bundles 0→F) is complete and
`feat-codirity-bf-analytics-perf/commitments.md` records **0 open commitments
across the plan**. No `## Target:` line names `feat-vercel-analytics`, and no
cross-plan ordinal candidates exist (this is a standalone run with no ordinal).
Total open commitments across all bundles: **0**. Combined scope = `$ARGUMENTS`
only.

### Verified facts this plan is built on

| Fact | How verified |
|---|---|
| `@vercel/analytics@2.0.1` is the current release; App-Router import is `{ Analytics } from "@vercel/analytics/next"`; it ships its own `"use client"` + `Suspense`, so the server-component layout needs no directive | vercel.com/docs/analytics/quickstart + the published tarball; version re-confirmed after install (`node -e require(...)` → `2.0.1`) |
| Client `track()` is `window.va?.call(...)` — a **silent no-op** when the insights script is absent (ad-blocker, Analytics unmounted, non-Vercel host). It cannot throw out of an event handler | read `node_modules/@vercel/analytics/dist/index.mjs` directly |
| Property values are limited to `string \| number \| boolean \| null`; names/keys/values capped at **255 characters**; **2 properties per event** on Pro | vercel.com/docs/analytics/custom-events#limitations |
| ⚠️ **CORRECTED — the plan of the account that owns this project is UNKNOWN.** I first read `GET /v2/user` as `maurino72` → `billing.plan: hobby` and wrote that up as verified. The PR's Vercel check then revealed the project actually deploys under a **team scope named `codirity`** (`vercel.com/codirity/codirity`), which is a different account. `GET /v2/teams?slug=codirity` with the available token returns `forbidden`, and `GET /v2/teams` lists only `maurino72s-projects` (hobby). So the Hobby reading describes an unrelated personal scope, **not** the owning team. Whether custom events are recorded is therefore **unverified** — see the corrected operator action below | `GET /v2/user`, `GET /v2/teams`, `GET /v2/teams?slug=codirity` → `forbidden`; team slug read off the PR's Vercel deployment URL |
| Custom events are **Pro/Enterprise-only**; Hobby records pageviews only (50k events/mo) | vercel.com/docs/analytics/limits-and-pricing |
| Vercel Web Analytics sets **no cookies**, stores no personal identifiers, and derives a visitor hash that resets every 24h | vercel.com/docs/analytics/privacy-policy |
| `cal("on", { action: "bookingSuccessfulV2", callback })` exists in the installed `@calcom/embed-core`; plain `bookingSuccessful` is marked `@deprecated` there | read `node_modules/@calcom/embed-core/dist/src/sdk-action-manager.d.ts` |
| Gates are `npm run lint`, `npx tsc --noEmit`, `npm run build`. There is **no CI, no test runner, and no `.github/`** — the gates are local-only | `docs/HANDOFF-subscription-rebuild.md:192-194`; `find` for workflow YAML returns nothing |
| No CSP anywhere (no `middleware.ts`, none in `next.config.ts`/`vercel.json`) — the new script needs no allowlist entry | grepped all three |
| Baseline first-party JS on `/` = **199.0 KB gz** across 12 chunks | built the untouched worktree, gzipped the chunks the built home HTML references |

### What is being built

1. **`@vercel/analytics@^2.0.1`** added to `package.json` + `package-lock.json`.
2. **`<Analytics />`** mounted in `src/app/layout.tsx` beside `<GoogleAnalytics />`
   — this is what produces pageviews, referrers, geo, and device data in the
   Vercel dashboard.
3. **`src/lib/analytics.ts` becomes a two-provider fan-out.** One `track()` call
   emits to GA4 *and* Vercel; each provider is skipped independently when absent.
   Property values are narrowed to Vercel's accepted union at compile time and
   clamped to the documented 255-character limit at runtime.
4. **The lead funnel is instrumented end to end.** Today only 5 events exist and
   the biggest lead surfaces emit nothing at all. Adding 7:
   `hero_cta_click`, `checkout_click_founding`, `contact_form_submitted`,
   `contact_form_success`, `contact_form_error`, `call_booking_completed`,
   `email_click`.
5. **Privacy policy §11** gains a Vercel Web Analytics disclosure.

### Files expected to touch

`package.json` · `package-lock.json` · `src/app/layout.tsx` ·
`src/lib/analytics.ts` · `src/components/ui/TrackedLink.tsx` ·
`src/components/ui/CalPopupButton.tsx` · `src/components/sections/Hero.tsx` ·
`src/components/sections/Pricing.tsx` · `src/components/sections/ContactForm.tsx` ·
`src/components/sections/ContactInfo.tsx` · `src/components/layout/Footer.tsx` ·
`src/app/privacy/page.tsx` · this notes file + `commitments.md`.

### Verification planned

`npm run lint` · `npx tsc --noEmit` · `npm run build` (the three documented
gates) · re-measure first-party JS gz against the 199.0 KB baseline · a live
dev-server smoke on a per-run free port confirming the insights script is
requested and each instrumented handler fires without console errors.

## Decisions made unilaterally

- **D1 — Vercel Web Analytics only; NOT Speed Insights.** They are separate
  products and separate packages. The task is about what leads *do* on the page,
  which is Web Analytics; Speed Insights measures Core Web Vitals. The homepage
  is already 199 KB gz against a 150 KB budget Bruno had to sign off on, so
  adding a second unrequested client script would spend budget on something
  nobody asked for. Recorded under Future considerations instead.
- **D2 — Keep GA4 and run both providers, rather than migrating.** GA4 is a
  deliberate prior decision (HANDOFF D1, live id `G-L33EC99DTX`) with historical
  data behind it. Replacing it was not asked for and would discard that history.
- **D3 — Ship the custom-event wiring regardless of the Vercel plan.** `track()`
  custom events are Pro/Enterprise-only; below that they reach Vercel and are
  discarded (no error, no console noise — the call is a plain `window.va` push).
  I originally justified this by "the account is on Hobby, verified", which was
  **wrong** — see the corrected row above; the owning team's plan could not be
  determined. The decision is unchanged either way, which is why the correction
  does not reopen it: the same `track()` call feeds **GA4, which records these
  events today**, so the instrumentation delivers the "know what our leads do"
  goal immediately; and the Vercel side is either already recording them or
  starts the moment the plan allows, with no follow-up code change. The
  alternative — shipping pageviews only — would have left the site's biggest lead
  surfaces (the contact form, the founding-rate checkout link) permanently
  uninstrumented on *both* providers, which is the actual gap worth closing.
- **D4 — Instrument lead-intent surfaces, not navigation.** Anchor-nav links
  (header/footer section jumps, logo, social icons, theme toggle, the privacy
  back-link) are deliberately left untracked: they are not lead actions, and
  Vercel's pageview stream plus GA4 already describe navigation. Tracking every
  link would dilute the event space and, on Pro, burn the metered event quota on
  noise.
- **D5 — `call_booked` is kept as-is and `call_booking_completed` is added
  alongside it.** `call_booked` is a misnomer — it fires on button *click*, not
  on a booking. Renaming it would break continuity with GA4 data already
  collected under that name, so the intent event keeps its name (its meaning is
  now documented in the type) and the real conversion arrives as a new event
  sourced from Cal.com's own `bookingSuccessfulV2` callback.
- **D6 — No personal data in any event property.** The Cal.com callback payload
  is discarded entirely rather than forwarded (the deprecated `bookingSuccessful`
  variant carries the organizer's name/email; `bookingSuccessfulV2` is used and
  nothing from it is read). Contact-form events carry only the `service`
  dropdown value — a fixed enum — never name, email, company, or message.
- **D7 — Privacy policy updated in this PR. ⚠️ REVERSED during review.** The
  original call was to add a "Last updated" line and leave the December 2024
  effective date alone, on the reasoning that an effective date is a legal
  statement I should not silently rewrite. Review finding 1 showed that reasoning
  was wrong on the facts: §14 of this very policy promises to "update 'effective
  date' at the top" before a change takes effect, so preserving the old date
  broke the document's own commitment. Corrected: the effective date is now
  July 28, 2026 and the "Last updated" line is gone, leaving one authoritative
  date. The lesson is that I reasoned about privacy-policy convention in the
  abstract instead of reading §14 of the document I was editing.
- **D8 — Runtime clamp of string property values to 255 characters.** This is a
  documented hard limit, and the one free-text property in play (`faq_opened`'s
  `question`) is sourced from editable config, so a copy change could cross it
  without any type error. The clamp is not defensive coding against an
  impossible state — it is enforcement of a published API constraint.
- Used the branch `feat/vercel-analytics` and standalone prefix
  `B-feat-vercel-analytics` (no `--bundle-id` was passed).

## Stop attempts

_(none)_

## Drift flags

- **Probe (f) gave a misleading pass, and the first review battery was a false
  clean.** My capability probe tried `at-reviewer`, then `autonomous-task:at-reviewer`,
  and reported `customAgents: true` on the strength of the *scoped* name. But the
  shipped battery calls the **bare** name, which this build does not resolve, so
  battery run `wf_fde7e364-553` returned `rawFindings: 0, areasExamined: 0` with
  all 6 finder agents failing `agent type 'at-reviewer' not found`. A zero-findings
  result with `areasExamined: 0` is the documented did-not-run signature, so it was
  not trusted. Re-invoked as `wf_c3f3a1fc-436` with `customAgents: false` (built-in
  `general-purpose` reviewers — same finding behaviour, no per-repo memory).
  Corrected probe result for this build: **`customAgents: false`**.

## Verification — live smoke (Phase 6)

Dev server on a per-run free port (53291), driven through the browser. All events
were exercised with **`window.gtag` absent** (no GA id locally), which is exactly
the "one provider missing" path the fan-out has to survive.

| Check | Result |
|---|---|
| Vercel insights script loaded | ✅ `https://va.vercel-scripts.com/v1/script.debug.js` (the documented dev-mode script; prod uses `/_vercel/insights/script.js`, confirmed present in the built client chunk) |
| `window.va` / `window.vaq` initialised | ✅ `function` / queue array |
| `hero_cta_click` | ✅ fired |
| `email_click` ×2 | ✅ fired with `{location: "contact_section"}` and `{location: "footer"}` |
| `faq_opened` | ✅ fired with `{question: "Who does the work?"}`; accordion still toggles |
| `checkout_click_founding` | ✅ fired (previously an untracked live checkout link) |
| `checkout_click_standard` / `checkout_click_pro` | ✅ still fire — no regression |
| `contact_form_submitted` → `contact_form_error` | ✅ both fired, `{service: "ai"}` / `{reason: …}`. No name, email, company, or message in either payload |
| `call_booked` | ✅ fires per button click (unchanged intent event) |
| **`call_booking_completed` listener registered exactly once** | ✅ **empirically proven**: with `window.Cal` intercepted before first assignment, loading the embed from all 3 CalPopupButton instances produced `ui` **5 times** but `on:bookingSuccessfulV2` **exactly 1 time**. Without the module-scope latch this would have emitted 5 duplicate events per real booking |
| Console errors | ✅ none |
| No `track()` call threw | ✅ every handler returned normally with gtag absent |
| External links keep `target="_blank"` + `rel="noopener noreferrer"` | ✅ after the `<a>` → `TrackedLink` swap |
| Homepage renders unchanged | ✅ screenshot; "See pricing" button visually identical |
| Privacy page | ✅ `Last updated: July 28, 2026` added, original effective date preserved, Google block intact, Vercel block renders |

**Not exercisable locally, stated plainly rather than claimed:**
- `pricing_viewed` — needs a real viewport; the headless pane reports
  `window.innerHeight === 0`, the same limitation Bundle F recorded. Unchanged by
  this PR (`PricingViewedTracker.tsx` was not touched) and already an open
  operator follow-up from Bundle F to confirm in GA DebugView on the deployed site.
- `call_booking_completed` *firing* — needs a real completed Cal.com booking. What
  is proven above is that the listener registers exactly once, which was the actual
  risk; the callback body is a single `track()` call.
- `contact_form_success` — needs working SMTP. The worktree has only `.env.example`,
  so the API cannot send mail; the error path was exercised instead. The success
  call sits on the same line of code as the error call, after the `response.ok` check.

### Gate results

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | ✅ clean |
| `npm run lint` | ✅ clean |
| `npm run build` | ✅ clean, all 7 routes prerendered |

### Performance budget

First-party JS on `/`, gzipped, summing the chunks the built home HTML references:

- Baseline (`origin/main`, measured in this worktree): **203,877 B / 199.0 KB gz**
- After: **205,736 B / 200.9 KB gz**
- **Delta: +1,859 B / +1.81 KB gz**

Context: Bundle F recorded 198.3 KB with Bruno's explicit sign-off to merge over
the stale 150 KB budget, and recommended re-baselining to ~200 KB. This change adds
under 2 KB. Deliberately not adding `@vercel/speed-insights` (decision D1) keeps a
second script off that number.

## Round-skip requests

_(none)_

## Review findings + resolutions

Battery `wf_c3f3a1fc-436` (2 adversarial + 2 QA rounds, mixed opus/sonnet finder
pool, 3 verify voters): **18 raw → 10 unique after semantic dedup (6 clusters
merged) → 10 confirmed, 0 refuted.** 73 areas examined. 0 proposed deferrals, 0
forced-apply escalations, 0 items over the verify cap.

**All 10 were applied in this PR. Nothing was deferred.**

| # | Sev | Where | Finding | Resolution |
|---|---|---|---|---|
| 1 | MAJOR | `privacy/page.tsx:31-35` | The policy's own §14 promises to "update 'effective date' at the top" before a change takes effect, so disclosing a new processor while leaving the December 2024 date and adding a separate "Last updated" line contradicted the document itself | **Reverses decision D7.** Effective date bumped to July 28, 2026; the "Last updated" line removed so there is one authoritative date |
| 2 | MAJOR | `privacy/page.tsx:318-330` | The new Vercel disclosure enumerated only automatic pageview data, omitting that the same SDK also transmits named conversion events with properties — under-describing what actually leaves the browser | Added a paragraph describing the conversion events and their non-identifying labels, and stating explicitly that they never carry name, email, company, or message |
| 3 | MAJOR | `ContactForm.tsx:82-88` | `contact_form_error` sent `{reason: message}` — a user-facing display string, locale-dependent for network failures. Safe only because the API happens to return three fixed strings today; a future route echoing user input would flow straight into analytics. It also dropped `service`, breaking joinability with its sibling events | `reason` is now a bounded code (`http_<status>` / `network_error` / `malformed_response`) and `service` is carried through. Verified live: `{service: "automation", reason: "http_500"}` |
| 4 | MAJOR | `layout.tsx:104` | Mounting `<Analytics />` only injects the script — it collects nothing until Web Analytics is toggled on for the project in the Vercel dashboard, and a dev smoke test structurally cannot catch this because dev always loads the debug script instead of the production path | Recorded as a **blocking operator prerequisite** in this file, the PR body, and the post-merge check below. Enabling it is an account-settings change I am not authorised to make |
| 5 | MINOR | `CalPopupButton.tsx:17` | The module-scope latch resets on React Fast Refresh while the Cal listener it guards lives on the surviving `window` singleton — so a dev refresh re-registers and double-counts bookings | Latch moved onto `window.__codirityCalBookingListener`, so flag and listener share a lifetime |
| 6 | MINOR | `CalPopupButton.tsx:12-16` | Comment claimed four button instances ("Hero, Pricing, FAQ, Contact"); Pricing renders a `TrackedLink`, so the real count is three | Comment corrected to Hero / Faq / ContactInfo |
| 7 | MINOR | `analytics.ts:72-95` | Comments claimed the 255-char limit was enforced for event names and property keys and that the 2-property ceiling was respected, but only string values are clamped; and `withinProviderLimits` reads like a boolean predicate while returning a transformed copy | Renamed to `clampPropertyValues`; the comment now states exactly what is enforced at runtime versus what is a review-time rule, and why values are the only place free text enters |
| 8 | MINOR | `privacy/page.tsx:390` | A third `mailto:support@codirity.com` on the privacy page stayed untracked while the same address was instrumented in Footer and ContactInfo — silently undercounting `email_click` | Now a `TrackedLink` with `{location: "privacy_page"}`. Verified live |
| 9 | MINOR | `Footer.tsx:147` | Making Footer's link a client component pulls the analytics runtime into every route's bundle including `/privacy`, and no post-change measurement had been recorded despite the plan promising one | Both routes measured against a real `origin/main` build (table below) |
| 10 | MINOR | `PricingCard.tsx:18`, `PricingViewedTracker.tsx:7` | JSDoc still described `track()` as firing "a GA4 event" after it became a two-provider fan-out, misleading anyone auditing where visitor data goes | Both docblocks updated to name both providers and point at `src/lib/analytics.ts` |

### Perf re-measurement after the review fixes

Both routes built from `origin/main` in a throwaway worktree and compared
chunk-for-chunk against this branch:

| Route | Before | After | Delta |
|---|---|---|---|
| `/` | 203,866 B (199.0 KB gz) | 205,648 B (200.8 KB gz) | **+1,782 B (+1.74 KB)** |
| `/privacy` | 195,446 B (190.8 KB gz) | 197,792 B (193.1 KB gz) | **+2,346 B (+2.29 KB)** |

`/privacy` grows slightly more than `/` because it now carries the analytics
runtime for its own tracked mailto link (finding 8) where before it carried none.

### Gates re-run after every fix

`npx tsc --noEmit` ✅ · `npm run lint` ✅ · `npm run build` ✅ (7 routes prerendered).

## Areas examined and rejected

The battery returned **73** areas its reviewers investigated and ruled out. Listed
in full below as the audit trail; the ones that mattered most are the first three
— the RSC boundary questions and the Cal latch — each ruled out by reading
`node_modules` sources rather than by assertion.

1. Server-to-client object prop (eventParams) — hydration/serialization crash risk
2. <Analytics /> from '@vercel/analytics/next' inside a server-component layout
3. CalPopupButton module-scope latch — zero or duplicate call_booking_completed
4. PII reaching either analytics provider
5. Behavioural regression from <a> -> TrackedLink on the external founding-rate link
6. Beacon dropped by onClick-then-navigate
7. Cta -> LinkCta narrowing breaking other consumers
8. AnalyticsParams narrowing silently breaking existing track() call sites or gtag typing
9. 255-char clamp correctness / silent data corruption
10. Vercel insights script blocked by CSP / header policy
11. Dependency manifest / lockfile integrity
12. Completeness of mailto instrumentation
13. src/app/layout.tsx:98-104 — <Analytics /> from '@vercel/analytics/next' mounted directly in the server-component RootLayout
14. Footer.tsx:143-151, ContactInfo.tsx:17-24, Pricing.tsx:23-31, Hero.tsx:69-76 — `eventParams` object props passed from Server Components into the Client Component TrackedLink
15. src/lib/analytics.ts:44-91 — track()/withinProviderLimits() never throwing out of an event handler
16. src/app/api/contact/route.ts + src/components/sections/ContactForm.tsx:47-93 — no PII reaches contact_form_* events
17. src/components/ui/CalPopupButton.tsx — bookingListenerRegistered race across multiple button instances and repeated ensureCal() calls (steady state, no Fast Refresh)
18. src/config/offer.ts:91-111 — Cta → LinkCta narrowing on HeroContent.primaryCta
19. src/app/privacy/page.tsx — new Vercel Web Analytics disclosure copy
20. Pricing.tsx founding-rate banner and Footer.tsx/ContactInfo.tsx mailto links — <a> → TrackedLink swap regressions and beacon-before-unload risk
21. src/lib/analytics.ts AnalyticsEvent union / TrackedLink.tsx AnalyticsParams typing — compatibility with the pre-existing faq_opened call site
22. runtime-crash: <Analytics/> legality inside a server-component root layout (src/app/layout.tsx:6,107)
23. hydration: object prop crossing the server→client boundary (Footer.tsx:151, ContactInfo.tsx:21 → TrackedLink.tsx:13)
24. event-emission: bookingListenerRegistered latch across instances, repeat ensureCal(), and the ready/loading early return (CalPopupButton.tsx:17,36,46-59)
25. privacy/PII: what actually reaches GA4 and Vercel from the contact form and the Cal callback (ContactForm.tsx:61,79,88; src/app/api/contact/route.ts:31,40,131; CalPopupButton.tsx:54)
26. regression: <a> → TrackedLink swaps — lost attributes, anchor semantics, beacon drop before unload (Pricing.tsx:28-48, Hero.tsx:71-84, Footer.tsx:148-155, ContactInfo.tsx:18-25)
27. type narrowing blast radius: Cta → LinkCta (src/config/offer.ts:91-111)
28. data-flow at the empty/default boundary in the fan-out (src/lib/analytics.ts:79-88, 96-106)
29. 'neither provider may throw out of an event handler' (analytics.ts:101-105 vs node_modules/@vercel/analytics/dist/index.mjs)
30. regression surface of Footer's new barrel import (src/components/layout/Footer.tsx:2)
31. spec-conformance of the AnalyticsEvent union extension and the Cal.com API choice (analytics.ts:28-49; PricingCard.tsx:19; TrackedLink.tsx:11)
32. local gates (the only thing standing between this branch and production)
33. scope-creep / bookkeeping: uncommitted run notes and the untracked privacy-page mailto
34. RSC legality of <Analytics/> in server-component layout.tsx (src/app/layout.tsx:98-100)
35. eventParams object literals crossing the server→client boundary (Footer.tsx, ContactInfo.tsx, Pricing.tsx server components → TrackedLink.tsx 'use client')
36. track() throw-safety for both providers (src/lib/analytics.ts:96-106; node_modules/@vercel/analytics/dist/index.mjs:192-221)
37. CalPopupButton module-scope guard race across the 4 simultaneously-mounted instances in a single (non-refreshed) page load (Hero.tsx, ContactInfo.tsx, PricingCard.tsx, Faq.tsx)
38. offer.ts Cta -> LinkCta narrowing, breaking-change scan (src/config/offer.ts:91-115)
39. External-link attribute parity after <a> -> TrackedLink on the founding-rate banner (Pricing.tsx)
40. Beacon-vs-page-unload race on the new TrackedLink usages (hero_cta_click, checkout_click_founding, email_click x2)
41. Privacy-policy Vercel disclosure accuracy (src/app/privacy/page.tsx ~318-327) vs. Vercel's documented mechanism
42. Build/type/lint gates and package-lock integrity
43. contact_form_submitted / contact_form_success PII payload (ContactForm.tsx:58-62,77-79)
44. Server→client object prop (eventParams) across the RSC boundary
45. <Analytics /> legality inside a server-component root layout
46. track() throwing out of an event handler
47. CalPopupButton module-scope bookingListenerRegistered latch — duplicate or zero events
48. PII reaching either analytics provider
49. Behavioural regression from the <a> → TrackedLink swaps
50. Cta → LinkCta narrowing breaking other consumers
51. AnalyticsParams narrowing and the 255-char clamp corrupting data
52. Privacy-policy copy accuracy and section integrity
53. Dependency hygiene / lockfile correctness
54. Cal.com action-name correctness
55. Circular import / barrel-import risk from Footer pulling @/components/ui
56. Whether analytics.ts leaks the browser-only @vercel/analytics runtime into a server bundle
57. Missing commitments.md for this run
58. Documentation drift in older run notes / HANDOFF referring to '5 GA4 events'
59. Server-component legality of <Analytics /> (focus 1)
60. Module-scope bookingListenerRegistered latch (focus 2)
61. contact_form_submitted firing on non-submits (focus 2)
62. vercelTrack throwing out of an event handler (focus 1)
63. Cta -> LinkCta narrowing breaking other consumers (focus 5)
64. Attributes/semantics lost in the <a> -> TrackedLink swaps (focus 4)
65. Beacon dropped by navigation before send (focus 4)
66. PII reaching either provider (focus 3)
67. Package/version/lockfile consistency
68. Docs-of-record staleness (event-set declarations)
69. CSP / headers blocking the insights script
70. Type/lint gates on the new contracts
71. Missing commitments.md for this run
72. Trivial comment inaccuracies in CalPopupButton
73. Pre-existing config duplication in touched files

## Items deferred from this PR

**None — all review findings resolved.**

## Operator actions required — this PR does not deliver data without them

These are account/billing actions, not code. I am not authorised to make either
change (both are account-settings changes), so they are surfaced rather than done.

1. **Enable Web Analytics for the project in the Vercel dashboard** (Project →
   Analytics → Enable), then redeploy. **Blocking.** Until this is on, the mounted
   `<Analytics />` requests `/_vercel/insights/script.js`, gets a 404, and collects
   nothing — this is Vercel's own documented failure mode for "deployed the tracking
   code before enabling Web Analytics". A dev smoke test structurally cannot catch
   it, because in development the package always loads the debug script instead.
   **How to confirm after merge:** open www.codirity.com in a browser, and check the
   network panel shows `/_vercel/insights/script.js` returning **200**, not 404.
   This could not be tested on the PR preview: preview deployments for this project
   sit behind Vercel SSO, so both the page and the script 302 to `vercel.com/login`.
2. **Check whether the plan covers custom events — I could not.** Vercel custom
   events are Pro/Enterprise-only. The project deploys under a team scope named
   `codirity` whose plan is not readable with the credentials on this machine
   (`GET /v2/teams?slug=codirity` → `forbidden`). If that team is on Hobby, Vercel
   will show pageviews/referrers/geo/device but discard the 12 conversion events;
   on Pro it shows everything, capped at 2 properties per event (which every event
   here respects). **GA4 records the events either way**, so the funnel is
   observable regardless — this only decides whether Vercel's dashboard shows them
   too, and needs no code change.

   *(An earlier version of these notes stated the account was verified as Hobby.
   That reading came from `maurino72`'s personal scope, which turned out not to own
   this project. Corrected once the PR's Vercel deployment URL revealed the real
   team.)*

Neither of these is a defect in the change; they are the operating conditions.

## Future considerations (not tracked deferrals)

- **`@vercel/speed-insights`** — the Core Web Vitals counterpart, deliberately out
  of scope (D1). Worth revisiting alongside the perf-budget re-baseline that Bundle
  F left open, since the two are the same conversation.
- **Perf budget re-baseline**, carried over from Bundle F: the 150 KB gz gate sits
  below the React 19 + Next 16 framework floor. `/` is now 200.8 KB gz. Bruno's
  standing recommendation was to re-baseline to ~200 KB or move to a
  Lighthouse-based gate.
- **`pricing_viewed` verification on the deployed site** — still open from Bundle F
  and untouched here; it cannot be exercised in a headless pane.

## Open items NOT addressed in this PR

**None.** All 10 confirmed review findings were applied in this PR; the battery
proposed zero deferrals and raised zero escalations.

## Durable handles

- `marker: $HOME/.claude/autonomous-active/autonomous-task-feat-vercel-analytics`
- `worktree: /Users/brunomaurino/projects/codirity/.claude/worktrees/feat-vercel-analytics`
- `worktree_entry: name`
- `cron: (none — CronCreate denied by the permission classifier; nothing to tear down)`
- `battery_run_id: wf_fde7e364-553`
