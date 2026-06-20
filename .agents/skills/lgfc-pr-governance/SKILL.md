# LGFC PR Governance Skill

Use this skill for PR creation, PR updates, source Issue linkage, scope control, labels, file allowlists, acceptance criteria, PR lifecycle state transitions, pre-merge closeout prediction, and post-merge closeout evidence.

## Documentation chain (required before PR work)

Before any PR, issue, review, remediation, or implementation work, complete the mandatory chain in [`Agent.md`](../../../Agent.md):

`/Agent.md` → `/docs/ops/ai/SHARED-AGENT-RULES.md` → `/docs/ops/ai/CORE-RULES.md` → applicable agent-specific rules under `/docs/ops/ai/` → `/.agents/skills/lgfc-pr-governance/SKILL.md` and `/.github/pull_request_template.md` → `/docs/governance/PR_LIFECYCLE_STATE_MACHINE.md` → other applicable governance docs under `/docs/governance/`.

Do not open, update, mark ready, request merge, or claim closeout for a PR until this skill, the PR template, and the PR lifecycle state machine have been read for the current task.

## Required inputs

- One open primary source Issue.
- A clear task scope.
- Exact files expected to change.
- The intended PR label.
- Current PR lifecycle state when updating an existing PR.

## Procedure

1. Confirm the PR has exactly one primary source Issue line in the body:
   - `- **Issue:** #123`
2. Treat umbrella or ops tracker links as context only. They are not task authority.
3. Define the file-touch allowlist before implementation starts.
4. Reject mixed-intent work. Split unrelated changes into separate PRs.
5. Keep the PR body aligned with `.github/pull_request_template.md`.
6. Use one intent label only.
7. Apply `/docs/governance/PR_LIFECYCLE_STATE_MACHINE.md` for every transition:
   - `NO PR -> DRAFT`
   - `DRAFT -> READY FOR REVIEW`
   - `READY FOR REVIEW -> READY FOR MERGE`
   - `READY FOR MERGE -> HUMAN MERGE DECISION`
   - `HUMAN MERGE DECISION -> MERGED`
   - `MERGED -> CLOSEOUT VERIFIED`
8. Treat `READY FOR REVIEW` and `READY FOR MERGE` as distinct states. Review-ready does not equal merge-ready.
9. Do not claim `READY FOR MERGE` until all required governance checks, reviewer-response accounting, source issue accounting, and pre-merge closeout prediction are complete.
10. Do not create synthetic tracker Issues to compensate for PR-first work.
11. Do not change runtime behavior in docs-only or ops-only PRs.
12. Include exact verification commands and results in the handoff.

## Required PR body fields

The PR body must include:

- Primary Issue line.
- Documentation source classification.
- Design source of truth.
- File-touch allowlist.
- Change summary.
- Build/test/verification evidence.
- Acceptance criteria.
- Required pre-review self-check.
- PR lifecycle state.
- Pre-merge closeout prediction before human merge decision.
- Explicit `READY FOR REVIEW` vs `READY FOR MERGE` status when reporting PR readiness.
- Queue / dependency-map status for launched-program queue tasks:
  dependency-map result, next queue item, and continue/halt decision (or
  `not-applicable` with rationale for one-off tasks).

## Stop conditions

Stop and request correction when:

- No primary source Issue exists.
- More than one primary source Issue is present.
- The requested diff spans unrelated intents.
- The task conflicts with canonical design documentation.
- The file allowlist does not match the intended diff.
- The PR lifecycle state is unclear.
- The PR would predictably fail post-merge closeout and the failure can be corrected before merge.
- An agent claims `READY FOR MERGE` while reviewer-response accounting, source issue accounting, or required governance gates remain incomplete.
- An agent treats `READY FOR REVIEW` as merge-ready or equivalent to `READY FOR MERGE`.
