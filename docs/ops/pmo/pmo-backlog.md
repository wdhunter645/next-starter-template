---
Doc Type: Operations
Audience: Human + AI
Authority Level: Operational Authority
Owns: PMO Backlog inventory for ideas, project drafts, implementation-ready projects, backlog review history, and promotion candidates
Does Not Own: Program launch approval, final prioritization, implementation scope, issue creation, merge authority, or Cursor execution authorization
Canonical Reference: /docs/ops/pmo/PMO-V3-OPERATING-MODEL.md
Related Issues: #1379, #1411, #1255, #1500, #1685, #1700, #1719, #1736, #1738, #1739, #1740, #1741, #1742, #1743, #1744, #1745, #1746
Last Reviewed: 2026-06-17
---

# PMO Backlog

PMO Backlog = active/queued program groups, project drafts, and ideas.

This document is the durable, prioritized working inventory for PMO backlog review. It does not launch work, create issues, authorize Cursor execution, or establish final execution authorization by itself. Work becomes executable only through a current open program/task/source issue with explicit launch/assignment authorization.

## Current known truth

- Program #1255/#1259 remains the active website execution program.
- Priority #1, Priority #2, Priority #3, and Priority #4 have or are receiving launch-control structures, but none may execute without explicit queue authorization.
- Priority #3 PMO sync PR #1733 is currently draft/blocked and must not be treated as ready until review/CI are clean.
- Project 11 remains a project draft ahead of Project 12 in backlog order.
- Project 12 has been promoted into Priority #4 launch-control structure under #1738 and #1739–#1746.
- Google Analytics setup/verification is added as project 16 because GA appears configured but no dashboard data is visible.
- After projects 11–16 are represented, remaining idea items are numbered 17–27.

## Current active and queued program state

| Rank | project / idea name | Classification | Brief description | Suggested next action | Related references | Readiness |
| ---: | --- | --- | --- | --- | --- | --- |
| 1 | Website Completion / Fan Club Product Buildout | parked launch-control ready program | Complete authenticated Fan Club experience, backend services, content operations, content collection workflow, and design alignment. | Keep parked behind Program #1255/#1259 unless Bill/Atlas explicitly launch or reprioritize. | #1685, #1686–#1694 | launch-control ready; blocked |
| 2 | Fundraiser / Charity Campaign Operations Buildout | launch-control ready future program | Repeatable fundraiser operations, Givebutter boundary, leaderboard/winner rules, homepage promotion, donor recognition without PII exposure, and launch testing. | Keep queued behind active/higher-priority work unless Bill/Atlas explicitly launch or reprioritize. | #1700, #1701–#1708 | launch-control ready; blocked |
| 3 | PMO Governance / Workflow Automation Completion | launch-control issues created; docs sync blocked | Consolidate PMO authority, workflow automation, Cursor continuation, PR readiness, queue/wave planning, and closeout stabilization. | Keep #1733 draft/blocked until reviewer comments and CI are clean. | #1719, #1720–#1727, #1733 | structurally created; docs sync blocked |
| 4 | Lou Gehrig Content Collection / Research Pipeline Expansion | launch-control ready future program | Durable content supply chain for source discovery, research triage, provenance, rights/privacy review, editorial conversion, and operator handoff. | Keep queued; do not execute until Atlas/Bill explicitly authorize Cursor to begin #1739. | #1736, #1738, #1739–#1746 | launch-control ready after this package merges; blocked |

## Remaining project drafts

| Rank | project / idea name | Classification | Brief description | Suggested next action | Related references | Readiness |
| ---: | --- | --- | --- | --- | --- | --- |
| 11 | Admin Page and Tools Design Readiness | project draft | Review/audit existing admin page and tools, reconcile what Program #1255/#1258 built, classify active/diagnostic/retired tools, token UX, and backend failure-state needs. | Create PMO v3 readiness package before admin implementation. | `docs/ops/pmo/program-5-admin-page-and-tools-design-readiness.md`; #1258 | partial |
| 12 | Lou Gehrig content collection strategy | promoted project draft | Continuous collection, source/credit tracking, review, and publication pipeline for Lou Gehrig content. | Promoted into Priority #4 launch-control package under #1736/#1738. | #1736, #1738, #1739–#1746 | launch-control ready after this package merges |
| 13 | Annual Lou Gehrig Day operations package | project draft | Repeatable annual operations checklist and website spotlight plan for Lou Gehrig Day. | Convert into ops checklist when annual operations become a priority. | #1379 historical | none |
| 14 | Media/archive acquisition workflow | project draft | Clarify relation to B2/D1 media assets, member submissions, and editorial review. | Define acquisition layer if future content work needs it. | #1255 | none |
| 15 | Sponsor/donor recognition operations | project draft | Donor privacy, display rules, and campaign integration outside fundraiser-specific scope. | Clarify remaining non-fundraiser scope after Priority #2 recognition work. | Priority #2 rank 2e equivalent | none |
| 16 | Google Analytics setup and verification | project draft | GA appears configured but dashboards are not showing data; verify measurement ID placement, runtime loading, consent/privacy boundary, and dashboard data flow. | Create a small verification task when queue permits; not critical but useful for traffic/user/usage awareness. | Cloudflare/website deployment; GA measurement ID supplied by Bill | none |

## Ideas inventory

| Rank | idea name | Brief description | Suggested next action | Related references |
| ---: | --- | --- | --- | --- |
| 17 | Adam Wilson Award / recognition system | Purpose, content model, route needs, and ownership for an Adam Wilson Award or similar recognition surface. | Clarify purpose and ownership in PMO review. | #1379 historical |
| 18 | Community engagement cadence | Desired operating rhythm and website/community surfaces for member engagement. | Define cadence and surfaces in PMO review. | #1379 historical |
| 19 | Partner / Friends of the Fan Club operations | Data ownership, public display rules, and outreach workflow for Friends of the Fan Club. | Define ops model; may connect to homepage section. | #1255 |
| 20 | AI-assisted content research pipeline | Safety, sourcing, copyright, and review requirements for AI-assisted research. | Defer until content collection guardrails are accepted. | #1379 historical; #1745 |
| 21 | Member communications / newsletter | Tooling, consent, data privacy, cadence, and ownership for member email communications. | Define requirements and privacy boundaries. | duplicate candidate with rank 23 |
| 22 | Store / merchandise operations | External Bonfire boundaries and whether any website/admin work is needed for the store. | Clarify external-store boundaries; avoid unnecessary internal store build. | duplicate candidate with rank 26 |
| 23 | LGFC newsletter | Newsletter product/strategy for LGFC audience beyond member-only communications. | Clarify relationship to rank 21; merge or differentiate. | #1379 historical |
| 24 | Cost analysis and heat map for growth-related costs | Analysis of growth-related infrastructure and operational costs. | Define scope and data sources when prioritized. | #1379 historical |
| 25 | LGFC monetization strategy | Overall monetization approach for LGFC operations and growth. | Strategy discussion in PMO review when prioritized. | #1379 historical |
| 26 | LGFC store strategy | Store/merchandise strategy beyond day-to-day Bonfire operations. | Clarify relationship to rank 22; merge if redundant. | #1379 historical |
| 27 | LGFC social media strategy | Social media operating model, cadence, and website integration. | Define strategy and ownership in PMO review. | #1379 historical |

## Project 11 clarification

Project 11 is not a direct admin-page build. It is a PMO v3 admin/tools design-readiness audit. The point is to review the existing admin page and tools, identify what is already production-usable, what is diagnostic-only, what should be retired, and what remains needed for future programs before authorizing implementation.

## PMO backlog idle condition

Once projects 11–16 are either launch-control ready or explicitly deferred, the PMO backlog can be left idle while active/queued programs execute.

## Execution rule

Backlog rank does not authorize implementation. Cursor execution requires a current open program/task/source issue and explicit Atlas/Bill launch or assignment authorization.
