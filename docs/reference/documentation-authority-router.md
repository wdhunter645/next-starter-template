---
Doc Type: Reference
Audience: Human + AI
Authority Level: Controlled
Owns: Repository documentation source-routing rules for implementation work
Does Not Own: Feature-specific design authority, runtime behavior, or issue status
Canonical Reference: /docs/governance/standards/document-authority-hierarchy_MASTER.md
Last Reviewed: 2026-05-14
---

# Documentation Authority Router

## Purpose

This document defines how humans and AI agents locate authority before planning or implementing repository changes.

The repository uses a DIATAXIS-first model with legacy-folder fallback. This prevents older planning material from silently overriding current authority while still preserving historical project knowledge.

## Routing Rule

Agents must search in this order:

1. DIATAXIS folders
2. canonical governance files
3. active GitHub Issues and PRs
4. legacy or ops folders only when required information is missing from DIATAXIS

## DIATAXIS Authority Layer

Primary documentation folders:

- `/docs/explanation/`
- `/docs/reference/`
- `/docs/how-to/`
- `/docs/tutorials/`

These folders contain the primary human and AI knowledge layer.

## Legacy and Ops Fallback Layer

Legacy, operations, tracker, postmortem, and project folders may contain useful history or execution records.

They do not override current DIATAXIS or canonical design authority unless a document explicitly says it owns that authority and no newer canonical document supersedes it.

## PR Source Accounting Requirement

Every implementation or documentation PR must state where project information was sourced from.

Required accounting:

- [ ] DIATAXIS docs were sufficient
- [ ] Legacy or ops docs were consulted because DIATAXIS coverage was incomplete
- [ ] Any legacy-derived authority was reconciled against canonical DIATAXIS or design authority
- [ ] A DIATAXIS update is included or a follow-up issue exists when legacy information remains necessary

## Conflict Resolution

When documents conflict:

1. canonical design authority wins for runtime behavior
2. reference docs win for schemas and fixed facts
3. how-to docs win for procedures
4. tutorials provide guided examples but do not override reference or design authority
5. old issues and legacy plans are historical unless explicitly reaffirmed

## Required Agent Behavior

Agents must not infer authority from old planning issues.

Agents must:

- cite the active authority document in the PR body
- identify legacy sources used
- avoid creating parallel systems when canonical systems already exist
- open a documentation gap issue when required authority is missing

## Completion Standard

A documentation area is considered governed when:

- the authority document exists in DIATAXIS or canonical governance docs
- related legacy material is classified as active, transitional, historical, or deprecated
- implementation issues point back to current authority
- PRs disclose source routing
- conflicts are resolved in favor of current canonical authority
