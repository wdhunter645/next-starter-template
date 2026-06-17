---
Doc Type: Operational Rules
Audience: All AI Agents
Authority Level: Core
Owns: Categorized shared agent law for all LGFC repository agents
Does Not Own: Tool-specific execution behavior, ChatGPT control-plane doctrine, design authority, workflow implementation, or merge approval
Canonical Reference: /Agent.md
Last Reviewed: 2026-06-17
---

# SHARED-AGENT-RULES.md

## Purpose

This document is the single categorized index for **shared agent law** — rules that apply to Bill (human operator), ChatGPT/Atlas, Cursor, Codex (inactive), Copilot, Devin, and future repository agents.

Canonical LGFC AI team roles, modes, and workflow: [`LGFC-AI-TEAM-OPERATING-MODEL.md`](./LGFC-AI-TEAM-OPERATING-MODEL.md).

Detailed execution rules, gate-troubleshooting sequences, and routing priority live in [`CORE-RULES.md`](./CORE-RULES.md). Tool-specific behavior lives in the agent-specific files listed under [Tool-specific rules](#tool-specific-rules).

Do not duplicate long doctrine in agent-specific files. Link here instead.

---

## Authority and reading order

All agents must start at [`Agent.md`](../../../Agent.md) and follow the **mandatory documentation chain** before any repo work:

1. [`Agent.md`](../../../Agent.md) — mandatory entry point and routing authority
2. [`LGFC-AI-TEAM-OPERATING-MODEL.md`](./LGFC-AI-TEAM-OPERATING-MODEL.md) — canonical team roles, modes, and workflow
3. This document (categorized shared law)
4. [`CORE-RULES.md`](./CORE-RULES.md) (detailed shared execution)
5. Applicable agent-specific rule file (see [Tool-specific rules](#tool-specific-rules); additive only)
6. Applicable repo governance and procedure docs — source GitHub issue, task-linked authority files, and for PR/issue/review/remediation/implementation work: `.agents/skills/lgfc-pr-governance/SKILL.md`, `.github/pull_request_template.md`, `docs/governance/PR_LIFECYCLE_STATE_MACHINE.md`, and linked governance docs
7. Applicable repository skills under `.agents/skills/` when the task matches a trigger

Agent-specific docs do not replace shared/core rules or repo governance. Task prompts do not override this chain.

When sources conflict, follow the higher authority and stop until the conflict is resolved.

---

## 1. Evidence before factual claims

Agents must not present assumptions as facts.

Before any readiness, closeout, or governance claim:

- Read the source issue.
- Read task-relevant design, architecture, governance, or implementation-plan files linked from the source issue.
- Inspect the actual changed files and live PR state when the claim depends on PR status.

Fact handling:

- Verify facts against repository files, workflow outputs, or cited sources.
- Cite sources when available.
- If unverifiable, state that explicitly.

No guessing. No memory-over-repo claims.

Expanded detail: [`CORE-RULES.md` — Required verification](./CORE-RULES.md#required-verification), [Verification doctrine](./CORE-RULES.md#verification-doctrine).

---

## 2. Repository docs are source of truth

Use this operational truth order when signals conflict:

1. Live PR check panel state.
2. Latest head workflow runs and failed job logs.
3. Workflow files and enforcement scripts in the repository.
4. GitHub review-thread state.
5. PR body issue-accounting and reviewer-accounting sections.
6. Governance and AI operational documentation.
7. Prior conversation memory or agent assumptions.

Repository documentation taxonomy:

- Content, design, reference, tutorial, how-to: `/docs/explanation/`, `/docs/how-to/`, `/docs/reference/`, `/docs/tutorials/`.
- Governance, operations, templates, and active AI-agent operating documents: `/docs/governance/`, `/docs/ops/`, `/docs/templates/`.
- Do not create a folder named `DIATAXIS`.

Every task and PR must report documentation source classification (`DIATAXIS_FULL`, `DIATAXIS_ROUTED`, or `LEGACY_FALLBACK`) per [`CORE-RULES.md` — Documentation source tracking](./CORE-RULES.md#documentation-source-tracking).

Expanded detail: [`CORE-RULES.md` — Operational truth hierarchy](./CORE-RULES.md#operational-truth-hierarchy), [Source of truth handling](./CORE-RULES.md#source-of-truth-handling).

---

## 3. One source issue per PR

Normal repository work is issue-first.

- Create or identify exactly one open, same-repository, non-PR source issue before opening a PR.
- One task → one issue → one PR.
- No mixed intent in one PR unless the source issue explicitly allows it.
- PR-first work is an exception for documented operations troubleshooting only.
- GitHub issues and pull requests are the authoritative execution record; tracker files are historical indexes unless the source issue explicitly authorizes tracker edits.

Expanded detail: [`CORE-RULES.md` — Issue-first PR discipline](./CORE-RULES.md#issue-first-pr-discipline), [Execution discipline](./CORE-RULES.md#execution-discipline).

---

## 4. Parser-safe PR body discipline

The PR body is the execution contract. Gates parse exact syntax.

Before opening or marking a PR ready:

- Include exactly one trusted source-issue line: `- **Issue:** #123`.
- Do not use hash syntax for additional source issues unless a gate explicitly allows it.
- Include ZIP safety wording exactly: `- [x] No ZIP file exists in the repo root`.
- Keep the file-touch allowlist aligned with the final diff.
- Use exactly one intent label.
- Include required template sections from `.github/pull_request_template.md`.
- Apply the PR lifecycle state machine in `docs/governance/PR_LIFECYCLE_STATE_MACHINE.md`.
- For `docs/**` changes: authority header, correct document type, and how-to procedure headings where required.

If any parser requirement is uncertain, fix the source issue or preflight documentation first. Do not open the PR.

Skill reference: `.agents/skills/lgfc-pr-governance/SKILL.md`.

Expanded detail: [`CORE-RULES.md` — Cursor-style PR preflight standard](./CORE-RULES.md#cursor-style-pr-preflight-standard), [PR discipline](./CORE-RULES.md#pr-discipline).

---

## 5. Gate and workflow inspection before readiness claims

A gate failure is the agent's responsibility until repository evidence proves otherwise.

Before claiming merge-readiness or "ready for review":

1. Inspect the live PR check panel.
2. Confirm PR issue-accounting (exactly one primary source issue).
3. Inspect PR body sections, allowlist, ZIP safety, and acceptance criteria.
4. Inspect GitHub review-thread state; resolve addressed threads in PR review state.
5. Inspect latest head workflow runs for every required gate.
6. Read failing job logs and relevant workflow or enforcement scripts before documenting gate behavior.
7. For merge-readiness claims, record or verify the pre-merge closeout prediction required by `docs/governance/PR_LIFECYCLE_STATE_MACHINE.md`.

A green reviewer gate alone does not mean the PR is ready for merge approval.

Expanded detail: [`CORE-RULES.md` — PR gate readiness troubleshooting](./CORE-RULES.md#pr-gate-readiness-troubleshooting).

Canonical governance: `docs/governance/standards/governance-enforcement-standard.md`.

---

## 6. Unresolved review-thread handling

- Inspect GitHub review-thread state before readiness claims.
- Resolve or explicitly address threads required by gate logs.
- Add maintainer acknowledgments when high-severity review findings require them per gate logs.
- Reconcile reviewer-accounting, thread-resolution state, issue-accounting, pre-merge closeout prediction, review-level acknowledgments, and required checks together.

Expanded detail: [`CORE-RULES.md` — PR gate readiness troubleshooting](./CORE-RULES.md#pr-gate-readiness-troubleshooting).

---

## 7. Documentation taxonomy compliance

Documentation PRs must:

- Use the active DIATAXIS transition structure (see `.agents/skills/lgfc-docs-authority/SKILL.md`).
- Include the required authority header on every active Markdown document.
- Identify canonical reference, scope boundaries, validation method, and closeout criteria.
- Stay within the source issue file allowlist.

Do not route new agent-governance documentation to superseded paths.

---

## 8. ZIP and repository root safety

- No ZIP files in the repository root.
- If a ZIP snapshot is provided for inspection, treat ZIP contents as truth for that session; do not let memory override ZIP evidence.
- Do not commit ZIP files, build output, screenshots, or temporary artifacts.
- PR body must include the exact ZIP safety checkbox required by parsers.

---

## 9. No secret exposure

Agents must not:

- Commit secrets, tokens, API keys, or local-only credential files.
- Add external service calls or undocumented integrations as part of agent work unless the source issue explicitly authorizes implementation (not documentation-only tasks).

---

## 10. Scope boundaries — no broad unapproved changes

Agents must not:

- Modify files outside the approved allowlist.
- Perform opportunistic cleanup, unrelated fixes, or mixed-intent diffs.
- Redesign routes, layout, or structure without explicit design authority.
- Create duplicate governance files or alternate canonical versions.
- Expand task scope; log discovered work in the source issue instead.
- Add routine tracker/status-index edits unless the source issue explicitly authorizes them.

If additional work is discovered → record it in the source issue. Do not execute it in the current PR.

Expanded detail: [`CORE-RULES.md` — Drift prevention](./CORE-RULES.md#drift-prevention), [Mandatory stop conditions](./CORE-RULES.md#mandatory-stop-conditions).

---

## Tool-specific rules

Shared law above applies to every agent. The following documents add **tool-specific behavior only** — they must not weaken shared law.

**LGFC implementation routing:** Cursor is the **sole** active LGFC implementation executor. Codex is **inactive/out** unless Bill explicitly reauthorizes it in a future governance update. Do not assign LGFC implementation work to Codex.

| Agent / surface | Document | Owns |
| --- | --- | --- |
| Bill (human) | — | Project owner, final authority, PR approval, gate authorization |
| ChatGPT / Atlas | [`CHATGPT-RULES.md`](./CHATGPT-RULES.md) | Design authority, documentation PR/package authority, program and child issue authorship, launch-control packages, gate review partnership with Bill |
| Cursor | [`CURSOR-RULES.md`](./CURSOR-RULES.md) | **Sole** LGFC implementation execution, pre-implementation package review, continuous execution within scope |
| Codex | [`CODEX-RULES.md`](./CODEX-RULES.md) | **Inactive/out** — no LGFC implementation assignments unless future Bill-approved reauthorization |
| Copilot | [`COPILOT-RULES.md`](./COPILOT-RULES.md) | Scoped PR-based implementation (not default LGFC routing) |
| Devin | [`DEVIN-RULES.md`](./DEVIN-RULES.md) | Draft-PR boundary and constrained contributor behavior (not default LGFC routing) |
| AI execution bridge | *Future phase* | Label-triggered bounded automation — not active unless explicitly implemented and documented in a source issue |

Canonical operating model: [`LGFC-AI-TEAM-OPERATING-MODEL.md`](./LGFC-AI-TEAM-OPERATING-MODEL.md).

Cross-agent handoff and role mapping: [`ops/ai/CROSS-AGENT-OPERATING-RULES.md`](../../../ops/ai/CROSS-AGENT-OPERATING-RULES.md) (supporting reference; operating model wins on team-role conflict).

Long-form governance: [`governance/ai/AGENT-GOVERNANCE.md`](../../../governance/ai/AGENT-GOVERNANCE.md).

---

## Merge and human approval

Merge authority remains human/operator only for all agents.

Issue and pull request creation permissions vary by agent; see agent-specific rules and [`CORE-RULES.md` — Capabilities](./CORE-RULES.md#capabilities).

---

## Final

All agents enforce shared law first, then their tool-specific rules. When in doubt, inspect repository evidence and stop rather than improvising.
