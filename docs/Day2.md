# Day 2 Roadmap

Day 2 deepens the LGFC platform after Day 1 is stable in production. The goal is to improve member experience,
reduce operational friction, and expand content capability **without changing core architecture**.

## Operating Constraints
- No breaking changes to Day 1 routes or locked design without explicit governance approval.
- No new automation that can write to production without human trigger + audit trail.
- Any new CI workflow must be documented in `docs/ci-inventory.md`.

---

## 1) Enhanced Member Profiles

**Why**
Members need a stronger sense of identity and continuity (membership card, profile, history).

**Primary use cases**
- View membership details and participation history
- Display join date and recognition status
- Prepare for future member submissions (Day 3)

**Design ideas**
- Start read-only, server-validated
- Expand profile data incrementally
- Keep UX simple; avoid social network complexity

**Implementation notes**
- Define a stable profile schema (even if minimal)
- Ensure privacy boundaries are explicit
- Add tests for auth gating

**Open questions**
- Which fields are user-editable?
- Which changes require admin approval?

---

## 2) Content Management Improvements

**Why**
Day 1 content is intentionally structured but still heavy to update.

**Primary use cases**
- Faster edits to milestone/timeline entries
- Updates to “News & Q&A” content without code changes
- Reduce redeploys for copy changes

**Design ideas**
- Admin-only content editor with preview
- Non-destructive edits first; versioning later

**Implementation notes**
- Start with read-only + controlled edit surfaces
- Maintain auditability (who changed what, when)

**Dependencies**
- Day 1 guardrails (`docs/phase-7-guardrails.md`)
- Backup/restore readiness (`docs/backup.md`, `docs/RECOVERY.md`)

---

## 3) Engagement Analytics (Non-Invasive)

**Why**
We need to measure whether the site is working without tracking creep.

**Primary use cases**
- Vote participation trend over time
- Page engagement at a coarse level (no profiling)

**Constraints**
- No user-level behavior profiles
- No invasive tracking

**Implementation notes**
- Aggregated counters only
- Document what is collected and why

---

## 4) Operational Quality Improvements

**Why**
CI should be boring and explainable.

**Primary use cases**
- Faster root-cause identification on CI failures
- Reduced false positives

**Implementation notes**
- Improve log output summaries
- Add explicit “what failed and why” in CI steps where possible
- Keep workflow inventory current (`docs/ci-inventory.md`)

---

## Day 2 Exit Criteria
Day 2 is complete when:
- Member area feels “real” (profile + continuity)
- Admin content workflows reduce deployment friction
- Operational clarity increases (CI failures are actionable)
