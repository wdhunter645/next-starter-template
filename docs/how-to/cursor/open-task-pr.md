---
Doc Type: How-To
Audience: AI
Authority Level: Operational Authority
Owns: Cursor procedure for opening a task PR after review approval
Does Not Own: Merge authority or GitHub issue closeout
Canonical Reference: /docs/how-to/cursor/prepare-review-packet.md
Related Issues: #1351
Last Reviewed: 2026-06-05
---

# Open a Task PR

## Preconditions

- Atlas or Bill approved PR creation.
- Local diff matches the reviewed packet.
- Changed files are inside the source issue allowlist.
- Validation results are ready for PR body disclosure.

## PR Body Requirements

Include:

- source issue number;
- intent label;
- scope statement;
- changed-file allowlist;
- validation results;
- repo-wide failure disclosures, if any;
- issue closeout timing;
- statement that GitHub issue closeout occurs after merge unless specifically authorized.

## After Opening

Report:

```text
PR number:
Branch:
Head SHA:
Changed files:
Validation:
Known disclosures:
```
