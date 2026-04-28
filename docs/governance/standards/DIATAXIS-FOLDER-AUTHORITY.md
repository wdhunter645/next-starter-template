---
Doc Type: Governance
Audience: Human + AI
Authority Level: Canonical
Owns: Diataxis folder usage rules and no-drift documentation model
Does Not Own: Design specifications; operational task details; application behavior
Canonical Reference: /docs/governance/DOCUMENT-ARCHITECTURE.md
Last Reviewed: 2026-04-28
---

# DIÁTAXIS FOLDER AUTHORITY (NO-DRIFT MODEL)

## Purpose
Defines strict folder usage rules. No drift allowed.

## Structure
- tutorials/
- how-to/
- reference/
- explanation/
- governance/
- ops/
- archive/

## Rules

### tutorials
- allowed: step-by-step flows
- prohibited: system definitions, rationale

### how-to
- allowed: single task execution
- prohibited: explanation, system definitions

### reference
- allowed: facts, schemas, routes
- prohibited: instructions, "should", rationale

### explanation
- allowed: reasoning, tradeoffs
- prohibited: steps, commands

### governance
- allowed: rules, invariants
- prohibited: implementation

### ops
- allowed: projects, trackers
- prohibited: authority, system definitions

### archive
- allowed: deprecated content only

## Enforcement
Violations trigger validation failure and escalation.