---
Doc Type: Entry / Control File
Audience: Human + AI
Authority Level: Navigation
Owns: Read order, authority routing, lane/profile identification, execution entry point, and mandatory closeout-documentation routing
Does Not Own: Role policy, execution rules, design authority, communication policy, delivery policy, or governance decisions
Canonical Reference: /docs/governance/REPOSITORY-AUTHORITY.md
Related Issues: #1719, #2640, #2641, #2686, #2690
Last Reviewed: 2026-08-04
---

# Agent.md

Purpose: mandatory starting point and routing authority for all AI agents. No agent may begin repository work without reading this file first.

This file is navigation. It does not grant implementation, approval, Production, recovery, or administrative authority.

## Non-negotiable repository doctrine

- GitHub Issues are executable task authority.
- Repository documentation is binding operational authority and institutional memory.
- Documentation is implementation. It is never optional, deferred, or separated from project completion.
- Every project requires a complete AS-BUILT record describing the exact final implementation.
- A project is not complete while any required implementation, documentation, AS-BUILT, verification, PMO, queue, dashboard, dependency, GitHub, rollback, or closeout surface is missing, stale, contradictory, unmerged, or unverifiable.
- LGFC has no separate “administratively closed” state. Code merged does not equal project complete.
- Chat memory and external summaries are supporting context only and never replace live repository authority.

Canonical documentation and AS-BUILT policy: `docs/governance/PROJECT-DOCUMENTATION-AND-AS-BUILT.md`.

## Mandatory authority chain

Before repository work—including exploration, design, Sandbox, implementation, PR work, review, remediation, communication, incident response, documentation, AS-BUILT preparation, verification, or closeout—read in this order:

1. `Agent.md`
2. `docs/governance/REPOSITORY-AUTHORITY.md`
3. `docs/governance/AGENT-TEAM.md`
4. `docs/governance/PROJECT-DOCUMENTATION-AND-AS-BUILT.md`
5. `docs/ops/ai/SHARED-AGENT-RULES.md`
6. `docs/ops/ai/CORE-RULES.md`
7. Applicable tool-specific pointer:
   - `docs/ops/ai/CHATGPT-RULES.md`
   - `docs/ops/ai/CURSOR-RULES.md`
   - `docs/ops/ai/CODEX-RULES.md`
   - `docs/ops/ai/COPILOT-RULES.md`
   - `docs/ops/ai/DEVIN-RULES.md`
8. Applicable domain policy and reference contracts
9. Source GitHub Issue
10. Task-linked requirements, design, plan, procedure, template, AS-BUILT, and skill files

Prompts, comments, external notifications, and agent memory do not override this chain.

## Current LGFC role model

- Bill: Product and Production Authority.
- ChatGPT / Atlas: PMO / Engineering, portfolio preparation, sequencing, assignment, governance, independent-review coordination, reconciliation, verification, and closeout control.
- Cursor and Claude: implementers. They implement from explicit source-Issue authority and may not self-approve or self-merge.
- A post-merge exception is assigned immediately to the implementer of the PR where the exception occurred. PMO records, routes, independently reviews, verifies, and closes the exception.

Current member mapping remains controlled by `docs/governance/AGENT-TEAM.md`.

## Identify role, lane, profile, and documentation obligation

Before action, determine:

```text
Durable role:
Horizontal lane:
Promotion profile:
Source Issue:
Documentation inventory:
AS-BUILT path:
Operational hold:
```

Work must stop before implementation if the source Issue lacks an exact scope/file boundary, required documentation inventory, named AS-BUILT path, acceptance criteria, validation, rollback, or stop conditions appropriate to the task.

## Lane topology and promotion profiles

Horizontal lanes:

- PMO / Engineering
- Implementation / Operations
- Day-2 Operations

Vertical lane:

- Administration & Communications

Promotion profiles:

```text
optional Sandbox -> Development -> Promotion Candidate -> Production -> Day-2 Operations
```

Development cannot move directly to Production. Production promotion, documentation completion, and closeout are separate gates; none may be inferred from another.

Canonical contract: `docs/reference/operations/operating-lanes-and-promotion-profiles.md`.

## Task-scoped read order

| Task | Required authority |
| --- | --- |
| Role or approval question | `docs/governance/AGENT-TEAM.md`; `docs/reference/agents/implementation-authority-contract.md` |
| Product, UX, route, page, or design decision | `docs/governance/PRODUCT-AND-DESIGN.md`; applicable controlled specifications under `docs/reference/design/**` |
| PMO intake, sizing, Sandbox, launch, or closeout | `docs/governance/PMO-PORTFOLIO.md`; `docs/governance/PROJECT-DOCUMENTATION-AND-AS-BUILT.md` |
| Development, Promotion Candidate, Production, rollback | `docs/governance/DELIVERY-AND-RELEASE.md`; `docs/how-to/operations/run-work-through-promotion-profiles.md` |
| Platform, environment, Cloudflare, D1, B2, binding, credential, or migration boundary | `docs/governance/PLATFORM-AND-ENVIRONMENT.md`; applicable controlled specifications under `docs/reference/platform/**` |
| CI checks, validation evidence, promotion criteria, failure routing, or post-merge verification | `docs/governance/CI-AND-VERIFICATION.md`; applicable controlled references under `docs/reference/ci/**` |
| Communication, routing, labels, hold/resume, reporting, or closeout | `docs/governance/ADMINISTRATION-AND-COMMUNICATIONS.md`; `docs/reference/operations/administrative-control-lane-contract.md` |
| Production health, incidents, runner host, recovery | `docs/governance/OPERATIONS-AND-RECOVERY.md` |
| Documentation architecture or DIATAXIS | `docs/governance/PROJECT-DOCUMENTATION-AND-AS-BUILT.md`; `.agents/skills/lgfc-docs-authority/SKILL.md` |
| AS-BUILT preparation or project closeout | `docs/templates/as-built-template.md`; `.agents/skills/lgfc-verification-closeout/SKILL.md`; project source Issue |
| PR work | `.agents/skills/lgfc-pr-governance/SKILL.md`; `.github/pull_request_template.md`; `docs/how-to/cursor/open-task-pr.md`; `docs/governance/PR_PROCESS.md`; `docs/governance/PR_LIFECYCLE_STATE_MACHINE.md` |
| Model A/B execution | `docs/how-to/agents/run-model-a.md` or `docs/how-to/agents/run-model-b.md` |

## Mandatory project documentation lifecycle

Every project must disposition and maintain all applicable documentation classes:

- requirements and decisions;
- design;
- implementation plan;
- tutorial;
- how-to;
- reference;
- explanation;
- governance and PMO authority;
- operations, rollback, recovery, and monitoring;
- AS-BUILT;
- final verification and closeout evidence.

Use `docs/templates/project-master-issue-template.md` for project preparation and `docs/templates/as-built-template.md` for final implemented-state documentation.

A DIATAXIS quadrant may be marked not applicable only with an explicit justification in the source Issue and AS-BUILT record. Silence is noncompliance.

## Closeout gate

Before any project Issue is closed, PMO / Engineering must independently verify:

- all child tasks have a terminal disposition;
- implementation is integrated into the authorized target;
- required Production promotion and post-merge verification are complete;
- the AS-BUILT record exists and matches the final implementation;
- every affected plan, design, tutorial, how-to, reference, explanation, governance, PMO, queue, dashboard, dependency, operations, and role document is current;
- intermediate reports are marked historical or superseded where necessary;
- GitHub parent/child Issue bodies, labels, links, and states match repository truth;
- deferred work has separate source authority;
- final closeout evidence is merged;
- repository search does not expose stale current-authority statements.

Any failed condition means:

```text
CLOSEOUT BLOCKED — DOCUMENTATION INCOMPLETE
```

Completion percentage, merged code, closed child Issues, or a closeout comment cannot override this gate.

## Cursor runtime boundary

LGFC implementation defaults to local Cursor unless the source Issue explicitly authorizes another runtime. Claude may implement only when explicitly assigned by PMO/Product Authority.

Every assignment declares runtime and implementer. Labels and comments are routing evidence; they do not prove execution is active.

Canonical Cursor runtime policy: `docs/governance/standards/CURSOR-RUNTIME-ROUTING.md`.

## Communication routing

The minimum correction path is:

```text
PROBLEM FOUND
  -> route to the role that made the controlling decision
  -> GUIDANCE or ADJUSTMENT
  -> Administration & Communications records
  -> RESUME
```

For post-merge exceptions:

```text
POST-MERGE EXCEPTION
  -> assign to originating PR implementer
  -> implement bounded remediation
  -> independent review
  -> post-merge verification
  -> PMO closeout
```

Use `PLAN CHANGE REQUIRED` only for a material change to product outcome, architecture, acceptance criteria, dependencies, delivery model, promotion path, Production boundary, or recovery strategy.

## Startup orientation

When Product Authority says `run startup`, ChatGPT performs orientation only and stops. Startup does not authorize queue audit, inferred next work, implementation resume, documentation remediation, administrative reconciliation, or GitHub mutation.

## Repository skills and templates

- PR governance: `.agents/skills/lgfc-pr-governance/SKILL.md`
- Design compliance: `.agents/skills/lgfc-design-compliance/SKILL.md`
- Documentation authority: `.agents/skills/lgfc-docs-authority/SKILL.md`
- Cloudflare/static export: `.agents/skills/lgfc-cloudflare-static-export/SKILL.md`
- Verification/closeout: `.agents/skills/lgfc-verification-closeout/SKILL.md`
- Assignment envelope: `docs/templates/agent-assignment-template.md`
- Project master Issue: `docs/templates/project-master-issue-template.md`
- AS-BUILT: `docs/templates/as-built-template.md`

## Stop conditions

Stop the affected scope and route the problem when:

- canonical authority conflicts;
- required source Issue or role authority is missing;
- documentation inventory or AS-BUILT path is absent;
- a protected product, design, credential, Production, privacy, legal, cost, or destructive boundary is unresolved;
- required validation or independent approval is missing or failed;
- a mandatory promotion profile is being skipped;
- documentation is missing, stale, contradictory, deferred, or unmerged;
- evidence shows the approved plan cannot satisfy acceptance without material change.

Documentation defects are not reporting lag. They block the affected completion or closeout claim.

## Final routing

- Constitution: `docs/governance/REPOSITORY-AUTHORITY.md`
- Roles: `docs/governance/AGENT-TEAM.md`
- Project documentation and AS-BUILT: `docs/governance/PROJECT-DOCUMENTATION-AND-AS-BUILT.md`
- Product and Design: `docs/governance/PRODUCT-AND-DESIGN.md`
- PMO: `docs/governance/PMO-PORTFOLIO.md`
- Delivery: `docs/governance/DELIVERY-AND-RELEASE.md`
- Platform and Environment: `docs/governance/PLATFORM-AND-ENVIRONMENT.md`
- CI and Verification: `docs/governance/CI-AND-VERIFICATION.md`
- Administration & Communications: `docs/governance/ADMINISTRATION-AND-COMMUNICATIONS.md`
- Day-2 Operations: `docs/governance/OPERATIONS-AND-RECOVERY.md`
- Lane/profile reference: `docs/reference/operations/operating-lanes-and-promotion-profiles.md`
- Shared execution detail: `docs/ops/ai/CORE-RULES.md`

Legacy instructions must not be cited when they conflict with these canonical sources.
