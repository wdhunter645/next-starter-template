# CI Guardrails Map

**Status:** AUTHORITATIVE  
**Effective Date:** 2026-01-25  
**Purpose:** Comprehensive reference for all CI/CD workflows, quality gates, and automated validation

---

## Overview

This document provides a complete map of all Continuous Integration (CI) and Continuous Deployment (CD) guardrails in the LGFC repository. It serves as the authoritative reference for understanding:

- What each workflow does
- When it runs
- What it validates
- How to fix failures
- Gate enforcement policy

---

## Table of Contents

1. [Action Workflow Inventory](#action-workflow-inventory)
2. [Core CI Workflows](#core-ci-workflows)
3. [Quality Gates](#quality-gates)
4. [Security Workflows](#security-workflows)
5. [Deployment Workflows](#deployment-workflows)
6. [Monitoring & Validation](#monitoring--validation)
7. [Gate Enforcement Policy](#gate-enforcement-policy)
8. [Troubleshooting Guide](#troubleshooting-guide)

---

## Action Workflow Inventory

The table below is the canonical inventory of all GitHub Actions workflows in `.github/workflows/`, including whether each is currently effective (active/operational) or ineffective (parked/legacy or one-off).

| Workflow file | Workflow name | Effectiveness | Primary use |
|---|---|---|---|
| `ai_review.yml` | AI Code Review | Effective | Runs AI-assisted PR review comments/checks to improve code review coverage. |
| `assess-nightly.yml` | Site Assessment (Nightly Drift Detection) | Effective | Nightly drift detection against expected site and route invariants. |
| `b2-d1-daily-sync.yml` | B2 → D1 Daily Sync | Effective | Scheduled sync of Backblaze B2 inventory/data into D1. |
| `b2-s3-smoke-test.yml` | B2 S3 Smoke Test | Effective | Validates S3-compatible B2 credentials/connectivity and basic object operations. |
| `ci.yml` | Legacy LGFC-main Workflow (Parked) | Ineffective (Parked) | Historical legacy CI pipeline; retained only for traceability. |
| `copilot-setup-steps.yml` | Copilot Setup Steps | Effective | Bootstraps/validates automation steps required by Copilot-assisted workflows. |
| `cursor-review.yml` | Cursor PR Review | Effective | Triggers Cursor-based PR review automation for change assessment. |
| `d1-migrations.yml` | D1 Migrations | Effective | Applies/validates D1 schema migrations through controlled CI execution. |
| `deploy-dev.yml` | Legacy LGFC-main Workflow (Parked) | Ineffective (Parked) | Historical development deploy flow retained for rollback context. |
| `deploy-prod.yml` | Legacy LGFC-main Workflow (Parked) | Ineffective (Parked) | Historical production deploy flow retained for rollback context. |
| `deploy.yml` | Legacy LGFC-main Workflow (Parked) | Ineffective (Parked) | Historical unified deploy flow superseded by current deployment controls. |
| `design-authority-check.yml` | Design Authority Check | Effective | Enforces locked design authority constraints for protected UX/design artifacts. |
| `design-compliance-warn.yml` | Design Compliance (Warn) | Effective (Warn-only) | Warn-only design compliance checks for early drift visibility without blocking merges. |
| `diataxis-folder-authority-check.yml` | DIATAXIS Folder Authority Check | Effective | Validates docs folder ownership/boundaries under Diátaxis governance rules. |
| `diataxis-post-merge-validate.yml` | DIATAXIS Post-Merge Validation | Effective | Post-merge docs validation to confirm Diátaxis structural integrity after landing. |
| `docs-guardrails.yml` | Docs Guardrails | Effective | Enforces repository documentation structure, required headers, and docs hygiene rules. |
| `gate-close-work-issue.yml` | gate-close-work-issue | Effective | Closes linked work issues when gating conditions and merge state are satisfied. |
| `gate-drift.yml` | GATE — Drift Control | Effective | Blocks structural/design/process drift (including ZIP and intent governance checks). |
| `gate-ensure-issue.yml` | gate-ensure-issue | Effective | Requires valid linked issue context on PRs before progression through review gates. |
| `gate-intent-labeler.yml` | GATE — Intent Labeler | Effective | Validates/applies PR intent labeling against file-touch governance allowlists. |
| `gate-quality.yml` | GATE — Quality Checks | Effective | Runs blocking quality checks (lint/test/build and related quality gates). |
| `gate-zip-safety.yml` | GATE — ZIP Safety | Effective | Prevents ZIP artifacts from entering tree/history and enforces ZIP safety policy. |
| `gitleaks.yml` | Secret Scan (gitleaks) | Effective | Scans commits and repository content for hardcoded secrets. |
| `lgfc-d1-migrate.yml` | LGFC D1 Migrate (remote) | Effective | Executes remote D1 migration operations for LGFC environments. |
| `lgfc-validate.yml` | Legacy LGFC-main Workflow (Parked) | Ineffective (Parked) | Historical validation flow retained for continuity and audit context. |
| `opencode.yml` | OpenCode Maintenance | Effective | Repository maintenance/automation tasks for OpenCode operations. |
| `ops-assess.yml` | OPS — Site Assessment | Effective | Operations-oriented site assessment run for production/preview validation. |
| `ops-cf-pages-retry.yml` | OPS — Cloudflare Pages Auto-Retry | Effective | Detects and retries eligible failed Cloudflare Pages deployments. |
| `ops-design-compliance-audit.yml` | OPS — Design Compliance Audit | Effective | Performs scheduled/manual design compliance auditing and reporting. |
| `ops-main-change-monitor.yml` | OPS — Main Change Monitor | Effective | Monitors `main` changes and triggers downstream operational oversight tasks. |
| `ops-pr-issue-accounting.yml` | OPS — PR Issue Accounting | Effective | Audits PR-to-issue accounting links for operational traceability. |
| `post-recovery-425-verify.yml` | Post-Recovery Verification (PR #425) | Ineffective (One-off) | Legacy targeted verification workflow created for post-recovery hardening. |
| `pr-triage-zip-taint.yml` | PR Triage - ZIP Taint Classification | Effective | Classifies PRs for ZIP-history taint and routes remediation triage. |
| `preview-invariants.yml` | Preview Invariants (Cloudflare Pages) | Effective | Verifies Cloudflare preview deployments against required runtime/UI invariants. |
| `production-audit.yml` | Production Audit (Playwright Invariants) | Effective | Playwright-based production invariant audit for live environment confidence. |
| `purge-zip-history.yml` | Purge ZIPs from Git History (FORCE PUSH) | Effective (Break-glass) | Break-glass remediation to remove ZIPs from repository history. |
| `snapshot.yml` | Snapshot Backup (Repo + Cloudflare Pages) | Effective | Captures repository and deployment snapshots for recovery and forensics. |
| `test-homepage.yml` | Legacy LGFC-main Workflow (Parked) | Ineffective (Parked) | Historical homepage-specific test flow retained for reference. |
| `test.yml` | Legacy LGFC-main Workflow (Parked) | Ineffective (Parked) | Historical general test flow retained for reference. |
| `update-docs.lock.yml` | Auto-Sync Documentation | Effective | Synchronizes/locks documentation state to keep docs and implementation aligned. |
| `zip-history-audit.yml` | ZIP History Audit (Full History) | Effective | Full-history ZIP artifact audit to detect policy violations in git history. |

> Note: `.github/workflows/update-docs.md` is a markdown playbook, not a runnable workflow.

### Missing Workflow Capabilities (Gap List)

The current workflow suite is strong on governance and drift controls, but these missing capabilities should be considered:

1. **Dependency update automation**
   - Missing: automated dependency update PRs (e.g., npm/Actions ecosystem updates).
   - Value: reduces security drift and patch lag.

2. **SBOM and artifact signing/provenance**
   - Missing: build SBOM generation and signed provenance/attestation for deploy artifacts.
   - Value: improves supply-chain security posture and incident response confidence.

3. **Performance budget enforcement**
   - Missing: blocking Lighthouse/Web Vitals budgets on preview/production builds.
   - Value: prevents gradual UX degradation despite passing functional checks.

4. **Visual regression testing**
   - Missing: screenshot-diff automation for critical pages/components.
   - Value: catches unintended UI shifts not covered by structural assertions.

5. **License compliance scanning**
   - Missing: policy checks for third-party package licenses.
   - Value: reduces legal/compliance risk in release workflows.

6. **Reusable workflow abstraction**
   - Missing: shared reusable workflows/composite actions to reduce duplication across ops/gate jobs.
   - Value: lowers maintenance overhead and configuration drift.

### Workflow Improvement List (Now That New Capabilities Are Being Added)

1. **Consolidate gate overlap into reusable components**
   - Current issue: `gate-*` and `ops-*` workflows contain repeated checkout/setup/validation patterns.
   - Improvement: move shared logic to reusable workflows (`workflow_call`) and composite actions in `.github/actions/`.
   - Outcome: lower maintenance burden and fewer drift bugs.

2. **Standardize workflow outputs and artifacts**
   - Current issue: artifacts, summaries, and output names are inconsistent across workflows.
   - Improvement: require a common artifact contract:
     - `guardrail-summary.json`
     - `guardrail-summary.md`
     - `guardrail-failures.json`
   - Outcome: simpler machine triage and easier post-merge verification automation.

3. **Pin all third-party actions to commit SHAs**
   - Current issue: mixed pinning strategy can introduce supply-chain drift.
   - Improvement: enforce SHA pinning with automated policy checks.
   - Outcome: deterministic and auditable CI execution.

4. **Introduce required duration SLOs per workflow class**
   - Current issue: no explicit runtime budget for gates vs audits.
   - Improvement: define SLOs (example: gate jobs < 10 min, nightly audits < 30 min) and alert on breaches.
   - Outcome: predictable PR cycle times and earlier detection of infrastructure regressions.

5. **Add mandatory status publishing for post-merge operations**
   - Current issue: post-merge success/failure signals are distributed across multiple workflow logs.
   - Improvement: write a unified post-merge status record (issue comment, PR comment, and artifact).
   - Outcome: one place to verify whether intended merged behavior actually materialized.

6. **Harden break-glass workflows with explicit guardrails**
   - Current issue: high-risk workflows (e.g., history rewrites) rely on process discipline.
   - Improvement: enforce environment protection rules, manual approval, and mandatory rollback plan input.
   - Outcome: reduced operational risk during emergency remediation.

### Post-Merge Validation and Auto-Retry (2-Retry Max) Protocol

This repository should use a deterministic closed-loop process after merge to verify intended outcomes and safely retry when drift/failure is detected.

#### A. Validation Trigger and Scope
- Trigger on `push` to `main` after merge completion.
- Run a single orchestrator workflow (recommended: extend `ops-main-change-monitor.yml`) that:
  1. identifies changed files from the merged commits,
  2. maps changed files to required downstream validations,
  3. checks whether expected deployment/config/docs outcomes occurred.

#### B. Success/Failure Decision Contract
- Validation succeeds only if all of the following are true:
  - required workflows for changed paths completed successfully,
  - required artifacts/status files were produced,
  - expected runtime/deploy state is observable (preview/prod invariant checks pass),
  - documentation guardrails remain compliant for docs-impacting merges.
- If any condition fails, mark merge outcome as `incomplete` (not just `failed`).

#### C. Automatic Retry PR Mechanism
- On `incomplete` outcome:
  1. open a new remediation PR automatically,
  2. pull failed/missed file set from the merge SHA and apply deterministic retry patching,
  3. include failure metadata (`failed_workflows`, `missing_artifacts`, `expected_vs_actual`) in PR body.
- Naming convention:
  - Branch: `auto/retry-<merge_sha>-r<attempt>`
  - PR title: `auto-retry: reconcile missed post-merge outcomes (<merge_sha>)`

#### D. Retry Limits and Escalation Rule
- Maintain retry count in a durable state artifact (issue label/comment or retry state file).
- Permit **max 2 retries**:
  - Retry 1: automatic remediation PR
  - Retry 2: automatic remediation PR (final automated attempt)
- If still incomplete after retry 2:
  - stop auto-retry,
  - open a **Design Review escalation issue** with:
    - merge SHA timeline,
    - failed checks and logs,
    - changed files,
    - suspected root-cause category (workflow logic, environment, design-governance mismatch),
  - label with `design-review-required` and `post-merge-retry-exhausted`.

#### E. Implementation Recommendation
- Reuse existing workflow surfaces instead of creating parallel governance:
  - `ops-main-change-monitor.yml` (orchestrator trigger),
  - `ops-assess.yml` + `production-audit.yml` (runtime verification),
  - `docs-guardrails.yml` + `gate-quality.yml` (quality and docs assertions).
- Add a new workflow only for retry orchestration if needed:
  - `ops-post-merge-retry-orchestrator.yml` (state machine + PR creation + escalation).

---

## Core CI Workflows

### 1. LGFC Validate (`lgfc-validate.yml`)

**Purpose:** Primary quality gate for all PRs  
**Triggers:** 
- `pull_request` (opened, synchronize, reopened)
- `push` to `main`

**What it validates:**
1. **Lint Check:** `npm run lint`
   - ESLint rules compliance
   - TypeScript type checking
   - Code style consistency

2. **Unit Tests:** `npm test`
   - Component tests
   - Utility function tests
   - Business logic tests

3. **Build Check:** `npm run build:cf`
   - Next.js static export
   - TypeScript compilation
   - Asset generation

**Enforcement:** ✅ **BLOCKING** - Must pass before merge  
**Failure Action:** Fix linting/test/build errors in code

**Common Failures:**
```bash
# Lint failures
npm run lint:fix

# Test failures
npm test -- --watch

# Build failures
npm run build:cf
# Review build output for errors
```

---

### 2. Drift Gate (`drift-gate.yml`)

**Purpose:** Prevent structural drift and enforce design standards  
**Triggers:**
- `pull_request` (opened, synchronize, reopened, labeled, unlabeled, ready_for_review)
- `workflow_dispatch`

**What it validates:**
1. **ZIP Guard (Tree):**
   - No `.zip` files in repository tree
   - Prevents accidental ZIP commits

2. **ZIP Guard (PR History):**
   - No ZIP files in commit history
   - Runs `scripts/ci/verify_zip_history_pr.sh`

3. **PR Intent Allowlist:**
   - Validates PR labels and intent
   - Runs `scripts/ci/verify_pr_intent_allowlist.mjs`

4. **Critical LGFC Invariants:**
   - Validates locked design elements
   - Runs `scripts/ci/verify_lgfc_invariants.mjs`

**Enforcement:** ✅ **BLOCKING** - Must pass before merge  
**Failure Actions:**
- ZIP detected → Remove ZIP files, close PR, create fresh PR from clean branch
- Intent violation → Add appropriate labels OR split PR into multiple PRs
- Invariant violation → Restore locked design elements

**Intent Labels:**
The workflow validates that PRs have exactly ONE intent label matching file-touch patterns:
- `infra` — CI/workflows/build config (`.github/**`, `scripts/**`, config files)
- `feature` — App code/UI/API (`src/**`, `functions/**`, `migrations/**`)
- `docs-only` — Documentation only (`docs/**`, `Agent.md`, `active_tasklist.md`)
- `platform` — Cloudflare runtime config only (`wrangler.toml`, `functions/**`)
- `change-ops` — Operational changes (`migrations/**`, database scripts, operational tools)
- `codex` — AI/agent config (`.github/copilot-instructions.md`, `.github/agents/**`)
- `recovery` — Break-glass emergency fixes (all paths allowed, manual assignment only)

See `/docs/governance/pr-intent-labels.md` for full intent definitions and allowlists.
See `/.github/platform-intent-and-zip-governance.md` for intent governance and ZIP policy.

---

### 3. CI Workflow (`ci.yml`)

**Purpose:** Extended CI validation  
**Triggers:**
- `push` to `main`
- `pull_request`

**What it validates:**
- Runs extended test suite
- Integration tests
- Cross-platform compatibility

**Enforcement:** ⚠️ **ADVISORY** - Should pass, but may not block  

---

### 4. Test Workflows

#### Test.yml
**Purpose:** Run test suite  
**Triggers:** `push`, `pull_request`  
**Runs:** `npm test`  
**Enforcement:** ✅ **BLOCKING**

#### Test Homepage (`test-homepage.yml`)
**Purpose:** Homepage structure validation  
**Triggers:** `pull_request` affecting homepage  
**Runs:** `npm run test:homepage-sections`  
**What it validates:**
- Section visibility and order
- V6 token compliance
- Social Wall presence
- Color token correctness

**Enforcement:** ✅ **BLOCKING** for homepage changes  

---

## Quality Gates

### 5. Assessment Harness (`assess.yml`)

**Purpose:** Validate design compliance and route structure  
**Triggers:**
- `pull_request`
- `push` to `main`

**What it validates:**
1. **Build Success:** Site builds without errors
2. **Required Routes:** All required routes exist in static export
3. **Forbidden Routes:** Legacy/parked routes are absent
4. **Navigation Invariants:**
   - Header button labels and order
   - Hamburger menu structure
   - Footer links and copyright
5. **Page Markers:** Required headings/sections on key pages

**Artifacts Generated:**
- `assess-report.json` - Detailed results (30-day retention)
- `assess-summary.md` - Human-readable summary (30-day retention)
- `routes-found.json` - Route index (30-day retention)

**Enforcement:** ✅ **BLOCKING** - PRs cannot merge if assessment fails  

**Configuration:** `/docs/assess/manifest.json`

---

### 6. Assessment Nightly (`assess-nightly.yml`)

**Purpose:** Detect drift from dependencies or unintended changes  
**Triggers:**
- Scheduled: Daily at 2:00 AM UTC
- `workflow_dispatch` (manual)

**What it does:**
- Runs full assessment harness
- Creates GitHub issue on failure (label: `assessment-failure`)
- Uploads artifacts with 90-day retention

**Enforcement:** ⚠️ **MONITORING** - Creates alerts, does not block  

---

### 7. Design Compliance Warning (`design-compliance-warn.yml`)

**Purpose:** Early detection of design drift  
**Triggers:** `pull_request`

**What it validates:**
- Missing PR template sections
- Allowlist violations
- Undocumented changes

**Enforcement:** ⚠️ **WARN-ONLY** - Never blocks PRs, always green ✅  
**Purpose:** Provides feedback, not enforcement

**Future:** May be upgraded to blocking in Day-2 hardening phase

---

## Security Workflows

### 8. Gitleaks (`gitleaks.yml`)

**Purpose:** Detect secrets and credentials in code  
**Triggers:**
- `pull_request`
- `push`

**What it scans:**
- API keys
- Passwords
- Tokens
- Private keys
- Database credentials

**Enforcement:** ✅ **BLOCKING** - Must pass before merge  
**Failure Action:** Remove secrets, use environment variables

**Configuration:** `.gitleaks.toml`

---

### 9. Block ZIP Artifacts (`block-zip-artifacts.yml`)

**Purpose:** Prevent ZIP files from being committed  
**Triggers:** `pull_request`

**What it validates:**
- No `.zip` or `.ZIP` files in PR diff
- Automated comment if ZIP detected

**Enforcement:** ✅ **BLOCKING**  
**Failure Action:** Remove ZIP files from commits

---

### 10. Purge ZIP History (`purge-zip-history.yml`)

**Purpose:** Clean ZIP files from git history  
**Triggers:** `workflow_dispatch` (manual only)

**What it does:**
- Scans repository history for ZIP files
- Can purge ZIPs using git-filter-repo (admin-only)

**Enforcement:** N/A - Administrative tool  

---

### 11. ZIP History Audit (`zip-history-audit.yml`)

**Purpose:** Continuous monitoring for ZIP files in history  
**Triggers:**
- Scheduled: Weekly
- `workflow_dispatch`

**What it does:**
- Scans full repository history
- Reports any ZIP files found
- Creates issue if ZIPs detected

**Enforcement:** ⚠️ **MONITORING**  

---

## Deployment Workflows

### 12. Deploy Production (`deploy-prod.yml`)

**Purpose:** Production deployment to Cloudflare Pages  
**Triggers:**
- `push` to `main` (automatic)
- `workflow_dispatch` (manual)

**Steps:**
1. Checkout code
2. Install dependencies
3. Build static export (`npm run build:cf`)
4. Deploy to Cloudflare Pages

**Prerequisites:**
- All CI checks passing
- PR approved and merged
- D1 bindings configured (if needed)

**Enforcement:** Automatic on merge to main  

---

### 13. Deploy Dev (`deploy-dev.yml`)

**Purpose:** Development/staging deployment  
**Triggers:**
- `push` to dev branches
- `workflow_dispatch`

**Steps:** Same as production deployment, different environment

**Enforcement:** Automatic for dev branches  

---

### 14. Cloudflare Pages Auto-Retry (`cf-pages-auto-retry.yml`)

**Purpose:** Retry failed Cloudflare deployments  
**Triggers:** 
- Deployment failure webhook
- `workflow_dispatch`

**What it does:**
- Detects transient deployment failures
- Automatically retries (up to 3 times)
- Creates issue if retry exhausted

**Enforcement:** ⚠️ **AUTOMATIC RECOVERY**  

---

## Monitoring & Validation

### 15. D1 Migrations (`d1-migrations.yml`)

**Purpose:** Database schema validation  
**Triggers:**
- `pull_request` affecting migrations
- `push` to `main`

**What it validates:**
- Migration files are valid
- Migrations apply cleanly
- Schema is consistent

**Enforcement:** ✅ **BLOCKING** for migration changes  

---

### 16. B2/D1 Daily Sync (`b2-d1-daily-sync.yml`)

**Purpose:** Database backup and sync  
**Triggers:** Scheduled: Daily at 3:00 AM UTC

**What it does:**
- Backs up D1 database
- Syncs to Backblaze B2
- Verifies backup integrity

**Enforcement:** ⚠️ **MONITORING**  

---

### 17. B2/S3 Smoke Test (`b2-s3-smoke-test.yml`)

**Purpose:** Verify backup system health  
**Triggers:**
- Scheduled: Weekly
- `workflow_dispatch`

**What it validates:**
- B2 connectivity
- Backup accessibility
- Restore capability

**Enforcement:** ⚠️ **MONITORING**  

---

### 18. Snapshot (`snapshot.yml`)

**Purpose:** Daily repository snapshots for rollback  
**Triggers:** Scheduled: Daily at 7:00 AM UTC

**What it captures:**
- Repository state
- Build artifacts
- Configuration files

**Retention:** 90 days  
**Enforcement:** ⚠️ **OPERATIONAL TOOL**  

---

### 19. Intent Labeler (`intent-labeler.yml`)

**Purpose:** Automatic PR labeling based on file-touch analysis  
**Triggers:** `pull_request` (opened, synchronize, reopened, ready_for_review)

**What it does:**
- Analyzes changed files in PR
- Determines which intent matches ALL changed files
- Applies appropriate intent label:
  - `docs-only` — Only documentation changed
  - `infra` — CI/workflows/build config
  - `platform` — Cloudflare runtime config only
  - `feature` — App code/UI/API
  - `change-ops` — Operational changes/migrations
  - `codex` — AI/agent configuration
- Posts guidance comment if mixed intent detected (files span multiple categories)

**Priority order:** docs-only → infra → platform → feature → change-ops → codex

**Note:** `recovery` intent is NOT auto-assigned; must be manually applied for emergency fixes.

**Enforcement:** ⚠️ **AUTOMATIC LABELING** (does not block PRs, but drift-gate requires intent label)  

---

### 20. Quality (`quality.yml`)

**Purpose:** Code quality metrics  
**Triggers:** `pull_request`, `push`

**What it measures:**
- Code complexity
- Test coverage
- Dependency health

**Enforcement:** ⚠️ **ADVISORY**  

---

### 21. Design Compliance Audit (`design-compliance-audit.yml`)

**Purpose:** Day 2 Operations — Fail-Loud Design Compliance Audit  
**Triggers:**
- `pull_request` (all branches)
- `push` to `main`
- Scheduled: Nightly at 2:00 AM UTC
- `workflow_dispatch` (manual)

**What it validates:**

This workflow monitors and reports misalignment between **as-built production/preview behavior** and **documented design expectations** through HTTP + HTML assertions:

1. **Homepage Sanity**
   - HTTP 200 status code
   - No infinite-loading markers (`Loading matchup`, `Loading…`)

2. **Auth-State Correctness (Logged-Out)**
   - Homepage must NOT contain auth-only elements when unauthenticated:
     - `Logout` button
     - `Club Home` button

3. **Route Gating**
   - `/fanclub` must return redirect (3xx) for unauthenticated requests
   - Should NOT return 200 (indicates broken auth gate)

4. **Join/Login Runtime Health**
   - `/join` returns HTTP 200
   - `/login` returns HTTP 200
   - Neither page contains `missing_env` marker

5. **Contact/Support Pages**
   - `/contact` returns HTTP 200
   - No Cloudflare email obfuscation links (`/cdn-cgi/l/email-protection`)

**Output:**

Generates a **Mismatch Report** in job logs with clear PASS/FAIL status for each check.

**Example:**
```
================================================================================
DESIGN COMPLIANCE AUDIT — MISMATCH REPORT
================================================================================
Target URL: https://www.lougehrigfanclub.com

FAILURES (2):
  ✗ FAIL: /fanclub returned 200 (expected redirect)
  ✗ FAIL: Homepage contains "Logout" while logged out

PASSED (8):
  ✓ PASS: Homepage returns 200
  ✓ PASS: Homepage does not contain loading indicators
  ...
================================================================================
```

**Enforcement:** ✅ **ALERT-ONLY (ALWAYS GREEN)**  
- Workflow always succeeds (green ✅) regardless of audit results
- Uses `continue-on-error: true` to ensure non-blocking behavior
- **NOT** added to branch protection required checks
- **DOES NOT** block PR merges
- Purpose: **Observability only** — surface drift for triage
- Mismatch reports saved as artifacts for review

**Behavior by Trigger:**
- **PRs:** Audit is SKIPPED (preview URL not yet available; no production fallback)
- **Push to main:** Audits production URL
- **Nightly schedule:** Audits production URL
- **Manual dispatch:** Audits production URL

**Triage Process:**

When a mismatch is detected, it should be triaged as either:

1. **Code/Config Fix** — as-built should match as-designed
   - Example: Auth gate is broken → fix the auth middleware
   - Create a follow-up PR to restore expected behavior

2. **Documentation Update** — as-designed should match as-built
   - Example: Design spec is outdated → update the docs
   - Create a follow-up PR to align documentation with reality

**Implementation:**
- Script: `scripts/ci/design-compliance-audit.mjs`
- Uses Node.js built-in `http`/`https` modules (no external dependencies)
- Deterministic checks only (no flaky UI automation)
- Runtime: < 10 seconds
- Artifacts: Audit report uploaded with 30-day retention

**Current Behavior:**
- **PRs are skipped** — no preview URL integration yet; production fallback removed
- Production audits run on: push to main, nightly schedule, manual dispatch
- Workflow always exits green to ensure truly non-blocking behavior

**Future Enhancements:**
- Integrate with Cloudflare API to get PR preview URLs
- Add comment-triggered workflow that runs after deployment completes
- Expand checks based on documented design invariants

---

## Gate Enforcement Policy

### Blocking Gates (MUST PASS)

PRs **CANNOT** merge if these fail:
1. ✅ LGFC Validate (lint, test, build)
2. ✅ Drift Gate (ZIP prohibition, invariants)
3. ✅ Assessment Harness (routes, navigation, design)
4. ✅ Gitleaks (secret scanning)
5. ✅ Block ZIP Artifacts
6. ✅ Test workflows
7. ✅ D1 Migrations (if migrations changed)

### Advisory Gates (SHOULD PASS)

These should pass but may not block:
1. ⚠️ Design Compliance Warning (warn-only)
2. ⚠️ Quality metrics
3. ⚠️ CI extended tests

### Fail-Loud, Non-Blocking Gates

These fail with red ❌ when issues are detected but **DO NOT** block PR merges:
1. (None currently — Design Compliance Audit migrated to Alert-Only)

### Alert-Only Gates (ALWAYS GREEN)

These always show green ✅ but provide observability alerts:
1. ✅ Design Compliance Audit (alert-only, observability)
   - Purpose: Surface production drift for triage
   - Skips PR runs (no preview URL); audits production on main/nightly
   - Mismatches saved in artifacts for review
   - Not enforced as a merge requirement

### Monitoring Gates (NON-BLOCKING)

These provide alerts but don't block:
1. ⚠️ Assessment Nightly
2. ⚠️ ZIP History Audit
3. ⚠️ B2/D1 Daily Sync
4. ⚠️ B2/S3 Smoke Test

---

## Troubleshooting Guide

### LGFC Validate Failures

**Lint errors:**
```bash
npm run lint
npm run lint:fix  # Auto-fix where possible
```

**Test failures:**
```bash
npm test -- --watch  # Interactive mode
npm test -- --coverage  # Check coverage
```

**Build failures:**
```bash
npm run build:cf
# Check output for specific errors
# Common: TypeScript errors, missing files, import issues
```

---

### Drift Gate Failures

**ZIP files detected:**
```bash
# Find ZIP files
git ls-files | grep -i '\.zip$'

# Remove from tree
git rm '*.zip'
git commit -m "chore: remove ZIP files"

# If in history, use git filter
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch '*.zip'" \
  --prune-empty --tag-name-filter cat -- --all
```

**Invariant violations:**
```bash
# Run local validation
node scripts/ci/verify_lgfc_invariants.mjs

# Review output for specific violations
# Fix by restoring locked design elements
```

**Intent violations:**
```bash
# Add appropriate intent label to PR
# Available: infra, feature, docs-only, platform, change-ops, codex
# See /docs/governance/pr-intent-labels.md for details
```

---

### Assessment Failures

**Missing routes:**
```bash
# Run assessment locally
npm run assess

# Review reports/assess/assess-summary.md
# Add missing pages or remove from manifest if intentional
```

**Navigation invariants:**
```bash
# Check header component
# Verify button labels match manifest
# Check hamburger menu structure
# See docs/reference/design/LGFC-Production-Design-and-Standards.md
```

**Page markers:**
```bash
# Verify required headings present
# Check case-sensitive text matching
# Review HTML structure
```

---

### Gitleaks Failures

**Secret detected:**
```bash
# NEVER commit real secrets
# Remove secret from code
git rm path/to/file
# Or edit file to use environment variables

# If already committed:
# 1. Rotate the secret immediately
# 2. Remove from git history:
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch path/to/file" \
  HEAD~1..HEAD
```

**False positives:**
```bash
# Add to .gitleaks.toml allowlist
# Document reason in commit message
```

---

### Deployment Failures

**Build fails on Cloudflare:**
```bash
# Check Cloudflare Pages build logs
# Common issues:
# - Environment variables missing
# - Node version mismatch
# - Dependency installation failure

# Verify locally:
npm run build:cf
npx wrangler pages deploy out --dry-run
```

**Runtime errors:**
```bash
# Check D1 bindings configured
# Check environment variables set
# Test endpoints:
curl https://your-site.pages.dev/api/d1-test
```

---

## Workflow Dependencies

```
┌─────────────────┐
│  Pull Request   │
└────────┬────────┘
         │
         ├──> LGFC Validate (BLOCKING)
         ├──> Drift Gate (BLOCKING)
         ├──> Assessment (BLOCKING)
         ├──> Gitleaks (BLOCKING)
         ├──> Block ZIP (BLOCKING)
         ├──> Design Compliance (WARN)
         └──> Intent Labeler (AUTO)
         │
         ▼
    ┌─────────┐
    │  Merge  │ ◄─── All blocking gates PASS
    └────┬────┘
         │
         ▼
    ┌─────────────┐
    │ Deploy Prod │ ◄─── Automatic on merge to main
    └─────────────┘
```

---

## Quick Reference

### Before Creating PR

```bash
# Local validation
npm run lint
npm test
npm run test:e2e
npm run build:cf
npm run assess

# Check for ZIPs
git ls-files | grep -i '\.zip$'

# Check for secrets
docker run -v $(pwd):/repo zricethezav/gitleaks:latest detect --source /repo
```

### During PR Review

- ✅ All CI checks green
- ✅ Drift gate passed
- ✅ Assessment passed
- ✅ No ZIP files
- ✅ Documentation updated (if applicable)
- ✅ Tests added/updated
- ✅ Code review approved

### After Merge

- 🚀 Automatic deployment to production
- 📊 Monitor Cloudflare Pages deployment status
- 🔍 Verify deployed site
- 📝 Check nightly assessment results next day

---

## Maintenance

### Adding New Workflows

1. Create workflow file in `.github/workflows/`
2. Add to this CI Guardrails Map
3. Update gate enforcement policy
4. Add troubleshooting section
5. Test on feature branch
6. Document in PR description

### Updating Existing Workflows

1. Modify workflow file
2. Update this CI Guardrails Map
3. Update troubleshooting guide
4. Test changes
5. Document in PR description
6. Update version history below

---

## References

**Workflow Directory:** `.github/workflows/`  
**CI Scripts:** `scripts/ci/`  
**Assessment Manifest:** `/docs/assess/manifest.json`  

**Related Documentation:**
- `/docs/OPERATING_MANUAL.md` - Operational procedures
- `/docs/LOCKED_DESIGN_SPEC.md` - Design standards
- `/docs/governance/PR_GOVERNANCE.md` - Process and governance
- `/docs/TROUBLESHOOTING.md` - General troubleshooting

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-01-25 | Initial CI guardrails map (ZIP #1) |

---

**END OF CI GUARDRAILS MAP**
