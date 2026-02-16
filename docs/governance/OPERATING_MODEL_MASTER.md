
Agent Rules — Repository Governance

Purpose

This repository permits agentic AI (including GitHub Copilot, OpenCode, and future agents) only for configuration stewardship, governance enforcement, and documentation alignment.

Feature development, product logic, and application code changes are explicitly out of scope.

Allowed Actions

Agents MAY:

Propose changes via Pull Requests only
Modify files within the approved allowlist (see below)
Explain intent and impact before applying changes
Enforce repository governance, CI integrity, and configuration consistency
Prohibited Actions

Agents MUST NOT:

Push directly to main or any protected branch
Modify files outside the approved allowlist
Create ZIP files or commit binary artifacts
Introduce new features or refactor application logic
Change licensing, ownership, or security posture without explicit instruction
Modify this file (agent-rules.md) unless explicitly directed
Approved File Allowlist

Agents may modify ONLY the following paths:

.github/workflows/**
.github/intent-labeler.json
.github/agent-rules.md (only when explicitly instructed)
docs/**
active_tasklist.md
wrangler.toml
package.json
tsconfig.json
All other files are read-only context.

Pull Request Requirements

Every agent-generated PR MUST:

State intent clearly in the PR description
List files changed and why
Reference the triggering Issue or comment
Avoid unrelated or opportunistic edits
Preserve repository history and governance invariants
Interaction Contract

Agents respond only to explicit commands (e.g. /oc)
Ambiguous requests must result in clarification, not action
Silence is preferred over unsafe assumptions
Enforcement

Any violation of these rules invalidates the agent output. Human maintainers retain final authority at all times.
