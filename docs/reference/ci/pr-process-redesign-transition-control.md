# PR Process Redesign Transition-Control Inventory

Parent issue: #2175
Child issue: #2176

## Purpose

This inventory records the first transition-control changes for the PR process redesign. The goal is to stop legacy PR-body mutation and recursive closeout reconciliation behavior from blocking or destabilizing the redesign rollout.

## Transition rules

1. Do not delete required checks until branch protection has been updated safely.
2. Do not write generated lifecycle scaffolds into PR bodies during the redesign transition.
3. Do not require reviewer comment IDs or thread-state text in the PR body while the GitHub-native reviewer gate is being rewritten.
4. Do not allow reconciliation workflows to retrigger from their own issue/comment/label writes.
5. Keep safety CI such as secret scanning and quality checks in place unless a later child issue explicitly changes routing.

## CI surfaces changed in Task 1

| Surface | Previous behavior | Transition behavior |
|---|---|---|
| `.github/workflows/reviewer-response-completion.yml` | Triggered on PR events, issue comments, review submissions, and review comments. Ran PR-body auto-repair with write behavior. Enforced the legacy reviewer lifecycle gate. | Triggers only on PR target events and review submissions. PR-body auto-repair runs dry-run only. Reviewer lifecycle gate runs advisory with `ENFORCE_FAILURE=false`. |
| `scripts/ci/run_pr_body_auto_repair.mjs` | Could patch trusted same-repository PR bodies when called without dry-run. | Unchanged script, but workflow caller now sets `PR_BODY_AUTO_REPAIR_DRY_RUN=true`. |
| `.github/workflows/ops-post-merge-self-healing.yml` | Triggered on manual dispatch, schedule, issue events, push to main, and selected workflow completions. | Triggers only on manual dispatch, schedule, and selected workflow completions. Repository-level concurrency queues runs. |
| `tests/ops-post-merge-self-healing-workflow.test.mjs` | Expected issue-event self-healing behavior. | Expects issue/push triggers to remain absent during transition control and verifies queued concurrency. |

## CI surfaces intentionally not changed in Task 1

| Surface | Reason |
|---|---|
| `gate-quality.yml` | Remains valid safety CI. Class-aware routing is Task 6. |
| Secret scan / gitleaks | Always valid safety CI. |
| ZIP audit / ZIP safety | Repo-specific safety control remains valid. |
| `pr_hygiene_audit.mjs` | Rewrite is Task 3 after template replacement planning. |
| `reviewer_lifecycle_gate.mjs` | Full GitHub-native rewrite is Task 4. Task 1 only makes the old gate advisory. |
| Branch protection | Required-check migration is Task 9 after replacement checks have advisory evidence. |

## Acceptance mapping

- CI transition inventory recorded: this file.
- Mutating PR-body repair disabled: reviewer workflow now runs auto-repair dry-run only.
- Reviewer comment-ID accounting softened: reviewer lifecycle gate runs advisory during transition.
- Self-healing recursion reduced: issue and push triggers removed from self-healing workflow.
- Required checks not deleted: no workflows or scripts are deleted in this task.
