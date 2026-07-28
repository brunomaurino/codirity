# HANDOFF — Codirity Redesign v2: "La Firma" (execution plan)

**Date:** 2026-07-28 · **Supersedes:** `docs/HANDOFF-redesign.md` (the Workbench — HALTED by
Bruno: the terminal/mono aesthetic read as AI-made) · **Direction:** **A — La Firma**, chosen by
Bruno 2026-07-28 from the direction-picker artifact. **Prod was reverted to the pre-redesign
state (`0fbcee8`) before this plan runs — no lead sees an unapproved direction again.**

---

## §0 — How to execute this plan

Same machinery as before: `/autonomous-bundle-loop docs/HANDOFF-redesign-v2.md`, or single
bundles via §3. One bundle = one PR. §2 is the durable status surface. Ground rules carried
forward unchanged: offer.ts as source of truth, server components by default, gates
`npm run lint` + `npx tsc --noEmit` + `npm run build`, script-stripped SSR verification,
maurino72 gh identity, **the §4 voice rules and §5 anti-slop gate of the v1 HANDOFF apply
verbatim** (they were never the problem — read them from `docs/HANDOFF-redesign.md` §4/§5).

**NEW MERGE POLICY — the visual checkpoint (the lesson of v1).** V0 opens its PR with
**auto-merge NOT armed** and posts screenshots (desktop + mobile, light + dark) for Bruno's
explicit visual approval; only after his OK does V0 merge and do the remaining bundles run with
the standing auto-merge authorization. One checkpoint at the first visual flip prevents another
five-PR miss. (Bundles after V0 inherit an approved system, so they auto-merge as before.)

## §1 — The concept: La Firma

Codirity should look like **the firm you'd trust your operation to**: established, warm, human —
an editorial, boutique professional-services register. Not a startup, not a terminal, not a
template. The 2026 trust language, confirmed by research: character serifs ("established without
feeling old"), warm paper neutrals, candid human photography, generous whitespace, numbers set
calmly with their sources.

Everything the v1 plan got RIGHT survives intact — the §4 voice, the honesty-by-construction
content (clients with `client`/`ours` tags, the sourced receipt, the week narrative, the six
verbatim asks, the no-list), the analytics funnel, decisions D1–D8 and the resolved storytelling
facts. **v2 re-dresses that content; it does not rewrite it.**

### The visual system (replaces v1 §1's three rules)

1. **Palette — bosque y papel.** The brand green GROWS UP instead of being replaced:
   - `forest` **#1E5C46** — primary brand: CTAs, links, section labels, key accents. Dark-mode
     counterpart: **#6DB894** (foreground uses), **#174635** (fills).
   - `paper` **#FAF7F1** — page background (light). Dark background: **#1A1D1B**.
   - `ink` **#22261F** — text (light). Dark text: **#ECEEE9**.
   - `sage` **#DCE5DC** — soft surfaces, tinted cards, dividers-with-weight. Dark: **#242B26**.
   - `brass` **#B3873F** — RARE accent (one highlight per screen at most; e.g. the founding
     offer). Never decorative spray.
   - The neon `#32CD32` family and the green-means-live dot system are RETIRED. Green is now a
     classic brand color used with restraint, not a status semantic.
2. **Typography — serif speaks, sans supports.** Display/headlines: **Fraunces** (via
   next/font/google, variable, `opsz` on) — every h1/h2/h3 and pull-quotes. Body/UI: **Outfit**
   stays (continuity + already loaded). **Space Mono is retired as a system voice** — allowed
   ONLY for tabular figures inside the receipt/pricing if tabular alignment genuinely needs it;
   nothing else. No terminal styling anywhere.
3. **Shape & depth — soft, warm, human.** Rounded corners return (cards 14–18px, buttons keep
   rounded-full), soft warm shadows (`shadow-[0_1px_2px_rgba(34,38,31,0.06),0_8px_24px_rgba(34,38,31,0.06)]`-class),
   NO hairline-square "artifact" grammar, no kanban/terminal vignettes, no status dots.
4. **People and warmth.** The design reserves real slots for photography (hero, About/people).
   Until Bruno supplies photos (decision D2), those slots hold warm sage-tinted compositions —
   NEVER stock people, NEVER AI-generated faces.
5. **Anti-AI-look checklist (additions to the v1 §5 gate, all enforced in review):** no
   monospace body/labels; no terminal/kanban mockups; no status dots; no hairline-box grids of
   identical cards; no neon accents; serif present in every section's heading; at least one
   asymmetric editorial layout per page (not everything centered).

## §2 — Bundle status surface

| Bundle | Scope | Depends on | Status | PR # | Merge SHA |
|---|---|---|---|---|---|
| **V0** | Foundation flip: palette tokens + Fraunces + shape system across ALL existing components (the whole-site re-skin, no structural change) · **visual checkpoint: NO auto-merge, Bruno approves screenshots** | — | [ ] pending | | |
| **V1** | Hero: editorial serif hero, warm composition, photo slot; kill any leftover vignette styling | V0 approved | [ ] pending | | |
| **VC** | Clients — "Already on the board" content re-mounted as warm editorial cards with honest `client`/`ours` labels | V0 | [ ] pending | | |
| **V2** | The receipt re-mounted as a calm, serif-headed comparison (same sourced figures + footnote) | V0 | [ ] pending | | |
| **V3** | The week narrative as an editorial timeline (same §3 text verbatim; no kanban board — the story carries it) | V0 | [ ] pending | | |
| **V4** | Asks + no-list as editorial Q→outcome layout (same approved copy) | V0 | [ ] pending | | |
| **V5** | Pricing warm rate presentation + guarantee (calculator still gated on D3/D5) | V0, decisions D3/D5 | [ ] pending | | |
| **V6** | FAQ deepen to ~12 (storytelling §7) + warm close | V0 | [ ] pending | | |
| **V7** | The people — real photos (gated on D2) | decision D2 | [ ] blocked on content | | |
| **V8** | Case studies (gated on D1) | decision D1 | [ ] blocked on content | | |

## §3 — Per-bundle launch commands

### §3.V0
```
/autonomous-task Redesign v2 Bundle V0 — La Firma foundation flip. Read docs/HANDOFF-redesign-v2.md §1 (the full visual system) and the v1 HANDOFF §4/§5 (voice + anti-slop, still binding). Implement the token flip across the whole site with NO structural/section changes: globals.css palette swap to forest/paper/ink/sage/brass (+ dark equivalents, both prefers-color-scheme and data-theme paths); Fraunces via next/font/google wired into every heading (SectionHeader h2, hero h1, card h3s); retire Space Mono as a system voice per §1.2; soft-shape pass per §1.3 (radius + warm shadows, remove hairline-square styling); update the theme-init script/OG colors if they hardcode old greens; check contrast (WCAG AA) for forest-on-paper and dark mode. The v1-era components currently in the tree are the PRE-redesign ones (prod was reverted) — the flip applies to THOSE. Gates: lint + tsc + build + SSR check + banned grep + §5 checklist + §1.5 anti-AI-look checklist + perf delta. OPEN THE PR WITH --no-merge AND post desktop+mobile, light+dark screenshots for Bruno's visual approval before any merge. --bundle-id 101 --plan-slug redesign-v2 --no-merge
```
*(V1–V8 briefs get written after V0 is APPROVED — the approved V0 system is their spec anchor.
Do not launch anything beyond V0 without Bruno's visual OK.)*

## §4 — Decisions Bruno owns (carried forward, unchanged)

| ID | Decision | Blocks | Status |
|---|---|---|---|
| D1 | 2–3 real case studies | V8 | open |
| D2 | Which engineers appear, with photos (now ALSO feeds the hero/people photo slots) | V7, hero photo | open |
| D3 | The guarantee | V5 | open |
| D4 | Publishable aggregate stats | proof content | open |
| D5 | Real capacity number in offer.ts | V5 | open |
| D6 | Client logos with permission | VC | clients named + framing approved (2026-07-28) |

## §5 — Measurement

Unchanged: the 12-event funnel is the baseline. The revert restores the exact pre-redesign
copy, so the funnel's baseline period continues uninterrupted while v2 is built.
