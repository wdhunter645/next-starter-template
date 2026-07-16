---
Doc Type: Operations
Audience: Bill, Atlas, Cursor, LGFC maintainers, and reviewers
Authority Level: Controlled
Owns: Task #1723 durable evidence reconciling PR readiness, batch review, and merge authority for main vs Model B component paths under Program #1719
Does Not Own: Workflow YAML, CI scripts, runtime code, issue mutation, or Cursor self-merge to main
Canonical Reference: /docs/governance/PR_PROCESS.md
Related Issues: #1723, #1719, #1722, #1724
Last Reviewed: 2026-07-16
---

# PR Readiness and Merge Authority Control (#1723)

## Purpose

Reconcile PR process/governance docs for readiness, batch review, human review,
and merge authority after Tasks `#1720`–`#1722`.

## Authority updates

| Document | Change |
| --- | --- |
| `docs/governance/PR_PROCESS.md` | Added merge-authority and batch-review rules; Model B delivery-profile body requirements; no new custom gates by default |
| `docs/governance/PR_GOVERNANCE.md` | Added merge-authority summary pointing to `PR_PROCESS.md` |

## Checklist

- [x] `READY FOR REVIEW` ≠ merge authority for `main`
- [x] Bill/ChatGPT approve merges to `main`
- [x] Non-`main` Model B / `component-auto-integration` allowed when source issue authorizes
- [x] Batch review preserves one issue per PR and does not grant Cursor `main` merge authority
- [x] Protected governance review retained for `#1723` / `#1724`
- [x] Continuation matrix cross-linked from `#1722`
- [x] No new custom gates added

## Out of scope

- Runtime / workflow YAML / CI scripts / package / website files
- Issue mutation
- Cursor approval or merge to `main`

## Successor

Task `#1724` — Issue mutation and closeout permission policy (also protected
governance review).
