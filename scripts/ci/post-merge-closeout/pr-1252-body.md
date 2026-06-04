<!-- CURSOR_AGENT_PR_BODY_BEGIN -->
- **Issue:** #1196

## CHANGE SUMMARY
- Removes duplicate `linkedIssueNumber` declaration in `post_merge_validator.mjs` that causes `SyntaxError` on `main` after PR #1249 merged.
- Restores post-merge validation and source-issue closeout automation.

## BUILD / TEST / VERIFICATION
- `node -e "import('./scripts/ci/post_merge_validator.mjs')"` — PASS
- `npm test -- tests/post-merge-validator.test.mjs tests/post-merge-source-issue-closeout.test.mjs` — PASS (21 tests)

## REQUIRED PRE-REVIEW SELF-CHECK
- [x] PR body contains all required sections with exact headings
- [x] PR body contains one accepted source-issue accounting line governed by `/docs/governance/PR_GOVERNANCE.md`.
- [x] Allowed files section matches final diff exactly
- [x] No files outside allowlist
- [x] ZIP safety confirmed
- [x] Intent label correct and singular
- [x] Local checks executed and passed or exact blocker documented
- [x] Post-merge closeout body remediation applied for merged PR governance

## ACCEPTANCE CRITERIA
- [x] `post_merge_validator.mjs` loads without duplicate identifier error.
- [x] Post-merge detection workflow can run for merged PR #1249 after merge.

## FILE-TOUCH ALLOWLIST (MANDATORY)
- `scripts/ci/post_merge_validator.mjs`
<!-- CURSOR_AGENT_PR_BODY_END -->

<div><a href="https://cursor.com/agents/bc-0f8fa537-d0d1-4934-b0b8-58d344b19f53"><picture><source media="(prefers-color-scheme: dark)" srcset="https://cursor.com/assets/images/open-in-web-dark.png"><source media="(prefers-color-scheme: light)" srcset="https://cursor.com/assets/images/open-in-web-light.png"><img alt="Open in Web" width="114" height="28" src="https://cursor.com/assets/images/open-in-web-dark.png"></picture></a>&nbsp;<a href="https://cursor.com/background-agent?bcId=bc-0f8fa537-d0d1-4934-b0b8-58d344b19f53"><picture><source media="(prefers-color-scheme: dark)" srcset="https://cursor.com/assets/images/open-in-cursor-dark.png"><source media="(prefers-color-scheme: light)" srcset="https://cursor.com/assets/images/open-in-cursor-light.png"><img alt="Open in Cursor" width="131" height="28" src="https://cursor.com/assets/images/open-in-cursor-dark.png"></picture></a>&nbsp;</div>



<!-- This is an auto-generated description by cubic. -->
---
## Summary by cubic
Fixes a SyntaxError in the post-merge validator by removing a duplicate `linkedIssueNumber` definition and re-exporting the imported helper. Restores post-merge validation and source-issue closeout after PR #1249; addresses #1196.

- **Bug Fixes**
  - Removed the duplicate `linkedIssueNumber` and added an explicit re-export to avoid duplicate identifier errors.

<sup>Written for commit d63cdb55d510efa5db6185a13440914618a78311. Summary will update on new commits.</sup>

<a href="https://cubic.dev/pr/wdhunter645/next-starter-template/pull/1252?utm_source=github" target="_blank" rel="noopener noreferrer" data-no-image-dialog="true"><picture><source media="(prefers-color-scheme: dark)" srcset="https://cubic.dev/buttons/review-in-cubic-dark.svg"><source media="(prefers-color-scheme: light)" srcset="https://cubic.dev/buttons/review-in-cubic-light.svg"><img alt="Review in cubic" src="https://cubic.dev/buttons/review-in-cubic-dark.svg"></picture></a>

<!-- End of auto-generated description by cubic. -->