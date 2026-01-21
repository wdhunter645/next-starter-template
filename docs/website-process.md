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
