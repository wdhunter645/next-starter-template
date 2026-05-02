---
Doc Type: Reference
Audience: Human + AI
Authority Level: Canonical
Owns: Diataxis mapping coverage and transition model
Does Not Own: Design authority; execution details
Canonical Reference: /docs/governance/DOCUMENT-ARCHITECTURE.md
Last Reviewed: 2026-05-02
---

# DIATAXIS MAPPING

## Purpose

Defines complete mapping from legacy documentation to Diataxis structure.

This document is the single source of truth for:
- transition coverage
- migration status
- routing vs full-document decisions

---

## Coverage Model

- Total legacy documents: TBD
- Total DIATAXIS targets: TBD
- Coverage status: TBD

DIATAXIS is considered 100% complete when:
- every required topic has a DIATAXIS entry (full or routed)

---

## Mapping Table

| Legacy File | DIATAXIS Target | Type | Status | Action |
|------------|----------------|------|--------|--------|
| (populate) | (populate)     | (populate) | (populate) | (populate) |

---

## Status Definitions

- Viable → clean migration possible
- Weak → rewrite required
- Duplicate → remove or consolidate
- Missing → new DIATAXIS document required

---

## Action Definitions

- Migrate → convert legacy to DIATAXIS with minimal change
- Rewrite → create new DIATAXIS document
- Route → create DIATAXIS routing document referencing legacy
- Retire → remove legacy after validation

---

## Rules

- Every legacy document must appear exactly once
- Every mapping must resolve to one DIATAXIS target
- No unmapped legacy documents allowed
- DIATAXIS must remain authoritative at all times

---

## Transition Tracking

- DIATAXIS coverage remains 100% (full or routed)
- Legacy usage decreases over time
- LEGACY_FALLBACK events create mapping gaps

---

## Notes

This file is scaffold-only at creation.
Population occurs during mapping phase.
