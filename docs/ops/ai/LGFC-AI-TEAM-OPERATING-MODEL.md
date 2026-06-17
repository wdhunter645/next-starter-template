---
Doc Type: Operational Rules
Audience: Human + AI
Authority Level: Core
Owns: LGFC AI team roles, operating modes, authority boundaries, and end-to-end workflow requirements
Does Not Own: Shared agent law detail, tool-specific execution behavior, product design, merge approval, or runtime implementation
Canonical Reference: /Agent.md
Related Issues: #1754
Last Reviewed: 2026-06-17
---

# LGFC AI Team Operating Model

## Purpose

This document is the **canonical operating model** for the LGFC AI team: who owns what, which modes apply, how work flows from requirements to closeout, and where agents must stop for human authorization.

Shared agent law remains in [`SHARED-AGENT-RULES.md`](./SHARED-AGENT-RULES.md) and [`CORE-RULES.md`](./CORE-RULES.md). Tool-specific behavior remains in agent-specific rule files. This document does not weaken shared law.

## Scope

This document applies to all LGFC repository work coordinated through Bill, Atlas (ChatGPT), Cursor, and historical Codex references.

This document does not own product design content, workflow YAML, runtime code, or final merge approval.

## Current known truth

As of 2026-06-17 (issue #1754):

- **Bill** is project owner and final authority.
- **Atlas** (ChatGPT) is design and launch-control package authority.
- **Cursor** is the **sole** LGFC implementation executor.
- **Codex** is **inactive/out** for LGFC implementation unless Bill explicitly reauthorizes it in a future governance update.

Prior routing that listed Codex as a primary or secondary implementation agent is superseded for LGFC work by this document and the aligned agent rule files.

## Intended final state

Every LGFC task follows one predictable path: Bill defines requirements → Atlas and Bill finalize design → Atlas publishes a documentation package → Bill approves → Atlas creates program and child issues → Cursor reviews the launch-control package → Bill/Atlas authorize execution → Cursor implements within scope with verification stop points → Atlas and Bill review gates → Bill authorizes continue, hold, or revise.

---

## Team roles

### Bill — project owner / final authority

Bill owns:

- project requirements and final product decisions;
- PR approval and merge authorization;
- verification-gate authorization (continue, hold, or revise);
- final authority when sources conflict above the source issue.

Bill does not perform routine scoped file implementation when Cursor is the assigned executor.

### Atlas (ChatGPT) — design and launch-control authority

Atlas owns:

- design authority and design-package preparation;
- documentation PR and documentation-package authority;
- program master issue authorship;
- child issue authorship under approved programs;
- launch-control-ready work-package authorship;
- draft/reference implementation packages and pseudocode for Cursor handoff;
- gate review as Bill's partner before Bill authorizes continue/hold/revise.

Atlas does not perform scoped repository implementation when Cursor is the assigned executor unless the source issue explicitly assigns implementation to Atlas.

### Cursor — sole implementation executor

Cursor owns:

- all scoped LGFC implementation execution (code, configuration within allowlist, documentation implementation when assigned);
- pre-implementation review and comment on newly authored launch-control issue packages before execution begins;
- continuous execution within approved scope between authorized stop points;
- stopping at verification gates and reporting evidence before requesting continuation authorization.

Cursor does not own design authority, scope definition, merge approval, or gate authorization.

### Codex — inactive / out

Codex is **not** an active LGFC implementation path.

Rules:

- Do not assign LGFC implementation work to Codex.
- Do not route new product or repository implementation tasks to Codex.
- Codex may be reactivated only through an explicit future governance update approved by Bill.

Historical Codex documentation remains for reference only. On conflict, this operating model and [`CODEX-RULES.md`](./CODEX-RULES.md) control.

---

## Operating mode taxonomy

Every LGFC repository task must be classified into **exactly one** mode before action. Do not mix modes in one PR unless the source issue explicitly allows it.

| Mode | Purpose | Typical owner |
| --- | --- | --- |
| **Design** | Architecture, decomposition, implementation strategy, acceptance framing | Atlas (+ Bill review) |
| **Documentation** | Canonical docs, how-to, reference, governance alignment, documentation PRs | Atlas (author) / Cursor (when assigned to implement doc changes) |
| **Governance** | Agent rules, PR discipline, authority alignment, process compliance | Atlas / Cursor per assignment |
| **Worklist** | Program hierarchy, queue organization, issue structure, closeout state | Atlas |
| **Verification** | PR/issue/CI inspection, post-merge validation, evidence reporting | Atlas / Cursor per assignment |
| **Troubleshooting** | Failed gates, broken workflows, inconsistent issue/PR state | Atlas (coordinate) / Cursor (when assigned to fix) |
| **Implementation** | Scoped file changes within an approved allowlist | **Cursor only** |
| **Operations cleanup** | Stale ops noise, remediation classification, blocked-workflow residue | Atlas (coordinate) / Cursor (when assigned) |

Mode names in agent assignments and issue packages must match this table.

---

## End-to-end workflow

```text
Bill defines requirements
        ↓
Atlas + Bill finalize design
        ↓
Atlas creates documentation package PR
        ↓
Bill reviews / approves documentation PR
        ↓
Atlas creates program master issue + child issues
        ↓
Cursor reviews launch-control issue package (comment / checkpoint)
        ↓
Bill / Atlas authorize execution
        ↓
Cursor implements continuously within scope
        ↓
Cursor stops at verification gates
        ↓
Atlas + Bill review gates
        ↓
Bill authorizes continue / hold / revise
```

### Step detail

1. **Bill defines requirements** — outcome, constraints, and priority. Requirements may start informal; Atlas converts them into repository-ready authority.
2. **Atlas and Bill finalize design** — locked design references, route/layout invariants, acceptance framing, and explicit non-goals.
3. **Atlas creates documentation package PR** — canonical docs that define what will be built, where it lives, and how it will be verified. Documentation PRs are docs-only unless the source issue explicitly authorizes otherwise.
4. **Bill reviews and approves documentation PR** — Bill is the approval authority for documentation packages that gate downstream work.
5. **Atlas creates master issue and child issues** — program container, scoped child tasks, exact allowlists, and launch-control fields per [`docs/templates/agent-assignment-template.md`](../../templates/agent-assignment-template.md).
6. **Cursor reviews issue package before implementation** — for newly authored launch-control packages, Cursor must review and comment on completeness (source issue, documentation package link, draft/reference code, allowlist, non-goals, acceptance criteria, verification plan, rollback plan) **before** editing files. Cursor stops if the package is incomplete.
7. **Bill / Atlas authorize execution** — explicit authorization to begin or continue implementation after Cursor's pre-implementation review checkpoint.
8. **Cursor implements continuously within scope** — one task, one issue, one PR; no scope expansion; respect shared agent law.
9. **Cursor stops at verification gates** — do not claim merge-readiness or request the next tranche of work until required local checks, PR gates, and review-thread obligations are satisfied or a documented blocker exists.
10. **Atlas + Bill review gates** — Atlas synthesizes PR evidence; Bill and Atlas partner on gate review before Bill's authorization decision.
11. **Bill authorizes continue / hold / revise** — continue to next queue item, hold for external dependency, or revise scope through updated issues/docs.

---

## Authority boundaries

| Decision | Authority |
| --- | --- |
| Requirements and final product call | Bill |
| Design and documentation package | Atlas |
| Documentation PR authorship | Atlas |
| Program / child issue authorship | Atlas |
| Launch-control package completeness | Atlas (author) + Cursor (pre-implementation review) |
| Implementation execution | **Cursor only** |
| Pre-implementation package review | Cursor (required comment/checkpoint) |
| Execution authorization | Bill / Atlas |
| Verification stop / continue | Bill (with Atlas gate-review partnership) |
| PR merge | Bill |
| Codex implementation routing | **Forbidden** unless future Bill-approved governance reauthorization |

---

## Launch-control package requirements

Before Cursor may execute implementation, the issue package must include:

- source issue (exactly one primary issue);
- documentation package (merged or explicitly approved PR reference);
- draft/reference code or pseudocode;
- file allowlist;
- non-goals;
- acceptance criteria;
- verification plan;
- rollback plan;
- Cursor review checkpoint (completed comment or explicit pass);
- Bill/Atlas stop-gate authorization for execution.

Use [`docs/templates/agent-assignment-template.md`](../../templates/agent-assignment-template.md) as the mandatory envelope format.

---

## Continuous execution and stop points

Cursor executes **continuously** within an authorized package — multiple commits and PR updates in one session — but must **stop** at:

- missing or incomplete launch-control package fields;
- scope ambiguity or allowlist conflict;
- completed implementation tranche pending verification;
- failing required gates on the PR head;
- unresolved review threads that block readiness;
- explicit Bill/Atlas hold instruction;
- any mandatory stop condition in [`SHARED-AGENT-RULES.md`](./SHARED-AGENT-RULES.md) or [`CORE-RULES.md`](./CORE-RULES.md).

After each stop point, Cursor reports evidence and waits for Bill/Atlas authorization before continuing beyond the current gate.

---

## Related canonical documents

| Document | Relationship |
| --- | --- |
| [`Agent.md`](../../../Agent.md) | Entry point; routes agents to this operating model |
| [`SHARED-AGENT-RULES.md`](./SHARED-AGENT-RULES.md) | Shared agent law for all agents |
| [`CORE-RULES.md`](./CORE-RULES.md) | Detailed execution rules |
| [`CHATGPT-RULES.md`](./CHATGPT-RULES.md) | Atlas-specific control-plane behavior |
| [`CURSOR-RULES.md`](./CURSOR-RULES.md) | Cursor implementation authority and review checkpoint |
| [`CODEX-RULES.md`](./CODEX-RULES.md) | Codex inactive status |
| [`docs/templates/agent-assignment-template.md`](../../templates/agent-assignment-template.md) | Mandatory assignment envelope |

---

## Final

This operating model is canonical for LGFC AI team roles, modes, and workflow. When agent docs conflict on team roles or implementation routing, this document and [`Agent.md`](../../../Agent.md) win after locked design and shared agent law.
