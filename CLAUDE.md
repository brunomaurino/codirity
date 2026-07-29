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

- **Brand colors**: "La Firma" forest palette (`brand-dark: #163F31`, `brand: #1E5C46`, `brand-light: #4E8D74`, paper background `#FAF7F1`; supporting `sage #DCE5DC`, rare `brass #B3873F`)
- **Fonts**: Outfit (headings/body), Space Mono (code/metrics)
- **Components**: Shadcn UI with custom styling (rounded-full buttons, rounded-3xl cards)
- **Icons**: Lucide React
