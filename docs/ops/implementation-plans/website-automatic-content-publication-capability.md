---
Doc Type: Implementation Plan
Audience: Bill, Atlas, Cursor, LGFC maintainers, implementation agents, and reviewers
Authority Level: Operational Plan
Owns: Cursor task sequence, child-task boundaries, validation model, file-area expectations, and closeout rules for Website Automatic Content Publication Capability
Does Not Own: Runtime implementation before assigned task issues, merge authority, production secrets, Program #1738 source rules, or Program #2039 staging route implementation
Status: planning-ready
Project: website-automatic-content-publication-capability
Owner: Atlas
Execution Mode: cursor-after-launch-authorization
Source Issue: 2040
Related Program Issue: 2040
Canonical Reference: /docs/ops/pmo/website-automatic-content-publication-capability.md
Related Issues: #1738, #2039, #2040, #2043, #2049, #2050, #2051, #2052, #2053, #2054, #2055, #2056
Last Reviewed: 2026-06-29
---

# Website Automatic Content Publication Capability Implementation Plan

> Program #2040 is controlled by GitHub issues. Cursor may execute only the assigned child task issue and must stop at `READY FOR REVIEW`.

## Purpose

Define the Cursor implementation sequence for **Website Automatic Content Publication Capability**.

This plan converts the Program #2040 readiness package into bounded tasks for controlled content-publication support after Program #1738 proves the manual workflow and Program #2039 provides the admin staging foundation.

## Scope

This plan covers:

- manual workflow evidence review;
- publication state and approval authority design;
- admin staged-content review and rotation-control requirements;
- scheduled publication and controlled rotation planning;
- audit trail, rollback, unpublish, and evidence retention;
- publication safety checks and fail-closed behavior;
- implementation of approved publication support slices;
- final operator handoff.

This plan does not authorize this documentation PR to change application code, workflows, migrations, route files, package files, issue labels, issue states, or implementation child issues.

## Current known truth

- Program #1738 owns Lou Gehrig content collection, source discovery, provenance, rights, and editorial conversion.
- Program #2039 owns the first admin-only visual staging route at `/admin/clubstaging`.
- Program #2040 depends on Program #1738 manual workflow evidence before implementation.
- Program #2040 also depends on #2043 for the first club staging route surface.
- Human approval remains mandatory before public publication.
- Public route exposure must be tied to explicit publication states and review evidence.

## Intended final state

At the end of Program #2040:

1. Website content has explicit operational states.
2. Authority to move content between states is documented and enforced by implementation slices.
3. Staged content can be reviewed before public route exposure.
4. Rotation and scheduled publication behavior are controlled and operator-visible.
5. Public publication requires approval-state evidence.
6. Missing source, credit, rights, or approval metadata fails closed.
7. Publish, unpublish, rollback, and evidence-retention behavior are documented.
8. CI/ops checks verify public exposure boundaries where feasible.

## Execution model

| Rule | Requirement |
| --- | --- |
| Execution agent | Cursor |
| Work source | Assigned child task issue only |
| PR source issue | Exactly one source issue per PR |
| Stop condition | `READY FOR REVIEW` |
| Merge authority | Bill/Atlas after required review and checks |
| Public publication | Requires recorded approval state |

## Task sequence

| Task | issue | Title | Stage before merge | Halt condition | Resume condition | Successor |
| ---: | ---: | --- | --- | --- | --- | --- |
| 001 | #2049 | Manual workflow evidence review and publication candidate inventory | #1738 handoff evidence reviewed | #1738 evidence missing or incomplete | Bill/Atlas confirm evidence or rebaseline scope | #2050 |
| 002 | #2050 | Publication state model and approval authority design | #2049 merged or accepted | State or approval authority unclear | Bill/Atlas confirm authority model | #2051 |
| 003 | #2051 | Admin staged-content review and rotation control surface design | #2050 and #2043 merged or accepted | Staging surface or review boundary unclear | Admin staging boundary confirmed | #2052 |
| 004 | #2052 | Scheduled publication and controlled rotation implementation plan | #2050 and #2051 merged or accepted | Schedule or rotation control cannot be bounded | Bill/Atlas confirm schedule/rotation boundary | #2053 |
| 005 | #2053 | Audit trail rollback unpublish and evidence retention design | #2050 merged or accepted | Recovery or retention rules unclear | Bill/Atlas confirm evidence requirements | #2054 |
| 006 | #2054 | Publication safety CI ops checks and fail-closed rules | #2050 through #2053 merged or accepted | Safety checks cannot be made deterministic | Checks converted to follow-up scope or accepted exception | #2055 |
| 007 | #2055 | Implementation of approved publication support slices | #2049 through #2054 merged or accepted | Approved implementation slices are not bounded | Bill/Atlas approve narrowed implementation slice | #2056 |
| 008 | #2056 | Program validation and operator handoff report | #2049 through #2055 merged or accepted | Open blocker lacks follow-up owner | Blocker converted to follow-up issue or accepted exception | terminal |

## Task 001 — Manual workflow evidence review

Task #2049 reviews Program #1738 manual workflow evidence and identifies publication-support candidates.

Expected output:

- candidate support steps;
- manual review gates;
- required metadata;
- decision on whether Program #2040 can proceed to state-model design.

## Task 002 — Publication state model

Task #2050 defines content states and approval authority.

Required states:

- draft;
- staged;
- reviewed;
- approved;
- scheduled;
- published;
- archived;
- rejected;
- unpublished.

Expected output:

- state-transition rules;
- approval authority model;
- metadata requirements;
- fail-closed stop conditions.

## Task 003 — Admin review and rotation-control surfaces

Task #2051 designs admin review and rotation controls building from `/admin/clubstaging`.

Expected output:

- staged-content review requirements;
- rotation-control requirements;
- movement from staging to approved public placement;
- public exposure boundaries.

## Task 004 — Scheduled publication and controlled rotation

Task #2052 plans scheduling and rotation behavior.

Expected output:

- scheduling rules;
- rotation rules;
- preview-before-public behavior;
- operator override and pause conditions.

## Task 005 — Audit, rollback, unpublish, and retention

Task #2053 defines evidence and recovery behavior.

Expected output:

- audit trail fields;
- rollback and unpublish procedures;
- retention requirements for approval and source evidence;
- operator closeout evidence.

## Task 006 — Safety checks and fail-closed behavior

Task #2054 defines checks that prevent incomplete or unapproved content from becoming public.

Expected output:

- approval-state checks;
- source, credit, rights, and route-exposure checks;
- failure behavior;
- validation expectations for implementation PRs.

## Task 007 — Implementation of approved slices

Task #2055 implements only the approved slices from Tasks 001-006.

Expected output:

- implementation matching approved design slices;
- tests for approval-state behavior and public exposure boundaries;
- docs updated to match as-built behavior.

## Task 008 — Program validation and handoff

Task #2056 validates Program #2040 completion.

Expected output:

- consolidated evidence;
- verification of publication-state controls;
- exception follow-up issues;
- operator handoff.

## Validation expectations

Each implementation PR must record relevant validation:

- documentation header checks for docs changes;
- targeted tests for changed route/component/API behavior;
- route/auth/navigation tests for admin or public route changes;
- checks for publication state and public exposure boundaries;
- rollback/unpublish validation where applicable;
- one source issue line in the PR body;
- exact file-touch allowlist alignment.

## Closeout

Program #2040 closes only after Task #2056 evidence and explicit Bill/Atlas acceptance.
