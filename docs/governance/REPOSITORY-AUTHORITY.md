---
Doc Type: Governance
Audience: Human + AI
Authority Level: Constitutional
Owns: Repository precedence, GitHub issue authority, domain ownership, canonical-source rules, administrative-control ownership, supersession, and unresolved-conflict escalation
Does Not Own: Detailed PMO, PR, agent, CI, Operations, or platform procedures
Canonical Reference: /docs/governance/REPOSITORY-AUTHORITY.md
Related Issues: #2477, #2486, #2641
Last Reviewed: 2026-07-19
---

# Repository Authority

## Purpose

This document is the **repository constitution** for LGFC. It defines precedence, domain ownership, and canonical-source rules so process changes can update one owning domain instead of rewriting unrelated authority.

Detailed procedures live in domain policy, shared contracts, how-to documents, and as-built records.

## Precedence

When sources conflict, resolve in this order:

1. Locked design, platform, and Bill-approved product decisions above the source issue
2. This constitution (`docs/governance/REPOSITORY-AUTHORITY.md`)
3. Domain policy documents named in the [domain ownership](#domain-ownership) table
4. Shared contracts and profiles under `docs/reference/**`
5. Source GitHub issue for the active task (scope, allowlist, acceptance criteria)
6. Procedures under `docs/how-to/**`
7. Implementation and as-built state (workflows, scripts, templates, configuration)
8. Issue comments, PR bodies, chat, and agent memory

GitHub Issues and Pull Requests are the authoritative execution record for normal implementation work.

## GitHub issue authority

- One open, same-repository, non-PR source issue is task authority for implementation.
- Issue body, allowlist, and recorded Bill/Chat authorization define scope.
- Labels and handoff comments are routing markers; they do not replace issue authority or merge approval.
- Tracker files are historical indexes unless a source issue explicitly authorizes tracker edits.

## Canonical source rule

Each topic has **one** active canonical owner. Other documents may link to that owner but must not restate competing rules.

A normal PR that touches a legacy document must complete disposition (migrate, consolidate, archive, supersede, or delete) before the PR completes. Headers alone do not complete migration.

## Authority layers

| Layer | Purpose | Typical location |
| --- | --- | --- |
| 0 — Constitution | Precedence, domain ownership, escalation | `docs/governance/REPOSITORY-AUTHORITY.md` |
| 1 — Domain policy | One policy boundary per domain | `docs/governance/**` (domain-owned policy files) |
| 2 — Shared contracts | Stable metadata and classification | `docs/reference/**` |
| 3 — Procedures | Single execution paths | `docs/how-to/**` |
| 4 — Implementation | Workflows, scripts, templates, live config | `.github/**`, `scripts/**`, as-built docs |

## Domain ownership

Each domain has exactly one canonical policy file. Shared contracts and supporting documents may link to that owner; they are not co-owners.

| Domain | Canonical policy owner | Owns |
| --- | --- | --- |
| Product and Design | `docs/governance/PRODUCT-AND-DESIGN.md` (target; see disposition map) | Product behavior, UX, functional requirements |
| PMO and Portfolio | `docs/governance/PMO-PORTFOLIO.md` (target; see disposition map) | Work inventory, size, priority, launch authorization |
| Delivery and Release | `docs/governance/DELIVERY-AND-RELEASE.md` (target; see disposition map) | Model A, Model B, promotion, approval, rollback policy |
| Agent Team | `docs/governance/AGENT-TEAM.md` (target; see disposition map) | Chat, Cursor, Bill roles and binding agent policy |
| CI and Verification | `docs/governance/CI-AND-VERIFICATION.md` (target; see disposition map) | Gate profiles, evidence, promotion criteria |
| Operations and Recovery | `docs/governance/OPERATIONS-AND-RECOVERY.md` (target; see disposition map) | Administrative control lane, upkeep, clarification and exception resolution, degradation, incidents, emergency recovery |
| Documentation and Knowledge | `docs/governance/standards/DIATAXIS-FOLDER-AUTHORITY.md` | DIATAXIS routing, migration ratchet, archive rules |
| Platform and Environment | `docs/governance/PLATFORM-AND-ENVIRONMENT.md` (target; see disposition map) | Cloudflare, D1, B2, preview/production boundaries |

Target domain policy filenames are introduced through the delivery-system program. Until a target file lands, the disposition map records interim supporting material only — not alternate policy owners.

### Supporting references (non-authoritative)

These documents inform domains but do not share canonical policy ownership:

| Domain | Supporting references |
| --- | --- |
| Product and Design | `docs/reference/design/LGFC-Production-Design-and-Standards.md`; page specs under `docs/reference/design/**` |
| Operations and Recovery | `docs/reference/operations/administrative-control-lane-contract.md` |
| Documentation and Knowledge | `docs/governance/standards/DIATAXIS-AUTHORITY-RESOLUTION.md`; `docs/governance/DOCUMENT-ARCHITECTURE.md` |

## Administrative control lane routing (binding)

The repository-wide administrative control lane is owned by the Operations and Recovery domain policy. It is the mutation-capable, non-code control plane that follows all approved execution and review lanes.

The administrative control lane may reconcile deterministic repository metadata and housekeeping to existing authority. It must not create new execution authority, change project objectives, alter implementation scope, or replace technical review and approval gates.

Stable administrative mutation classes and stop boundaries live in `docs/reference/operations/administrative-control-lane-contract.md`. Execution procedures live in `docs/ops/pmo/queue-watch-and-dispatch-protocol.md` and `docs/ops/pmo/github-issue-closeout-protocol.md`.

## Agent material routing (binding)

Resolve the historical split between `docs/ops/ai/` and DIATAXIS folder rules:

| Material | Canonical location |
| --- | --- |
| Binding agent policy | `docs/governance/**` |
| Agent facts and contracts | `docs/reference/**` |
| Agent execution procedures | `docs/how-to/**` |
| Live queues, handoffs, runtime routing state | `docs/ops/**` |

Files under `docs/ops/ai/` that currently hold binding policy remain authoritative until migrated under an explicit delivery-system child issue. Do not treat `docs/ops/` as a system-authority folder for new binding policy.

## Supersession

A document supersedes another only when disposition is complete: correct folder, authority header, ownership boundary, non-conflict with higher authority, and merged to the active branch (or component branch for Model B work).

## Escalation

Stop and escalate to Bill (with Chat as gate-review partner) only when:

- two canonical documents make an irreconcilable authority decision;
- a material product or design decision is unresolved;
- preview/production isolation cannot be established safely.

Routine document migration, header correction, reference updates, deterministic administrative reconciliation, and duplicate cleanup are not escalation events.

## Related documents

- Administrative control lane contract: `docs/reference/operations/administrative-control-lane-contract.md`
- Disposition map: `docs/reference/diataxis/two-model-authority-disposition-map.md`
- Delivery system design: `docs/explanation/projects/two-model-delivery-system-design.md`
- Document architecture: `docs/governance/DOCUMENT-ARCHITECTURE.md`
- DIATAXIS folder authority: `docs/governance/standards/DIATAXIS-FOLDER-AUTHORITY.md`
