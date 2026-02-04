# Activity_Tasklist.md — Work Origination + Issue Priority Governance

Effective Date: 2026-02-04

## Purpose

This repository uses **GitHub Issues** as the authoritative system of record for all work:
- Operations work (incidents, degradations, follow-ups)
- Project implementation work
- Governance / compliance work

Pull Requests (PRs) are **change vehicles only**. A PR exists to implement changes in support of one or more Issues.

This document defines:
1) where Issues come from,
2) how Issues are prioritized,
3) how PRs are required to relate to Issues,
4) workflow tier roles (Tier A vs Tier B),
5) how manual overrides work without creating ambiguity or “shadow work.”

---

## Source of Truth

- **Issues** are the system of record (open/closed = truth).
- PRs must reference Issues (PRs are implementation artifacts).
- Markdown checklists are governance guidance only (never the ledger).

---

## Origins of Work (How Issues Are Created)

### 1) Operations automation (Tier B)

Tier B workflows may create or update Issues when they detect operational conditions.

**Operational Issue classes**
- **Outage**: immediate human action required.
- **Warning**: degradation that becomes actionable based on thresholds/patterns.
- **Follow-up**: preventative or cleanup work required to preserve stability.

Tier B issues are the only Issues treated as **operational alerts**.

### 2) Planned project work

Humans open Issues to plan/track features, improvements, and approved roadmap work.

### 3) Manual override (explicitly allowed)

A manual override Issue is allowed when a change is needed to support or unblock operations, but does not map cleanly to one specific automated alert.

Manual override Issues must be explicit in the Issue body:
- What is being changed
- Why it is necessary for operations
- How success will be verified
- Rollback plan

---

## Priority Order (Non-Negotiable)

Work is prioritized in this order:

1) **Operations — Outage**
2) **Operations — Warning (actionable thresholds reached)**
3) **Operations — Follow-up / Preventative**
4) **Project implementation**
5) **Docs-only / nice-to-have**

**Rule:** Project work must not proceed in a way that ignores or worsens open Operations Issues. Parallel work is allowed only when it does not increase operational risk.

---

## PR ↔ Issue Contract

### Required
- Every PR must reference at least one Issue in its PR body.

### Automation
- A Tier A workflow checks PRs for an Issue reference.
- If missing, it auto-creates a **work-accounting** Issue and comments the link on the PR.
- If auto-create fails, it comments the failure and labels the PR (best-effort), but **does not block** approval or merge.

---

## Workflow Tiers (Roles, Not Suggestions)

### Tier A — PR Gates (governance validation)

Tier A workflows:
- Validate standards and invariants for changes proposed in a PR.
- May annotate PRs (comments/labels) to enforce governance.
- Must **not** generate operational alert communications.

Tier A is allowed to auto-create **work-accounting** Issues only to satisfy “Issue-first” tracking.

### Tier B — Operations workflows (runtime health)

Tier B workflows:
- Detect operational conditions and create/update operational Issues.
- Are the only workflows that create “alert-class” operational Issues.

---

## No Duplicate Communications

To avoid duplicate comms/noise:

- **Work-accounting** Issues created by Tier A automation are not operational alerts.
- Operational alerting (if any) must ignore Issues labeled **work-accounting**.
- Operational alerts come only from Tier B workflows and their corresponding Issues.

---

## Labeling (Recommended)

If/when labels exist in the repo:

- work-accounting
- ops, outage, warning
- manual-override
- needs-triage

Labels are governance aids, not the source of truth.
