# Lou Gehrig Fan Club — Next.js Framework Starter

This repository contains the **public website** for the **Lou Gehrig Fan Club (LGFC)**, implemented as a Next.js application and deployed to **Cloudflare Pages** using a static export build.

It is also the canonical baseline for future LGFC sites that share the same architecture and governance model.

---

## 1. Overview

- **Project:** Lou Gehrig Fan Club — Public Website
- **Framework:** Next.js (App Router) with TypeScript
- **Hosting:** Cloudflare Pages (static export)
- **Primary Audience:** Fans, visitors, and prospective members at `www.lougehrigfanclub.com`
- **Related Systems:**
  - Members/Admin area is hosted in a **separate repository** (Vercel).
  - Supabase (database) and Backblaze B2 (media) are part of the wider LGFC architecture and integrated via API from this and other repos.

This repository focuses on:

- The **public-facing homepage and spokes** (Weekly Matchup, Milestones, Charities, News & Q&A, Calendar, Join).
- A **strictly controlled deployment pipeline** to Cloudflare Pages.
- A **documented design standard** that must remain in sync with the code.

For a full visual and functional specification, see:

- `docs/Design-spec.md` (LGFC website design)
- `docs/lgfc-homepage-legacy-v6.html` (homepage structure standard)

---

## 2. Quick Start for Contributors

If you are working on the LGFC website, start here:

- **Getting started & environment setup:**
  - `docs/START_HERE.md`

- **Deployment details (Cloudflare Pages):**
  - `docs/DEPLOYMENT_GUIDE.md`

- **Website development process / governance:**
  - `docs/website-PR-process.md`
  - `docs/website-PR-governance.md`

These documents define:

- How to open PRs
- Required checks before merge
- Rollback expectations
- How to keep the implementation aligned with the design spec

---

## 3. Security Notice

If you cloned or used this repository before **October 16, 2025**, be aware:

> A `.env` file containing secrets was accidentally committed in a historical revision and has since been removed.  
> Any exposed credentials must be considered compromised.

If you used any of those credentials, you **must**:

- Rotate keys for affected services (Cloudflare, Supabase, B2, etc.).
- Update the secure environment variables in the Cloudflare and GitHub settings as described in `docs/DEPLOYMENT_GUIDE.md`.

All current deployments and contributors should assume **only** the new rotated credentials are valid.

---

## 4. Architecture Summary

At a high level, this repo provides:

- A **Next.js front-end** using the App Router and static export.
- A **Cloudflare Pages** deployment target configured for:
  - `npm run build:cf` to generate a static build
  - Automatic deployment via GitHub Actions when code is merged to `main`
- A **document-driven design contract**:
  - Global website design: `docs/Design-spec.md`
  - Homepage standard: `docs/lgfc-homepage-legacy-v6.html` (versioned baseline)

The members/admin application lives in another repo and is hosted separately (typically on Vercel). This repo remains focused on the **public site**.

---

## 5. Development Setup

### 5.1 Using GitHub Codespaces (Recommended)

This repository is optimized for GitHub Codespaces.

- Click the **"Code" → "Open with Codespaces"** button in GitHub.
- Follow the instructions in `docs/START_HERE.md` for:
  - Git authentication
  - Node version management
  - First-time setup

### 5.2 Local Development

If you prefer local development:

1. Install dependencies:

   ```bash
   npm install
   ```

2. Start the dev server:

   ```bash
   npm run dev
   ```

3. Open `http://localhost:3000` in your browser.

The main homepage entry file is typically `src/app/page.tsx`. When running `npm run dev`, changes will live-reload.

---

## 6. Commands & Workflow

This project supports both `npm` scripts and `make` commands. Either approach is fine, but **Makefile workflows** are encouraged for consistency.

### 6.1 npm Scripts (common)

- `npm run dev` — Start Next.js development server
- `npm run build` — Build production site
- `npm run build:cf` — Build static site for Cloudflare Pages
- `npm run lint` — Run ESLint
- `npm run lint:fix` — Lint and auto-fix
- `npm run format` — Format code with Prettier
- `npm run typecheck` — TypeScript checks
- `npm run test` — Run tests (Vitest)
- `npm run test:watch` — Tests in watch mode
- `npm run test:coverage` — Tests with coverage

### 6.2 Makefile Shortcuts

The `Makefile` wraps common tasks:

- `make dev` — Start dev server
- `make build` — Production build
- `make deploy` — Deploy to Cloudflare Pages
- `make lint` — Lint code
- `make format` — Format code
- `make typecheck` — TypeScript checks
- `make test`, `make test-watch`, `make test-coverage` — Test workflows

Run `make help` to see all available commands.

---

## 7. Deployment (Cloudflare Pages)

This repository is configured to deploy to **Cloudflare Pages** when changes are merged into `main` and the CI pipeline passes.

For complete deployment details (including required GitHub secrets and Cloudflare configuration), see:

- `docs/DEPLOYMENT_GUIDE.md`

In short:

- The build step uses `npm run build:cf` to generate a static export.
- GitHub Actions takes care of building and publishing to Cloudflare Pages.
- Required secrets (API token, account ID, project name, etc.) must be configured in GitHub.

---

## 8. Design & Homepage Standards

The LGFC project uses **documented design contracts**:

- Overall website design:
  - `docs/Design-spec.md`

- Homepage structure and content order (baseline spec):
  - `docs/lgfc-homepage-legacy-v6.html`

Any changes to homepage layout, section order, or major visual structure **must**:

1. Update the relevant spec document.
2. Ensure the implementation (e.g. `src/app/page.tsx`) aligns with the spec.
3. Follow the PR governance rules so that drift between design and implementation is minimized.

---

## 9. Contributing & Governance

For contributors working specifically on the LGFC website:

- **PR Process:**
  - `docs/website-PR-process.md`

- **Governance & Rollback Rules:**
  - `docs/website-PR-governance.md`

These documents define:

- How to propose changes
- Required checks (lint, tests, visual alignment)
- Rollback and incident handling expectations
- How to keep the repo compliant with LGFC's long-term design and operations strategy

Before opening a PR, make sure you:

1. Read `docs/START_HERE.md`.
2. Follow the commit & branch naming guidance in the PR process docs.
3. Run the recommended `make` or `npm` commands (lint, typecheck, tests) locally or in Codespaces.

---

## 10. License / Ownership

This repository is part of the **Lou Gehrig Fan Club** project and is intended for use in building and maintaining the LGFC public website.

If you are evaluating this as a "starter template," treat it as a **reference implementation** rather than a generic drop-in boilerplate, and be aware that some documentation and workflows are specifically tailored to the LGFC environment.
