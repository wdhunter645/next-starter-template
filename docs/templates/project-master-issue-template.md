# Project Master Issue Template

## Authority

- Product Authority:
- PMO / Engineering:
- Implementer:
- Independent reviewer:
- Parent program:
- Delivery model:
- Promotion path:

## Objective

## Scope

## Non-goals

## Acceptance criteria

## Dependencies and protected boundaries

## Ordered task graph

## Documentation inventory

Every row requires a named file or an explicit, justified `Not applicable` disposition.

| Documentation class | Required path(s) | Owner | Completion evidence |
| --- | --- | --- | --- |
| Requirements / decisions |  |  |  |
| Design |  |  |  |
| Implementation plan |  |  |  |
| Tutorial |  |  |  |
| How-to |  |  |  |
| Reference |  |  |  |
| Explanation |  |  |  |
| Governance / PMO authority |  |  |  |
| Operations / recovery |  |  |  |
| AS-BUILT | `docs/ops/as-built/<project>-as-built.md` | Implementer + PMO verification |  |
| Final closeout evidence |  |  |  |

## AS-BUILT requirements

The AS-BUILT document must describe the exact final implementation, configuration, data, operational procedures, validation, rollback, monitoring, ownership, known limitations, and final repository authority state. Planned-state documentation does not satisfy this requirement.

## Validation

## Rollback and recovery

## Post-merge verification

## Closeout gate

The project must remain open until implementation, all documentation, AS-BUILT, PMO/dashboard/queue reconciliation, GitHub state, promotion evidence, post-merge verification, and final closeout evidence are merged and independently verified.

`CLOSEOUT BLOCKED — DOCUMENTATION INCOMPLETE` applies whenever any required document is missing, stale, contradictory, deferred, or unmerged.


## Standing Project Authority and Execution Graph

Project Graduation decision: GO | NO-GO | HOLD  
Standing implementation authority reference: ____  
Project/component branch: ____  
PR target: ____  
Default implementation role holder by child: ____  
Task acceptance and closeout authority: WORK  
Project closeout authority: WORK with required independent verification and protected Product/Production decisions

| Sequence | Child Issue | Objective | Predecessor acceptance | Successor | Serial/parallel | Writable scope | Collision proof | Package state |
| ---: | --- | --- | --- | --- | --- | --- | --- | --- |
| 001 | #____ | ____ | ____ | #____ / terminal | serial | ____ | not applicable | complete / incomplete |

A Project Graduation GO remains standing authority for this exact graph. A package-complete serial successor proceeds after predecessor WORK `ACCEPT` without a repeat Administration or PMO dispatch. Parallel execution requires explicit disjoint scopes and collision proof in this table.

## Protected Stops and Continuation

Protected decisions: ____  
True dependencies: ____  
Operations interruption behavior: ____  
Package-incomplete correction owner: WORK  
Successor release rule: WORK reconciles the child and parent and releases the next package-complete task after `ACCEPT`.  
No generic `BLOCKED` state or repeat-dispatch requirement is permitted.
