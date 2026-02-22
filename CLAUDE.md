# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Mesulive (mesu.live) is a Korean-language web app providing simulators and expected value calculators for MapleStory game systems. It covers three main features: bonus stat calculator, potential calculator, and starforce simulator.

## Commands

```bash
pnpm dev:next          # Start Next.js dev server
pnpm dev:storybook     # Start Storybook on port 6006
pnpm dev               # Start both concurrently
pnpm build             # Production build (generates ads.txt first)
pnpm lint              # ESLint
pnpm type-check        # TypeScript type checking (tsc --noEmit)
pnpm test              # Run all tests (vitest run)
npx vitest run path/to/file.test.ts  # Run a single test file
```

## Architecture

**Framework:** Next.js 15 (App Router) + React 18 + TypeScript, deployed on Vercel.

### Directory Structure

```
src/
├── app/                        # Next.js App Router pages & layouts
│   ├── (bonus-stat-calc)/      # /calc/bonus-stat route group
│   ├── (potential-calc)/       # /calc/potential route group
│   ├── (starforce-simulator)/  # /sim/starforce route group
│   ├── api/trpc/               # tRPC API endpoint
│   └── _components/            # App-level components & providers
├── entities/                   # Domain logic (types, constants, utils)
│   ├── bonus-stat/
│   ├── equip/
│   ├── game/
│   ├── potential/              # Most complex entity
│   ├── starforce/
│   └── stat/
├── features/                   # Feature implementations
│   ├── trpc/                   # tRPC server setup & routers
│   └── get-potential-data/     # Potential data fetching
└── shared/                     # Cross-cutting utilities
    ├── ui/                     # Custom component wrappers
    ├── style/                  # Colors, breakpoints, cx utility
    ├── math/                   # Math utilities & hooks
    └── fp/                     # Functional programming helpers
```

### Key Patterns

- **Entity-driven architecture:** Business logic lives in `entities/`, features in `features/`, shared utils in `shared/`. This is a layered architecture — entities should not import from features or app.
- **State management:** Jotai atoms for local/global UI state, React Query (via tRPC) for server state. Bunshi for scoped atom management.
- **tRPC:** End-to-end type-safe API layer connecting Next.js API routes to Prisma/PostgreSQL.
- **Functional programming:** Uses fp-ts (Option, Either), ts-pattern for pattern matching, lodash-es for utilities.
- **Provider hierarchy:** MotionProvider > JotaiProvider > HeroUIProvider > QueryProvider > OverlayProvider > MainLayout.

### UI Component Rules

- **Do not import** `Button`, `Checkbox`, `CheckboxGroup`, `Modal`, `ModalHeader`, `Radio`, `RadioGroup`, `Select`, `Input` directly from `@heroui/react`. Use the custom wrappers from `~/shared/ui` instead (enforced by ESLint).
- `layout.tsx` and `page.tsx` files must use function declarations (not arrow functions).
- Path alias: `~/*` maps to `./src/*`.

### Database

PostgreSQL via Prisma. Schema is in `prisma/schema.prisma`, focused on potential system data tables.

## Tech Stack Quick Reference

| Layer | Technology |
|-------|-----------|
| UI Components | HeroUI + custom wrappers in `~/shared/ui` |
| Styling | Tailwind CSS (Pretendard font, custom MapleStory colors) |
| Charts | Highcharts |
| Animations | Framer Motion |
| Modals/Drawers | overlay-kit, vaul |
| Validation | Zod |
| Testing | Vitest + @testing-library/react |
| Component Dev | Storybook |
| Package Manager | pnpm |
