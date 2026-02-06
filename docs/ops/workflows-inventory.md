# GitHub Actions Workflows Inventory

## Overview

This repository uses a **two-tier workflow architecture** to separate PR governance checks (GATE) from operational monitoring and maintenance tasks (OPS). This separation ensures that PRs are never blocked by operational workflows and that required status checks remain predictable and deterministic.

---

## Architecture: Two Tiers, Zero Coupling

### Tier A: GATE (PR Blocking Checks)

**Purpose:** Fast, deterministic, repository-local governance gates that validate PR quality before merge.

**Characteristics:**
- **Allowed triggers:** `pull_request` (targeting `main`), optional `workflow_dispatch` for debugging
- **Purpose:** Governance gates only (fast, deterministic, repo-local)
- **Must NOT:** Call OPS workflows, make live-site calls, or perform "in-use vs design" comparisons that could block feature work
- **File naming:** `.github/workflows/gate-*.yml`
- **Workflow name:** Must begin with `GATE — `

**Examples:**
- Code quality checks (lint, typecheck, tests)
- ZIP file enforcement
- Intent label validation
- Drift detection
- Repository structure validation

### Tier B: OPS (Operations & Monitoring)

**Purpose:** Operational workflows for monitoring, alerting, and maintenance tasks that run on `main` only.

**Characteristics:**
- **Allowed triggers:** `schedule`, `workflow_dispatch`, optional `push` to `main` only
- **Never use:** `pull_request` trigger (not even with "skip" logic)
- **Operates on:** `main` branch only (unless explicitly expanded later)
- **Must NOT:** Call GATE workflows or rely on GATE outputs
- **File naming:** `.github/workflows/ops-*.yml`
- **Workflow name:** Must begin with `OPS — `

**Examples:**
- Site health assessment
- Design compliance audits
- Deployment retries
- Main branch change monitoring
- Nightly drift detection

---

## Hard Rule: No Coupling Between Tiers

**GATE and OPS workflows must never reference one another.**

- ❌ No `workflow_call` between tiers
- ❌ No shared reusable workflows between tiers
- ❌ No workflow dependencies across tiers

**If shared code is required:**
- Use a small repo-local helper script (no network, no environment introspection), OR
- Duplicate logic to preserve isolation

**Why this matters:**
- Prevents operational workflows from blocking PRs
- Ensures required status checks remain stable and predictable
- Simplifies troubleshooting and maintenance
- Avoids cascading failures

---

## GATE Workflows (PR Checks)

These workflows run on pull requests and are the **only** workflows that should be configured as required status checks in branch protection.

### `gate-drift.yml`
- **Name:** `GATE — Drift Control`
- **Purpose:** Validates PR compliance with repository governance rules
- **Checks:**
  - No ZIP files in repository tree
  - No ZIP files in PR commit history (ZIP taint detection)
  - PR intent allowlist validation
  - Critical LGFC invariants
- **Triggers:** `pull_request`, `workflow_dispatch`

### `gate-intent-labeler.yml`
- **Name:** `GATE — Intent Labeler`
- **Purpose:** Auto-assigns intent labels based on file-touch analysis
- **Behavior:**
  - Analyzes changed files in PR
  - Applies exactly one intent label (or none for mixed changes)
  - Posts guidance for mixed-intent PRs
- **Triggers:** `pull_request` (opened, synchronize, reopened, ready_for_review)

### `gate-zip-safety.yml`
- **Name:** `GATE — ZIP Safety`
- **Purpose:** Single source of truth for ZIP file enforcement
- **Checks:**
  - No `.zip` files committed in repository content
  - No `.zip` files in PR diff
- **Triggers:** `pull_request` (targeting `main`)
- **Note:** Consolidated from multiple ZIP enforcement workflows

### `gate-quality.yml`
- **Name:** `GATE — Quality Checks`
- **Purpose:** Validates code quality and correctness
- **Checks:**
  - Repository structure validation
  - TypeScript type checking
  - ESLint linting
  - Unit tests
- **Triggers:** `pull_request`, `workflow_dispatch`

---

## OPS Workflows (Main-Only Operations)

These workflows operate on `main` branch only and **must never** be configured as required status checks.

### `ops-assess.yml`
- **Name:** `OPS — Site Assessment`
- **Purpose:** Validates site build, routes, navigation, and page markers
- **Behavior:**
  - Runs nightly and on `main` push when `docs/ops/scan-trigger.md` changes
  - Creates GitHub issue on failure (with `assessment-failure` label)
  - Uploads detailed artifacts (90-day retention)
- **Triggers:** `schedule` (nightly 2 AM UTC), `push` (main, when `docs/ops/scan-trigger.md` changes), `workflow_dispatch`
- **Artifacts:**
  - `assess-report-json` (machine-readable results)
  - `assess-summary-md` (human-readable summary)
  - `routes-found` (route index)

### `ops-design-compliance-audit.yml`
- **Name:** `OPS — Design Compliance Audit`
- **Purpose:** Monitors alignment between as-built production and documented design
- **Behavior:**
  - Alert-only: always green ✅ regardless of audit results
  - Non-blocking: observability only, no auto-fixing
  - Tests production site: `https://www.lougehrigfanclub.com`
- **Triggers:** `push` (main, when `docs/ops/scan-trigger.md` changes), `schedule` (nightly 2 AM UTC), `workflow_dispatch`
- **Note:** Previously included `pull_request` trigger with skip logic - now removed entirely

### `ops-cf-pages-retry.yml`
- **Name:** `OPS — Cloudflare Pages Auto-Retry`
- **Purpose:** Retries failed Cloudflare Pages deployments
- **Behavior:**
  - Manual operation via `workflow_dispatch`
  - Finds latest failed deployment (or uses provided deployment ID)
  - Retries up to 2 times with status polling
- **Triggers:** `workflow_dispatch` only
- **Note:** Removed `pull_request` trigger to eliminate from PR checks

### `ops-main-change-monitor.yml`
- **Name:** `OPS — Main Change Monitor`
- **Purpose:** Detects and alerts on unapproved direct pushes to main
- **Behavior:**
  - Merged PRs: INFO-only logging (workflow succeeds)
  - Direct pushes: Creates/updates GitHub issue + workflow fails (triggers notifications)
  - Issue label: `unapproved-main-change`
  - Admin mentions: Configured via `ADMIN_GITHUB_LOGINS` repo variable (comma-separated usernames)
- **Triggers:** `push` (main), `workflow_dispatch`
- **Configuration:**
  - Set repo variable `ADMIN_GITHUB_LOGINS` with comma-separated GitHub usernames
  - Example: `wdhunter645,admin-user`
  - Default: `wdhunter645` (if variable not set)

### `production-audit.yml`
- **Name:** `Production Audit (Playwright Invariants)`
- **Purpose:** Validates production site against invariant test suite
- **Behavior:**
  - Runs Playwright tests against production URL
  - Creates/updates GitHub issue on failure
  - Uploads Playwright HTML report (30-day retention)
- **Triggers:** `push` (main, when `docs/ops/scan-trigger.md` changes), `schedule` (twice daily at 12:15 UTC and 00:15 UTC), `workflow_dispatch`
- **Artifacts:**
  - `playwright-report-production` (HTML report)

---

## Production Scan Trigger Mechanism

### On-Demand Production Scans

To run production scans immediately (without waiting for scheduled runs):

1. **Update the trigger marker file:** `docs/ops/scan-trigger.md`
   - Update the timestamp
   - Document the reason for triggering scans
   - Optionally link to the PR that prompted this scan

2. **Commit and merge to main:**
   - Create a feature branch
   - Commit the changes
   - Create and merge a PR

3. **Workflows triggered on merge:**
   - `production-audit.yml` — Playwright invariants
   - `ops-assess.yml` — Site assessment
   - `ops-design-compliance-audit.yml` — Design compliance

**Alternative:** Use `workflow_dispatch` in GitHub Actions UI for individual workflow runs.

---

## Enforcement Rules

### Rule 1: OPS workflows must never use `pull_request` trigger

Search command to verify:
```bash
grep -r "pull_request" .github/workflows/ops-*.yml
```

**Expected result:** No matches (exit code 1)

**If violations found:** Remove the `pull_request` trigger from the OPS workflow

### Rule 2: No `workflow_call` between tiers

GATE workflows must not call OPS workflows, and vice versa.

Search command to verify:
```bash
grep -r "workflow_call" .github/workflows/gate-*.yml .github/workflows/ops-*.yml
```

**Expected result:** No matches (exit code 1), OR only internal calls within the same tier

### Rule 3: Naming conventions are mandatory

- **GATE workflows:**
  - File: `.github/workflows/gate-*.yml`
  - Name: Must begin with `GATE — `

- **OPS workflows:**
  - File: `.github/workflows/ops-*.yml`
  - Name: Must begin with `OPS — `

**Why this matters:** Ensures required status checks cannot accidentally include OPS workflows

---

## Branch Protection Configuration

**After merging this PR,** update Branch Protection settings for `main` to include **only** GATE workflows as required status checks.

### Required Status Checks (GATE workflows only)

Add these to "Require status checks to pass before merging":
- `GATE — Drift Control`
- `GATE — Intent Labeler`
- `GATE — ZIP Safety`
- `GATE — Quality Checks`

### DO NOT Include (OPS workflows)

Ensure these are **NOT** in required status checks:
- `OPS — Site Assessment`
- `OPS — Design Compliance Audit`
- `OPS — Cloudflare Pages Auto-Retry`
- `OPS — Main Change Monitor`

**Why this matters:**
- OPS workflows are operational/monitoring tasks, not PR quality gates
- Including OPS in required checks can block PRs when operational tasks fail
- Main Change Monitor only runs on `main` push (never on PRs)

---

## Legacy Workflows (Removed)

The following workflows have been **removed** as part of this redesign:

### Converted to GATE
- `drift-gate.yml` → `gate-drift.yml`
- `intent-labeler.yml` → `gate-intent-labeler.yml`
- `block-zip-artifacts.yml` → `gate-zip-safety.yml` (consolidated)
- `quality.yml` → `gate-quality.yml`

### Converted to OPS
- `assess.yml` → `ops-assess.yml`
- `design-compliance-audit.yml` → `ops-design-compliance-audit.yml`
- `cf-pages-auto-retry.yml` → `ops-cf-pages-retry.yml`

### New Workflows
- `ops-main-change-monitor.yml` (NEW) — Detects unapproved main changes

### Other Workflows (Not Modified)

The following workflows are **not part of this redesign** and remain as-is:
- `ai_review.yml`
- `assess-nightly.yml`
- `b2-d1-daily-sync.yml`
- `b2-s3-smoke-test.yml`
- `ci.yml`
- `d1-migrations.yml`
- `deploy-dev.yml`
- `deploy-prod.yml`
- `deploy.yml`
- `design-compliance-warn.yml`
- `gitleaks.yml`
- `lgfc-validate.yml`
- `opencode.yml`
- `post-recovery-425-verify.yml`
- `pr-triage-zip-taint.yml`
- `preview-invariants.yml`
- `purge-zip-history.yml`
- `snapshot.yml`
- `test-homepage.yml`
- `test.yml`
- `zip-history-audit.yml`

**Note:** These workflows may need future review to determine if they should be categorized as GATE or OPS, but they are explicitly **out of scope** for this PR.

---

## Troubleshooting

### OPS workflow appearing in PR checks

**Symptom:** An `OPS — ...` workflow shows up as a status check on a pull request

**Cause:** The workflow file contains a `pull_request` trigger

**Fix:**
1. Open the workflow file in `.github/workflows/ops-*.yml`
2. Remove the `pull_request` trigger from the `on:` section
3. Ensure triggers are limited to: `schedule`, `workflow_dispatch`, `push` (main only)
4. Commit and push the change

### GATE workflow not running on PRs

**Symptom:** A `GATE — ...` workflow does not run when a PR is opened

**Cause:** Missing `pull_request` trigger

**Fix:**
1. Open the workflow file in `.github/workflows/gate-*.yml`
2. Ensure the `on:` section includes `pull_request`
3. Commit and push the change

### Main Change Monitor not sending notifications

**Symptom:** Direct pushes to `main` don't create issues or send alerts

**Possible causes:**
1. **Workflow disabled:** Check if `ops-main-change-monitor.yml` is enabled in Actions settings
2. **Permissions missing:** Workflow needs `issues: write` permission
3. **Admin variable not set:** Set `ADMIN_GITHUB_LOGINS` repo variable with GitHub usernames

**Fix:**
1. Verify workflow is enabled: Settings → Actions → Workflows
2. Check workflow permissions in the YAML file
3. Add repo variable: Settings → Secrets and variables → Actions → Variables → New repository variable
   - Name: `ADMIN_GITHUB_LOGINS`
   - Value: `wdhunter645,other-admin` (comma-separated)

---

## Maintenance

### Adding a New GATE Workflow

1. Create file: `.github/workflows/gate-<name>.yml`
2. Set workflow name: `name: GATE — <Description>`
3. Add `pull_request` trigger
4. Add `workflow_dispatch` for debugging (optional)
5. Keep checks fast, deterministic, and repo-local
6. Do NOT call OPS workflows
7. Update this inventory document
8. Add to branch protection required checks (after merge)

### Adding a New OPS Workflow

1. Create file: `.github/workflows/ops-<name>.yml`
2. Set workflow name: `name: OPS — <Description>`
3. Add triggers: `schedule`, `workflow_dispatch`, `push` (main only)
4. Do NOT add `pull_request` trigger
5. Do NOT call GATE workflows
6. Update this inventory document
7. Do NOT add to branch protection required checks

---

## References

- **PR Template:** `.github/PULL_REQUEST_TEMPLATE.md`
- **Website Process:** `/docs/website.md`
- **Website Governance:** `/docs/website-process.md`
- **Intent Labels:** `/docs/governance/pr-intent-labels.md`
- **ZIP Governance:** `/docs/governance/platform-intent-and-zip-governance.md`

---

**Last Updated:** 2026-02-04  
**Version:** 1.0 (Initial ground-up redesign)
