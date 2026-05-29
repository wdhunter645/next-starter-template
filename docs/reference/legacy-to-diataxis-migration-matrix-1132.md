---
Doc Type: Reference
Audience: Human + AI
Authority Level: Controlled
Owns: Project #1132 legacy-to-DIATAXIS migration matrix
Does Not Own: Final archive deletion, canonical authority promotion, or implementation execution
Canonical Reference: /docs/README.md
Related Issues: #1132, #1134, #1076, #1019, #1039
Last Reviewed: 2026-05-29
---

# Legacy to DIATAXIS Migration Matrix — Project #1132

## Purpose

This matrix identifies how legacy and non-DIATAXIS documentation surfaces should be treated during the documentation completion program.

## Migration Matrix

| Source surface | Target disposition | Target DIATAXIS area | Required validation |
|---|---|---|---|
| `docs/archive/` | Preserve as historical/reference unless promoted | `docs/archive/` or promoted target | Confirm not treated as active authority |
| `docs/as-built/` | Preserve as historical operational record | `docs/as-built/` | Link to completed PR/project where possible |
| `docs/ops/tasks/` | Review for active task content and migrate durable requirements | `docs/how-to/` or trackers | Confirm status and avoid stale task authority |
| `docs/ops/tickets/` | Review for issue-derived requirements | `docs/how-to/` or GitHub Issues | Confirm whether replaced by live issues |
| `docs/ops/projects/` | Review for project plans | `docs/reference/`, `docs/how-to/`, or archive | Promote only current durable requirements |
| `ops/ai/` | Reconcile with `docs/ops/ai/` and `Agent.md` | `docs/ops/ai/` or archive | Establish one authority path |
| `.agents/skills/` | Preserve as reusable skills | `.agents/skills/` with references from docs | Ensure skills do not override canonical docs |
| GitHub issue bodies | Extract durable requirements into docs where needed | Appropriate DIATAXIS folder | Issues become trackers, not sole authority |
| Recently merged documentation PRs | Preserve as change history and source of current docs | Existing merged paths | Verify current file state after merge |

## Migration Rule

Legacy content must not be deleted merely because it is old. It is retired only after:

1. current value is assessed;
2. durable requirements are promoted or explicitly rejected;
3. references are updated;
4. archive/preservation requirements are met;
5. closure is recorded.

## Phase 3E and 3F Dependency

This matrix is preliminary. The DIATAXIS Migration Package and Legacy Retirement Package must convert it into executable migration order, completion criteria, and validation criteria.
