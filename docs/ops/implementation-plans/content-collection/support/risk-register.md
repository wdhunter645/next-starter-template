---
Doc Type: Implementation Plan
Audience: Bill, ChatGPT, Cursor
Authority Level: Operational Register (living document for #2359 program)
Owns: Content Collection program risk register — triggers, mitigations, owners, and stop rules
Does Not Own: Risk acceptance decisions, insurance/compliance sign-off, or automatic halt enforcement
Canonical Reference: /docs/ops/reports/content-collection-docs-audit-dedup-2360.md
Related Issues: #2364, #2359, #2360, #2286, #1738
Last Reviewed: 2026-07-21
---

# Risk Register — Content Collection

## Purpose

Track program risks for the Content Collection successor program (#2359) with repo-grounded mitigations and explicit stop rules. Pair with `deferred-work-register.md` to prevent scope creep.

## Scope

**In scope:**

- Risks from intake draft enriched with live repo paths and issue linkage.
- Stop rules Cursor must apply without interpretation.
- Review cadence before major program transitions.

**Out of scope:**

- Enterprise risk management outside repository execution.
- Automatic risk scoring tooling.

## Current known truth

- #2364 support docs merged via PR #2419; post-merge closeout exception #2421 opened for undispositioned reviewer findings.
- This remediation (#2422) addresses advisory findings without reopening #2364 substantively.
- Queue advancement toward #2365 remains blocked until #2363 and #2364 remediation paths clear.
- R-006 pause threshold aligns with review throttle: pause at **3 or more** ready-for-review PRs.

## Intended final state

- Every major program risk has mitigation, owner, trigger, and imperative stop rule.
- Risk register reviewed at each major program transition and at VAL-001 closeout.
- Closed risks retain history with evidence links; open risks have active mitigations.

## Risk fields

Each risk entry includes:

| Field | Description |
| --- | --- |
| ID | Stable identifier (R-###) |
| Risk statement | What can go wrong |
| Affected lane | Docs, content model, feature, CI, PMO, etc. |
| Probability | low \| medium \| high (qualitative) |
| Impact | low \| medium \| high \| critical |
| Trigger | Observable condition |
| Mitigation | Preventive controls |
| Owner | Bill \| ChatGPT \| Cursor |
| Status | open \| mitigated \| accepted \| closed |
| Stop rule | Mandatory Cursor halt condition |

## Risk inventory

| ID | Risk | Lane | P | I | Trigger | Mitigation | Owner | Status | Stop rule |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| R-001 | Duplicate #2286 implementation | Content model / runtime | medium | critical | New code rebuilds candidate repo, admin API, media ref, audit layers | CC-001 inheritance rule; package review; classify consume/extend/defect/adapter | Cursor | open | **Stop** affected task if duplicate foundation work appears |
| R-002 | #1738 issue graph confusion | PMO / issues | medium | high | Implementation uses #1738 children as active tasks instead of #2359 successors | #1738 successor decision doc; clean #2359 child chain; launch playbook serial order | ChatGPT | open | **Pause** issue creation if graph root unclear |
| R-003 | Parallel file conflicts | All implementation | high | high | Multiple Cursor sessions edit same paths | Worktree standard (when promoted); allowlists; hot-zone halt; parallel-agent Rule 1 | Cursor | open | **Pause** affected lane on path collision |
| R-004 | Shared content model drift | Feature lanes | high | critical | GAL/LIB/MEM start before CC-001/CC-002 frozen | CONTRACT-FROZEN markers verified (#2433/#2434); feature child issues still require Bill / ChatGPT authorization | ChatGPT | mitigated-open | **Block** auto-launch; allow only authorized allowlisted feature children |
| R-005 | CI scope creep | CI / workflows | medium | high | CI PR edits feature files or unsafe auto-repair | CI-001/CI-002 packages; Stage 0 inventory-first; dry-run-first; Phase 0 docs-only boundary | Cursor | open | **Serialize or defer** CI workflow work on collision |
| R-006 | Review backlog | PMO / PR queue | high | medium | 3 or more PRs ready-for-review; ChatGPT/Bill capacity exceeded | Review throttle standard; draft staging; `CHATGPT HANDOFF` discipline | ChatGPT | open | **Pause** new ready-for-review PRs when queue reaches 3 |
| R-007 | Design drift | Feature UI | medium | high | Functional pages miss LGFC design standards | `lgfc-design-compliance` skill; visual evidence in PR | Cursor | open | **Hold** UI lane until design review |
| R-008 | Exposure / privacy defect | Feature / publication | low | critical | Private or unapproved content displays publicly | CC-002 contract; rights model; validation fixtures | Cursor | open | **Block** affected lane until fixed |
| R-009 | Documentation sprawl | Docs / governance | medium | high | Drive drafts promote into duplicate repo SOTs | #2360 audit; dedup disposition; Diataxis promotion map; one issue per PR | ChatGPT | open | **Block** promotion until disposition set |
| R-010 | Deferred work leakage | All lanes | medium | high | AI, OCR, crawler, paid deps, Codex, accelerated merge enter wave | Deferred work register; package out-of-scope; stop rules | Cursor | open | **Stop** task; post `CHATGPT HANDOFF` |
| R-011 | Label/status model mismatch | PMO | medium | medium | Proposed labels conflict with PMO July 2026 or repo inventory | Label addendum marks PROPOSED vs verified; defer to PMO July 2026 | ChatGPT | open | **Stop** if PMO decision required (#2364 stop rule) |
| R-012 | Queue stall after predecessor close | PMO / dispatch | high | high | Successor blocked/missing wake labels after #2360-style closeout | Queue-watch protocol; regression case #2360→#2361; `agent:cursor` + `handoff:ready` | ChatGPT | open | **Create remediation issue**; do not assume Cursor engaged |
| R-013 | Post-merge closeout failure | CI / ops | medium | high | Merge with failed gate or broken successor disposition | Closeout protocol; post-merge runbooks; `post-merge-failure` remediation | Cursor | open | **Halt** queue advance until dispositioned |
| R-014 | Parser-unsafe PR body | PR governance | medium | high | PR body missing Issue line, ZIP checkbox, or allowlist drift | PR template; lgfc-pr-governance skill; CORE preflight | Cursor | open | **Do not** mark ready until parser requirements met |
| R-015 | Intake branch drift | Docs | low | medium | Cursor reads stale `.docx` not reconciled with main | Intake on `atlas/drive-draft-intake-2367` non-authoritative; enriched docs on main | Cursor | mitigated | **Stop** if enriched doc missing — do not promote from `.docx` alone |

## Stop rule summary (quick reference)

Cursor must halt and post `CHATGPT HANDOFF` when:

1. Duplicate #2286 foundation work detected (R-001).
2. Issue graph root ambiguous (R-002).
3. Hot-zone / allowlist path collision (R-003).
4. Feature lane without CONTRACT-FROZEN (R-004).
5. CI changes exceed authorized scope (R-005).
6. Review queue reaches 3 or more ready-for-review (R-006).
7. Public exposure / rights defect (R-008).
8. Promotion without #2360 disposition (R-009).
9. Deferred register item in scope without authorization (R-010).
10. Label model requires PMO decision (R-011).
11. Successor missing wake labels after predecessor close (R-012).

## Mitigation cross-references

| Risk cluster | Primary docs |
| --- | --- |
| R-001, R-004, R-008 | `docs/ops/implementation-plans/content-collection/packages/cc-001-*.md`, `cc-002-*.md` |
| R-003, R-005 | `support/review-throttle-pr-queue-standard.md`; `docs/how-to/ops/cursor-parallel-worktree-standard.md` (when promoted) |
| R-006, R-012, R-013 | `docs/ops/pmo/queue-watch-and-dispatch-protocol.md`, `docs/ops/pmo/github-issue-closeout-protocol.md` |
| R-009, R-010, R-011 | `docs/ops/reports/content-collection-docs-audit-dedup-2360.md`, `support/deferred-work-register.md`, `support/github-label-status-mapping-addendum.md` |
| R-014 | `docs/governance/PR_LIFECYCLE_STATE_MACHINE.md`, `.agents/skills/lgfc-pr-governance/SKILL.md` |

## Review cadence

Review this register:

| Event | Action |
| --- | --- |
| Before GitHub issue creation (#2359 children) | Scan R-002, R-009, R-010, R-011 |
| Before CC-001/CC-002 implementation | Scan R-001, R-004, R-008 |
| Before parallel feature wave | Scan R-003, R-004, R-006, R-007 |
| Before CI workflow implementation | Scan R-005, R-013, R-014 |
| Before final program closeout (VAL-001) | Full register review; close or carry forward |

## Update procedure

1. New risks discovered during Cursor execution → log in issue comment first.
2. Accepted mitigations → update this register in scoped docs PR with source issue link.
3. Closed risks → set status `closed` with evidence (issue/PR reference); do not delete rows.
4. Risk acceptance requiring Bill decision → `CHATGPT HANDOFF` with `disposition-proposed`.

## Acceptance criteria

- [ ] Every major program risk has mitigation, owner, trigger, and stop rule.
- [ ] Stop rules are imperative — no "consider pausing" language.
- [ ] Cross-links to enriched packages and support docs.
- [ ] #2360 conflicts C1–C9 reflected in risk set.
- [ ] Queue-stall regression (R-012) documented from live #2360 experience.

## Source intake mapping

| Intake draft | Enriched doc |
| --- | --- |
| `LGFC Risk Register — Content Collection Draft.docx` | This file |

Remapped from rejected `docs/ops/programs/content-collection/risk-register.md` per #2360 C7.
