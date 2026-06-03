---
Doc Type: Reference
Audience: Human + AI
Authority Level: Controlled
Owns: LGFC post-merge validation surface, evidence reporting model, remediation and orchestration pause behavior, source-issue closeout behavior
Does Not Own: Pre-merge merge protection gates, OPS runtime monitoring behavior, website product behavior
Canonical Reference: /docs/explanation/ci/lgfc-ci-production-design.md
Related Issues: #1197, #1249, #1075, #1058
Last Reviewed: 2026-06-03
---

# LGFC Post-Merge Validation Surface

## Purpose

This reference documents Task 004 post-merge validation expansion and the
source-issue closeout behavior added after Task 003. Post-merge validation
inspects merged code and PR governance evidence after landings on `main`.
Failures create remediation output and pause orchestration advancement.

## Workflows

| Workflow file | Display name | Role |
|---|---|---|
| `post-merge-intent-verification.yml` | Post-Merge Detection | Primary validator, PR comment, orchestrator sync, reviewer audit on failure |
| `post-merge-remediation.yml` | Post-Merge Remediation | Opens remediation issues only when Post-Merge Detection fails |
| `diataxis-post-merge-validate.yml` | DIATAXIS Post-Merge Validation | Uploads DIATAXIS evidence for merged documentation changes |
| `ops-design-compliance-audit.yml` | OPS — Design Compliance Audit | OPS observability only; not post-merge validation authority |

## Evidence Domains

Post-Merge Detection reports evidence from:

- PR metadata completeness and source issue linkage
- merged implementation evidence against declared allowlist and acceptance criteria
- merged DIATAXIS documentation alignment
- late trusted reviewer findings
- required merge-protection workflow outcomes on merge/head SHAs

## Orchestration Behavior

- Validation `pass` allows orchestrator post-merge success sync.
- Validation `fail` blocks queue advancement and triggers remediation issue creation.
- Optional non-blocking workflow failures may still be recorded without failing validation.

## Source Issue Closeout

After a merged implementation PR passes post-merge validation with no blocking remediation:

1. Resolve the linked source issue from accepted accounting formats (`- **Issue:** #NNNN`, orchestrator marker, or existing URL forms).
2. Skip closeout when the linked issue is a remediation issue (`post-merge-failure` label or remediation title prefix).
3. Remove stale active-state labels: `status:blocked`, `status:queued`, `status:failed`, `status:post-merge-verify`.
4. Add a closeout evidence comment containing PR number, merge SHA, validator status, verification result, and closeout reason.
5. Apply `status:complete` and close the source issue.

Closeout does not run when validation status is `fail`, remediation remains required, required workflow failures exist, the source issue cannot be confidently identified, or the PR did not merge into `main`.

## Remediation Preservation

Duplicate remediation issue cleanup remains unchanged. Canonical remediation issues stay open; duplicate remediation issues close. Failed validation continues to open or update remediation issues through `post_merge_remediation_issue.mjs`.

## Core Scripts

| Script | Role |
|---|---|
| `scripts/ci/post_merge_validator.mjs` | Aggregates post-merge evidence and writes result artifacts |
| `scripts/ci/post_merge_implementation_evidence.mjs` | Allowlist, acceptance, and verification evidence checks |
| `scripts/ci/post_merge_diataxis_audit.mjs` | DIATAXIS post-merge audit helpers |
| `scripts/ci/post_merge_remediation_issue.mjs` | Remediation issue generation on validation failure |
| `scripts/ci/post_merge_reviewer_audit.mjs` | Late reviewer follow-up issue generation |
| `scripts/ci/post_merge_source_issue_closeout.mjs` | Closeout decision helpers and evidence comment format |
| `scripts/ci/post_merge_validation_surface.mjs` | Surface inventory validator |
| `scripts/ci/close_duplicate_remediation_issues.mjs` | Closes duplicate remediation issues only |
| `scripts/orchestrator/sync-pr-state.mjs` | Applies orchestrator labels and source-issue closeout |

## Rollback

Revert post-merge validation and remediation workflow/script changes and this
reference documentation only.
