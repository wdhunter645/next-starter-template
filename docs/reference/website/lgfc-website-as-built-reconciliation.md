---
Doc Type: Reference
Audience: Human + AI
Authority Level: Controlled
Owns: LGFC website Phase 1 as-built reconciliation, design-vs-shipped variances, tracker non-authority guidance, and Program 2 website follow-up slugs
Does Not Own: Runtime implementation code, GitHub issue state changes, or #1255 program execution
Canonical Reference: /docs/reference/design/LGFC-Production-Design-and-Standards.md
Related Issues: #1341, #1255, #1053, #1335
Last Reviewed: 2026-06-05
---

# LGFC Website As-Built Reconciliation

## Purpose

Record Phase 1 website delivery as built on `main` as of 2026-06-05 for Program 1
Task 003 (`#1341`). This reference separates **design authority** from **shipped
behavior**, documents merged implementation evidence, retires stale tracker queue
claims as ops authority, and lists Program 2 follow-up work under `#1255`.

## Scope

This document owns:

- Design authority vs shipped-behavior reconciliation for public, FanClub, and admin
  surfaces documented in production design standards
- Phase 1 website task disposition for T25–T50 where evidenced in authorized trackers
  and GitHub merge history
- Tracker non-authority guidance for ops decisions
- Recommended Program 2 variance slugs

This document does not own:

- Website feature implementation (deferred to Program 2 under `#1255`)
- GitHub issue closure or label changes (post-merge governance only)
- CI redesign closeout (see `docs/reference/ci/lgfc-ci-as-built-reconciliation.md`)

## Current Known Truth

Assessment date: **2026-06-05** (Program 1 Task 003 documentation pass).

| Source | Role |
|---|---|
| Design authority | `docs/reference/design/LGFC-Production-Design-and-Standards.md` |
| Website program umbrella | `#1255` — Website Implementation and Content Operations |
| Legacy coordination tree | `#1053` — LGFC Website Implementation Coordination (T21–T50 serial queue) |
| Program 1 plan | `docs/ops/implementation-plans/program-1-phase1-wrapup-rollout.md` Task 003 |
| Prior tracker snapshots | `LGFC-WEBSITE-IMPLEMENTATION-QUEUE-NORMALIZATION.md`, `lgfc-implementation-coverage-map.md` — **stale for ops queue state** |

Program owner baseline (Program 1 plan): website Phase 1 implementation is
**largely merged on `main`**. Tracker files may still show outdated active-queue
heads (for example T43 active, T44–T50 backlog) and must not be treated as the
sole ops reference.

GitHub issue state and merged PR evidence supersede tracker queue status when they
conflict.

## Intended Final State

- Agents and operators use this reconciliation doc plus GitHub issues/PRs for
  website as-built truth.
- Stale trackers remain readable for history but carry explicit **non-authoritative
  for ops decisions** banners pointing here.
- Remaining website work is tracked under `#1255` child projects after Program 1
  Task 008 launch gate—not by reviving stale `#1053` queue rows alone.
- Variances vs design standards are either accepted on `main` with evidence or
  deferred to named Program 2 issues.

## Design Authority vs Shipped Behavior

Primary design authority:
`docs/reference/design/LGFC-Production-Design-and-Standards.md`

If any implementation conflicts with that document, **the design standards document
wins** unless an explicit, merged variance is recorded here with evidence.

### Runtime platform

| Design rule | As-built expectation on `main` | Notes |
|---|---|---|
| Cloudflare Pages + Pages Functions | Next.js static export + `functions/api/**` | Not pure static-only for auth/CMS/member flows |
| Canonical public routes | `/`, `/about`, `/contact`, `/terms`, `/privacy`, `/search`, `/join`, `/logout`, `/faq`, `/ask`, `/health` | Verify against `src/app/**` during implementation reviews |
| FanClub auth-gated routes | `/fanclub/**` redirect unauthenticated users to `/` | T30–T35, T40 merged evidence |
| Legacy `/login`, `/auth` | Redirect to `/` and `/join` respectively | T28 auth UX merge evidence |
| Public header button sets (logged out / logged in) | Join/Search/Store/Login vs Club Home/Search/Store/Logout | T26 mobile + T28 auth-state validation |
| Homepage section order | Defined in production design standards | T34/T35 D1 wiring and composition merges |

This Task 003 pass records reconciliation **from merged PR/issue evidence and
design authority** without modifying application code. Route-level verification
remains a Program 2 QA concern under `#1259` when authorized.

### Known variance themes (defer detail to Program 2)

| Theme | Disposition |
|---|---|
| Content strategy / editorial inventory (#1256) | Program 2 priority; not closed by Phase 1 core T-task merges alone |
| CMS/content workflows (T43) | Active implementation track under `#1121` at documentation time |
| Operational admin backlog T44–T49 | Queued under `#1122`–`#1127` |
| Launch readiness (T50) | Queued under `#1112` |
| Stale open legacy issues (#943, #946, #947, #1013–#1017) | Require disposition comments; worklist may show CLOSED while GitHub remains open |

## Phase 1 Delivery Evidence

Disposition sources: `#1341`, Program 1 Task 003 acceptance criteria,
`LGFC-WEBSITE-IMPLEMENTATION-QUEUE-NORMALIZATION.md`, and
`lgfc-implementation-coverage-map.md` cross-checked against merge references.

| Task | issue | Status on `main` | Primary merge evidence |
|---|---:|---|---|
| T25 Search | #1108 | Complete | PR #1130 |
| T26 Mobile navigation | #1109 | Complete | PR #1166; post-merge fix PR #1178 |
| T28 Join/Login UX | #1110 | Complete | PRs #1149, #1150, #1152, #1155 |
| T29 D1/B2 fail-closed validation | #1111 | Complete | PR #1169 |
| T30 FanClub shell | #1013 | Merged (verify post-merge labels) | Prior Phase 1 website PR history |
| T31 Profile / member card | #1014 | Merged (verify post-merge labels) | Prior Phase 1 website PR history |
| T32 Library / memorabilia | #1015 | Merged (verify post-merge labels) | Prior Phase 1 website PR history |
| T33 Social Wall | #1016 | Merged (verify post-merge labels) | Prior Phase 1 website PR history |
| T34 Homepage D1 wiring | #1017 | Merged (verify post-merge labels) | PR #1101 (tracker closeout) |
| T35 FanClub home composition | #1113 | Complete | PR #1114 |
| T40 FanClub operational workflows | #1118 | Complete | PR #1171 |
| T41 Admin operating shell | #1119 | Complete | PR #1174 |
| T42 Moderation / review | #1120 | Complete | PR #1176 |
| T43 CMS / content management | #1121 | **Active** implementation head | In flight at documentation time |
| T44 Media management | #1122 | Queued | Program 2 serial queue |
| T45 Editorial / archive | #1123 | Queued | Program 2 serial queue |
| T46 Event / calendar admin | #1124 | Queued | Program 2 serial queue |
| T47 Charity / fundraiser admin | #1125 | Queued | Program 2 serial queue |
| T48 Matchup admin | #1126 | Queued | Program 2 serial queue |
| T49 Audit / reporting | #1127 | Queued | Program 2 serial queue |
| T50 Launch readiness | #1112 | Queued (T50; not T30) | Program 2 final validation |

T21–T23 website core tasks predate T25 in the `#1053` tree; several remain open on
GitHub with mixed lifecycle labels despite worklist CLOSED representations. Treat
GitHub + merge evidence as primary; use disposition batch under Program 2.

## Tracker Retirement / Non-Authority Notes

The following allowed tracker paths are **non-authoritative for ops decisions** as of
this reconciliation. They remain useful for history and gap analysis only.

| Path | Why non-authoritative | Use instead |
|---|---|---|
| `docs/ops/trackers/LGFC-WEBSITE-IMPLEMENTATION-QUEUE-NORMALIZATION.md` | Snapshot dated 2026-05-28; queue head/active labels may lag GitHub | This doc + GitHub `#1053` tree |
| `docs/reference/lgfc-implementation-coverage-map.md` | Coverage table may lag merged PR state | This doc + design authority |
| `docs/ops/trackers/THREAD-LOG_Master.md` | Append-only closeout history; not a queue authority | This doc for as-built truth |

Do not use tracker **ACTIVE** or **queued** rows alone to authorize new implementation
without confirming GitHub issue labels and `#1255` program plan precedence.

## Variances for Program 2

Recommended follow-up slugs (authorized only after Program 1 Task 008 launch gate):

| Variance / gap | Recommended Program 2 slug | Parent |
|---|---|---|
| T43 CMS/content workflows completion | `#1121` | `#1053` / `#1258` ops admin track |
| T44–T49 operational admin backlog | `#1122`–`#1127` serial queue | `#1053` |
| T50 launch readiness | `#1112` | `#1259` QA project |
| Content strategy / editorial inventory | `#1256` child project | `#1255` |
| Website QA / production validation | `#1259` child project | `#1255` |
| Stale open legacy issues (#943, #946, #947, #1013–#1017) | Website disposition batch under `#1255` Phase 0 reconciliation | `#1255` |
| Tracker/GitHub lifecycle drift | Normalize labels after accepted merge evidence | `#1053` maintenance |

**#1255** remains the website program umbrella. Program 1 Task 003 does not create
Program 2 implementation issues.

## Recommended Post-Merge Issue Disposition

GitHub issue state changes occur **after** Task 003 implementation PR merge and
post-merge verification, not during documentation authoring.

| issue | Recommended action after merge |
|---|---|
| `#1341` | Close as completed with link to this reconciliation doc |
| `#1255` | Keep open — website program umbrella |
| `#1053` | Keep open — legacy coordination tree; comment with pointer to this doc |
| `#1121` (T43) | Keep open if still active implementation |
| Stale legacy issues (#943, #946, #947, #1013–#1017) | Comment-only disposition batch when Atlas authorizes; do not bulk-close in Task 003 unless explicitly listed in merge closeout batch |

## Program 1 Task 003 — Website As-Built Closeout

| Field | Value |
|---|---|
| Program | Program 1 — Phase 1 Wrap-Up (`#1335`) |
| Task issue | `#1341` — Website As-Built Closeout |
| Closeout documentation date | 2026-06-05 |
| Parent website program | `#1255` |
| Prior Task dependency | Task 002 `#1340` complete (PR #1350) |

This section satisfies Program 1 Task 003 acceptance criteria. No application code
or workflow YAML changes are introduced in this task.

## Related Documents

| Document | Role |
|---|---|
| `docs/reference/ci/lgfc-ci-as-built-reconciliation.md` | CI closeout model (Task 002) |
| `docs/how-to/website/website-implementation-and-content-operations-plan.md` | `#1255` execution plan |
| `docs/ops/pmo/program-portfolio-worklist.md` | Program 1 serial queue |
| `docs/ops/pmo/github-issue-closeout-protocol.md` | Post-merge issue hygiene |
