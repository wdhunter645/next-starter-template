---
Doc Type: Reference
Audience: Human + AI
Authority Level: Controlled
Owns: submission_queue schema fields and review-state rules
Does Not Own: content_inventory schema; moderation policy; automation implementation
Canonical Reference: /docs/reference/content-inventory-design-spec.md
Last Reviewed: 2026-04-28
---

# Submission Queue Schema

Table: submission_queue

Columns:
- submission_id
- submitted_by
- title
- description
- source_url
- proposed_tag
- media_url
- status (pending|approved|rejected_auto|rejected_manual)
- review_notes
- purge_flag

Rules:
- automation rejects only objective failures
- manual review required for facts
- rejected items purged quarterly
