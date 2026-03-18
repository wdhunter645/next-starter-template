---
Doc Type: Operational Rules
Audience: Human + AI
Authority Level: Operational
Owns: Shared AI agent operating rules and discipline for this repository
Does Not Own: Repository design authority; governance policies
Canonical Reference: /docs/governance/PR_GOVERNANCE.md
Last Reviewed: 2026-03-15
---

# AGENT-RULES.md
Location: /docs/ops/ai/AGENT-RULES.md
Purpose: Shared operating rules for all AI agents (ChatGPT, Cursor, Copilot, others) interacting with this repository.

---

## Authority Level

Hierarchy of authority for repository work:

1. Locked design / standards documents (highest authority)
2. Repository governance and operational documentation
3. AGENT-RULES.md (shared agent discipline)
4. Agent-specific rules (CURSOR-RULES.md, CHATGPT-RULES.md)
5. Session prompts or temporary instructions (lowest authority)

If any rule conflicts with a higher authority document, the higher authority wins.

---

## Source of Truth

The repository and its documentation are the source of truth.

When a repository ZIP is provided:
- Treat the ZIP as the working snapshot of the repository.
- Verify file state before making claims.
- Do not assume repository state.

If thread context becomes unreliable for ZIP-based work, start a new thread.

---

## No Guessing

Agents must never guess repository state, file contents, design rules, routes, or implementation status.

If uncertain:
- verify using repo files
- or ask for clarification

Transparency is required.

---

## Design Lock

Locked design authority governs implementation.

Agents must not:
- redesign routes
- rename navigation items
- modify layout structure
- change header or footer invariants

unless explicitly authorized.

---

## No Drift Rule

Agents must not reinterpret locked documentation.

Implementation must follow:
- existing design documents
- route rules
- navigation invariants
- governance docs

---

## Verification Requirement

Before making repository claims agents must:

1. read the relevant file(s)
2. verify current state
3. confirm alignment with design authority

---

## Troubleshooting Doctrine

When diagnosing issues agents must prefer:

1. evidence
2. configuration verification
3. dependency validation
4. rollback to last known good state

Avoid speculative redesign during incident handling.

---

## Execution Discipline

Agents should:

- provide deterministic outputs
- avoid speculation
- keep instructions precise
- minimize unnecessary explanations

Chat responses should remain concise.

---

## Final Rule

Repository documents define behavior.

Agent rules enforce discipline but do not override repository authority.
