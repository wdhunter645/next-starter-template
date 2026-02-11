# REPOSITORY-GUIDE_Master.md

## Purpose

This document is the entry point for both humans and AI.
It explains how the repository is organized, where authoritative rules live, and how work is expected to flow.

This file is a map, not a rulebook.
It directs readers to the correct silos of documentation so work begins from a shared understanding.

---

## What This Repository Is

This repository supports the design, build, and operation of the Lou Gehrig Fan Club platform and its supporting systems.
Work is performed collaboratively by humans and AI agents, and must follow structured documentation, execution discipline, and traceable history.

The documentation model is designed to:

* Prevent drift
* Preserve continuity across threads
* Separate concerns clearly
* Allow both AI and humans to navigate quickly
* Maintain a permanent operational record

---

## Documentation Structure

All documentation lives under `/docs/` and is organized into defined silos.
Each silo serves a specific purpose and should not overlap with others.

```
/docs/

  REPOSITORY-GUIDE_Master.md

  /project/
    AI-GUIDE_Master.md
    DESIGN-LOCKS_Master.md
    PROJECT-STATE_Master.md

  /tasklists/
    IMPLEMENTATION-WORKLIST_Master.md

  /governance/
    REPO-STANDARDS_Master.md
    AI-GOVERNANCE_Master.md

  THREAD-LOG_Master.md
```

---

## Where to Find What

### Project Definition & Behavior

Location: `/docs/project/`

These documents define what is being built and how it should function.

* **AI-GUIDE_Master.md**
  Project-level operating context for AI. Explains expectations, constraints, and working model.

* **DESIGN-LOCKS_Master.md**
  Locked UI/UX and structural rules. Prevents visual or architectural drift.

* **PROJECT-STATE_Master.md**
  Snapshot of current system reality: deployments, environment state, known blockers.

---

### Execution Map

Location: `/docs/tasklists/`

* **IMPLEMENTATION-WORKLIST_Master.md**
  Task-level execution plan.
  Defines what work remains and how progress is organized.

---

### Governance & Standards

Location: `/docs/governance/`

These define how work must be performed.

* **REPO-STANDARDS_Master.md**
  Repository structure, naming rules, file placement, PR expectations.

* **AI-GOVERNANCE_Master.md**
  Thread discipline, scope control, documentation usage, drift prevention model.

---

### Operational History

Location: `/docs/THREAD-LOG_Master.md`

Append-only record of work performed.

Each AI thread represents one contained mission.
When a thread ends, a new entry is added to the bottom of this file documenting:

* What the mission was
* What changed
* What worked
* What broke and how it was resolved
* Observations
* Where the next thread should begin

This file preserves continuity across sessions.

---

## Rule Domains (Do Not Mix)

The system operates under three distinct rule domains.
Each lives in a separate location and must remain isolated.

### 1) Project Rules

Define what is being built and how it should behave.

Location:

```
/docs/project/
```

---

### 2) AI Interaction Rules

Define how AI threads operate, how work is scoped, and how drift is prevented.

Location:

```
/docs/governance/AI-GOVERNANCE_Master.md
```

---

### 3) Repository Standards

Define structure, naming conventions, PR expectations, and documentation placement.

Location:

```
/docs/governance/REPO-STANDARDS_Master.md
```

---

## Naming Convention Standard

All authoritative documents use consistent suffixes to signal status:

* `_Master.md` → Canonical source of truth
* `_Draft.md` → Under active development
* `_Incomplete.md` → Skeleton or placeholder
* `_Archive.md` → Retired but preserved

AI and humans should treat `_Master.md` files as the only authoritative sources.

---

## How Work Flows

1. Begin at this guide to understand structure.
2. Reference project documents to understand goals and constraints.
3. Use governance documents to understand how work must be performed.
4. Execute against the implementation worklist.
5. Close each thread by appending to the thread log.

This keeps all work contained, traceable, and consistent across time.

---

## Intent

This guide serves as the permanent welcome point to the repository.
It exists to align understanding before any work begins.
