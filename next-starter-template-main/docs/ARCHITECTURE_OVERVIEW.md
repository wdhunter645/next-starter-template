# Architecture Overview

This document summarizes the layout of the Next.js starter template so new contributors can quickly understand how the major pieces fit together. It complements the feature specifications under `docs/` and the inline documentation inside each module.

## Technology stack

- **Framework**: Next.js 15 with the App Router enabled and the Edge runtime for pages that can run on Cloudflare Pages.
- **Language**: TypeScript 5 with strict type-checking, ESLint, and Prettier integration.
- **Styling**: Tailwind CSS 4 paired with a small collection of custom CSS files for more specialized layouts.
- **Testing**: Vitest and @testing-library/react for component-level unit tests.

## Project layout

```
src/
  app/
    layout.tsx           # Shared shell for all routes
    page.tsx             # Landing page composition
    globals.css          # Global Tailwind and reset styles
  components/            # Reusable UI building blocks
  styles/                # Shared CSS outside of Tailwind
  lib/                   # Helper utilities (e.g., API clients)
  data/                  # Static JSON and fixtures surfaced in the UI
```

Important documentation lives alongside the code in `docs/`, and static assets (logos, icons, etc.) are kept in `public/`.

## App Router structure

- `src/app/layout.tsx` defines the global chrome (header, join/login prompt, footer) that wraps every page.
- `src/app/page.tsx` stitches together the landing page sections using component imports from `src/components/`.
- Additional routes are collocated underneath `src/app/` following Next.js conventions (e.g., `src/app/events/page.tsx`). Shared metadata is exported via the `metadata` object within these route files.

## Core components

Each UI section is encapsulated in its own React component with co-located styles and tests where necessary:

- **Header** (`src/components/Header.tsx`) renders the top navigation, responsive hamburger menu, and logo.
- **JoinLogin** (`src/components/JoinLogin.tsx`) displays prominent calls to action for prospective or returning members.
- **WeeklyMatchup** (`src/components/WeeklyMatchup.tsx`) presents a static matchup voting card backed by CSS grid utilities found in `src/styles/weekly.css`.
- **SocialWall** (`src/components/SocialWall.tsx`) hydrates the social feed by loading an external Elfsight script and gracefully handles loading or failure states.
- **EventsCalendar** (`src/components/EventsCalendar.tsx`) builds a monthly grid with highlighted events sourced from static data in `data/events.json`.
- **Footer** (`src/components/Footer.tsx`) shows site metadata, deployment information, and key policy links using values from environment variables and `package.json`.

## Styling conventions

- Tailwind is enabled globally; utility classes compose the majority of layout and typography.
- Shared CSS lives under `src/styles/` for cases where Tailwind utilities are insufficient (e.g., complex grid layouts).
- Variables and root-level resets are defined in `src/app/globals.css` and `src/styles/variables.css`.
- Component-specific styles should remain close to their React counterparts to encourage cohesion.

## Data and configuration

- Static JSON files live under `data/` and are imported directly into React components when needed.
- Environment variables for runtime configuration are declared in `env.d.ts` and read via `process.env` inside server components.
- The project exposes standard npm scripts in `package.json` for development (`npm run dev`), linting (`npm run lint`), formatting (`npm run format`), testing (`npm run test`), and type-checking (`npm run type-check`).

## Testing and quality

- Vitest is configured in `vitest.config.ts` with jsdom, module aliasing (`@` → `src`), and global test utilities (`vitest.setup.ts`).
- Example component tests live in `src/components/__tests__/`, demonstrating how to render React components and assert UI output.
- ESLint rules are defined in `eslint.config.mjs`, and formatting standards follow the Prettier configuration consumed by the lint workflow.

## Deployment workflow

- The template is pre-configured for Cloudflare Pages using Next.js's static export feature (`output: "export"` in `next.config.ts`).
- CI/CD automation relies on GitHub Actions definitions to build and deploy the static site from the `out/` directory.

Use this overview as a jumping-off point when exploring new features. The combination of route files, reusable components, and shared styles should make it straightforward to trace behavior from the UI down through supporting utilities.
