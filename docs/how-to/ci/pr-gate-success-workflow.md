---
Doc Type: How-To
Audience: Human + AI
Authority Level: Operational
Owns: Repeatable PR gate-clean execution workflow for Cursor, Codex, and ChatGPT/Atlas
Does Not Own: Canonical PR governance policy; repository design authority; CI implementation design
Canonical Reference: /docs/governance/PR_PROCESS.md; /docs/governance/PR_GOVERNANCE.md; /docs/reference/governance/troubleshooting-data-surface-requirements.md
Last Reviewed: 2026-06-03
---

# PR Gate Success Workflow

This document records the repeatable workflow demonstrated by PR #1200 so Cursor, Codex, and ChatGPT/Atlas can move future PRs to a clean gate state using the same operating pattern.

## Execution

Use this workflow for every implementation, CI, governance, or website PR before claiming the PR is ready for review or ready to merge.

Do not treat a PR as clean because the visible checklist is mostly green. A PR is clean only when the PR body, changed-file allowlist, local checks, remote checks, reviewer accounting, and source-issue accounting all agree.

## Required execution sequence

1. Confirm source issue accounting first.
   - Confirm exactly one same-repository, open, non-PR source issue.
   - Put the accepted issue line near the top of the PR body.
   - Confirm the PR issue-accounting gate comments that it passed.

2. Build the PR body as the control ledger.
   - Keep all required repository sections present.
   - Keep the `FILE-TOUCH ALLOWLIST` exact.
   - Keep the intended intent label explicit and singular.
   - Record the source docs and workflow files inspected.
   - Update the body after every material fix, not only at PR creation.

3. Make the allowlist match the final diff exactly.
   - Every touched file must appear in the `Allowed files:` list.
   - No file outside the list may remain in the diff.
   - If the diff changes, update the allowlist before claiming readiness.

4. Run local checks before relying on remote gates.
   - Run the targeted tests for the changed files.
   - Run formatting checks for changed workflow/script/test files.
   - Run typecheck when TypeScript, workflow scripts, or app behavior is touched.
   - Run the broad test suite when CI behavior or shared behavior is touched.
   - Run ZIP safety / diff checks before pushing final commits.

5. Inspect remote checks at both PR and commit level.
   - Inspect PR-level governance/accounting comments.
   - Inspect commit-level workflow runs on the latest head SHA.
   - Treat historical failed or cancelled runs as superseded only when a newer equivalent run passed on the current head.
   - Inspect failed job logs before deciding whether a failure is real, stale, or superseded.

6. Iterate on reviewer findings until every actionable item is handled.
   - Read bot and human comments.
   - Read inline review threads.
   - Apply valid findings.
   - If a finding is not applied, record the rationale.
   - Keep reviewer comment IDs or thread references in the PR body when required.

7. Record reviewer-response accounting in the PR body.
   - State that all comments, bot comments, and review threads were reviewed.
   - Record each actionable item as `review-comment:<id> — accepted/rejected/acknowledged/not-applicable — <reason> — thread state: resolved/outdated/unresolved-with-rationale`.
   - Outdated threads (`is_outdated: true` or stale commit SHA) require explicit disposition even when GitHub marks them outdated.
   - Late comments arriving after `READY FOR REVIEW` must be dispositioned before merge.
   - Do not mark the PR ready if an actionable blocker remains unaddressed or undispositioned.

8. Re-run or re-evaluate gates after reviewer fixes.
   - A gate state from before reviewer-fix commits is not final.
   - Re-check latest head workflows after every fix push.
   - Re-check PR comments after every body update that affects governance parsing.

9. Only then mark ready.
   - A draft PR stays draft until a permitted actor intentionally marks it ready.
   - The readiness claim must cite current live gate state, not stale prior runs.
   - Merge must wait until source issue, reviewer accounting, and remote gates are clean.

## PR #1200 pattern to reproduce

PR #1200 reached clean gate state by doing all of the following:

- source issue line present: `- **Issue:** #1086`
- exact file allowlist for the six changed files
- explicit intent label: `change-ops`
- local targeted tests passed
- local full tests passed
- Prettier check passed for touched workflow/script/test files
- TypeScript check passed
- ZIP/diff safety check passed
- workflow files inspected before readiness claim
- PR-level governance/accounting checks inspected
- commit-level workflow runs inspected on latest head SHA
- failed gate/job logs inspected before final classification
- required gates rerun or re-evaluated after reviewer fixes
- reviewer comment IDs recorded with accepted dispositions
- unresolved threads explicitly marked `unresolved-with-rationale` when code was changed and platform/human thread resolution remained pending

## Required PR body checklist text

Use this checklist language in PR bodies when preparing a PR for review:

```markdown
## PR GATE READINESS CHECKLIST
- [ ] Live PR check panel inspected
- [ ] Commit-level workflow runs inspected on latest head SHA
- [ ] PR-level governance/accounting workflows inspected
- [ ] Failed job logs inspected for every failing gate before classification
- [ ] Workflow YAML or enforcement logic inspected before documenting gate behavior
- [ ] PR issue-accounting confirms exactly one same-repository, open, non-PR source issue
- [ ] PR body contains one accepted source-issue accounting line
- [ ] Allowed files section matches final diff exactly
- [ ] All review threads and comments inspected
- [ ] Actionable review feedback has PR-body disposition and GitHub thread-state disposition
- [ ] Bot comments inspected
- [ ] Reviewer-response accounting includes required reviewer comment IDs when required by gate logs
- [ ] Required gates rerun or re-evaluated after fixes
- [ ] Final PR panel confirms current gate cleanliness
```

## Required commands pattern

Use the repository's current package scripts and task-specific tests. When documenting commands in the PR body, record exact commands and PASS/FAIL status.

Minimum command classes:

```bash
npm test -- <targeted-test-files>
npm run typecheck
npm test
npx prettier --check <changed-workflow-script-test-files>
git diff --check
if ls *.zip >/dev/null 2>&1; then echo "Root ZIP file present"; false; else echo "No root ZIP files present"; fi
```

For workflow validators or GitHub-state scripts, run the validator locally with explicit environment variables when safe and token scope is available. Record the exact command in the PR body.

## Stop conditions

Stop and report instead of claiming readiness when:

- source issue state cannot be verified
- allowed-file list does not match the diff
- latest head workflow state cannot be verified
- any required gate is failing on the latest head
- failed job logs have not been inspected
- actionable reviewer findings remain undispositioned
- review-thread state is unknown
- PR body still says draft/blocked while the PR is being presented as ready
- post-merge closeout checklist is being treated as complete before merge state and source issue state are verified

## Responsibility split

Cursor may create and iterate draft PRs for website/configuration work when that is the active workflow.

Codex and ChatGPT/Atlas must follow the same gate-clean procedure when they create, review, or update PRs. They must not merely report a green check summary; they must verify and document the same surfaces Cursor documented in PR #1200.
