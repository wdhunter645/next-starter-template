---
Doc Type: Reference
Audience: Human + AI
Authority Level: Controlled Reference
Owns: Exact PMO documentation preparation, execution, verification, and closeout responsibilities
Does Not Own: Product priorities, implementation details, or Production approval
Canonical Reference: /docs/governance/PROJECT-DOCUMENTATION-AND-AS-BUILT.md
Related Issues: #1719
Last Reviewed: 2026-08-04
---

# PMO Project Documentation and Closeout Contract

## PMO owner

ChatGPT / Atlas is the LGFC PMO / Engineering owner. PMO is accountable for complete project definition, sequencing, assignment, governance, documentation completeness, independent review coordination, repository-state reconciliation, verification, and closeout control.

## Preparation responsibilities

Before Project Graduation, PMO must produce or verify:

- master Issue using `docs/templates/project-master-issue-template.md`;
- objective, scope, non-goals, acceptance criteria, dependencies, constraints, and stop conditions;
- architecture and design authority;
- ordered child-task graph;
- implementation owner and independent reviewer;
- delivery model and promotion path;
- validation, rollback, recovery, and post-merge verification;
- documentation inventory covering every applicable DIATAXIS and controlled operational surface;
- named AS-BUILT path;
- explicit closeout criteria.

A project is not Ready for Launch without these items.

## Execution responsibilities

During implementation, PMO must ensure:

- each task updates documentation affected by that task;
- documentation changes ship with implementation changes;
- no task defers documentation to a later project;
- the implementer remains within the source-Issue allowlist;
- review findings and post-merge exceptions return to the originating implementer;
- intermediate plans and reports are marked historical or superseded when repository truth changes;
- AS-BUILT is updated as the final implementation becomes known.

## Closeout responsibilities

Before closing any parent project, PMO must independently verify:

1. all child tasks have terminal dispositions;
2. required implementation and promotions are merged;
3. exact candidate, PR, merge, deployment, and verification identities are recorded;
4. the AS-BUILT document matches the final merged state;
5. all requirements, design, tutorial, how-to, reference, explanation, governance, PMO, operations, recovery, monitoring, and closeout documents are current;
6. PMO backlog, program registry, queue/dependency map, dashboard source, and active assignment records agree;
7. GitHub parent/child Issue bodies, labels, links, and states agree;
8. deferred work has separate source authority;
9. repository search reveals no stale current-authority statement;
10. final closeout evidence is merged and independently verified.

Any failure means `CLOSEOUT BLOCKED — DOCUMENTATION INCOMPLETE`.

## Prohibited closeout shortcuts

PMO must not close a project because:

- code merged;
- a component branch reached 100%;
- all child Issues appear closed;
- a dashboard displays 100%;
- a closeout comment was posted;
- Production promotion completed;
- documentation is described as cleanup, follow-up, administrative, or deferred work.

## Post-merge exception ownership

- Cursor-originating PR exception → Cursor remediation.
- Claude-originating PR exception → Claude remediation.
- ChatGPT-originating documentation/governance PR exception → ChatGPT remediation.
- PMO remains responsible for defect definition, routing, independent review, verification, and final closure.

## Evidence format

Every final closeout record must link:

- project and child Issues;
- final AS-BUILT document;
- implementation and promotion PRs;
- candidate and merge SHAs;
- validation and post-merge verification;
- rollback and recovery disposition;
- documentation reconciliation inventory;
- known limitations and future-work source Issues;
- final Product/Production and PMO decisions.
