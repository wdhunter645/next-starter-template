---
Doc Type: Reference
Audience: AI agents, maintainers, reviewers, orchestration operators
Authority Level: Canonical
Owns: Full-data-surface troubleshooting requirements and PR gate investigation doctrine
Does Not Own: Individual workflow implementation details
Canonical Reference: docs/reference/governance/troubleshooting-data-surface-requirements.md
Last Reviewed: 2026-05-16
---

# Troubleshooting Data Surface Requirements

## Purpose

Troubleshooting must inspect all relevant operational data surfaces before remediation claims are made.

Partial visibility creates false-positive remediation claims, prolongs incidents, and causes repeated gate failures.

---

## Scope

This standard applies to repository troubleshooting, PR gate troubleshooting, workflow troubleshooting, reviewer-response troubleshooting, issue-accounting troubleshooting, and governance reconciliation.

It governs the evidence surfaces that must be inspected before any remediation or merge-readiness claim is made.

It does not define individual workflow implementation logic or replace workflow-specific run logs.

---

## Current Known Truth

PR troubleshooting can fail when only one operational surface is inspected.

Commit-level workflow runs do not represent the full PR state. PR-level `pull_request_target` gates, parser-driven governance checks, bot comments, review threads, and PR body parsing rules can still fail while commit-level workflows appear successful.

Parser-driven governance requires exact syntax compliance. Semantic equivalents are not sufficient.

---

## Intended Final State

Troubleshooting should consistently review all relevant repository data surfaces before declaring remediation complete or a PR ready for merge approval.

The intended final state is a repeatable troubleshooting process that reduces false-positive success claims, shortens incident duration, and prevents repeated gate-failure cycles.

---

## Required Data Surfaces

Troubleshooting must inspect all relevant sources, including:
- PR metadata
- Current HEAD SHA
- PR body parser requirements
- Workflow run lists
- Workflow YAML definitions
- Job logs
- PR-level `pull_request_target` workflows
- Commit-level workflow runs
- Bot comments
- Review comments
- Review threads
- Issue scope
- Acceptance criteria
- Changed-file diff
- Repository governance docs

---

## PR Gate Troubleshooting

PR troubleshooting must distinguish:
- Commit-level workflow status
- PR-level governance/accounting gates
- Parser-driven governance workflows

Semantic equivalents are not sufficient where workflows require exact syntax.

Example:
- `Closes #1043` does **not** satisfy `- **Issue:** #1043` when the workflow parser expects the latter.

---

## Operational Requirement

No merge-readiness claim should be made until all relevant operational surfaces have been reviewed.
