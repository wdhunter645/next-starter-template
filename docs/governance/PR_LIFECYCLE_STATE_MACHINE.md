---
Doc Type: Governance / Process
Audience: Human + AI Agents
Authority Level: Supporting Governance
Owns: Conceptual pull-request lifecycle states and their mapping to GitHub-native evidence
Does Not Own: Canonical PR body fields, CI implementation, product design authority, runtime architecture, or final merge approval
Canonical Reference: /docs/governance/PR_PROCESS.md
Related Issues: #1719, #2562
Last Reviewed: 2026-07-17
---

# PR Lifecycle State Machine

## Purpose

Describe the LGFC pull-request lifecycle without turning the PR body into a lifecycle database.

The canonical pull-request policy is `docs/governance/PR_PROCESS.md`. The current PR template defines stable PR-body facts. Dynamic state belongs to GitHub-native reviews, review threads, labels, checks, comments, merge state, and post-merge closeout records.

## Scope

This document provides conceptual lifecycle guidance for:

- opening and preparing a PR;
- moving a PR from draft to review;
- assessing merge readiness;
- recording the human merge decision;
- verifying merge and post-merge closeout;
- deciding whether a program or project queue may continue.

It does not add PR-body sections, require dynamic state ledgers, authorize scope expansion, grant merge authority, or replace the canonical process and template.

## Current known truth

- `docs/governance/PR_PROCESS.md` is canonical for pull-request policy.
- `.github/pull_request_template.md` stores stable facts known at PR-open or implementation-complete time.
- Review state is read from GitHub reviews and review threads.
- Gate state is read from GitHub checks and workflow runs.
- Merge state is read from the PR and merge commit.
- Post-merge state is read from closeout records and source-issue state.
- Dynamic comment IDs, thread ledgers, CI ledgers, merge-readiness fields, and post-merge state blocks must not be required in the PR body.

## Intended final state

Agents, reviewers, and automation evaluate the same lifecycle using authoritative GitHub-native evidence. The PR body remains concise and stable, while dynamic review, gate, merge, and closeout state remains on the surfaces that own it.

## Authority and evidence surfaces

| Surface | Owns |
| --- | --- |
| Source issue | Task authority, scope, acceptance criteria, allowlist, and explicit exceptions |
| PR body | Stable implementation facts required by the current template |
| GitHub reviews and review threads | Reviewer decisions, actionable findings, replies, and resolution state |
| GitHub checks and workflow runs | Current validation and gate state for the PR head |
| Labels | Routing or derived operator-visibility state; not durable evidence by themselves |
| Issue and PR comments | Handoffs, decisions, status summaries, and bounded rationale |
| PR merge state and commit | Whether integration occurred and the exact merge SHA |
| Post-merge closeout records | Source-issue disposition, validation result, remediation, and queue continuation |

When surfaces disagree, follow the operational truth hierarchy in `docs/ops/ai/CORE-RULES.md` and the canonical process in `docs/governance/PR_PROCESS.md`.

## Lifecycle states

```text
NO PR -> DRAFT -> READY FOR REVIEW -> READY FOR MERGE
      -> HUMAN MERGE DECISION -> MERGED -> CLOSEOUT VERIFIED
```

These are conceptual operating states. They are not mandatory PR-body fields. A status report or handoff may name the current state, but the state must be derived from live repository evidence.

## State 0: NO PR

### Entry condition

A valid source issue exists and no PR has been opened.

### Transition to DRAFT

Confirm:

- exactly one open same-repository source issue owns the work;
- task scope and changed-file allowlist are clear;
- one intent label and the applicable delivery profile are known;
- required authority and design documents have been read;
- the working branch and PR base are authorized;
- the PR can be seeded from the current template.

Stop before PR creation when source authority, scope, branch, runtime, or allowlist is missing or contradictory.

## State 1: DRAFT

### Entry condition

A PR exists, but implementation, stable PR-body facts, verification, or self-review is incomplete.

### Transition to READY FOR REVIEW

Confirm:

- the final diff matches the issue allowlist;
- no unrelated intent or opportunistic cleanup is present;
- the PR body contains the stable facts required by the current template;
- task-relevant local validation has run or an exact blocker is recorded;
- acceptance criteria are complete, not applicable with rationale, or explicitly blocked;
- no template placeholders or stale implementation claims remain.

Dynamic review-thread state, check results, comment IDs, and merge-readiness state are not copied into the PR body.

## State 2: READY FOR REVIEW

### Entry condition

Implementation and the stable PR body are complete enough for independent review.

### Review and remediation

Reviewers and agents must:

- inspect the current PR head and file scope;
- use GitHub reviews and review threads for findings and resolution;
- use current checks and workflow runs for validation state;
- correct valid findings within scope;
- reject or mark findings not applicable with specific rationale on the owning review surface;
- keep the source issue and PR body aligned with the final implementation facts.

Do not maintain a review-comment ID ledger or thread-state ledger in the PR body.

### Transition to READY FOR MERGE

`READY FOR MERGE` is a derived assessment, not a PR-body field. It requires:

- all required checks green on the current head;
- source-issue accounting valid;
- all blocking human review findings resolved or superseded;
- all review threads inspected and dispositioned on GitHub-native surfaces;
- no known technical, security, data, scope, or production-safety defect;
- the PR mergeable against its authorized base;
- pre-merge closeout assessment completed on an issue comment, PR comment, check summary, or other authorized operational record.

Advisory bot findings do not block unless canonical policy or a required gate promotes them to blocking status.

## State 3: READY FOR MERGE

### Entry condition

Live repository evidence shows that the PR is technically and procedurally ready for an authorized merge decision.

### Pre-merge closeout assessment

The responsible reviewer or controller verifies:

- current head SHA and mergeability;
- required checks and workflow state;
- source issue state and scope authority;
- review and thread disposition;
- expected source-issue action after merge;
- expected post-merge validation behavior;
- project/program queue continuation or halt.

The assessment is dynamic operational evidence. Record it in a GitHub-native comment, check summary, or closeout-control record, not as a mandatory PR-body state block.

Stop when the assessment identifies a predictable post-merge failure that can be corrected before merge.

## State 4: HUMAN MERGE DECISION

### Entry condition

The PR is ready for the merge authority defined by `docs/governance/PR_PROCESS.md`, the delivery profile, and branch protection.

Before merge, verify:

- the source issue and stable PR body remain valid;
- the current head still has the required checks;
- no new blocking review or thread has appeared;
- no new conflict or unsafe production condition exists;
- the target branch and approval profile are correct.

Cursor and other builders do not self-approve or self-merge. Promotion to `main` remains Bill/ChatGPT controlled.

## State 5: MERGED

### Entry condition

GitHub reports the PR merged and provides a merge commit SHA.

### Transition to CLOSEOUT VERIFIED

Verify from live evidence:

- merged state, target branch, and merge SHA;
- post-merge validation result;
- source-issue disposition;
- required remediation issue or exception state;
- project/program queue continuation or halt;
- any explicitly authorized status-index follow-up.

A green pre-merge check or mergeable PR is not merge evidence.

## State 6: CLOSEOUT VERIFIED

### Entry condition

Post-merge closeout passed, or an explicitly authorized exception records why normal closeout is not applicable.

Closeout is verified when:

- the source issue is closed or intentionally retained open with rationale;
- post-merge validation passed or has an accepted not-applicable disposition;
- no unresolved remediation exception remains;
- queue continuation is recorded;
- no required bounded follow-up is silently omitted.

Only then may dependent work advance, unless an authorized operator records an explicit override.

## Agent status reporting

A status report or handoff may summarize:

```text
PR lifecycle state: <state>
Current head SHA: <sha or not-applicable>
Source issue: #<issue>
Required checks: pass | fail | pending | not-applicable
Review disposition: pass | fail | pending | not-applicable
Closeout assessment: pass | fail | blocked | not-applicable
Queue continuation: continue | halt | not-applicable
```

This summary belongs in the current handoff, issue comment, PR comment, or operational report. It is not a required persistent section of the PR body.

## CI alignment

Pre-merge automation should evaluate stable PR-body facts together with GitHub-native issue, review, thread, check, and branch state. It must not require the PR body to duplicate dynamic lifecycle state.

Post-merge automation should evaluate merge state, source-issue authority, closeout evidence, remediation state, and queue continuation. It should remain idempotent and create bounded remediation only for genuine unresolved failures.

## Related authorities

- `Agent.md`
- `docs/governance/PR_PROCESS.md`
- `.github/pull_request_template.md`
- `docs/governance/PR_GOVERNANCE.md`
- `docs/ops/ai/CORE-RULES.md`
- `.agents/skills/lgfc-pr-governance/SKILL.md`
- `docs/reference/governance/troubleshooting-data-surface-requirements.md`
