---
Doc Type: Reference
Audience: LGFC maintainers, orchestration operators, AI builders
Authority Level: Canonical
Owns: Startup governance doctrine and run-startup operational initialization rules
Does Not Own: Full DIATAXIS taxonomy, builder implementation details, or repository workflow implementation
Canonical Reference: docs/reference/orchestration/startup-governance.md
Last Reviewed: 2026-05-16
---

# LGFC Startup Governance v1

## Purpose

The LGFC startup process initializes governance, execution posture, orchestration awareness, repository authority alignment, and operational safety rules before any implementation or coordination work begins.

Startup acts as the operational bootloader for:
- governance
- orchestration
- DIATAXIS operations
- implementation execution
- repository management
- AI builder coordination
- verification workflows

The startup process exists to reduce:
- governance drift
- execution ambiguity
- builder inconsistency
- undocumented assumptions
- repository misalignment
- uncontrolled autonomous behavior

---

## Scope

This document governs the startup posture used when LGFC work begins in an AI-assisted or human-assisted operational context.

It applies to:
- repository governance work
- orchestration planning
- DIATAXIS documentation work
- PR preparation and review readiness
- AI builder coordination
- troubleshooting initialization
- source-of-truth alignment

It does not define:
- the complete DIATAXIS taxonomy
- implementation-specific website architecture
- workflow YAML implementation logic
- individual builder prompt templates
- every operational troubleshooting step

---

## Current Known Truth

The repository is the authoritative operational source of truth.

Memory and chat context may assist continuity, but they are not authoritative when they conflict with repository documentation, issues, PRs, workflow logs, or committed files.

Startup governance is currently being formalized into DIATAXIS-positioned repository documentation so future AI agents and human maintainers can initialize work without relying on transient chat history.

The current startup doctrine includes:
- source-of-truth verification
- tool/access honesty
- no unsupported capability claims
- execution discipline
- governance alignment
- PR gate-readiness awareness
- reviewer-response accountability
- drift awareness
- enterprise supportability expectations

---

## Intended Final State

Startup governance should become a stable repository-governed initialization contract that can be used consistently by:
- Atlas/ChatGPT
- orchestration workflows
- AI builders
- human maintainers
- reviewers

The intended final state is a startup process that:
- initializes the correct operational mode
- confirms repository authority
- identifies degraded access or missing tools
- prevents undocumented assumptions
- routes work into the correct governance lane
- enforces enterprise production readiness expectations
- supports reproducible troubleshooting and PR preparation

---

## Canonical Authority

### Source of Truth

The repository is the authoritative source of truth.

Canonical operational documentation should live inside the DIATAXIS framework.

Memory copies are considered:
- operational continuity aids
- non-authoritative
- subject to synchronization drift

Repository documentation overrides memory if conflicts occur.

---

## Startup Initialization Responsibilities

Startup initializes:
- governance posture
- execution posture
- orchestration posture
- repository authority awareness
- builder responsibility boundaries
- verification expectations
- drift awareness
- operational terminology

---

## Operational Modes

### Control

Defines governance posture and execution authority.

Responsibilities:
- scope control
- execution sequencing
- orchestration alignment
- authority enforcement
- prioritization

### Execute

Defines active implementation posture.

Responsibilities:
- implementation progression
- issue execution
- PR creation
- workflow execution
- operational delivery

### Verify

Defines validation posture.

Responsibilities:
- implementation validation
- deployment verification
- governance checks
- operational reconciliation
- acceptance confirmation

### Design

Defines architecture and brainstorming posture.

Responsibilities:
- systems design
- governance design
- orchestration strategy
- operational planning
- future-state modeling

### Governance

Defines operational standards posture.

Responsibilities:
- standards enforcement
- DIATAXIS alignment
- canonical authority management
- orchestration governance
- builder governance

### Troubleshoot

Defines operational recovery posture.

Responsibilities:
- issue isolation
- rollback-first methodology
- recovery planning
- failure analysis
- drift correction

---

## Authority Hierarchy

### Tier 1 — Architecture Authority

Responsible for:
- governance
- architecture
- orchestration strategy
- operational doctrine
- canonical documentation

Actors:
- Project Owner
- Primary Orchestration AI acting in governance role

### Tier 2 — Validation & Documentation

Responsible for:
- reconciliation
- review
- validation
- documentation refinement
- governance verification

Potential actors:
- Primary Orchestration AI
- Secondary Validation AI
- Specialized Analysis Models
- governance workflows

### Tier 3 — Builders

Responsible for:
- implementation
- scripts
- workflows
- repository changes
- scoped execution

Potential actors:
- AI-integrated IDEs
- Code Generation Agents
- Automated Development Tools

Tier 3 builders may not redefine:
- governance
- architecture
- orchestration doctrine
- DIATAXIS structure

---

## Repository Management Model

### #1 — Engineering Management

Focus:
- brainstorming
- architecture
- systems design
- operational strategy
- future-state planning

### #2 — Project Management

Focus:
- active project execution
- implementation coordination
- issue progression
- PR flow
- execution sequencing

### #3 — Repository Management

Focus:
- governance
- DIATAXIS
- orchestration
- CI workflows
- repository automation
- reconciliation

---

## Execution Rules

### Concise Single-Window Output Rule

Outputs should remain concise, deterministic, operationally focused, and suitable for one-copy review or execution where applicable.

### No Assumptions Rule

Unverified assumptions must not be presented as facts.

Ambiguity should trigger clarification or escalation.

### Source-of-Truth Rule

Repository documentation overrides memory.

Canonical DIATAXIS documentation overrides transient discussion.

### Drift Awareness Rule

Operational drift should be treated as a governance concern.

Examples:
- undocumented implementation
- conflicting docs
- builder ambiguity
- orchestration inconsistency
- label drift
- implementation-plan drift

---

## Orchestration Rules

The LGFC Orchestrator is responsible for:
- execution coordination
- queue progression
- builder routing
- issue assignment
- workflow state management
- implementation sequencing

The orchestrator is not responsible for:
- architectural redesign
- governance authority
- uncontrolled autonomous execution

---

## Builder Contract Expectations

Builders must:
- follow scoped implementation requirements
- escalate ambiguity
- avoid architecture invention
- preserve governance alignment
- maintain issue/PR traceability

Builders must not:
- reprioritize queues
- redefine requirements
- bypass governance
- silently change architecture

---

## PR Preparation And Troubleshooting Expectations

PR preparation must apply the repository gate-readiness pattern used by recent successful governance PRs:
- confirm ZIP safety
- identify source-of-truth authority
- define an exact file-touch allowlist
- state visual/runtime invariants
- complete the required pre-review self-check
- reconcile issue scope against actual diff
- account for each actionable reviewer comment by review-comment ID
- verify gate results before claiming merge readiness

Reviewer-response failures may indicate incomplete remediation rather than missing communication alone.

Troubleshooting must inspect actual gate logs, review comments, PR body parsing requirements, and issue acceptance criteria before making remediation claims.

---

## Recovery Behavior

Operational failures should:
- halt progression when necessary
- preserve auditability
- trigger recovery analysis
- avoid hidden corrective behavior

Rollback-first methodology remains preferred.

---

## DIATAXIS Positioning

Startup governance documentation should live inside:

`docs/reference/orchestration/`

Supporting operational explanations, tutorials, and how-to guidance should be positioned in the corresponding DIATAXIS categories.

Legacy operational folders should transition toward:
- migration
- archival
- deprecation
- deletion

rather than continued expansion.
