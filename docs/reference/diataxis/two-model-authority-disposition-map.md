---
Doc Type: Reference
Audience: Human + AI
Authority Level: Controlled
Owns: Authority disposition inventory for Delivery System v1 Task 2 (#2486) touched documents and related agent-policy routing
Does Not Own: Final domain policy filenames until later delivery-system children land
Canonical Reference: /docs/governance/REPOSITORY-AUTHORITY.md
Related Issues: #2477, #2486, #2478
Last Reviewed: 2026-07-13
---

# Two-Model Authority Disposition Map

## Purpose

Record the authority disposition for every canonical document touched by issue #2486 and the related agent-policy placement conflict. No document may be moved or archived until its row is complete and references are updated.

## Disposition actions

| Action | Meaning |
| --- | --- |
| retain | Keep path; update content and references only |
| consolidate | Merge into another canonical path; supersede source |
| migrate | Move content to a new canonical path in a later child issue |
| archive | Move to `docs/archive/**` when historical retention is required |
| supersede | Mark inactive; remove active routing in touched set |

## Touched documents (#2486 allowlist)

| Current path | Current owner | Target owner | Action | Replacement / notes | Reference-update scope |
| --- | --- | --- | --- | --- | --- |
| `docs/governance/REPOSITORY-AUTHORITY.md` | — | Constitution (Layer 0) | retain (new) | This file is the new constitution | `Agent.md`, architecture docs, inventory map |
| `docs/governance/standards/document-authority-hierarchy_MASTER.md` | Governance | Documentation and Knowledge | consolidate | Precedence detail moves under `REPOSITORY-AUTHORITY.md`; file becomes pointer or archive in later pass | Self, `DOCUMENT-ARCHITECTURE.md` |
| `docs/governance/DOCUMENT-ARCHITECTURE.md` | Governance | Documentation and Knowledge | retain | Reconcile `docs/ops/ai/` binding-policy claim with DIATAXIS ops prohibition | All paths citing ops/ai as binding policy owner |
| `docs/governance/standards/DIATAXIS-FOLDER-AUTHORITY.md` | Documentation and Knowledge | Documentation and Knowledge | retain | Align ops prohibition with agent routing table in constitution | `DOCUMENT-ARCHITECTURE.md`, resolution doc |
| `docs/governance/standards/DIATAXIS-AUTHORITY-RESOLUTION.md` | Documentation and Knowledge | Documentation and Knowledge | retain | Add constitution precedence above resolution rules | Inventory map, architecture |
| `docs/reference/diataxis/authority-inventory-and-routing-map.md` | Documentation and Knowledge | Documentation and Knowledge | retain | Point Layer 0 to `REPOSITORY-AUTHORITY.md` | Intro and authority layers section |

## Agent-policy placement conflict (cross-cutting)

Binding material currently under `docs/ops/ai/` conflicts with DIATAXIS ops folder rules (`ops/` prohibited: authority, system definitions).

| Current path | Current owner | Target owner | Action | Replacement / notes | Program child |
| --- | --- | --- | --- | --- | --- |
| `docs/ops/ai/SHARED-AGENT-RULES.md` | ops/ai (incorrect for binding policy) | Agent Team governance | migrate | `docs/governance/AGENT-TEAM.md` or split policy index (Task 4) | Task 4 #2486 follow-on |
| `docs/ops/ai/CORE-RULES.md` | ops/ai | Agent Team governance | migrate | Consolidate into governance agent policy (Task 4) | Task 4 |
| `docs/ops/ai/CURSOR-RULES.md` | ops/ai | Agent Team governance + reference | migrate | Binding rules → governance; execution facts remain reference-adjacent | Task 4 |
| `docs/ops/ai/chatgpt-cursor-handoff-workflow.md` | Operations | Operations (procedure) | retain | Procedure stays under ops; constitution links as related | — |
| `docs/how-to/cursor/github-poll-wake-loop.md` | Operations procedure | Operations procedure | retain | Local runtime procedure; linked from runtime routing standard | — |
| `docs/governance/standards/CURSOR-RUNTIME-ROUTING.md` | Agent Team governance | Agent Team governance | retain | Already in correct layer from #2489 | — |

Until Task 4 migration completes, legacy `docs/ops/ai/` binding files remain **interim authoritative** for agent execution. New binding policy must not be added under `docs/ops/ai/`.

## Domain policy targets (not in #2486 allowlist — later children)

| Domain | Target policy path | Introduced by |
| --- | --- | --- |
| PMO and Portfolio | `docs/governance/PMO-PORTFOLIO.md` | Task 3 |
| Delivery and Release | `docs/governance/DELIVERY-AND-RELEASE.md` | Task 5 |
| Agent Team | `docs/governance/AGENT-TEAM.md` | Task 4 |
| CI and Verification | `docs/governance/CI-AND-VERIFICATION.md` | Task 7 |
| Operations and Recovery | `docs/governance/OPERATIONS-AND-RECOVERY.md` | Task 9 |
| Platform and Environment | `docs/governance/PLATFORM-AND-ENVIRONMENT.md` | Task 6 |

## Validation checklist (#2486)

- [x] Every touched allowlist row has target owner and action recorded
- [x] Agent-policy conflict documented with interim authority noted
- [x] No duplicate active authority introduced in touched set
- [x] Direct references updated within touched documents
- [x] Header checks pass on modified files (local run)
