---
Doc Type: Reference
Audience: Human + AI
Authority Level: Canonical
Owns: Repository documentation authority inventory, routing hierarchy, canonical-path classification
Does Not Own: Workflow implementation behavior
Canonical Reference: /docs/governance/standards/DIATAXIS-FOLDER-AUTHORITY.md
Last Reviewed: 2026-05-22
---

# LGFC Documentation Authority Inventory and Routing Map

## Purpose

This document establishes the authoritative documentation routing hierarchy for the LGFC repository.

It defines:

- canonical authority layers
- DIATAXIS routing behavior
- legacy authority handling
- archive classification rules
- operational routing expectations for human and AI contributors

## Repository Documentation Problem

The repository evolved through multiple operational eras before DIATAXIS stabilization.

As a result, the repository currently contains:

- overlapping authority paths
- duplicated governance guidance
- mixed active and historical operational content
- partially migrated structures
- stale cross references
- operational ambiguity for AI agents

Without a stable authority model, the repository risks:

- governance drift
- stale implementation guidance
- conflicting instructions
- maintenance duplication
- orchestration instability

## Canonical Authority Model

The repository now standardizes on DIATAXIS as the active operational authority layer.

Active operational knowledge should exist in only one canonical location.

## Active Authority Layers

### `/docs/explanation/`

Purpose:
- architectural rationale
- operational philosophy
- governance reasoning
- system design intent

Examples:
- CI architecture philosophy
- reviewer lifecycle rationale
- OPS runtime philosophy

### `/docs/how-to/`

Purpose:
- execution guidance
- operational procedures
- implementation sequencing
- migration walkthroughs

Examples:
- CI implementation plans
- orchestration execution guidance
- migration procedures

### `/docs/reference/`

Purpose:
- canonical facts
- inventories
- matrices
- authority maps
- configuration references

Examples:
- workflow classification matrix
- dependency matrix
- authority inventory

### `/docs/tutorials/`

Purpose:
- onboarding flows
- guided learning
- structured walkthroughs

Examples:
- future contributor onboarding
- operational setup walkthroughs

## Legacy Documentation Rules

Legacy folders are no longer authoritative once equivalent DIATAXIS documentation exists.

Legacy content must eventually become:

- migrated
- archived
- superseded
- deprecated
- retired

Legacy structures must not continue expanding.

## Archive Classification Model

### Active

Current canonical operational guidance.

### Migrated

Knowledge successfully rewritten into DIATAXIS.

### Archived

Historical reference retained for traceability but no longer authoritative.

### Deprecated

Known obsolete guidance retained temporarily for compatibility awareness.

### Superseded

Explicitly replaced by canonical DIATAXIS documentation.

### Orphaned

No remaining operational owner or known active dependency.

## Routing Rules

### Rule 1 — DIATAXIS First

Active operational work must route into DIATAXIS.

### Rule 2 — Single Active Authority

Only one active canonical authority source should exist for a given operational concern.

### Rule 3 — Legacy Quarantine

Migrated legacy material should move into non-authoritative archive space.

### Rule 4 — Archive Isolation

Archived material should:
- remain historically accessible
- remain excluded from active governance
- remain excluded from AI operational routing

### Rule 5 — Reference Verification

Migration work must verify that the following components no longer depend on legacy paths:

- workflows
- scripts
- PR templates
- issue templates
- AI prompts
- governance docs
- indexes
- cross references

## Long-Term Repository State

The final repository documentation model should become:

| Layer | Purpose |
|---|---|
| DIATAXIS | Active operational authority |
| Archive | Historical memory |
| Governance CI | Routing and integrity enforcement |
| Orchestration | Controlled migration sequencing |

## Operational Outcome

The DIATAXIS authority model creates:

- cleaner operational routing
- reduced governance ambiguity
- improved AI-agent usability
- lower maintenance burden
- stronger orchestration reliability
- safer long-term repository evolution
