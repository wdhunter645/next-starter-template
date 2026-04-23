---
Doc Type: Design Authority
Audience: Human + AI
Authority Level: Canonical
Owns: LGFC orchestrator architecture, phase order, and required end-state behaviors
Does Not Own: UI redesign, website information architecture, or non-orchestrator implementation scope
Canonical Reference: /docs/reference/design/LGFC-Orchestrator-Setup-Design-Spec.md
Last Reviewed: 2026-04-23
---

# LGFC Orchestrator Setup — Design Spec

## 1. Objective
Implement the full LGFC Orchestrator system with staged delivery while preserving full approved architecture.

## 2. System Roles
- Copilot: coordinator
- Codex: repository builder
- Cursor: website builder
- GitHub Actions: orchestration state machine

## 3. Scope Boundary
Orchestrator automation only. No website redesign or unrelated platform scope.

## 4. Source of Truth
Issues, labels, and issue-thread comments are the authoritative orchestration state.

## 5. Required Execution Model
Serial execution: one builder, one Issue, one objective, one PR.

## 6. Queues
- Website queue (`type:website`, `builder:cursor`)
- Repository queue (`type:repository`, `builder:codex`)

## 7. Issue States
- `status:queued`
- `status:assigned`
- `status:in-progress`
- `status:pr-open`
- `status:validation`
- `status:blocked`
- `status:failed`
- `status:post-merge-verify`
- `status:complete`

## 8. Assignment Logic
Dispatch oldest eligible queued Issue, enforce serial constraints, assign builder by lane/type.

## 9. Required Issue Template
`.github/ISSUE_TEMPLATE/lgfc-task.yml` with mandatory objective/scope/contracts/validation/failure fields.

## 10. Required PR Contract
`.github/pull_request_template.md` must require linked Issue, scope statement, file touch summary, validation evidence, acceptance checklist, out-of-scope assertion, and post-merge verify notes.

## 11. Workflow Set Required
- `.github/workflows/tasklist_to_issue.yml`
- `.github/workflows/issue_dispatch.yml`
- `.github/workflows/pr_state_sync.yml`
- `.github/workflows/validation_gate.yml`
- `.github/workflows/post_merge_verify.yml`
- `.github/workflows/queue_advance.yml`

## 12. Comments Protocol
Issue thread must receive: assignment started, builder accepted, PR opened, validation pass/fail, merge complete, post-merge verify pass/fail, recovery Issue creation.

## 13. Builder Handoff Contract
Builder receives assigned Issue contract and must execute only within declared scope and allowlist.

## 14. Governance Rules
No scope redefinition, no out-of-scope edits, no mixed website/repository execution unless explicitly declared.

## 15. Minimum Repository Artifacts Required
Issue template, PR template, orchestration workflows, label definitions, and supporting docs/governance references.

## 16. Success Criteria
Labels and workflow-driven state transitions work end-to-end and remain visible via labels/comments.

## 17. Phase Order
1. Phase 1 Foundation
2. Phase 2 State Workflows
3. Phase 3 Queue Control
4. Phase 4 Builder Integration
5. Phase 5 Recovery Automation

## 18. First Implementation Target
Start repository-only orchestration bootstrap, but preserve compatibility with full final target state.

## 19. Final Design Decision
Implement phased delivery without reducing architecture to bootstrap-only.
