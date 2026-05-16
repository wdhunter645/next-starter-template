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

## Required Data Surfaces

Troubleshooting must inspect all relevant sources, including:
- PR metadata
- current head SHA
- PR body parser requirements
- workflow run lists
- workflow YAML definitions
- job logs
- PR-level pull_request_target workflows
- commit-level workflow runs
- bot comments
- review comments
- review threads
- issue scope
- acceptance criteria
- changed-file diff
- repository governance docs

## PR Gate Troubleshooting

PR troubleshooting must distinguish:
- commit-level workflow status
- PR-level governance/accounting gates
- parser-driven governance workflows

Semantic equivalents are not sufficient where workflows require exact syntax.

Example:
- `Closes #1043`
- does not satisfy
- `- **Issue:** #1043`

when the workflow parser expects the latter.

## Operational Requirement

No merge-readiness claim should be made until all relevant operational surfaces have been reviewed.
