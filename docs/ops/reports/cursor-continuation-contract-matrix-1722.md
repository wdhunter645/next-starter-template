---
Doc Type: Operations
Audience: Bill, Atlas, Cursor, LGFC maintainers, and reviewers
Authority Level: Controlled
Owns: Task #1722 durable Cursor continuation/stop contract matrix for main vs Model B component-auto-integration vs continuous reduced-gate serial paths
Does Not Own: Workflow YAML implementation, CI script changes, merge to main, issue mutation, or protected governance policy authorship for #1723/#1724
Canonical Reference: /docs/reference/pmo/lgfc-cursor-execution-contract.md
Related Issues: #1722, #1719, #1720, #1721, #1723, #1724, #1725
Last Reviewed: 2026-07-16
---

# Cursor Continuation and Queue Contract Matrix (#1722)

## Purpose

Publish the authoritative continuation/stop matrix promised by Task `#1721`
gap G-01 and harden
`docs/reference/pmo/lgfc-cursor-execution-contract.md` for Program `#1719`.

## Authority

- Current PMO authority: `docs/ops/pmo/PMO-JULY-2026-OPERATING-MODEL.md`
- Cursor contract: `docs/reference/pmo/lgfc-cursor-execution-contract.md`
- Program `#1719` continuous reduced-gate authorization (2026-07-16)
- Operator rule: non-`main` component PRs may auto-merge; `main` requires
  Bill/ChatGPT approval

## Matrix

| Path | PR base | Cursor handoff | Merge authority | Successor rule |
| --- | --- | --- | --- | --- |
| Default / Model A | `main` | `READY FOR REVIEW` | Bill/ChatGPT | Explicit resume/launch unless continuous reduced-gate applies |
| Continuous reduced-gate to `main` | `main` | `READY FOR REVIEW` | Bill/ChatGPT | After merge + clean post-merge → next child |
| Model B component-auto-integration | `component/**` | No inter-child human review handoff | Atlas-controlled / authorized non-`main` auto-merge | After clean component integration → next child |
| Model B promotion | `main` | Review / protected as required | Bill/ChatGPT | Per promotion issue |
| Protected governance `#1723`/`#1724` | As named | Complete PR; independent governance review | Bill/ChatGPT | After authorized merge/integration |

## Material stops (all paths)

- Unresolved authority conflict without deterministic precedence
- Required work outside allowlist
- Unauthorized workflow/CI/runtime/secret/production/irreversible external change
- Material design or prioritization decision
- Required checks unremediable in child scope
- Unclean predecessor integration

Non-stops: routine PR transitions, normal review findings, documentation
placement, correctable validation failures.

## Program #1719 application

| Task | Status | Notes |
| ---: | --- | --- |
| #1720 | Complete on `main` (PR #2543) | Authority reconciliation |
| #1721 | Complete on component (PR #2545) | Gap inventory |
| #1722 | This task | Contract matrix |
| #1723 / #1724 | Protected governance review | Do not weaken |
| #1725 | Complete | Do not rerun |
| #1726 / #1727 | Later | Implementation candidates / terminal |

## Out of scope

- Workflow YAML / CI scripts
- Runtime / website / package files
- Issue mutation
- Merge or promotion to `main` from this child
