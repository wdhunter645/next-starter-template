# Architecture Overview

This document highlights the key structural patterns in the Next.js starter template so that new contributors can quickly orient themselves.

## High-Level Summary

- **Framework baseline** – The template ships with Next.js 15, React, TypeScript 5, and Tailwind CSS 4 configured for Cloudflare Pages deployments. 【F:README.md†L1-L109】【F:package.json†L1-L78】
- **App Router layout** – Global UI chrome is composed in `src/app/layout.tsx`, which wires in the header, a join call-to-action, and the footer around all routed content. 【F:src/app/layout.tsx†L1-L29】
- **Homepage composition** – The landing page stitches together dedicated feature sections such as the weekly matchup, social wall, milestone teaser, and events calendar via modular React components. 【F:src/app/page.tsx†L1-L45】

## Core UI Building Blocks

| Concern | Implementation Notes |
| --- | --- |
| **Navigation** | `Header` renders a fixed banner with a responsive hamburger toggle and brand logo sourced from the public assets. 【F:src/components/Header.tsx†L1-L36】 |
| **Weekly matchup** | `WeeklyMatchup` delivers a static voting layout styled by `src/styles/weekly.css`, including accessible hidden text for results. 【F:src/components/WeeklyMatchup.tsx†L1-L44】【F:src/styles/weekly.css†L1-L82】 |
| **Membership CTA** | `JoinLogin` shows primary and secondary actions that deep-link to member onboarding routes. 【F:src/components/JoinLogin.tsx†L1-L18】 |
| **Community feed** | `SocialWall` dynamically loads the Elfsight script, surfaces loading and error states, and exposes a fallback message if the script fails. 【F:src/components/SocialWall.tsx†L1-L52】 |
| **Events** | `EventsCalendar` derives a monthly grid, highlights mocked events, and links through to a full calendar page. 【F:src/components/EventsCalendar.tsx†L1-L94】 |
| **Footer** | `Footer` pulls metadata from environment variables and `package.json` to show deployment context alongside key policy links. 【F:src/components/Footer.tsx†L1-L39】 |

## Styling Conventions

- Global resets and design tokens live in `src/app/globals.css` and `src/styles/variables.css`, while most components rely on colocated CSS modules for encapsulated styling. 【F:src/app/globals.css†L1-L51】【F:src/styles/variables.css†L1-L12】
- Shared utility styles (e.g., the weekly matchup grid) stay in the `src/styles/` folder and are imported where needed. 【F:src/components/WeeklyMatchup.tsx†L1-L44】【F:src/styles/weekly.css†L1-L82】

## Testing and Tooling

- Vitest is configured with a jsdom environment, global APIs, and module aliasing for `@` to point at `src`. 【F:vitest.config.ts†L1-L18】
- `src/components/__tests__/SampleComponent.test.tsx` demonstrates Testing Library usage against the client-side `SampleComponent`. 【F:src/components/__tests__/SampleComponent.test.tsx†L1-L25】【F:src/components/SampleComponent.tsx†L1-L18】
- The root `package.json` surfaces scripts for local development, Cloudflare-aligned builds, linting, formatting, typing, and test automation. 【F:package.json†L38-L77】

Use this overview alongside `docs/START_HERE.md` and the component source files to dig deeper into specific areas of the template. 【F:docs/START_HERE.md†L1-L165】
