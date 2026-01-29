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

## PR Intent Labels (REQUIRED)

**All PRs MUST have exactly ONE intent label.** The label determines which files can be modified and how CI validates the PR.

### Canonical Intent Labels

| Intent | Purpose | Allowed Paths |
|--------|---------|---------------|
| **infra** | CI/CD, workflows, build config | `.github/**`, `scripts/**`, config files |
| **feature** | Application features, UI, API | `src/**`, `functions/**`, `migrations/**`, `public/**` |
| **docs-only** | Documentation changes only | `docs/**`, `Agent.md`, `active_tasklist.md` |
| **platform** | Cloudflare runtime config only | `wrangler.toml`, `functions/**` |
| **change-ops** | Operational changes, migrations | `migrations/**`, database scripts, operational tools |
| **codex** | AI/agent configuration | `.github/copilot-instructions.md`, `.github/agents/**` |
| **recovery** | Emergency fixes (break-glass) | All paths (manual assignment only) |

**Full definitions:** See `/docs/governance/pr-intent-labels.md`

### Enforcement

- **Auto-labeling:** The `intent-labeler` workflow automatically applies labels based on file-touch analysis
- **Validation:** The `drift-gate` workflow validates that:
  - PR has exactly ONE intent label
  - All changed files are allowed under that intent
  - PRs cannot merge if validation fails

### When to Split PRs

If a PR touches files across multiple intent categories, it MUST be split into separate PRs:
- Platform + Feature → 2 PRs
- Feature + Docs → 2 PRs
- Infra + Docs → 2 PRs
- Change-ops + Feature → 2 PRs

**Exception:** Use `recovery` intent for emergency fixes (manual assignment only).

### Legacy Labels (RETIRED for PRs)

The following labels are **no longer used for pull requests**:
- `bug`, `enhancement`, `question`, `help wanted`, `good first issue`, `duplicate`, `invalid`, `wontfix`

These may still be used for issues, but all PRs must use the canonical intent labels above.

### Platform Intent Details

PRs that modify **only** Cloudflare runtime configuration must use the `platform` intent label:

**When to use `platform` intent:**
- PR touches ONLY `wrangler.toml` and/or `functions/**`
- No UI, docs, CI, or dependency changes

**File-touch restrictions:**
- ✅ Allowed: `wrangler.toml`, `functions/**`
- ❌ Prohibited: `docs/`, `src/`, `.github/workflows/`, `package.json`, `migrations/`

**Mixed changes require PR split:**
- If a PR needs to change BOTH `wrangler.toml` AND app code (`src/`), split into:
  - PR #1: `platform` intent (wrangler.toml only)
  - PR #2: `feature` intent (src/ changes)

See `/docs/governance/platform-intent-and-zip-governance.md` for full intent governance and allowlist details.

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

## D1 Database Binding Requirements

### Critical Requirements

**All Cloudflare Pages Functions that use D1 REQUIRE:**
1. D1 binding named `DB` configured in Cloudflare Pages environment
2. Migrations applied to the D1 database before first use
3. Runtime guards to handle missing binding or incomplete schema

### Configuring D1 Binding

**Local Development (`wrangler.toml`):**
```toml
[[d1_databases]]
binding = "DB"                     # Must match this exact name
database_name = "lgfc_lite"        # Your D1 database name
database_id = "..."                # Your D1 database ID
```

**Cloudflare Pages Production:**
1. Go to Cloudflare Dashboard → Pages → Your Project → Settings → Functions
2. Add D1 Database Binding:
   - Variable name: `DB` (must match exactly)
   - D1 Database: Select your `lgfc_lite` database
3. Save and redeploy

**Verification:**

**Option 1: D1 Diagnostic Tool (Browser-based):**
- Navigate to `/admin/d1-test` in your browser
- Enter admin token when prompted (stored in sessionStorage)
- View all tables with row counts, schemas, and sample data
- Ideal for: Visual inspection, troubleshooting, verifying seeding results
- See `/docs/admin/access-model.md` for full D1 diagnostic tool documentation

**Option 2: API Endpoint (Command-line):**
```bash
# Test D1 binding and schema
curl https://your-site.pages.dev/api/d1-test

# Expected response (200 OK):
{
  "ok": true,
  "status": "healthy",
  "checks": {
    "d1Binding": "present",
    "requiredTables": "present"
  }
}
```

### Runtime Guards (Functions)

**All API endpoints that use D1 must use runtime guards** to prevent silent failures:

```typescript
import { requireD1, requireTables, jsonResponse, type Env } from '../_lib/d1';

export async function onRequestPost(context: { env: Env; request: Request }): Promise<Response> {
  const { request, env } = context;

  // Step 1: Check D1 binding exists
  const d1Check = requireD1(env);
  if (!d1Check.ok) {
    return jsonResponse(d1Check.body, d1Check.status);
  }
  
  const db = d1Check.db;

  // Step 2: Check required tables exist (validates migrations applied)
  const tablesCheck = await requireTables(db, ['join_requests', 'members']);
  if (!tablesCheck.ok) {
    return jsonResponse(tablesCheck.body, tablesCheck.status);
  }

  // Now safe to use db...
}
```

### Error Responses

**Missing D1 Binding (503 Service Unavailable):**
```json
{
  "ok": false,
  "error": "Database unavailable",
  "detail": "D1 binding \"DB\" not found. Ensure wrangler.toml has [[d1_databases]] with binding=\"DB\" and Cloudflare Pages environment has the D1 binding configured.",
  "docs": "https://developers.cloudflare.com/pages/functions/bindings/#d1-databases"
}
```

**Missing Tables (503 Service Unavailable):**
```json
{
  "ok": false,
  "error": "Database schema incomplete",
  "detail": "Missing required table(s): join_requests, members. Run migrations with: npx wrangler d1 migrations apply lgfc_lite",
  "missingTables": ["join_requests", "members"],
  "docs": "See /docs/website-process.md § D1 Database Seeding"
}
```

### Troubleshooting

**Problem: `/api/join` or `/api/login` returns 503**
- Check D1 binding is configured (see Configuring D1 Binding above)
- Verify migrations applied: `npx wrangler d1 migrations list lgfc_lite --local`
- Test with `/api/d1-test` endpoint or use `/admin/d1-test` diagnostic page

**Problem: "Database unavailable" error**
- D1 binding not configured in Cloudflare Pages environment
- Check binding name is exactly `DB` (case-sensitive)
- Redeploy after adding binding
- Use `/admin/d1-test` to verify D1 binding status

**Problem: "Database schema incomplete" error**
- Migrations not applied to this environment
- Run: `npx wrangler d1 migrations apply lgfc_lite [--local|--remote]`
- Verify with: `./scripts/d1-report.sh local`
- Or use `/admin/d1-test` to inspect table schemas

### Deployment Checklist

Before deploying to production:
- [ ] D1 database created in Cloudflare
- [ ] D1 binding `DB` configured in Cloudflare Pages
- [ ] Migrations applied: `npx wrangler d1 migrations apply lgfc_lite --remote`
- [ ] Seeding completed (optional): `./scripts/d1-seed-all.sh production`
- [ ] Verification test: `curl https://your-site.pages.dev/api/d1-test` OR navigate to `/admin/d1-test`
- [ ] Admin access configured: `ADMIN_TOKEN` environment variable set in Cloudflare Pages

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

### Design Compliance Warning System

**Purpose:** Automated early detection of PRs drifting from documented design process.

**Implementation Phases:**

**Phase 1 (Current): WARN-only checks**
- Design compliance workflow runs on all PRs
- Detects missing template sections, allowlist violations, undocumented changes
- Posts informational warnings as PR comments
- **Never blocks or fails PRs** (always green ✅)
- Intended use:
  - During active design implementation, warnings are expected and acceptable
  - Helps developers self-check before requesting review
  - Provides early feedback without disrupting development flow

**Phase 2 (Future, Day-2 hardening):**
- After design implementation reaches "final lockdown"
- Warnings can be upgraded to blocking checks in a separate governance PR
- Requires explicit review and approval
- **Explicitly not in scope for Phase 1 implementation**

**Governance:**
- WARN-only checks are the default and preferred mode during active development
- Upgrades to blocking must be justified by demonstrated need
- Blocking checks require documented override/exception process
- Changes to enforcement levels require PR with governance review

**Developer guidance:**
- Warnings during WIP/Draft PRs: Normal and expected
- Warnings before "Ready for Review": Must be addressed
- Persistent warnings after "Ready for Review": Reviewer may request resolution

---

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

---

## D1 Database Seeding

### Overview

The repository includes automated D1 database seeding scripts that populate all tables with pseudo data for validation and testing. This enables immediate validation of page↔D1 wiring without manual data entry.

### Seeding Policy

- **Target**: Minimum 15 rows per table
- **Idempotent**: Safe to re-run without creating duplicates
- **Deterministic**: Produces predictable IDs/keys for foreign key references
- **Complete coverage**: Seeds ALL tables defined in D1 migrations

### Photo/Media URLs

Photo and media tables use **public internet URLs from Wikimedia Commons** (Lou Gehrig collection):
- Uses `Special:FilePath` URLs for stable, direct file resolution
- No local assets or fragile scraping dependencies
- Rotates through 15 historical Lou Gehrig photos

### Scripts

#### `scripts/d1-seed-all.sh` - End-to-End Bootstrap

Complete bootstrap workflow: applies migrations, seeds data, generates report.

**Usage:**
```bash
# Local development
./scripts/d1-seed-all.sh local

# Production (admin-only)
./scripts/d1-seed-all.sh production
```

**Workflow:**
1. Applies all D1 migrations via wrangler
2. Seeds all tables to minimum 15 rows
3. Prints row count report with validation status

#### `scripts/d1-seed-all.mjs` - Programmatic Seeder

Node.js script that discovers tables, analyzes schema, and generates deterministic inserts.

**Features:**
- Discovers tables via `sqlite_master`
- Analyzes columns via `PRAGMA table_info`
- Detects foreign keys via `PRAGMA foreign_key_list`
- Seeds in dependency order (FK parents first)
- Generates type-appropriate values (TEXT, INTEGER, REAL, dates, UUIDs)
- Special handling for photo/media URLs (Wikimedia Commons)
- Idempotent: checks row count before inserting

**Direct usage:**
```bash
# Local
node scripts/d1-seed-all.mjs

# Production
node scripts/d1-seed-all.mjs --env production
```

#### `scripts/d1-report.sh` - Row Count Report

Generates validation report showing row counts for all tables.

**Usage:**
```bash
# Local
./scripts/d1-report.sh local

# Production
./scripts/d1-report.sh production
```

**Output:**
- Row count per table with ✅/⚠️ status
- Total row count across all tables
- Sample IDs for FK target tables (photos, members, etc.)
- Warnings for tables below 15-row threshold

### One-Command Workflow

For a clean environment setup:

```bash
# Apply migrations + seed + report (local)
./scripts/d1-seed-all.sh local
```

This is the recommended workflow for:
- Initial local development setup
- CI/validation environments
- Post-migration validation

### Important Notes

**Cloudflare Pages Deployment:**
- Pages deployments do **NOT** auto-seed D1
- Seeding is a manual admin operation
- Run seeding when needed (new environments, validation testing)

**Production Seeding:**
- Admin-only operation
- Use repository's established wrangler configuration
- Verify with report script before deploying pages that depend on data

**Data Characteristics:**
- Deterministic: Same seed run produces same data
- Minimal: Only required NOT NULL columns populated
- Valid FKs: Foreign keys reference existing parent rows
- Real URLs: Photo URLs point to actual Wikimedia Commons images

### Verification Checklist

After seeding, verify:
- [ ] All tables show count >= 15 (via `d1-report.sh`)
- [ ] No foreign key constraint errors
- [ ] Photo tables contain valid Wikimedia URLs
- [ ] `npm run build:cf` passes

### Troubleshooting

**"Table not found" errors:**
- Run migrations first: `npx wrangler d1 migrations apply lgfc_lite --local`

**Foreign key errors:**
- Seeder handles FK order automatically
- If errors persist, check migrations for circular dependencies

**Row count below 15:**
- Re-run seeder (idempotent, will insert missing rows)
- Check seeder output for insert failures

**Permission errors (production):**
- Ensure wrangler is authenticated
- Verify database binding in `wrangler.toml`

---

## Header State & Navigation Rules

This section defines the authoritative design rules for header behavior and navigation across visitor and member contexts.

### Visitor Header

**When logged out:**
- Display buttons: Join, Search, Store, Login
- Join → `/join`
- Login → `/login` (NEVER `/member`)

**When logged in (member detected via `lgfc_member_email` in localStorage):**
- Display buttons: Join, Search, Store, Members, Logout
- Join → `/join`
- Search → `/search`
- Store → external link
- Members → `/member`
- Logout:
  - Clears `lgfc_member_email` from localStorage
  - Redirects to `/` (Visitor Home)

### Member Header

**Always displays:**
- Member Home → `/member`
- Search → `/search`
- Store → external link
- Logout:
  - Clears `lgfc_member_email` from localStorage
  - Redirects to `/` (Visitor Home)

### JOIN CTA Component

**Links:**
- Join → `/join`
- Login → `/login` (NEVER `/member`)

**Design requirement:**
- Both buttons must be visible and clickable
- No hidden or collapsed states
- Text must be readable (proper contrast)

### Admin Routes

**As-Built (Post ZIP 41):**

Admin access uses a **two-tier model** (see `/docs/admin/access-model.md` for full details):

1. **Admin UI Pages (`/admin/**`)** — Browser-reachable, no page-level gate
   - `/admin` — Main admin dashboard
   - `/admin/d1-test` — D1 database diagnostic tool (canonical for D1 inspection)
   - `/admin/cms` — CMS content management
   - `/admin/content` — Page content editor
   - Pages are client-side rendered and publicly accessible
   - Token stored in `sessionStorage` (`lgfc_admin_token`)

2. **Admin API Endpoints (`/api/admin/**`)** — Token-gated (fail closed)
   - All endpoints require `ADMIN_TOKEN` environment variable
   - Client sends token via `x-admin-token` request header
   - Missing or invalid token → `403 Forbidden`
   - Examples: `/api/admin/stats`, `/api/admin/d1-inspect`, `/api/admin/export`

**Required Environment Variable:**
- **Name:** `ADMIN_TOKEN`
- **Set in:** Cloudflare Pages → Settings → Environment Variables
- **Format:** Secure random string (32+ characters recommended)
- **Security boundary:** API layer only (pages are open for UI development)

**D1 Diagnostic Tool:**
- **Route:** `/admin/d1-test`
- **Purpose:** Browser-based D1 database inspection (tables, schemas, row counts, sample data)
- **Access:** Browser-reachable page, API calls token-gated
- **Use cases:** Verify D1 binding, troubleshoot migrations, validate seeding

**Header behavior:**
- Admin routes detect member login state
- When `lgfc_member_email` exists in localStorage:
  - Render Member Header (not Visitor Header)
  - Logo/home navigation points to `/member`
- When logged out:
  - Render Visitor Header
  - Normal visitor navigation applies

### Implementation Notes

**Client-side detection:**
- All header state logic uses `localStorage.getItem('lgfc_member_email')`
- No server-side auth checks in header components
- Uses React `useEffect` for client-side initialization

**Navigation consistency:**
- Logged-in members always see path to `/member`
- Logout always returns to `/` (Visitor Home)
- Admin routes respect member context when logged in


## CI Scope

CI enforces governance and quality gates. Some gates validate repository state only; others validate deployed behavior where explicitly configured.

CI **does** enforce:
- Intent labeling + path allowlists
- Repository invariants (lint/build/type checks where configured)
- Deployed-site invariants via Playwright **when enabled** (PR preview + scheduled production audit)

CI **does not** enforce:
- Pixel-perfect visual correctness
- Feature completeness
- Content correctness beyond explicit tests

A green CI run does not automatically mean the website is complete or visually correct.

