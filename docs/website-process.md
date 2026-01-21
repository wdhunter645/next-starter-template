# Website Pull Request Governance

**All PR prompts must follow this structure:**
1) Reference: `/docs/website-PR-process.md`
2) Change Summary: exact edits with file paths + (when applicable) line ranges from `/docs/homepage.html`
3) Governance Reference: `/docs/website-PR-governance.md`

---

## Runtime & Platform Policy
- Cloudflare Pages build: Next.js static export; no server functions.
- Node runtime: do not change Cloudflare’s Node runtime in PRs unless explicitly requested. (Current production build logs show Node 20; upgrade to 22 will be handled separately.)
- No Tailwind/PostCSS/framework swaps. Keep global CSS approach.

---

## Local Development Workflow

### Supported Development Modes

**For testing Cloudflare Pages Functions (LGFC-Lite runtime):**
- Command: `npm run dev:cf`
- What it does: Runs Wrangler Pages dev server with the built static output + Cloudflare Functions
- What it enables:
  - `/api/*` endpoints via `functions/api/*` (Cloudflare Pages Functions)
  - D1 database bindings
  - Full runtime environment matching Cloudflare Pages production
- When to use: Testing JOIN, LOGIN, member pages, or any feature that requires API endpoints

**For Next.js development (frontend only):**
- Command: `npm run dev` (or `next dev`)
- What it does: Runs Next.js development server with hot reload
- What it enables: Frontend development with instant hot module replacement
- Limitations: **Does NOT provide `/api/*` endpoints** (no Cloudflare Functions in Next.js dev mode)
- When to use: Frontend-only changes (styling, layout, components) that don't require API calls

### Important Notes

**Static Export Constraints:**
- Production uses `output: export` (static site generation)
- Next.js App Router API routes (`src/app/api/**/route.ts`) are **NOT compatible** with static export
- All runtime API logic must be in `functions/api/*` (Cloudflare Pages Functions)

**Development Workflow:**
1. Build static output: `npm run build:cf`
2. Test with Cloudflare runtime: `npm run dev:cf`
3. For frontend-only changes: `npm run dev` (but remember: no API endpoints available)

---

## Rollback Protocol
- If any PR causes a white-screen or layout regression, stop forward changes immediately.
- Roll back to last-known-good:
  - Cite the Cloudflare “Successful deploy” build and its commit hash (from Pages logs).
  - Re-deploy that commit and confirm live recovery.
- Record rollback in PR thread with:
  - Failure type (A/B/C/D)
  - Commit/PR that introduced regression
  - Commit/Deploy ID restored

---

## Drift Control
- Structural edits must copy from `/docs/homepage.html` or `/docs/memberpage.html` via explicit line ranges.
- No paraphrasing or freehand rewrites of canonical HTML/CSS.
- If canonical file missing or outdated, mark PR **Blocked** and request correction.
- Legacy snapshots are preserved at `/docs/lgfc-homepage-legacy-v6.html`, `/docs/lgfc-homepage-legacy-v7.html`, etc.
- MemberPage versioning follows the same pattern: `/docs/memberpage.html` (current standard) with versioned snapshots at `/docs/memberpage-v1.html`, future `/docs/memberpage-v2.html`, etc.
- **Automated drift guard:** All PRs must pass `npm run test:homepage-structure` to prevent structural violations.
- **Historical drift incidents:** See `/docs/drift-log.md` for documented cases and remediation guidance.

### As-Built Documentation Requirement

**Any change to Cloudflare-rendered pages must update `/docs/as-built/cloudflare-frontend.md` in the same PR.**

This requirement applies to changes affecting:
- Public route structure (new pages, removed pages, route modifications)
- Page-level layouts (section order, major component additions/removals)
- Header/footer navigation structure
- Major section additions/removals on homepage or other public pages
- Global styling baseline (color tokens, typography scale, layout variables)

**Enforcement**:
- Manual code review checks for as-built doc updates
- Future: Sentinel-Write Bot will automatically validate as-built doc changes (PR #311)
- PRs missing required as-built doc updates will be rejected

**Purpose**:
- Maintains authoritative baseline for Cloudflare static frontend
- Enables Sentinel-Write Bot drift detection
- Supports Supabase/Vercel integration planning
- Provides reference for Codex, Copilot Agent, and automated tooling

### Social Wall Drift & Regressions
**Historical Context:**
- Social Wall has had **multiple regressions** historically due to undocumented changes
- Common issues:
  - Wrong Elfsight script URL (static.elfsight.com vs elfsightcdn.com)
  - Missing `data-elfsight-app-lazy` attribute
  - Complete removal of widget code
  - "Cleanup" or "simplification" PRs that broke the working implementation

**Prevention Requirements:**
All Social Wall changes must:
1. **Review** the canonical configuration in `docs/lgfc-homepage-legacy-v6.html` (Social Wall subsection)
2. **Update** both `SocialWall.tsx` and the configuration documentation if making changes
3. **Test** on the deployed site to confirm the feed renders (not just fallback text)
4. **Document** the change reason and verification steps in PR description

**Never:**
- Remove the Elfsight widget container without explicit authorization
- Change script URLs without updating documentation
- "Clean up" Social Wall without verifying against canonical configuration

---

## Acceptance Checks
- Text locks match exactly (see “Canonical strings” in process doc).
- Visual alignment matches v6 (logo left, hamburger right, shared top offset; non-sticky header).
- Computed styles:
  - Weekly title color == `rgb(0, 51, 204)`
  - `.joinBanner` background-color == `rgb(0, 51, 204)`
- Section rhythm: `.section-gap` applied to Weekly, Join banner, Social Wall, FAQ, Milestones.
- **Social Wall configuration matches canonical spec:**
  - Script URL: `https://elfsightcdn.com/platform.js`
  - Widget container class: `elfsight-app-805f3c5c-67cd-4edf-bde6-2d5978e386a8`
  - `data-elfsight-app-lazy` attribute present
  - Fallback text present
- **If PR touches Cloudflare page layout**: `/docs/as-built/cloudflare-frontend.md` is updated in the same PR
---

## Documentation ↔ Implementation Sync Gate (MANDATORY)

**All PRs that change UI behavior, navigation, header/footer, or login flow MUST update documentation.**

### Required Documentation Updates

Any PR that modifies the following areas **MUST** update the corresponding documentation files in the same PR:

#### UI Behavior Changes
- Header (visitor or member) → Update `/docs/LGFC-Production-Design-and-Standards.md` (Section 2 or 11) AND `/docs/NAVIGATION-INVARIANTS.md`
- Footer → Update `/docs/LGFC-Production-Design-and-Standards.md` (Footer Lock section)
- Navigation/menus/hamburger → Update `/docs/LGFC-Production-Design-and-Standards.md` AND `/docs/NAVIGATION-INVARIANTS.md`
- Login/authentication flow → Update `/docs/LGFC-Production-Design-and-Standards.md` (LOGIN/LOGOUT section) AND `/docs/design/login.md`
- Page layout/sections → Update `/docs/LGFC-Production-Design-and-Standards.md` AND relevant `/docs/design/*.md` files

#### Specification File Changes
- Any change to `/docs/design/*.md` files → Update `/docs/LGFC-Production-Design-and-Standards.md` to maintain cross-reference consistency

### Placeholder Prohibition

**No "..." placeholders are allowed in authoritative documentation.**

- If a PR touches any section in `/docs/LGFC-Production-Design-and-Standards.md`, all "..." ellipses in that section MUST be removed and replaced with complete specification text.
- Incomplete sections with ellipses indicate missing or deferred decisions and must be resolved before merging.

### PR Acceptance Criteria Requirements

Every PR description MUST include:

**Option A — Documentation updates present:**
- List specific documentation files updated (with exact paths)
- Confirm: "Docs updated and consistent with implementation"

**Option B — No documentation updates required:**
- Explicitly state: "No documentation updates required"
- This is ONLY allowed when the PR genuinely does not affect any documented behavior (e.g., internal refactors with no observable changes, test-only changes, build config)

### Enforcement

**PRs will be rejected if:**
- UI/navigation/login behavior changes are made WITHOUT corresponding documentation updates
- Documentation paths are not explicitly listed in PR description
- Ellipses ("...") remain in touched documentation sections
- PR claims "No documentation updates required" when behavior changes are present

### Cross-Reference Chain of Truth

The repository maintains a **single chain of truth**:

1. `/docs/LGFC-Production-Design-and-Standards.md` — **Authoritative source** for all design decisions
2. `/docs/design/*.md` — Detailed specs that MUST cross-reference back to the authoritative doc
3. `/docs/NAVIGATION-INVARIANTS.md` — Navigation rules that MUST align with the authoritative doc
4. Implementation code — MUST match the authoritative doc and spec files

Any conflict MUST be resolved in favor of `/docs/LGFC-Production-Design-and-Standards.md`.

---

## Snapshot Review Cadence
- Automated repository snapshots are generated daily at 07:00 UTC via GitHub Actions.
- **Weekly Review**: Compare latest snapshot with previous week to detect drift.
- **Pre-Deployment**: Reference snapshots before major releases to establish rollback points.
- **Post-Incident**: After any rollback, review snapshots to identify when issues were introduced.
- **Maintenance**: Archive or remove snapshots older than 90 days to manage repository size.
- See `/docs/RECOVERY.md` for detailed snapshot usage and rollback procedures.
- See `/snapshots/README.md` for snapshot structure and contents.
