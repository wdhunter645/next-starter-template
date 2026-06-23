---
Doc Type: Reference
Audience: Cursor and AI implementation agents
Authority Level: Controlled
Owns: Safe-edit boundaries and evidence pointers for future Club Home and member-surface work after Program #1685 Tasks 004–007
Does Not Own: Runtime code in this document, merge authority, or issue mutation
Canonical Reference: /docs/reference/website/unified-content-workflow.md
Related issues: #1693, #1685, #1690, #1691, #1692
Last Reviewed: 2026-06-23
---

# Cursor Club Home Content Handoff

## Purpose

Define what future Cursor sessions may change safely when extending Club Home
content, source/credit workflows, and member content surfaces—without re-opening
completed program tasks or inferring scope from chat history.

## Scope

This reference covers:

- file areas touched by Tasks 004–007;
- read paths vs write paths for content data;
- fail-closed expectations;
- deferred work that requires a new source issue.

This reference does not authorize new backend deltas, migrations, or workflow YAML
changes without a dedicated source issue.

## Current known truth

| Layer | Authority files | Runtime entry points |
| --- | --- | --- |
| Workflow | `docs/reference/website/unified-content-workflow.md` | N/A (docs) |
| Placement | `docs/reference/website/editorial-placement-and-rotation.md` | `club_home` section key |
| Club Home UI | `src/app/fanclub/page.tsx`, `src/components/fanclub/*` | `GET /api/fanclub/home` |
| Library UI | `src/app/fanclub/library/page.tsx` | `GET /api/fanclub/library?q=` |
| Photo UI | `src/app/fanclub/photo/page.tsx` | `GET /api/fanclub/photos`, `GET /api/fanclub/photos/tags` |
| Memorabilia UI | `src/app/fanclub/memorabilia/page.tsx` | `GET /api/fanclub/memorabilia?q=` |
| Profile API | `functions/api/fanclub/profile.ts` | Members table + join_requests sync |
| Admin inventory API | `functions/api/admin/editorial/inventory.ts` | `club_home` in allowed sections |

Evidence reports (read-only for agents unless issue allowlists `docs/ops/reports/**`):

- `docs/ops/reports/website-completion-fan-club-product-gap-review.md`
- `docs/ops/reports/website-completion-fan-club-backend-reconciliation.md`
- `docs/ops/reports/website-content-workflow-reconciliation.md`

## Intended Final State

A Cursor agent with only this reference and the linked source issue can determine
whether a requested change belongs in docs, UI, API, or a new program task—without
expanding file-touch allowlists or bypassing PR governance.

## Safe Edit Matrix

| Change type | Typical allowlist | Preconditions |
| --- | --- | --- |
| Copy / H1 / empty-state text on Fan Club subpages | `src/app/fanclub/**`, `tests/**` | Match `docs/reference/design/fanclub-subpages.md` |
| Club Home module layout or fallback | `src/app/fanclub/**`, `src/components/fanclub/**`, `tests/**` | Preserve auth gate in `src/app/fanclub/layout.tsx` |
| New inventory section or API field | `functions/api/**`, `functions/_lib/**`, `tests/**`, optional `migrations/**` | Entry in backend reconciliation report; predecessor task merged |
| Operator procedure only | `docs/how-to/website/**`, `docs/reference/website/**`, `docs/ops/reports/**` | DIATAXIS headers; how-to includes Steps |
| Admin editorial UI section checkbox | `src/app/admin/editorial/page.tsx` | Keep UI options aligned with API `allowed_sections` keys |

## Fail-Closed Rules

1. Member routes return empty states or static fallback when inventory/API data is missing—never fabricated content.
2. Guests must not read member-only APIs (`useMemberSession` gate on `/fanclub/**`).
3. `submission_queue` rows must not render on public or Club Home surfaces until published to `content_inventory`.
4. Source/credit fields must render when present on dynamic Club Home and library entries.

## Deferred Work (requires new issue)

- Binary member photo upload to B2 from `/fanclub/submit`.
- Homepage `homepage_*` inventory wiring on `/`.
- Photo detail modal or dedicated detail route (design allows either).
- Production B2 base URL or vendor configuration changes.

## Verification Pointers

Run typecheck and targeted Fan Club tests documented in the operator runbook
(`docs/how-to/website/club-home-content-operations-runbook.md`) and record exact
results in the PR body. Do not claim merge-readiness without live gate inspection.
