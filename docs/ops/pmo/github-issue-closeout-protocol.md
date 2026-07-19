---
Doc Type: Operations
Audience: Human + AI
Authority Level: Operational Authority
Owns: Issue closeout evidence, profile-aware completion accounting, deterministic closeout, exception handling, parent/reporting reconciliation, and successor disposition
Does Not Own: Merge authority, delivery or promotion decisions, project objectives, PR approval, Production authorization, recovery strategy, or workflow implementation
Canonical Reference: /docs/governance/ADMINISTRATION-AND-COMMUNICATIONS.md
Related Issues: #1411, #2359, #2640, #2641, #2639
Last Reviewed: 2026-07-19
---

# GitHub Issue Closeout Protocol

## Purpose

Define how LGFC tasks, projects, programs, releases, and incidents are reconciled after their required technical and decision evidence exists.

Closeout is an Administration & Communications function. It records what happened and confirms no required work was lost. It does not replace implementation, PR approval, Promotion Candidate qualification, Production authorization, or Day-2 recovery authority.

## Core rules

1. A successful deterministic closeout transaction must not be duplicated.
2. Closeout blocks only the affected transition when a substantive invariant is missing.
3. Routine administrative closeout does not block the next independent Development task.
4. A task may complete at Development integration while its project continues toward Promotion Candidate.
5. Promotion Candidate, Production, and incident closeout each require their own evidence.
6. No closeout may claim that a skipped promotion profile was completed.

## Completion levels

### Task closeout

A Development task may close after:

- required implementation and validation are complete;
- the PR is integrated into the correct non-main branch or receives an authorized non-merge disposition;
- protected review requirements are satisfied;
- task evidence and terminal state are reconciled;
- successor dependency state is recorded.

Task closeout does not mean the complete feature is Production-ready.

### Project closeout

A project closes after:

- all planned tasks are completed, removed, superseded, or explicitly deferred;
- integrated Development scope is reconciled;
- unresolved gaps are explicit;
- Promotion Candidate and Production disposition are recorded when required;
- parent and program reporting are current.

### Promotion Candidate closeout

A Promotion Candidate closes with one disposition:

- approved for Production;
- returned to Development;
- superseded by a newer candidate;
- stopped/not planned.

Required evidence includes the exact candidate identity, qualification results, standards reconciliation, rollback readiness, unresolved gaps, and decision authority.

### Production closeout

Production closeout requires:

- exact approved candidate identity;
- controlled merge/deployment evidence;
- live verification;
- rollback disposition;
- Day-2 ownership transfer;
- any incident or remediation state.

### Incident closeout

An incident closes after:

- impact and cause are sufficiently documented;
- containment and recovery actions are recorded;
- recovery verification and sustained health meet policy;
- remaining operational holds are released;
- follow-up root-cause, hardening, standards, or documentation work is tracked;
- paused work state is restored or explicitly re-planned.

## Required closeout packet

A closeout packet identifies:

```text
Closeout level: task | project | promotion-candidate | production | incident
Subject:
Source authority:
Profile:
PR / candidate / deployment / incident identity:
Validation and review evidence:
Decision authority:
Terminal state:
Parent/program/reporting action:
Successor or resume action:
Unresolved gaps or follow-up:
Rollback or recovery evidence:
Exceptions:
```

Missing evidence routes to one bounded exception. It does not justify guessing.

## Deterministic post-merge closeout

Successful post-merge automation is the primary merge-triggered administrative actor when the result is mechanically provable.

It may:

- verify merge/integration identity;
- reconcile source-Issue labels and state;
- record task-level completion;
- update parent/project reporting;
- disposition declared successors;
- create or update one remediation/exception record;
- verify the final administrative state.

It must not:

- claim Promotion Candidate or Production success from a Development merge;
- invent acceptance, approval, or Production authority;
- close an umbrella/project/program without explicit authority;
- duplicate an already successful closeout;
- block independent Development solely because prose, labels, or reporting remain pending.

## Successor handling

Successor eligibility depends on explicit dependency, collision, hold, and authority state—not routine predecessor closeout prose.

### Independent successor

An independent Development task may start when its source authority and dependencies permit, even if the previous task remains in PR review or administrative closeout.

### Technical successor

A successor with `technical-integration`, protected, resource-collision, launch-authority, or operational dependencies remains blocked until the applicable condition clears.

### Administrative-only relationship

Administrative-only state never blocks implementation eligibility.

Closeout records the successor disposition but does not create the dependency.

## Parent and program accounting

Administration & Communications reconciles:

- task completion and remaining work;
- project and program status;
- Promotion Candidate and Production state;
- deferred, superseded, or removed work;
- unresolved defects and Production risk;
- active incidents and operational holds;
- dashboards and reports explicitly governed by the source authority.

Parent, program, umbrella, and tracking Issues remain open until their own closeout authority exists.

## Non-merge dispositions

An Issue may close without a merged PR when the source authority records a valid disposition such as:

- duplicate;
- superseded;
- not planned;
- canceled;
- evidence-only Sandbox result;
- administrative-only completion;
- no-change verification.

Non-merge closeout must not falsely represent implementation, qualification, Production, or recovery success.

## Closeout exceptions

Exception lifecycle:

```text
DETECTED -> RECORDED -> ROUTED -> CLARIFICATION OR REMEDIATION -> VERIFIED -> RESOLVED
```

One exception record identifies:

- affected subject and closeout level;
- missing or contradictory invariant;
- current evidence;
- affected blocking scope;
- owning role;
- required clarification or remediation;
- resume/successor effect;
- resolution evidence.

Reporting lag and cosmetic metadata do not block independent work. Missing authority, validation, approval, candidate identity, Production evidence, safety, or collision state blocks only the affected transition unless the issue is shared.

## Lightweight clarification

When closeout evidence reveals a simple inconsistency:

```text
PROBLEM FOUND
  -> route to the role that made the controlling decision
  -> GUIDANCE or ADJUSTMENT
  -> Administration & Communications records
  -> RESUME or CLOSEOUT
```

Use `PLAN CHANGE REQUIRED` only when the answer changes product outcome, architecture, acceptance criteria, dependencies, delivery model, promotion path, Production boundary, or recovery strategy.

## Operational hold and resume

During a broad Day-2 assessment hold, closeout preserves active task, branch, claim, candidate, and resume state.

After Day-2 Operations authorizes hold narrowing or release, Administration & Communications:

- restores unaffected work;
- prevents duplicate claims;
- preserves superseding decisions;
- records exact resumed tasks and remaining targeted holds.

## Closeout comment format

```text
CLOSEOUT
Level: <task | project | promotion-candidate | production | incident>
Subject: #____
Profile: <sandbox | development | promotion-candidate | production | day-2>
PR / candidate / deployment: ____ / not applicable
Evidence: pass / accepted exception / failed / not applicable
Decision authority: ____
Terminal state: ____
Successor / resume action: ____
Parent/program/reporting action: ____
Unresolved gaps: none / ____
Exception: none / #____
```

## Idempotency

- Re-read current state before mutation.
- Skip an action when the intended state already exists.
- Do not overwrite newer check, review, decision, candidate, deployment, incident, or closeout evidence.
- Use stable action/exception identifiers when automated.
- Re-fetch and verify the final state.

## Required references

- Administration & Communications policy: `docs/governance/ADMINISTRATION-AND-COMMUNICATIONS.md`
- Administration contract: `docs/reference/operations/administrative-control-lane-contract.md`
- Lane/profile contract: `docs/reference/operations/operating-lanes-and-promotion-profiles.md`
- Delivery and promotion policy: `docs/governance/DELIVERY-AND-RELEASE.md`
- Day-2 Operations policy: `docs/governance/OPERATIONS-AND-RECOVERY.md`
- Queue/dispatch procedure: `docs/ops/pmo/queue-watch-and-dispatch-protocol.md`