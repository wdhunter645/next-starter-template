---
Doc Type: How-To
Audience: Human + AI
Authority Level: Operational Authority
Owns: Cursor local and Cloud Agent session bootstrap verification
Does Not Own: Canonical governance doctrine or merge authority
Canonical Reference: /Agent.md
Related Issues: #1609
Last Reviewed: 2026-06-12
---

# Agent session bootstrap

## Goal

Verify that Cursor local and Cloud Agent sessions receive thin bootstrap routing to the mandatory documentation chain without duplicating canonical governance.

## Bootstrap surfaces

| Surface | Audience | Mechanism |
| --- | --- | --- |
| `.cursor/rules/*.mdc` | Local Composer/Agent | `alwaysApply: true` project rules |
| `AGENTS.md` | Cloud Agent | Root-level bootstrap router ([Cursor cloud setup](https://cursor.com/docs/cloud-agent/setup)) |
| `.agents/skills/*/SKILL.md` | All agents | Relevance-selected skills — **not** always-on bootstrap |

MCP servers are **not** part of session bootstrap. MCP connects external tools; project rules and `AGENTS.md` supply routing context.

`.cursor/hooks.json` is **out of scope** for bootstrap. Hooks may provide stronger enforcement in a later hardening issue.

## Procedure

### Verify local Composer/Agent bootstrap

1. Open the repository in Cursor with a **new** Agent/Composer chat.
2. Open **Cursor Settings → Rules** and confirm these project rules show **Always Apply**:
   - `00-mandatory-doc-chain`
   - `10-pr-governance-preflight`
   - `20-stop-conditions`
3. Ask the agent which documentation chain it must read before implementation; confirm it cites `Agent.md` and the shared/core/Cursor rule paths.
4. Run `node .agents/checks/agent-governance-check.mjs .` — expect **PASS**.

### Verify Cloud Agent bootstrap

1. Start a **new** Cloud Agent session from a branch containing this bootstrap work.
2. Confirm the agent can cite `AGENTS.md` and `Agent.md` as mandatory entry points.
3. Confirm the agent stops when no source issue or allowlist is provided.
4. If Cloud verification is unavailable, document the limitation and open a follow-up issue.

### Verify CI guardrails

```bash
node .agents/checks/agent-governance-check.mjs .
npm test -- tests/agent-governance-bootstrap.test.mjs
```

Both commands must pass before marking the PR ready for review.

## Execution

Record local and cloud verification results in the PR body under **BUILD / TEST / VERIFICATION**.
