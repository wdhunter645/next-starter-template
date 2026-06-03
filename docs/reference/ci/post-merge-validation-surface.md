---
Doc Type: Reference
Audience: Human + AI
Authority Level: Controlled
Owns: Post-merge validation workflow surface, source-issue closeout behavior, remediation handoff
Does Not Own: Pre-merge merge protection rules, orchestrator queue policy
Canonical Reference: docs/explanation/ci/lgfc-ci-production-design.md
Last Reviewed: 2026-06-03
---

# Post-Merge Validation Surface

## Workflows

| Workflow | Role |
| --- | --- |
| `post-merge-intent-verification.yml` | Validates merged PRs, syncs orchestrator state, and drives source-issue closeout |
| `post-merge-remediation.yml` | Opens remediation issues and closes duplicate remediation issues after validation |

## Source issue closeout

After a merged implementation PR passes post-merge validation with no blocking remediation:

1. Resolve the linked source issue from accepted accounting formats (`- **Issue:** #NNNN`, orchestrator marker, or existing URL forms).
2. Skip closeout when the linked issue is a remediation issue (`post-merge-failure` label or remediation title prefix).
3. Remove stale active-state labels: `status:blocked`, `status:queued`, `status:failed`, `status:post-merge-verify`.
4. Add a closeout evidence comment containing PR number, merge SHA, validator status, verification result, and closeout reason.
5. Apply `status:complete` and close the source issue.

Closeout does not run when:

- validation status is `fail`
- remediation remains required
- required workflow failures exist
- the source issue cannot be confidently identified
- the PR did not merge into `main`

## Remediation preservation

Duplicate remediation issue cleanup remains unchanged. Canonical remediation issues stay open; duplicate remediation issues close. Failed validation continues to open or update remediation issues through `post_merge_remediation_issue.mjs`.

## Scripts

| Script | Responsibility |
| --- | --- |
| `scripts/ci/post_merge_validator.mjs` | Validates merged PR evidence and emits `sync_action` |
| `scripts/orchestrator/sync-pr-state.mjs` | Applies orchestrator labels and source-issue closeout |
| `scripts/ci/post_merge_source_issue_closeout.mjs` | Closeout decision helpers and evidence comment format |
| `scripts/ci/close_duplicate_remediation_issues.mjs` | Closes duplicate remediation issues only |
