---
Doc Type: Implementation Plan
Audience: Bill, ChatGPT, Cursor, LGFC maintainers
Authority Level: Operational Addendum (non-authoritative; defers to PMO V4 and repo label reality)
Owns: Content Collection program label/status mapping addendum — repo-grounded gaps, proposed labels, and PMO field alignment for #2359 child chain
Does Not Own: PMO lifecycle authority, label creation/deletion, GitHub automation, or merge authorization
Canonical Reference: /docs/ops/pmo/PMO-V4-OPERATING-MODEL.md
Related Issues: #2422, #2364, #2419, #2359, #2360, #2396, #2391
Last Reviewed: 2026-07-10
---

# GitHub Label and Status Mapping Addendum — Content Collection

## Purpose

Provide a repo-grounded label and status mapping addendum for the Content Collection documentation-promotion program (#2359). This document helps Cursor and ChatGPT align issue metadata, agent routing, and PMO dashboard state without inventing parallel label authority.

**This addendum defers to PMO V4** (`docs/ops/pmo/PMO-V4-OPERATING-MODEL.md`) and live GitHub label inventory. Proposed labels are marked **PROPOSED** until Bill/ChatGPT authorize creation.

## Scope

**In scope:**

- Required PMO issue-body fields for #2359 child issues.
- Repo-verified label inventory vs intake draft gaps.
- Agent routing labels (Cursor wake, ChatGPT review).
- Content Collection program-local label proposals.
- Post-merge failure labeling guidance per #2364 Phase 0 design requirement.

**Out of scope:**

- Creating or deleting GitHub labels (requires separate authorization).
- Assigning issues to unavailable users.
- Replacing PMO V4 dashboard precedence rules.

## Current known truth

### PMO issue-body fields (required on master/project/task issues)

Every Content Collection program issue should include these body fields (verified against #2359 child issues):

| Field | Example | Authority |
| --- | --- | --- |
| Dashboard Lifecycle | `active`, `pipeline` | PMO V4 dashboard precedence |
| Priority # | `TBD` or explicit | Bill final authority |
| Status | `Implementation Ready`, `Unblocked` | Issue-body metadata; not a substitute for labels |
| Owner / Agent | `Cursor`, `ChatGPT` | Routing hint; wake labels required for Cursor |
| Parent Program | `#2359` | Program hierarchy |
| Depends On | `#2360` | Predecessor linkage |
| Acceptance criteria | Checklist | Task authority |
| Stop rule | Explicit halt condition | Scope control |

### Repo-verified agent labels (2026-07-10)

| Label | Exists | Use |
| --- | --- | --- |
| `agent:cursor` | **Yes** | Cursor execution wake (with `handoff:ready`) |
| `agent:ChatGPT` | **Yes** | ChatGPT review/watch marker |
| `agent:atlas` | **Yes** | Legacy — do not use for new work per handoff workflow |
| `agent:codex` | **Yes** | Inactive — Codex forbidden for LGFC implementation |
| `agent:copilot` | **Yes** | Support only when explicitly assigned |
| `agent:Atlas` (draft) | **No** | Draft used wrong casing — use `agent:ChatGPT` |
| `agent:CI` (draft) | **No** | **PROPOSED** — not in repo; use workflow/state labels instead |
| `agent:Cubic` (draft) | **No** | Not in repo; omit unless separately authorized |

### Repo-verified status / routing labels

| Label | Exists | Use |
| --- | --- | --- |
| `handoff:ready` | **Yes** | Cursor wake (required with `agent:cursor`) |
| `status:blocked` | **Yes** | Predecessor or gate block |
| `status:ready-for-cursor` | **Yes** | Alternate routing hint — still require wake labels |
| `status:needs-review` | **Yes** | Review pending |
| `status:implementation-ready` | **Yes** | Pipeline readiness |
| `status:complete` | **Yes** | Terminal — dashboard Completed; in `.github/orchestrator-labels.json` |
| `status:completed` | **Yes** (GitHub) / **No** (orchestrator) | Exists in live GitHub label set but **not** in `orchestrator-labels.json`; prefer `status:complete` for automation |
| `status:post-merge-verify` | **Yes** | Post-merge validation in progress |
| `status:needs-atlas-review` (draft) | **No** | **PROPOSED** — use `agent:ChatGPT` + `CHATGPT HANDOFF` instead |
| `status:ready-for-merge` (draft) | **No** | **PROPOSED** — PR lifecycle state, not issue label |
| `status:validation-required` (draft) | **No** | **PROPOSED** — use `status:post-merge-verify` |

### Repo-verified intent / type labels

| Label | Exists | Use |
| --- | --- | --- |
| `docs-only` | **Yes** | Primary docs intent label for PR gates |
| `intent:docs` | **Yes** | Alternate intent label — verify gate/parser before use |
| `type:docs` | **Yes** | Type classification (orchestrator-managed) |
| `pmo` | **Yes** | PMO dashboard inclusion |
| `change-ops` | **Yes** | Primary ops intent label for PR gates |
| `ops` | **Yes** | General ops label — prefer `change-ops` for intent when gate requires it |
| `post-merge-failure` | **Yes** | Current post-merge remediation marker |

### Content Collection area labels (draft vs repo)

Intake draft proposed `area:content-collection`, `area:gallery`, `area:library`, `area:memorabilia`, `area:club-newspaper`, `type:program`, `type:project`, `type:task`. **None exist in the live repo (2026-07-10).**

| Proposed label | Status | Recommendation |
| --- | --- | --- |
| `area:content-collection` | **PROPOSED** | Optional — parent `#2359` + issue-body fields may suffice for Phase 0 |
| `area:gallery` / `area:library` / `area:memorabilia` / `area:club-newspaper` | **PROPOSED** | Defer until feature-lane implementation issues open |
| `type:program` / `type:project` / `type:task` | **PROPOSED** | Defer — `pmo` + issue hierarchy covers Phase 0 |

**Stop rule (#2360 C6):** Do not create program-local lifecycle vocabulary that conflicts with PMO V4. If area labels are needed, ChatGPT must approve before creation.

## Post-merge failure labeling (#2364 design requirement)

Per issue #2364 comment (Phase 0 design-doc requirement):

| Rule | Detail |
| --- | --- |
| Do not misuse `agent:ChatGPT` | CI post-merge failures must not auto-assign ChatGPT unless governance action is required |
| Preferred workflow labels | `post-merge:failed`, `post-merge:issue-####` when source issue is known |
| Current repo reality | `post-merge-failure` exists and is used by Post-Merge Detection workflows |
| Ambiguous source issue | Do not invent `post-merge:issue-####`; preserve ambiguity in remediation issue title/body |
| ChatGPT scan path | ChatGPT Tasks should scan `post-merge:failed` / `post-merge-failure` independently of `agent:ChatGPT` |

**Gap:** `post-merge:failed` and `post-merge:issue-####` are **not yet in the repo**. Current automation uses `post-merge-failure`. Document as transition debt; do not relabel without authorized CI/workflow issue.

## Suggested lifecycle values (issue-body `Dashboard Lifecycle:`)

Defer to PMO V4. Content Collection child issues use:

| Value | Meaning |
| --- | --- |
| `active` | Current program work |
| `pipeline` | Queued / not yet active |

Completed issues use closed state + `status:complete` per PMO V4 dashboard precedence.

## Suggested status values (issue-body `Status:`)

| Value | When to use |
| --- | --- |
| `Implementation Ready` | Cursor may begin after predecessor closeout and ChatGPT path approval |
| `Unblocked` | Predecessor cleared; queue position may still apply |
| `Blocked` | Predecessor or authority conflict — document which |
| `Complete` / `Closed` | Terminal closeout |

Do not use draft-only values (`Merge Authorized`, `Merged Pending Validation`) as issue-body status unless PMO V4 adopts them.

## Blocking rules

| Block class | Effect |
| --- | --- |
| Product / scope / security / build / data / auth / exposure / critical design | Blocks affected lane until resolved |
| Administrative-only findings | May queue; must not stop unrelated lanes unless hiding implementation defect |
| Authority conflict (C1–C9 from #2360 audit) | Stop and post `CHATGPT HANDOFF` |
| Label model mismatch | Stop if proposed mapping requires PMO decision (#2364 stop rule) |

## Procedure

1. Read PMO V4 dashboard precedence before setting issue metadata.
2. For Cursor routing, set `agent:cursor` + `handoff:ready` per `docs/ops/ai/chatgpt-cursor-handoff-workflow.md`.
3. For ChatGPT review, set `agent:ChatGPT` and post `CHATGPT HANDOFF`.
4. Before creating new labels, compare against this addendum and request ChatGPT approval.
5. Reconcile post-merge label transition (`post-merge-failure` → `post-merge:failed`) in a separate CI/governance issue.

## Acceptance criteria

- [ ] Label/status mapping checked against live repo inventory (this document, 2026-07-10).
- [ ] Proposed labels clearly marked **PROPOSED** vs verified.
- [ ] PMO V4 remains canonical; this file is addendum only.
- [ ] Post-merge labeling gap documented for CI follow-up.
- [ ] No parallel label authority created.

## Source intake mapping

| Intake draft | Enriched doc |
| --- | --- |
| `LGFC GitHub Label and Status Mapping Addendum — Content Collection Draft.docx` | This file |

Intake target `docs/ops/programs/content-collection/github-label-status-mapping.md` is **rejected** per #2360 C7. Remapped to `docs/ops/implementation-plans/content-collection/support/`.
