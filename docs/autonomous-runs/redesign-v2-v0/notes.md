# Autonomous run — feat/redesign-v2-v0 (redesign-v2 Bundle 101 / V0)

Started: 2026-07-28T18:19:42Z

## Task description

> Redesign v2 Bundle V0 — La Firma foundation flip: forest/paper/ink/sage/brass tokens +
> Fraunces on headings + mono retired as system voice + soft shapes, across the whole
> (reverted, pre-redesign) site, NO structural changes. **--no-merge: PR opens as the visual
> checkpoint with screenshots for Bruno.** `--bundle-id 101 --plan-slug redesign-v2`

## Execution context

- Probes reused (same session/build): Workflow ✓, Agent ✓, args ✓, effortTiers ✓,
  **customAgents: false**, worktreeNative ✓. No watchdog (standalone-style; short run, operator
  active in session).
- Prefix **B101** · identifier **redesign-v2 Bundle 101**. Worktree `redesign-v2-v0` (name
  form), branch `feat/redesign-v2-v0` off `adde1eb` (the reverted tree + v2 handoff).
- Incoming commitments: none (v1 bundles all closed with zero deferrals; plan halted).

## Task interpretation (Phase 1.5)

**Deliverable.** The whole-site token flip: (1) `globals.css` — palette values swapped to the
§1 system (forest primary, warm paper page + card whites, warmed neutral ramp, sage + brass
tokens added, forest-tinted borders/hovers, warm ink shadows; BOTH dark paths updated); (2)
Fraunces wired via next/font/google with a `--font-serif` theme token + a global heading rule;
(3) mono retired as a system voice (SectionHeader labels, metric text → sans; the LOGO wordmark
stays mono — see D-V0-2); (4) soft-shape pass (cards to 14–18px radius, warm shadows, no glow);
(5) `opengraph-image.tsx` recolored to the new system. NO section added/removed/reordered.

**Acceptance.** Gates green; SSR intact; screenshots (desktop+mobile × light+dark) attached to
a PR that is OPENED BUT NOT MERGED; banned grep zero; §1.5 anti-AI-look checklist honest;
contrast decisions documented; perf delta vs the reverted baseline reported.

## Decisions made unilaterally

- **D-V0-1 — The flip rides the existing token architecture.** `brand`/`brand-dark`/etc. map to
  `--green-*` vars, and Tailwind 4's `@theme` lets `--color-white` be redefined — so the palette
  swap happens at token level and propagates to every `bg-white`/`text-brand` class without
  touching dozens of components. Only semantic misfits (glow shadows, neon gradients, mono
  labels) are edited by hand.
- **D-V0-2 — The logo wordmark KEEPS Space Mono.** "Codirity" in mono is the existing brand mark
  (header + footer + OG image); §1.2 retires mono as a SYSTEM voice (labels, metrics, body),
  not the wordmark. Changing the logo is a brand decision Bruno hasn't made.
- **D-V0-3 — Dark-mode brand value picked for contrast, documented:** dark `--green-main` is
  **#3D8A66** — white button text on it ≈ 4.6:1 (AA normal) and it stays legible as an accent on
  the dark page (#1A1D1B) for the semibold label/link usages. Brass is decorative/large-text
  only (≈3.2:1 on paper — never body text).
- **D-V0-4 — Hero h1 tracking loosened for the serif.** The Outfit-era `tracking-[-2.5px]` is
  too tight for Fraunces; the global serif heading rule sets `-0.015em` and the h1 class drops
  its hardcoded override.

## Stop attempts

_(none)_

## Drift flags

_(none)_

## Round-skip requests

_(none)_

## Review findings + resolutions

Battery `wf_d22cfc77-4da` (2 adv + 2 QA): **25 raw → 11 unique → 3 confirmed, 8 refuted.
55 areas examined. 0 deferrals, 0 escalations. All 3 applied.**

**Degradation note (recorded honestly):** 18 Fable verify-voter calls failed on a session-usage
limit mid-battery; the battery's built-in `judgeFallback` (Opus) completed the adjudication as
designed, so no finding was dropped — but the verify layer for this bundle ran on the fallback
tier. All three confirmed findings were additionally re-verified BY HAND in the main thread
before applying (each is a directly checkable fact: a grep, a hex, a class name).

| # | Sev | Finding | Resolution |
|---|---|---|---|
| 1 | MINOR | Dark scrollbar hardcoded the removed cold-gray ramp values | Now rides the warm dark tokens |
| 2 | MINOR | CLAUDE.md (and design-system.md, found in the same sweep) still listed the retired neon hexes | Both updated to the La Firma palette |
| 3 | MINOR | Card radii inconsistent (16/20/24/28px across Card/PricingCard/ContactInfo/ContactForm/HeroCards/ServiceCard) | ALL card surfaces normalized to `rounded-2xl` (16px), per §1.3 |

Refuted (8) — recorded, not acted on: includes several dark-mode unpaired-gray suspicions the
voters traced to fully-paired classes, and contrast concerns disproved by computed ratios
(forest-on-paper 7.34:1; dark button 4.6:1; OG text 4.5–7.3:1 — all AA).

## Areas examined and rejected

**55 areas** (full list in `wf_d22cfc77-4da`); highlights: the inverted-ramp removal traced
token-by-token and confirmed as a REAL pre-existing-bug fix; header/inputs/toaster/footer all
fully dark-paired; cascade-layer analysis confirms the unlayered h1–h4 serif rule wins over
Tailwind utilities by design; email-template recolor introduces no injection surface (sanitize()
intact); OG contrast AA; no old green hex anywhere; brass unused in components (constraint holds
trivially); Fraunces wiring valid.

## Items deferred from this PR

**None — all review findings resolved.**

## Durable handles

- `marker: $HOME/.claude/autonomous-active/autonomous-task-redesign-v2-v0`
- `worktree: /Users/brunomaurino/projects/codirity/.claude/worktrees/redesign-v2-v0`
- `worktree_entry: name`
- `cron: (none)`
- `battery_run_id: wf_d22cfc77-4da`
