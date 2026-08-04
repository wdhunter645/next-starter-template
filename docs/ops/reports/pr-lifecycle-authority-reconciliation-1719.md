---
Doc Type: Operations Report
Audience: Bill, Atlas, Cursor, LGFC maintainers, and reviewers
Authority Level: Evidence
Owns: Task #2562 reconciliation evidence for PR lifecycle authority
Does Not Own: Canonical PR policy, CI implementation, merge authority, or future workflow changes
Canonical Reference: /docs/governance/PR_PROCESS.md
Related Issues: #1719, #2528, #2562
Last Reviewed: 2026-07-17
---

# PR lifecycle authority reconciliation — Program #1719

## Purpose

Record the authority correction completed by Task #2562 so the conceptual PR lifecycle no longer requires dynamic GitHub state to be stored in the PR body.

## Scope

This report covers reconciliation among:

- `docs/governance/PR_PROCESS.md`;
- `.github/pull_request_template.md`;
- `docs/governance/PR_LIFECYCLE_STATE_MACHINE.md`;
- the Task #2562 acceptance criteria.

No workflow, script, runtime, template, label, branch-protection, or production behavior was changed.

## Current known truth

`docs/governance/PR_PROCESS.md` defines the PR body as a stable-facts surface. Reviews, review threads, checks, labels, merge state, and post-merge closeout records own dynamic lifecycle state.

The prior lifecycle document conflicted with that policy by requiring dynamic items such as review-comment identifiers, thread-state ledgers, merge-readiness fields, CI state, pre-merge state blocks, and post-merge status to be recorded in the PR body.

Protected governance paths are classified by the live delivery-profile evaluator as `protected-change-review` with `multi-step` rollback, including when the PR targets an authorized non-production component branch.

## Intended final state

The lifecycle document remains useful as a conceptual state model while all dynamic lifecycle evidence is read from GitHub-native surfaces. The PR body contains only the stable facts required by the current template.

## Reconciliation result

| Concern | Prior lifecycle requirement | Reconciled authority |
| --- | --- | --- |
| PR body purpose | Stable facts plus dynamic lifecycle ledger | Stable implementation facts only |
| Review comment identifiers | Required parser-safe PR-body entries | Remain on GitHub review surfaces; no PR-body ledger |
| Review-thread state | Required PR-body state accounting | Read from GitHub-native review threads |
| Check and gate state | Repeated in PR-body readiness evidence | Read from checks and workflow runs |
| `READY FOR MERGE` | Mandatory PR-body state field | Derived reviewer/controller assessment |
| Pre-merge closeout prediction | Mandatory PR-body block | Dynamic comment, check summary, or closeout-control evidence |
| Post-merge closeout | PR-body state ledger | Post-merge record plus source-issue state |
| Agent lifecycle report | Implied durable PR-body content | Current handoff, comment, or operational report |

## Concepts intentionally retained

The following lifecycle concepts remain because they improve execution clarity without conflicting with stable-facts policy:

- `NO PR`;
- `DRAFT`;
- `READY FOR REVIEW`;
- `READY FOR MERGE` as a derived assessment;
- `HUMAN MERGE DECISION`;
- `MERGED`;
- `CLOSEOUT VERIFIED`.

The document also retains source-issue validation, allowlist control, required checks, independent review, human merge authority, post-merge verification, and queue-continuation decisions.

## Acceptance-criteria disposition

- Canonical stable-facts policy is explicit: **pass**.
- Dynamic lifecycle state is assigned to GitHub-native surfaces: **pass**.
- Conflicting comment-ID, thread-ledger, lifecycle-field, and pre-merge PR-body requirements are removed: **pass**.
- Conceptual lifecycle guidance remains without contradicting `PR_PROCESS.md`: **pass**.
- Reconciliation evidence is recorded here: **pass**.
- Workflow, script, runtime, and template implementation remained unchanged: **pass**.

## Validation plan

Required validation for the Task #2562 PR:

- documentation header validation for both changed files;
- comparison against `docs/governance/PR_PROCESS.md` and `.github/pull_request_template.md`;
- changed-path allowlist review;
- protected-change delivery-profile validation;
- `git diff --check` or equivalent whitespace inspection;
- repository CI and documentation checks on the PR head.

## Result

Task #2562 is implementation-complete on its working branch and ready for PR-based validation against `component/pmo-governance-workflow-automation`.
