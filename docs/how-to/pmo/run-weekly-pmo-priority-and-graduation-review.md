---
Doc Type: How-to
Audience: Human + AI
Authority Level: Procedure
Owns: Weekly PMO meeting sequence for Active priority, Engineering Pipeline priority, preparation ownership, Project Graduation, and metadata reconciliation
Does Not Own: Product priority decisions, implementation execution, recovery strategy, PR approval, Production authorization, or dashboard runtime behavior
Canonical Reference: /docs/governance/WORK-QUEUES-AND-COLLABORATION.md
Related Issues: #2699
Last Reviewed: 2026-07-21
---

# Run the Weekly PMO Priority and Graduation Review

## Purpose

Provide one weekly review path for Bill and ChatGPT to govern the PMO portfolio without defining project child-task implementation order.

## Inputs

Use:

- live PMO-tracked GitHub parent Issues;
- current lifecycle, Pipeline stage, team, and priority labels;
- linked task completion evidence;
- open Engineering preparation assignments;
- Project Graduation packages;
- open Operations Issues and their current numbered, Monitoring, or Hold states;
- the PMO dashboard as a reporting aid only.

GitHub Issues remain authoritative when dashboard data is stale, incomplete, or contradictory.

## Step 1 — Review Operations precedence

Identify all open standalone Operations Issues.

For each Issue, confirm exactly one state:

```text
ops:priority:1 | ops:priority:2 | ops:priority:3 | ops:priority:4
ops:monitoring | ops:hold
```

Numbered Operations Issues remain actionable interrupts. Monitoring and Hold Issues do not block PMO or Engineering, but must contain a current owner, next review time or update interval, expected evidence, and release condition.

Do not conduct normal project dispatch while a numbered Operations Issue remains actionable.

## Step 2 — Review the Active PMO queue

For each Active parent:

- confirm `team:pmo`;
- confirm exactly one `pmo:priority:1` through `pmo:priority:4` label;
- confirm child tasks do not carry PMO priority;
- review completion percentage and executable next work;
- identify holds, blocked dependencies, promotion state, Production state, and closeout needs.

Apply capacity limits:

- maximum four P1 parent projects;
- maximum four P2 parent projects;
- maximum four P3 parent projects;
- no fixed P4 limit.

Use completion thresholds only as eligibility signals:

- P2 at 80% may be considered for P1;
- P3 at 70% may be considered for P2;
- P4 at 50% may be considered for P3.

No priority changes occur automatically. Projects may complete at any Active priority.

## Step 3 — Review the Engineering Pipeline queue

For each Pipeline parent:

- confirm `team:engineering`;
- confirm exactly one `eng:priority:1` through `eng:priority:4`, or `eng:priority:idea`;
- confirm one truthful Pipeline stage;
- distinguish preparation priority from actual maturity;
- review whether current preparation ownership is sufficient.

Any Pipeline project may move directly to Engineering P1 regardless of current stage.

There is no time limit for remaining in a priority or stage.

## Step 4 — Create accountable preparation work

For every Pipeline parent newly assigned Engineering P1:

1. create or reactivate one peer Engineering preparation Issue;
2. assign ChatGPT / Atlas as preparation owner;
3. use `Related Pipeline Project:` or `Graduation Target:`;
4. do not use `Parent Project:`;
5. do not apply `pmo:task`;
6. record the target PMO review meeting;
7. define the required launch-package outputs.

There must be no more than one open preparation assignment for the same Pipeline parent.

## Step 5 — Review Project Graduation candidates

A candidate should normally be at Ready for Launch and have:

- reconciled objective, scope, and non-goals;
- approved requirements and acceptance criteria;
- architecture and design;
- implementation plan;
- dependency, risk, rollback, and stop analysis;
- refined project master;
- ordered child Issues;
- file scopes and validation model;
- execution-agent recommendation;
- launch-readiness recommendation.

Record one decision:

```text
GO
NO-GO
HOLD
ADJUSTMENT
```

### Go

Project Graduation transfers the parent from Engineering/Pipeline to PMO/Active.

Record:

- removal of Pipeline stage and Engineering priority;
- assignment of `team:pmo`;
- a newly selected Active PMO priority;
- execution owner;
- first executable child task;
- implementation Go and applicable delivery profile.

Engineering priority never transfers automatically to Active PMO priority.

### No-Go

Retain the project in Engineering/Pipeline and record the reason and next condition.

### Hold

Retain the project in Engineering/Pipeline and record the hold owner, evidence needed, and review condition.

### Adjustment

Route bounded additional preparation through the existing preparation Issue when possible. Create a new Issue only for materially separate work.

## Step 6 — Review completion decisions

For Active projects approaching completion, verify:

- authorized implementation scope is complete, removed, superseded, or deferred;
- validation and independent review evidence exists;
- promotion and Production decisions are recorded where applicable;
- deployment and live verification are complete where applicable;
- unresolved defects or follow-up work are explicit;
- child-task and parent accounting agree;
- closeout evidence is complete.

The PMO meeting records the completion decision. A project need not become P1 before completion.

## Step 7 — Reconcile metadata

After decisions are made, Administration & Communications reconciles only the authorized state:

- parent lifecycle;
- team assignment;
- matching priority namespace;
- Pipeline stage;
- preparation assignment relationship;
- graduation decision;
- active task sequence references;
- completion and closeout state.

Do not place team-priority labels on child tasks.

Do not create dual team ownership.

## Step 8 — Publish the meeting result

Record:

- current Operations numbered interrupts, Monitoring, and Hold states;
- Active parent priorities;
- Engineering Pipeline priorities and stages;
- new preparation assignments;
- graduation decisions;
- completion decisions;
- required follow-up implementation or reconciliation work.

The meeting defines portfolio direction. Each project continues to own its child sequence, dependencies, implementation order, and technical execution.