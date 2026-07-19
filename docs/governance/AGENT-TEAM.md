---
Doc Type: Governance
Audience: Human + AI
Authority Level: Domain Policy
Owns: Durable LGFC roles, current member mapping, approval authority, protected stops, operating modes, and launch-control workflow boundaries
Does Not Own: Shared execution detail, tool-specific runtime behavior, PMO sizing, promotion-profile policy, communication mutation taxonomy, or production mechanics
Canonical Reference: /docs/governance/REPOSITORY-AUTHORITY.md
Related Issues: #2494, #2640, #2641
Last Reviewed: 2026-07-19
---

# Agent Team

## Purpose

This document defines durable repository roles and maps current team members to them. Broad policy uses role names so team-member or tool changes do not require widespread documentation edits.

## Durable roles

| Role | Authority |
| --- | --- |
| Product Authority | Product outcome, priority, cost, business decisions, final completed-product review |
| PMO / Engineering | Requirements, design, architecture, acceptance criteria, planning, Sandbox authority, implementation Go |
| Implementation / Operations | Development and Promotion Candidate execution, testing, remediation, integration, deployment execution |
| PR Approver / Engineering | Independent validation that work meets design, acceptance, repository, and promotion requirements |
| Administration & Communications | Evidence, routing, acknowledgments, escalation, repository-state reconciliation, hold/resume, reporting, closeout |
| Day-2 Operations | Production monitoring, incident classification, containment, recovery strategy, operational hold release |
| Deterministic CI | Machine-provable checks, evidence, eligible non-main integration, bounded authorized automation |

No role may self-approve work when independent review is required.

## Current team mapping

| Current member or system | Assigned roles |
| --- | --- |
| Bill | Product Authority; Day-2 Operations; alternate protected approval when recorded |
| ChatGPT / Atlas | PMO / Engineering; PR Approver / Engineering; Administration & Communications; Day-2 Operations coordination |
| Cursor Local | Implementation / Operations; Day-2 Operations remediation implementation |
| GitHub Actions and repository automation | Deterministic CI; Administration & Communications transport/evidence; authorized Day-2 monitoring and bounded remediation |
| Repository runner and routing controller | Administration & Communications control-plane infrastructure; host/service maintained by Day-2 Operations |
| Codex | Inactive for LGFC implementation unless Product Authority records future reauthorization |

Changing the mapping does not change the role contract.

## Lane topology

### Horizontal lanes

- PMO / Engineering
- Implementation / Operations
- Day-2 Operations

### Vertical lane

- Administration & Communications

Development and Promotion Candidate are technical profiles inside the conversational Implementation / Operations lane.

## Authority boundaries

| Decision | Owning role |
| --- | --- |
| Product requirements, priority, cost, business Go/No-Go | Product Authority |
| Design, architecture, acceptance, project plan, Sandbox decision | PMO / Engineering |
| Launch-package completeness and implementation Go | PMO / Engineering |
| Scoped implementation and remediation | Implementation / Operations |
| PR review and approval | PR Approver / Engineering |
| Eligible non-main integration | Deterministic CI under Delivery policy or PR Approver / Engineering when protected |
| Promotion Candidate Go/No-Go | PMO / Engineering, PR Approver / Engineering, and other required roles |
| Production promotion | Recorded Production authority plus required Engineering approval |
| Production incident classification and recovery strategy | Day-2 Operations |
| Issue/PR/check/deployment state, communication, hold/resume administration, closeout | Administration & Communications |
| Mechanically provable validation and bounded automation | Deterministic CI |

## Approval model

- Implementation / Operations does not approve its own protected work or Production promotion.
- Deterministic CI may record automated eligibility and integrate eligible non-main work; it does not impersonate human Engineering approval.
- PR Approver / Engineering handles subjective alignment, protected changes, Promotion Candidate qualification, and required Production review.
- Product Authority is not a routine gate during approved Development work; escalation occurs for product, priority, cost, business, credential, or protected Production decisions.

## Administration & Communications responsibilities

Administration & Communications follows all horizontal lanes.

It may:

- route assignments, evidence, decision requests, acknowledgments, and escalation;
- reconcile deterministic Issue, PR, PMO, routing, check, deployment, incident, and closeout state;
- prepare Go/No-Go and Promotion Candidate evidence packets;
- apply, narrow, release, and restore recorded holds under the owning role’s decision;
- resolve missing, partial, contradictory, or failed administrative transactions;
- maintain planned-versus-completed accounting.

It must not independently change product outcome, design, acceptance, implementation scope, delivery model, promotion profile, PR disposition, recovery strategy, priority, or Production authority.

## Runner and controller responsibilities

The runner and routing controller are shared communications/control-plane infrastructure in Administration & Communications.

- They carry authorized events and deterministic actions.
- They do not own the meaning of the event.
- Implementation / Operations owns workflow creation and onboarding.
- Day-2 Operations owns runner host/service availability, security, capacity, stop/start, rollback, and recovery.
- The originating horizontal lane owns the action’s decision authority.

## Lightweight problem adjustment

Any role may post `PROBLEM FOUND`.

The issue routes to the role that made the controlling decision:

```text
PROBLEM FOUND
  -> GUIDANCE or ADJUSTMENT by owning role
  -> Administration & Communications records the decision
  -> RESUME
```

Only the affected scope pauses unless evidence requires broader impact. Use `PLAN CHANGE REQUIRED` only for material changes to product outcome, architecture, acceptance criteria, dependency structure, delivery model, Production boundary, or recovery strategy.

## Protected stop conditions

All roles stop the affected scope and route the issue when any of the following is true:

1. unresolved material product, design, architecture, or acceptance decision;
2. conflicting canonical authority;
3. unsafe preview, Sandbox, component, or Production isolation;
4. missing credential, cost, business, privacy, legal, or destructive-action authority;
5. evidence that the approved design cannot satisfy acceptance without material change;
6. missing or contradictory source Issue, dependency, validation, approval, promotion-profile, safety, or closeout authority;
7. active Day-2 operational hold covering the work;
8. attempted bypass of Sandbox -> Development -> Promotion Candidate -> Production progression.

Routine wording corrections, deterministic administrative reconciliation, bounded validation remediation, and in-scope implementation adjustments are not protected stops.

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
| Administration & Communications | Evidence, routing, state, escalation, hold/resume, reporting, closeout | Administration & Communications + Deterministic CI |
| Day-2 Operations | Production monitoring, incident response, recovery | Day-2 Operations |

## End-to-end workflow

```text
Product Authority / PMO input
  -> PMO / Engineering design and optional Sandbox
  -> implementation Go
  -> Development execution and automated PR gates
  -> Promotion Candidate qualification
  -> Production approval, deployment, and live verification
  -> Day-2 Operations monitoring and support
```

Administration & Communications supports every step vertically.

## Launch-control package

Before Development begins, the source authority includes:

- one primary source Issue;
- role and runtime declaration;
- active lane and promotion profile;
- documentation/design reference;
- exact file allowlist;
- scope and non-goals;
- acceptance criteria;
- dependency and protected-stop state;
- validation and rollback plan;
- implementation Go.

## Startup orientation

When Product Authority says `run startup`, ChatGPT / Atlas performs orientation only and stops. Startup does not authorize queue audit, implementation resume, GitHub mutation, or administrative reconciliation.

## Canonical references

| Topic | Owner |
| --- | --- |
| Lane and profile contract | `docs/reference/operations/operating-lanes-and-promotion-profiles.md` |
| Administration & Communications policy | `docs/governance/ADMINISTRATION-AND-COMMUNICATIONS.md` |
| Delivery and promotion policy | `docs/governance/DELIVERY-AND-RELEASE.md` |
| Operations and recovery policy | `docs/governance/OPERATIONS-AND-RECOVERY.md` |
| Implementation authority evidence | `docs/reference/agents/implementation-authority-contract.md` |
| Shared execution detail | `docs/ops/ai/CORE-RULES.md` |

## Supersession

Legacy person-specific agent policy is superseded where it conflicts with this durable role model. Current team mappings belong here or in project manifests, not across broad governance documents.