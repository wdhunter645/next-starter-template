---
Doc Type: Governance
Audience: AI agents and repository maintainers
Authority Level: Controlled
Owns: Repository governance enforcement strategy and rollout expectations
Does Not Own: Runtime workflow implementation, product design, governance hierarchy, or authority-resolution rules
Canonical Reference: docs/governance/standards/document-status-and-naming_MASTER.md
Related Issues: #1029
Last Reviewed: 2026-05-14
---

# Governance Enforcement Standard

## Purpose

This document defines how repository governance standards should be converted into enforceable checks without creating drift, blocking valid work prematurely, or replacing human review. Governance enforcement exists to prevent broken authority links, missing metadata, orphan implementation surfaces, stale references, and incomplete PR accounting from entering the repository unnoticed.

## Scope

This standard applies to governance checks, warning checks, blocking checks, documentation guardrails, pull request validation, and future automation that evaluates repository authority or process compliance.

It defines enforcement strategy only. It does not implement workflow files, define product behavior, define the governance hierarchy, or override authority-resolution rules.

## Current Known Truth

The repository already has several governance-related checks, including documentation guardrails, design-compliance warnings, intent labeling, drift control, PR issue-accounting, reviewer-response gates, ZIP safety, secret scanning, quality checks, and deployment validation. These checks together form the repository PR gate-readiness model.

Some governance expectations remain documentation-first and should not become blocking until repository-wide audit and migration work confirms that enforcement will not destabilize active workflows.

## Intended Final State

Governance enforcement should become layered, predictable, auditable, and merge-readiness oriented. Warning checks should identify drift early. Blocking checks should apply only where the repository has clear standards, reliable automation, and known migration paths for existing exceptions.

## Enforcement Areas

Governance checks may evaluate:

- missing canonical references
- broken authority links
- invalid or missing authority headers
- orphan authority documents
- missing implementation linkage
- missing PR issue-accounting
- stale governance references
- missing file-touch allowlists
- missing ZIP safety confirmations
- unresolved reviewer-response accounting
- mismatched DIATAXIS folder authority
- deprecated or historical documents used as active authority
- unresolved review-thread state
- missing maintainer acknowledgments
- failed workflow validation checks

## Enforcement Levels

### Warning

Warning checks identify possible drift without blocking merge. Use warning mode when standards are new, repository coverage is incomplete, or migration debt remains unresolved.

### Blocking

Blocking checks prevent merge when a rule is mature, objective, machine-detectable, and already supported by repository-wide documentation and migration guidance.

## PR Gate-Readiness Troubleshooting Procedure

Preparing a PR for merge approval requires validation of all required gate classes, not only reviewer-response remediation.

Required sequence:

1. inspect the live PR check panel before relying on commit-scoped workflow runs
2. confirm PR issue-accounting uses exactly one same-repository, open, non-PR Issue reference as the primary source Issue
3. inspect PR body sections, file-touch allowlist, ZIP safety, source authority, acceptance criteria, and issue/reviewer accounting sections
4. inspect GitHub review-thread state and resolve addressed threads directly in PR review state
5. inspect the latest head workflow runs for every required gate
6. inspect failed job logs for any failing gate, including PR issue-accounting, reviewer-response gates, intent labeling, drift control, docs guardrails, quality checks, ZIP safety, and secret scanning
7. patch the underlying content, workflow, PR body, issue link, or review-state defect
8. add a later maintainer acknowledgment for any high-severity review-level finding required by the gate logs
9. rerun or wait for gate evaluation and verify the live PR check panel plus latest gate runs together

Repository maintainers and AI agents must not rely solely on commit-scoped workflow runs when troubleshooting PR readiness. The live PR check panel, unresolved review-thread state, PR body accounting, issue-accounting, latest head workflow runs, and failed job logs must be checked together.

The PR issue-accounting gate requires exactly one primary `Issue:` reference to one real numeric issue in the same repository. The referenced issue must be open while the PR is open and must not itself be a pull request. A documented exception does not satisfy the current enforcement workflow unless the workflow itself is changed in a separate reviewed PR.

Design-compliance warnings and manually dispatched deployment workflows may provide useful context, but they are not current blocking PR gate classes unless the live PR check panel shows them as failing required checks.

A green reviewer gate alone does not make a PR merge-ready. A corrected document or workflow alone does not guarantee gate success. Reviewer-accounting, thread-resolution state, issue-accounting, review-level acknowledgments, latest job logs, and all required checks must be reconciled together.

## Rollout Rules

New governance enforcement should roll out in this order:

1. document the rule and ownership boundary
2. audit current repository state
3. classify exceptions and migration debt
4. run warning-only checks
5. fix or explicitly grandfather known exceptions
6. promote to blocking only after false-positive risk is controlled

## Validation Expectations

Future enforcement work should identify:

- rule owner
- checked files or repository surface
- warning versus blocking status
- failure message
- remediation path
- known exceptions
- related governance authority
- related implementation issue

## Non-Goals

This standard does not require immediate conversion of every governance expectation into CI. It also does not authorize silent workflow changes without issue tracking, PR review, and documented acceptance criteria.
