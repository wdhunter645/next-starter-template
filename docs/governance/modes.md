# Modes

Modes are a disciplined way to prevent ambiguity in how work is executed.

## Control

**Purpose:** Define scope, decide the path, and set acceptance criteria.  
Control mode is where you choose *what* will be done and *why*.

## Execute

**Purpose:** Implement the chosen plan.  
Execute mode produces the actual artifact (ZIP update, PR draft, config change).

## Verify

**Purpose:** Validate outcomes against acceptance criteria.  
Verify mode focuses on evidence: checks, builds, page behavior, and no-regression.

## Mode Transition Rules

- Do not execute without an agreed plan from Control.
- Do not declare success without Verify evidence.
- If Verify fails, return to Control, adjust, then Execute again.
