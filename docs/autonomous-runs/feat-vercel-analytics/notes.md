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
| **The Vercel account `maurino72` is on the `hobby` plan** | `GET https://api.vercel.com/v2/user` → `billing.plan: hobby` |
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
- **D3 — Ship the custom-event wiring even though the account is on Hobby.**
  Verified above: `track()` custom events are Pro-only, so on Hobby they reach
  Vercel and are discarded (no error, no console noise — the call is a plain
  `window.va` push). Two reasons to wire them anyway: the same `track()` call
  feeds **GA4, which records them today**, so the new instrumentation delivers
  the "know what our leads do" goal immediately; and the Vercel side then lights
  up the moment the account upgrades, with no follow-up code change. The
  alternative — shipping pageviews only — would have left the site's biggest
  lead surfaces (the contact form, the founding-rate checkout link) permanently
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
- **D7 — Privacy policy updated in this PR, with a "Last updated" line added
  rather than rewriting the existing effective date.** Adding a processor while
  §11 still names only Google Analytics would leave the published policy
  inaccurate, so it ships together with the change. The original effective date
  is a legal statement I should not silently rewrite; a dated "last updated"
  line records the amendment truthfully.
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

_(none)_

## Round-skip requests

_(none)_

## Review findings + resolutions

_(filled in Phase 4/5)_

## Areas examined and rejected

_(filled from the battery's `areasExamined`)_

## Open items NOT addressed in this PR

_(filled at Phase 7)_

## Durable handles

- `marker: $HOME/.claude/autonomous-active/autonomous-task-feat-vercel-analytics`
- `worktree: /Users/brunomaurino/projects/codirity/.claude/worktrees/feat-vercel-analytics`
- `worktree_entry: name`
- `cron: (none — CronCreate denied by the permission classifier; nothing to tear down)`
