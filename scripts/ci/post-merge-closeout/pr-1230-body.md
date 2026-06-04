<!-- CURSOR_AGENT_PR_BODY_BEGIN -->
- **Issue:** #1112

## CHANGE SUMMARY
- Add `Post-Merge PR Body Closeout` workflow_dispatch to patch merged PR governance sections and sync orchestrator state.
- Include remediated body for PR #1221 (T50 / #1112).
- Clear `status:failed` and related lifecycle labels on successful post-merge closeout.

## BUILD / TEST / VERIFICATION
- `npm test -- tests/orchestrator-queue.test.mjs` — PASS (23 tests)

## ACCEPTANCE CRITERIA
- [x] Enables automated closeout for #1112 after merge

## REQUIRED PRE-REVIEW SELF-CHECK
- [x] Ops-only change; no runtime behavior change
<!-- CURSOR_AGENT_PR_BODY_END -->

<div><a href="https://cursor.com/agents/bc-91c3ebfc-7a65-4b69-bbb4-2710e856c6a4"><picture><source media="(prefers-color-scheme: dark)" srcset="https://cursor.com/assets/images/open-in-web-dark.png"><source media="(prefers-color-scheme: light)" srcset="https://cursor.com/assets/images/open-in-web-light.png"><img alt="Open in Web" width="114" height="28" src="https://cursor.com/assets/images/open-in-web-dark.png"></picture></a>&nbsp;<a href="https://cursor.com/background-agent?bcId=bc-91c3ebfc-7a65-4b69-bbb4-2710e856c6a4"><picture><source media="(prefers-color-scheme: dark)" srcset="https://cursor.com/assets/images/open-in-cursor-dark.png"><source media="(prefers-color-scheme: light)" srcset="https://cursor.com/assets/images/open-in-cursor-light.png"><img alt="Open in Cursor" width="131" height="28" src="https://cursor.com/assets/images/open-in-cursor-dark.png"></picture></a>&nbsp;</div>



<!-- This is an auto-generated description by cubic. -->
---
## Summary by cubic
Adds a workflow to close out merged PRs by patching the PR body, re-running post-merge validation, and syncing orchestrator state. Enables automated closeout for T50 (#1112), including the remediated body for PR #1221.

- **New Features**
  - Adds workflow_dispatch "Post-Merge PR Body Closeout" with inputs: pr_number, body_file, skip_body_apply.
  - Adds scripts to apply the remediated PR body and run validation/sync (`scripts/ci/apply_merged_pr_body.mjs`, `scripts/ci/run_post_merge_closeout.mjs`).
  - Includes the remediated governance body for PR #1221.
  - On post-merge success, clears lifecycle labels (incl. `status:failed`) and sets `status:complete`; closes the source issue.
  - Updates queue test to assert label clearing and completion.

<sup>Written for commit 53a951b6736c5d9ccd111531dfe99f5e7691434b. Summary will update on new commits.</sup>

<a href="https://cubic.dev/pr/wdhunter645/next-starter-template/pull/1230?utm_source=github" target="_blank" rel="noopener noreferrer" data-no-image-dialog="true"><picture><source media="(prefers-color-scheme: dark)" srcset="https://cubic.dev/buttons/review-in-cubic-dark.svg"><source media="(prefers-color-scheme: light)" srcset="https://cubic.dev/buttons/review-in-cubic-light.svg"><img alt="Review in cubic" src="https://cubic.dev/buttons/review-in-cubic-dark.svg"></picture></a>

<!-- End of auto-generated description by cubic. -->

