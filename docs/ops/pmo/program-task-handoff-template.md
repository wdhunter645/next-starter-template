---
Doc Type: Operations
Audience: Human + AI
Authority Level: Operational Authority
Owns: Standard task handoff template for LGFC program work
Does Not Own: Task-specific acceptance criteria or validation commands
Canonical Reference: /docs/reference/pmo/lgfc-cursor-execution-contract.md
Related Issues: #1351
Last Reviewed: 2026-06-05
---

# Program Task Handoff Template

Use this template when assigning one task to Cursor.

```text
WHERE: Cursor local repo session
WHAT: Edit files only. Do not create PR. Do not push. Do not merge.

Task: <issue number and title>

Read first:
- docs/reference/pmo/lgfc-cursor-execution-contract.md
- docs/how-to/cursor/run-program-task.md
- source issue <#issue>

Scope:
- <one sentence>

Allowed files:
- <paths from issue>

Acceptance criteria:
- <copy from issue>

Validation:
- <commands from issue>

Deliverable:
- Commit-ready local diff only.
- Changed-file list.
- Validation results.
- Recommended post-merge issue actions, if any.
```

## Rule

The template should be short because durable behavior lives in the PMO package documents.
