---
Doc Type: Reference
Audience: human project owner and AI agents
Authority Level: supporting
Owns: legacy-to-DIATAXIS migration planning for project #1132
Does Not Own: implementation code or archival execution
Canonical Reference: docs/reference/documentation-gap-analysis-1132.md
Related issues: #1132, #1134
Last Reviewed: 2026-05-29
---

# Legacy to DIATAXIS Migration Matrix

## Purpose

Define how legacy documentation is evaluated and migrated into the repository documentation structure.

| Legacy State | Action | Destination |
|---|---|---|
| Active authoritative document | Keep | Existing authority location |
| Duplicate authority | Merge | Canonical authority document |
| Historical reference | Archive | docs/archive |
| Mixed design and implementation content | Split | Reference + How-To + As-Built |
| Obsolete material | Retire | Archive with retirement note |

## Migration order

1. Authority documents
2. Production definitions
3. Implementation plans
4. Operations documents
5. Historical material

## Acceptance criteria

- One authority source per subject.
- No duplicate production definitions.
- Legacy material preserved when historically valuable.
- Migration decisions documented before execution.
