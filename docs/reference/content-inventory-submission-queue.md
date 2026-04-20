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
