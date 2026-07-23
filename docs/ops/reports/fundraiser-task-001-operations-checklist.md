---
Doc Type: Operations
Audience: Bill, ChatGPT, Cursor, LGFC operators, and reviewers
Authority Level: Operational Evidence
Owns: Task 001 operations checklist covering fundraiser launch states, operator evidence, and handoff readiness for Task 002
Does Not Own: Live campaign execution, vendor configuration, Issue closeout, or merge authority
Canonical Reference: /docs/how-to/website/fundraiser-operations-playbook.md
Related Issues: #1700, #1701
Last Reviewed: 2026-07-22
---

# Fundraiser Task 001 — Operations Checklist

## Purpose

Provide the Task 001 evidence checklist that proves the fundraiser operations
playbook and launch-state model cover setup through archive, with explicit
operator responsibilities.

Assessment date: **2026-07-22**  
Source Issue: **#1701**  
Parent program: **#1700**

## Scope

In scope:

- Task 001 acceptance evidence for playbook + launch-state coverage;
- operator evidence expectations for all six canonical states;
- explicit handoff readiness statement for Task 002.

Out of scope:

- live campaign execution or vendor configuration;
- Issue closeout or merge authority;
- runtime implementation, privacy-field finalization, or pre-launch test package
  owned by later tasks.

## Current known truth

- Task 001 deliverables are the three allowlisted docs in the deliverable map
  below.
- Canonical states are `draft`, `preview`, `active`, `paused`, `ended`, and
  `archived`; post-campaign reporting is deterministic under `ended`.
- This checklist proves documentation coverage for #1701 acceptance; it is not
  a live-campaign go packet.

## Intended final state

Reviewers can verify #1701 acceptance criteria from this checklist alone, and
Task 002 can define Givebutter vs LGFC ownership without inventing operational
flow or competing launch states.

## Deliverable map

| Artifact | Path | Role |
| --- | --- | --- |
| Launch-state model | `docs/reference/website/fundraiser-launch-state-model.md` | Canonical states, gates, limits |
| Operations playbook | `docs/how-to/website/fundraiser-operations-playbook.md` | Operator procedure |
| This checklist | `docs/ops/reports/fundraiser-task-001-operations-checklist.md` | Acceptance evidence |

## Canonical state coverage

| State | Playbook section | Required operator evidence | Covered |
| --- | --- | --- | --- |
| `draft` | Setup | Campaign identity, owners, non-goals, fail-closed public posture | YES |
| `preview` | Preview | Admin preview checks, approved public fields, no live claim | YES |
| `active` | Launch | Product Authority activation record, approved public URL, surface check | YES |
| `paused` | Pause | Pause authority, messaging decision, resume/end path | YES |
| `ended` | Closeout + winner gate | End authorization, closed messaging, winner approval path | YES |
| `archived` | Archive | Archive/hide decision, no live-state residue | YES |

## Operations coverage matrix

| Operation | Documented | Notes |
| --- | --- | --- |
| Setup | YES | Draft package and ownership split |
| Preview | YES | Links to existing admin fundraiser preview how-to |
| Launch | YES | Requires Product Authority GO; docs alone do not launch |
| Pause | YES | Includes resume/early-end decision requirement |
| Closeout | YES | Ended-state freeze before recognition/winner work |
| Winner publication | YES | Gated on ended/authorized window + later privacy/rules tasks |
| Archive | YES | Historical summary or hide; no live claims |

## Approval gates recorded

| Gate | Documented owner |
| --- | --- |
| Public activation | Product Authority |
| Pause / resume / early end (mandated) | Product Authority or recorded Day-2 / Operations owner |
| Winner publication | Product Authority after privacy-safe validation |
| Archive acceptance | Product Authority or PMO / Engineering |

## Explicit non-claims

- This Task 001 package does **not** launch a public 2027 campaign.
- This package does **not** configure Givebutter or store vendor secrets.
- This package does **not** define final donor/sponsor public fields (Task 005).
- This package does **not** implement runtime campaign enums (Task 006).

## Task 002 handoff readiness

Task 002 can define Givebutter vs LGFC ownership without inventing operational
flow because Task 001 already fixed:

1. canonical website launch states;
2. when public claims are allowed;
3. which actions remain external/human-vendor;
4. evidence expectations at each gate.

## Acceptance criteria trace (#1701)

| Criterion | Result |
| --- | --- |
| Setup, preview, launch, pause, closeout, winner publication, and archive documented | PASS — playbook sections 1–7 |
| Launch-state model distinguishes draft, preview, active, paused, ended, archived | PASS — reference model table |
| Operator responsibilities and required evidence explicit | PASS — playbook roles + this checklist |
| Task 002 can define boundaries without inferring operational flow | PASS — handoff readiness section |

## Residual / deferred (not Task 001 blockers)

| Item | Owner task |
| --- | --- |
| External/internal data ownership detail | #1702 |
| Leaderboard/winner calculation rules | #1703 |
| Homepage spotlight design reconciliation | #1704 |
| Donor/sponsor privacy fields | #1705 |
| Website runtime implementation | #1706 |
| Pre-launch test package | #1707 |
| Program closeout handoff | #1708 |
