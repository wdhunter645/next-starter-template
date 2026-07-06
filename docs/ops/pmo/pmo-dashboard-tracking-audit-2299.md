---
Doc Type: Operations Report
Audience: Bill, Atlas, PMO operators
Authority Level: Evidence / Audit
Owns: PMO dashboard tracking reconciliation audit for issue #2299
Does Not Own: Final priority authorization or issue closeout
Canonical Reference: /docs/ops/pmo/PMO-V4-OPERATING-MODEL.md
Related Issues: #2299, #1719
Last Reviewed: 2026-07-06
---

# PMO Dashboard Tracking Audit — Issue #2299

## Purpose

Document PMO dashboard inventory reconciliation performed for issue #2299 so every tracked PMO program, project, idea, strategy, planning item, active item, pipeline item, and completed item is accounted for as active, pipeline, completed, or explicitly excluded with rationale.

## Generator change

Expanded dashboard title inclusion from `PROGRAM:` / `PROJECT:` only to also include:

- `PROGRAM CANDIDATE:`
- `STRATEGY:`
- `STRATEGY REVIEW:`

Machine-readable inventory and validation guardrails: `scripts/pmo-dashboard/pmo-tracked-inventory.json`.

## Active programs (numeric priority)

| Priority # | Issue | Name | Owner / Agent | Notes |
| ---: | ---: | --- | --- | --- |
| 1 | #2286 | LGFC Content Pipeline Runtime Implementation | Atlas + Cursor | Current website build-out Priority #1 program |
| 2 | #1719 | PMO Governance / Workflow Automation Completion | Atlas | Launch-gated; blocked until explicit task assignment |
| 3 | #2299 | PMO Dashboard Tracking Reconciliation and Priority Repair | Atlas + Cursor | Current repair project; execution in progress |

## PMO pipeline (numeric priority)

| Priority # | Issue | Name | Dashboard status | Notes |
| ---: | ---: | --- | --- | --- |
| 1 | #2294 | Agent Issue Polling and Handoff Routing | PMO Intake | Next PMO workflow automation project |
| 2 | #2292 | AI-Assisted Tagging for LGFC Digital Content Assets | PMO Intake | Strategy capture only |
| 3 | #2291 | LGFC SEO Strategy and PMO Activation Control | PMO Intake | Strategy capture only |
| 4 | #2040 | Website Automatic Content Publication Capability | PMO Intake | Post-manual-workflow automation program |
| 5 | #2073 | Gehrig Content Collection Phase 2 / Advanced Research and Media Archive Acquisition | PMO Intake | Successor to Phase 1 |
| 6 | #2085 | Admin Page and Tools Design Readiness | PMO Intake | Program candidate |
| 7 | #2075 | LGFC Social Media Strategy | PMO Intake | Program candidate |
| 8 | #2074 | Member Communications and Newsletter Operations | PMO Intake | Program candidate |
| 9 | #2084 | Annual Lou Gehrig Day Operations Package | PMO Intake | Program candidate |
| 10 | #2093 | 2027 Launch Calendar and Go/No-Go Plan | PMO Intake | Program candidate |
| 11 | #2081 | LGFC Monetization Strategy | PMO Intake | Program candidate |
| 12 | #2082 | LGFC Store Strategy | PMO Intake | Program candidate |
| 13 | #2083 | Store and Merchandise Operations | PMO Intake | Program candidate |
| 14 | #2079 | Community Engagement Cadence | PMO Intake | Program candidate |
| 15 | #2078 | Adam Wilson Award and Recognition System | PMO Intake | Program candidate |
| 16 | #2077 | Partner and Friends of the Fan Club Operations | PMO Intake | Program candidate |
| 17 | #2076 | Cost Analysis and Growth Heat Map | PMO Intake | Program candidate |
| 18 | #2273 | LGFC Content Pipeline Reconciliation and Candidate Model | Planning complete | Successor #2286 is active |
| 19 | #2270 | LGFC Content Discovery, Review, Approval, and Publication Pipeline | Strategy review | Review-only strategy issue |
| 20 | #1738 | Lou Gehrig Content Collection / Research Pipeline Expansion | Paused (launch-gated) | Was showing active/failed due to status labels |
| 21 | #1700 | Fundraiser / Charity Campaign Operations Buildout | PMO Intake | Queued launch-gated program |

## Completed programs

| Issue | Name | Notes |
| ---: | --- | --- |
| #1685 | Website Completion / Fan Club Product Buildout | `status:complete` label; GitHub issue still OPEN |
| #2100 | PMO V4 Repository Authority Promotion | Closed project |
| #2039 | Website Public Launch / Relaunch Readiness | Closed program |

## Explicitly excluded issues

| Issue | Rationale |
| ---: | --- |
| #2101 | `DESIGN:` title prefix outside dashboard taxonomy; closed design/pre-build record. CI implementation evidence exists elsewhere. |
| #1847 | `OPS` title prefix; closed operations program, not PMO dashboard inventory row. |
| #2288 | `TASK:` child issue under #2286; not a standalone PMO dashboard row per #2299 scope boundary. |

## Bill / Atlas decisions required

1. **#1685** — GitHub issue remains OPEN with `status:complete` while PMO treats the program as closed complete. Close on GitHub or retain explicit `Dashboard Lifecycle: completed` only?
2. **#1738** — Confirm paused pipeline priority #20 and `Paused (launch-gated)` dashboard status until Bill authorizes Phase 1 relaunch.
3. **#2273** — Confirm pipeline disposition (planning complete; successor #2286 active) rather than completed archive.

## Priority rule applied

Priority reflects LGFC website/repository need per PMO V4, not implementation readiness. Pipeline items may rank highly while still launch-gated.

## Validation

After issue metadata updates and dashboard regeneration:

```bash
node scripts/pmo-dashboard/build-dashboard.mjs
node scripts/pmo-dashboard/validate-dashboard.mjs site/pmo-dashboard
```

Validation enforces numeric priorities on active/pipeline rows and checks tracked inventory presence and lifecycle placement.

## Additional title-prefix rows (not in tracked inventory)

The generator also surfaces older `PROGRAM:` / `PROJECT:` issues that match title prefixes but are outside the #2299 tracked inventory. These rows may retain `TBD` priority until Atlas adds dashboard metadata or documents explicit exclusion:

| Issue | Title |
| ---: | --- |
| #1075 | PROJECT: CI-ORCH-01 — Implement LGFC CI orchestration engine |
| #1039 | PROJECT: DIATAXIS Continuous Curation & Documentation Governance Program |
| #1076 | PROJECT: DIATAXIS legacy migration and authority transition program |
| #1054 | PROJECT: LGFC Repository Governance & DIATAXIS Coordination |
| #1335 | PROGRAM: Phase 1 Wrap-Up — PMO, as-built, health, launch gate |

Follow-up: add explicit exclusion rationale or completed/pipeline metadata per PMO V4 historical archive treatment.
