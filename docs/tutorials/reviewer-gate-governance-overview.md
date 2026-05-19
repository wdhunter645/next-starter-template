---
Doc Type: Tutorial
Audience: New maintainers and AI governance contributors
Authority Level: Informational Draft
Owns: Learning-oriented overview of reviewer gate governance direction
Does Not Own: Canonical workflow behavior or implementation authority
Canonical Reference: Issue #1058
Last Reviewed: 2026-05-19
---

# Tutorial — Understanding the Reviewer Gate Redesign

## Goal
Understand why the reviewer gate redesign exists and how the future-state governance model operates.

## Outcome
After reading this tutorial, operators should understand:
- why deadlocks occurred
- how blocker vs advisory workflows differ
- how remediation-safe governance works
- why workflow separation matters

## Walkthrough

### Problem
Older reviewer workflows created circular governance deadlocks.

### Redesign Direction
The redesign separates:
- merge safety
- governance enforcement
- advisory visibility

### Merge Safety
Hard blockers remain limited to true merge-risk conditions.

### Advisory Reviewers
Reviewer visibility and reminders become informational instead of merge-blocking.

### Governance Integrity
Governance checks remain active for issue mapping and scope control.

## Result
The repository moves toward deterministic governance with lower operational friction.
