---
Doc Type: Reference
Audience: Human + AI
Authority Level: Controlled
Owns: Administrative control lane mutation classes, trigger classes, evidence requirements, blocking rules, clarification routing, and exception-resolution contract
Does Not Own: Product scope, technical design, delivery-model selection, implementation authority, PR approval, merge authority, or workflow implementation
Canonical Reference: /docs/governance/OPERATIONS-AND-RECOVERY.md
Related Issues: #2641
Last Reviewed: 2026-07-19
---

# Administrative Control Lane Contract

## Purpose

Define the stable repository-wide contract for the administrative control lane.

The administrative control lane is the mutation-capable, non-code operational control plane that follows approved work from intake through final closure. It keeps GitHub Issues, pull requests, PMO reporting, queue state, handoffs, closeout evidence, and exception records aligned with existing authority.

It does not implement repository code, change project objectives, or substitute for technical validation, independent review, approval, or merge authority.

## Core rule

> The administrative control lane may reconcile repository state to existing authority, but it must not create new execution authority.

Administrative work is non-blocking unless an explicit authority, source-issue, dependency, validation, approval, closeout, or safety invariant is missing, contradictory, or failed.

## Lane relationship

```text
PMO / intake lane
        ↓
Execution lane(s) ── parallel where independently authorized
        ↓
Validation and review lane
        ↓
Integration / promotion boundary
        ↓
Administrative control lane reconciliation
        ↓
Reporting, successor routing, exception resolution, final closure
```

The administrative lane follows every approved execution lane. It is not a repository-wide execution lock and must not serialize independent projects merely because they share administrative reporting surfaces.

## Primary actors

| Actor | Administrative responsibility |
| --- | --- |
| Deterministic CI | Apply mechanically provable administrative transitions within its explicit permissions and fail closed on ambiguity |
| Chat / Atlas | Resolve final clarifications, review ambiguous administrative evidence, authorize bounded housekeeping, and disposition closeout exceptions |
| Bill | Resolve material product, priority, cost, credential, business, or authority decisions that exceed administrative scope |
| Cursor | Supply implementation and validation evidence; report blockers and recommendations; do not mutate administrative state unless the source issue explicitly authorizes a bounded administrative action |

## Allowed mutation classes

The administrative control lane may perform these actions when the correct result is mechanically provable from current repository authority and live evidence:

- add, remove, or replace lifecycle and status labels;
- add, remove, or replace agent-routing and handoff labels;
- reconcile assignees on Issues and pull requests;
- correct PMO lifecycle, work-type, priority, and reporting labels when an authoritative source already establishes the value;
- correct parent, child, predecessor, successor, project, and program references;
- remove stale, contradictory, duplicate, or terminally invalid administrative labels;
- reconcile stale handoff, ready, in-progress, review, blocked, failed, or complete states;
- add administrative comments that record evidence, clarification, disposition, queue action, or halt reason;
- reconcile milestone and reporting metadata when explicitly governed;
- update dashboard, audit, portfolio, or status-index inputs when the source issue authorizes that surface;
- close or reopen Issues when an authorized closeout, cancellation, supersession, or correction rule deterministically requires it;
- activate, defer, halt, or reconcile an already-authorized successor;
- create or update bounded remediation and closeout-exception Issues;
- resolve housekeeping exceptions after successful technical work;
- record final administrative closure after required execution, validation, review, approval, and closeout evidence is complete.

## Prohibited mutation classes

The administrative control lane must not:

- change an Issue objective, purpose, or project outcome;
- add, remove, or reinterpret acceptance criteria;
- change product scope, functional requirements, design, architecture, or user experience;
- change file allowlists or implementation non-goals;
- select or change a delivery model without existing PMO authority;
- change implementation branch, component boundary, runtime, or environment authority;
- weaken, bypass, invent, or remove validation requirements;
- weaken, bypass, invent, or remove review or approval requirements;
- change priority unless correcting to an explicit Bill-authorized or canonical PMO value;
- reorder dependencies or successors without existing queue authority;
- launch a held, pipeline, unapproved, or materially changed project;
- edit application code, CI workflows, scripts, infrastructure configuration, secrets, credentials, or production state as an administrative action;
- interpret ambiguity as permission;
- convert a reporting preference into an execution gate.

Any prohibited change requires the owning execution, design, PMO, delivery, CI, platform, or human decision lane.

## Trigger classes

| Trigger | Administrative action |
| --- | --- |
| Issue created or launched | Validate required administrative metadata; record exact missing invariant without inventing scope |
| Task assigned or handed off | Reconcile routing labels, assignee, lane identity, and current status |
| Cursor claims work | Record in-progress state and suppress stale or duplicate ready state |
| PR opened or updated | Reconcile source-Issue linkage, PR lifecycle status, assignment, and reporting metadata |
| Validation result changes | Reflect pass, fail, pending, or blocked state without changing the validation requirement |
| Review or approval changes | Reflect review state and route unresolved findings without substituting for reviewer judgment |
| PR merges | Allow post-merge closeout CI to perform the primary atomic administrative transaction |
| Post-merge closeout passes | Verify source Issue, terminal labels, parent reporting, successor disposition, and final closure |
| Post-merge closeout fails or is partial | Create or update one bounded exception record; preserve evidence; halt only the affected invariant or lane |
| Work is canceled, superseded, duplicate, or not planned | Apply the authorized disposition, reconcile labels and links, and record queue impact |
| No merge event exists | Reconcile non-code, administrative-only, canceled, or manually completed work from explicit authority and evidence |
| Contradictory administrative state appears | Correct when deterministic; otherwise request final clarification and record the exact conflict |
| Clarification is answered | Persist the answer on the authoritative Issue or PR and complete only the resulting administrative mutations |
| Stale work exceeds threshold | Reconcile routing, record halt reason, or open/update a bounded remediation Issue |

## Final clarification contract

The administrative control lane owns final clarification management for repository housekeeping.

A clarification is administrative only when the answer selects among outcomes already authorized by higher policy, the source Issue, verified technical evidence, or an existing queue contract.

Examples include:

- which of two contradictory status labels is current;
- whether a source Issue should remain open after merge under an existing keep-open instruction;
- which already-declared successor is now eligible;
- whether a stale handoff should be restored, cleared, or marked blocked;
- whether a closeout exception is resolved by existing evidence;
- which parent or dashboard record must reflect an already-completed transition.

A clarification is not administrative when it changes objectives, design, acceptance criteria, priority, delivery model, validation, approval, cost, credentials, production behavior, or business intent. Those questions route to the owning lane or Bill.

Every final clarification must be recorded on the relevant Issue, PR, or canonical repository document before mutation.

## Post-merge closeout relationship

Successful post-merge closeout CI is the primary administrative actor for merge-triggered closeout.

A clean atomic closeout should:

1. verify the merge and merge commit;
2. verify required validation and accepted exceptions;
3. reconcile terminal source-Issue labels;
4. close or preserve the source Issue according to authority;
5. update actively tracking parent, project, or program state;
6. activate, defer, halt, or explain the successor state;
7. create or update remediation when closeout cannot complete;
8. verify the final administrative state before reporting success.

The broader administrative lane must not duplicate a successful closeout transaction. It owns exception resolution when closeout CI fails, partially completes, lacks a merge trigger, or later evidence reveals administrative drift.

## Blocking rules

Administrative state blocks an execution lane only when one of these conditions is true:

- no valid source Issue or execution authority exists;
- required dependency or predecessor state is unresolved;
- required validation failed or is missing;
- required independent review or approval is missing;
- source-Issue, branch, delivery-model, or protected-boundary evidence is contradictory;
- closeout cannot safely determine source-Issue or successor disposition;
- production, credential, cost, destructive, or material product authority is required;
- duplicate or colliding claims make execution unsafe.

Reporting lag, dashboard lag, optional comments, cosmetic label order, and non-critical administrative debt do not block otherwise authorized work.

A blocker should halt only the affected lane or transition. Independent approved lanes continue unless they share the failed invariant or collision set.

## Evidence requirements

Every administrative mutation must be supported by one or more of:

- canonical policy or reference contract;
- source-Issue body or recorded Bill/Chat authority;
- current Issue or PR state;
- current labels and assignments;
- merged PR and merge commit;
- validation and check results;
- review and approval evidence;
- predecessor, successor, project, or program manifest;
- canonical closeout packet;
- exact clarification response recorded on GitHub.

The actor must re-read current state immediately before mutation and verify the result afterward.

## Idempotency and collision rules

- Repeating the same administrative input must not produce duplicate comments, Issues, or transitions.
- Stable action or exception identifiers should be used where automation supports them.
- A mutation must be skipped when the intended state already exists.
- A stale action must not overwrite a newer review, validation, merge, closeout, or authority event.
- Multiple dispatchers may inspect the repository, but only one may claim the same administrative action revision.
- Administrative reconciliation must not create a repository-wide lock across independent execution lanes.

## Exception lifecycle

```text
DETECTED -> RECORDED -> CLARIFICATION OR REMEDIATION -> VERIFIED -> RESOLVED
```

An exception record must identify:

- affected Issue, PR, project, or lane;
- failed or contradictory invariant;
- current technical and administrative evidence;
- whether execution may continue;
- exact clarification or remediation required;
- responsible lane or actor;
- resolution evidence;
- final housekeeping actions.

Resolved exceptions must not retain active failure labels or continue to block successors.

## Required references

- Constitutional ownership: `docs/governance/REPOSITORY-AUTHORITY.md`
- Domain policy: `docs/governance/OPERATIONS-AND-RECOVERY.md`
- Agent authority: `docs/governance/AGENT-TEAM.md`
- PMO authority: `docs/governance/PMO-PORTFOLIO.md`
- PR lifecycle: `docs/governance/PR_LIFECYCLE_STATE_MACHINE.md`
- Queue and dispatch procedure: `docs/ops/pmo/queue-watch-and-dispatch-protocol.md`
- Closeout procedure: `docs/ops/pmo/github-issue-closeout-protocol.md`
