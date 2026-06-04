---
Doc Type: Operational Rules
Audience: Human + AI
Authority Level: Operational
Owns: PR lifecycle execution standard
Does Not Own: Design authority
Canonical Reference: /docs/ops/ai/SHARED-AGENT-RULES.md
Last Reviewed: 2026-06-04
---

# PR Lifecycle Standard

ChatGPT-specific lifecycle ownership: [`CHATGPT-RULES.md`](./CHATGPT-RULES.md). Shared PR and gate law: [`SHARED-AGENT-RULES.md`](./SHARED-AGENT-RULES.md).

## Model

1. PR is created in DRAFT state by ChatGPT
2. AI agents execute work until all checks pass
3. ChatGPT marks PR as Ready for Review
4. Human decides merge

## Execution Rules

- PR must not remain idle
- PR must progress toward passing checks
- No reviewer assignment before Ready state
- ChatGPT owns PR progression
- AI agents support execution only

## Ready for Review Condition

A PR is Ready when:

- All CI checks pass
- OR work is complete and validated

## Ownership

- ChatGPT = PR owner
- Copilot = execution support
- Cubic = reviewer
- Human = approval authority
