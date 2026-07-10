---
Doc Type: Implementation Plan
Audience: Bill, ChatGPT, Cursor
Authority Level: Operational Register (living document for #2359 program)
Owns: Deferred work tracking for Content Collection successor program — prevents scope creep from out-of-wave items
Does Not Own: Issue creation authority, prioritization decisions, or automatic deferral enforcement
Canonical Reference: /docs/ops/pmo/lou-gehrig-content-collection-expansion-readiness.md
Related Issues: #2364, #2359, #2360, #1738, #2286
Last Reviewed: 2026-07-10
---

# Deferred Work Register — Content Collection

## Purpose

Track work intentionally excluded from the current Content Collection program wave (#2359 Phase 0 and authorized successors) so deferred items do not re-enter scope accidentally.

## Scope

**In scope:**

- Deferred items from intake draft enriched with repo/issue linkage.
- Register fields and update procedure.
- Stop rule when deferred item appears in active task allowlist.

**Out of scope:**

- PMO backlog prioritization (Bill final authority).
- Automatic issue creation for deferred items.
- Feature implementation of deferred capabilities.

## Current known truth

- Parent program #2359 Phase 0 docs promotion is active; #2360–#2362 enrichment PRs are merged.
- #2364 support docs are on `main` under `docs/ops/implementation-plans/content-collection/support/`.
- GAL/LIB/MEM/CLUB feature implementation remains deferred until `CONTRACT-FROZEN: content-asset-model v1`.
- Codex is inactive per `docs/ops/ai/LGFC-AI-TEAM-OPERATING-MODEL.md`.
- Post-merge label transition (`post-merge:failed`) tracked in #2418; current automation uses `post-merge-failure`.

## Intended final state

- Every out-of-wave item has a tracked row with owner, trigger, and status.
- No deferred item enters an active task allowlist without explicit Bill/ChatGPT authorization.
- Register reconciled at program closeout (#2365 / VAL-001); carry-forward items route to successor program or PMO backlog.

## Register rules

Every deferred entry must include:

| Field | Required |
| --- | --- |
| ID | Stable identifier (D-###) |
| Item | Short name |
| Description | What is deferred |
| Source authority | Issue, audit conflict ID, or governance doc |
| Reason deferred | Why not in current wave |
| Future trigger | What must happen before reconsideration |
| Owner | Bill / ChatGPT / Cursor (routing hint) |
| Status | `deferred` \| `under-review` \| `authorized` \| `superseded` |
| Related package | CC/GAL/LIB/MEM/CLUB/CI/VAL if applicable |
| Related lane | Content model, feature, CI, docs, etc. |
| Next review | Event or date hint |

**Stop rule:** If an active task allowlist includes a deferred item without explicit Bill/ChatGPT authorization, Cursor must stop and post `CHATGPT HANDOFF`.

## Initial deferred items (repo-grounded)

| ID | Item | Description | Source | Reason deferred | Future trigger | Owner | Status | Package | Lane |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| D-001 | Live AI tagging | Runtime AI classification/tagging of content | Intake draft; readiness doc | Current wave allows AI-ready **fields and guardrails only** | Bill/ChatGPT governance + model/API decision | ChatGPT | deferred | CC-001 | Content model |
| D-002 | OCR implementation | Optical character recognition pipeline | Intake draft | Out of scope for current wave | Content volume or source type requires OCR; storage/cost review | Bill | deferred | — | Ingestion |
| D-003 | Crawler expansion | External source monitoring/crawling | Intake draft | Storage/cost/review load risk | Acquisition strategy approval | Bill | deferred | — | Ingestion |
| D-004 | Automatic public publication | Publish without human editorial review | `docs/reference/website/unified-content-workflow.md` | Human editorial/publication review required | Future governance decision + safety workflow validation | ChatGPT | deferred | — | Publication |
| D-005 | Paid storage/API expansion | Non-free-tier dependencies | Readiness assumptions | Conservative/free-tier controls assumed | Bill approval after cost/risk review | Bill | deferred | — | Platform |
| D-006 | Broad admin platform redesign | Full admin UX overhaul | Intake draft | Only content collection support in scope | Separate admin UX program | ChatGPT | deferred | — | Admin |
| D-007 | Codex implementation role | Codex as executor | `docs/ops/ai/LGFC-AI-TEAM-OPERATING-MODEL.md` | Codex inactive unless reauthorized | Explicit Bill governance update | Bill | deferred | — | Agents |
| D-008 | GAL/LIB/MEM/CLUB feature implementation | Gallery, Library, Memorabilia, Club routes | #2360 audit; #2362 | Phase 3 — blocked until CC-001/CC-002 frozen | CONTRACT-FROZEN marker + child issues | Cursor | deferred | GAL/LIB/MEM/CLUB | Feature |
| D-009 | CI-001 / CI-002 tooling implementation | PR body generator, closeout auto-repair scripts | #2360 audit; #2361 packages | Phase 1 tooling — docs enriched in #2361 only | Stage 0 gap analysis + authorized child issue | Cursor | deferred | CI-001/CI-002 | CI |
| D-010 | Accelerated merge policy | "Pre-approved merge" / continuous execution policy | Intake draft; C1/C8 #2360 | Conflicts with PR lifecycle and merge authority | Rewrite as procedural preclearance only; Bill/ChatGPT approve | ChatGPT | deferred | — | Governance |
| D-011 | `docs/ops/programs/` tree | Proposed program doc root | #2360 C7 | Rejected — use existing ops clusters | N/A — use `docs/ops/reports/`, `implementation-plans/`, `pmo/` | ChatGPT | superseded | — | Docs |
| D-012 | `docs/reference/website/content-collection/` | Parallel reference root | #2360 C7 | Rejected — merge into existing content/website refs | N/A — gap matrices only | ChatGPT | superseded | CC-001/CC-002 | Docs |
| D-013 | `area:*` GitHub labels | Program-local area labels | Label addendum; live repo | Labels do not exist; issue hierarchy suffices for Phase 0 | ChatGPT approves label creation if needed | ChatGPT | deferred | — | PMO |
| D-014 | `post-merge:failed` label migration | New post-merge label scheme | #2364 comment | `post-merge-failure` currently in use | Authorized CI/workflow issue | Cursor | deferred | — | CI |
| D-015 | Issue-body packs as docs files | Successor/lane/task body packs | #2360 audit | GitHub-only or template snippets | Optional template enrichment later | ChatGPT | deferred | — | PMO |

## Items explicitly NOT deferred (current wave)

| Item | Issue | Status |
| --- | --- | --- |
| #2360 audit/dedup | #2360 | **Complete** |
| Foundation package docs | #2361 | **Complete** (PR #2405 merged) |
| Support registers / assignment docs | #2364 | **In progress** |
| Feature package docs enrichment | #2362 | Open (PR #2415) |
| Control/ops docs | #2363 | Per queue |
| Terminal promotion PR | #2365 | Blocked on predecessors |
| Lessons learned register | #2366 | Parallel living doc |

## Update procedure

1. **Before** opening a new child issue under #2359, check this register.
2. If proposed scope matches a deferred item, stop unless issue explicitly authorizes exception.
3. When ChatGPT authorizes a deferred item, update status to `authorized` with issue reference and date in issue comment (not silent register edit outside PR).
4. On program closeout (#2365 / VAL-001), reconcile register — carry forward still-deferred items to successor program or PMO backlog issue.

## Review cadence

Review this register:

- Before GitHub issue creation for new Content Collection tasks.
- Before content model implementation (CC-001/CC-002).
- Before parallel feature wave (GAL/LIB/MEM/CLUB).
- Before final program closeout (VAL-001).
- When intake draft scope conflicts arise (post `CHATGPT HANDOFF`).

## Acceptance criteria

- [ ] All known out-of-scope items tracked with source authority.
- [ ] No deferred item implemented in current wave without explicit authorization.
- [ ] #2360 disposition items (C7, C1/C8, Phase 3 packages) reflected.
- [ ] Register fields support issue-linked audit trail.
- [ ] Superseded items marked — not deleted — for history.

## Source intake mapping

| Intake draft | Enriched doc |
| --- | --- |
| `LGFC Deferred Work Register — Content Collection Draft.docx` | This file |

Remapped from rejected `docs/ops/programs/content-collection/deferred-work-register.md` per #2360 C7.
