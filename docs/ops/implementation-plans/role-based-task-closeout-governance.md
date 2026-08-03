---
Doc Type: Operations
Audience: Human + AI
Authority Level: Operational Authority
Owns: Implementation sequence for role-based task closeout governance under Issue #2700
Does Not Own: Constitution, closeout policy, agent team mapping, workflow implementation, or Production authority
Canonical Reference: /docs/governance/ADMINISTRATION-AND-COMMUNICATIONS.md
Related Issues: #2700
Last Reviewed: 2026-07-21
---

# Role-Based Task Closeout Governance Implementation Plan

> **For agentic workers:** Execute this plan task-by-task. Preserve the constitution, use durable roles in canonical policy, and keep current agent mappings isolated in `docs/governance/AGENT-TEAM.md`.

**Goal:** Delegate eligible project-child and child-remediation closeout to the assigned Implementation / Operations role holder while reserving independent project/master audit and closure to the applicable PMO / Engineering, PR Approver / Engineering, and Administration & Communications roles.

**Architecture:** The constitution remains unchanged. Domain policy defines the delegation boundary, controlled contracts define the executor matrix and evidence invariants, procedures define the child-closeout sequence, and the assignment template declares Issue class and closeout delegation. Named agents appear only in the current team mapping or compatibility adapters.

**Tech Stack:** Markdown governance documents, GitHub Issues and PRs, repository documentation validation scripts.

## Global Constraints

- Source authority is Issue #2700.
- Do not amend `docs/governance/REPOSITORY-AUTHORITY.md`.
- Do not weaken independent review, merge authority, Promotion Candidate, Production, or incident controls.
- Deterministic CI remains the preferred task-closeout transaction executor.
- Named agents must not become permanent policy actors outside current mapping or compatibility documentation.
- No workflow or script implementation is included.

---

### Task 1: Update agent-team domain policy

**Files:**
- Modify: `docs/governance/AGENT-TEAM.md`

- [ ] Add delegated task-closeout authority to the durable Implementation / Operations role contract.
- [ ] Separate assigned task closeout from project/master, program, Promotion Candidate, Production, and incident closeout.
- [ ] Preserve the no-self-approval and no-self-merge rules.
- [ ] Keep current named-agent mappings only in the current team mapping section.

### Task 2: Update Administration & Communications policy and contract

**Files:**
- Modify: `docs/governance/ADMINISTRATION-AND-COMMUNICATIONS.md`
- Modify: `docs/reference/operations/administrative-control-lane-contract.md`

- [ ] Define delegated task closeout as bounded Administration & Communications authority.
- [ ] Add the canonical role-based closeout executor matrix.
- [ ] Define deterministic CI first and assigned Implementation / Operations fallback for eligible child work.
- [ ] Require independent aggregate verification for project/master closeout.
- [ ] Route ambiguous or failed evidence to a bounded closeout exception.

### Task 3: Update implementation authority and compatibility contract

**Files:**
- Modify: `docs/reference/agents/implementation-authority-contract.md`
- Modify: `docs/reference/pmo/lgfc-cursor-execution-contract.md`

- [ ] Rewrite role contracts around Product Authority, PMO / Engineering, Implementation / Operations, PR Approver / Engineering, Administration & Communications, Day-2 Operations, and Deterministic CI.
- [ ] Permit assigned task closeout only after independent review or authorized integration and post-integration verification.
- [ ] Convert the Cursor-specific document into a current-member compatibility adapter that defers repository-wide authority to role policy.

### Task 4: Update closeout and Model B procedures

**Files:**
- Modify: `docs/ops/pmo/github-issue-closeout-protocol.md`
- Modify: `docs/how-to/agents/run-model-b.md`
- Modify: `docs/how-to/delivery/run-model-b-component-release.md`

- [ ] Add the task-closeout decision and transaction sequence.
- [ ] Add post-integration verification and eligible child closure to Model B child execution.
- [ ] Keep project/master, promotion, Production, and incident closure independent.
- [ ] Preserve existing protected-stop and component-red-state behavior.

### Task 5: Update assignment template

**Files:**
- Modify: `docs/templates/agent-assignment-template.md`

- [ ] Make the template executor-neutral and role-based.
- [ ] Add assigned role, current role holder, Issue class, parent/master, and task-closeout delegation fields.
- [ ] Require a closeout packet when delegation is enabled.
- [ ] Reserve project/master and higher-level closeout unless explicitly governed by the applicable policy.

### Task 6: Validate and review

**Files:**
- Review all modified files.

- [ ] Run `bash scripts/ci/docs_check_headers.sh`.
- [ ] Run `node scripts/ci/diataxis_folder_audit.mjs`.
- [ ] Run `node .agents/checks/agent-governance-check.mjs`.
- [ ] Search modified files for conflicting claims that named agents permanently own closeout authority.
- [ ] Confirm the PR does not modify constitution, workflows, scripts, application code, or repository settings.
