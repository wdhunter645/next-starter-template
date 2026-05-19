---
Doc Type: explanation
Audience: repository maintainers, governance reviewers, CI maintainers, AI agents
Authority Level: strategic
Owns: CI governance architecture direction, workflow rationalization strategy, blocker vs advisory governance model
Does Not Own: workflow implementation details, workflow inventory state, operational CI configuration values
Canonical Reference: docs/explanation/ci-governance-and-workflow-architecture.md
Last Reviewed: 2026-05-19
---

# LGFC CI Governance and Workflow Architecture

## Purpose

This document defines the future-state CI/CD governance model for the Lou Gehrig Fan Club (LGFC) repository.

The objective is to:
- reduce false-positive gate failures
- eliminate governance deadlocks
- simplify workflow ownership
- support AI-assisted repository operations
- preserve deterministic merge safety
- improve operational clarity
- scale governance without workflow sprawl

This architecture direction was formalized under Issue #1058 after repeated PR deadlocks and governance failures exposed weaknesses in the existing workflow model.

---

# Design Principles

## Deterministic Enforcement
Blocking workflows must:
- produce deterministic results
- avoid brittle parsing
- avoid stylistic enforcement
- provide actionable remediation guidance

CI should block unsafe merges, not punish formatting variance.

---

## Advisory vs Blocking Separation
The repository now distinguishes:
- blocking enforcement
- governance validation
- advisory guidance

Not every workflow should block merge.

This separation reduces operational deadlocks and improves contributor velocity.

---

## Narrow-Scope PR Governance
Pull requests should remain single-intent whenever possible.

Benefits:
- cleaner drift validation
- simpler reviewer analysis
- lower false-positive governance failures
- easier rollback and troubleshooting

---

## AI-Compatible Governance
The repository supports AI-assisted execution.

Governance therefore must:
- tolerate metadata normalization
- reduce parsing brittleness
- provide deterministic diagnostics
- support orchestration workflows
- support multiple execution agents

The repository governance model should assist compliant work rather than deadlock it.

---

# Root Causes Identified

## Brittle PR Body Parsing
Observed problems:
- PRs failed due to formatting trivia
- Issue syntax parsing was overly strict
- placeholder parsing created false failures

Mitigation:
- PR #1059 introduced normalization behavior

Future direction:
- normalize metadata automatically where safe
- fail only on true ambiguity or missing governance information

---

## Mixed-Intent Drift Deadlocks
Observed problems:
- `.github/**` and `docs/**` changes in one PR triggered governance deadlocks
- valid governance work became blocked

Validated via:
- PR #1050

Future direction:
- enforce narrow-scope PRs
- improve intent classification
- reduce mixed-intent ambiguity

---

## Workflow Sprawl
Observed problems:
- overlapping workflows
- unclear ownership
- duplicate governance logic
- unclear blocker/advisory distinctions

Future direction:
- workflow inventory and classification
- consolidation of overlapping workflows
- removal of obsolete workflows
- clearer ownership boundaries

---

## Reviewer Gate Deadlocks
Observed problems:
- reviewer-response workflows blocked remediation PRs
- circular governance dependencies occurred

Future direction:
- reviewer guidance becomes advisory-first
- blocking behavior reserved for true unresolved governance/safety states

---

# Future-State CI Topology

## Tier 1 — Hard Blocking
These workflows may block merge:
- build/test failures
- secret leakage
- security failures
- broken migrations
- unsafe platform mutations

Requirements:
- deterministic
- actionable
- low-noise
- operationally necessary

---

## Tier 2 — Governance Enforcement
These workflows may block merge only when governance integrity is compromised.

Examples:
- missing source Issue mapping
- missing intent labels
- unresolved drift violations
- allowlist violations
- undocumented operational mutations
- out-of-scope file changes

Direction:
- minimize false positives
- normalize metadata where safe
- block only true ambiguity

---

## Tier 3 — Advisory / Warning
These workflows should not block merge.

Examples:
- checklist reminders
- documentation suggestions
- PR body completeness suggestions
- reviewer guidance
- stylistic governance recommendations

These workflows provide operational guidance only.

---

# Workflow Inventory Standard

Every workflow must define:

| Property | Required |
|---|---|
| Purpose | Yes |
| Blocking vs Advisory | Yes |
| Trigger type | Yes |
| Protected files/scope | Yes |
| Workflow owner | Yes |
| Dependencies | Yes |
| False-positive risk | Yes |
| Deprecation candidate | Yes |

This inventory becomes mandatory for future workflow rationalization.

---

# Workflow Naming Standard

Workflow visible names and YAML filenames must align.

Example:
- Visible workflow:
  `OPS - Drift Gate`
- YAML filename:
  `ops-drift-gate.yml`

Goals:
- easier troubleshooting
- clearer operational ownership
- faster workflow discovery
- reduced diagnostic confusion

This naming alignment becomes repository standard unless technically impractical.

---

# Intended Pull Request Lifecycle

1. Source Issue created
2. Intent identified
3. Narrow-scope branch/PR opened
4. Drift and allowlist validation
5. Build/test/security validation
6. Reviewer analysis
7. Merge-readiness assessment
8. Human merge approval

CI should support this lifecycle without introducing unnecessary deadlocks.

---

# Workflow Rationalization Direction

Existing workflows fall into four categories:

## Retain
Workflows already aligned and operationally valuable.

## Update
Workflows requiring:
- naming alignment
- blocker severity correction
- parser hardening
- ownership clarification
- diagnostic improvement

## Consolidate
Workflows with overlapping logic or duplicated governance behavior.

## Remove
Workflows that are:
- obsolete
- deadlock-producing
- redundant
- low-signal
- superseded by normalized governance flows

---

# Strategic Outcome

Target state:
- deterministic governance
- low-friction contributor workflow
- stable AI-assisted repository operations
- minimal false-positive blockers
- clear workflow ownership
- simplified CI troubleshooting
- scalable governance architecture

The CI system should protect repository integrity while preserving operational momentum.
