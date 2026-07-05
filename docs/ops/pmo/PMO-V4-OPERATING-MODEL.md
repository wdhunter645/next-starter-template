---
Doc Type: Operations
Audience: Human + AI
Authority Level: Canonical PMO Authority
Owns: LGFC PMO v4 program inventory, workload reporting, backlog inventory, lifecycle terms, program preparation, Cursor execution boundaries, launch gates, completed/historical archive treatment, PMO reporting vs operations reporting separation, and Drive drafting model
Does Not Own: Product-specific design, runtime implementation, workflow YAML, production configuration, secrets, or unauthorized GitHub issue mutation
Canonical Reference: /docs/ops/pmo/PMO-V4-OPERATING-MODEL.md
Related Issues: #2100
Last Reviewed: 2026-07-05
---

# PMO V4 Operating Model

## Purpose

This document is the top-level LGFC PMO v4 authority. It supersedes `/docs/ops/pmo/PMO-V3-OPERATING-MODEL.md` for new PMO planning and implementation decisions **only after** issue #2100 merges by PR.

PMO v4 preserves the issue-number-based program model from PMO v3. A program is a GitHub program issue. Program issue numbers are the durable program identifiers.

## Transition from PMO V3

**Until issue #2100 merges:** `/docs/ops/pmo/PMO-V3-OPERATING-MODEL.md` remains the current repository PMO authority. This file is staged authority only.

**After issue #2100 merges:** this file becomes the controlling PMO authority. `/docs/ops/pmo/PMO-V3-OPERATING-MODEL.md` becomes historical reference. Where older PMO documents conflict with this file, this file controls for new work.

Subordinate PMO docs (`program-registry.md`, `pmo-backlog.md`, implementation plans, and task issues) must be reconciled to conform after promotion. This promotion PR reconciles only the minimum index/backlog routing references in `program-registry.md` and `pmo-backlog.md`.

## Drive vs repository authority

Google Drive is the live PMO drafting notebook. Drive is intentionally freeform: Atlas may update, reorganize, and refine Drive PMO notes as Bill and Atlas discuss ideas, projects, program structure, prioritization, and PMO process improvements.

Rules:

- **Drive drafts are planning inputs.** They are not repository authority.
- **Repository docs become authority only through issue/PR merge.**
- Repository documentation remains authoritative until a PMO V4 replacement PR lands.
- Future PMO notebook content matures in Drive first; promotion to the repository still requires the normal issue/PR path.

Source for this promotion: issue #2100 embedded comments (Drive draft *LGFC PMO V4 Operating Model — Updated Draft 2026-06-20*).

## Scope

This document owns PMO v4 terminology, workload inventory rules, backlog categories, program-preparation rules, Cursor execution boundaries, launch gates, completed/historical archive treatment, PMO reporting vs operations reporting separation, and documentation replacement order.

It does not own task-level implementation plans, workflow YAML, runtime code, or unauthorized GitHub issue mutation.

## Core PMO V4 rules

### Complete inventory reporting

PMO V4 reporting uses **complete inventories**. Atlas may classify status, launch state, risk, sequencing pressure, and dependencies, but **Bill makes final prioritization decisions**. Unless Bill asks for a subset, program/project/idea lists should include all known entries in the applicable category.

### Website build-out priority rule

All programs involving implementation for website build-out are **Priority #1** for the LGFC team by default. This includes current or future programs whose primary outcome is implementation of public-facing website capability, site structure, fan club product surfaces, content presentation, campaign surfaces, or related website build-out dependencies.

A repository need may supersede website build-out and become Priority #1 only when the need materially blocks, destabilizes, or puts at risk the LGFC team's ability to safely execute, validate, deploy, or operate the repository. Atlas may identify and recommend when such a repository need warrants temporary elevation, but **Bill alone** makes the final decision to change program prioritization.

### Bill-final-prioritization rule

Atlas prepares classifications, sequencing recommendations, and launch-readiness assessments. Bill authorizes final prioritization, launch, hold, reprioritization, and merge decisions.

## PMO reporting vs operations reporting separation

PMO V4 separates **PMO status reporting** from **operations status reporting**. Do not conflate them.

| Surface | Owns | Examples |
| --- | --- | --- |
| **PMO status reporting** | Program inventory, backlog inventory, launch state, lifecycle status, prioritization queue, promotion candidates, and historical archive classification | Workload inventory (master program records), PMO Backlog rows, program lifecycle terms (Launch Ready, Implementation Active, Post-Implementation Verification, Complete / Closed), future backlog shaping |
| **Operations status reporting** | Live repository execution evidence and agent work queues | Open PRs, active issue clusters, CI/post-merge hardening state, Atlas current task queue, blocked design items, verification gate status |

Rules:

- PMO reports describe **what programs and backlog items exist** and their PMO lifecycle state.
- Operations reports describe **what is actively executing in the repository right now**.
- A program may be PMO-queued while operations work focuses on a different repository-need priority (for example, CI hardening temporarily preceding website build-out).
- PMO meeting issues and weekly project review update PMO surfaces; PR/check evidence updates operations surfaces.

## Workload inventory

The PMO workload inventory lists all known open master program records unless Bill requests a subset.

### Current workload (as of Drive draft 2026-06-29)

Five open master records:

| Program | Name | PMO status | Notes |
| ---: | --- | --- | --- |
| #1685 | Website Completion / Fan Club Product Buildout | Implementation active (launch-gated) | Children #1686–#1694 |
| #1700 | Fundraiser / Charity Campaign Operations Buildout | Queued (launch-gated) | Children #1701–#1708 |
| #1719 | PMO Governance / Workflow Automation Completion | Blocked (launch-gated) | Children #1720–#1727 |
| #1738 | Gehrig Content Collection Phase 1 | Blocked (launch-gated) | Children #1739–#1746; foundation for content collection strategy |
| #1847 | OPS Post-Merge Self-Healing CI Program | Implementation active | Children #1848–#1854; active repository need that may temporarily precede #1685 until Bill authorizes transition back to website build-out |

Workload inventory rules:

- Include every open master program record in PMO workload reporting unless Bill requests a subset.
- Classify each record with PMO lifecycle status and launch state.
- Record child-issue ranges where they exist.
- Distinguish PMO-queued programs from operations-active repository-need programs.
- Reconcile workload inventory against `program-registry.md` after promotion; registry detail remains subordinate to this model.

## Backlog categories

PMO V4 uses two backlog surfaces:

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

PMO program lifecycle terms remain as defined in PMO V3 until reconciled here. They are distinct from PR lifecycle states in `/docs/governance/PR_LIFECYCLE_STATE_MACHINE.md`.

| Term | Meaning |
| --- | --- |
| **Launch Ready** | Scope, issue chain, acceptance criteria, and execution order are documented well enough for Cursor implementation to begin. Does **not** mean production complete. |
| **Implementation Active** | Cursor is executing the approved issue/PR chain. One PR per issue unless explicitly authorized otherwise. |
| **Post-Implementation Verification** | Implementation PRs are merged or ready for final verification; validation, cleanup, closeout, and remediation checks are running. |
| **Complete / Closed** | Production/governance validation passed; cleanup resolved; source and child issues closed or explicitly deferred with documented rationale. |

**Principle:** Do not use "launch ready" to mean production complete.

## Launch gates

A program or task sequence may execute only when all applicable launch gates are satisfied:

1. **Preparation packet complete** — Atlas has prepared the program to the maximum feasible extent (see [Program preparation](#program-preparation)).
2. **Explicit Bill/Atlas authorization** — launch, assignment, or continuation is recorded in the source issue or assignment thread.
3. **Blocking predecessors cleared** — predecessor programs/tasks are merged, closed, or explicitly dispositioned unless Bill authorizes parallel execution.
4. **Current open source issue exists** — work is tied to exactly one primary source issue per PR.
5. **Launch-state control honored** — planning issues, planning PRs, ready-for-review planning PRs, and merged planning PRs do **not** launch programs by themselves.

Launch gate failures are stop conditions. Cursor must not execute from planning/reference material alone.

## Program preparation

Before Cursor launches any PMO program, Atlas prepares the program to the maximum feasible extent. This preparation step is mandatory for PMO V4 and is intended to reduce Cursor resource usage, reduce agent drift, and make program execution deterministic.

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
- Work rule: one program, one child issue, one PR
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
- Status: READY FOR REVIEW

Stop:
READY FOR REVIEW.
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

Resource-control rule: **one local Cursor agent, one program, one child issue, one PR, stop at READY FOR REVIEW.**

| Actor | May do | May not do without explicit authorization |
| --- | --- | --- |
| **Bill** | Final prioritization, launch gates, merges, protected actions | N/A |
| **Atlas** | Prepare program packets, classify PMO inventory, author issues/docs | Mutate repo state when asked only for prompts or analysis |
| **Cursor** | Implement bounded tasks within allowlist, verify, stop at READY FOR REVIEW | Merge, close issues, relabel, advance queues, create child issues, expand scope, redesign programs |
| **Controller / automation** | Run explicitly defined checks and authorized closeout steps | Infer authority from merge state, labels, or queue order |

Cursor must not interpret "continuous execution" as approval to start adjacent work, advance the program queue, or pick up the next GitHub issue without Bill/Atlas authorization.

## PMO hierarchy

```text
PMO meeting issue
→ PMO Backlog review/update
→ program issue
→ project / task issue
→ PR
→ validation
→ closeout
```

## Completed and historical program archive

Historical and completed records are retained for continuity and audit evidence. They are **not** current workload unless reopened or promoted through a current source issue.

| Record | Role | Status |
| --- | --- | --- |
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

After PMO V4 promotion merges:

1. PMO V4 operating model: this file
2. Current active repository documentation governing the subject
3. Current program implementation plan
4. Task/source issue body
5. PR body, validation evidence, and review disposition
6. Subordinate PMO reference documents (`program-registry.md`, `pmo-backlog.md`)
7. Drive drafts, historical issues, prior programs, and chat

Drive drafts remain planning inputs at all times unless promoted by issue/PR.

## Documentation replacement rule

Future PMO documentation changes must be top-down:

1. Update this PMO V4 operating model first.
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
| `lgfc-cursor-execution-contract.md` reconciliation | Align cursor execution contract with PMO V4 preparation model | Priority #3 / #1722 |
| Full registry/backlog reconciliation | Reconcile detailed program-registry and pmo-backlog rows to PMO V4 workload inventory (#1738, #1847, Phase 2 shaping) | Post-promotion maintenance issue |
| Drive planning docs #27–#31 | Remain in Drive until individually promoted by issue/PR | Atlas |

## Related references

- PMO V3 operating model (historical after promotion): `/docs/ops/pmo/PMO-V3-OPERATING-MODEL.md`
- PMO program registry: `/docs/ops/pmo/program-registry.md`
- PMO Backlog: `/docs/ops/pmo/pmo-backlog.md`
- PR lifecycle state machine: `/docs/governance/PR_LIFECYCLE_STATE_MACHINE.md`
- LGFC AI team operating model: `/docs/ops/ai/LGFC-AI-TEAM-OPERATING-MODEL.md`
