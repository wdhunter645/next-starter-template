---
Doc Type: Operations
Audience: Human + AI
Authority Level: Design Authority
Owns: LGFC orchestration tier design
Does Not Own: Product UI, routes, or content
Canonical Reference: This document
Last Reviewed: 2026-05-05
---

# LGFC Orchestration Tier Design

## Objective

Establish a GitHub-native orchestration system where implementation is executed through Issues, draft Pull Requests, AI agents, automated review, and human approval.

## Workflow Overview

1. Atlas creates a production-ready implementation plan.
2. GitHub Actions converts the plan into Issues.
3. Issues are labeled and routed to the correct AI agent.
4. A draft PR is created automatically for each Issue.
5. The AI agent implements the task inside the PR.
6. Cubic, Gemini, and Copilot review the PR.
7. Human reviews, approves, and merges.
8. Post-merge verification validates main.
9. Failures open recovery Issues automatically.

## System Components

### 1. Implementation Plan

- Stored in `/docs/ops/implementation-plans/`
- Created by Atlas
- Must be `Status: production-ready`

### 2. Issue Factory

- Trigger: push to main
- Parses implementation plan
- Creates Issues per task
- Applies labels

### 3. Router

Routes Issues to agents:

- repository → Codex
- website → Cursor
- governance → Copilot
- docs → Atlas/Copilot
- recovery → Atlas

### 4. Draft PR Creator

- Creates branch per Issue
- Opens draft PR
- Links PR to Issue

### 5. AI Agent Execution

- Agent reads Issue
- Implements within allowed files
- Updates PR

### 6. Review Layer

- Cubic: validation
- Gemini: analysis
- Copilot: structural review
- Human: final approval

### 7. Post-Merge Verification

- Runs validation on main
- Opens recovery Issue on failure

## Design Principles

- No direct commits to main
- All work flows through PRs
- One task per Issue
- One PR per Issue
- Explicit file allowlists
- Deterministic automation
- Idempotent workflows

## Implementation Strategy

This design must be implemented in staged PRs:

1. Documentation (this PR)
2. Labels and routing config
3. Issue factory
4. Draft PR creator
5. Agent routing
6. Review integration
7. Post-merge verification

Each stage must be validated before proceeding.
