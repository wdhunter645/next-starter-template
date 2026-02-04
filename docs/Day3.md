# Day 3 Roadmap

Day 3 focuses on sustainability, delegation, and long-term evolution after Day 1 + Day 2 are proven stable.

## Operating Constraints
- Human-in-the-loop remains mandatory for production changes.
- Any automation must be bounded, auditable, and documented.
- Day 1 design authority remains enforced unless intentionally revised.

---

## 1) Member Contributions

**Why**
Community contribution builds longevity and meaning.

**Primary use cases**
- Member story submissions
- Media submissions (moderated)
- Member-curated content collections

**Design ideas**
- Submission queue + admin moderation
- Clear acceptance/rejection states
- Audit trail for all moderation actions

**Implementation notes**
- Start with text-only submissions
- Add media later via B2 presigned upload flow

**Open questions**
- What is public vs members-only?
- How do we prevent spam and abuse?

---

## 2) Advanced Admin Tooling

**Why**
Manual admin processes do not scale.

**Primary use cases**
- Bulk operations
- Versioned edits with preview
- Safer rollbacks of content-level changes

**Design ideas**
- Change staging + publish
- Per-record audit logs

---

## 3) Automation (Strictly Bounded)

**Why**
Automation should reduce toil, not create risk.

**Rules**
- Advisory only unless explicitly approved
- Human-triggered for any action that modifies repository or production state
- Secrets exposure prevention is mandatory

**Examples**
- AI review: advisory comments only
- Nightly assessments: informational alerts only

---

## 4) Platform Hardening

**Primary objectives**
- Accessibility audits and fixes
- Performance tuning (Core Web Vitals)
- Disaster recovery drills using snapshots (`docs/backup.md`)

---

## Day 3 Exit Criteria
Day 3 is complete when:
- The site can be safely operated by a broader team
- Admin workflows scale without fragility
- Recovery drills are proven and repeatable
