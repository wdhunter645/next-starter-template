# Website Pull Request Process
*(Standardized PR Prompt Reference — used for every PR in this repository)*

#### Reference
Refer to `/docs/website-PR-process.md` for structure and formatting.  
Follow operational, rollback, and testing standards in `/docs/website-PR-governance.md`.  
Use `/docs/homepage.html` as the canonical markup source for line-range copying.  
Use `/docs/memberpage.html` as the canonical MemberPage specification (versioned snapshots: `memberpage-v1.html`, etc.).  
Use `/docs/as-built/cloudflare-frontend.md` as the authoritative baseline for the Cloudflare static frontend.

---

### Structural Rules
- Canonical strings (must match exactly):
  - Weekly section title: “Weekly Photo Matchup. Vote for your favorite!”
  - Join banner sentence: “Become a member. Get access to the Gehrig library, media archive, memorabilia archive, group discussions, and more.”
- Canonical color token:
  - `--lgfc-blue: #0033cc` (computed value must equal `rgb(0, 51, 204)` in tests)

---

### Testing Guardrails
- Add devDeps and install: `@playwright/test` (CI must run `npx playwright install --with-deps`)
- Assertions required:
  - Text present exactly once:
    - Weekly: “Weekly Photo Matchup. Vote for your favorite!”
    - Join banner sentence (full line as above)
  - Style checks:
    - Weekly title computed color == `rgb(0, 51, 204)`
    - `.joinBanner` background-color == `rgb(0, 51, 204)`

#### Regression Test Requirements
For any PR affecting the homepage or Social Wall:
- Developer **must** run `npm run test:homepage-sections` locally before submitting PR
- Developer **must** run existing Playwright tests: `npm run test:e2e`
- Any failing regression test must be fixed before PR approval
- If a test failure is legitimate (due to intentional changes), update the test accordingly and document the change in the PR description

**Critical Tests:**
- Homepage section visibility tests (`tests/e2e/homepage-sections.spec.ts`)
- V6 token compliance tests (`tests/homepage.spec.ts`)
- Social Wall regression guard (ensures widget container is present and section is not empty)

#### Social Wall Specific Rules
**When modifying homepage sections:**
- If a PR touches the Social Wall section or `src/components/SocialWall.tsx`:
  - Developer **must** review the Social Wall configuration description in `docs/lgfc-homepage-legacy-v6.html` (Social Wall subsection)
  - Developer **must** confirm that the Elfsight script URL and app container class remain correct, or update them deliberately and document the change
  - Developer **must** verify that:
    - Script URL is `https://elfsightcdn.com/platform.js` (NOT static.elfsight.com)
    - Widget container class is `elfsight-app-805f3c5c-67cd-4edf-bde6-2d5978e386a8`
    - `data-elfsight-app-lazy` attribute is present on the widget container
    - Fallback text remains in the component
  - Developer **must** test the deployed site to confirm the social feed renders (not just fallback text)
  - Any configuration change must update both:
    1. `src/components/SocialWall.tsx`
    2. The Social Wall subsection in `docs/lgfc-homepage-legacy-v6.html`

---

### Commit Message Standard
`feat(home): header/logo alignment; weekly title center+blue; join banner exact copy+blue; section-gap`

---

### CI Enforcement Policy
- **All PRs to `main` must have green `lgfc-validate` status checks before merge.**
- The `lgfc-validate` workflow runs on every PR and validates:
  1. `npm run lint` — ESLint passes without errors
  2. `npm test` — Unit/component tests pass
  3. `npm run build:cf` — Cloudflare static build succeeds
- **Manual merges that bypass CI checks are forbidden** except under explicit "emergency hotfix" protocol.
- Emergency hotfix protocol:
  - Must be approved by repository owner (@wdhunter645).
  - Must include post-merge follow-up PR to restore compliance.
  - Must be documented in PR thread with justification.
- CI failures must be resolved **before** Cloudflare deployment, preventing production issues.

---

### ZIP File Policy (CRITICAL)
**ZIP files are strictly prohibited from being committed to this repository.**

- **Transport only**: ZIP files may be used for local transport of changes (e.g., uploaded to agent context), but must **never** be committed.
- **Enforcement**: Any PR containing a tracked ZIP file (`.zip` or `.ZIP`) is **invalid** and **must be rejected**.
- **Cleanup required**: If a ZIP file is uploaded for work purposes, it must be deleted before creating commits.
- **CI enforcement**: Automated workflows will fail any PR that contains tracked ZIP files.

**Process:**
1. If using a ZIP for transport: Extract contents to appropriate paths
2. Delete the ZIP file immediately
3. Commit only the extracted/modified files
4. Verify with `git ls-files '*.zip' '*.ZIP'` before pushing

---

### Design Compliance (Warn) Check

**Automated PR review assistance** that validates PRs follow the documented design process.

**What it checks:**
- PR body includes required template sections:
  - "MANDATORY FIRST STEP (ZIP SAFETY)"
  - "DESIGN SOURCE OF TRUTH (NON-NEGOTIABLE)"
  - "FILE-TOUCH ALLOWLIST (MANDATORY)"
  - "VISUAL / UX INVARIANTS (MANDATORY)"
  - "REQUIRED PRE-REVIEW SELF-CHECK"
- PR body includes explicit ZIP safety statement:
  - Either: "No ZIP found in repo root"
  - Or: Explicit confirmation that ZIP was deleted from repo root
- PR body includes parseable file-touch allowlist
- Changed files match the documented allowlist
- Code/config changes include corresponding docs changes (heuristic)

**File-touch allowlist format:**

The allowlist must appear in your PR description under a section with "Allowed files:" (case-insensitive).
List files as bullet points with exact paths:

```markdown
Allowed files:
- `src/components/Header.tsx`
- `src/app/page.tsx`
- `docs/website.md`
```

**Behavior:**
- **Non-blocking**: This check always succeeds (green ✅) and **never fails PRs**
- **Warnings via comment**: Posts a single comment that updates on each PR change (idempotent)
- **Job summary**: Provides detailed findings in the workflow run summary

**When warnings are acceptable:**
- During active development before "Ready for Review"
- When implementing complex multi-file changes iteratively
- While PR description is being drafted/refined

**Before marking Ready for Review:**
- All warnings must be addressed
- PR body must include all required sections
- Changed files must match documented allowlist
- ZIP safety statement must be present

**Enforcement timeline:**
- Current: WARN-only (informational, not blocking)
- Future: May be upgraded to blocking checks in a separate Day-2 hardening PR (explicitly not in this PR's scope)

---

### Notes and Prohibitions
- Do not add new dependencies or frameworks for layout/spacing fixes (no Tailwind, no UI kits, no CSS-in-JS).
- Maintain global CSS styling approach.

---

## Cloudflare As-Built Frontend

The canonical baseline for the **Cloudflare Pages-hosted public frontend** is documented in:

**`/docs/as-built/cloudflare-frontend.md`**

### Cloudflare vs. Vercel Responsibilities

- **Cloudflare Pages** = Static public site (homepage, weekly matchup, milestones, charities, calendar, news, static member stub, legal pages)
- **Vercel** = Members/admin app + dynamic content (authentication, database-backed features, real-time interactions)

### When to Update As-Built Documentation

Any PR that changes the following on the **Cloudflare side** must update `/docs/as-built/cloudflare-frontend.md`:

1. **Route structure** (new pages, removed pages, route changes)
2. **Page-level layouts** (section order, major component additions/removals)
3. **Header/footer structure** (navigation items, layout changes)
4. **Major section changes** (homepage sections, memberpage sections)
5. **Styling baseline** (color tokens, typography scale, global layout variables)

Future contributors must consult and update the as-built doc whenever making visual or structural changes to the Cloudflare frontend. This is required for Sentinel-Write Bot enforcement and long-term maintainability.

---

## Site Assessment Harness

### Overview

The LGFC repository includes an automated site assessment harness that validates:
- Build completes successfully
- All required routes exist in the static export
- Forbidden/legacy routes are absent
- Header, navigation, and footer invariants match design standards
- Key page markers and structure are present

### Running Assessments

**Local Development:**
```bash
npm run assess
```

**CI Mode:**
```bash
npm run assess:ci
```

The assessment produces:
- `reports/assess/assess-report.json` (detailed machine-readable results)
- `reports/assess/assess-summary.md` (human-readable summary)
- `reports/assess/routes-found.json` (route index)

### Assessment Manifest

The assessment is driven by `docs/assess/manifest.json`, which encodes:
- `requiredRoutes`: Routes that must exist
- `forbiddenRoutes`: Routes that must not exist (legacy/parked)
- `navInvariants`: Header button labels/order, hamburger menu rules
- `footerLinks`: Required footer links and copyright format
- `pageMarkers`: Required headings/sections/markers for key pages

**Source of Truth:** The manifest is derived from `/docs/LGFC-Production-Design-and-Standards.md`.

### Updating the Manifest

When design standards change (rare, locked changes only):

1. Update `/docs/LGFC-Production-Design-and-Standards.md` first (via governance process)
2. Update `/docs/assess/manifest.json` to match
3. Run `npm run assess` to verify changes
4. Document the update in the PR

**IMPORTANT:** The manifest enforces locked design standards. Changes should be rare and require explicit design review approval.

### CI Gating Policy

#### PR Gate (`.github/workflows/assess.yml`)
- Runs on every pull request
- Runs on push to `main`
- **PRs cannot merge if assessment fails**
- Uploads artifacts for review:
  - `assess-report-json` (30-day retention)
  - `assess-summary-md` (30-day retention)
  - `routes-found` (30-day retention)

#### Nightly Drift Detection (`.github/workflows/assess-nightly.yml`)
- Runs nightly at 2:00 AM UTC
- Detects drift from dependencies or unintended changes
- On failure:
  - Creates a GitHub issue with label `assessment-failure`
  - Uploads artifacts with 90-day retention
  - Marks workflow as failed
- Can be manually triggered via workflow dispatch

### Troubleshooting Assessment Failures

**Build Failure:**
- Check for TypeScript errors: `npm run typecheck`
- Check for lint errors: `npm run lint`
- Ensure all dependencies are installed: `npm ci`

**Missing Routes:**
- Verify the route exists in `src/app/`
- Check Next.js build output in console
- Ensure static export is configured correctly

**Navigation Invariants:**
- Review header component implementation
- Verify hamburger menu items match manifest
- Check for forbidden items (Join/Login in hamburger, etc.)

**Page Markers:**
- Verify required headings are present in page content
- Check for case-sensitive text matching
- Review HTML structure (header/footer elements)

### Artifact Locations

Assessment artifacts are stored in `reports/assess/` (gitignored):
- `assess-report.json` - Full detailed results
- `assess-summary.md` - Human-readable summary
- `routes-found.json` - List of found/missing routes

These artifacts are uploaded to GitHub Actions on every run and available for download from the workflow run page.