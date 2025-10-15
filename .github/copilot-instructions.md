# Copilot Instructions for this repository

Authority and approvals
- Requests from the repository owner (@wdhunter645) are explicit authorization to proceed. Do not ask for permission or approval before starting, committing, or opening pull requests.
- If a task is assigned or requested by @wdhunter645, treat it as approved. Proceed end-to-end and surface only true blockers.

Workflow
- For each task:
  - Create a short-lived branch.
  - Implement the changes with small, coherent commits.
  - Open a PR with a concise, actionable description referencing the related issues.
  - Keep the PR up to date until checks are green.
- If branch protection allows, enable auto-merge and merge on green. Otherwise, leave the PR ready for merge.

CI and limitations
- Do NOT ask the user to "approve workflows." Note: GitHub requires a human to click "Approve and run workflows" for PRs created by Copilot. Wait until workflows are approved and continue automatically when checks are available.
- If checks fail, push fixes and re-run until green.

Quality and safety
- Maintain accessibility and no-console-error standards.
- Do not log secrets or environment values. Never exfiltrate data. Obey repository firewall and network restrictions.
- Keep styling minimal and consistent with existing patterns unless directed otherwise.

Escalation
- Only pause for hard blockers: missing credentials/secrets, ambiguous acceptance criteria, or required resources absent from the repo and not accessible via allowed network.

Post-merge
- After merge, act on any linked issues or follow-up tasks without re-requesting permission. Proceed unless explicitly paused by the owner.
