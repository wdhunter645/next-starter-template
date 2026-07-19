# LGFC PR Governance Skill

Use this skill for PR creation, PR updates, source Issue linkage, scope control, labels, file allowlists, acceptance criteria, GitHub-native lifecycle transitions, administrative-state synchronization, closeout preparation, and post-merge closeout evidence.

## Documentation chain (required before PR work)

Before any PR, issue, review, remediation, administrative reconciliation, or implementation work, complete the mandatory chain in [`Agent.md`](../../../Agent.md):

`/Agent.md` → `/docs/ops/ai/SHARED-AGENT-RULES.md` → `/docs/ops/ai/CORE-RULES.md` → applicable agent-specific rules under `/docs/ops/ai/` → `/.agents/skills/lgfc-pr-governance/SKILL.md` and `/.github/pull_request_template.md` → `/docs/governance/PR_PROCESS.md` → `/docs/governance/PR_LIFECYCLE_STATE_MACHINE.md` → other applicable governance docs under `/docs/governance/`.

For Issue/PR metadata correction, final clarification, PMO/reporting reconciliation, queue housekeeping, non-merge disposition, or closeout exceptions, also read:

- `/docs/governance/OPERATIONS-AND-RECOVERY.md`
- `/docs/reference/operations/administrative-control-lane-contract.md`
- `/docs/ops/pmo/queue-watch-and-dispatch-protocol.md`
- `/docs/ops/pmo/github-issue-closeout-protocol.md`

Do not open, update, mark ready, request merge, administratively mutate, or claim closeout for a PR until the applicable authority has been read for the current task.

## Required inputs

- One open primary source Issue.
- A clear task scope.
- Exact files expected to change.
- The intended PR label and PR class.
- Delivery-profile facts when applicable.
- Current GitHub PR, check, review, and Issue state when updating an existing PR.
- Exact administrative authority and evidence when changing Issue or PR state, labels, assignment, routing, reporting, queue, or closeout metadata.

## Core PR-body rule

Canonical `docs/governance/PR_PROCESS.md` controls the PR body.

The PR body stores stable facts only. It must not become a database for:

- draft/review/merge lifecycle state;
- live CI status;
- review comment IDs or thread state;
- approval state;
- queue or successor state;
- administrative exceptions;
- post-merge closeout state.

Dynamic state belongs in GitHub-native PR state, checks, reviews, threads, Issues, labels, assignments, comments, and closeout records.

## Procedure

1. Confirm the PR has exactly one primary source Issue line in the body:
   - `- **Issue:** #123`
2. Treat umbrella, parent, program, and ops tracker links as context only unless explicitly identified as the primary source Issue.
3. Define the file-touch allowlist before implementation starts.
4. Reject mixed-intent work. Split unrelated changes into separate PRs.
5. Keep stable PR-body facts aligned with `.github/pull_request_template.md` and the final diff.
6. Use one intent label only.
7. Apply `/docs/governance/PR_LIFECYCLE_STATE_MACHINE.md` using GitHub-native evidence:
   - `NO PR -> DRAFT`
   - `DRAFT -> READY FOR REVIEW`
   - `READY FOR REVIEW -> READY FOR MERGE`
   - `READY FOR MERGE -> HUMAN MERGE DECISION`
   - `HUMAN MERGE DECISION -> MERGED`
   - `MERGED -> CLOSEOUT VERIFIED`
8. Treat `READY FOR REVIEW` and `READY FOR MERGE` as distinct logical states. Review-ready does not equal merge-ready.
9. Do not claim merge readiness until required checks, source-Issue accounting, independent review, review-thread disposition, protected-boundary requirements, and predictable closeout integrity are complete.
10. Record lifecycle, review, validation, approval, queue, and closeout evidence on their owning GitHub surfaces—not as dynamic PR-body fields.
11. For every administrative mutation, identify the authoritative fact, re-read current state immediately before mutation, suppress duplicate or stale action, apply only the allowed administrative change, and verify afterward.
12. Do not use administrative authority to change objectives, acceptance criteria, file allowlists, technical design, delivery model, validation, approval, priority, dependencies, or successor order.
13. Do not create synthetic tracker Issues or dynamic PR-body ledgers to compensate for missing process state.
14. Do not change runtime behavior in docs-only or ops-only PRs.
15. Include exact verification commands and results in the handoff or PR summary when stable and already run.

## Required stable PR body facts

The PR body should include the stable facts defined by the current template and canonical PR policy:

- Primary Issue line.
- Intent label.
- PR class.
- Delivery-profile facts when applicable.
- File-touch allowlist.
- Out-of-scope declaration.
- Change summary.
- Verification summary for commands already run.
- Acceptance criteria.
- Follow-up Issue declaration.
- Reviewer/bot review attestation.

Do not require PR lifecycle state, live check status, reviewer disposition ledgers, queue state, administrative exception state, or post-merge closeout prediction as PR-body fields.

## Administrative-control rule

The administrative control lane may reconcile repository state to existing authority. It must not create new execution authority.

Successful post-merge closeout CI is the primary merge-triggered administrative actor. A later agent must not duplicate a successful closeout transaction. The administrative lane handles failed, partial, missing, contradictory, non-merge, or later-discovered housekeeping exceptions.

Administrative reporting is non-blocking unless a required source-Issue, authority, dependency, validation, review, approval, closeout, collision, production, or safety invariant is missing, contradictory, or failed.

## Minimal-gate rule

Do not introduce a gate merely to duplicate information available from GitHub-native state.

Required gates must protect a material invariant such as:

- source-Issue authority;
- scope or branch boundary;
- required validation;
- independent review or approval;
- protected-change or production boundary;
- predictable post-merge closeout integrity.

Dashboard freshness, optional PMO comments, cosmetic label order, dynamic PR-body lifecycle fields, and session presence are not independent PR gates.

## Stop conditions

Stop and request correction when:

- No primary source Issue exists.
- More than one primary source Issue is present.
- The requested diff spans unrelated intents.
- The task conflicts with canonical design or governance documentation.
- The file allowlist does not match the intended diff.
- The current GitHub lifecycle state is unclear.
- Administrative authority or evidence is ambiguous.
- A requested administrative action would change project objectives, technical scope, acceptance criteria, delivery model, validation, approval, priority, dependency, or successor authority.
- The PR would predictably fail post-merge closeout and the failure can be corrected before merge.
- An agent claims merge readiness while required checks, source-Issue accounting, independent review, required review threads, protected boundaries, or closeout integrity remain incomplete.
- An agent treats `READY FOR REVIEW` as merge-ready.
- Any document requires dynamic lifecycle or closeout state to be written into the PR body contrary to canonical `PR_PROCESS.md`.
