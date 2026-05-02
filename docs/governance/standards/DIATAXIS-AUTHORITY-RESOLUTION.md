---
Doc Type: Governance
Audience: Human + AI
Authority Level: Canonical
Owns: Diataxis-to-legacy authority resolution during transition
Does Not Own: Folder-purpose rules; product design; operational work tracking
Canonical Reference: /docs/governance/DOCUMENT-ARCHITECTURE.md
Last Reviewed: 2026-05-02
---

# DIATAXIS AUTHORITY RESOLUTION

## Purpose

Defines how authority is resolved while the repository transitions from legacy documentation to the Diataxis documentation model.

This document exists to prevent dual-authority drift during the transition period.

## Resolution Rule

For any documentation topic:

1. If a Diataxis-aligned document exists for that topic, that Diataxis document is authoritative.
2. If no Diataxis-aligned document exists for that topic, the existing legacy canonical document remains authoritative.
3. If both a Diataxis-aligned document and a legacy canonical document exist for the same topic, the Diataxis document owns execution going forward and the legacy document remains historical fallback only until archived, rewritten, or explicitly superseded.
4. No agent, contributor, workflow, or reviewer may treat two documents as simultaneously authoritative for the same topic.

## Legacy Fallback Rule

Missing Diataxis coverage is not a documentation gap that blocks work.

When a required Diataxis document does not yet exist:

- agents must use the current legacy canonical file
- reviewers must validate against the current legacy canonical file
- implementation work must not invent new authority from non-canonical notes
- the missing Diataxis file should be tracked as transition work

## Supersession Rule

A Diataxis document supersedes legacy authority only when it satisfies all of these conditions:

- it exists in the correct folder for its purpose
- it contains the required authority header
- it names its ownership boundary
- it does not contradict higher-level governance or design authority
- it is merged to the default branch

Drafts, branches, issue comments, PR descriptions, and agent notes do not supersede legacy authority.

## Folder Resolution

Authority resolution follows the strict folder-purpose model:

- `docs/tutorials/` teaches end-to-end learning flows
- `docs/how-to/` instructs one task with one execution path
- `docs/reference/` defines facts, contracts, schemas, routes, and product/system specifications
- `docs/explanation/` explains rationale and tradeoffs
- `docs/governance/` defines rules, standards, invariants, and enforcement
- `docs/ops/` tracks execution, projects, tickets, and operating state
- `docs/archive/` stores deprecated material only

A document in the wrong folder cannot become authoritative for that topic.

## Conflict Handling

When a Diataxis document and a legacy document conflict:

1. Confirm whether the Diataxis document satisfies the supersession rule.
2. If yes, follow the Diataxis document and open follow-up work to archive, rewrite, or cross-reference the legacy source.
3. If no, follow the legacy canonical source and open follow-up work to correct the Diataxis document.
4. If both documents claim equal authority and the conflict cannot be resolved by this rule, escalate before implementation.

## Agent Execution Rule

Before acting on documentation, agents must resolve authority in this order:

1. Governance authority for process and enforcement
2. Diataxis document for the exact topic, if present and valid
3. Legacy canonical document for the exact topic, if Diataxis coverage is missing or invalid
4. Operator clarification only when no canonical source exists or sources conflict without a resolvable precedence

Agents must not ask for clarification when this authority chain already resolves the source of truth.

## Transition Tracking Rule

Every missing Diataxis document that is discovered during work must be tracked as transition debt.

The absence of a Diataxis document does not authorize ad hoc documentation. It authorizes fallback to the legacy canonical source and creation of transition follow-up work.

## Success State

The transition is complete when every active documentation topic has a valid Diataxis-aligned authority document or has been explicitly retained as governance, ops, or archive material.