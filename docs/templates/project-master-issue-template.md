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
