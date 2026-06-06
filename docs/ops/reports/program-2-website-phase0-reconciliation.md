---
Doc Type: Operations
Audience: Human + AI
Authority Level: Controlled
Owns: Program 2 Website Phase 0 issue queue reconciliation for #1394 under #1255
Does Not Own: GitHub issue closure, label mutation, runtime implementation, workflow changes, or Program 2 website build issue creation
Canonical Reference: /docs/reference/website/lgfc-website-as-built-reconciliation.md
Related issues: #1394, #1255, #1256, #1258, #1259, #1053
Last Reviewed: 2026-06-06
---

# Program 2 Website Phase 0 Reconciliation

## Purpose

Record the Phase 0 website issue and queue reconciliation authorized by source issue
`#1394`. This report makes the Website Program 2 queue reliable before any new
website implementation or build issue is created.

## Scope

This report owns:

- confirmation of the active Program 2 website umbrella and child project masters;
- classification of stale or old website issues against Program 1 website as-built
  evidence;
- routing guidance for retained work under the current Program 2 website control
  plane;
- identification of the next website child project to activate.

This report does not own:

- GitHub issue closure, label edits, or bulk closeout;
- application code, public route, admin route, D1 migration, runtime configuration,
  credential, or workflow YAML changes;
- creation of new website build or implementation issues.

## Current Known Truth

Hard-start condition is satisfied for documentation reconciliation:

| Gate | Evidence | Phase 0 result |
|---|---|---|
| Program 2 sign-off source `#1391` | GitHub issue `#1391` is closed and `docs/ops/reports/program-2-launch-gate.md` records Bill Hunter sign-off dated 2026-06-06 | Proceed with docs-only Phase 0 reconciliation |
| Source issue `#1394` | GitHub issue `#1394` is open and labeled `docs-only` | Use as the single implementation contract |
| Website as-built baseline | `docs/reference/website/lgfc-website-as-built-reconciliation.md` says Phase 1 website implementation is largely merged on `main`, stale tracker rows are not ops authority, and remaining work moves under `#1255` after launch gate | Reconcile old queue state under Program 2; do not revive stale tracker rows alone |

GitHub issue state and merged PR evidence supersede stale tracker rows when they
conflict. This task performs no GitHub mutations.

## Intended Final State

- `#1255` remains the active Website Program 2 umbrella.
- `#1256`, `#1258`, and `#1259` remain current child project masters.
- Old website issues are classified for later owner-approved comments, label cleanup,
  closeout, retention, or future child-project planning.
- The next authorized website child project after Phase 0 is `#1256` Content Strategy
  / Editorial Inventory.
- No new website build or implementation issues are created by this task.

## Program and child project status

| issue | Current role | Observed state | Phase 0 disposition |
|---|---|---|---|
| `#1255` | Website Implementation and Content Operations umbrella | Open; active website program | **Confirmed active website program master.** All retained website work routes under this umbrella. |
| `#1256` | Content Strategy / Editorial Inventory | Open; active website child project | **Confirmed current and next child project to activate.** This is the default next Program 2 website project. |
| `#1258` | Website Operations Admin | Open; queued website child project | **Confirmed current.** Retain operations/admin gaps here until content strategy and inventory reconciliation give a stable dependency base. |
| `#1259` | Website QA and Production Validation | Open; queued website child project | **Confirmed current.** Retain QA, launch-readiness, production validation, and T50-style work here. |
| `#1053` | Legacy website coordination tree | Open; legacy active/post-merge verification labels remain | **Retained as historical coordination context only.** It is not the active Program 2 umbrella and should not authorize new build work without `#1255` child-project routing. |

## Classification Rules

Each old or stale issue is classified into one of these Phase 0 dispositions:

- **Already satisfied by merged evidence** - Program 1 as-built evidence records the
  work as merged or complete; remaining action is owner-approved issue hygiene only.
- **Retained under `#1255` / `#1256` / `#1258` / `#1259`** - the issue remains useful
  under a current Program 2 project and should not be closed as obsolete.
- **Superseded by an existing Program 2 child project** - the old issue should not be
  revived as the planning authority because a current child project owns the next
  decision.
- **Duplicate/obsolete candidate for later owner-approved closeout** - stale issue
  content appears covered elsewhere, but useful requirements must be preserved before
  any closeout.
- **Unresolved implementation gap requiring future child issue** - a concrete gap is
  still present, but any build issue must wait for the relevant child project plan and
  owner authorization.

## Old Website issue reconciliation

| issue(s) | Program 1 as-built evidence | Current GitHub signal | Phase 0 classification | Disposition |
|---|---|---|---|---|
| `#943` T21 FAQ page, `#946` T22 Ask intake, `#947` T23-E Events page | Public route baseline includes `/faq` and `/ask`; stale legacy issues are called out for disposition rather than implementation authority | Open with `status:post-merge-verify` labels | **Duplicate/obsolete candidate for later owner-approved closeout** | Preserve any useful requirements, then comment or close only with owner approval. Event/admin deltas, if any, route through `#1258` rather than reviving `#947` as standalone authority. |
| `#1013` T30 FanClub shell, `#1014` T31 profile/member card, `#1015` T32 library/memorabilia, `#1016` T33 social wall, `#1017` T34 homepage D1 wiring | As-built report marks T30-T34 as merged, with `#1017` tied to PR `#1101` tracker closeout | Open with `status:post-merge-verify` labels | **Already satisfied by merged evidence** | Treat as issue-lifecycle drift. Later closeout comments or label cleanup may be owner-approved, but this task does not bulk-close them. |
| `#1108` T25 Search, `#1109` T26 Mobile navigation, `#1110` T28 Join/Login UX, `#1111` T29 D1/B2 fail-closed validation | As-built report marks these complete with PR evidence (`#1130`, `#1166`/`#1178`, `#1149`/`#1150`/`#1152`/`#1155`, `#1169`) | Open with stale draft/post-merge verification labels | **Already satisfied by merged evidence** | Keep only as closeout-hygiene candidates. Do not create replacement implementation issues. |
| `#1113` T35 FanClub home composition | As-built report marks complete with PR `#1114` | Closed | **Already satisfied by merged evidence** | No Phase 0 action required. |
| `#1118` T40 Fan Club operational workflows, `#1119` T41 admin operating shell/member operations, `#1120` T42 moderation/review | As-built report marks T40-T42 complete with PRs `#1171`, `#1174`, and `#1176` | Open with stale draft/post-merge verification labels | **Already satisfied by merged evidence** | Treat as lifecycle drift. Future admin deltas must route through `#1258`; do not reopen these rows as implementation authority. |
| `#1121` T43 content management workflows | As-built report identified T43 as active at documentation time; current issue state is now closed | Closed with stale draft/post-merge labels | **Superseded by existing Program 2 child project `#1256`** | Do not revive `#1121` as the Program 2 content authority. `#1256` must reconcile existing content/editorial implementation and gaps before any new build issue. |
| `#1122` T44 media management workflows | As-built report queued T44 under the Program 2 serial queue | Open with stale draft/post-merge verification labels | **Retained under `#1258`** | Keep as operations/admin backlog context. Any build work must wait for `#1258` planning and owner-approved child issue sequencing. |
| `#1123` T45 editorial/archive systems | As-built report queued T45; the website plan records existing editorial/archive implementation that must be inventoried before new build work | Closed with complete/draft label drift | **Superseded by existing Program 2 child project `#1256`** | Validate existing editorial/archive implementation during `#1256` inventory and gap analysis. No new duplicate build issue from Phase 0. |
| `#1124` T46 event/calendar administration | As-built report queued T46 under operations/admin backlog | Open with `status:failed` and stale draft label | **Unresolved implementation gap requiring future child issue** | Retain under `#1258`. Create or refine build scope only after `#1258` planning authorizes exact route, role, data, validation, and rollback boundaries. |
| `#1125` T47 charity/fundraiser administration | As-built report queued T47 under operations/admin backlog | Closed, but labels include both complete and failed/draft signals | **Retained under `#1258`** | Treat as label-state drift plus operations/admin context. Reconcile during `#1258`; do not bulk-close or reopen from this task. |
| `#1126` T48 matchup administration | As-built report queued T48 under operations/admin backlog | Closed with complete/post-merge verification label drift | **Already satisfied by merged evidence** | No Phase 0 build issue. Revalidate only if `#1258` planning finds a concrete missing delta. |
| `#1127` T49 audit/reporting systems | As-built report queued T49 under operations/admin backlog | Open with `status:failed` and stale draft/post-merge labels | **Unresolved implementation gap requiring future child issue** | Retain under `#1258`. Future work needs an owner-approved child issue with exact audit/reporting scope and validation. |
| `#1112` T50 launch readiness QA and production validation suite | As-built report routes T50 to launch readiness and `#1259` QA | Closed with `status:complete` | **Superseded by existing Program 2 child project `#1259`** | Keep `#1259` as the QA / production validation master. Do not create a replacement T50 issue during Phase 0. |

## Next Authorized Website child project

The next website child project to activate after Phase 0 is:

```text
#1256 — Content Strategy / Editorial Inventory
```

The first `#1256` work should be documentation and inventory reconciliation, not new
runtime implementation. It should capture the content model, editorial workflow, and
existing implementation inventory/gap analysis before any schema, API, admin UI, public
rendering, search/discovery, media linking, seed content, or validation build issue is
created.

`#1258` Website Operations Admin and `#1259` Website QA / Production Validation remain
queued until the program owner advances them under `#1255`.

## No New Build issues created

This Phase 0 task creates **no** website build, implementation, migration, workflow,
public route, admin route, runtime configuration, credential, or QA execution issues.

Any later issue creation must be owner-authorized under the relevant Program 2 child
project and must include exact scope, file allowlist, validation, rollback, and
acceptance criteria.

## Closeout Guidance

- Do not bulk-close old website issues from this reconciliation.
- Do not mutate labels from this reconciliation PR.
- Use later owner-approved comments to explain whether each old issue is satisfied,
  retained, superseded, duplicate/obsolete, or an unresolved implementation gap.
- Preserve useful requirements from old issues before any duplicate/obsolete closeout.
- Bill remains Program 2 sequencing authority; Atlas/Bill review remains required
  before promoting downstream website work.

## Validation

Required checks for this docs-only report:

```bash
DOCS_HEADER_FILE_LIST=/tmp/lgfc-docs-files.txt ./scripts/ci/docs_check_headers.sh .
./scripts/ci/docs_canonical_hashes_verify.sh .
```
