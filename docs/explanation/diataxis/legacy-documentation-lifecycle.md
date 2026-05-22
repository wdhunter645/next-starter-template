---
Doc Type: Explanation
Audience: Human + AI
Authority Level: Controlled
Owns: Legacy documentation lifecycle philosophy and migration-state model
Does Not Own: Specific migration implementation sequencing
Canonical Reference: /docs/reference/diataxis/authority-inventory-and-routing-map.md
Last Reviewed: 2026-05-22
---

# Legacy Documentation Lifecycle

## Purpose

This document explains how legacy repository documentation transitions into the DIATAXIS architecture.

The repository intentionally preserves historical operational knowledge while removing legacy structures from active operational authority.

## Historical Context

The repository accumulated documentation across multiple operational eras.

This created:

- overlapping operational guidance
- duplicated governance logic
- stale implementation instructions
- mixed-authority structures
- AI-agent routing ambiguity

DIATAXIS migration resolves this by separating:

- active operational authority
- historical operational memory

## Core Principle

Knowledge should migrate forward.

Authority should not remain duplicated indefinitely.

The repository should preserve historical traceability without allowing historical structures to remain active operational control surfaces.

## Lifecycle Stages

### Stage 1 — Active Legacy

The document remains operationally active but still exists outside DIATAXIS.

Risks:
- duplicate authority
- inconsistent routing
- stale cross references

### Stage 2 — Migration

The operational knowledge is rewritten into production-quality DIATAXIS documentation.

Requirements:
- no placeholders
- normalized metadata
- canonical references
- operational completeness

### Stage 3 — Verification

Migration verification confirms:
- workflows no longer reference legacy paths
- scripts no longer reference legacy paths
- governance docs no longer reference legacy paths
- AI prompts no longer depend on legacy structures

### Stage 4 — Quarantine

Migrated legacy content moves into non-authoritative archive space.

Examples:
- `/docs/archive/legacy/`
- `/docs/archive/historical/`

At this stage the material:
- remains readable
- remains historically accessible
- stops functioning as active authority

### Stage 5 — Cooling Period

The repository preserves quarantined legacy material temporarily while:
- migration waves stabilize
- orchestration validation completes
- lingering references are detected
- rollback confidence increases

### Stage 6 — Retirement

After reference verification succeeds, the repository may formally retire the legacy material.

Retirement means:
- non-authoritative
- excluded from active governance
- excluded from AI operational routing

### Stage 7 — Selective Deletion

Some material may eventually be deleted.

Deletion candidates:
- duplicate drafts
- abandoned experiments
- obsolete operational fragments
- superseded temporary notes

Long-term retention candidates:
- governance history
- incident history
- architectural evolution
- migration evidence
- operational audit history

## Archive Philosophy

Archive content remains valuable historical memory.

Archive content should not:
- compete with canonical authority
- participate in operational routing
- create implementation ambiguity

## Final Repository Model

The repository ultimately separates into:

| Layer | Responsibility |
|---|---|
| DIATAXIS | Active operational authority |
| Archive | Historical memory |
| Governance CI | Integrity enforcement |
| Orchestration | Controlled migration sequencing |

## Operational Outcome

The lifecycle model reduces:

- authority drift
- stale guidance
- AI-agent confusion
- governance duplication
- maintenance burden

while preserving:

- historical traceability
- operational auditability
- architectural evolution history
