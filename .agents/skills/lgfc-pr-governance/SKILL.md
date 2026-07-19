# LGFC PR Governance Skill

Use this skill for PR creation, PR updates, source Issue linkage, scope control, labels, file allowlists, acceptance criteria, PR lifecycle state transitions, administrative-state synchronization, pre-merge closeout prediction, and post-merge closeout evidence.

## Documentation chain (required before PR work)

Before any PR, issue, review, remediation, administrative reconciliation, or implementation work, complete the mandatory chain in [`Agent.md`](../../../Agent.md):

`/Agent.md` → `/docs/ops/ai/SHARED-AGENT-RULES.md` → `/docs/ops/ai/CORE-RULES.md` → applicable agent-specific rules under `/docs/ops/ai/` → `/.agents/skills/lgfc-pr-governance/SKILL.md` and `/.github/pull_request_template.md` → `/docs/governance/PR_LIFECYCLE_STATE_MACHINE.md` → other applicable governance docs under `/docs/governance/`.

For issue/PR metadata correction, final clarification, PMO/reporting reconciliation, queue housekeeping, non-merge disposition, or closeout exceptions, also read:

- `/docs/governance/OPERATIONS-AND-RECOVERY.md`
- `/docs/reference/operations/administrative-control-lane-contract.md`
- `/docs/ops/pmo/queue-watch-and-dispatch-protocol.md`
- `/docs/ops/pmo/github-issue-closeout-protocol.md`

Do not open, update, mark ready, request merge, administratively mutate, or claim closeout for a PR until this skill, the PR template, the PR lifecycle state machine, and any applicable administrative-control authority have been read for the current task.

## Required inputs

- One open primary source Issue.
- A clear task scope.
- Exact files expected to change.
- The intended PR label.
- Current PR lifecycle state when updating an existing PR.
- Exact administrative authority and evidence when changing Issue or PR state, labels, assignment, routing, reporting, queue, or closeout metadata.

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
10. For every administrative mutation, identify the authoritative fact, re-read current state immediately before mutation, suppress duplicate or stale action, apply only the allowed administrative change, and verify afterward.
11. Do not use administrative authority to change objectives, acceptance criteria, file allowlists, technical design, delivery model, validation, approval, priority, dependencies, or successor order.
12. Do not create synthetic tracker issues to compensate for PR-first work.
13. Do not change runtime behavior in docs-only or ops-only PRs.
14. Include exact verification commands and results in the handoff.

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
- Administrative-state prediction: aligned, bounded exception, pending, or not applicable.
- Queue / dependency-map status for launched-program queue tasks:
  dependency-map result, next queue item, and continue/halt decision (or
  `not-applicable` with rationale for one-off tasks).

## Administrative-control rule

The administrative control lane may reconcile repository state to existing authority. It must not create new execution authority.

Successful post-merge closeout CI is the primary merge-triggered administrative actor. A later agent must not duplicate a successful closeout transaction. The administrative lane handles failed, partial, missing, contradictory, non-merge, or later-discovered housekeeping exceptions.

Administrative reporting is non-blocking unless a required source-Issue, authority, dependency, validation, review, approval, closeout, collision, production, or safety invariant is missing, contradictory, or failed.

## Stop conditions

Stop and request correction when:

- No primary source Issue exists.
- More than one primary source Issue is present.
- The requested diff spans unrelated intents.
- The task conflicts with canonical design documentation.
- The file allowlist does not match the intended diff.
- The PR lifecycle state is unclear.
- Administrative authority or evidence is ambiguous.
- A requested administrative action would change project objectives, technical scope, acceptance criteria, delivery model, validation, approval, priority, dependency, or successor authority.
- The PR would predictably fail post-merge closeout and the failure can be corrected before merge.
- An agent claims `READY FOR MERGE` while reviewer-response accounting, source issue accounting, required governance gates, or administrative closeout prediction remain incomplete.
- An agent treats `READY FOR REVIEW` as merge-ready or equivalent to `READY FOR MERGE`.
