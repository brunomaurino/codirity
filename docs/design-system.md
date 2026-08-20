# Codirity Design System — v4, "The Number That Doesn't Move"

> This file was rewritten by **redesign-v4 Bundle W6**, the plan's retirement
> sweep. Everything it previously documented — the v3 "Monthly Club" system,
> Figtree and Instrument Serif, `.accent`, the blob/glass catalogue, the
> dark-mode pairing tables, the 700-weight type scale — describes code that no
> longer exists. It was kept as a rework reference through W1–W5 and its own
> banner promised this replacement; leaving it would have left `CLAUDE.md`
> routing every styling decision at a document describing deleted code.

**The authority is this file, plus `docs/HANDOFF-redesign-v4.md` §1 and the
approved mockup at `docs/redesign-v4/approved-mockup.html`.** Where the mockup
and this file disagree on a VISUAL matter, the mockup wins. Where either
disagrees with `src/config/offer.ts` on a FACTUAL matter, `offer.ts` wins.

---

## 1. The ground

The brand green **is the ground**, not an accent.

| Token | Value | Use |
|---|---|---|
| `--ground` | `#0A1712` | the dark ground — hero, proof, offer, close, footer |
| `--ground-2` | `#10241B` | the one quiet raised surface on dark (`.panel-deep`) |
| `--paper` | `#EDEDE6` | the light ground — the services/steps/founder/FAQ run |
| `--paper-2` | `#E2E2D9` | paper's raised twin |
| `--chalk` | `#F4F7F2` | primary text on dark |
| `--chalk-dim` | `#A9B8AF` | secondary text on dark (8.96:1) |
| `--chalk-faint` | `#7E8D85` | superseded-but-readable on dark (5.28:1) |
| `--ink` | `#0A1712` | primary text on paper (15.61:1) |
| `--ink-dim` | `#4C5B52` | secondary text on paper (6.10:1) |
| `--ink-faint` | `#606863` | de-emphasised-but-readable on paper (4.88:1) |
| `--mint` | `#6EE7A8` | **only** live/interactive elements |
| `--brass` | `#C8A24A` | **only** defensible numbers ON DARK (7.6:1). ≈2:1 on paper — never text on a light surface |

**Never use a dark-ground token on paper or vice versa.** W5 shipped `.lede`
(a `--chalk-dim` token) onto the paper run at **1.76:1**. Paper variants are
bound to the ground itself — `.paper .label`, `.paper .lede` — never remembered
at the call site.

**Measure contrast by compositing the FULL opacity chain over the real ground**,
not by reading the declared colour. Opacity compounds through ancestors: W4's
shipped chip stacked `.35` on a child's `.7` and landed at 1.7:1 while every
declared value looked fine. When something must recede but stay readable, give
it a `*-faint` colour — never stacked opacity.

Every new token must be aliased into `@theme inline`, or `text-<name>` is a
silent no-op (Tailwind v4 drops unknown theme colours rather than erroring).

## 2. Grounds never hard-cut

Bruno's explicit rule. Every dark↔light transition goes through a `.band`
gradient (`.band-dl` dark→paper, `.band-ld` paper→dark, ~30vh). The page is two
runs and TWO transitions:

```
hero · terms · queue · case studies · clients (dark) → band
  → what we build · how it works · founder · FAQ (paper) → band
  → ownership · close · footer (dark)
```

That order is the approved mockup's. The offer leads because the price IS the
argument; the proof answers "can they actually do it" after it, not before.

Sections that own a full-bleed ground are a **bare `<section>` + `data-ground` +
`.wrap-v4`** — never `.wrap-v4` nested inside a padded container, which doubles
the page gutter (W2's BLOCKER). Anything adjacent to a band must sit on
`--paper`, not `bg-white`, or the gradient lands on a colour the section is not.

## 3. Type

**One family: Apfel Grotezk** (Collletttivo, OFL 1.1, self-hosted at
`src/fonts/`). Regular 400 for body, **Mittel 500 for all display**.

**Hierarchy comes from SIZE, never weight.** No 600/700/800 exists: the
`--font-weight-bold`/`semibold`/`extrabold` remaps all resolve to 500, and
native `strong`/`b` are pinned to 500.

Scale: `.d-xl` `.d-lg` `.d-md` `.label` `.lede`.

> **The `.d-*` classes set `font-size` ONLY.** A display heading is written
> `class="display d-md"` — `.display` carries the leading and the tracking. W3
> shipped a heading without it and the block rendered ~65% taller.

Hand-set line breaks live in `offer.ts` and are **gated to rejoin** their source
string exactly (`w4-facts-gate.py`, `w6-close-gate.py`). Re-derive them for the
real strings and measure at the **gutter boundary** — the mockup's `ch` values
are calibrated for the mockup's own shorter copy, and `.wrap-v4` doubles its
padding at 900px, so a spot-check at 1280 and 375 sails past the band where
lines actually wrap.

## 4. Motion

One entrance gesture: the masked `.line` rise plus `.fade`, armed by a single
IntersectionObserver 450ms after load, on the house curve `--ease`
(`cubic-bezier(0.16, 1, 0.3, 1)`).

- **Prices never animate.** A number that wiggles reads as marketing; one that
  holds still reads as an invoice.
- The queue's Shipped counter is the ONE number allowed to change — there the
  number IS the mechanic, and it changes by discrete integer swap, never a
  count-up.
- Scroll-driven motion is **quantized**, never 1:1 scroll-linked. The tween
  belongs to CSS transitions.
- **Every degradation must land on the FINISHED state.** Killing a transition
  under `prefers-reduced-motion` or `scripting: none` without pinning the end
  state strands the content: W2 shipped a blank conversion band, W4 an invisible
  headline figure, W5 an undrawn strike. Check both media blocks.
- **An animation referencing undefined `@keyframes` dies silently** and no
  visual check can see it — a wipe that never ran looks identical to one that
  finished. `w4-css-gate.py` asserts site-wide that every referenced
  animation-name has matching keyframes.

## 5. Shape

Pill buttons (`border-radius: 999px`), 18px `.card-soft`, hairline rules at
`--rule` / `--rule-ink`. A control's boundary needs 3:1 against its ground
(WCAG 1.4.11) — the hairline rule token is ~1.4:1 and is NOT enough on its own.

## 6. Content

`src/config/offer.ts` is the single source of truth for every price, string,
FAQ entry and client fact. **Components compose from it and never hardcode.**

This is not a style preference. v3 shipped two fabrications about a real, named
client — a substituted noun and an invented sentence — past a gate that only
checked expected strings were PRESENT. Provenance checking is therefore
**bidirectional and exact**: every fact renders, and every rendered text run is
an exact member of the config's field set, scoped per owning entity, with no
length floor.

Where a section has no honest number, it gets none. Meshio has a state machine
instead of a metric; the page's proof is the price, the terms and the ownership
claim.

## 7. Gates

`scripts/w2-*` … `w6-*` are the mechanical coverage. Two rules govern them:

1. **A gate you have never seen FAIL is not evidence.** Mutate the input, watch
   it fail, then trust it.
2. **`GATE ARMED` from a self-test is not certification.** A self-test probes
   only the failure modes its author already imagined — W4's passed 10/10 while
   the gate had four holes an adversarial review then demonstrated live. The
   review certifies; the self-test prevents regressions.

Nothing invokes them automatically. Wiring `npm test` + CI over `scripts/` is
the highest-leverage change available on this repo.

## 8. Components

Shadcn primitives with custom styling; Lucide icons. `Section`'s variants are a
v3 survivor — `default` now paints `--paper` and `ink` paints the v4 ground.
New v4 sections do not use it (see §2).

## 9. Commands

```bash
npm run dev     # http://localhost:3000
npm run build
npm run lint
```
