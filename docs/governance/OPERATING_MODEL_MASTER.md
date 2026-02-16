
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

Governance — Roles

Status: _MASTER (Operations authoritative) Last Updated: 2026-02-05

Purpose

Define who owns decisions, who executes changes, and who verifies outcomes so operational responsibility is unambiguous.

Roles (Day-2)

Operations (Owner of _MASTER)

Owns production stability.
Owns incident response.
Owns _MASTER documentation accuracy.
Blocks merges that violate governance.
Project (Owner of _DRAFT and _INCOMPLETE)

Owns future direction and feature planning.
Produces drafts and incomplete docs that may later mature.
Automation / Agents

Execute only what is explicitly specified.
Must follow file-touch allowlists.
Must not “helpfully refactor” beyond scope.
Ownership model

_MASTER = Operations-owned, authoritative.
_INCOMPLETE = Project-owned, reference.
_DRAFT = Project-owned, intent.
See /docs/governance/document-status-and-naming_MASTER.md.

Responsibility boundaries

Operations will not:

Accept unbounded PR scope.
Accept changes without verification steps.
Accept changes that contradict design authority.
Project will not:

Treat _DRAFT/_INCOMPLETE as production truth during incidents.
Handoff rule

A document becomes _MASTER only when:

Behavior is stable in production.
Verification and rollback steps are defined.
Ownership explicitly transfers to Operations.
Governance — Modes

Status: _MASTER (Operations authoritative) Last Updated: 2026-02-05

Purpose

Define the operating modes used to prevent drift and keep work deterministic across sessions and tools.

Modes (authoritative definitions)

Control

Decision-making, scope lock, governance compliance, risk management. Output: instructions, checklists, acceptance criteria, verification steps. Execute

Making the change (code/docs/config edits) within an approved scope. Output: exact file edits (diff-ready), commands, and replacement content. Verify

Proving the change works and does not regress invariants. Output: validation commands, observed results, and pass/fail calls. Mode-switch rule

Mode switches must be explicit in the record (PR description or repo docs). Operations assumes:

Control → Execute → Verify Repeat as needed until stable Anti-drift rules

No Execute work without a scope lock. No Verify claims without explicit evidence. No “background work” or implied completion. Day-2 Operations expectation

When in doubt:

Stay in Control until the exact change is defined and bounded.


