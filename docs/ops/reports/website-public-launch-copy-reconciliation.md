---
Doc Type: Report
Audience: Human + AI
Authority Level: Program Evidence
Status: Draft until #2042 PR merge
source issue: #2042
Parent Program: #2039
Owns: Task 002 public launch copy reconciliation evidence and unresolved Bill/Atlas content decisions
Does Not Own: Runtime behavior changes, SEO metadata, media fallback, fundraiser mechanics, or content automation
Canonical Reference: /docs/ops/reports/website-public-launch-gap-inventory.md
related issues: #2039, #2041, #2042, #2043, #2044, #2045, #2046, #2047
Last Reviewed: 2026-06-29
---

# Website Public Launch Copy Reconciliation

## Purpose

Record Task #2042 copy-only reconciliation for Program #2039 public relaunch readiness.

## Scope

This report covers public and member-facing launch copy updated in Task #2042. It does not authorize SEO metadata work (#2046), media fallback (#2044), fundraiser mechanics (#2045), admin staging (#2043), or content automation (#2040).

## Current known truth

- Task #2041 gap inventory is merged on `main`.
- Task #2042 updates launch copy on approved public surfaces only.
- Structural behavior, auth gating, APIs, and route inventory from #1685 remain unchanged.
- `/events` remains a public route but is not in the canonical design standards navigation list.

## Intended final state

Public-facing copy clearly distinguishes public preview content from member Fan Club access, avoids false live-fundraiser or automation claims, and documents any remaining Bill/Atlas content decisions before Task #2043.

## Surfaces updated in Task #2042

| Surface | Copy change summary |
| --- | --- |
| `/` homepage hero | Added 2027 public relaunch positioning and public-vs-member preview language |
| Homepage Join CTA | Clarified public visitor vs member Fan Club benefits |
| `/about` | Clarified public/member boundary and no live on-site fundraiser campaign |
| `/contact` | Clarified support routing and non-campaign coordination language |
| `/ask` | Clarified moderator review and optional Fan Club membership |
| `/faq` | Clarified club-reviewed FAQ and moderator review path |
| `/events` | Clarified calendar preview status during launch prep |
| `/join` auth surface | Clarified public site vs member Fan Club access |
| `/fanclub` masthead | Updated member welcome copy for 2027 relaunch prep |
| Homepage discussions teaser | Removed implementation-facing D1 wording |
| Homepage FAQ section | Clarified approved FAQ language |
| `/search` idle helper text | Clarified searchable public/member-visible scope |

## Gap inventory items addressed

| Task #2041 gap | Task #2042 disposition |
| --- | --- |
| Homepage launch copy | Addressed in hero and Join CTA |
| About / Contact / FAQ / Ask copy | Addressed |
| Join public/auth boundary messaging | Addressed on `/join` and Ask page |
| Fan Club masthead copy | Addressed |
| False campaign-live claims | Reduced on About and Contact; full fundraiser boundary remains #2045 |
| Hamburger IA for FAQ / Ask / Events | **Escalated to Bill/Atlas** — no navigation structure changed in #2042 |
| `/events` route retention | **Escalated to Bill/Atlas** — copy clarified only; route/navigation unchanged |
| `/privacy` and `/terms` legal copy | **Deferred** — no substantive legal rewrite in #2042; metadata remains #2046 |
| Per-route SEO / social cards | **Deferred to #2046** |
| Social-wall reliability copy | **Deferred to #2044** |
| Production smoke / rollback docs | **Deferred to #2047** |

## Unresolved content decisions for Bill/Atlas

| Decision | Why it remains open | Recommended owner |
| --- | --- | --- |
| `/events` public launch status | Route exists but is absent from canonical design standards and primary navigation | Bill/Atlas IA decision before or during #2046/#2047 |
| Hamburger inclusion of FAQ, Ask, and Events | Task #2041 flagged discoverability; #2042 did not change nav structure | Bill/Atlas |
| Final approved 2027 relaunch date/messaging | Copy uses preparatory language only; no operator-approved launch date statement | Bill/Atlas |
| `/privacy` and `/terms` legal review | No attorney-reviewed rewrite performed in #2042 | Bill/Atlas legal/content review |
| CMS-managed Contact page body | `/contact` may be overridden by published CMS content when present | Bill/Atlas content ops review |
| Live fundraiser / Givebutter public messaging | Fail-closed placeholders remain; full boundary doc is #2045 | #2045 |

## Task 003 readiness

Program #2039 may proceed to Task #2043 (`/admin/clubstaging`) only after Bill/Atlas accept this copy reconciliation or explicitly disposition remaining content decisions above.
