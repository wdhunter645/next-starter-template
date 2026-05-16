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

Troubleshooting must inspect all relevant operational data surfaces before remediation claims or remediation actions are made.

Partial visibility creates false-positive remediation claims, prolongs incidents, causes repeated gate failures, and creates governance drift.

---

## Scope

This standard applies to repository troubleshooting, PR gate troubleshooting, workflow troubleshooting, reviewer-response troubleshooting, issue-accounting troubleshooting, and governance reconciliation.

It governs the evidence surfaces that must be inspected before any remediation or merge-readiness claim is made.

---

## Current Known Truth

PR troubleshooting fails when remediation actions are selected from partial evidence.

Commit-level workflow runs do not represent the full PR state.

PR-level `pull_request_target` gates, parser-driven governance checks, bot comments, review threads, review state, branch protection requirements, and PR body parsing rules can still fail while commit-level workflows appear successful.

Semantic equivalence is not governance equivalence.

Exact parser syntax, review-thread state, and PR-level workflow state matter.

---

## Intended Final State

Troubleshooting must become a deterministic evidence-first process.

No remediation action should occur until all available relevant operational evidence surfaces have been reviewed and reconciled.

The intended final state is a troubleshooting process that:
- prevents speculative remediation
- prevents repeated gate-failure loops
- prevents partial operational analysis
- prevents false merge-readiness claims
- preserves enterprise operational governance

---

## Mandatory Evidence Review Requirement

No remediation action may be selected until all available relevant troubleshooting data surfaces have been reviewed.

Partial troubleshooting efforts are prohibited.

Troubleshooting must first establish:
- exact failing gate names
- exact failing workflow/job names
- exact review-thread state
- exact PR-level state
- exact parser/accounting state
- exact branch-protection-required state
- exact reviewer-response state

before remediation begins.

---

## Required Data Surfaces

Troubleshooting must inspect all relevant sources, including:
- PR metadata
- current HEAD SHA
- PR body parser requirements
- workflow run lists
- workflow YAML definitions
- job logs
- PR-level `pull_request_target` workflows
- commit-level workflow runs
- bot comments
- review comments
- review threads
- review state
- branch protection state
- issue scope
- acceptance criteria
- changed-file diff
- repository governance docs

---

## Reviewer Feedback Requirement

All unresolved reviewer feedback must be acknowledged before gate validation begins.

Every reviewer finding requires BOTH:
- PR-body disposition accounting
- GitHub review-thread disposition state

Each review thread must be explicitly:
- resolved
- outdated and resolved
- or intentionally unresolved with documented rationale

---

## Operational Requirement

No merge-readiness claim should be made until:
- all relevant operational surfaces have been reviewed
- all reviewer feedback has been reconciled
- all unresolved reviewer state has been dispositioned
- all required PR-level and workflow-level evidence has been verified
