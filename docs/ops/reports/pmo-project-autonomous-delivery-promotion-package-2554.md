---
Doc Type: Promotion Package
Audience: Bill, ChatGPT, LGFC maintainers
Authority Level: Review Preparation
Owns: Proposed production-promotion PR metadata, preconditions, verification matrix, rollback profile, and stop conditions for Project #2546
Does Not Own: Approval to open or merge the production PR, current production verification, or repository settings
Canonical Reference: /docs/ops/reports/pmo-project-autonomous-delivery-final-validation-2554.md
Related Issues: #2546, #2554, #1719, #2477
Last Reviewed: 2026-07-18
---

# PMO project autonomous-delivery production promotion package

## Status

**Prepared metadata only. No production PR is opened or merged by Task #2554.**

The source component is technically complete. Production promotion requires a separate current-state review because the source branch depends on `component/delivery-system-v1`, while `main` and repository workflows may continue to change.

## Proposed pull request metadata

- **Issue:** #2546
- **Title:** `promote(#2546): PMO project-to-Cursor autonomous delivery system`
- **Head:** `component/pmo-project-autonomous-delivery`
- **Base:** `main`
- **PR class:** `mixed-approved`
- **Delivery profile:** production promotion
- **Intent label:** `intent:ops`
- **Approval profile:** Bill/ChatGPT independent current-diff review
- **Auto-merge:** prohibited
- **Rollback profile:** multi-step component rollback

## Proposed summary

Promote the completed PMO project-to-Cursor autonomous-delivery component after verifying the complete current diff against `main`. The component includes the manifest contract and validator, idempotent task-Issue materializer, least-privilege materializer workflow, canonical continuous-execution authority, PMO portfolio migration evidence, component-integration controls, operator procedure, and final validation package.

This promotion does not authorize any project GO, product priority change, pipeline wake, repository-runner registration, ChatGPT watcher activation, or automatic production merge.

## Mandatory preconditions

Do not open the promotion PR until all of the following are true:

1. the upstream `component/delivery-system-v1` dependency has been promoted or its exact required commits are already present in `main`;
2. `component/pmo-project-autonomous-delivery` contains the merged #2554 closeout package;
3. the component branch is current with the intended production base or the complete divergence has been reviewed;
4. Project #2546 remains open with no unresolved component-level technical defect;
5. all #2546 task Issues are closed and carry no wake labels;
6. current live PMO portfolio queries show no wake on pipeline parents or strategy/candidate records;
7. the materializer validator, event-selection tests, workflow-definition tests, materializer tests, lint, typecheck, Quality, Secret Scan, governance, scope, and reviewer-response checks pass on the promotion head;
8. the full `component/pmo-project-autonomous-delivery...main` diff is reviewed for unrelated or superseded content;
9. rollback and workflow-disable procedures are still accurate;
10. Bill or ChatGPT explicitly approves the final current diff.

## Required verification matrix

| Area | Required production-promotion evidence |
| --- | --- |
| Manifest contract | #2546 manifest validates; all task states are complete; terminal task is 007; no wake eligibility remains |
| Materializer | Repeated identical-state plan/apply fixtures pass; changed-manifest selection and new-branch skip tests pass |
| Permissions | Automatic events remain read-only; write permission remains isolated to explicit manual apply |
| Issue safety | Human-authored content preserved; duplicate markers and adoption candidates fail closed |
| Portfolio | Current active, pipeline, and strategy/candidate inventories reconciled; gaps remain explicit and non-executable |
| Component integration | Non-main child integration evidence is clean; no rule creates self-approval |
| Production boundary | Validator and workflow tests reject automatic `main` merge; Cursor is not a production approver |
| Documentation | Final validation, operator procedure, authority chain, and rollback references pass documentation checks |
| Security | Secret Scan and applicable security checks pass |
| Build/quality | Current required Quality profile passes |

## Proposed PR acceptance criteria

- [ ] Upstream dependency is present in `main` or explicitly included and reviewed.
- [ ] The complete current promotion diff contains no unrelated project work.
- [ ] All required checks pass on the promotion head.
- [ ] All review threads are resolved.
- [ ] Current PMO Issue state matches the committed manifests and final report.
- [ ] No pipeline/strategy record is wake-enabled.
- [ ] Automatic merge to `main` is impossible.
- [ ] Rollback and disable procedures are current.
- [ ] Bill/ChatGPT approves the exact current diff.
- [ ] Post-merge verification plan is recorded before merge.

## Proposed post-merge verification

After a separately approved manual merge:

1. confirm the merge SHA on `main`;
2. verify the materializer workflow loads without a definition error;
3. manually dispatch a dry-run against the #2546 manifest;
4. require zero blocked and zero adoption-candidate actions;
5. confirm no unexpected Issue mutation occurred;
6. verify the PMO dashboard/validation workflows that consume these contracts;
7. confirm no automatic merge, project launch, or wake was triggered;
8. record the result on #2546;
9. open a bounded remediation Issue for any defect rather than silently editing production.

## Rollback plan

If production verification fails:

1. disable the affected workflow if continued execution is unsafe;
2. preserve run logs, artifacts, Issue states, and generated blocks;
3. revert the promotion merge through a reviewed PR;
4. restore the last accepted workflow and manifest behavior;
5. run validation and dry-run materialization;
6. verify no duplicate or destructive Issue mutation;
7. record the failure and remediation on #2546;
8. do not re-promote until the root cause and regression coverage are complete.

## Stop conditions

Stop the production promotion for any of the following:

- upstream dependency ambiguity;
- unexpected files in the component-to-`main` diff;
- unresolved required check or review failure;
- active wake-state collision;
- blocked or adoption-candidate materializer action;
- workflow permission expansion;
- missing rollback evidence;
- automatic production merge path;
- unresolved product, credential, legal, privacy, or repository-setting decision;
- no explicit Bill/ChatGPT approval.

## Decision boundary

Task #2554 prepares this package and closes the component execution graph. It does not authorize opening, auto-merging, or merging the production PR. Project #2546 remains open with `status:needs-human` until the separate production review is completed.