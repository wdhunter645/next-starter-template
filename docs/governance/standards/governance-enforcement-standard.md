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

The repository already has several governance-related checks, including documentation guardrails, design-compliance warnings, intent labeling, drift control, and reviewer-response gates. These checks are not yet a complete repository-wide governance enforcement framework.

Some governance expectations remain documentation-first and should not become blocking until repository-wide audit and migration work confirms that enforcement will not destabilize active workflows.

## Intended Final State

Governance enforcement should become layered, predictable, and auditable. Warning checks should identify drift early. Blocking checks should apply only where the repository has clear standards, reliable automation, and known migration paths for existing exceptions.

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

## Enforcement Levels

### Warning

Warning checks identify possible drift without blocking merge. Use warning mode when standards are new, repository coverage is incomplete, or migration debt remains unresolved.

### Blocking

Blocking checks prevent merge when a rule is mature, objective, machine-detectable, and already supported by repository-wide documentation and migration guidance.

## Reviewer Gate Troubleshooting Procedure

Reviewer-gate remediation must follow this sequence:

1. patch the underlying content or workflow defect
2. add or update `REVIEWER RESPONSE ACCOUNTING` in the PR body
3. resolve GitHub review threads directly in PR review state
4. verify the live PR check panel and latest gate run together

Repository maintainers and AI agents must not rely solely on commit-scoped workflow runs when troubleshooting reviewer gates. The live PR check panel and unresolved review-thread state are authoritative.

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
