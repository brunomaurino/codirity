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
_(Phase 4/5)_

## Areas examined and rejected
_(from battery areasExamined)_

## Open items NOT addressed in this PR
_(none yet)_

## Durable handles
- marker: $HOME/.claude/autonomous-active/autonomous-task-feat-codirity-b0-render-fix
- worktree: /Users/brunomaurino/projects/codirity-b0-render-fix
- worktree_entry: path
- cron: (none — bundle-loop owns the resume-watchdog; --bundle-id set)
