---
Doc Type: Governance
Audience: Human + AI
Authority Level: Canonical
Owns: Document structure, ownership boundaries, path resolution rules
Does Not Own: Implementation sequencing, tracker state, design authority
Canonical Reference: /docs/governance/DOCUMENT-ARCHITECTURE.md
Last Reviewed: 2026-03-19
---

# DOCUMENT ARCHITECTURE (AUTHORITY)

## Purpose
Defines the authoritative document structure, ownership boundaries, and path resolution rules for the repository.
All CI scripts, AI agents, and contributors must follow this model.

---

## Folder Ownership Model

### 1. docs/reference/design/
Purpose: Design authority (source of truth for product, UX, layout)

Owns:
- Site structure
- Navigation
- Page definitions
- UX rules

Does Not Own:
- Operational procedures
- CI/CD behavior
- Implementation tracking

Examples:
- LGFC-Production-Design-and-Standards.md
- home.md
- fanclub.md

---

### 2. docs/ops/

Purpose: Operational procedures and execution rules

#### docs/ops/ai/

Owns:
- AI agent behavior rules
- Execution constraints
- Thread discipline

Canonical Files:
- CURSOR-RULES.md
- CHATGPT-RULES.md
- AGENT-RULES.md

---

### 3. docs/governance/

Purpose: System-level authority and process enforcement

Owns:
- PR process
- CI/CD rules
- Documentation standards
- DOCUMENT-ARCHITECTURE.md (this file)

---

### 4. docs/ops/trackers/

Purpose: Execution tracking and project state

Owns:
- IMPLEMENTATION-WORKLIST_Master.md
- THREAD-LOG_Master.md

Does Not Own:
- Design decisions
- System rules

---

## Canonical File Rules

- Each domain must have ONE canonical file
- No duplicate authority files allowed
- All references must point to the canonical file

Example:
VALID:
docs/ops/ai/CURSOR-RULES.md

INVALID:
docs/CURSOR_RULES.md

---

## Path Resolution Standard (CRITICAL)

Rule:
All file paths in CI scripts must resolve relative to the file that defines them.

Implementation:

If using a file list:
- Paths inside the list are relative to the list file directory

Example:
File: docs/reference/design/.canonical-files.txt
Entry: LGFC-Production-Design-and-Standards.md

Resolved path:
docs/reference/design/LGFC-Production-Design-and-Standards.md

Prohibited:
- Mixing repo-root-relative and local-relative paths
- Hardcoding inconsistent paths

---

## CI Script Requirements

All CI scripts must:
1. Resolve paths based on declared source file location
2. Not assume repo root unless explicitly defined
3. Fail fast on missing files
4. Follow this architecture document

---

## Enforcement Rules

- CI must enforce canonical file existence
- CI must enforce no duplicate authority files
- CI must enforce path resolution consistency

---

## Governance Deduplication Rules (Workstream J)

Each governance topic must have exactly ONE canonical file. No second file may define, restate, or contradict the same authority.

Prohibited patterns:
- Two files both claiming to define the same process (e.g., two PR process docs)
- A non-canonical file overriding or restating rules from a canonical file
- Contradictory definitions of the same concept across multiple docs

Required actions when a duplicate is found:
1. Identify the canonical file: prefer the file with the highest Authority Level; if tied, prefer the file that is explicitly referenced by the most other docs; if still tied, escalate to operator decision before proceeding
2. Archive or delete the duplicate
3. Update all references to point to the canonical file
4. Do not create new files that duplicate existing canonical authority

Canonical governance files (single source per topic):
- PR process: `/docs/governance/PR_PROCESS.md`
- PR governance: `/docs/governance/PR_GOVERNANCE.md`
- Document architecture: `/docs/governance/DOCUMENT-ARCHITECTURE.md` (this file)
- Design authority: `/docs/governance/standards/design-authority_MASTER.md`
- Change control: `/docs/governance/standards/change-control_MASTER.md`

---

## Summary

This document defines:
- Where documents live
- Who owns what
- How paths are resolved
- How governance deduplication is enforced

All automation and contributors must follow this model to prevent drift and gate failures.
