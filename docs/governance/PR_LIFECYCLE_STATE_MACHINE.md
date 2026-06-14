---
Doc Type: Governance / Process
Audience: Human + AI Agents
Authority Level: Governance
Owns: Pull request lifecycle states, transition gates, pre-merge closeout prediction, and post-merge closeout evidence requirements
Does Not Own: Product design authority, runtime architecture, or final human merge approval
Canonical Reference: /docs/governance/PR_GOVERNANCE.md
Last Reviewed: 2026-06-14
---

# PR Lifecycle State Machine

## Purpose

This document defines the mandatory pull request lifecycle state machine for LGFC repository work.

It compresses the distributed PR rules in `Agent.md`, shared/core agent rules, the PR governance skill, and the PR template into one executable lifecycle model. Agents must use this document when opening, updating, marking ready, handing off, merging, or closing out PRs.

## Scope

This document applies to:

- all AI-agent PRs;
- all human-assisted PRs using repository governance;
- PR body completion;
- reviewer and bot disposition accounting;
- gate-readiness claims;
- post-merge source issue closeout;
- queue/dependency-map continuation decisions.

This document does not authorize scope expansion, merge approval by agents, runtime behavior changes, tracker edits, or exception handling outside the source issue.

## Current known truth

The repository has strong PR governance rules, but PR lifecycle obligations were previously spread across multiple documents. That distribution allowed agents to produce superficially complete PR bodies while missing lifecycle-critical evidence such as reviewer dispositions, source-issue closeout prediction, and post-merge queue-advancement readiness.

The lifecycle states below are mandatory. A PR may not advance to the next state unless every transition gate for the current state is satisfied or the exact blocker is documented in the PR body.

## Intended final state

Agents and CI should evaluate the same lifecycle contract before merge and after merge. Predictable post-merge closeout failures must be blocked before merge rather than remediated after merge.

---

## Lifecycle states

```text
NO PR -> DRAFT -> READY FOR REVIEW -> HUMAN MERGE DECISION -> MERGED -> CLOSEOUT VERIFIED
```

Agents must not skip states. The human/operator remains the only merge authority.

---

## State 0: NO PR

### Entry condition

A task exists, but no PR exists yet.

### Required transition to DRAFT

Before opening a PR, the agent must confirm:

- exactly one same-repository, open, non-PR source issue exists;
- the source issue is the task authority;
- file-touch allowlist is known and narrow;
- one intent label is selected;
- applicable governance, design, architecture, and skill docs have been read;
- no ZIP/root artifact risk exists;
- the PR body can be seeded from `.github/pull_request_template.md`;
- any queue/dependency-map context is known or explicitly not applicable.

### Stop condition

Stop before PR creation if the source issue is missing, closed, ambiguous, external, or a PR.

---

## State 1: DRAFT

### Entry condition

A PR exists but implementation, verification, reviewer response, or PR body evidence is incomplete.

### Required transition to READY FOR REVIEW

Before marking or claiming `READY FOR REVIEW`, the agent must confirm:

- final diff matches the file-touch allowlist exactly;
- no mixed intent or opportunistic cleanup exists;
- PR body matches final diff, source issue, label, evidence, and acceptance criteria;
- all local/task-relevant checks are run or exact blockers are recorded;
- live PR check panel and latest head workflow runs are inspected;
- all reviewer comments, bot comments, and GitHub review threads are inspected;
- every actionable reviewer item has a parser-safe disposition;
- every required thread has a state: `resolved`, `outdated`, or `unresolved-with-rationale`;
- acceptance criteria are checked, marked not applicable with rationale, or explicitly blocked;
- no `TODO`, `TBD`, placeholder, or stale evidence remains in required PR-body fields.

### Required reviewer disposition format

```text
review-comment:<id> — accepted/rejected/acknowledged/not-applicable — <specific resolution or reason> — thread state: resolved/outdated/unresolved-with-rationale
```

### Stop condition

Do not mark ready if any gate, reviewer item, bot comment, review thread, source issue accounting item, or PR body section still requires agent action.

---

## State 2: READY FOR REVIEW

### Entry condition

The implementation agent has completed its work and the PR is ready for human review.

### Required transition to HUMAN MERGE DECISION

Before asking for a human merge decision, the responsible agent must perform a pre-merge closeout prediction:

- inspect live PR check panel;
- inspect current head SHA;
- inspect current PR body;
- inspect source issue state;
- inspect reviewer and bot disposition evidence;
- inspect open review threads;
- verify exactly one accepted source issue line remains parseable;
- verify the source issue is still open unless the PR is an approved closed-source remediation exception;
- predict whether post-merge source issue closeout will pass;
- record blockers in the PR body if post-merge closeout would not pass.

### Required pre-merge closeout prediction fields

The PR body must answer:

```text
Pre-merge closeout prediction: pass / fail / blocked
Source issue state before merge: open / closed / other
Expected post-merge source issue action: auto-close / manual close / no-op / remediation follow-up
Reviewer disposition parseability: pass / fail / not-applicable
Queue continuation after closeout: continue / halt / not-applicable
```

### Stop condition

Do not request merge while the prediction is `fail` or `blocked`.

---

## State 3: HUMAN MERGE DECISION

### Entry condition

The PR is ready for a human/operator merge decision.

### Required transition to MERGED

Only the human/operator may merge. Before merging, the PR must have:

- one source issue;
- one intent label;
- current-head checks green or explicitly accepted by the human/operator;
- all actionable reviewer and bot feedback dispositioned;
- no unresolved required review threads;
- pre-merge closeout prediction recorded as `pass` or explicitly accepted by the human/operator;
- no known post-merge closeout failure that can be fixed before merge.

### Stop condition

If a predictable post-merge closeout failure exists, return the PR to DRAFT/BLOCKED instead of merging.

---

## State 4: MERGED

### Entry condition

The PR is merged into the base branch.

### Required transition to CLOSEOUT VERIFIED

After merge, the responsible agent or automation must verify:

- merged state;
- merge commit SHA;
- source issue state;
- source issue closure or required follow-up;
- post-merge validation workflow status;
- queue/dependency-map continuation status;
- remediation issue state if a remediation issue was created;
- explicitly authorized tracker/status-index follow-up, if any.

### Stop condition

If post-merge verification fails, the source issue or remediation issue must show `status:failed` or equivalent failure evidence, and queue advancement must halt until the failure is resolved.

---

## State 5: CLOSEOUT VERIFIED

### Entry condition

Post-merge closeout has passed.

### Required evidence

Closeout is verified only when:

- source issue is closed or explicitly remains open with rationale;
- post-merge validation passed or was marked not applicable with rationale;
- queue/dependency-map continuation decision is recorded;
- no unresolved remediation exception remains for the source issue;
- no required tracker/status-index follow-up remains unless delegated to a bounded issue.

### Final state

The PR lifecycle is complete. Program queue work may advance only after this state is reached or the human/operator explicitly overrides the halt with recorded rationale.

---

## Agent reporting requirements

Every agent status report about a PR must include:

```text
PR lifecycle state: NO PR / DRAFT / READY FOR REVIEW / HUMAN MERGE DECISION / MERGED / CLOSEOUT VERIFIED
Current head SHA: <sha or not-applicable>
Source issue: #<issue>
Gate status: pass / fail / pending / not-applicable
Reviewer disposition status: pass / fail / pending / not-applicable
Pre-merge closeout prediction: pass / fail / blocked / not-applicable
Queue continuation: continue / halt / not-applicable
```

Do not claim readiness, merge safety, or closeout success without repository evidence.

---

## CI alignment requirement

Pre-merge CI should enforce the `READY FOR REVIEW -> HUMAN MERGE DECISION` transition. The pre-merge gate must reject PRs that would predictably fail post-merge closeout due to missing source issue, closed source issue without approved exception, missing reviewer disposition, unresolved required review thread, stale acceptance criteria, or missing queue/dependency-map decision.

Post-merge CI should enforce the `MERGED -> CLOSEOUT VERIFIED` transition. Any post-merge failure should create or update a bounded remediation issue and halt queue advancement until resolved.

---

## Related authorities

- `Agent.md`
- `docs/ops/ai/SHARED-AGENT-RULES.md`
- `docs/ops/ai/CORE-RULES.md`
- `.agents/skills/lgfc-pr-governance/SKILL.md`
- `.github/pull_request_template.md`
- `docs/governance/PR_GOVERNANCE.md`
- `docs/reference/governance/troubleshooting-data-surface-requirements.md`
