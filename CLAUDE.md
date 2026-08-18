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

- **Brand colors**: "Monthly Club" palette (`brand-dark: #0F6B3D`, `brand: #127A44`, `brand-light: #3F8A68`, paper background `#EBEBE4`, ink `#0A0A08`; supporting `sage #F5F5F0`, rare `brass #8B5A16`; dark mode repoints these — see `src/app/globals.css` `[data-theme="dark"]`)
- **Fonts**: Figtree (headings/body/everything — one family, weight carries the hierarchy), Instrument Serif Italic (`.accent` utility, one word per headline only)
- **Shape**: pill buttons, 16-22px card radius (`.card-soft`), blob-gradient utilities (`.blob-1`-`.blob-4`), glassmorphic dark card (`.glass-dark`)
- **Components**: Shadcn UI with custom styling (rounded-full buttons, rounded-2xl/rounded-3xl cards)
- **Icons**: Lucide React
