# CI Workflow Inventory

## Purpose

This document is the single authoritative inventory of **all GitHub Actions workflows** in this repository.

It exists to prevent “mystery CI” and to make every check explainable:
- What automation exists
- Why it exists
- What value it provides
- What a failure means

## Inventory (By Workflow File)

| Workflow file | Display name | Triggers |
|---|---|---|
| `ai_review.yml` | AI Code Review | push |
| `assess-nightly.yml` | Site Assessment (Nightly Drift Detection) | schedule, workflow_dispatch |
| `assess.yml` | Site Assessment (PR Gate) | pull_request(['**']), push(['main']) |
| `b2-d1-daily-sync.yml` | B2 → D1 Daily Sync | workflow_dispatch, schedule |
| `b2-s3-smoke-test.yml` | B2 S3 Smoke Test | workflow_dispatch, schedule |
| `block-zip-artifacts.yml` | Block ZIP Artifacts | pull_request(['main', 'develop']) |
| `cf-pages-auto-retry.yml` | CF Pages Auto-Retry on Flake | pull_request, workflow_dispatch |
| `ci.yml` | Legacy LGFC-main Workflow (Parked) | workflow_dispatch |
| `d1-migrations.yml` | D1 Migrations | push(['main']) |
| `deploy-dev.yml` | Legacy LGFC-main Workflow (Parked) | workflow_dispatch |
| `deploy-prod.yml` | Legacy LGFC-main Workflow (Parked) | workflow_dispatch |
| `deploy.yml` | Legacy LGFC-main Workflow (Parked) | workflow_dispatch |
| `design-compliance-audit.yml` | Design Compliance Audit (Alert-Only) | pull_request(['**']), push(['main']), schedule, workflow_dispatch |
| `design-compliance-warn.yml` | Design Compliance (Warn) | pull_request |
| `drift-gate.yml` | Drift Gate (Lean) | pull_request, workflow_dispatch |
| `gitleaks.yml` | Secret Scan (gitleaks) | pull_request, push(['main']), workflow_dispatch |
| `intent-labeler.yml` | Intent Labeler | pull_request |
| `lgfc-validate.yml` | Legacy LGFC-main Workflow (Parked) | workflow_dispatch |
| `opencode.yml` | OpenCode Maintenance | issue_comment |
| `post-recovery-425-verify.yml` | Post-Recovery Verification (PR | pull_request(['main']), workflow_dispatch |
| `pr-triage-zip-taint.yml` | PR Triage - ZIP Taint Classification | workflow_dispatch |
| `preview-invariants.yml` | Preview Invariants (Cloudflare Pages) | pull_request, workflow_dispatch |
| `production-audit.yml` | Production Audit (Playwright Invariants) | schedule, workflow_dispatch |
| `purge-zip-history.yml` | Purge ZIPs from Git History (FORCE PUSH) | workflow_dispatch |
| `quality.yml` | Quality Checks (LGFC-Lite) | pull_request, push(['main']) |
| `snapshot.yml` | Legacy LGFC-main Workflow (Parked) | workflow_dispatch |
| `test-homepage.yml` | Legacy LGFC-main Workflow (Parked) | workflow_dispatch |
| `test.yml` | Legacy LGFC-main Workflow (Parked) | workflow_dispatch |
| `zip-history-audit.yml` | ZIP History Audit (Full History) | pull_request(['main']), workflow_dispatch |

## Required Detail Format

Every workflow must be understood in these terms:
- **What it is** (purpose)
- **Why it exists** (problem it prevents / value it adds)
- **How it is set up** (triggers + key inputs)
- **What failure means** (actionable interpretation)
- **Blocking vs informational** (whether it must be green to merge)

## Workflow Details

### `ai_review.yml`

**What it is:** AI Code Review

**Why it exists:** AI advisory review workflow (non-authoritative, bounded).

**How it is set up:** Triggers = push.

**Expected value:** Prevents regressions and enforces governance consistency.

**What failure means:** The workflow detected a condition that violates its intent; review logs and correct the underlying issue (not the symptom).

**Merge impact:** Informational

### `assess-nightly.yml`

**What it is:** Site Assessment (Nightly Drift Detection)

**Why it exists:** Nightly drift/regression assessment.

**How it is set up:** Triggers = schedule, workflow_dispatch.

**Expected value:** Prevents regressions and enforces governance consistency.

**What failure means:** The workflow detected a condition that violates its intent; review logs and correct the underlying issue (not the symptom).

**Merge impact:** Informational

### `assess.yml`

**What it is:** Site Assessment (PR Gate)

**Why it exists:** Site assessment gate for PRs and/or main pushes.

**How it is set up:** Triggers = pull_request(['**']), push(['main']).

**Expected value:** Prevents regressions and enforces governance consistency.

**What failure means:** The workflow detected a condition that violates its intent; review logs and correct the underlying issue (not the symptom).

**Merge impact:** Blocking (typical PR gate)

### `b2-d1-daily-sync.yml`

**What it is:** B2 → D1 Daily Sync

**Why it exists:** Synchronizes B2 content into D1 on a schedule to keep content current.

**How it is set up:** Triggers = workflow_dispatch, schedule.

**Expected value:** Prevents regressions and enforces governance consistency.

**What failure means:** The workflow detected a condition that violates its intent; review logs and correct the underlying issue (not the symptom).

**Merge impact:** Informational

### `b2-s3-smoke-test.yml`

**What it is:** B2 S3 Smoke Test

**Why it exists:** Validates B2 S3-compatible connectivity/credentials (smoke test).

**How it is set up:** Triggers = workflow_dispatch, schedule.

**Expected value:** Prevents regressions and enforces governance consistency.

**What failure means:** The workflow detected a condition that violates its intent; review logs and correct the underlying issue (not the symptom).

**Merge impact:** Informational

### `block-zip-artifacts.yml`

**What it is:** Block ZIP Artifacts

**Why it exists:** Prevents ZIP files from being committed into the repo and/or history.

**How it is set up:** Triggers = pull_request(['main', 'develop']).

**Expected value:** Prevents regressions and enforces governance consistency.

**What failure means:** The workflow detected a condition that violates its intent; review logs and correct the underlying issue (not the symptom).

**Merge impact:** Blocking (typical PR gate)

### `cf-pages-auto-retry.yml`

**What it is:** CF Pages Auto-Retry on Flake

**Why it exists:** Automatically retries stalled Cloudflare preview deployments to reduce PR friction.

**How it is set up:** Triggers = pull_request, workflow_dispatch.

**Expected value:** Prevents regressions and enforces governance consistency.

**What failure means:** The workflow detected a condition that violates its intent; review logs and correct the underlying issue (not the symptom).

**Merge impact:** Blocking (typical PR gate)

### `ci.yml`

**What it is:** Legacy LGFC-main Workflow (Parked)

**Why it exists:** Main CI pipeline (tests, lint, build) executed on PRs/pushes.

**How it is set up:** Triggers = workflow_dispatch.

**Expected value:** Prevents regressions and enforces governance consistency.

**What failure means:** The workflow detected a condition that violates its intent; review logs and correct the underlying issue (not the symptom).

**Merge impact:** Blocking (typical PR gate)

### `d1-migrations.yml`

**What it is:** D1 Migrations

**Why it exists:** Applies D1 migrations or validates migration integrity.

**How it is set up:** Triggers = push(['main']).

**Expected value:** Prevents regressions and enforces governance consistency.

**What failure means:** The workflow detected a condition that violates its intent; review logs and correct the underlying issue (not the symptom).

**Merge impact:** Blocking (typical PR gate)

### `deploy-dev.yml`

**What it is:** Legacy LGFC-main Workflow (Parked)

**Why it exists:** Preview/dev deployment workflow (if used).

**How it is set up:** Triggers = workflow_dispatch.

**Expected value:** Prevents regressions and enforces governance consistency.

**What failure means:** The workflow detected a condition that violates its intent; review logs and correct the underlying issue (not the symptom).

**Merge impact:** Blocking (typical PR gate)

### `deploy-prod.yml`

**What it is:** Legacy LGFC-main Workflow (Parked)

**Why it exists:** Production deployment workflow (if used).

**How it is set up:** Triggers = workflow_dispatch.

**Expected value:** Prevents regressions and enforces governance consistency.

**What failure means:** The workflow detected a condition that violates its intent; review logs and correct the underlying issue (not the symptom).

**Merge impact:** Blocking (typical PR gate)

### `deploy.yml`

**What it is:** Legacy LGFC-main Workflow (Parked)

**Why it exists:** Primary deployment workflow for Cloudflare Pages (build + deploy).

**How it is set up:** Triggers = workflow_dispatch.

**Expected value:** Prevents regressions and enforces governance consistency.

**What failure means:** The workflow detected a condition that violates its intent; review logs and correct the underlying issue (not the symptom).

**Merge impact:** Blocking (typical PR gate)

### `design-compliance-audit.yml`

**What it is:** Design Compliance Audit (Alert-Only)

**Why it exists:** Audits repository for design compliance (strict gate).

**How it is set up:** Triggers = pull_request(['**']), push(['main']), schedule, workflow_dispatch.

**Expected value:** Prevents regressions and enforces governance consistency.

**What failure means:** The workflow detected a condition that violates its intent; review logs and correct the underlying issue (not the symptom).

**Merge impact:** Informational

### `design-compliance-warn.yml`

**What it is:** Design Compliance (Warn)

**Why it exists:** Warn-level design compliance check (non-blocking early warning).

**How it is set up:** Triggers = pull_request.

**Expected value:** Prevents regressions and enforces governance consistency.

**What failure means:** The workflow detected a condition that violates its intent; review logs and correct the underlying issue (not the symptom).

**Merge impact:** Blocking (typical PR gate)

### `drift-gate.yml`

**What it is:** Drift Gate (Lean)

**Why it exists:** Blocks unintended drift from locked design/governance and disallowed file touches.

**How it is set up:** Triggers = pull_request, workflow_dispatch.

**Expected value:** Prevents regressions and enforces governance consistency.

**What failure means:** The workflow detected a condition that violates its intent; review logs and correct the underlying issue (not the symptom).

**Merge impact:** Blocking (typical PR gate)

### `gitleaks.yml`

**What it is:** Secret Scan (gitleaks)

**Why it exists:** Secret scanning to prevent credential leakage.

**How it is set up:** Triggers = pull_request, push(['main']), workflow_dispatch.

**Expected value:** Prevents regressions and enforces governance consistency.

**What failure means:** The workflow detected a condition that violates its intent; review logs and correct the underlying issue (not the symptom).

**Merge impact:** Blocking (typical PR gate)

### `intent-labeler.yml`

**What it is:** Intent Labeler

**Why it exists:** Enforces PR intent labels so governance gates can be applied deterministically.

**How it is set up:** Triggers = pull_request.

**Expected value:** Prevents regressions and enforces governance consistency.

**What failure means:** The workflow detected a condition that violates its intent; review logs and correct the underlying issue (not the symptom).

**Merge impact:** Blocking (typical PR gate)

### `lgfc-validate.yml`

**What it is:** Legacy LGFC-main Workflow (Parked)

**Why it exists:** LGFC-specific validation (routes/invariants/content) to protect production UX.

**How it is set up:** Triggers = workflow_dispatch.

**Expected value:** Prevents regressions and enforces governance consistency.

**What failure means:** The workflow detected a condition that violates its intent; review logs and correct the underlying issue (not the symptom).

**Merge impact:** Blocking (typical PR gate)

### `opencode.yml`

**What it is:** OpenCode Maintenance

**Why it exists:** OpenCode/HF advisory review workflow (human-triggered; bounded).

**How it is set up:** Triggers = issue_comment.

**Expected value:** Prevents regressions and enforces governance consistency.

**What failure means:** The workflow detected a condition that violates its intent; review logs and correct the underlying issue (not the symptom).

**Merge impact:** Informational

### `post-recovery-425-verify.yml`

**What it is:** Post-Recovery Verification (PR

**Why it exists:** Post-recovery verification workflow (historical but still runnable).

**How it is set up:** Triggers = pull_request(['main']), workflow_dispatch.

**Expected value:** Prevents regressions and enforces governance consistency.

**What failure means:** The workflow detected a condition that violates its intent; review logs and correct the underlying issue (not the symptom).

**Merge impact:** Informational

### `pr-triage-zip-taint.yml`

**What it is:** PR Triage - ZIP Taint Classification

**Why it exists:** Flags PRs impacted by ZIP taint/history issues for triage.

**How it is set up:** Triggers = workflow_dispatch.

**Expected value:** Prevents regressions and enforces governance consistency.

**What failure means:** The workflow detected a condition that violates its intent; review logs and correct the underlying issue (not the symptom).

**Merge impact:** Blocking (typical PR gate)

### `preview-invariants.yml`

**What it is:** Preview Invariants (Cloudflare Pages)

**Why it exists:** Ensures preview builds preserve required invariants.

**How it is set up:** Triggers = pull_request, workflow_dispatch.

**Expected value:** Prevents regressions and enforces governance consistency.

**What failure means:** The workflow detected a condition that violates its intent; review logs and correct the underlying issue (not the symptom).

**Merge impact:** Blocking (typical PR gate)

### `production-audit.yml`

**What it is:** Production Audit (Playwright Invariants)

**Why it exists:** Production audit checks run on schedule or on main to detect regressions.

**How it is set up:** Triggers = schedule, workflow_dispatch.

**Expected value:** Prevents regressions and enforces governance consistency.

**What failure means:** The workflow detected a condition that violates its intent; review logs and correct the underlying issue (not the symptom).

**Merge impact:** Informational

### `purge-zip-history.yml`

**What it is:** Purge ZIPs from Git History (FORCE PUSH)

**Why it exists:** Manual/controlled workflow to rewrite history to remove ZIP artifacts (used rarely).

**How it is set up:** Triggers = workflow_dispatch.

**Expected value:** Prevents regressions and enforces governance consistency.

**What failure means:** The workflow detected a condition that violates its intent; review logs and correct the underlying issue (not the symptom).

**Merge impact:** Blocking (typical PR gate)

### `quality.yml`

**What it is:** Quality Checks (LGFC-Lite)

**Why it exists:** Quality gates (lint/format/typecheck) for PR readiness.

**How it is set up:** Triggers = pull_request, push(['main']).

**Expected value:** Prevents regressions and enforces governance consistency.

**What failure means:** The workflow detected a condition that violates its intent; review logs and correct the underlying issue (not the symptom).

**Merge impact:** Blocking (typical PR gate)

### `snapshot.yml`

**What it is:** Legacy LGFC-main Workflow (Parked)

**Why it exists:** Creates repository snapshot artifacts used for backup/restore per docs/backup.md.

**How it is set up:** Triggers = workflow_dispatch.

**Expected value:** Prevents regressions and enforces governance consistency.

**What failure means:** The workflow detected a condition that violates its intent; review logs and correct the underlying issue (not the symptom).

**Merge impact:** Informational

### `test-homepage.yml`

**What it is:** Legacy LGFC-main Workflow (Parked)

**Why it exists:** Homepage structure/invariant tests to prevent regressions.

**How it is set up:** Triggers = workflow_dispatch.

**Expected value:** Prevents regressions and enforces governance consistency.

**What failure means:** The workflow detected a condition that violates its intent; review logs and correct the underlying issue (not the symptom).

**Merge impact:** Blocking (typical PR gate)

### `test.yml`

**What it is:** Legacy LGFC-main Workflow (Parked)

**Why it exists:** Test runner workflow (unit/integration) executed on PRs/pushes.

**How it is set up:** Triggers = workflow_dispatch.

**Expected value:** Prevents regressions and enforces governance consistency.

**What failure means:** The workflow detected a condition that violates its intent; review logs and correct the underlying issue (not the symptom).

**Merge impact:** Blocking (typical PR gate)

### `zip-history-audit.yml`

**What it is:** ZIP History Audit (Full History)

**Why it exists:** Audits git history for ZIP artifacts; fails when ZIP contamination is detected.

**How it is set up:** Triggers = pull_request(['main']), workflow_dispatch.

**Expected value:** Prevents regressions and enforces governance consistency.

**What failure means:** The workflow detected a condition that violates its intent; review logs and correct the underlying issue (not the symptom).

**Merge impact:** Blocking (typical PR gate)

## Cross-References

- Backup policy: `docs/backup.md`
- Recovery procedures: `docs/RECOVERY.md`
- PR governance: `docs/website-process.md` and `docs/website-PR-governance.md`
- Agent controls: `Agent.md`
