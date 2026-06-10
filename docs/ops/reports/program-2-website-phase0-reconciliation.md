---
Doc Type: Operations
Audience: Human + AI
Authority Level: Controlled
Owns: Program 2 Website Phase 0 issue-queue reconciliation under #1255, issue-state drift register, and next child-project activation recommendation
Does Not Own: Website feature implementation, GitHub issue closure or label mutation, workflow YAML, application code, D1 migrations, or build-issue creation
Canonical Reference: /docs/how-to/website/website-implementation-and-content-operations-plan.md
Related Issues: #1394, #1255, #1256, #1258, #1259, #1053, #1341
Last Reviewed: 2026-06-10
---

# Program 2 Website Phase 0 Reconciliation

## Purpose

Reconcile website issue-state drift and remaining implementation gaps under the
`#1255` program umbrella after Program 2 launch-gate sign-off (Bill Hunter,
2026-06-06). This report makes the website queue **reliable for planning** before
any Program 2 website build issues are created.

## Boundary Statement

This task is **PMO reconciliation documentation only**.

- No website features are implemented
- No build or implementation issues are created
- No GitHub issues are closed or relabeled
- No application code, workflow YAML, D1/B2, or runtime configuration changes
- Disposition comments and label cleanup are **deferred** to Atlas/Bill-approved follow-up

## Assessment Baseline

| Field | Value |
|---|---|
| Source issue | `#1394` |
| Assessment date | **2026-06-06** |
| Launch gate | [`program-2-launch-gate.md`](program-2-launch-gate.md) — Bill sign-off effective |
| Program 1 as-built | [`lgfc-website-as-built-reconciliation.md`](../../reference/website/lgfc-website-as-built-reconciliation.md) (2026-06-05) |
| Execution plan | [`website-implementation-and-content-operations-plan.md`](../../how-to/website/website-implementation-and-content-operations-plan.md) |
| Legacy coordination tree | `#1053` (T21–T50 serial labels) |
| Automation backlog | [`program-1-automation-backlog.md`](program-1-automation-backlog.md) — **A-011** |

Evidence sources: GitHub issue/PR state captured 2026-06-06; merged-PR truth on
`main` supersedes tracker queue snapshots dated 2026-05-28 or earlier.

## Authority Hierarchy (Program 2)

```text
#1255 Website program umbrella
  ├── #1256 Content Strategy / Editorial Inventory  (priority 1 — next active)
  ├── #1258 Website Operations Admin               (priority 2 — queued)
  └── #1259 Website QA / Production Validation     (priority 3 — queued)

#1053 Legacy T-task coordination tree — subordinated; historical serial map only
Trackers (LGFC-WEBSITE-IMPLEMENTATION-QUEUE-NORMALIZATION.md, coverage map) — non-authoritative for ops queue
```

## 1. Website Program Umbrella — `#1255`

**Verdict: `#1255` remains the correct Website Program umbrella.**

| Check | Result |
|---|---|
| Issue state | Open |
| Body authority | Defines program master, portfolio priority (Content Strategy first), child projects |
| Plan alignment | Matches [`website-implementation-and-content-operations-plan.md`](../../how-to/website/website-implementation-and-content-operations-plan.md) |
| Launch gate | Listed as authorized Website completion child project |

**Drift noted (do not fix in this task):** `#1255` carries simultaneous
`status:active` and `status:post-merge-verify` labels. Treat as label conflict;
program authority is unchanged.

## 2. Child Project Masters — `#1256`, `#1258`, `#1259`

**Verdict: All three remain correct child project masters under `#1255`.**

| Issue | Title | State | Lifecycle label | Role | Status |
|---|---|---|---|---|---|
| `#1256` | Content Strategy / Editorial Inventory | Open | `status:active` | Priority 1 — dynamic content layer, editorial inventory | **Current — matches plan** |
| `#1258` | Website Operations Admin | Open | `status:queued` | Priority 2 — admin/ops workflows after `#1256` | **Current — queued correctly** |
| `#1259` | Website QA / Production Validation | Open | `status:queued` | Priority 3 — route/auth/mobile/launch validation | **Current — queued correctly** |

`#1258` body correctly references legacy admin issues `#1118`–`#1127` under `#1053`
for reconciliation into the ops-admin track. `#1259` references `#1112` (T50) for
launch validation.

## 3. Legacy Coordination Tree — `#1053`

**Verdict: Retain open; subordinate to `#1255` for Program 2 planning.**

`#1053` remains useful as the T21–T50 serial map and merge-evidence index. It must
**not** authorize new implementation alone when `#1255` child-project rules apply.

**Drift noted:** `#1053` also carries `status:active` + `status:post-merge-verify`
concurrently (same class of label conflict as `#1255`).

## 4. T43–T50 Work — Active, Queued, Merged, and Drift

Program 1 as-built (2026-06-05) recorded T43 as **active** and T44–T50 as **queued**.
Live GitHub + merge evidence as of **2026-06-06** shows substantial additional merges
(2026-06-02 through 2026-06-03) not reflected in tracker snapshots.

| Task | Issue | Tracker (2026-05-28) | GitHub state (2026-06-06) | Merge evidence on `main` | Reconciliation verdict |
|---|---:|---|---|---|---|
| T43 CMS / content | `#1121` | active | **Closed** | PR `#1186` merged 2026-06-02 | **Satisfied** — issue labels stale (`pr-draft`, `post-merge-verify`) |
| T44 Media admin | `#1122` | queued | Open | PR `#1188` merged 2026-06-02 | **Satisfied** — issue open; label cleanup candidate |
| T45 Editorial/archive | `#1123` | queued | **Closed** | PR `#1192` merged 2026-06-02 | **Satisfied** — closed; conflicting `pr-draft` label remains |
| T46 Event/calendar admin | `#1124` | queued | Open | PR `#1205` merged 2026-06-03 | **Satisfied** — issue open with `status:failed` + `pr-draft` (erroneous) |
| T47 Charity/fundraiser | `#1125` | queued | **Closed** | PR `#1211` merged 2026-06-03 | **Satisfied** — closed; `status:failed` label stale |
| T48 Matchup admin | `#1126` | queued | **Closed** | PR `#1212` merged 2026-06-03 | **Satisfied** — closed; label cleanup candidate |
| T49 Audit/reporting | `#1127` | queued | Open | PR `#1216` merged 2026-06-03 | **Satisfied** — issue open; `status:failed` stale |
| T50 Launch readiness | `#1112` | queued | **Closed** | PR `#1221` merged 2026-06-03; closeout `#1230`, `#1233` | **Merged with caveats** — see gap H-011 below |

**T43–T49 admin implementation:** Substantially **merged on `main`** via `#1053`
orchestrator issues. Remaining work is **queue hygiene and QA validation**, not
greenfield T44–T49 builds under the old serial head.

**T50 caveat:** Merge evidence exists, but Task 005/006 (**H-011**) records that
launch-readiness e2e is **not scheduled in CI**. `#1259` must treat production QA as
**ongoing validation**, not fully closed by `#1112` closure alone.

## 5. T21–T42 and Legacy FanClub Issues — Classification

| Task / scope | Issue | GitHub state | Primary merge evidence | Classification |
|---|---:|---|---|---|
| T21 FAQ page | `#943` | Open | PR `#1066` | **Already satisfied** — retain under `#1259` QA disposition; later closeout candidate |
| T22 Ask intake | `#946` | Open | PR `#1070` | **Already satisfied** — retain; disposition comment deferred |
| T23-E Events page | `#947` | Open | PR `#1091` | **Already satisfied** — retain; disposition comment deferred |
| T23 FAQ CMS moderation | (via `#1053` / `#1072`) | — | PR `#1072` | **Already satisfied** |
| T25 Search | `#1108` | Open | PR `#1130` | **Already satisfied** — label cleanup candidate |
| T26 Mobile nav | `#1109` | Open | PR `#1166`, `#1178` | **Already satisfied** |
| T28 Join/Login UX | `#1110` | Open | PRs `#1149`–`#1155` | **Already satisfied** |
| T29 D1/B2 fail-closed | `#1111` | Open | PR `#1169` | **Already satisfied** |
| T30 FanClub shell | `#1013` | Open | Phase 1 website PR history | **Already satisfied** — legacy open issue; disposition batch |
| T31 Profile / member card | `#1014` | Open | Phase 1 website PR history | **Already satisfied** — legacy open issue |
| T32 Library / memorabilia | `#1015` | Open | Phase 1 website PR history | **Already satisfied** — legacy open issue |
| T33 Social Wall | `#1016` | Open | Phase 1 website PR history | **Already satisfied** — legacy open issue |
| T34 Homepage D1 wiring | `#1017` | Open | PR `#1101` (tracker closeout) | **Already satisfied** — legacy open issue |
| T35 FanClub home | `#1113` | Closed | PR `#1114` | **Already satisfied** |
| T40 FanClub ops workflows | `#1118` | Open | PR `#1171` | **Already satisfied** — subordinate to `#1258` |
| T41 Admin shell | `#1119` | Open | PR `#1174` | **Already satisfied** — subordinate to `#1258` |
| T42 Moderation / review | `#1120` | Open | PR `#1176` | **Already satisfied** — subordinate to `#1258` |

**None of the above require new build issues for merged scope.** They require
**owner-approved disposition** (comments, then later closeout) per A-011.

## 6. Tracker Row Conflicts vs GitHub Evidence

| Tracker claim | Authoritative counter-evidence | Conflict |
|---|---|---|
| T43 **active** (`LGFC-WEBSITE-IMPLEMENTATION-QUEUE-NORMALIZATION.md`) | `#1121` closed; PR `#1186` merged | Tracker queue head is **stale** |
| T44–T49 **queued** (same tracker) | PRs `#1188`–`#1216` merged 2026-06-02/03 | Tracker backlog state is **stale** |
| T50 **queued** (same tracker) | `#1112` closed; PR `#1221` merged | Tracker launch row is **stale** |
| T21–T34 worklist **CLOSED** vs GitHub **open** + `post-merge-verify` | Merge evidence listed above | **Lifecycle drift** (H-006 / A-011) |
| `#1256` not reflected as active head in tracker | `#1256` has `status:active`; plan Phase 0 complete after this report | Tracker omits Program 2 child-project model |

**Rule:** Do not use tracker **active/queued** rows to pick the next implementation
task. Use `#1255` → `#1256` child-project plan after this reconciliation.

## 7. Issue Disposition Register (No Closures in This Task)

Classification key:

| Class | Meaning |
|---|---|
| **Satisfied** | Merged PR evidence on `main`; issue open/closed state or labels are stale |
| **Retained** | Keep open under named parent (`#1255`, `#1256`, `#1258`, `#1259`, or `#1053`) |
| **Subordinated** | Legacy `#1053` T-task retained for history; planning authority moves to `#1255` child |
| **Superseded (planning)** | Serial `#1053` queue superseded by `#1255` phased child projects for new work |
| **Later closeout** | Duplicate/obsolete **candidate** after Atlas disposition comment — **not closed here** |
| **Gap** | Real remaining work requiring future child issue under `#1256` / `#1258` / `#1259` |

Summary counts (website orchestrator issues reviewed):

| Class | Count | Action in this task |
|---|---:|---|
| Satisfied (merge evidence) | 28 | Document only |
| Retained (program/child masters) | 4 (`#1255`, `#1256`, `#1258`, `#1259`) | Document only |
| Subordinated | 1 (`#1053`) | Document only |
| Later closeout (label/disposition batch) | 20+ T-task issues with stale open state | **No bulk close** |
| Unresolved gaps (future child issues) | See §8 | **No build issues created** |

## 8. Remaining Implementation Gaps (Real Work — Not Built in Phase 0)

These are **genuine Program 2 gaps** after merge evidence is accounted for. Future
build issues must be created only under the named child project after its
implementation plan is approved — **not from this task**.

| Gap | Evidence | Route to child project |
|---|---|---|
| Content strategy / editorial inventory documentation and gap analysis | `#1256` purpose; plan Phase 1 docs package; merged T43/T45 admin surfaces need editorial model reconciliation | **`#1256`** (priority 1) |
| Content inventory implementation decomposition | Plan Phase 2 under `#1256`; avoid duplicating merged schema/API/admin from T43/T45 | **`#1256`** |
| Ops admin hardening and workflow completion review | T40–T49 merges exist; operational polish, B2/media edge cases, and admin UX may remain | **`#1258`** (after `#1256`) |
| Production QA, route validation, scheduled launch-readiness CI | H-011; `#1259` scope; T50 merged but CI scheduling gap remains | **`#1259`** |
| Issue/label lifecycle normalization | A-011 / H-006; 24+ open `type:website` issues with stale lifecycle labels | **`#1255` Phase 0 follow-up** (comments/labels — Atlas authorized) |

## 9. Next Authorized Website Child Project

**Recommendation: activate `#1256` — Content Strategy / Editorial Inventory.**

| Criterion | Assessment |
|---|---|
| `#1255` plan order | Phase 0 reconciliation → Phase 1 `#1256` documentation package |
| `#1256` lifecycle | `status:active` |
| Launch gate | Website completion authorized under `#1255` with Phase 0 reconciliation |
| `#1053` serial queue | **Not** the next authority — T43–T49 merges supersede old queued head |
| Build issues | **None created by `#1394`** — `#1256` plan/docs work precedes build issues |

`#1258` and `#1259` remain **queued** until `#1256` reaches plan approval or explicit
program-owner pause.

## 10. Explicit Non-Actions (This Task)

- No build or implementation issues created
- No GitHub issues closed or relabeled
- No application code, workflows, D1, or runtime changes
- No bulk closeout of satisfied T-task issues (deferred to Atlas/Bill disposition batch)

## 11. Recommended Follow-Up (Atlas / Bill — Out of Scope for `#1394`)

1. Post disposition comments on satisfied T-task issues linking merge PRs (A-011 batch).
2. Normalize conflicting lifecycle labels (`status:failed` + `status:complete`, etc.).
3. Update `#1053` body with pointer to this report and `#1256` as active planning head.
4. Begin `#1256` Phase 1 documentation package per website plan (separate authorized task).
5. Revisit `#1112` / `#1259` against H-011 for scheduled launch-readiness CI when approved.

## Validation

```bash
./scripts/ci/docs_check_headers.sh \
  docs/ops/reports/program-2-website-phase0-reconciliation.md \
  docs/reference/website/lgfc-website-as-built-reconciliation.md \
  docs/how-to/website/website-implementation-and-content-operations-plan.md
./scripts/ci/docs_canonical_hashes_verify.sh .
```

## 12. Program #1255 Closeout State Addendum (2026-06-10)

This addendum records live GitHub state after child project `#1256` reached
terminal Task 009. It does not mutate issues; it aligns documentation with
execution history.

| Item | Live state (2026-06-10) | Notes |
| --- | --- | --- |
| Program #1255 | Open — `status:active` + `status:post-merge-verify` | Umbrella program remains active until #1256 signoff |
| Child project #1256 | Open — `status:active` + `status:failed` (stale) | At terminal closeout, not failed implementation |
| Task 009 `#1407` | Open — `status:post-merge-verify` | PR `#1520` merged (`f40cd068`) |
| Closeout exception `#1526` | Open — `post-merge-failure` | Unchecked acceptance criterion in merged PR body |
| Rebaseline `#1448` | Open | Pause language stale — Tasks 003–009 merged while open |
| Next child `#1258` | Open — `status:queued` | Not started |
| Next child `#1259` | Open — `status:queued` | Not started |
| issue `#1500` | Next prioritized program | **Excluded** from immediate execution |

**Governance mismatch (plain statement):** Documentation and `#1448` described a
rebaseline pause blocking tasks beyond `#1402`. Execution advanced through Task
009 anyway. Closeout now requires reconciling `#1448`, not re-imposing the stale
pause on merged work.

**Only active blocker for finishing #1256:** remediate `#1526`, apply
`scripts/ci/post-merge-closeout/pr-1520-body.md`, pass post-merge validation,
close `#1407`.

## Related References

- Launch gate: [`program-2-launch-gate.md`](program-2-launch-gate.md)
- Program 1 website as-built: [`lgfc-website-as-built-reconciliation.md`](../../reference/website/lgfc-website-as-built-reconciliation.md)
- Website execution plan: [`website-implementation-and-content-operations-plan.md`](../../how-to/website/website-implementation-and-content-operations-plan.md)
- Automation backlog A-011: [`program-1-automation-backlog.md`](program-1-automation-backlog.md)
- Legacy tracker (non-authoritative): [`LGFC-WEBSITE-IMPLEMENTATION-QUEUE-NORMALIZATION.md`](../trackers/LGFC-WEBSITE-IMPLEMENTATION-QUEUE-NORMALIZATION.md)
