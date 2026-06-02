---
Doc Type: Reference
Audience: Human + AI
Authority Level: Informational Snapshot
Owns: Point-in-time inventory of open GitHub issues
Does Not Own: Issue state, project sequencing, tracker authority, implementation scope
Canonical Reference: /docs/ops/trackers/IMPLEMENTATION-WORKLIST_Master.md
Last Reviewed: 2026-06-02
---

# Open Issues Snapshot — 2026-06-02

This document records a point-in-time snapshot of open GitHub issues in
`wdhunter645/next-starter-template`.

GitHub Issues remain the system of record. This file is not an alternate tracker,
does not close or reopen work, and does not authorize implementation scope.

## Capture details

- Captured with: `gh issue list --state open --limit 300 --json number,title,labels,updatedAt,url`
- Open issues captured: 101
- Categorization is based on issue title and labels at capture time.

## Summary

| Category | Count |
|---|---:|
| Website implementation and post-merge verification | 23 |
| CI, orchestration, gates, and post-merge operations | 42 |
| Documentation, governance, and DIATAXIS | 24 |
| Other / uncategorized | 12 |

## Website implementation and post-merge verification

- [#1127](https://github.com/wdhunter645/next-starter-template/issues/1127) [T49] Website — Audit/reporting systems — Child #1053 — labels: orchestrator, type:website, agent:cursor, status:pr-draft, website, owner:cursor
- [#1126](https://github.com/wdhunter645/next-starter-template/issues/1126) [T48] Website — Matchup administration — Child #1053 — labels: orchestrator, type:website, agent:cursor, status:pr-draft, website, owner:cursor
- [#1125](https://github.com/wdhunter645/next-starter-template/issues/1125) [T47] Website — Charity/fundraiser administration — Child #1053 — labels: orchestrator, type:website, agent:cursor, status:pr-draft, website, owner:cursor
- [#1124](https://github.com/wdhunter645/next-starter-template/issues/1124) [T46] Website — Event/calendar administration — Child #1053 — labels: orchestrator, type:website, agent:cursor, status:pr-draft, website, owner:cursor
- [#1123](https://github.com/wdhunter645/next-starter-template/issues/1123) [T45] Website — Editorial/archive systems — Child #1053 — labels: orchestrator, type:website, agent:cursor, status:pr-draft, status:post-merge-verify, website, owner:cursor
- [#1122](https://github.com/wdhunter645/next-starter-template/issues/1122) [T44] Website — Media management workflows — Child #1053 — labels: orchestrator, type:website, agent:cursor, status:pr-draft, status:post-merge-verify, website, owner:cursor
- [#1120](https://github.com/wdhunter645/next-starter-template/issues/1120) [T42] Website — Moderation and review workflows — Child #1053 — labels: orchestrator, type:website, agent:cursor, status:pr-draft, status:post-merge-verify, website, owner:cursor
- [#1119](https://github.com/wdhunter645/next-starter-template/issues/1119) [T41] Website — Admin operating shell and member operations — Child #1053 — labels: orchestrator, type:website, agent:cursor, status:pr-draft, status:post-merge-verify, website, owner:cursor
- [#1118](https://github.com/wdhunter645/next-starter-template/issues/1118) [T40] Website — Fan Club operational workflows — Child #1053 — labels: orchestrator, type:website, agent:cursor, status:pr-draft, status:post-merge-verify, website, owner:cursor
- [#1112](https://github.com/wdhunter645/next-starter-template/issues/1112) [T50] Website — Launch readiness QA and production validation suite — Child #1053 — labels: orchestrator, type:website, agent:cursor, status:pr-draft, website, owner:cursor
- [#1111](https://github.com/wdhunter645/next-starter-template/issues/1111) [T29] Website — D1/B2 integration verification and fail-closed testing — Child #1053 — labels: orchestrator, type:website, agent:cursor, status:pr-draft, status:post-merge-verify, website, owner:cursor
- [#1110](https://github.com/wdhunter645/next-starter-template/issues/1110) [T28] Website — Join/Login UX completion and auth-state validation — Child #1053 — labels: orchestrator, type:website, agent:cursor, status:pr-draft, status:post-merge-verify, website, owner:cursor
- [#1109](https://github.com/wdhunter645/next-starter-template/issues/1109) [T26] Website — Mobile navigation and responsive validation suite — Child #1053 — labels: orchestrator, type:website, agent:cursor, status:pr-draft, status:post-merge-verify, website, owner:cursor
- [#1108](https://github.com/wdhunter645/next-starter-template/issues/1108) [T25] Website — Search experience completion and validation — Child #1053 — labels: orchestrator, type:website, agent:cursor, status:pr-draft, status:post-merge-verify, website, owner:cursor
- [#1053](https://github.com/wdhunter645/next-starter-template/issues/1053) PROJECT: LGFC Website Implementation Coordination — labels: orchestrator, type:website, status:post-merge-verify, status:active, website
- [#1017](https://github.com/wdhunter645/next-starter-template/issues/1017) [T34] Website — Homepage dynamic D1 content wiring — Child #1053 — labels: orchestrator, type:website, agent:cursor, status:post-merge-verify, website, owner:cursor
- [#1016](https://github.com/wdhunter645/next-starter-template/issues/1016) [T33] Website — Social Wall production integration — Child #1053 — labels: orchestrator, type:website, agent:cursor, status:post-merge-verify, website, owner:cursor
- [#1015](https://github.com/wdhunter645/next-starter-template/issues/1015) [T32] Website — FanClub library and memorabilia pages — Child #1053 — labels: orchestrator, type:website, agent:cursor, status:post-merge-verify, website, owner:cursor
- [#1014](https://github.com/wdhunter645/next-starter-template/issues/1014) [T31] Website — FanClub profile and member card pages — Child #1053 — labels: orchestrator, type:website, agent:cursor, status:post-merge-verify, website, owner:cursor
- [#1013](https://github.com/wdhunter645/next-starter-template/issues/1013) [T30] Website — FanClub shell and authenticated navigation — Child #1053 — labels: orchestrator, type:website, agent:cursor, status:post-merge-verify, website, owner:cursor
- [#947](https://github.com/wdhunter645/next-starter-template/issues/947) [T23-E] Website — Events page — Child #1053 — labels: orchestrator, type:website, agent:cursor, status:post-merge-verify, website, owner:cursor
- [#946](https://github.com/wdhunter645/next-starter-template/issues/946) [T22] Website — Ask-a-question intake — Child #1053 — labels: orchestrator, type:website, agent:cursor, status:post-merge-verify, website, owner:cursor
- [#943](https://github.com/wdhunter645/next-starter-template/issues/943) [T21] Website — FAQ page functionality — Child #1053 — labels: orchestrator, type:website, agent:cursor, status:post-merge-verify, website, owner:cursor

## CI, orchestration, gates, and post-merge operations

- [#1199](https://github.com/wdhunter645/next-starter-template/issues/1199) [Task-006] As-built Documentation Update — labels: orchestrator, agent:cursor, status:blocked, type:ci
- [#1198](https://github.com/wdhunter645/next-starter-template/issues/1198) [Task-005] OPS Runtime Consolidation — labels: orchestrator, agent:cursor, status:blocked, type:ci
- [#1197](https://github.com/wdhunter645/next-starter-template/issues/1197) [Task-004] Post-Merge Validation Expansion — labels: orchestrator, agent:cursor, status:blocked, type:ci
- [#1196](https://github.com/wdhunter645/next-starter-template/issues/1196) [Task-003] Reviewer Lifecycle Redesign — labels: orchestrator, agent:cursor, status:blocked, type:ci
- [#1195](https://github.com/wdhunter645/next-starter-template/issues/1195) [Task-002] Merge Protection Consolidation — labels: orchestrator, agent:cursor, status:blocked, type:ci
- [#1194](https://github.com/wdhunter645/next-starter-template/issues/1194) [Task-001] PR Hygiene Foundation — labels: orchestrator, agent:cursor, status:blocked, type:ci
- [#1170](https://github.com/wdhunter645/next-starter-template/issues/1170) REMEDIATION — Resolve PR #1166 post-merge review findings — labels: feature, status:post-merge-verify
- [#1116](https://github.com/wdhunter645/next-starter-template/issues/1116) CI remediation issue generation engine — Child #1075 — labels: governance, ci, workflow, status:post-merge-verify, status:active
- [#1104](https://github.com/wdhunter645/next-starter-template/issues/1104) Post-merge reviewer governance audit engine — Child #1075 — labels: governance, ci, workflow, status:post-merge-verify, status:active
- [#1102](https://github.com/wdhunter645/next-starter-template/issues/1102) CI governance normalization and intent-label stabilization — Child #1075 — labels: governance, ci, workflow, status:post-merge-verify, status:active
- [#1096](https://github.com/wdhunter645/next-starter-template/issues/1096) Implementation-plan task decomposition engine — Child #1075 — labels: governance, ci, workflow, status:post-merge-verify, status:active
- [#1089](https://github.com/wdhunter645/next-starter-template/issues/1089) CI orchestration paused — remediation required — labels: orchestrator, agent:cursor, status:failed, type:ci
- [#1088](https://github.com/wdhunter645/next-starter-template/issues/1088) [Task-006] As-built Documentation Update — labels: orchestrator, agent:cursor, status:blocked, type:ci
- [#1087](https://github.com/wdhunter645/next-starter-template/issues/1087) [Task-005] OPS Runtime Consolidation — labels: orchestrator, agent:cursor, status:blocked, type:ci
- [#1086](https://github.com/wdhunter645/next-starter-template/issues/1086) [Task-004] Post-Merge Validation Expansion — labels: orchestrator, agent:cursor, status:blocked, type:ci
- [#1085](https://github.com/wdhunter645/next-starter-template/issues/1085) [Task-003] Reviewer Lifecycle Redesign — labels: orchestrator, agent:cursor, status:blocked, type:ci
- [#1084](https://github.com/wdhunter645/next-starter-template/issues/1084) [Task-002] Merge Protection Consolidation — labels: orchestrator, agent:cursor, status:blocked, type:ci
- [#1083](https://github.com/wdhunter645/next-starter-template/issues/1083) [Task-001] PR Hygiene Foundation — labels: orchestrator, agent:cursor, status:blocked, type:ci
- [#1082](https://github.com/wdhunter645/next-starter-template/issues/1082) CI orchestration paused — remediation required — labels: orchestrator, agent:cursor, status:failed, type:ci
- [#1069](https://github.com/wdhunter645/next-starter-template/issues/1069) Reviewer-gate deterministic simulation infrastructure — Child #1075 — labels: governance, ci, enhancement
- [#1058](https://github.com/wdhunter645/next-starter-template/issues/1058) CI workflow normalization and consolidation — Child #1075 — labels: governance, ci, workflow, status:post-merge-verify, status:active
- [#1055](https://github.com/wdhunter645/next-starter-template/issues/1055) [CI][Governance] Stabilize PR gate checks and unblock passing PR validation — labels: governance, ci, workflow
- [#1051](https://github.com/wdhunter645/next-starter-template/issues/1051) Fix Reviewer Gate stale failures after PR body remediation — labels: none
- [#1048](https://github.com/wdhunter645/next-starter-template/issues/1048) Update PR template to require gate-ready operational state at opening — labels: none
- [#1038](https://github.com/wdhunter645/next-starter-template/issues/1038) Document PR gate-readiness operational truth hierarchy — labels: status:reference
- [#1036](https://github.com/wdhunter645/next-starter-template/issues/1036) Track AI reviewer-gate troubleshooting operational guidance — labels: none
- [#1011](https://github.com/wdhunter645/next-starter-template/issues/1011) Reviewer lifecycle redesign transition tracking — Child #1075 — labels: infra, ops
- [#1009](https://github.com/wdhunter645/next-starter-template/issues/1009) Post-merge reviewer audit parser verification — Child #1075 — labels: infra, ops, status:post-merge-verify
- [#1005](https://github.com/wdhunter645/next-starter-template/issues/1005) Add post-merge late reviewer audit to existing workflow — labels: codex
- [#1004](https://github.com/wdhunter645/next-starter-template/issues/1004) Add lightweight pre-merge reviewer response gate — labels: codex
- [#998](https://github.com/wdhunter645/next-starter-template/issues/998) Post-Merge Failure Detected — labels: none
- [#997](https://github.com/wdhunter645/next-starter-template/issues/997) Post-Merge Failure Detected — labels: none
- [#996](https://github.com/wdhunter645/next-starter-template/issues/996) Post-Merge Failure Detected — labels: none
- [#995](https://github.com/wdhunter645/next-starter-template/issues/995) Post-Merge Failure Detected — labels: none
- [#994](https://github.com/wdhunter645/next-starter-template/issues/994) Post-Merge Failure Detected — labels: none
- [#993](https://github.com/wdhunter645/next-starter-template/issues/993) Post-Merge Failure Detected — labels: none
- [#991](https://github.com/wdhunter645/next-starter-template/issues/991) [Ops Tracker] Build and validate post-merge PR validation workflow — labels: orchestrator, type:repository
- [#987](https://github.com/wdhunter645/next-starter-template/issues/987) [Ops] Add verbose audit logging to post-merge validation workflow — labels: orchestrator, type:repository, agent:codex
- [#981](https://github.com/wdhunter645/next-starter-template/issues/981) [Ops] Add orchestrator preflight duplicate detection before Issue/PR creation — labels: orchestrator, type:repository, agent:codex
- [#980](https://github.com/wdhunter645/next-starter-template/issues/980) Post-Merge Failure Detected — labels: none
- [#979](https://github.com/wdhunter645/next-starter-template/issues/979) Post-Merge Failure Detected — labels: none
- [#950](https://github.com/wdhunter645/next-starter-template/issues/950) Post-Merge Failure Detected — labels: none

## Documentation, governance, and DIATAXIS

- [#1191](https://github.com/wdhunter645/next-starter-template/issues/1191) Governance cleanup: retire manual tracker closeout and standardize Cursor-style PR preflight — labels: governance, documentation
- [#1187](https://github.com/wdhunter645/next-starter-template/issues/1187) Governance cleanup: retire manual tracker closeout and standardize Cursor-style PR preflight — labels: governance, status:post-merge-verify, documentation
- [#1163](https://github.com/wdhunter645/next-starter-template/issues/1163) Governance: scope PR template how-to acceptance criteria to changed files — labels: status:post-merge-verify
- [#1140](https://github.com/wdhunter645/next-starter-template/issues/1140) DOCS-1132-P3F — Legacy retirement design package — labels: none
- [#1139](https://github.com/wdhunter645/next-starter-template/issues/1139) DOCS-1132-P3E — DIATAXIS migration design package — labels: none
- [#1138](https://github.com/wdhunter645/next-starter-template/issues/1138) DOCS-1132-P3D — CI Orchestration System production design package — labels: status:post-merge-verify
- [#1137](https://github.com/wdhunter645/next-starter-template/issues/1137) DOCS-1132-P3C — Content Collection System production design package — labels: none
- [#1136](https://github.com/wdhunter645/next-starter-template/issues/1136) DOCS-1132-P3B — Admin System production design package — labels: none
- [#1135](https://github.com/wdhunter645/next-starter-template/issues/1135) DOCS-1132-P3A — Fan Club System production design package — labels: documentation
- [#1134](https://github.com/wdhunter645/next-starter-template/issues/1134) DOCS-1132-P2 — Documentation gap analysis and legacy-to-DIATAXIS migration matrix — labels: status:post-merge-verify
- [#1133](https://github.com/wdhunter645/next-starter-template/issues/1133) DOCS-1132-P1 — Documentation inventory, ownership map, and coverage matrix — labels: documentation
- [#1076](https://github.com/wdhunter645/next-starter-template/issues/1076) PROJECT: DIATAXIS legacy migration and authority transition program — labels: change-ops, status:active
- [#1054](https://github.com/wdhunter645/next-starter-template/issues/1054) PROJECT: LGFC Repository Governance & DIATAXIS Coordination — labels: status:post-merge-verify
- [#1039](https://github.com/wdhunter645/next-starter-template/issues/1039) PROJECT: DIATAXIS Continuous Curation & Documentation Governance Program — labels: none
- [#1033](https://github.com/wdhunter645/next-starter-template/issues/1033) [Governance] Final governance reconciliation audit — labels: governance, docs
- [#1031](https://github.com/wdhunter645/next-starter-template/issues/1031) [Governance] Migration backlog governance — labels: governance, docs
- [#1029](https://github.com/wdhunter645/next-starter-template/issues/1029) [Governance] Enforcement standard and CI strategy — labels: governance, docs
- [#1024](https://github.com/wdhunter645/next-starter-template/issues/1024) [Governance] Repository implementation coverage audit — labels: governance, docs
- [#1023](https://github.com/wdhunter645/next-starter-template/issues/1023) [Governance] Cross-reference normalization — labels: governance, docs
- [#1022](https://github.com/wdhunter645/next-starter-template/issues/1022) [Governance] Legacy document classification — labels: governance, docs
- [#1021](https://github.com/wdhunter645/next-starter-template/issues/1021) [Governance] Metadata normalization standard — labels: governance, docs
- [#1019](https://github.com/wdhunter645/next-starter-template/issues/1019) [Governance] Standardize repository-wide documentation authority and legacy migration — labels: governance, docs
- [#1008](https://github.com/wdhunter645/next-starter-template/issues/1008) Add repository-scoped agent governance skills — labels: codex
- [#824](https://github.com/wdhunter645/next-starter-template/issues/824) Content Strategy Design Review (Diataxis pre-PR validation) — labels: none

## Other / uncategorized

- [#1181](https://github.com/wdhunter645/next-starter-template/issues/1181) RECOVERY: PR 1179 tracker closeout damage control — labels: change-ops
- [#1164](https://github.com/wdhunter645/next-starter-template/issues/1164) Docs: add SKEETERSOFT project blueprint — labels: status:post-merge-verify
- [#1157](https://github.com/wdhunter645/next-starter-template/issues/1157) Add LGFC vendor architecture diagram asset — labels: change-ops, status:post-merge-verify
- [#1078](https://github.com/wdhunter645/next-starter-template/issues/1078) Canonical authority stabilization and inventory reconciliation — Child #1076 — labels: change-ops
- [#1075](https://github.com/wdhunter645/next-starter-template/issues/1075) PROJECT: CI-ORCH-01 — Implement LGFC CI orchestration engine — labels: change-ops, status:active
- [#1047](https://github.com/wdhunter645/next-starter-template/issues/1047) Update AI troubleshooting doctrine to require full data-surface review — labels: none
- [#1002](https://github.com/wdhunter645/next-starter-template/issues/1002) [Work][PR #1001] Ops: enforce Issue-first PR accounting — labels: work-accounting, needs-triage
- [#830](https://github.com/wdhunter645/next-starter-template/issues/830) LGFC Orchestrator — initial design setup — labels: none
- [#819](https://github.com/wdhunter645/next-starter-template/issues/819) Fix PR #815: content inventory docs rewrite — labels: none
- [#527](https://github.com/wdhunter645/next-starter-template/issues/527) Wrangler error in CF deploy log — labels: none
- [#524](https://github.com/wdhunter645/next-starter-template/issues/524) ⚠️ Unapproved change detected on main — labels: unapproved-main-change
- [#476](https://github.com/wdhunter645/next-starter-template/issues/476) Production Audit Failed (Playwright Invariants) — labels: change-ops
