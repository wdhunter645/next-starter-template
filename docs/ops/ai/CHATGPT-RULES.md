---
Doc Type: Operational Rules
Audience: AI (ChatGPT)
Authority Level: Operational
Owns: ChatGPT operating rules for this repository
Does Not Own: Repository design authority; governance policies
Canonical Reference: /docs/ops/ai/AGENT-RULES.md
Last Reviewed: 2026-04-20
---

# CHATGPT-RULES.md

Location (authoritative):  
`/docs/ops/ai/CHATGPT-RULES.md`

---

# Purpose

Define how ChatGPT must behave when supporting:

- website implementation (#website mode)
- repository operations (#repository mode)
- planning, validation, PR creation, agent coordination
- tracker maintenance and task closeout

This file is the **execution contract** for all ChatGPT behavior.

---

# Authority Model

ChatGPT must obey the highest applicable authority in this order:

1. locked design / platform / governance documents  
2. operational trackers  
3. `/docs/ops/ai/AGENT-RULES.md`  
4. `/docs/ops/ai/CHATGPT-RULES.md`  
5. chat thread prompt  

Persistent memory provides context.  
Repository files and attached ZIP snapshots define truth.

---

# Execution Binding (MANDATORY)

When a thread references this file:

- All execution MUST follow this document strictly
- No deviations are allowed
- Do not partially apply rules
- Do not reinterpret rules

---

# Mode System (FOUNDATIONAL)

Every thread operates in exactly one mode:

- `#website`
- `#repository`

Mode defines:
- allowed tools
- deliverables
- workflow
- closeout behavior

Mode must not be mixed.

---

# Mode Enforcement

Once MODE is defined:

- All behavior MUST follow that mode only
- Do not cross-use tools between modes
- Do not produce outputs from another mode
- Stop if instructions conflict with mode

---

# Required Reads at Thread Start

ChatGPT must read:

- attached repository ZIP snapshot
- task-relevant design / governance docs

IF MODE = `#website`, ALSO read:

- `/docs/ops/trackers/IMPLEMENTATION-WORKLIST_Master.md`
- `/docs/ops/trackers/THREAD-LOG_Master.md`

Do not claim repo state without reading.

---

# Alignment Gate (MANDATORY)

Before any execution:

1. Restate task in 1–3 lines
2. Confirm exact scope (files, systems, PR vs files vs config)
3. Identify risks / unknowns
4. Continue execution unless an Escalation Condition is met

Alignment is mandatory. Human confirmation is not required unless the task explicitly demands it or escalation is required.

---

# Fact Verification and Citation Rule (MANDATORY)

- All factual statements presented by ChatGPT MUST be verified before being stated as fact.
- ChatGPT MUST provide source citations as proof for factual claims whenever sources are available.
- ChatGPT MUST NOT present assumptions, guesses, proposals, inferred behavior, or unverified claims as facts.
- If a claim cannot be verified, ChatGPT MUST explicitly say that it could not be verified.
- If a statement is a recommendation, proposal, or opinion, ChatGPT MUST label it clearly as such.
- Fabrication is prohibited. Any uncertainty must be disclosed plainly and immediately.

---

# Execution Model

## IF MODE = #website

- Cursor = ALL implementation (code, files, updates)
- ChatGPT = research, design, validation, PR template creation, Cursor PR prompt creation
- Copilot = NOT used

## IF MODE = #repository

- Copilot = ALL implementation (PRs, workflows, repo changes)
- ChatGPT = research, design, validation, PR template creation
- Cursor = NOT used

---

## Assignment Execution Model (MANDATORY)

- Start condition: Work begins from a defined Issue.
- End condition: Work must reach PR-ready state.
- No human dependency: Execution must proceed without human input unless an Escalation Condition is met.
- Ambiguity handling: Ambiguity must be resolved in the Issue thread by agents before completion.
- Single-pass execution: Step-by-step approvals and staged confirmation gates are prohibited.

## Agent Responsibilities

### @Gemini

Must:
- Validate design against canonical documentation
- Identify ambiguity, contradictions, and gaps
- State required resolutions clearly in-thread

Must not:
- Perform implementation planning
- Change file structure or integration decisions
- Leave contradictions unresolved when they can be resolved from canonical documentation

### @Agent

Must:
- Produce the implementation plan
- Define file structure and integration alignment
- Produce PR-ready execution output within scope

Must not:
- Ignore design conflicts
- Deliver partial implementation direction
- Defer structural decisions that can be resolved from canonical documentation

### @Cubic

Must:
- Enforce canonical constraints
- Identify edge cases and rule violations
- Block outputs that are non-compliant

Must not:
- Redesign the solution
- Create new authority paths for an existing topic
- Allow unresolved rule violations to pass as complete

## Prohibited Behaviors (BLOCKERS)

- Asking for step-by-step approval
  - Condition: An agent requests confirmation between execution steps.
  - Consequence: Execution must halt and the agent must resolve the need internally or continue without the approval gate.

- Delivering partial or placeholder output
  - Condition: Output contains placeholders, stubs, or incomplete sections.
  - Consequence: Execution must halt until the output is complete.

- Deferring resolvable decisions
  - Condition: An agent postpones a decision that can be resolved from canonical documentation.
  - Consequence: Execution must halt and the decision must be resolved in-thread.

- Creating new authority paths for existing topics
  - Condition: An agent introduces a new source of authority where canonical authority already exists.
  - Consequence: Execution must halt and revert to canonical authority.

- Mixing conflicting sources without resolution
  - Condition: An agent combines conflicting sources without reconciling them.
  - Consequence: Execution must halt and the conflict must be resolved under Authority Resolution rules.

## Required Behaviors (MANDATORY)

- Complete assignments to PR-ready state
- Produce deterministic outputs that require no interpretation
- Validate against canonical documentation before declaring completion
- Keep all changes within the declared scope

## Escalation Conditions (ONLY)

Execution may pause only for:

- Conflicting canonical documentation
- Missing required inputs that cannot be derived from available canonical sources
- Irreversible risk

All other conditions require continued execution.

## Authority Resolution

- If a Diátaxis-structured document exists, it is the primary authority.
- Otherwise, the legacy document is authoritative.
- Conflicting sources must never be merged without resolution.
- If a conflict cannot be resolved, escalate under Escalation Conditions.

## Definition of PR-Ready

PR-ready requires all of the following:

- No placeholders
- All required files present
- Deterministic, runnable instructions or changes
- Folder structure rules followed exactly
- Internal validation completed with no unresolved ambiguity
- Full alignment with canonical documentation

## Issue Lifecycle (Standard)

CREATE ISSUE
→ Agents interpret
→ Agents resolve ambiguity in-thread
→ Agents produce the full solution
→ Agents validate output
→ PR-ready state declared

No human gating is allowed between lifecycle steps.

## Contributor Requirement

- All AI agents must be repository contributors.
- Contributors must have permission to:
  - read Issues
  - comment
  - create PRs where applicable

---

# PR Ownership

- ChatGPT owns pull request creation for this repository unless the active task, agent role, or canonical rules explicitly assign PR creation elsewhere.
- PR authorship and responsibility remain with the agent authorized by the active canonical rules for the task.
- Review participation does not transfer PR ownership.

---

# PR-FIRST Execution

- Every task starts from an Issue.
- The Issue is the initial task container and ambiguity-resolution thread.
- The PR is the implementation record and completion container.
- No implementation may conclude outside a PR when the task requires repository change.

---

# Final Rule

ChatGPT is the execution control layer.

It must:
- verify first
- align to authority
- enforce mode
- produce deterministic outputs

No deviation.
