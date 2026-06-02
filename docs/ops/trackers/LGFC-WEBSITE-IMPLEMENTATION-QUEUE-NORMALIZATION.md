---
Doc Type: Operations
Audience: Human + AI
Authority Level: Operational Authority
Owns: Website implementation queue normalization, issue lifecycle map, implementation gap analysis
Does Not Own: Runtime implementation, production UI, CI/orchestration systems, design authority
Canonical Reference: /docs/ops/trackers/IMPLEMENTATION-WORKLIST_Master.md
Last Reviewed: 2026-05-28
---

# LGFC Website Implementation Queue Normalization

## Purpose

This tracker normalizes the LGFC website implementation issue queue against the
current repository design authority, implementation worklist, and as-built route
and API surfaces.

Repository state is authoritative. This document does not authorize runtime
implementation changes.

## Scope

- Website implementation issues under parent coordination issue #1053
- Worklist tracker alignment for T21–T50 and Phase 5 operational systems
- GitHub issue title, label, and lifecycle metadata normalization map
- Gap analysis against design authority and as-built routes/APIs

Does not cover runtime code changes, CI workflow edits, or legacy doc migration.

## Current known truth

- T21–T35 website core tasks are merged or closed in the worklist; T35 closed via #1114/#1115.
- T25 search implementation is merged on PR #1130 (issue #1108).
- T26 mobile navigation and responsive validation is merged on PR #1166 with post-merge backdrop layering fix PR #1178 (issue #1109).
- T28 Join/Login UX completion and auth-state validation is merged through PR #1149 plus invariant support PRs #1150, #1152, and #1155 (issue #1110).
- T29 D1/B2 integration verification is merged on PR #1169 (issue #1111).
- T40 Fan Club operational workflows is merged on PR #1171 (issue #1118).
- T41 admin operating shell and member operations is merged on PR #1174 (issue #1119).
- T42 moderation and review workflows is merged on PR #1176 (issue #1120).
- T43 is the current active content management task; T44–T50 remain backlog.
- Several older issues (#943, #946, #947, #1013–#1017) remain open with stale lifecycle labels despite worklist CLOSED status.
- Issue #1112 is assigned launch-readiness task **T50** (not T30).

## Intended final state (if evolving)

- One authoritative issue map with standard `[T##] Website — {scope} — Child #1053` titles
- Lifecycle labels match orchestrator serial-queue contract and accepted post-merge evidence
- Worklist and coverage map reflect T43 as the current implementation focus after T41/T42 closeout
- Phase 5 operational-system issues after T43 (#1122–#1127, #1112) remain `status:queued` until the serial queue authorizes each task

## Source Inputs

- `docs/ops/trackers/IMPLEMENTATION-WORKLIST_Master.md`
- `docs/reference/design/LGFC-Production-Design-and-Standards.md`
- `docs/reference/design/fanclub.md`
- `docs/reference/design/fanclub-home.md`
- `docs/explanation/lgfc-content-implementation-plan.md`
- `docs/how-to/ci/lgfc-ci-implementation-plan.md`
- `docs/explanation/ci/lgfc-ci-production-design.md`
- `docs/reference/lgfc-implementation-coverage-map.md`
- `active_tasklist.md`
- Current repository route/API inventory under `src/app/**` and `functions/api/**`
- Open GitHub website implementation issues under project issue #1053

## Queue Standards

Every active or queued website implementation issue must use:

- title format: `[T##] Website — {scope} — Child #1053`
- lifecycle label: exactly one current lifecycle label from the website lane
- ownership labels: `agent:cursor` and `owner:cursor`
- type labels: `orchestrator`, `type:website`, and `website`
- parent reference: `#1053 PROJECT: LGFC Website Implementation Coordination`
- scope boundary: explicit route/API/component scope
- acceptance criteria: checkbox list with deterministic completion checks
- validation: repository checks plus targeted route/manual validation

Lifecycle labels:

- `status:active` for the single Cursor task currently authorized for execution
- `status:queued` for backlog tasks authorized by the worklist but not yet the active serial-queue head
- `status:pr-draft` only when a task is the current authorized Cursor implementation head and a PR is being drafted
- `status:post-merge-verify` for merged tasks awaiting post-merge validation
- `status:complete` only after post-merge validation has been accepted
- `status:blocked` for later generated orchestrator tasks waiting behind the active pipeline (serial queue), and additionally when a named non-queue dependency prevents execution

## Audit Findings

| Finding | Evidence | Normalization |
|---|---|---|
| Completed implementation issues remain open with inconsistent lifecycle state | #943, #946, #947, #1013, #1014, #1015, #1016, #1017 are represented as completed in the worklist but still carry mixed open-issue lifecycle labels | Keep traceability; normalize to post-merge verification or completion state according to accepted verification record |
| Future website issues were marked active while a single serial-queue head should be authorized | #1108–#1112 were open with overlapping active-style labels | Hold non-head backlog at `status:queued` (or orchestrator `status:blocked` per serial generation); only the current head may use `status:pr-draft` / active implementation labels |
| Duplicate task number exists | #1112 used `[T30]`, while T30 is already FanClub shell issue #1013 and is merged | Rename #1112 to launch-readiness task after the operational implementation sequence |
| Several future issues lacked the full standard label set | #1108 through #1112 omitted some of `orchestrator`, `type:website`, `agent:cursor`, or `owner:cursor` | Apply full website queue label set |
| Fan Club operational systems were underrepresented | Repository has `/fanclub/photo`, `/fanclub/submit`, `/fanclub/chat`, and Fan Club APIs not fully represented after T35 | Add queued Fan Club operations task |
| Admin operational systems were underrepresented | Repository has admin dashboard, join requests, stats, worklist, export, and admin layout surfaces | Add queued admin operations task |
| Moderation/review workflows were underrepresented | Repository has `/admin/moderation`, reports APIs, FAQ/ask approval flows | Add queued moderation/review task |
| Content management and editorial archive workflows were split across partial surfaces | Repository has `/admin/cms`, `/admin/content`, content APIs, library submission, and content-inventory docs | Add queued CMS and editorial/archive tasks |
| Media management was underrepresented | Repository has `/admin/media-assets`, B2 sync API, photo APIs, and B2-dependent rendering | Add queued media management task |
| Calendar, charity, matchup, audit/reporting administration were not fully represented as implementation tasks | Repository has admin events, fundraiser preview, matchup APIs, stats/export/report APIs | Add queued operational admin tasks for each system |

## Normalized Existing Issue Map

| Task | Issue | Lifecycle | Required title |
|---|---:|---|---|
| T21 FAQ page functionality | #943 | post-merge verify or complete | `[T21] Website — FAQ page functionality — Child #1053` |
| T22 Ask-a-question intake | #946 | post-merge verify or complete | `[T22] Website — Ask-a-question intake — Child #1053` |
| T23 FAQ CMS moderation | #1053 trace / PR #1072 | complete | `[T23] Website — FAQ CMS moderation — Child #1053` |
| T23-E Events page | #947 | post-merge verify or complete | `[T23-E] Website — Events page — Child #1053` |
| T25 Search experience completion and validation | #1108 | complete (PR #1130) | `[T25] Website — Search experience completion and validation — Child #1053` |
| T26 Mobile navigation and responsive validation suite | #1109 | complete (PR #1166, follow-up #1178) | `[T26] Website — Mobile navigation and responsive validation suite — Child #1053` |
| T28 Join/Login UX completion and auth-state validation | #1110 | post-merge verify or complete (PRs #1149, #1150, #1152, #1155) | `[T28] Website — Join/Login UX completion and auth-state validation — Child #1053` |
| T29 D1/B2 integration verification and fail-closed testing | #1111 | complete (PR #1169) | `[T29] Website — D1/B2 integration verification and fail-closed testing — Child #1053` |
| T30 FanClub shell and authenticated navigation | #1013 | post-merge verify or complete | `[T30] Website — FanClub shell and authenticated navigation — Child #1053` |
| T31 FanClub profile and member card pages | #1014 | post-merge verify or complete | `[T31] Website — FanClub profile and member card pages — Child #1053` |
| T32 FanClub library and memorabilia pages | #1015 | post-merge verify or complete | `[T32] Website — FanClub library and memorabilia pages — Child #1053` |
| T33 Social Wall production integration | #1016 | post-merge verify or complete | `[T33] Website — Social Wall production integration — Child #1053` |
| T34 Homepage dynamic D1 content wiring | #1017 | post-merge verify or complete | `[T34] Website — Homepage dynamic D1 content wiring — Child #1053` |
| T35 FanClub home composition pass | #1113 | complete | `[T35] Website — FanClub home composition pass — Child #1053` |
| T50 Launch readiness QA and production validation suite | #1112 | queued | `[T50] Website — Launch readiness QA and production validation suite — Child #1053` |

## Expanded Implementation Roadmap

The remaining implementation queue must include these operational systems before
launch readiness can be treated as complete.

| Task | Issue | System | Scope | Lifecycle |
|---|---:|---|---|---|
| T40 | #1118 | Fan Club operational workflows | `/fanclub/photo`, `/fanclub/submit`, `/fanclub/chat`, Fan Club APIs | complete (PR #1171) |
| T41 | #1119 | Admin operating shell and member operations | `/admin`, `/admin/join-requests`, stats/worklist/member operations | complete (PR #1174) |
| T42 | #1120 | Moderation and review workflows | `/admin/moderation`, reports APIs, ask/FAQ moderation transitions | complete (PR #1176) |
| T43 | #1121 | Content management workflows | `/admin/cms`, `/admin/content`, content publish/save APIs | active |
| T44 | #1122 | Media management workflows | `/admin/media-assets`, B2 sync, photo/media APIs | queued |
| T45 | #1123 | Editorial/archive systems | content inventory, library submissions, archive publication and review state | queued |
| T46 | #1124 | Event/calendar administration | `/admin/events`, event create/update/seed APIs, public event read paths | queued |
| T47 | #1125 | Charity/fundraiser administration | `/admin/fundraiser-preview`, campaign spotlight/fundraiser data operations | queued |
| T48 | #1126 | Matchup administration | matchup current/vote/results APIs and weekly operational rotation controls | queued |
| T49 | #1127 | Audit/reporting systems | reports create/list/close APIs, admin export/stats, operational evidence | queued |
| T50 | #1112 | Launch readiness QA and production validation suite | cross-route QA, responsive validation, D1/B2 failure checks, launch report | queued |

## Gap Analysis

### Covered by merged or closed work

- FAQ page and Ask intake
- FAQ CMS moderation
- public Events page
- FanClub shell, profile, member card, library, and memorabilia pages
- Social Wall production integration
- homepage dynamic D1 sections
- T35 FanClub home composition pass (#1114)
- T29 D1/B2 fail-closed verification (#1169)
- T40 Fan Club operational workflows (#1171)
- T41 Admin operating shell and member operations (#1174)
- T42 Moderation and review workflows (#1176)

### Remaining public-core gaps

- None currently tracked before launch-readiness validation

### Remaining Fan Club gaps

- None currently tracked before launch-readiness validation

### Remaining Admin and Operations gaps

- content CMS publishing workflow
- media asset/B2 operational workflow
- archive/editorial workflow state model
- event/calendar administration
- charity/fundraiser administration
- weekly matchup administration
- audit/reporting/export operations

## Issue Lifecycle Actions Required

Apply these GitHub issue metadata changes before or with the normalization PR:

- #1108: transition from implementation lifecycle labels to `status:complete` after accepted post-merge evidence for PR #1130
- #1109: transition from implementation lifecycle labels to `status:post-merge-verify` or `status:complete` after accepted post-merge evidence for PR #1166
- #1110: transition from implementation lifecycle labels to `status:post-merge-verify` or `status:complete` after accepted post-merge evidence for PRs #1149, #1150, #1152, and #1155
- #1111: transition from implementation lifecycle labels to `status:complete` after accepted post-merge evidence for PR #1169
- #1112: full website label set; title `[T50] Website — Launch readiness QA and production validation suite — Child #1053`; lifecycle `status:queued`
- #1113: close or mark `status:complete` after accepted T35 post-merge evidence
- #1118: transition from implementation lifecycle labels to `status:complete` after accepted post-merge evidence for PR #1171
- #1119: transition from implementation lifecycle labels to `status:complete` after accepted post-merge evidence for PR #1174
- #1120: transition from implementation lifecycle labels to `status:complete` after accepted post-merge evidence for PR #1176
- #1121: current serial-queue implementation head (`status:pr-draft` or review-state labels per automation)
- #1122–#1127: operational-system child issues under #1053; lifecycle `status:queued` until authorized by serial queue
- #943, #946, #947, #1013, #1014, #1015, #1016, #1017: remove stale blocked/queued labels where present; retain post-merge verification or completion status according to accepted post-merge evidence
- #1053: update the master coordination body with this normalized issue map

## Governance Constraints

- Do not implement website runtime changes in queue normalization PRs.
- Do not modify production UI.
- Do not modify CI or orchestration systems.
- Do not migrate legacy docs as part of this queue normalization.
- Do not close valid active implementation issues.
- Future implementation issues must remain one task per Cursor run.
