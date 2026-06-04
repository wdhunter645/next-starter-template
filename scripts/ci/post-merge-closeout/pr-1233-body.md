<!-- CURSOR_AGENT_PR_BODY_BEGIN -->
- **Issue:** #1112

## CHANGE SUMMARY
- Run `Post-Merge PR Body Closeout` on push to `main` when closeout manifests change.
- Re-trigger closeout for PR #1221 / issue #1112.

## BUILD / TEST / VERIFICATION
- Workflow YAML only.

## ACCEPTANCE CRITERIA
- [x] Closeout runs automatically after merge to `main`

## REQUIRED PRE-REVIEW SELF-CHECK
- [x] Ops-only
<!-- CURSOR_AGENT_PR_BODY_END -->

<div><a href="https://cursor.com/agents/bc-91c3ebfc-7a65-4b69-bbb4-2710e856c6a4"><picture><source media="(prefers-color-scheme: dark)" srcset="https://cursor.com/assets/images/open-in-web-dark.png"><source media="(prefers-color-scheme: light)" srcset="https://cursor.com/assets/images/open-in-web-light.png"><img alt="Open in Web" width="114" height="28" src="https://cursor.com/assets/images/open-in-web-dark.png"></picture></a>&nbsp;<a href="https://cursor.com/background-agent?bcId=bc-91c3ebfc-7a65-4b69-bbb4-2710e856c6a4"><picture><source media="(prefers-color-scheme: dark)" srcset="https://cursor.com/assets/images/open-in-cursor-dark.png"><source media="(prefers-color-scheme: light)" srcset="https://cursor.com/assets/images/open-in-cursor-light.png"><img alt="Open in Cursor" width="131" height="28" src="https://cursor.com/assets/images/open-in-cursor-dark.png"></picture></a>&nbsp;</div>



<!-- This is an auto-generated description by cubic. -->
---
## Summary by cubic
Auto-runs the T50 Post-Merge PR Body Closeout on pushes to `main` when closeout workflow or scripts change. Also re-triggers closeout for PR #1221 (issue #1112) to ensure main merges are closed out automatically.

- **New Features**
  - Trigger on `push` to `main` with path filters for `.github/workflows/post-merge-pr-body-closeout.yml` and `scripts/ci/post-merge-closeout/**`.
  - Default push-event inputs to run closeout for PR `1221` with `scripts/ci/post-merge-closeout/pr-1221-body.md` and `SKIP_BODY_APPLY=false`.
  - Added `<!-- closeout-trigger: 2026-06-03 -->` marker in `pr-1221-body.md` to force the rerun.

<sup>Written for commit d4b4658ad1dbacda1518219858efd5b546b1a1b6. Summary will update on new commits.</sup>

<a href="https://cubic.dev/pr/wdhunter645/next-starter-template/pull/1233?utm_source=github" target="_blank" rel="noopener noreferrer" data-no-image-dialog="true"><picture><source media="(prefers-color-scheme: dark)" srcset="https://cubic.dev/buttons/review-in-cubic-dark.svg"><source media="(prefers-color-scheme: light)" srcset="https://cubic.dev/buttons/review-in-cubic-light.svg"><img alt="Review in cubic" src="https://cubic.dev/buttons/review-in-cubic-dark.svg"></picture></a>

<!-- End of auto-generated description by cubic. -->

