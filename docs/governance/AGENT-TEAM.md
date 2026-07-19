---
Doc Type: Governance
Audience: Human + AI
Authority Level: Domain Policy
Owns: LGFC agent team roles, approval authority, administrative-control responsibilities, protected stop conditions, operating modes, and launch-control workflow boundaries
Does Not Own: Shared execution rule detail, tool-specific runtime behavior, PMO sizing, delivery release policy, administrative mutation taxonomy, or production merge mechanics
Canonical Reference: /docs/governance/REPOSITORY-AUTHORITY.md
Related Issues: #2494, #2641
Last Reviewed: 2026-07-19
---

# Agent Team

## Purpose

This document is the canonical **Agent Team** domain policy. It defines who owns design, implementation, review, approval, merge, verification, administrative clarification and reconciliation; where agents must stop; and how Model A and Model B execution proceeds without routine Bill gates between implementation launch and final product review.

Stable role contracts and evidence flags live in `docs/reference/agents/implementation-authority-contract.md`. Stable administrative mutation classes and triggers live in `docs/reference/operations/administrative-control-lane-contract.md`. Execution procedures live in `docs/how-to/agents/run-model-a.md` and `docs/how-to/agents/run-model-b.md`.

Shared execution detail remains in `docs/ops/ai/CORE-RULES.md` until a later disposition pass. Tool-specific additive behavior routes through superseded pointer files under `docs/ops/ai/`.

## Current team

| Actor | Role |
| --- | --- |
| **Bill** | Project owner; design go/no-go; alternate PR approver; material-decision escalation; final completed-product reviewer |
| **Chat (Atlas)** | Final design; implementation planning and launch; primary PR reviewer/approver; merge; verification; success declaration; documentation closeout; final administrative clarification and exception disposition |
| **Cursor** | Sole LGFC implementation executor; test evidence; remediation; assigned documentation support; **no self-approval**; no routine administrative mutation |
| **Deterministic CI** | Mechanically provable validation, routing, closeout, and administrative reconciliation within explicit workflow permissions; no substantive judgment or new authority |
| **Codex** | **Inactive/out** for LGFC implementation unless Bill explicitly reauthorizes in a future governance update |

## Authority boundaries

| Decision | Authority |
| --- | --- |
| Requirements and product go/no-go | Bill |
| Final design and documentation package | Chat |
| Program and child issue authorship | Chat |
| Launch-control package completeness | Chat (author) + Cursor (pre-implementation review) |
| Implementation execution | **Cursor only** |
| Pre-implementation package review | Cursor (required checkpoint comment) |
| Implementation launch (Go) after package review | Chat (primary); Bill when Chat unavailable or material design escalation applies |
| PR review and approval | Chat (primary); Bill (alternate) |
| PR merge | Chat (primary); Bill (alternate) |
| Post-merge verification and success declaration | Chat |
| Deterministic post-merge closeout and administrative reconciliation | CI within explicit policy and workflow permissions |
| Final administrative clarification, closeout-exception disposition, and housekeeping resolution | Chat; Bill only when a protected material decision applies |
| Final completed-product review notification | Bill |
| Codex implementation routing | **Forbidden** unless future Bill-approved governance reauthorization |

Cursor must not approve, merge, declare success, or perform routine administrative closure on its own PRs or assigned work.

## Approval model

- **Chat is primary** for PR review, approval, merge, verification, routine administrative clarification, closeout-exception disposition, and implementation-loop continuation after an authorized Go decision.
- **Bill is alternate** when Chat is unavailable or when a protected stop requires owner-level product judgment.
- **Bill is not a routine gate** between implementation Go and final completed-product review for Model B child work, administrative housekeeping, or other authorized implementation loops.
- Deterministic CI may apply only mechanically provable transitions authorized by policy, source-Issue facts, and explicit workflow permissions.
- Bill remains the escalation path for material design decisions, authority conflicts, credentials/cost/business authorization, structural design failure, priority changes, and final completed-product review.

## Administrative control lane roles

The administrative control lane is owned by the Operations and Recovery policy and follows all approved execution and review lanes.

### Chat / Atlas

Chat may:

- resolve final administrative clarifications from canonical authority and live evidence;
- correct deterministic Issue, PR, PMO, routing, handoff, closeout, and reporting state;
- disposition failed or partial closeout transactions;
- create or update bounded housekeeping and closeout-exception Issues;
- reconcile successors and parent reporting after technical and approval gates complete;
- close or reopen work when an existing policy or recorded authority deterministically requires it.

Chat must not use administrative authority to change project objectives, product scope, acceptance criteria, delivery model, technical design, validation requirements, approval requirements, or priority without the owning authority.

### Deterministic CI

CI may apply administrative mutations only when the result is mechanically provable and idempotent. It must fail closed and route to Chat when evidence is missing, contradictory, ambiguous, or requires substantive judgment.

Successful post-merge closeout CI is the primary merge-triggered administrative actor. It must not duplicate a completed closeout transaction.

### Cursor

Cursor supplies implementation, validation, remediation, and closeout evidence. Cursor may recommend administrative disposition and identify exceptions, but may mutate administrative state only when a source Issue explicitly grants one bounded administrative action. Cursor never self-approves or performs final administrative clarification on its own work.

### Bill

Bill is not a routine administrative gate. Escalate only when the clarification changes product intent, priority, business/cost/credential authority, destructive or production posture, or resolves an irreconcilable authority conflict.

The detailed allowed/prohibited mutation contract is `docs/reference/operations/administrative-control-lane-contract.md`.

## Protected stop conditions

Cursor, Chat, CI, and Bill must stop and escalate when any of the following is true:

1. **Material design decision** — unresolved product, layout, architecture, or acceptance framing that changes scope or locked design.
2. **Authority conflict** — two active canonical sources disagree and the source issue does not resolve precedence.
3. **Unsafe preview isolation** — component or preview execution can mutate production resources without an approved control.
4. **Credentials, cost, or business authorization** — secrets, billing, vendor access, or business approval is required and not recorded on the source issue.
5. **Structural design failure** — evidence shows the approved design cannot satisfy acceptance criteria without replanning.
6. **Administrative ambiguity with execution impact** — source-Issue, dependency, validation, approval, collision, closeout, or successor authority cannot be determined safely.

Routine wording fixes, migration corrections, validation remediation, deterministic administrative reconciliation, closeout housekeeping, and bounded implementation corrections within the approved allowlist are **not** protected stops.

## Operating modes

Every LGFC repository task must use **exactly one** mode before action:

| Mode | Purpose | Typical owner |
| --- | --- | --- |
| **Design** | Architecture, decomposition, acceptance framing | Chat (+ Bill review) |
| **Documentation** | Canonical docs, how-to, reference, governance alignment | Chat (author) / Cursor (when assigned) |
| **Governance** | Agent rules, PR discipline, authority alignment | Chat / Cursor per assignment |
| **Worklist** | Program hierarchy, queue organization, issue structure | Chat |
| **Verification** | PR/issue/CI inspection, post-merge validation | Chat / Cursor per assignment |
| **Troubleshooting** | Failed gates, broken workflows, inconsistent state | Chat (coordinate) / Cursor (when assigned to fix) |
| **Implementation** | Scoped file changes within an approved allowlist | **Cursor only** |
| **Administrative control** | Metadata reconciliation, final clarification, closeout exceptions, reporting, and housekeeping | Chat / deterministic CI |
| **Operations cleanup** | Stale ops noise, remediation classification | Chat (coordinate) / Cursor (when assigned) |

## End-to-end workflow

```text
Bill defines requirements and design go/no-go
        ↓
Chat + Bill finalize design
        ↓
Chat creates documentation package PR
        ↓
Bill reviews / approves documentation PR (when required)
        ↓
Chat creates program master issue + child issues
        ↓
Administrative lane establishes and maintains authorized routing/reporting state
        ↓
Cursor reviews launch-control issue package (checkpoint comment)
        ↓
Chat authorizes implementation Go (Bill alternate / escalation only)
        ↓
Cursor implements and remediates continuously within scope
        ↓
Administrative lane follows Issue/PR state without blocking independent lanes
        ↓
Cursor opens/updates PR and stops at verification or protected stop
        ↓
Chat reviews, approves, merges, verifies (Bill alternate)
        ↓
Post-merge CI performs primary atomic administrative closeout
        ↓
Administrative lane resolves exceptions, reconciles reporting/successors, and finalizes housekeeping
        ↓
Chat declares success and notifies Bill for final product review
```

### Implementation-loop rule

After Chat (or Bill as alternate) authorizes implementation Go on a complete launch-control package:

- Cursor proceeds through routine implementation, validation, and PR remediation **without** routine Bill stop points.
- Cursor stops only for protected conditions, incomplete packages, scope conflict, failing required gates, unresolved blocking review threads, or explicit Chat/Bill hold instruction.
- Chat owns primary review/approval at PR ready-for-review and merge boundaries.
- The administrative lane follows each approved lane and may reconcile deterministic metadata without serializing unrelated work.
- Bill receives final completed-product review after Chat verification, administrative closeout, and success declaration.

## Launch-control package requirements

Before Cursor may execute implementation, the issue package must include:

- exactly one primary source issue;
- runtime declaration (`local` default; `cloud`/`either` only with issue authorization);
- documentation package reference;
- draft/reference code or pseudocode;
- exact file allowlist;
- non-goals;
- acceptance criteria;
- verification plan;
- rollback plan;
- Cursor pre-implementation review checkpoint;
- Chat implementation Go authorization (Bill alternate when required).

Use `docs/templates/agent-assignment-template.md` as the mandatory envelope format.

## Atlas startup orientation (`run startup`)

When Bill says `run startup`, Chat performs **orientation-only** startup and **stops**. Required report sections and prohibited actions remain in the superseded pointer at `docs/ops/ai/CHATGPT-RULES.md` until archived; they do not authorize queue audit, GitHub mutation, implementation resume, or administrative reconciliation.

## Canonical references

| Topic | Owner |
| --- | --- |
| Role contracts and protected-stop flags | `docs/reference/agents/implementation-authority-contract.md` |
| Administrative control lane policy | `docs/governance/OPERATIONS-AND-RECOVERY.md` |
| Administrative mutation and clarification contract | `docs/reference/operations/administrative-control-lane-contract.md` |
| Model A execution procedure | `docs/how-to/agents/run-model-a.md` |
| Model B execution procedure | `docs/how-to/agents/run-model-b.md` |
| Shared execution rules | `docs/ops/ai/CORE-RULES.md` |
| Cursor runtime routing | `docs/governance/standards/CURSOR-RUNTIME-ROUTING.md` |
| PMO sizing and delivery model | `docs/governance/PMO-PORTFOLIO.md` |
| Assignment envelope | `docs/templates/agent-assignment-template.md` |

## Supersession

The following files are superseded for agent team policy and approval authority:

- `docs/ops/ai/LGFC-AI-TEAM-OPERATING-MODEL.md`
- `docs/ops/ai/SHARED-AGENT-RULES.md` (shared law index; detail in `CORE-RULES.md`)
- `docs/ops/ai/CHATGPT-RULES.md`
- `docs/ops/ai/CURSOR-RULES.md`

Do not cite superseded files for team roles, approval routing, protected stops, or administrative-control authority. Retained historical content in those files is non-authoritative until archived.
