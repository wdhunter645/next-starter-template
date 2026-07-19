---
Doc Type: Governance / Process
Audience: Human + AI Agents
Authority Level: Governance
Owns: Pull request lifecycle states, transition gates, pre-merge closeout prediction, administrative-state synchronization, and post-merge closeout evidence requirements
Does Not Own: Product design authority, runtime architecture, administrative mutation taxonomy, or final human merge approval
Canonical Reference: /docs/governance/PR_GOVERNANCE.md
Related Issues: #2641
Last Reviewed: 2026-07-19
---

# PR Lifecycle State Machine

## Purpose

This document defines the mandatory pull request lifecycle state machine for LGFC repository work.

It compresses the distributed PR rules in `Agent.md`, shared/core agent rules, the PR governance skill, the administrative control lane contract, and the PR template into one executable lifecycle model. Agents must use this document when opening, updating, marking ready, handing off, merging, administratively reconciling, or closing out PRs.

PMO **program** lifecycle status nomenclature is defined by PMO authority. Do not conflate PR lifecycle states with PMO program lifecycle reporting terms.

## Scope

This document applies to:

- all AI-agent PRs;
- all human-assisted PRs using repository governance;
- PR body completion;
- reviewer and bot disposition accounting;
- gate-readiness claims;
- administrative status and reporting synchronization;
- post-merge source issue closeout;
- queue/dependency-map continuation decisions.

This document does not authorize scope expansion, merge approval by agents, runtime behavior changes, tracker edits, or exception handling outside the source issue and administrative control contract.

## Current known truth

The repository has strong PR governance rules, but PR lifecycle obligations were previously spread across multiple documents. That distribution allowed agents to produce superficially complete PR bodies while missing lifecycle-critical evidence such as reviewer dispositions, source-issue closeout prediction, administrative state synchronization, and post-merge queue-advancement readiness.

The lifecycle states below are mandatory. A PR may not advance to the next state unless every transition gate for the current state is satisfied or the exact blocker is documented in the PR body.

## Intended final state

Agents, CI, review, and the administrative control lane should evaluate the same lifecycle contract before merge and after merge. Predictable post-merge closeout failures must be blocked before merge rather than remediated after merge.

Administrative reporting follows lifecycle state and may correct deterministic metadata, but it must not create new execution authority or turn optional reporting lag into a merge or execution gate.

---

## Lifecycle states

```text
NO PR -> DRAFT -> READY FOR REVIEW -> READY FOR MERGE -> HUMAN MERGE DECISION -> MERGED -> CLOSEOUT VERIFIED
```

Agents must not skip states. The human/operator remains the only merge authority.

`READY FOR REVIEW` means the PR is ready for reviewer/human inspection. It does not authorize merge and must not be treated as merge-ready.

`READY FOR MERGE` is the required agent handoff target for final pre-merge authorization. It means all required checks, reviewer-response accounting, source issue accounting, and governance gates are satisfied and the PR is ready for final merge authorization. It does not authorize the agent to merge.

The administrative control lane may mirror and reconcile these states on Issues, PRs, PMO, parents, dashboards, and exception records when the correct value is mechanically provable. It may not advance a technical lifecycle state without the required implementation, validation, review, or approval evidence.

---

## Administrative synchronization rule

At every lifecycle transition, the administrative control lane may:

- reconcile Issue and PR lifecycle labels;
- reconcile routing, handoff, and assignment state;
- update actively governed parent/project/program and reporting state;
- record blockers, clarification, exception, and queue-continuation evidence;
- remove stale or contradictory administrative state.

It must not:

- change project objectives, acceptance criteria, file allowlists, design, delivery model, validation, review, approval, or priority;
- claim implementation pickup, validation success, approval, merge, or closeout without evidence;
- block a transition solely because optional reporting or dashboard state lags;
- serialize independent approved lanes.

The stable administrative contract is `docs/reference/operations/administrative-control-lane-contract.md`.

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

The administrative lane may reconcile source-Issue labels, assignment, PMO/reporting state, and routing metadata before PR creation, but it may not invent missing task authority or scope.

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
- acceptance criteria are checked, marked not applicable with rationale, or explicitly blocked;
- no `TODO`, `TBD`, placeholder, or stale evidence remains in required PR-body fields.

The administrative lane may mirror draft status and correct source-Issue/PR linkage, assignment, routing, and reporting metadata. It must not mark the PR review-ready on behalf of incomplete implementation evidence.

### Stop condition

Do not mark review-ready if implementation, PR body evidence, or required inspection still requires agent action.

---

## State 2: READY FOR REVIEW

### Entry condition

The implementation agent has completed its work and the PR is ready for reviewer/human inspection.

### Required transition to READY FOR MERGE

Before marking or claiming `READY FOR MERGE`, the agent must confirm:

- all required gates are green;
- reviewer-response accounting is complete;
- source issue accounting is complete;
- pre-merge closeout prediction is recorded;
- all reviewer comments, bot comments, and GitHub review threads are inspected;
- every actionable reviewer item has a parser-safe disposition;
- every required thread has a parser-safe state: `resolved`, `outdated`, or `unresolved` with rationale recorded in the disposition text;
- the final PR panel confirms merge-readiness.

If any required gate is failing or pending, remain in `BLOCKED` or `READY FOR REVIEW`; do not claim `READY FOR MERGE`.

The administrative lane may reconcile review status and route unresolved findings, but it does not substitute for independent review or approval.

### Required reviewer disposition format

```text
review-comment:<id> — accepted/rejected/acknowledged/not-applicable — <specific resolution or reason> — thread state: resolved/outdated/unresolved
```

### Stop condition

Do not mark merge-ready if any gate, reviewer item, bot comment, review thread, source issue accounting item, or PR body section still requires agent action. Do not treat review-ready as merge-ready.

---

## State 3: READY FOR MERGE

### Entry condition

All required checks, reviewer-response accounting, source issue accounting, and governance gates are satisfied. The PR is ready for final merge authorization by the human/operator.

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
- predict whether terminal labels, parent reporting, successor state, and closeout exceptions can be reconciled;
- record blockers in the PR body if post-merge closeout would not pass.

The administrative lane may correct deterministic clerical metadata before the merge decision when existing authority identifies the exact correct value. It must not waive a required technical, review, approval, or authority defect.

### Required pre-merge closeout prediction fields

The PR body must answer:

```text
Pre-merge closeout prediction: pass / fail / blocked
Source issue state before merge: open / closed / other
Expected post-merge source issue action: auto-close / manual close / no-op / remediation follow-up
Reviewer disposition parseability: pass / fail / not-applicable
Queue continuation after closeout: continue / halt / not-applicable
Administrative exception expected: none / <bounded exception>
```

### Stop condition

Do not request merge while the prediction is `fail` or `blocked`.

---

## State 4: HUMAN MERGE DECISION

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

Administrative reporting lag alone does not block merge. A missing or contradictory required source-Issue, validation, review, approval, authority, dependency, or closeout invariant does block merge.

### Stop condition

If a predictable post-merge closeout failure exists, return the PR to DRAFT/BLOCKED instead of merging.

---

## State 5: MERGED

### Entry condition

The PR is merged into the base branch.

### Required transition to CLOSEOUT VERIFIED

After merge, the responsible agent or automation must verify:

- merged state;
- merge commit SHA;
- source issue state;
- source issue closure or required follow-up;
- post-merge validation workflow status;
- terminal source-Issue label state;
- actively governed parent/project/program reporting state;
- queue/dependency-map continuation status;
- remediation or closeout-exception issue state if one was created;
- explicitly authorized tracker/status-index follow-up, if any.

Successful post-merge closeout CI is the primary merge-triggered administrative actor. The broader administrative lane verifies the result and intervenes only when the transaction fails, partially completes, lacks the required trigger, conflicts with later evidence, or leaves housekeeping unresolved.

### Stop condition

If post-merge verification fails, the source issue or remediation issue must show `status:failed` or equivalent failure evidence, and queue advancement must halt only where the failed invariant requires it. Independent approved lanes continue unless they share the failure or collision set.

---

## State 6: CLOSEOUT VERIFIED

### Entry condition

Post-merge closeout has passed and the administrative transaction is complete.

### Required evidence

Closeout is verified only when:

- source issue is closed or explicitly remains open with rationale;
- terminal source-Issue labels are reconciled;
- post-merge validation passed or was marked not applicable with rationale;
- actively governed parent/project/program reporting is reconciled or explicitly not applicable;
- queue/dependency-map continuation decision is recorded;
- no unresolved remediation or administrative closeout exception remains for the source issue;
- no required tracker/status-index follow-up remains unless delegated to a bounded issue;
- final administrative clarification and housekeeping are complete.

### Final state

The PR lifecycle is complete. Program queue work may advance only after this state is reached or the human/operator explicitly overrides the halt with recorded rationale.

The administrative lane may later correct newly discovered deterministic drift, but it must not reopen technical scope or duplicate the completed closeout transaction.

---

## Non-merge administrative dispositions

Canceled, duplicate, superseded, not-planned, administrative-only, and other authorized non-merge work does not pass through the `MERGED` state.

The administrative control lane may apply the authorized disposition when:

- the source Issue or higher authority explicitly identifies the disposition;
- implementation objectives are not being changed through the administrative action;
- labels, links, comments, parent reporting, and queue effects can be determined;
- any successor or dependency impact is recorded;
- the final state is verified.

A non-merge disposition must not be used to bypass required implementation, validation, review, approval, or production boundaries.

---

## Agent reporting requirements

Every agent status report about a PR must include:

```text
PR lifecycle state: NO PR / DRAFT / READY FOR REVIEW / READY FOR MERGE / HUMAN MERGE DECISION / MERGED / CLOSEOUT VERIFIED
Current head SHA: <sha or not-applicable>
Source issue: #<issue>
Gate status: pass / fail / pending / not-applicable
Reviewer disposition status: pass / fail / pending / not-applicable
Pre-merge closeout prediction: pass / fail / blocked / not-applicable
Administrative state: aligned / exception / pending / not-applicable
Queue continuation: continue / halt / not-applicable
```

Do not claim readiness, merge safety, administrative alignment, or closeout success without repository evidence.

---

## CI alignment requirement

Pre-merge CI should enforce the `READY FOR REVIEW -> READY FOR MERGE -> HUMAN MERGE DECISION` transitions. The pre-merge gate must reject PRs that would predictably fail post-merge closeout due to missing source issue, closed source issue without approved exception, missing reviewer disposition, unresolved required review thread, stale acceptance criteria, or missing queue/dependency-map decision.

Post-merge CI should enforce the `MERGED -> CLOSEOUT VERIFIED` transition. A successful transaction should atomically reconcile source-Issue state, terminal labels, parent reporting, successor disposition, and remediation state. Any post-merge failure should create or update a bounded remediation or administrative exception Issue and halt only the affected queue transition until resolved.

Deterministic clerical primary-issue mismatch is not a post-merge exception when repository evidence identifies exactly one unambiguous correct source issue. In that case post-merge closeout may repair the durable PR/source-issue linkage, apply completion labels, close the corrected source issue, and reconcile the successor without creating a remediation issue. Material ambiguity, changed-file authority conflicts, unmet acceptance criteria, unresolved required review findings, and objective changes still stop for human review.

---

## Related authorities

- `Agent.md`
- `docs/governance/OPERATIONS-AND-RECOVERY.md`
- `docs/reference/operations/administrative-control-lane-contract.md`
- `docs/ops/pmo/queue-watch-and-dispatch-protocol.md`
- `docs/ops/pmo/github-issue-closeout-protocol.md`
- `docs/ops/ai/SHARED-AGENT-RULES.md`
- `docs/ops/ai/CORE-RULES.md`
- `.agents/skills/lgfc-pr-governance/SKILL.md`
- `.github/pull_request_template.md`
- `docs/governance/PR_GOVERNANCE.md`
- `docs/reference/governance/troubleshooting-data-surface-requirements.md`
