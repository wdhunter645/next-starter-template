---
Doc Type: Reference
Audience: Human + AI
Authority Level: Controlled
Owns: LGFC post-merge validation surface, evidence reporting model, remediation and orchestration pause behavior
Does Not Own: Pre-merge merge protection gates, OPS runtime monitoring behavior, website product behavior
Canonical Reference: /docs/explanation/ci/lgfc-ci-production-design.md
Related Issues: #1197, #1075, #1058
Last Reviewed: 2026-06-03
---

# LGFC Post-Merge Validation Surface

## Purpose

This reference documents Task 004 post-merge validation expansion. Post-merge
validation inspects merged code and PR governance evidence after landings on
`main`. Failures create remediation output and pause orchestration advancement.

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

## Core Scripts

| Script | Role |
|---|---|
| `scripts/ci/post_merge_validator.mjs` | Aggregates post-merge evidence and writes result artifacts |
| `scripts/ci/post_merge_implementation_evidence.mjs` | Allowlist, acceptance, and verification evidence checks |
| `scripts/ci/post_merge_diataxis_audit.mjs` | DIATAXIS post-merge audit helpers |
| `scripts/ci/post_merge_remediation_issue.mjs` | Remediation issue generation on validation failure |
| `scripts/ci/post_merge_reviewer_audit.mjs` | Late reviewer follow-up issue generation |
| `scripts/ci/post_merge_validation_surface.mjs` | Surface inventory validator |

## Rollback

Revert post-merge validation and remediation workflow/script changes and this
reference documentation only.
