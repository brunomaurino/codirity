# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` - Start development server (http://localhost:3000)
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Tech Stack

- **Framework**: Next.js 16 with App Router
- **React**: 19.2 with React Compiler enabled (`reactCompiler: true` in next.config.ts)
- **Styling**: Tailwind CSS 4 (via @tailwindcss/postcss)
- **Language**: TypeScript (strict mode)
- **Linting**: ESLint 9 with next/core-web-vitals and next/typescript configs

## Project Structure

- `src/app/` - App Router pages and layouts
- `src/app/globals.css` - Global styles with Tailwind and CSS custom properties for theming
- `docs/design-system.md` - Design system documentation with component patterns and styling guidelines
- Path alias: `@/*` maps to `./src/*`

## Design System

Refer to `docs/design-system.md` for all styling decisions. Key points:

- **System (redesign v4, "The Number That Doesn't Move")**: the approved mockup at `docs/redesign-v4/approved-mockup.html` is the visual CONTRACT and `docs/HANDOFF-redesign-v4.md` §1 the spec. The brand green is the GROUND, not an accent: `ground #0A1712`, `ground-2 #10241B`, `paper #EDEDE6`, `chalk #F4F7F2`, `chalk-dim #A9B8AF`, `ink-dim #4C5B52`; `mint #6EE7A8` ONLY on live/interactive elements; `brass #C8A24A` ONLY on defensible numbers ON DARK (not AA as text on paper). SINGLE THEME — no dark mode, no `data-theme`; the `dark:` variant is neutralized until W6 sweeps the classes. Legacy `brand-*`/gray tokens survive as interim aliases only.
- **Fonts**: Apfel Grotezk, self-hosted (`src/fonts/`, OFL) — ONE family; Regular 400 body, Mittel 500 for ALL display. Hierarchy comes from SIZE, never weight: no 600/700 anywhere (`--font-weight-bold` remaps to 500; native `strong`/`b` pinned to 500).
- **Shape/motion**: pill buttons, 18px `.card-soft`; type scale `.d-xl/.d-lg/.d-md/.label/.lede` (the `.d-*` classes set font-size ONLY — display headings are `class="display d-md"`, since `.display` carries the leading and tracking); ground transitions via `.band-dl`/`.band-ld` (grounds never hard-cut); one entrance gesture (`.line` masked rise + `.fade`), house curve `--ease`; prices never animate
- **Components**: Shadcn UI with custom styling (rounded-full buttons, rounded-2xl/rounded-3xl cards)
- **Icons**: Lucide React
