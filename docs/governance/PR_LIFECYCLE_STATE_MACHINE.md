---
Doc Type: Governance / Process
Audience: Human + AI Agents
Authority Level: Governance
Owns: Pull request lifecycle states, transition gates, GitHub-native lifecycle evidence, administrative-state synchronization, and post-merge closeout evidence requirements
Does Not Own: Canonical PR-body policy, product design authority, runtime architecture, administrative mutation taxonomy, or final human merge approval
Canonical Reference: /docs/governance/PR_PROCESS.md
Related Issues: #2641
Last Reviewed: 2026-07-19
---

# PR Lifecycle State Machine

## Purpose

Define the mandatory GitHub-native pull request lifecycle for LGFC repository work.

This document explains state transitions and evidence surfaces. Canonical PR-body authority remains `docs/governance/PR_PROCESS.md`: the PR body stores stable facts only and must not become a lifecycle, review, check, queue, approval, administrative-exception, or post-merge closeout database.

## Lifecycle

```text
NO PR -> DRAFT -> READY FOR REVIEW -> READY FOR MERGE -> HUMAN MERGE DECISION -> MERGED -> CLOSEOUT VERIFIED
```

The states are logical process states. Their evidence comes from GitHub-native surfaces, not duplicated PR-body fields.

| Logical state | Authoritative evidence |
| --- | --- |
| `NO PR` | No open PR exists for the source Issue and branch |
| `DRAFT` | GitHub PR is open and draft, or required implementation evidence is incomplete |
| `READY FOR REVIEW` | GitHub PR is open and not draft; implementation handoff is recorded; reviewer inspection may begin |
| `READY FOR MERGE` | Required checks, source-Issue accounting, review disposition, thread state, and protected-boundary requirements are satisfied |
| `HUMAN MERGE DECISION` | A human approver is evaluating or has recorded the merge decision |
| `MERGED` | GitHub records the PR as merged with a merge commit |
| `CLOSEOUT VERIFIED` | Single-owner closeout records source-Issue, validation, terminal labels, parent/reporting, successor, and exception disposition |

Labels and comments may provide routing and visibility, but they do not replace the authoritative GitHub state above.

## Scope

This lifecycle applies to:

- all AI-agent and human-assisted PRs using repository governance;
- implementation completion and review handoff;
- validation and reviewer evidence;
- human merge authorization;
- source-Issue and administrative-state synchronization;
- post-merge closeout and successor disposition.

It does not authorize scope expansion, self-approval, automatic `main` merge, dynamic PR-body lifecycle ledgers, or administrative mutation outside existing authority.

## Minimal-gate principle

Each transition should enforce only the smallest necessary set of material invariants.

Required gates protect:

- valid source-Issue authority;
- exact scope and branch boundary;
- required validation results;
- independent review and approval where required;
- protected-change or production boundaries;
- predictable post-merge closeout integrity.

The following do not become independent PR gates unless canonical policy explicitly promotes them:

- dashboard freshness;
- optional PMO or audit comments;
- cosmetic label order;
- duplicate lifecycle fields in the PR body;
- administrative summaries derivable from live GitHub state;
- presence of a particular chat session, watcher session, or dispatcher instance.

Correct clerical defects at the earliest deterministic surface. Stop for material ambiguity rather than adding redundant paperwork.

## Administrative synchronization

The administrative control lane follows each transition and may reconcile deterministic non-code state to existing authority:

- Issue and PR lifecycle labels;
- routing, handoff, and assignment state;
- parent/child and predecessor/successor links;
- PMO, project, program, dashboard, and reporting state;
- closeout and exception records.

Administrative reconciliation must not:

- advance a technical state without implementation, validation, review, approval, merge, or closeout evidence;
- change objectives, acceptance criteria, file allowlists, technical design, delivery model, validation, approval, priority, dependencies, or successor authority;
- turn optional reporting lag into an execution or merge block;
- serialize independent approved lanes.

The stable contract is `docs/reference/operations/administrative-control-lane-contract.md`.

## State 0: NO PR

### Entry

A valid task exists and no PR exists.

### Transition to DRAFT

Before opening a PR, confirm:

- exactly one same-repository, open, non-PR source Issue;
- source-Issue scope and allowlist are clear;
- one intent label and PR class are selected;
- delivery profile is known when applicable;
- applicable authority and skills are read;
- branch and target boundary are correct;
- the PR template can be completed with stable facts.

### Stop

Stop if source authority, scope, branch, delivery profile, or target is missing or ambiguous.

## State 1: DRAFT

### Entry

A PR exists but implementation, stable PR facts, validation, or handoff evidence is incomplete.

### Transition to READY FOR REVIEW

Confirm:

- final diff remains inside the source-Issue allowlist;
- no mixed intent or unrelated cleanup exists;
- the PR body stable facts match the current diff;
- task-relevant checks have been run or exact blockers are recorded;
- acceptance criteria are complete, explicitly not applicable, or blocked;
- Cursor or the implementation owner records a review-ready handoff.

GitHub draft state should then be removed. Do not add a `READY FOR REVIEW` ledger to the PR body.

### Stop

Remain draft when implementation, validation, stable PR facts, or handoff evidence still requires builder action.

## State 2: READY FOR REVIEW

### Entry

The PR is open and not draft, and the implementation owner has handed it off for independent inspection.

### Transition to READY FOR MERGE

Confirm from live GitHub state:

- required checks are green;
- source-Issue accounting is valid;
- all human and required bot findings are dispositioned;
- required review threads are resolved or explicitly accepted by the authorized reviewer;
- protected-change review is complete when applicable;
- no predictable closeout defect remains that can be fixed before merge;
- the independent reviewer records approval or an equivalent repository-authorized disposition.

`READY FOR REVIEW` does not imply `READY FOR MERGE`.

### Stop

Remain in review when a required check, source-Issue defect, actionable finding, thread, protected boundary, or predictable closeout defect remains.

## State 3: READY FOR MERGE

### Entry

All required technical and governance evidence is complete, and the PR is waiting for human merge authorization.

### Transition to HUMAN MERGE DECISION

The reviewer rechecks:

- current PR head SHA;
- current required checks;
- current review and thread state;
- source-Issue state and authority;
- target branch and protected boundaries;
- closeout readiness and expected successor handling.

This prediction is recorded through GitHub-native review, Issue, label, or closeout-preparation surfaces—not as a dynamic PR-body ledger.

### Stop

Return to draft or review when a required invariant regresses.

## State 4: HUMAN MERGE DECISION

### Entry

The PR is technically and administratively ready for the authorized human decision.

### Transition to MERGED

Only an authorized human may merge. Before merge, verify:

- exactly one source Issue;
- current required checks green or explicitly accepted under recorded authority;
- independent approval complete;
- no unresolved blocking review thread;
- no known predictable closeout failure that can be corrected before merge;
- production or protected-boundary approval complete when required.

### Stop

Do not merge around a correctable source-Issue, validation, review, approval, authority, protected-boundary, or closeout defect.

## State 5: MERGED

### Entry

GitHub records the PR as merged.

### Transition to CLOSEOUT VERIFIED

Successful post-merge closeout CI is the primary merge-triggered administrative actor where configured for the PR base. It should atomically:

1. verify the merged PR and merge commit;
2. verify post-merge validation and accepted exceptions;
3. reconcile the source Issue and terminal labels;
4. reconcile actively governed parent/project/program and reporting state;
5. activate, defer, or halt the declared successor;
6. create or update one bounded exception only when required;
7. verify the final state.

### Current non-`main` implementation boundary

The current `.github/workflows/post-merge-closeout.yml` runs only for merged PRs whose base is `main`.

For Model B child PRs and other authorized non-`main` integrations, the administrative control lane must execute or verify the equivalent closeout until deterministic CI coverage is expanded. A non-`main` merge is not `CLOSEOUT VERIFIED` until source-Issue state, terminal labels, parent/project reporting, successor disposition, and exception state are reconciled.

The manual or scheduled administrative path must remain idempotent, avoid duplication if later automation runs, and must not block independent approved lanes.

The broader administrative lane also handles failed, partial, missing, contradictory, non-merge, or later-discovered housekeeping. It must not duplicate a successful closeout transaction.

### Stop

A failed required invariant halts only the affected closeout or queue transition unless a shared dependency requires a broader halt. Independent approved lanes continue.

## State 6: CLOSEOUT VERIFIED

### Entry

The single-owner closeout transaction has completed and been verified.

Required evidence includes:

- merged state and merge commit;
- source Issue closed or explicitly preserved open;
- terminal labels reconciled;
- validation passed, accepted, or not applicable under authority;
- parent/project/program reporting reconciled when actively governed;
- successor or halt disposition recorded;
- remediation and administrative exceptions resolved or explicitly bounded.

The lifecycle is complete. Later deterministic drift may be corrected administratively without reopening technical scope or duplicating closeout.

## Non-merge dispositions

Canceled, duplicate, superseded, not-planned, and administrative-only work may bypass `MERGED` only when explicit authority establishes the disposition.

The administrative lane must reconcile:

- source-Issue state and reason;
- terminal or disposition labels;
- parent and reporting state;
- dependency and successor impact;
- clarification and exception records.

Non-merge disposition must not bypass required implementation, validation, review, approval, promotion, or production boundaries.

## Reporting requirements

Agent reports should summarize current live evidence, not write it into the PR body as process authority.

A useful report includes:

```text
PR lifecycle state: <state>
Current head SHA: <sha or not-applicable>
Source issue: #<issue>
Required checks: pass / fail / pending / not-applicable
Independent review: pass / fail / pending / not-applicable
Administrative state: aligned / bounded exception / pending / not-applicable
Queue continuation: continue / halt / not-applicable
Evidence surfaces: <GitHub checks, reviews, Issue, closeout record>
```

## CI alignment

Pre-merge CI should enforce deterministic material invariants and avoid duplicating GitHub-native state in PR-body fields.

Post-merge CI should enforce the `MERGED -> CLOSEOUT VERIFIED` transition as the single primary closeout owner for every supported integration base. Until coverage is complete, the administrative lane supplies the equivalent evidence-backed transaction for unsupported bases.

A failure creates or updates one bounded exception and avoids repeated self-healing mutation loops.

A deterministic clerical defect may be repaired when exactly one authoritative result exists. Material ambiguity, objective changes, scope conflicts, unmet acceptance criteria, unresolved required review findings, or missing approval stop for the owning authority.

## Related authorities

- `docs/governance/PR_PROCESS.md`
- `docs/governance/OPERATIONS-AND-RECOVERY.md`
- `docs/reference/operations/administrative-control-lane-contract.md`
- `docs/ops/pmo/queue-watch-and-dispatch-protocol.md`
- `docs/ops/pmo/github-issue-closeout-protocol.md`
- `.agents/skills/lgfc-pr-governance/SKILL.md`
- `.github/pull_request_template.md`
