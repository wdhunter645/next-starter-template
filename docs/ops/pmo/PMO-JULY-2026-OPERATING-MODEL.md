---
Doc Type: Operations
Audience: Human + AI
Authority Level: Canonical PMO Authority
Owns: LGFC PMO July 2026 program inventory, PMO issue contract, label contract, pipeline stages, workload reporting, backlog inventory, lifecycle terms, component-project hierarchy, reduced-gate delivery model, program preparation, Cursor execution boundaries, launch gates, Ops production handoff, completed/historical archive treatment, PMO reporting vs operations reporting separation, dashboard data-quality requirements, and Drive drafting model
Does Not Own: Product-specific design, runtime implementation, workflow YAML, production configuration, secrets, or unauthorized GitHub issue mutation
Canonical Reference: /docs/ops/pmo/PMO-JULY-2026-OPERATING-MODEL.md
Related Issues: #2100, #2296, #2487, #2516, #2610, #2611
Last Reviewed: 2026-07-18
---

# PMO July 2026 Operating Model

## Status

**Active for the PMO issue contract and dashboard data-quality rules.** Work sizing, `medium-provisional` intake, Medium Model A/B selection, and launch authorization are routed exclusively to [`docs/governance/PMO-PORTFOLIO.md`](../../governance/PMO-PORTFOLIO.md). Those topics alone are superseded here.

| Topic | Canonical owner |
| --- | --- |
| PMO sizing and Model A/B policy | `docs/governance/PMO-PORTFOLIO.md` |
| Evidence contract and decision matrix | `docs/reference/pmo/work-size-and-delivery-model-contract.md` |
| Classification procedure | `docs/how-to/pmo/classify-work-and-select-delivery-model.md` |
| PMO issue contract, labels, lifecycle, Incomplete handling | this file |
| Dashboard JSON/view/validation contract | `docs/ops/pmo/PMO-JULY-2026-DASHBOARD-SPECIFICATION.md` |
| Dashboard operator procedure | `docs/how-to/pmo/pmo-dashboard.md` |
| Runtime single-authority repair plan | `docs/reference/pmo/pmo-dashboard-single-authority-implementation-plan.md` |

Do not cite this file for sizing or delivery-model decisions. Do cite this file for PMO tracking eligibility, lifecycle/priority/stage/task contract rules, Incomplete remediation, and dashboard reporting authority.

## Purpose

This document is the top-level LGFC PMO July 2026 authority for the PMO issue contract and related operational rules. It supersedes `/docs/ops/pmo/PMO-V3-OPERATING-MODEL.md` and the superseded `PMO-V4-OPERATING-MODEL.md` naming for current PMO planning, issue tracking, dashboard reporting, and implementation-readiness decisions. Work sizing and Model A/B selection remain routed to `docs/governance/PMO-PORTFOLIO.md` per the Status section above.

PMO July 2026 preserves the issue-number-based program model from PMO v3. A program is a GitHub program issue. Program issue numbers are the durable program identifiers.

## Current known truth

PR #2282 for issue #2100 has promoted the former PMO V4 material into repository authority. This July 2026 document is the current canonical PMO operating model and replaces the version-only PMO V4 route for active authority references.

Google Drive PMO material and the embedded source comments in issue #2100 remain planning inputs and historical promotion evidence. They do not become repository authority by themselves.

`program-registry.md` and `pmo-backlog.md` remain subordinate PMO routing and inventory surfaces. They must not override the controlling PMO operating model.

## Intended final state

Every PMO-tracked GitHub issue has complete, mutually consistent metadata; the dashboard can place it into Active, Pipeline, Completed, or Incomplete without silent fallback; and operators can remediate metadata defects from documented issue-contract rules.

`/docs/ops/pmo/PMO-V3-OPERATING-MODEL.md` remains historical reference unless a later source issue explicitly restores or updates it.

`program-registry.md`, `pmo-backlog.md`, dashboard documentation, readiness packages, and label-mapping addenda route readers to PMO July 2026 for current PMO authority while continuing to serve their narrower functions.

Future PMO refinements still require the normal GitHub Issue / PR path before they become repository authority.

## Transition from PMO V3 and PMO V4 naming

Authority timing is defined in [Current known truth](#current-known-truth) and [Intended final state](#intended-final-state).

Where older PMO documents conflict with this file, this file controls for new work.

The former `PMO-V4-OPERATING-MODEL.md` path is superseded historical naming and must not be used as the current canonical route. Historical files may mention PMO V3 or PMO V4 as evidence of prior transitions, but active authority headers and current routing references must point to `/docs/ops/pmo/PMO-JULY-2026-OPERATING-MODEL.md`.

Subordinate PMO docs (`program-registry.md`, `pmo-backlog.md`, dashboard docs, implementation plans, readiness packages, and task issues) must be reconciled to conform when touched by authorized work.

## Drive vs repository authority

Google Drive is the live PMO drafting notebook. Drive is intentionally freeform: Atlas may update, reorganize, and refine Drive PMO notes as Bill and Atlas discuss ideas, projects, program structure, prioritization, and PMO process improvements.

Rules:

- **Drive drafts are planning inputs.** They are not repository authority.
- **Repository docs become authority only through issue/PR merge.**
- Repository documentation remains authoritative until a PMO July 2026 replacement PR lands.
- Future PMO notebook content matures in Drive first; promotion to the repository still requires the normal issue/PR path.

Source for the original PMO V4 promotion: issue #2100 embedded comments (Drive draft *LGFC PMO V4 Operating Model — Updated Draft 2026-06-20*).

## Scope

This document owns PMO July 2026 terminology, the PMO issue contract, label requirements, lifecycle rules, pipeline stages, priority rules, task accounting, workload inventory rules, backlog categories, component-project hierarchy, reduced-gate delivery model, program-preparation rules, Cursor execution boundaries, launch gates, Ops production handoff, completed/historical archive treatment, PMO reporting vs operations reporting separation, dashboard data-quality requirements, and documentation replacement order.

It does not own task-level implementation plans, workflow YAML, runtime code, or unauthorized GitHub issue mutation.

## Core PMO July 2026 rules

### Complete inventory reporting

PMO July 2026 reporting uses **complete inventories**. Atlas may classify status, launch state, risk, sequencing pressure, and dependencies, but **Bill makes final prioritization decisions**. Unless Bill asks for a subset, program/project/idea lists should include all known entries in the applicable category.

### Website build-out priority rule

All programs involving implementation for website build-out are **Priority #1** for the LGFC team by default. This includes current or future programs whose primary outcome is implementation of public-facing website capability, site structure, fan club product surfaces, content presentation, campaign surfaces, or related website build-out dependencies.

A repository need may supersede website build-out and become Priority #1 only when the need materially blocks, destabilizes, or puts at risk the LGFC team's ability to safely execute, validate, deploy, or operate the repository. Atlas may identify and recommend when such a repository need warrants temporary elevation, but **Bill alone** makes the final decision to change program prioritization.

### Bill-final-prioritization rule

Atlas prepares classifications, sequencing recommendations, and launch-readiness assessments. Bill authorizes final prioritization, launch, hold, reprioritization, and merge decisions.

## PMO July 2026 Issue Contract

The PMO issue contract is the required metadata model for every GitHub issue included in PMO portfolio reporting. Dashboard generation and validation must treat contract failures as data-quality defects, not as reasons to silently invent defaults.

### Tracking eligibility

The `pmo` label controls PMO tracking:

- `pmo` means the issue is tracked by PMO and is eligible for PMO portfolio reporting.
- No `pmo` label means the issue is outside PMO portfolio reporting, even when the issue title uses a PMO-like prefix.

Supported standalone portfolio title prefixes are:

- `PROGRAM:`
- `PROJECT:`
- `PROGRAM CANDIDATE:`
- `STRATEGY:`
- `STRATEGY REVIEW:`

`pmo:task` issues are never standalone portfolio rows; they contribute to parent task accounting when their parent reference is valid.

### Lifecycle labels

Every PMO-tracked issue must carry exactly one lifecycle label:

| Label | Meaning | Dashboard placement |
| --- | --- | --- |
| `pmo:pipeline` | Not active yet; retained for PMO review, design, planning, or launch preparation | Pipeline unless invalid metadata sends it to Incomplete |
| `pmo:active` | Active PMO work or active implementation coordination | Active unless invalid metadata sends it to Incomplete |
| `pmo:closed` | Completed, closed, or intentionally terminal PMO work | Completed unless invalid metadata sends it to Incomplete |

Closed GitHub issue state must reconcile to `pmo:closed`. A closed PMO issue without `pmo:closed`, or an open issue with contradictory terminal metadata, is incomplete until reconciled.

### Pipeline stage labels

Every `pmo:pipeline` issue must carry exactly one pipeline-stage label. Stage labels are mutually exclusive and describe the current progression from initial idea through launch readiness:

| Order | Label | Stage | Meaning |
| ---: | --- | --- | --- |
| 1 | `pmo:stage:intake` | Idea / topic intake | Topic captured for PMO awareness; not yet discovery-ready |
| 2 | `pmo:stage:discovery` | Discussion / discovery | PMO is shaping purpose, owner, risks, and rough boundaries |
| 3 | `pmo:stage:definition` | Definition / design | Repository-ready scope, design, and authority are being defined |
| 4 | `pmo:stage:planning` | Planning | Implementation sequence, dependencies, and acceptance criteria are being planned |
| 5 | `pmo:stage:prep` | Implementation preparation | Documentation package, issue chain, file scope, and verification model are being prepared |
| 6 | `pmo:stage:ready-for-launch` | Ready for launch | Code/docs preparation is complete, implementation plan is complete, and master/child issues are created and linked; only explicit Bill/Atlas Go/No-Go remains |

Ready for launch is a prepared-but-not-launched state. It does not authorize Cursor execution, issue mutation, production launch, or merge. Execution begins only after explicit Bill/Atlas Go/No-Go authorization is recorded on the relevant source issue or assignment thread.

### Priority labels

Every PMO-tracked issue must carry exactly one priority label:

| Label | Meaning |
| --- | --- |
| `pmo:priority:1`, `pmo:priority:2`, `pmo:priority:3`, and so on | Ordered execution or portfolio priority; lower numbers sort first |
| `pmo:priority:idea` | Topic retained in Pipeline and on the PMO meeting agenda without a numbered execution priority |

`pmo:priority:none` is prohibited. Missing priority labels, multiple priority labels, unsupported priority labels, and `pmo:priority:none` are incomplete data-quality defects.

### Task issues and parent references

`pmo:task` identifies a task issue. Every task must have a valid parent program/project reference that resolves to a PMO-tracked parent issue.

Task state derives from the same PMO lifecycle labels:

| Task labels | Task state |
| --- | --- |
| `pmo:task` + `pmo:pipeline` | Pending task |
| `pmo:task` + `pmo:active` | In-progress task |
| `pmo:task` + `pmo:closed` | Done task |

For each parent program or project:

- `taskCount` equals all linked `pmo:task` issues with a valid parent reference.
- `tasksCompleted` equals linked tasks with `pmo:closed`.
- `percentComplete` equals `round(tasksCompleted / taskCount * 100)` when `taskCount > 0`.
- `tasksCompleted` must never exceed `taskCount`.

Tasks with missing or invalid parent references are incomplete. Parent rows with inconsistent task accounting are incomplete until the task graph is corrected.

### Incomplete data-quality handling

Any `pmo` issue with missing, conflicting, or invalid required metadata must appear in the dashboard Incomplete section rather than Active, Pipeline, or Completed.

Incomplete detection includes at least:

- missing or conflicting lifecycle label;
- missing or conflicting priority label;
- `pmo:priority:none`;
- missing or conflicting pipeline-stage label for `pmo:pipeline` work;
- missing or invalid parent reference for a `pmo:task`;
- invalid task accounting;
- missing issue number, issue URL, or other issue identity in generated output;
- unsupported or contradictory PMO classification;
- GitHub closed state that does not reconcile to `pmo:closed`.

The Incomplete view must list issue number/link, current labels, data-quality errors, required remediation, and last updated date. Incomplete rows are remediation work queues; they do not count as valid Active, Pipeline, or Completed portfolio rows until corrected.

Dashboard field behavior, JSON shape, validation, sorting, and rendering are specified in `/docs/ops/pmo/PMO-JULY-2026-DASHBOARD-SPECIFICATION.md`.

## Atlas/ChatGPT dashboard startup input

For PMO July 2026 meeting startup, Atlas and ChatGPT should use the canonical public PMO dashboard JSON as the preferred reporting input when it is reachable and valid:

```text
https://wdhunter645.github.io/next-starter-template/pmo-dashboard/dashboard-data.json
```

This dashboard JSON is a generated reporting snapshot. It may accelerate startup summaries by presenting normalized Active Programs, PMO Pipeline, and Completed Programs views, but it does not become executable authority. GitHub Issues remain the authoritative current-state and executable truth for PMO work, including labels, issue state, issue-body metadata, comments, assignments, and closeout evidence.

Operating rule:

- Use dashboard JSON first for PMO startup reporting when fetch, parse, and schema validation succeed.
- Check `generatedAt` before describing the snapshot as current.
- Confirm live current state from GitHub Issues when the snapshot is stale, ambiguous, missing expected fields or views, or conflicts with issue evidence.
- Never let dashboard JSON override live GitHub issue state.

## PMO reporting vs operations reporting separation

PMO July 2026 separates **PMO status reporting** from **operations status reporting**. Do not conflate them.

| Surface | Owns | Examples |
| --- | --- | --- |
| **PMO status reporting** | Program inventory, backlog inventory, launch state, lifecycle status, prioritization queue, promotion candidates, and historical archive classification | Workload inventory (master program records), PMO Backlog rows, program lifecycle terms (Ready for Launch, Implementation Active, Post-Implementation Verification, Complete / Closed), future backlog shaping |
| **Operations status reporting** | Live repository execution evidence and agent work queues | Open PRs, active issue clusters, CI/post-merge hardening state, Atlas current task queue, blocked design items, verification gate status |

Rules:

- PMO reports describe **what programs and backlog items exist** and their PMO lifecycle state.
- Operations reports describe **what is actively executing in the repository right now**.
- A program may be PMO-queued while operations work focuses on a different repository-need priority (for example, CI hardening temporarily preceding website build-out).
- PMO meeting issues and weekly project review update PMO surfaces; PR/check evidence updates operations surfaces.

### PMO dashboard authority hierarchy

GitHub Issues are the sole operational authority for PMO tracking eligibility, lifecycle, priority, pipeline stage, task relationships, and closeout state. Dashboard JSON and static HTML are reporting-only snapshots.

Correct data flow:

```text
GitHub Issue state + current PMO labels
                ↓
PMO issue-contract validation
                ↓
Active / Pipeline / Completed / Incomplete
                ↓
Generated JSON and static dashboard
```

Static files such as `scripts/pmo-dashboard/pmo-tracked-inventory.json` may provide deterministic fixtures or explicit non-state exclusions. They must not prescribe live lifecycle or priority, and they must not override current Issue metadata during live validation.

### PMO dashboard state precedence

The PMO dashboard is a generated reporting snapshot, not the live source of executable truth. GitHub issues remain authoritative for current PMO state, and dashboard JSON must be regenerated before operators rely on it as current.

Dashboard state uses this precedence model:

1. The `pmo` label controls PMO tracking eligibility.
2. Required contract validation runs against **current** GitHub Issue state and PMO labels before Active, Pipeline, or Completed placement.
3. Issues with missing, conflicting, or invalid PMO metadata appear in Incomplete.
4. A closed GitHub issue must reconcile to `pmo:closed` and Completed placement.
5. Valid `pmo:active` issues appear in Active.
6. Valid `pmo:pipeline` issues appear in Pipeline and must include exactly one `pmo:stage:*` label.
7. Valid `pmo:closed` issues appear in Completed.

Frozen `expectedLifecycle` / `expectedPriority` values in static inventory JSON are not operational authority and must not be treated as a second lifecycle/priority source of truth.

Task/ops execution labels such as post-merge verification or failed do not become PMO dashboard display statuses. Completed dashboard rows display `Completed`. Pipeline stage labels distinguish idea intake, discovery, definition, planning, implementation preparation, and ready-for-launch work.

## Workload inventory

The PMO workload inventory lists all known open master program records unless Bill requests a subset.

### Current workload (reconciled with `program-registry.md`, 2026-07-16)

Four open master records:

| Program | Name | PMO status | Notes |
| ---: | --- | --- | --- |
| #1700 | Fundraiser / Charity Campaign Operations Buildout | Queued (launch-gated) | Children #1701–#1708 |
| #1719 | PMO Governance / Workflow Automation Completion | Implementation Active | Children #1720–#1727; continuous reduced-gate serial authorization 2026-07-16; active child #1720; #1725 complete |
| #1738 | Gehrig Content Collection Phase 1 | Blocked (launch-gated) | Children #1739–#1746; foundation for content collection strategy |
| #1847 | OPS Post-Merge Self-Healing CI Program | Implementation active | Children #1848–#1854; active repository need that may temporarily precede website build-out programs until Bill authorizes transition |

Program #1685 (Website Completion / Fan Club Product Buildout) is **closed complete** per `program-registry.md`. It is not current workload; see [Completed and historical program archive](#completed-and-historical-program-archive).

The Drive-draft workload snapshot (2026-06-29) listed #1685 as implementation active. That row is historical planning input only and was superseded by registry closeout evidence before this promotion.

Workload inventory rules:

- Include every open master program record in PMO workload reporting unless Bill requests a subset.
- Classify each record with PMO lifecycle status and launch state.
- Record child-issue ranges where they exist.
- Distinguish PMO-queued programs from operations-active repository-need programs.
- Reconcile workload inventory against `program-registry.md` after promotion; registry detail remains subordinate to this model.

## Backlog categories

PMO July 2026 uses two backlog surfaces:

| Surface | Role | Classification |
| --- | --- | --- |
| **Repository PMO Backlog** | Durable prioritized working inventory | See `/docs/ops/pmo/pmo-backlog.md` — ideas, project drafts, governance/ops items, implementation-ready projects, launch-control-ready program groups |
| **Drive PMO notebook** | Freeform discussion list Bill and Atlas are actively shaping | Lighter than the repository backlog; rows prefixed with `Project -` or `Idea -` |

Backlog category rules:

- **Project** — bounded workstream candidate with defined outcome.
- **Idea** — exploratory item requiring PMO review before promotion.
- **Governance/ops backlog item** — process, authority, or operations documentation candidate (often routed to Priority #3 or a dedicated program).
- **Implementation-ready / launch-control ready** — production documentation and issue chain exist; execution still requires explicit Bill/Atlas launch authorization.

Drive notebook rows under discussion (complete inventory as of draft):

1. Project — Website Completion / Fan Club Product Buildout
2. Project — Fundraiser / Charity Campaign Operations Buildout
3. Project — PMO Governance / Workflow Automation Completion
11. Project — Admin Page and Tools Design Readiness
12. Idea — Gehrig Content Collection Phase 2 (successor to Program #1738; owns media/archive acquisition workflow after Phase 1 and #2040 prove manual models)
13. Project — Annual Lou Gehrig Day operations package
15. Project — Sponsor/donor recognition operations
16. Project — Adam Wilson Award / recognition system
17. Idea — Community engagement cadence
18. Project — Partner / Friends of the Fan Club operations
19. Project — AI-assisted content research pipeline
20. Project — Member communications / newsletter
21. Project — Store / merchandise operations
22. Idea — LGFC newsletter
23. Project — Cost analysis and heat map for growth-related costs
24. Idea — LGFC monetization strategy
25. Idea — LGFC store strategy
26. Idea — LGFC social media strategy
27. Project — DIATAXIS Repository Documentation Migration Program
28. Project — PMO Enterprise Stabilization Sequence
29. Project — LGFC PMO Design Feedback and Target Model
30. Project — Agent Rule Instruction Checklist
31. Project — Agent Documentation Inventory

Repository backlog detail and rank tables remain in `/docs/ops/pmo/pmo-backlog.md`.

## Program lifecycle status nomenclature

PMO program lifecycle terms are defined here. They are distinct from PR lifecycle states in `/docs/governance/PR_LIFECYCLE_STATE_MACHINE.md`.

| Term | Meaning |
| --- | --- |
| **Ready for Launch** | Scope, issue chain, acceptance criteria, execution order, code/docs preparation, implementation plan, and master/child issue linkage are documented well enough for Bill/Atlas Go/No-Go. Does **not** mean launched or production complete. |
| **Implementation Active** | Cursor is executing the approved issue/PR chain. One PR per issue unless explicitly authorized otherwise. |
| **Post-Implementation Verification** | Implementation PRs are merged or ready for final verification; validation, cleanup, closeout, and remediation checks are running. |
| **Complete / Closed** | Production/governance validation passed; cleanup resolved; source and child issues closed or explicitly deferred with documented rationale. |

**Principle:** Do not use "ready for launch" to mean launched, authorized for execution, or production complete.

## Launch gates

A program or task sequence may execute only when all applicable launch gates are satisfied:

1. **Preparation packet complete** — Atlas has prepared the program to the maximum feasible extent (see [Program preparation](#program-preparation)).
2. **Explicit Bill/Atlas authorization** — launch, assignment, or continuation is recorded in the source issue or assignment thread.
3. **Blocking predecessors cleared** — predecessor programs/tasks are merged, closed, or explicitly dispositioned unless Bill authorizes parallel execution.
4. **Current open source issue exists** — work is tied to exactly one primary source issue per PR.
5. **Launch-state control honored** — planning issues, planning PRs, ready-for-review planning PRs, and merged planning PRs do **not** launch programs by themselves.

Launch gate failures are stop conditions. Cursor must not execute from planning/reference material alone.

### Launch gates vs CI/custom gates

PMO launch gates and repository CI/custom gates serve different purposes. Do not conflate them.

| Gate class | Purpose | Default posture |
| --- | --- | --- |
| **PMO launch gates** | Planning, authorization, predecessor, and scope controls before Cursor execution begins | Required for every program and component project |
| **CI/custom gates** | Repository safety, build integrity, and production-risk checks on PRs | Minimized unless specifically justified by production risk or repo safety |

Rules:

- PMO launch gates answer whether work is authorized, prepared, and scoped for Cursor execution.
- CI/custom gates answer whether a PR is safe to merge under repository enforcement.
- Normal repository safety checks remain in force. This model does not remove required CI.
- Do not create new custom gates by default. Add custom gates only when production risk or repo safety specifically requires them.
- Ops exception issues handle production gaps discovered after deployment rather than blocking every possible concern before merge.

## Program preparation

Before Cursor launches any PMO program or component project, Atlas prepares work to the maximum feasible extent. Preparation may occur at the **full-program level** or at the **component-project level** when a bounded capability is ready for Cursor execution. This preparation step is mandatory for PMO July 2026 and is intended to reduce Cursor resource usage, reduce agent drift, and make execution deterministic.

### Component-project preparation

When Atlas prepares a component project for Cursor, the preparation packet should include, where feasible:

- component objective and parent program-of-work reference;
- master issue body (execution coordination record for the component);
- linked child issue plan and child execution order;
- Cursor prompts sized for one child issue as the current executable unit, with linked successors defined in the project manifest;
- acceptance criteria;
- likely file/path scope and file-touch allowlist;
- verification expectations;
- documentation targets;
- production/Ops handoff expectations;
- known risks and explicitly accepted risks;
- project-level continuous-execution rule after one Go (routine stops are protected/escalation/`main` only, not every child READY FOR REVIEW).

Component-project preparation does not require waiting for full-program preparation of every sibling component. Each bounded component may be prepared and launched independently when Bill/Atlas authorize it and predecessor conditions are satisfied.

### Preparation packet contents

Where applicable, the preparation packet must include:

- launch order and predecessor conditions;
- child-task execution order;
- source issue and parent program references;
- task-specific Cursor prompts;
- scope boundaries and explicit out-of-scope work;
- file-touch expectations and likely allowlists;
- documentation targets;
- acceptance criteria;
- verification commands;
- PR title and PR body requirements;
- stop condition.

Cursor implementation begins only after the relevant program or child task has a prepared packet, unless Bill explicitly authorizes emergency execution without full preparation. Cursor should implement, verify, and produce PR-ready work; Cursor should **not** invent or redesign the program while executing it.

### Program-preparation template structure

Atlas should use this standard structure when preparing a program for Cursor.

#### 1. Program identity

- Program issue
- Program name
- Domain
- Launch priority
- Parent/predecessor
- Successor/dependent programs
- Source authority
- Required repo authority docs
- Required Drive planning docs, if any

#### 2. Launch condition

- May start when
- Must not start if
- Required Bill/Atlas decision
- Blocking predecessor
- Explicit non-authorizations

#### 3. Execution model

- Execution agent: Cursor
- Local agent rule: one local Cursor agent only
- Work rule: one component project child issue, one PR
- Stop condition: READY FOR REVIEW
- Merge authority: Bill/Atlas only
- Issue mutation authority: none unless explicitly granted by source issue
- Cursor role: implement and verify prepared scope
- Atlas role: prepare scope, prompts, acceptance criteria, and execution order
- Bill/Atlas role: decide launch, review, merge, closeout, and reprioritization

#### 4. Required baseline reads

Standard baseline reads:

- `Agent.md`
- `docs/ops/ai/SHARED-AGENT-RULES.md`
- `docs/ops/ai/CORE-RULES.md`
- `docs/ops/ai/CURSOR-RULES.md`
- `.agents/skills/lgfc-pr-governance/SKILL.md`
- `.github/pull_request_template.md`
- Program-specific authority docs
- Program-specific implementation plans
- Predecessor closeout evidence

#### 5. Child task execution order

| Order | Issue | Task | Predecessor | Output | Verification profile |
| ---: | ---: | --- | --- | --- | --- |
| 001 | # | | | | docs-only / runtime |
| 002 | # | | | | docs-only / runtime |
| terminal | # | Program validation and handoff | prior tasks | handoff report | docs-only / runtime as needed |

#### 6. Program hard boundaries

Each program packet must explicitly state:

- Out of scope
- Forbidden runtime behavior
- Forbidden issue mutations
- Forbidden file areas
- Dependency blockers
- External service/vendor boundaries
- Secrets and credential boundaries
- Public launch/publication boundaries

#### 7. Program deliverables

Distinguish:

- Runtime deliverables
- Documentation deliverables
- Test/evidence deliverables
- Operator handoff deliverables
- Follow-up issue candidates
- Explicitly deferred deliverables

#### 8. Verification profiles

Docs-only verification profile:

```bash
git diff --name-only origin/main...HEAD
./scripts/ci/docs_check_headers.sh .
./scripts/ci/docs_canonical_hashes_verify.sh .
```

Runtime verification profile:

```bash
npm ci
npm run lint
npm test
npm run build
npm run verify:invariants
```

Extended verification may be added by the child issue.

#### 9. Child task prompt template

```text
MODE: EXECUTION
OBJECTIVE: Execute #[child issue] — [task name].

Repository:
wdhunter645/next-starter-template

Branch:
cursor/[program]-task-[number]-[short-name]

PR title:
[type](#[issue]): [summary]

Source issue:
#[child issue]

Parent program:
#[program issue]

Predecessor:
[issue/task]

Goal:
[one clear sentence]

Required baseline reads:
- [standard baseline]
- [program-specific docs]

Required work:
1.
2.
3.

Likely files:
-

Do not:
-

Acceptance criteria:
-

Verification:
-

PR body must include:
- Source issue
- Parent program
- Summary
- Files changed
- Verification commands/results
- Out-of-scope confirmation
- Status: CURSOR COMPLETE / eligible for component integration when checks pass

Stop:
Protected stop, genuine CHATGPT HANDOFF, or production/`main` boundary only.
Do not stop for ChatGPT merely because a non-main PR opened or became technically clean.
```

#### 10. Program closeout and handoff template

Every program should end with a terminal child task that consolidates evidence and produces an operator handoff. The terminal task must:

- confirm all prior child tasks are merged or explicitly dispositioned;
- consolidate verification evidence;
- state readiness as ready, ready with exceptions, or blocked;
- list exceptions and required Bill/Atlas decisions;
- identify follow-up issues;
- document operator handoff requirements;
- avoid closing the program unless explicitly authorized.

## Cursor execution boundaries

Resource-control rule for launched Model B projects: **one local Cursor claim (`handoff:in-progress`) per approved lane; one child issue evidence unit; child PRs target the project branch; continue linked successors after project-branch integration without a routine human prompt.**

Component projects decompose into a master issue (coordination) and child implementation issues (Cursor-executable units). After one project-level Go on a complete package, Cursor executes linked children in dependency order. Cursor still claims only one colliding task at a time.

| Actor | Does | Does not |
| --- | --- | --- |
| **Cursor** | Implement bounded tasks within allowlist, verify, post CURSOR STATUS/COMPLETE, prepare component integration evidence | Self-approve, self-merge, merge to `main`, invent scope, skip protected stops |
| **ChatGPT** | Project preparation, genuine escalation response, protected-path/production review | Routine stop between every linked child on an already-launched project |
| **Bill** | Product Go/No-Go, production approval, material decisions | Routine per-child gate after project Go |

Cursor may interpret continuous execution as permission to activate eligible successors after predecessor integration when the project Go and manifest authorize it. Cursor must not self-merge or auto-merge to `main`.

Legacy controller automation may still run explicitly defined checks and authorized closeout steps. It must not infer authority from merge state, labels, or queue order alone.

## PMO hierarchy

```text
PMO meeting issue
→ PMO Backlog review/update
→ program of work
→ component project
→ master issue
→ child implementation issues
→ PR(s)
→ Atlas review / acceptance
→ production Ops monitoring
→ Ops exception issues if needed
→ closeout
```

Small projects are **component projects** inside larger programs of work, not random standalone tasks. A program of work may contain multiple component projects delivered incrementally.

GitHub program issue numbers remain the durable identifiers for programs of work. Master issues and child implementation issues carry execution detail within each component project.

## Component-project delivery model

| Term | Definition |
| --- | --- |
| **Program of work** | Strategic outcome and durable work container. Identified by a GitHub program issue. Holds one or more component projects toward a shared strategic goal. |
| **Component project** | Bounded capability within a program of work — for example, a website back-office slice, admin tool, or content workflow. Small enough for focused Cursor execution and Atlas review. |
| **Master issue** | Execution coordination record for a component project. Holds scope, child-issue plan, execution order, and handoff expectations. Does not replace the parent program-of-work issue. |
| **Child issue** | Smallest Cursor-implementable unit. One bounded task with an explicit allowlist, acceptance criteria, and verification plan. |
| **PR** | Reviewable implementation unit. One PR per child issue unless Bill/Atlas explicitly authorize otherwise. |
| **Atlas review / acceptance** | Post-Cursor control point. Atlas reviews merged or ready-for-review implementation against acceptance criteria before Ops handoff or component closeout. |
| **Ops production ownership** | Monitoring, support, exception creation, remediation routing, and production evidence capture after deployment. |

Delivery flow for a typical component project:

```text
small component project assigned
→ implemented by Cursor (child issues → PRs)
→ reviewed/accepted by Atlas
→ deployed to production
→ Ops managed in production
```

## Reduced-gate risk posture

LGFC accepts **higher delivery risk** for small bounded website/back-office component projects in exchange for **lower process drag**, faster implementation, Atlas review, and Ops-managed correction after production deployment.

This is not uncontrolled implementation. Safeguards are:

- detailed planning at program and component-project levels;
- small scope per child issue;
- master/child issue hierarchy;
- Cursor-local implementation (one agent, one child issue, one PR);
- Atlas review/acceptance as the post-implementation control point;
- production Ops monitoring after deployment;
- Ops exception issues when production gaps are found.

Explicitly discouraged:

- custom gate proliferation;
- governance-first delivery;
- large perfect-before-launch programs;
- heavy pre-merge gates for every concern;
- sprawling Cursor prompts;
- monster issues spanning multiple capabilities.

When a concern can be validated in production under Ops monitoring, prefer Ops exception routing over adding a new pre-merge gate.

## Ops production handoff

After Atlas accepts a component project and production deployment occurs, **Ops owns production management** for that capability.

Ops responsibilities after deployment:

- monitoring production behavior and health;
- support for operator-reported issues;
- exception issue creation when production gaps are found;
- remediation routing to the appropriate agent or operator;
- production evidence capture where applicable.

Ops exception issues handle production gaps rather than blocking every possible concern before merge. PMO launch gates and Atlas review remain the pre-deployment controls; Ops owns post-deployment correction and evidence.

Rules:

- Atlas acceptance is the post-Cursor control point before Ops handoff.
- Ops does not replace Bill/Atlas launch or merge authority.
- Production gaps discovered after deployment route through Ops exception issues, not retroactive scope expansion on closed child issues.

## Completed and historical program archive

Historical and completed records are retained for continuity and audit evidence. They are **not** current workload unless reopened or promoted through a current source issue.

| Record | Role | Status |
| --- | --- | --- |
| Program #1685 | Website Completion / Fan Club Product Buildout | Closed complete; children #1686–#1694 closed; closeout evidence at `docs/ops/reports/website-completion-program-closeout.md` |
| Program #1411 | PMO Automation and Agent Workflow Control | Complete planning/control artifact (historical Program 1) |
| Program #1255 | Website Implementation and Content Operations | Complete (historical Program 2) |
| Program #1500 | CI Post-Merge Closeout Reliability | Complete |
| Legacy #1379 | Ideas and Future Projects Portfolio | Superseded by PMO documentation |
| Issue #1335 | Phase 1 Wrap-Up | Historical evidence |
| Issue #1696 | Fundraiser documentation package | Complete planning source |
| Issue #1713 | PMO Governance documentation package | Complete planning source |

Archive treatment rules:

- Completed program cycles remain audit evidence and may be cited for historical context.
- They do not automatically authorize new child issues, queue movement, or parent/child relationships for later cycles.
- Closed historical planning issues are workflow evidence only, not active durable authority.
- Reconciliation closures (#1254, #1335, #1346) and narrow follow-ups (#2072) are documented in operations evidence, not relaunched as programs without a current source issue.

## Opportunistic DIATAXIS migration rule

When any active program touches legacy documentation, Atlas should look for a DIATAXIS migration opportunity. The goal is to reduce future Program #10 workload over time without letting documentation cleanup derail 2027 website readiness.

Standing rule: if a current issue or PR already touches a legacy document, Atlas should classify the DIATAXIS opportunity and choose one of two actions:

- migrate or normalize the touched document into the correct DIATAXIS location as part of the current PR if the move is low-risk and inside scope; or
- record a follow-up migration candidate if moving the document would broaden scope, require broad link repair, or risk distracting from the active program objective.

Practical handling:

- If the current PR already edits a legacy doc, migrate or normalize it now when low-risk and inside source-issue scope.
- If the current PR only references a legacy doc, record a follow-up migration candidate when migration is outside scope.
- If a legacy doc duplicates newer authority, flag it for retirement, supersession, or consolidation.
- If a legacy doc is historical evidence, preserve it unless it is clearly mislabeled or misleading.
- If migration would touch many links or authority surfaces, defer it to Program #10.
- If migration would delay website readiness, defer it unless the legacy doc actively blocks safe delivery.

Program #10 should have two lanes: an opportunistic migration lane for small cleanup included in normal PRs when the relevant legacy document is already in scope, and a bulk migration lane for larger moves, link repair, authority reconciliation, and remaining backlog.

Atlas identifies DIATAXIS migration opportunities and determines whether they are in scope for the active program. Cursor applies a migration only when it is inside the active issue or PR scope and does not broaden the PR. Otherwise, Cursor records the candidate and continues the assigned work.

**Website-readiness guardrail:** opportunistic DIATAXIS migration supports the 2027 website path by reducing future documentation debt, but it must not interrupt website readiness, content readiness, fundraiser readiness, release readiness, or 2027 campaign and LG4Day launch readiness unless documentation drift is actively blocking safe execution.

## Source-of-truth hierarchy

Current PMO authority hierarchy:

1. PMO July 2026 Operating Model: this file
2. Current active repository documentation governing the subject
3. Current program implementation plan
4. Task/source issue body
5. PR body, validation evidence, and review disposition
6. Subordinate PMO reference documents (`program-registry.md`, `pmo-backlog.md`)
7. Drive drafts, historical issues, prior programs, and chat

Drive drafts remain planning inputs at all times unless promoted by issue/PR.

## Documentation replacement rule

Future PMO documentation changes must be top-down:

1. Update this PMO July 2026 operating model first.
2. Update subordinate PMO docs to conform.
3. Update program implementation plans.
4. Update task/source issues only after the governing docs are aligned.
5. Do not perform disjointed PMO edits that change one document while leaving the overall model inconsistent.

## Follow-up gaps

The following items are identified for bounded follow-up issues. They are **not** implemented in issue #2100 scope:

| Gap | Description | Suggested owner |
| --- | --- | --- |
| `PROGRAM-PREPARATION-TEMPLATE.md` | Extract program-preparation template into standalone repo template at `docs/ops/pmo/PROGRAM-PREPARATION-TEMPLATE.md` | Atlas docs PR |
| `CURRENT-STATE.md` dashboard | Canonical current-state dashboard from Drive planning doc *LGFC PMO Design Feedback and Target Model* | Atlas / Priority #3 or dedicated program |
| DIATAXIS migration Program #10 | Bulk migration lane for remaining legacy documentation | Program candidate #27 |
| PMO Enterprise Stabilization Sequence | Drive planning doc #28 — stabilization sequence authority | Bounded planning issue |
| Agent rule-load management | Drive planning docs #30–#31 — agent rule checklist and documentation inventory | Governance program follow-on |
| Release evidence ownership | Release/operations lifecycle from stabilization sequence | Operations follow-on |
| `lgfc-cursor-execution-contract.md` reconciliation | Align cursor execution contract with PMO July 2026 component-project and preparation model | Priority #3 / #1722 |
| Full registry/backlog reconciliation | Reconcile detailed program-registry and pmo-backlog rows to PMO July 2026 workload inventory (#1738, #1847, Phase 2 shaping) | Post-promotion maintenance issue |
| Drive planning docs #27–#31 | Remain in Drive until individually promoted by issue/PR | Atlas |

## Related references

- PMO V3 operating model (historical): `/docs/ops/pmo/PMO-V3-OPERATING-MODEL.md`
- PMO July 2026 dashboard specification: `/docs/ops/pmo/PMO-JULY-2026-DASHBOARD-SPECIFICATION.md`
- PMO dashboard how-to: `/docs/how-to/pmo/pmo-dashboard.md`
- Single-authority runtime repair plan: `/docs/reference/pmo/pmo-dashboard-single-authority-implementation-plan.md`
- PMO program registry: `/docs/ops/pmo/program-registry.md`
- PMO Backlog: `/docs/ops/pmo/pmo-backlog.md`
- PR lifecycle state machine: `/docs/governance/PR_LIFECYCLE_STATE_MACHINE.md`
- LGFC AI team operating model: `/docs/ops/ai/LGFC-AI-TEAM-OPERATING-MODEL.md`
