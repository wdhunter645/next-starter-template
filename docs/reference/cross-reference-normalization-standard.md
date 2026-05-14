---
Doc Type: Reference
Audience: Human + AI
Authority Level: Canonical
Owns: Cross-reference normalization requirements
Does Not Own: Runtime behavior or implementation state
Canonical Reference: /docs/reference/repository-authority-index.md
Last Reviewed: 2026-05-14
---

# Cross-Reference Normalization Standard

## Purpose

Cross-references must consistently connect:

- authority documents
- implementation issues
- PRs
- operational trackers
- migration records

## Required Relationships

Authority docs should reference:

- implementation tracking
- canonical upstream authority
- related governance docs

Implementation issues should reference:

- governing authority docs
- related implementation dependencies

PRs should reference:

- source issues
- governing authority
- implementation tracking

## Orphan Prevention

Repository implementation surfaces should not exist without:

- governing authority
- implementation tracking
- acceptance criteria
