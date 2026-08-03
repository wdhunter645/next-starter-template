---
Doc Type: Implementation Plan
Audience: Bill, ChatGPT, Cursor, LGFC maintainers
Authority Level: Operational Plan (non-authoritative until promoted via Issue/PR)
Owns: Index and navigation for Content Collection support-control docs enriched under #2364
Does Not Own: PMO label authority, assignment template canonical form, merge authorization, or issue closure
Canonical Reference: /docs/ops/reports/content-collection-docs-audit-dedup-2360.md
Related Issues: #2364, #2359, #2360, #2361
Last Reviewed: 2026-07-10
---

# Content Collection Support Docs Index

## Purpose

Navigate the five support-control documents enriched from Drive intake drafts for program execution manageability during Cursor implementation and ChatGPT review.

## Scope

This index covers only the #2364 support set:

| Doc ID | Document | Primary use |
| --- | --- | --- |
| LABEL | [github-label-status-mapping-addendum.md](./github-label-status-mapping-addendum.md) | PMO fields, repo label reality, proposed labels |
| PROMPT | [cursor-assignment-prompt-pack.md](./cursor-assignment-prompt-pack.md) | Paste-ready Cursor Local prompts (supplements agent template) |
| THROTTLE | [review-throttle-pr-queue-standard.md](./review-throttle-pr-queue-standard.md) | PR queue limits, merge order, pause conditions |
| DEFERRED | [deferred-work-register.md](./deferred-work-register.md) | Out-of-wave scope tracking |
| RISK | [risk-register.md](./risk-register.md) | Program risks, mitigations, stop rules |

## Relationship to foundation packages

| Layer | Index | Issue |
| --- | --- | --- |
| Foundation packages | [../package-index.md](../package-index.md) | #2361 |
| Support control | This file | #2364 |

Support docs govern **how** tasks are assigned, labeled, queued, and halted. Foundation packages govern **what** is implemented in CC/CI/VAL envelopes.

## Current known truth

- Intake `.docx` files remain non-authoritative under `_incoming/` on `ChatGPT/drive-draft-intake-2367`.
- Rejected target root `docs/ops/programs/content-collection/` — remapped to `docs/ops/implementation-plans/content-collection/support/` per #2360 C7.
- Cursor assignment prompts supplement `docs/templates/agent-assignment-template.md`; they do not replace it.
- Label addendum defers to PMO July 2026 — not parallel label authority.
- Issue-first collaboration required before PR (#2364 Bill comment; Phase 0 playbook Step 3).

## Source intake mapping

| Intake draft | Enriched doc |
| --- | --- |
| `LGFC GitHub Label and Status Mapping Addendum — Content Collection Draft.docx` | `github-label-status-mapping-addendum.md` |
| `LGFC Cursor Assignment Prompt Pack — Content Collection Draft.docx` | `cursor-assignment-prompt-pack.md` |
| `LGFC Review Throttle and PR Queue Standard — Content Collection Draft.docx` | `review-throttle-pr-queue-standard.md` |
| `LGFC Deferred Work Register — Content Collection Draft.docx` | `deferred-work-register.md` |
| `LGFC Risk Register — Content Collection Draft.docx` | `risk-register.md` |

## Procedure

1. Read #2360 audit disposition before using support docs for promotion decisions.
2. Open the relevant support doc for assignment, queue, deferral, or risk questions.
3. Cross-check label addendum against live `gh label list` before proposing new labels.
4. Post `CHATGPT HANDOFF` when stop rules fire or PMO decision is required.
5. Do not open #2364 PR until issue-thread review completes per Bill working rule.

## Acceptance criteria

- [ ] All five intake drafts have enriched markdown counterparts.
- [ ] Index links resolve within allowlist.
- [ ] Cross-references to foundation package index and governance docs are accurate.
