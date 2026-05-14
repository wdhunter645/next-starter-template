---
Doc Type: Reference
Audience: Human + AI
Authority Level: Canonical
Owns: Repository implementation coverage auditing procedure
Does Not Own: Runtime implementation behavior
Canonical Reference: /docs/reference/repository-authority-index.md
Last Reviewed: 2026-05-14
---

# Implementation Coverage Audit Standard

## Purpose

Implementation coverage audits identify:

- missing authority
- orphan implementation surfaces
- missing implementation tracking
- unresolved governance ambiguity
- validation gaps

## Audit Questions

Every major implementation surface should answer:

- what authority owns this behavior?
- what issue tracks implementation?
- what PR introduced the implementation?
- what validation standard exists?
- what migration debt remains?

## Required Outputs

Coverage audits should identify:

- missing authority relationships
- stale implementation references
- unresolved governance overlap
- missing acceptance criteria
- implementation areas dependent on tribal knowledge

## Follow-Up Actions

Audit findings should create:

- governance follow-up issues
- migration backlog entries
- normalization PRs
- authority reconciliation tasks
