# Autonomous run — Bundle 0 (render fix)

Started: 2026-07-24T14:50:38Z

## Task description

Build Bundle 0 (render fix) for the Codirity subscription rebuild (plan: subscription-rebuild).
Remove the `if (!mounted) return null` mount-gate in `src/components/theme/ThemeProvider.tsx:99-101`
(render children unconditionally); prevent theme flash with a blocking inline `<head>` script in
`src/app/layout.tsx` that sets the `data-theme` ATTRIBUTE on `<html>` before paint. Grep the layout
ancestry for other mount/useEffect/return-null/typeof-window gates. Acceptance: script-stripped HTML
shows real `<h1>` + `<header>/<main>/<footer>` + section copy; theme applies with no flash; lint + tsc
+ next build green. Baseline homepage first-party JS size (gzip) and record in PR.

## Execution context

- Probe passed: Workflow + Agent both available, Agent callable (PROBE-OK). Main conversation.
- Capability probes: args round-trip = YES (native scriptPath+args battery invocation);
  effortTiers = true; customAgents = false (bare `at-reviewer` did not resolve from Workflow in
  this build — using documented general-purpose fallback; repo has no prior project-memory).
- worktreeNative = true (EnterWorktree/ExitWorktree both resolve).
- Origin-bundle prefix: `B0` (from `--bundle-id 0`). Plan-qualified identifier:
  `subscription-rebuild Bundle 0` (from `--plan-slug subscription-rebuild`).
- gh account: maurino72 (WRITE on brunomaurino/codirity).
- Merge authorization: Bruno authorized FULL unattended auto-merge in-session (HANDOFF ground-rule 9).

## Task interpretation

- **Concrete deliverable:** (1) Remove `if (!mounted) return null` in
  `src/components/theme/ThemeProvider.tsx` so children render unconditionally (server + first paint).
  (2) Add a blocking inline `<head>` script in `src/app/layout.tsx` that sets the `data-theme`
  attribute on `<html>` before paint, mirroring ThemeProvider's resolution (localStorage
  `codirity-theme`; unstored → light; `system` → prefers-color-scheme). (3) Make `ThemeToggle`'s
  icon CSS-driven off `data-theme` so it's correct pre-hydration (completes "no flash").
- **Acceptance test:** script-stripped served HTML contains the real `<h1>` + `<header>/<main>/<footer>`
  + section copy (not just flight payload); no theme flash light/dark; lint + tsc + next build green;
  homepage first-party JS baseline (gzip) recorded in the PR.

## Plan

- Files to touch: `src/components/theme/ThemeProvider.tsx` (remove mount-gate), `src/app/layout.tsx`
  (inline theme-init script in `<head>`), `src/components/theme/ThemeToggle.tsx` (CSS-driven icon).
- Verify: `npm run lint`, `npx tsc --noEmit`, `npm run build` (prerenders `/` — will now actually
  render the full tree, surfacing any latent SSR crash in client components), local prod serve +
  curl → strip `<script>` → assert `<h1>/<header>/<main>/<footer>` + copy. JS-size baseline via gzip
  of the home HTML's referenced chunks.
- Open questions:
  - Inline-script placement: `<head>` (per HANDOFF) vs top-of-`<body>`. Chose `<head>`; script only
    touches `document.documentElement`, available in head; verify build has no warning.
  - Keep `mounted` state? Yes — only the early-return gate is removed; `mounted` still guards the
    media-query listener effect (harmless, minimal change).

## Decisions made unilaterally

- **Include a `ThemeToggle` CSS-icon fix** (render both Moon+Sun, toggle visibility via `data-theme`
  CSS) even though the HANDOFF names only ThemeProvider+layout. Rationale: without it, dark-mode users
  see a one-frame toggle-icon swap after hydration — a residual "flash" the acceptance forbids. The
  fix is low-risk (`dark:` variant already used throughout this file) and eliminates any hydration
  mismatch on the toggle. aria-label still derives from `resolvedTheme` (non-visual; corrects on mount).
- Inline script mirrors ThemeProvider's unstored→`light` default (NOT system), else a dark-OS user
  with no stored pref would get script=dark then ThemeProvider=light → the exact flash we're removing.

## Verification (Phase 6 evidence)

- `npm run lint` — GREEN (fixed a PRE-EXISTING `react-hooks/set-state-in-effect` error at
  `ThemeProvider.tsx:57` that was already red on clean `main`; the ThemeProvider refactor to
  `useSyncExternalStore` removes it at the root rather than suppressing).
- `npx tsc --noEmit` — GREEN.
- `npm run build` — GREEN; `/` prerenders as `○ (Static)`. Full tree now renders (no SSR crash
  from the client components Header/Toaster/RevealProvider once actually rendered).
- **Script-stripped acceptance (ground-rule 8):** prerendered `.next/server/app/index.html` →
  script-stripped **44,302 bytes** (was ~1,484 on live prod before the fix). Exactly one `<h1>`
  ("Modernize Your Business With Intelligent AI"), plus `<header>/<main>/<footer>` and real section
  copy (Globant, Two Brothers, Pricing). Confirmed identically on a live `next start` curl.
- **Browser visual (both schemes):** localStorage-unset → light (correct default); localStorage=dark
  → `data-theme="dark"` set by the pre-paint inline `<head>` script, white heading + dark tokens,
  header/main/footer present, single h1, head script present, 30 body children. No color flash
  (blocking head script sets the attribute before paint).
- **First-party home JS baseline: 195.5 KB gz** (11 chunks; raw 642.0 KB) — matches the HANDOFF's
  stated baseline; OVER the 150 KB gz budget by 45.5 KB. Bundle 0 net-JS change is negligible.
  Perf trimming is Bundle F's hard gate.

## Edge cases considered

- Inline-script theme resolution mirrors ThemeProvider EXACTLY: localStorage `codirity-theme` ∈
  {light,dark,system}; unstored → "light" (NOT system) — else a dark-OS user with no stored pref
  would get script=dark then React=light = the flash we remove. `system` → prefers-color-scheme.
- `try/catch` around localStorage (private mode / disabled throws).
- Hydration: server snapshot "light" for both `theme` and `resolvedTheme`; `useSyncExternalStore`
  reconciles the real client value post-hydration WITHOUT a mismatch warning (its documented SSR
  contract). Toggle icon is CSS-driven (both icons in DOM, `data-theme` picks) → no icon mismatch.
  `<html suppressHydrationWarning>` covers the script-set `data-theme` attribute.
- `system` mode + OS scheme change: `resolvedTheme` snapshot flips (raw stays "system") because the
  two snapshots share one `matchMedia`-change subscription → re-render fires. Same-tab `setTheme`
  notifies via a custom `codirity-theme-change` event (native `storage` fires only cross-tab).

## Stop attempts
_(none)_

## Drift flags

- **node_modules symlink is incompatible with Next 16 Turbopack** (`next build` panics:
  "Symlink node_modules is invalid, it points out of the filesystem root"). The
  autonomous-task/bundle-loop Phase-1 `ln -sfn <parent>/node_modules` guidance does NOT work here;
  used a real `npm ci` in the worktree instead. **Cross-bundle: every subsequent bundle must do a
  real install in its worktree, not the symlink.** (Surfaced to the orchestrator session notes.)

## Round-skip requests
_(none)_

## Review findings + resolutions

Battery `wf_0debc7f1-b57` (2 adv + 2 QA, verify-voters=3): 3 raw → 3 unique → 3 confirmed,
0 refuted, 0 escalations, 0 deferrals, 56 areas examined. All 3 MINOR (applyInline):

1. **MINOR — Footer.tsx:40 copyright year now build-time** (was client-only). RESOLVED BY ANALYSIS,
   kept as-is: `Footer` is a SERVER component (no `"use client"`), so there is NO hydration mismatch
   (server components don't re-execute on the client). The residual — a build-time-frozen year — is
   standard, correct behavior for a statically-prerendered page and is the intended result of
   server-rendering the footer; the reviewer's implied fix (make it client-only) would reverse
   Bundle 0's server-rendering goal for a non-SEO element. Vercel redeploys refresh it. No change.
2. **MINOR — ThemeProvider double subscribe** (same `subscribe` fn to two `useSyncExternalStore`).
   APPLIED: consolidated to ONE `useSyncExternalStore` with a composite `"<theme>|<resolved>"`
   snapshot → single registered listener set; still reacts to both raw (setTheme) and resolved-only
   (OS scheme flip in system mode) changes. Verified live in-browser (dark/light/system all react).
3. **MINOR — layout.tsx theme contract duplicated with ThemeProvider, no reverse-link comment.**
   APPLIED: added a cross-reference NOTE comment at ThemeProvider's `STORAGE_KEY` explaining the
   pre-paint `themeInitScript` mirrors it and cannot import (inlined static string), so both must
   change together. (layout.tsx already carries the forward reference.) True logic de-dup is
   infeasible — the inline script runs before any bundle loads and must be a literal string.

Post-apply re-verification: lint + tsc + build green; script-stripped acceptance holds (44,302 B,
single h1, header/main/footer); ThemeProvider reactivity validated live.

## Areas examined and rejected

From battery `areasExamined` (56 entries; distinct areas consolidated):
- **SSR render-time browser access in the now-un-gated subtree** — Header (window only in useEffect),
  Footer (no browser API), Toaster (sonner client comp, no render-time access), RevealProvider +
  useRevealOnScroll (document only in useEffect), sections/* (0 hits for window/document/localStorage/
  matchMedia). No prerender crash; tsc + eslint exit 0.
- **useSyncExternalStore SSR contract / hydration** — getServerSnapshot supplied → no "Missing
  getServerSnapshot" throw; hydrates with "light" (matches inline-script unstored default); real
  client value applied on post-hydration re-render, no mismatch warning.
- **getSnapshot primitive stability** — returns primitive strings compared by Object.is → no
  infinite re-render / "getSnapshot should be cached" warning.
- **Inline theme-init script parity with ThemeProvider** — unstored→light; system→prefers-color-scheme;
  else stored value — matches exactly. No dark-OS-unstored flash.
- **Toggle icon + Tailwind dark: variant** — `@custom-variant dark` keys off [data-theme] (not
  prefers-color-scheme); both icons in identical server/client markup, visibility CSS-only → no
  hydration mismatch.
- **aria-label hydration** — derives from resolvedTheme (server snapshot "light" during hydration,
  updates post-hydration); ThemeToggle currently has no consumer in the rendered tree anyway.
- **Inline script XSS safety** — static template literal, zero interpolation via
  dangerouslySetInnerHTML; no user/request data; no CSP/nonce config to violate.
- **Other mount/return-null/typeof-window gates** — only GoogleAnalytics `if(!gaId) return null`
  (env-gated, outside <ThemeProvider>, pre-existing). ThemeProvider confirmed the only tree-nuller.
- **Same-tab toggle + system OS-change reactivity** — setTheme writes localStorage (try/catch) +
  dispatches THEME_EVENT; subscribe listens matchMedia change + storage + THEME_EVENT.
- **Public ThemeContext API** — still {theme, resolvedTheme, setTheme, toggleTheme}; toggle +
  persistence preserved.

## Open items NOT addressed in this PR

None — all review findings resolved (2 applied, 1 resolved-by-analysis with rationale above).
Perf trimming (195.5 KB gz > 150 KB budget) is Bundle F's hard gate, per the HANDOFF (not Bundle 0).

## Durable handles
- marker: $HOME/.claude/autonomous-active/autonomous-task-feat-codirity-b0-render-fix
- worktree: /Users/brunomaurino/projects/codirity-b0-render-fix
- worktree_entry: path
- cron: (none — bundle-loop owns the resume-watchdog; --bundle-id set)
- battery_run_id: wf_0debc7f1-b57 (Phase 4/5/5.5; resume with resumeFromRunId on death)
