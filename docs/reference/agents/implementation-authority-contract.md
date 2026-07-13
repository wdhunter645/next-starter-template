---
Doc Type: Reference
Audience: Human + AI
Authority Level: Controlled
Owns: Non-overlapping role contracts, protected-stop evidence flags, approval-profile mapping, and workflow invariants for agent execution
Does Not Own: Domain policy, launch authorization, workflow implementation, or merge mechanics
Canonical Reference: /docs/governance/AGENT-TEAM.md
Related Issues: #2494
Last Reviewed: 2026-07-13
---

# Implementation Authority Contract

This reference defines the evidence contract agents use before acting on implementation, review, approval, or escalation. Values align with delivery-profile stable metadata from `scripts/ci/delivery_profile.mjs`.

## Role contracts

| Role | May do | Must not do |
| --- | --- | --- |
| **Bill** | Design go/no-go; alternate PR approval; material-decision escalation; final completed-product review; prioritization | Routine implementation-loop gate after authorized Go; scoped file implementation when Cursor is assigned |
| **Chat** | Final design; documentation and issue authorship; implementation Go; primary PR review/approval; merge; verification; success declaration | Scoped repository implementation when Cursor is assigned unless source issue explicitly assigns Chat |
| **Cursor** | Scoped implementation; validation; remediation; pre-implementation package review comment; PR preparation toward ready-for-review | Self-approval; merge; gate authorization; scope definition; program/child issue authorship |
| **Codex** | — | LGFC implementation routing unless future Bill-approved reauthorization |

## Protected-stop flags

| Flag | Meaning |
| --- | --- |
| `materialDesignDecision` | Product, layout, architecture, or acceptance framing remains unresolved and affects scope |
| `authorityConflict` | Active canonical sources disagree without source-issue resolution |
| `unsafePreviewIsolation` | Preview or component path can mutate production without approved control |
| `credentialsCostBusinessAuth` | Secrets, billing, vendor, or business approval required but not recorded |
| `structuralDesignFailure` | Approved design cannot meet acceptance without replanning |
| `incompleteLaunchPackage` | Required launch-control field missing or Cursor checkpoint not recorded |
| `scopeOrAllowlistConflict` | Diff, issue, or assignment boundaries disagree |
| `requiredGateFailure` | Mandatory check on PR head is failing or incomplete |
| `blockingReviewThreads` | Unresolved human review threads block readiness per lifecycle rules |
| `explicitHoldInstruction` | Chat or Bill recorded hold or revise on the issue or PR |

Protected-stop flags require stop and escalation. Absence of all protected-stop flags during an authorized Model B child loop permits Cursor to continue routine implementation and correction.

## Approval profile mapping

| Delivery model | Implementation Go | PR review/approval | Merge | Verification / success |
| --- | --- | --- | --- | --- |
| **Model A** | Chat (Bill alternate) | Chat primary; Bill alternate | Chat primary; Bill alternate | Chat verifies; Bill final product review |
| **Model B child** | Chat (Bill alternate) | Chat primary for integration review; auto-integration when eligible | Component integration per delivery policy | Chat verifies component state; Bill not routine between Go and promotion package |
| **Model B promotion** | Chat (Bill alternate) | Chat primary; Bill alternate | Chat primary; Bill alternate | Chat verifies; Bill final product review |
| **Emergency recovery** | Bill + Chat per emergency policy | Emergency approval profile | Per emergency policy | Stabilization-first; follow-up mandatory |

## Workflow invariants

1. Exactly one primary source issue per normal PR.
2. Cursor never approves or merges its own assigned PR.
3. Chat is primary reviewer/approver; Bill is alternate, not a routine implementation-loop gate after Go.
4. Protected stops override continuous execution authority.
5. Identical evidence must produce identical stop/continue outcomes.
6. Launch-control package completeness is verified before implementation Go.
7. Model B child work does not require routine Bill approval between Go and final completed-product review.

## Decision examples

| Scenario | Implementation Go | Routine Bill stop during loop? | PR approval | Final product review |
| --- | --- | --- | --- | --- |
| Model A docs fix | Chat | No | Chat primary | Bill after Chat success |
| Model B child task (#2494 pattern) | Chat | No | Chat / auto-integration when eligible | Bill after promotion or program closeout |
| Material layout change mid-implementation | Stop — protected | Yes — escalation | Chat after redesign | Bill |
| Preview can write production DB | Stop — protected | Yes — escalation | Block until isolated | Bill |
| Missing allowlist on issue | Stop — incomplete package | N/A | N/A | N/A |
| Cursor opens own PR and approves | **Forbidden** | N/A | Chat or Bill only | Chat verifies |

## Executable fixture

No automated fixture ships in this child PR. Human review uses this table as authority when future agent-authority tests disagree; fix tests before merge.
