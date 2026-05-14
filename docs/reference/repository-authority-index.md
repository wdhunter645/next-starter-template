---
Doc Type: Reference
Audience: Human + AI
Authority Level: Canonical
Owns: Repository-wide authority routing index
Does Not Own: Runtime behavior or implementation status
Canonical Reference: /docs/governance/standards/document-authority-hierarchy_MASTER.md
Last Reviewed: 2026-05-14
---

# Repository Authority Index

## Purpose

This document is the canonical starting point for repository authority routing.

All humans and AI agents must use this index before relying on older planning material, legacy implementation notes, or historical issues.

## Primary Authority Areas

| Area | Canonical Authority |
|---|---|
| Runtime website behavior | `/docs/reference/design/LGFC-Production-Design-and-Standards.md` |
| Content inventory architecture | `/docs/reference/content-inventory-design-spec.md` |
| Content inventory schema | `/docs/reference/content-inventory-d1-schema.md` |
| Repository governance | Issue #1019 governance normalization work |
| PR governance | `.github/pull_request_template.md` |
| Operational work tracking | implementation worklists and active issues |

## Authority Resolution

When authority conflicts:

1. canonical design authority wins for runtime behavior
2. canonical reference docs win for schema and operational facts
3. governance standards win for repository process
4. implementation issues inherit authority and do not create authority
5. historical planning issues are non-authoritative unless reaffirmed
