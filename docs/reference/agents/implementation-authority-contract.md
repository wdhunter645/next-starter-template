---
Doc Type: Reference
Audience: Human + AI
Authority Level: Controlled
Owns: Non-overlapping role contracts, protected-stop evidence flags, approval-profile mapping, delegated task-closeout boundaries, and workflow invariants for agent execution
Does Not Own: Domain policy, launch authorization, workflow implementation, current team mapping, or merge mechanics
Canonical Reference: /docs/governance/AGENT-TEAM.md
Related Issues: #2494, #2700
Last Reviewed: 2026-07-21
---

# Implementation Authority Contract

## Purpose

Define the evidence contract used by current and future LGFC role holders before acting on implementation, review, approval, integration, closeout, or escalation.

Current people, agents, and systems are mapped to these roles in `docs/governance/AGENT-TEAM.md` or an approved project manifest. This contract does not assign permanent authority to a named agent, model, vendor, or runtime.

## Role contracts

| Role | May do | Must not do |
| --- | --- | --- |
| Product Authority | Product and business Go/No-Go; priority; cost; final completed-product review; protected escalation | Act as a routine implementation-loop gate after authorized Go unless policy requires it |
| PMO / Engineering | Define requirements, design, architecture, acceptance, plans, Sandbox decisions, implementation Go, and aggregate project verification | Perform assigned implementation when separation of duties or the source Issue assigns another role holder; replace independent PR approval |
| Implementation / Operations | Perform scoped implementation, validation, remediation, integration execution, deployment execution, PR preparation, post-integration task verification, and eligible assigned task closeout | Self-approve; merge its own protected work; define scope or acceptance without authority; close project/master or higher-level work through task delegation |
| PR Approver / Engineering | Independently review and approve work; determine changes required; verify promotion qualification; supply project-audit evidence | Approve work it implemented when independent review is required; execute unauthorized implementation scope |
| Administration & Communications | Route, reconcile, record, audit, and execute authorized state transitions; complete project/master closeout transactions; manage closeout exceptions | Invent product, acceptance, approval, Promotion Candidate, Production, or recovery authority |
| Day-2 Operations | Classify incidents; direct containment and recovery; release operational holds; decide incident closeout after recovery verification | Redefine product scope or bypass required Engineering and Production controls |
| Deterministic CI | Run machine-provable checks; record evidence; integrate eligible non-main work; execute authorized idempotent task closeout | Impersonate subjective Engineering approval; invent authority; close project/master or higher-level work without explicit authority |

## Assigned task-closeout contract

The assigned Implementation / Operations role holder may decide and complete task-level closeout for an explicitly assigned project-child or child-remediation Issue when:

1. Issue class, parent/master, and assigned role holder are explicit;
2. required implementation and validation are complete;
3. independent review or authorized integration is recorded;
4. post-integration verification passes;
5. terminal task, parent-reporting, and successor state are deterministic;
6. no protected stop, operational hold, or unresolved closeout exception remains; and
7. the closeout packet is complete.

Deterministic CI is the preferred transaction executor. If automation does not complete an otherwise eligible transaction, the assigned Implementation / Operations role holder may execute the bounded task-closeout transaction under delegated Administration & Communications authority.

This delegation does not include project/master, program/umbrella, Promotion Candidate, Production, release, incident, standalone `OPS:`, or Product Authority disposition closeout.

## Protected-stop flags

| Flag | Meaning |
| --- | --- |
| `materialDesignDecision` | Product, layout, architecture, or acceptance framing remains unresolved and affects scope |
| `authorityConflict` | Active canonical sources disagree without source-Issue resolution |
| `unsafePreviewIsolation` | Preview or component path can mutate Production without approved control |
| `credentialsCostBusinessAuth` | Secrets, billing, vendor, legal, privacy, or business approval is required but not recorded |
| `structuralDesignFailure` | Approved design cannot meet acceptance without replanning |
| `incompleteLaunchPackage` | Required launch-control field or pre-implementation checkpoint is missing |
| `scopeOrAllowlistConflict` | Diff, Issue, assignment, or allowed-file boundaries disagree |
| `requiredGateFailure` | Mandatory check on the relevant head or integrated state is failing or incomplete |
| `blockingReviewThreads` | Unresolved independent review findings block readiness or closeout |
| `explicitHoldInstruction` | The owning role recorded hold or revise on the Issue or PR |
| `closeoutEvidenceConflict` | Review, integration, verification, Issue class, parent/master, successor, or terminal state is missing, failed, contradictory, or ambiguous |

Protected-stop flags require stop and escalation. Their absence permits only actions already authorized by the source Issue, delivery profile, and role contract.

## Approval profile mapping

| Delivery model | Implementation Go | PR review/approval | Merge or integration | Verification and closeout |
| --- | --- | --- | --- | --- |
| Model A | PMO / Engineering; Product Authority alternate where recorded | PR Approver / Engineering; authorized alternate where recorded | Authorized merge role under Delivery policy | PR Approver / Engineering verifies solution; Product Authority performs final completed-product review; Administration & Communications records closeout |
| Model B child | PMO / Engineering | PR Approver / Engineering for integration review; deterministic eligibility when allowed | Component integration per Delivery policy | Assigned Implementation / Operations verifies integrated task and completes eligible child closeout; PMO / Engineering and PR Approver / Engineering audit the project/master |
| Model B promotion | PMO / Engineering | PR Approver / Engineering plus other required approval-profile roles | Authorized promotion merge role | Required Engineering verifies Promotion Candidate and Production state; Product Authority performs final completed-product review; Administration & Communications records closeout |
| Emergency recovery | Roles required by emergency and recovery policy | Emergency approval profile | Per emergency policy | Stabilization first; Day-2 Operations decides recovery and incident closeout; follow-up is mandatory |

## Workflow invariants

1. Exactly one primary source Issue exists per normal PR.
2. Implementation / Operations never approves or merges its own assigned protected work.
3. Required independent review is supplied by PR Approver / Engineering or the applicable approval profile.
4. Protected stops override continuous execution and delegated task-closeout authority.
5. Identical evidence must produce identical stop, continue, or closeout outcomes.
6. Launch-control package completeness is verified before implementation Go.
7. Model B child work does not require routine Product Authority approval between Go and final completed-product review.
8. Eligible task closeout does not imply project, Promotion Candidate, or Production completion.
9. Project/master closeout requires independent aggregate verification and must not rely solely on the role holder that implemented the child work.
10. Current agent mappings may change without changing these role contracts.

## Decision examples

| Scenario | Required disposition |
| --- | --- |
| Model B child integrates, required checks pass, and post-integration verification is green | Deterministic CI closes the child; assigned Implementation / Operations completes the transaction if automation does not |
| Child PR is ready but independent review is missing | Stop; no merge, integration, or closeout authority |
| Child integration is green but parent/master acceptance remains incomplete | Close eligible child only; keep project/master open |
| Material design change appears during implementation | Stop and route `PLAN CHANGE REQUIRED` to PMO / Engineering or Product Authority as applicable |
| Preview can write Production data | Stop until isolation is approved and verified |
| Source Issue lacks Issue class, parent/master, or closeout delegation | Stop with `incompleteLaunchPackage` or `closeoutEvidenceConflict` |
| Assigned implementer attempts to approve or merge its own protected PR | Forbidden |
| Assigned implementer attempts to close a project master through child-task authority | Forbidden; route to PMO / Engineering and Administration & Communications |

## Required references

- Agent roles and current mapping: `docs/governance/AGENT-TEAM.md`
- Administration & Communications policy: `docs/governance/ADMINISTRATION-AND-COMMUNICATIONS.md`
- Administration executor matrix: `docs/reference/operations/administrative-control-lane-contract.md`
- Closeout procedure: `docs/ops/pmo/github-issue-closeout-protocol.md`
- Delivery policy: `docs/governance/DELIVERY-AND-RELEASE.md`
