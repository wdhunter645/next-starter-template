# LGFC Verification Closeout Skill

Use this skill before final PR handoff, closeout, post-merge readiness, or verification reporting.

## Procedure

1. Confirm the diff matches the file-touch allowlist.
2. Confirm the PR has exactly one primary source Issue.
3. Confirm no ZIP files, secrets, environment files, build output, or temporary artifacts are committed.
4. Run the required checks for the changed file types.
5. Record exact command results in the PR body or PR comment.
6. State unresolved risks plainly.
7. Do not mark work complete if checks failed.
8. Do not claim browser, production, or visual verification unless it was actually performed.

## Required evidence

The handoff must include:

- Changed file list.
- Verification commands run.
- Pass/fail result for each command.
- Known limitations or unverified items.
- Rollback path when applicable.

## Stop conditions

Stop and request correction when:

- The diff contains unapproved files.
- Verification was not run and no valid reason is documented.
- A check fails.
- The PR body is missing required governance sections.
- The task cannot be verified from available evidence.
