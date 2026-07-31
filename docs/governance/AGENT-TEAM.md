---
Doc Type: Governance
Audience: Human + AI
Authority Level: Domain Policy
Owns: Durable LGFC roles, current member mapping, approval authority, protected stops, operating modes, launch-control workflow boundaries, member work-precedence mapping, and delegated task-closeout role boundaries
Does Not Own: Queue and priority semantics, shared execution detail, tool-specific runtime behavior, PMO sizing, promotion-profile policy, communication mutation taxonomy, or production mechanics
Canonical Reference: /docs/governance/REPOSITORY-AUTHORITY.md
Related Issues: #2494, #2640, #2641, #2648, #2699, #2700, #2622
Last Reviewed: 2026-07-31
---

# Agent Team

## Purpose

This document defines durable repository roles and maps current team members and systems to them. Broad policy uses role names so team-member, vendor, model, runtime, or tool changes do not require widespread documentation edits.

An agent or system may act only through the roles currently assigned to it. A named agent does not permanently own authority merely because it currently fills a role.

LGFC agents are operating team members. They communicate directly through the canonical GitHub communication workflow whenever it is available. Human relay through Product Authority is the least-desired fallback and does not replace durable agent-to-agent routing.

Queue precedence, team priority namespaces, Project Graduation, and the universal collaboration method are defined in `docs/governance/WORK-QUEUES-AND-COLLABORATION.md`.

## Durable roles

| Role | Authority |
| --- | --- |
| Product Authority | Product outcome, priority, cost, business decisions, final completed-product review |
| PMO / Engineering | Requirements, design, architecture, acceptance criteria, planning, Sandbox authority, implementation Go, aggregate project verification |
| Implementation / Operations | Development and Promotion Candidate execution, testing, remediation, integration, deployment execution, and eligible assigned task-level closeout after required independent evidence exists |
| PR Approver / Engineering | Independent validation that work meets design, acceptance, repository, and promotion requirements |
| Administration & Communications | Evidence, routing, acknowledgments, escalation, repository-state reconciliation, hold/resume, reporting, closeout, and authorized transaction execution |
| Day-2 Operations | Production monitoring, incident classification, containment, recovery strategy, operational hold release |
| Deterministic CI | Machine-provable checks, evidence, eligible non-main integration, and bounded authorized automation |

No role may self-approve work when independent review is required. Implementation / Operations may perform eligible administrative task closeout only after the required independent review, integration, validation, and post-integration evidence already exist.

## Current team mapping

| Current member or system | Assigned roles |
| --- | --- |
| Bill | Product Authority; Day-2 Operations; alternate protected approval when recorded |
| ChatGPT | PMO / Engineering; PR Approver / Engineering; Administration & Communications; Day-2 Operations coordination and Tier 2 specialist support |
| Claude Code | PMO / Engineering; PR Approver / Engineering; Administration & Communications; Day-2 Operations coordination and Tier 2 specialist support |
| Cursor Local | Implementation / Operations; Day-2 Operations remediation implementation |
| GitHub Actions and repository automation | Deterministic CI; Administration & Communications transport/evidence; authorized Day-2 monitoring and bounded remediation |
| Repository runner and routing controller | Administration & Communications control-plane infrastructure; host/service maintained by Day-2 Operations |
| Codex | Inactive for LGFC implementation unless Product Authority records future reauthorization and role assignment |

Future agents and systems may be assigned compatible roles through an approved mapping change or project manifest. Changing the mapping does not change the role contract.

## Mapping rules

- Canonical policy names durable roles, not preferred vendors, models, or agent products.
- Current member names belong in this mapping, a project manifest, or a bounded runtime/compatibility document.
- A role reassignment changes who may act; it does not alter the authority or evidence required for the action.
- One member may hold multiple roles, but required independent review and separation-of-duty constraints still apply.
- A member that implemented child work must not be the sole independent reviewer of that work or the sole project/master closeout auditor.
- More than one member may durably co-hold the same role (for example, PMO / Engineering and PR Approver / Engineering held jointly by ChatGPT and Claude Code). Which co-holder is actively engaged at a given time is an operational routing decision recorded through the canonical GitHub communication workflow (`HOLD`, `RESUME`, collaboration requests), not a mapping change, and does not require an edit to this document.

## Team communication

- Operating team members communicate directly through structured GitHub events on the relevant source Issue.
- The target role holder acknowledges and acts through the same durable workflow.
- Collaboration adds a bounded participant; it does not change the source Issue's queue, priority, or execution owner.
- PR reviews, checks, and threads provide technical evidence but do not replace the source-Issue collaboration or routing event.
- Product Authority is not expected to copy, interpret, or relay routine assignments, findings, remediation requests, acknowledgments, resumes, status, or completion messages.
- Human relay through Product Authority is the least-desired fallback when the canonical channel is unavailable or Product Authority intervention is intentionally required.
- Any externally relayed decision must be written back to GitHub by the responsible role holder before repository work depends on it.

## Lane topology

### Horizontal lanes

- PMO / Engineering
- Implementation / Operations
- Day-2 Operations

### Vertical lane

- Administration & Communications

Development and Promotion Candidate are technical profiles inside the conversational Implementation / Operations lane.

Lanes define authority. The separate Operations, PMO, and Engineering work queues define sequencing under `WORK-QUEUES-AND-COLLABORATION.md`.

## Daily work precedence

### Cursor Local

1. Numbered Operations Issues requiring remediation.
2. Active PMO project tasks selected by parent PMO priority and project-defined task sequence.
3. Bounded Engineering collaboration only when explicitly requested.

Operations Monitoring and Hold Issues receive required interval updates but do not block Active PMO work.

### ChatGPT

1. Numbered Operations Issues when assigned for Tier 2 specialist support, Engineering judgment, independent review, or coordination.
2. PMO work when assigned for design adjustment, review, promotion, Production decision preparation, verification, or closeout.
3. Engineering Pipeline preparation selected by Engineering priority.

### Claude Code

1. Numbered Operations Issues when assigned for Tier 2 specialist support, Engineering judgment, independent review, or coordination.
2. PMO work when assigned for design adjustment, review, promotion, Production decision preparation, verification, or closeout.
3. Engineering Pipeline preparation selected by Engineering priority.

This precedence orders each member's available capacity. It does not merge team queues or transfer source-Issue ownership.

## Authority boundaries

| Decision or action | Owning role |
| --- | --- |
| Product requirements, priority, cost, business Go/No-Go | Product Authority |
| Design, architecture, acceptance, project plan, Sandbox decision | PMO / Engineering |
| Launch-package completeness, Project Graduation recommendation, and implementation Go | PMO / Engineering |
| Scoped implementation and remediation | Implementation / Operations |
| PR review and approval | PR Approver / Engineering |
| Eligible non-main integration | Deterministic CI under Delivery policy or PR Approver / Engineering when protected |
| Assigned project-child or child-remediation closeout decision after required evidence exists | Assigned Implementation / Operations role holder |
| Assigned task closeout transaction | Deterministic CI first; assigned Implementation / Operations role holder as fallback under bounded delegated Administration & Communications authority |
| Project/master closeout decision | PMO / Engineering with independent PR Approver / Engineering verification |
| Project/master closeout transaction | Designated Administration & Communications role holder who did not solely implement the underlying child work |
| Program/umbrella closeout decision | Product Authority and PMO / Engineering under recorded program-closeout authority |
| Promotion Candidate Go/No-Go and closeout disposition | PMO / Engineering, PR Approver / Engineering, and other roles required by the approval profile |
| Production promotion and closeout disposition | Recorded Production authority plus required Engineering approval |
| Production incident classification, recovery strategy, and incident closeout decision | Day-2 Operations |
| Issue/PR/check/deployment state, communication, hold/resume administration, and recording of authorized closeout | Administration & Communications |
| Mechanically provable validation and bounded automation | Deterministic CI |

## Approval model

- Implementation / Operations does not approve its own protected work or Production promotion.
- Task closeout is an administrative completion action and does not substitute for PR approval, integration authority, Promotion Candidate qualification, or Production approval.
- Deterministic CI may record automated eligibility, integrate eligible non-main work, and execute authorized deterministic closeout; it does not impersonate human Engineering approval.
- PR Approver / Engineering handles subjective alignment, protected changes, Promotion Candidate qualification, and required Production review.
- Product Authority is not a routine gate during approved Development work; escalation occurs for product, priority, cost, business, credential, or protected Production decisions.
- Advisory collaboration is not formal approval. Formal PR review remains GitHub-native and must be performed by an authorized independent reviewer.

## Delegated task closeout

The assigned Implementation / Operations role holder is accountable for reaching a correct terminal state for an explicitly assigned project-child or child-remediation Issue when all of the following are true:

1. the Issue class and parent/master relationship are explicit;
2. required implementation and validation are complete;
3. required independent review or authorized integration has occurred;
4. post-integration verification passes;
5. successor and parent reporting disposition are determinable;
6. no protected stop, operational hold, or unresolved closeout exception remains; and
7. the closeout packet is complete.

Deterministic CI is the preferred transaction executor. When automation does not complete a mechanically eligible transaction, the assigned Implementation / Operations role holder may post the closeout packet, reconcile permitted task state, and close the assigned Issue under bounded delegated Administration & Communications authority.

This delegation does not authorize the assigned role holder to close a project/master, program/umbrella, Promotion Candidate, Production, release, incident, standalone `OPS:`, or Product Authority disposition Issue.

## Administration & Communications responsibilities

Administration & Communications follows all horizontal lanes and all work queues.

It may:

- route assignments, collaboration requests, evidence, decision requests, acknowledgments, and escalation;
- reconcile deterministic Issue, PR, team, priority, PMO, routing, check, deployment, incident, and closeout state;
- prepare Go/No-Go and Promotion Candidate evidence packets;
- apply, narrow, release, and restore recorded holds under the owning role's decision;
- resolve missing, partial, contradictory, or failed administrative transactions;
- maintain planned-versus-completed accounting;
- audit child-task closeout evidence during project/master closeout; and
- execute closeout transactions under the role-based executor matrix.

It must not independently change product outcome, design, acceptance, implementation scope, delivery model, promotion profile, PR disposition, recovery strategy, priority, queue ownership, or Production authority.

## Runner and controller responsibilities

The runner and routing controller are shared communications/control-plane infrastructure in Administration & Communications.

- They carry authorized events and deterministic actions.
- They do not own the meaning of the event.
- Implementation / Operations owns workflow creation and onboarding.
- Day-2 Operations owns runner host/service availability, security, capacity, stop/start, rollback, and recovery.
- The originating horizontal lane owns the action's decision authority.

## Universal collaboration boundary

Any source-Issue owner may request bounded collaboration from another agent without creating a new Issue or transferring ownership.

The collaborator:

- acknowledges on the same source Issue;
- reviews the referenced evidence;
- provides the bounded response;
- records completion;
- returns execution to the Issue owner.

The collaborator normally does not modify the branch or PR. A separately authorized implementation contribution, ownership handoff, or formal PR review is required before touching those surfaces.

## Lightweight problem adjustment

Any role may post `PROBLEM FOUND`.

The Issue routes to the role that made the controlling decision:

```text
PROBLEM FOUND
  -> GUIDANCE or ADJUSTMENT by owning role
  -> Administration & Communications records the decision
  -> RESUME
```

Only the affected scope pauses unless evidence requires broader impact. Use `PLAN CHANGE REQUIRED` only for material changes to product outcome, architecture, acceptance criteria, dependency structure, delivery model, Production boundary, or recovery strategy.

## Protected stop conditions

All roles stop the affected scope and route the Issue when any of the following is true:

1. unresolved material product, design, architecture, or acceptance decision;
2. conflicting canonical authority;
3. unsafe preview, Sandbox, component, or Production isolation;
4. missing credential, cost, business, privacy, legal, or destructive-action authority;
5. evidence that the approved design cannot satisfy acceptance without material change;
6. missing or contradictory source Issue, dependency, validation, approval, promotion-profile, safety, or closeout authority;
7. active numbered Operations interrupt covering the work;
8. attempted bypass of Sandbox -> Development -> Promotion Candidate -> Production progression;
9. contradictory team ownership or cross-namespace priority labels; or
10. attempted task closeout without required independent review, integration, post-integration verification, or deterministic terminal state.

Routine wording corrections, deterministic administrative reconciliation, bounded validation remediation, collaboration, and in-scope implementation adjustments are not protected stops.

## Operating modes

| Mode | Purpose | Typical role |
| --- | --- | --- |
| Design | Architecture, decomposition, acceptance framing | PMO / Engineering |
| Sandbox | Isolated proof-of-concept and factual design evidence | PMO / Engineering + Implementation / Operations |
| Documentation | Canonical Explanation, How-to, Reference, Tutorial, and governance alignment | PMO / Engineering or assigned Implementation / Operations |
| Governance | Authority, role, gate, and policy alignment | PMO / Engineering |
| Worklist | Program hierarchy and Issue structure | PMO / Engineering + Administration & Communications |
| Verification | PR, CI, Promotion Candidate, Production, and post-deployment validation | PR Approver / Engineering + Deterministic CI |
| Troubleshooting | Failed gates, broken workflows, inconsistent state | Owning horizontal lane with Administration & Communications routing |
| Implementation | Development and Promotion Candidate execution | Implementation / Operations |
| Administration & Communications | Evidence, routing, state, escalation, hold/resume, reporting, closeout | Administration & Communications + Deterministic CI + delegated role holders where policy permits |
| Day-2 Operations | Production monitoring, incident response, recovery | Day-2 Operations |

## End-to-end workflow

```text
Product Authority / PMO input
  -> Engineering Pipeline preparation and optional Sandbox
  -> Project Graduation and implementation Go
  -> PMO Active Development execution and automated PR gates
  -> independent review or authorized integration
  -> post-integration task verification and eligible child closeout
  -> Promotion Candidate qualification
  -> Production approval, deployment, and live verification
  -> Day-2 Operations monitoring and support
```

Numbered Operations work may interrupt Engineering preparation or PMO Active execution at the nearest safe checkpoint.

Administration & Communications supports every step vertically.

## Launch-control package

Before Development begins, the source authority includes:

- one primary source Issue;
- assigned role and current role holder;
- active lane and promotion profile;
- Issue class and parent/master relationship;
- task-closeout delegation state;
- documentation/design reference;
- exact file allowlist;
- scope and non-goals;
- acceptance criteria;
- dependency and protected-stop state;
- validation and rollback plan;
- implementation Go.

## Startup orientation

When Product Authority says `run startup`, the addressed Engineering role holder (ChatGPT or Claude Code) performs orientation only and stops. Startup does not authorize queue audit, implementation resume, GitHub mutation, or administrative reconciliation.

## Canonical references

| Topic | Owner |
| --- | --- |
| Work queues, priorities, graduation, collaboration | `docs/governance/WORK-QUEUES-AND-COLLABORATION.md` |
| Lane and profile contract | `docs/reference/operations/operating-lanes-and-promotion-profiles.md` |
| Administration & Communications policy | `docs/governance/ADMINISTRATION-AND-COMMUNICATIONS.md` |
| Administration mutation and closeout executor contract | `docs/reference/operations/administrative-control-lane-contract.md` |
| Issue closeout procedure | `docs/ops/pmo/github-issue-closeout-protocol.md` |
| Delivery and promotion policy | `docs/governance/DELIVERY-AND-RELEASE.md` |
| Operations and recovery policy | `docs/governance/OPERATIONS-AND-RECOVERY.md` |
| Implementation authority evidence | `docs/reference/agents/implementation-authority-contract.md` |
| Shared execution detail | `docs/ops/ai/CORE-RULES.md` |

## Supersession

Legacy person-specific or agent-specific policy is superseded where it conflicts with this durable role model. Current team mappings belong here or in project manifests; runtime compatibility documents may describe how a current member exercises an assigned role but must not redefine repository-wide authority. Queue, priority, graduation, and collaboration details belong in `WORK-QUEUES-AND-COLLABORATION.md` rather than being redefined per agent.
