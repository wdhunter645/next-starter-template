---
Doc Type: How-To
Audience: Human + AI
Authority Level: Historical
Status: Retired
Owns: Historical record of the #1075 CI implementation issue model
Does Not Own: Current CI strategy, issue generation, PR policy, or workflow behavior
Canonical Reference: /docs/governance/PR_PROCESS.md
Related Issues: #1075, #2469
Last Reviewed: 2026-07-12
---

# Retired #1075 CI Orchestration Issue Model

## Disposition

The dedicated CI redesign issue model created under #1075 is retired by #2469.

The old model generated serial `lgfc-ci-phase:*` issues from a fixed JSON state file and paused on stale, failed, duplicate, or unstable phase state. That rollout completed, was subsequently superseded by Program #1500 and the July 2026 PR-process rebuild, and must not generate new work.

## Procedure

For current CI work, follow:

1. GitHub Issues as executable work truth.
2. `/docs/governance/PR_PROCESS.md` as canonical PR-process policy.
3. `/docs/reference/ci/pr-process-current-state.md` for the current implementation baseline.
4. `/docs/reference/ci/merge-protection-surface.md` for required checks.
5. One scoped issue and one PR for authorized CI changes.
6. Single-owner post-merge closeout through `.github/workflows/post-merge-closeout.yml`.

There is no active dedicated CI phase engine.

## Preserved generic capability

The repository may still use the generic implementation-plan issue factory and serial queue for explicitly approved plans. That capability is documented in `/docs/reference/architecture/orchestration-model.md` and does not reactivate #1075.

## Historical markers

Existing `lgfc-ci-phase:*` markers and #1075 task issues are historical evidence. They do not authorize implementation, block current work, or define completion state.

## New CI work

New CI changes require a current issue with:

- explicit objective and authority;
- bounded files;
- current-state validation;
- rollback boundary;
- acceptance criteria;
- confirmation that the change does not restore retired #1075 behavior.
