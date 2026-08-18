# Codirity Design System

> Design style guide for building consistent UI components with Shadcn and Tailwind CSS.
>
> **Palette: "Monthly Club" (redesign v3, since 2026-08-18).** Values below are
> the LIGHT-mode tokens actually shipped in `src/app/globals.css` (source of
> truth — this doc is a readable mirror of it, not the reverse). Dark mode
> repoints most of these; see `[data-theme="dark"]` in that file for the exact
> dark values, since several (the greens especially) are NOT simple inversions
> — they're independently contrast-tuned for their own background.

---

## Brand Colors

### Primary Palette

```css
/* Green - Primary Brand Color (light mode) */
--green-dark: #0F6B3D      /* Dark green for text, dark backgrounds, .accent */
--green-main: #127A44      /* Primary actions, CTAs, accents */
--green-light: #3F8A68     /* Highlights, gradients, hover states */

/* Neutrals — warm, faint-green-biased (not a stark white/gray ramp) */
--paper: #EBEBE4           /* page background */
--ink: #0A0A08             /* primary text */
--sage: #F5F5F0            /* raised-surface tint */
--brass: #8B5A16           /* rare accent — currently only .blob-2 consumes it */
```

### Tailwind Config

Colors are wired via CSS custom properties in `src/app/globals.css`'s
`@theme inline` block, not a `tailwind.config.js` — Tailwind v4 reads
`--color-*` tokens directly from CSS. The token → utility mapping:

```css
--color-brand-dark: var(--green-dark);   /* bg-brand-dark, text-brand-dark, border-brand-dark */
--color-brand: var(--green-main);        /* bg-brand, text-brand, border-brand */
--color-brand-light: var(--green-light); /* bg-brand-light, text-brand-light */
--color-ink: var(--ink);                 /* text-ink */
--color-paper-raised: var(--paper-raised); /* bg-paper-raised */
```

Tailwind's own `gray-50…900` keywords are ALSO repointed (see `--gray-*` in
`globals.css`) onto the same warm-neutral hue family, so `bg-gray-50` etc.
already read as part of this palette without a class rename.

### Usage Guidelines

| Use Case | Color | Tailwind Class |
|----------|-------|----------------|
| Primary buttons | `#127A44` | `bg-brand` |
| Button hover | `#0F6B3D` | `hover:bg-brand-dark` |
| Links | `#127A44` | `text-brand` |
| Success states | `#127A44` | `text-brand` |
| Accent borders | `#127A44` | `border-brand` |
| Subtle backgrounds | `rgba(18,122,68,0.08)` | `bg-brand-pale` |
| Focus rings | `#127A44` | `ring-brand` |

---

## Typography

### Font Family

One family for everything — weight carries the hierarchy, not a font swap
(mirrors designjoy.co's own one-family discipline). Wired via `next/font/google`
in `src/app/layout.tsx`, not a Tailwind config block:

```css
--font-sans: var(--font-figtree), system-ui, sans-serif;
--font-serif: var(--font-figtree), system-ui, sans-serif;  /* repointed, not deleted */
--font-mono: var(--font-figtree), system-ui, sans-serif;   /* repointed, not deleted */
--font-accent: var(--font-instrument-serif), Georgia, serif;
```

**Primary Font:** Figtree (headings, body, nav, labels — everything)
**Expressive accent:** Instrument Serif Italic, via the `.accent` utility
(`@layer components` in `globals.css`) — NOT the auto-generated `font-accent`
utility, which only sets the family with no italic/color. Apply `.accent` to
exactly ONE word inside a heading, never a whole heading or body copy; pair it
with an explicit `text-*` utility when the surface isn't paper (`.accent`'s
default green tint is meant to be overridden on dark/blob surfaces).

### Type Scale

| Element | Size | Weight | Tracking | Class |
|---------|------|--------|----------|-------|
| H1 | 3.5rem - 4.5rem | 800 | -2.5px | `text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tighter` |
| H2 | 2.25rem - 3rem | 700 | -1.5px | `text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight` |
| H3 | 1.25rem - 1.5rem | 700 | -0.5px | `text-xl md:text-2xl font-bold` |
| Body | 1rem - 1.1rem | 400 | normal | `text-base md:text-lg` |
| Small | 0.875rem | 500 | normal | `text-sm font-medium` |
| Label | 0.75rem | 700 | 3px | `text-xs font-bold uppercase tracking-widest` |
| Mono/Metrics | varies | 700 | normal | `font-mono font-bold` |

### Text Colors

```jsx
// Primary text
<p className="text-gray-900 dark:text-white">

// Secondary text
<p className="text-gray-600 dark:text-gray-400">

// Muted text
<p className="text-gray-500 dark:text-gray-500">

// Brand accent text
<p className="text-brand">
```

---

## Spacing & Layout

### Container

```jsx
<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
```

### Section Padding

```jsx
// Standard section
<section className="py-16 md:py-24 lg:py-28 px-4 md:px-8">

// Compact section
<section className="py-12 md:py-16 px-4 md:px-8">
```

### Common Spacing

| Purpose | Value | Class |
|---------|-------|-------|
| Card padding | 24-40px | `p-6 md:p-10` |
| Element gap | 16-24px | `gap-4 md:gap-6` |
| Section gap | 64-80px | `space-y-16 md:space-y-20` |
| Grid gap | 24px | `gap-6` |

---

## Components

### Buttons

#### Primary Button

```jsx
<Button className="bg-brand hover:bg-brand-dark text-white font-semibold px-6 py-3 rounded-full transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-brand/20">
  Contact Us
  <ArrowRight className="ml-2 h-5 w-5" />
</Button>
```

#### Secondary Button

```jsx
<Button variant="outline" className="border-gray-200 hover:border-brand hover:text-brand hover:bg-brand/[0.08] font-medium px-6 py-3 rounded-full transition-all duration-300">
  Learn More
</Button>
```

#### Ghost Button

```jsx
<Button variant="ghost" className="text-brand hover:bg-brand/[0.08] font-semibold">
  View Details
  <ArrowRight className="ml-1 h-4 w-4" />
</Button>
```

### Cards

#### Standard Card

```jsx
<Card className="bg-white border border-gray-200/60 rounded-3xl p-6 md:p-8 shadow-sm hover:shadow-xl hover:border-brand/30 hover:-translate-y-2 transition-all duration-400">
  <CardContent>
    {/* Content */}
  </CardContent>
</Card>
```

#### Featured Card (Dark)

```jsx
<Card className="bg-gradient-to-br from-brand-dark to-[var(--blob-forest)] text-white border-0 rounded-3xl p-8 md:p-10">
  <CardContent>
    {/* Content */}
  </CardContent>
</Card>
```

#### Card with Top Accent

```jsx
<Card className="bg-white border border-gray-200/60 rounded-3xl overflow-hidden">
  <div className="h-1 bg-gradient-to-r from-brand-dark via-brand to-brand-light" />
  <CardContent className="p-6 md:p-8">
    {/* Content */}
  </CardContent>
</Card>
```

### Inputs

```jsx
<Input
  className="bg-gray-50 border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:border-brand focus:ring-2 focus:ring-brand/20 focus:bg-white transition-all duration-300"
  placeholder="Enter your email"
/>
```

### Select

```jsx
<Select>
  <SelectTrigger className="bg-gray-50 border-gray-200 rounded-xl px-4 py-3 focus:border-brand focus:ring-2 focus:ring-brand/20">
    <SelectValue placeholder="Select option" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="option1">Option 1</SelectItem>
  </SelectContent>
</Select>
```

### Badges

```jsx
// Brand badge
<Badge className="bg-brand/[0.08] text-brand-dark border border-brand/20 rounded-full px-4 py-1.5 font-semibold text-sm">
  <span className="w-2 h-2 bg-brand rounded-full mr-2 animate-pulse" />
  New Feature
</Badge>

// Neutral badge
<Badge variant="secondary" className="bg-gray-100 text-gray-600 rounded-full">
  Coming Soon
</Badge>
```

### Icons

Use **Lucide React** icons with these standard sizes:

```jsx
// Small (inline with text)
<Icon className="h-4 w-4" />

// Medium (buttons, list items)
<Icon className="h-5 w-5" />

// Large (feature icons)
<Icon className="h-6 w-6" />

// Feature card icons
<div className="w-14 h-14 bg-gradient-to-br from-brand/[0.08] to-brand/[0.12] rounded-2xl flex items-center justify-center">
  <Icon className="h-7 w-7 text-brand" />
</div>
```

---

## Effects & Animations

### Shadows

Defined as `--shadow-*` CSS custom properties in `globals.css` (light + dark
variants), not a `tailwind.config.js` block:

```css
--shadow-xs: 0 1px 2px rgba(10, 10, 8, 0.05);
--shadow-sm: 0 2px 8px rgba(10, 10, 8, 0.06);
--shadow-md: 0 4px 16px rgba(10, 10, 8, 0.07);
--shadow-lg: 0 12px 32px rgba(10, 10, 8, 0.09);
--shadow-xl: 0 24px 48px rgba(10, 10, 8, 0.1);
--shadow-green: 0 8px 24px rgba(18, 122, 68, 0.18);  /* rgb of --green-main #127a44 */
```

### Transitions

```jsx
// Standard transition
className="transition-all duration-300"

// Smooth easing
className="transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]"

// Hover lift effect
className="hover:-translate-y-1 hover:shadow-lg transition-all duration-300"
```

### Focus States

```jsx
// Input focus
className="focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"

// Button focus
className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
```

### Animations

```css
/* Pulse dot */
@keyframes pulse-dot {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.2); opacity: 0.8; }
}

/* Float */
@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

/* Slide up (for reveals) */
@keyframes slide-up {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
```

---

## Shape System

Utility classes in `globals.css` (`@layer components`), not yet wired into any
component markup as of V0 (V1+ apply them where the section brief calls for
them):

```jsx
// Pill button
className="btn-pill"  // border-radius: 9999px — same as rounded-full

// Soft card radius (16-22px band)
className="card-soft"  // 18px

// Blob-gradient background — 4 distinct combinations, CSS only, no images.
// Each carries a built-in dark scrim so white text stays legible anywhere
// inside it; use white/near-white text on all four.
className="blob-1"  // gold + mint + green-dark, radial stack
className="blob-2"  // mint + brass, radial stack
className="blob-3"  // amber + green-main, radial stack (reversed base)
className="blob-4"  // gold → mint → green conic sweep

// Glassmorphic dark card (reserved for the pricing card)
className="glass-dark"  // backdrop-filter: blur(6px) + translucent near-black bg
```

---

## Layout Patterns

### Bento Grid

```jsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {/* Featured card spans 2 columns and 2 rows */}
  <Card className="md:col-span-2 md:row-span-2">
    {/* Content */}
  </Card>
  <Card>{/* Content */}</Card>
  <Card>{/* Content */}</Card>
</div>
```

### Two Column with Sticky Sidebar

```jsx
<div className="grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-8 lg:gap-16 items-start">
  <div className="lg:sticky lg:top-32">
    {/* Sidebar content */}
  </div>
  <div>
    {/* Main content */}
  </div>
</div>
```

### Process Grid (blob-card pattern, redesign v3 Bundle V2)

Replaces the earlier numbered-circle + connecting-line pattern below — each
step is now a full `.blob-*` card, not a circle floating on a plain
background, so there's no line to connect (the cards themselves carry the
visual weight and each gets its own distinct blob per HANDOFF §1.3):

```jsx
<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
  {steps.map((step, i) => (
    <div key={step.number} className="reveal">
      <ProcessStep
        number={step.number}
        title={step.title}
        description={step.description}
        blobClass={STEP_BLOBS[i % STEP_BLOBS.length]}
      />
    </div>
  ))}
</div>
```

`ProcessStep` itself: `.blob-N card-soft h-full min-h-[280px] p-8 md:p-10`,
full-opacity white text throughout (a blob's dark scrim is tuned for
full-opacity text — reduced-alpha text on top of it can drop below WCAG AA).
`md:grid-cols-3` (not `sm:`) — 3 equal columns plus this padding at the
640-767px band squeezed text too narrow; deferring to `md:` (768px) removes
that band.

### Pill Cloud (redesign v3 Bundle V3)

For scope/category data with no natural checklist structure — extrapolated
from Designjoy's own tag-cloud block (HANDOFF §1) rather than a literal
mockup. Reuses `<Badge>`, not hand-rolled classes, so a future Badge
restyle propagates here automatically:

```jsx
<ul className="flex flex-wrap justify-center gap-3 list-none">
  {items.map((item) => (
    <li key={item}>
      <Badge size="lg">{item}</Badge>
    </li>
  ))}
</ul>
```

A sibling "not in scope" list next to a pill cloud should stay a PLAIN list
(no pill styling) — decorating what's explicitly out of scope like a
feature highlight undercuts the honesty the plain treatment is meant to
signal. Use `text-gray-600` for that list's text, not `text-gray-500` —
`-500` on this section's `bg-gray-50` measures under WCAG AA (4.09:1);
`-600` clears it (6.17:1) per this doc's own "Body text on paper: gray-600
minimum" rule below.

---

## Dark Mode

### Color Mapping

| Element | Light Mode | Dark Mode |
|---------|------------|-----------|
| Background | `#EBEBE4` (paper) | `#1C1C18` |
| Surface | `gray-50` | `gray-800` |
| Border | `gray-200` | `gray-700` |
| Text primary | `gray-900` | `white` (`--white` is pure `#ffffff` in BOTH themes — see the note in `globals.css`) |
| Text secondary | `gray-600` | `gray-400` |
| Brand (`--green-dark`) | `#0F6B3D` | `#125E3A` |
| Brand (`--green-main`) | `#127A44` | `#2F7A52` |

Dark mode's brand greens are NOT the light-mode values lifted for legibility —
they're independently tuned so `bg-brand text-white` (buttons, badges,
`::selection`) clears WCAG AA as a SURFACE under white text, which is a
different constraint than `text-brand` on paper. Don't derive one from the
other; read both from `globals.css` directly.

### Implementation

```jsx
// Background
className="bg-white dark:bg-gray-900"

// Card
className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"

// Text
className="text-gray-900 dark:text-white"
className="text-gray-600 dark:text-gray-400"
```

### Permanently-dark surfaces (the ink band)

Every pattern above assumes the element sits on the PAGE GROUND, which flips with
the theme. Two surfaces don't flip — they are dark in both themes: the footer, and
the closing CTA band (`<Section variant="ink">`, the site's one deliberate
contrast beat per `HANDOFF-redesign-v3.md` §1 rule 4; don't add a second one).

On those, `text-gray-900 dark:text-white` is **wrong and invisible**: in LIGHT
mode `text-gray-900` resolves to `#0a0a08`, which is the band's own background.
Foregrounds there are pinned light in both themes instead:

| Role | On the ink band |
|---|---|
| Heading | `text-white` (or `<SectionHeader tone="ink">`, which pins all three) |
| Body / secondary | `text-gray-300` (the gray ramp is NOT inverted in dark mode) |
| Accent, links, eyebrow | `text-brand-light` — 4.76:1 light / 11.54:1 dark, i.e. only 0.26 over AA in light mode; re-measure if that token ever changes |
| Primary control | a white pill with `text-gray-900` ON it (19.81:1) |

`.accent` needs special care: it declares its own `color`, which BEATS an
inherited one, so an accented word inside a white heading renders green on the
band (~3.01:1). Pass the colour explicitly — `<AccentWord … className="text-white" />`.

---

## Responsive Breakpoints

```js
// Tailwind defaults
sm: '640px'   // Mobile landscape
md: '768px'   // Tablet
lg: '1024px'  // Desktop
xl: '1280px'  // Large desktop
2xl: '1536px' // Extra large
```

### Mobile-First Approach

```jsx
// Example: Card grid
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">

// Example: Padding
<section className="px-4 md:px-8 lg:px-16 py-12 md:py-20 lg:py-28">

// Example: Typography
<h1 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl">
```

---

## Accessibility

### Focus Indicators

Always use visible focus states:

```jsx
className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
```

### Color Contrast

- Body text on paper: `gray-600` minimum (4.5:1 ratio)
- Headings on paper: `gray-900` (16.5:1 ratio)
- Brand green on paper: Use `brand-dark` for text (5.5:1 ratio) — plain `brand`
  also clears AA at 4.5:1 but with less margin; `brand-light` does NOT clear
  AA as text on paper (it's a hover/gradient-stop color, not a text color)

### Interactive Elements

- Minimum touch target: 44x44px
- Always include hover AND focus states
- Use `aria-label` for icon-only buttons

---

## File Structure

```
src/
├── components/
│   ├── ui/           # Shadcn components
│   ├── layout/       # Header, Footer, Section
│   ├── forms/        # ContactForm, NewsletterForm
│   └── sections/     # Hero, Services, Process, etc.
├── styles/
│   └── globals.css   # Custom CSS, animations
├── lib/
│   └── utils.ts      # cn() helper, etc.
└── app/
    └── globals.css   # Tailwind imports
```

---

## Quick Reference

### Common Class Combinations

```jsx
// Primary CTA button
"bg-brand hover:bg-brand-dark text-white font-semibold px-6 py-3 rounded-full transition-all duration-300 hover:-translate-y-0.5 hover:shadow-brand"

// Card with hover effect
"bg-white border border-gray-200/60 rounded-3xl p-6 shadow-sm hover:shadow-xl hover:border-brand/30 hover:-translate-y-2 transition-all duration-400"

// Section label
"text-xs font-bold uppercase tracking-widest text-brand font-mono"

// Icon container
"w-14 h-14 bg-gradient-to-br from-brand/[0.08] to-brand/[0.12] rounded-2xl flex items-center justify-center"

// Input field
"bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:border-brand focus:ring-2 focus:ring-brand/20 focus:bg-white transition-all"

// Gradient text
"bg-gradient-to-r from-brand-dark via-brand to-brand-light bg-clip-text text-transparent"
```

---

*Last updated: 2026-08-18 (redesign v3 Bundle V3 — services pill cloud; also carries V0's "Monthly Club" palette flip and V2's blob-card Process pattern)*
