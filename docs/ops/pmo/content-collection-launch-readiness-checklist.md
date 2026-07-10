---
Doc Type: Operational Checklist
Audience: Bill, ChatGPT, Cursor, LGFC maintainers
Authority Level: Operational (non-authoritative until promoted via Issue/PR)
Owns: Go/no-go checklist before Content Collection Phase 0 issue creation, implementation launch, and terminal promotion
Does Not Own: Merge authorization, GitHub issue mutation, or feature implementation
Canonical Reference: /docs/ops/reports/content-collection-docs-audit-dedup-2360.md
Related Issues: #2363, #2359, #2360, #2365
Last Reviewed: 2026-07-10
---

# Content Collection Launch Readiness Checklist

## Purpose

Determine go/no-go for Content Collection program steps: child-issue enrichment PRs, implementation child issues, and terminal #2365 promotion closeout.

## Scope

Phase 0 documentation promotion only unless a row explicitly references later implementation lanes.

## Current known truth

- #2360 audit disposition is authoritative (`docs/ops/reports/content-collection-docs-audit-dedup-2360.md`).
- Rejected paths: `docs/ops/programs/`, `docs/reference/website/content-collection/`.
- Cursor is sole implementation executor; Codex is inactive.
- Bill/ChatGPT retain merge authorization — no pre-approved merge language.

## Pre-enrichment PR (Phase 0 child issues)

| # | Check | Pass criteria | Status field |
| ---: | --- | --- | --- |
| 1 | Source issue open with ChatGPT PR authorization comment | `#2363` / `#2364` etc. | `issue_authorized` |
| 2 | #2360 audit merged and disposition recorded | Report on `main` | `audit_complete` |
| 3 | File allowlist defined before edits | Listed in issue or PR body | `allowlist_defined` |
| 4 | No governance conflict with PMO V4 / PR lifecycle / Agent.md chain | Stop and `CHATGPT HANDOFF` if conflict | `governance_clear` |
| 5 | Docs validation commands planned | See Validation section | `validation_planned` |

## Pre-implementation launch (post–Phase 0 docs)

| # | Check | Pass criteria | Status field |
| ---: | --- | --- | --- |
| 6 | Foundation packages enriched (#2361) | On `main` | `foundation_docs` |
| 7 | Feature packages enriched (#2362) | On `main` | `feature_docs` |
| 8 | Control docs enriched (#2363) | On `main` | `control_docs` |
| 9 | Support docs enriched (#2364) | On `main` | `support_docs` |
| 10 | `CONTRACT-FROZEN: content-asset-model v1` posted | On program issue when required | `contract_frozen` |
| 11 | Implementation child issue with exact allowlist | Per package doc | `child_issue_ready` |
| 12 | Design authority cited for UI work | `LGFC-Production-Design-and-Standards.md` + route design | `design_cited` |

## Pre–#2365 terminal promotion

| # | Check | Pass criteria | Status field |
| ---: | --- | --- | --- |
| 13 | Package index reflects promoted paths | `docs/ops/implementation-plans/content-collection/package-index.md` | `index_current` |
| 14 | Diataxis promotion map status fields current | `content-collection-diataxis-promotion-map.md` | `promotion_map_current` |
| 15 | Deferred/risk registers reviewed | Support docs on `main` | `registers_current` |
| 16 | VAL-001 evidence template fillable | `val-001-integrated-program-validation-package.md` | `validation_plan_ready` |
| 17 | No open post-merge queue blocker | No unresolved `post-merge-failure` exception blocking queue | `queue_unblocked` |

## Stop rules

Stop and post `CHATGPT HANDOFF` when:

- Operational doc conflicts with `docs/ops/pmo/PMO-V4-OPERATING-MODEL.md`, PR lifecycle, or shared agent rules.
- Accelerated Policy / pre-approved merge language appears in promoted docs (C1/C8).
- Proposed path reintroduces `docs/ops/programs/`.

## Validation

Before claiming readiness on a docs PR:

```bash
bash scripts/ci/docs_check_headers.sh
node scripts/ci/diataxis_folder_audit.mjs
node .agents/checks/agent-governance-check.mjs
```

Record PASS/FAIL in PR body.

## Procedure

1. Copy this checklist into the source issue or terminal closeout issue.
2. Mark each row `pass` / `fail` / `deferred` with evidence link.
3. **No-go** if any blocking row is `fail` without approved deferral issue.
4. **Go** when all required rows for the target gate are `pass`.

## Execution

Use gate-specific subsets:

- **Enrichment PR:** rows 1–5.
- **Implementation launch:** rows 6–12.
- **#2365 closeout:** rows 13–17.
