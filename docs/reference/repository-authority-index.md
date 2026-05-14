---
Doc Type: Reference
Audience: Human + AI
Authority Level: Controlled
Owns: Repository-wide authority routing index
Does Not Own: Runtime behavior, agent entry-point ownership, or implementation status
Canonical Reference: /docs/governance/standards/document-authority-hierarchy_MASTER.md
Related Issues: #1019
Last Reviewed: 2026-05-14
---

# Repository Authority Index

## Purpose

This document is the canonical index for repository authority routing.

Humans and AI agents should refer to this index when resolving document precedence, as directed by primary entry points such as `README.md`, `Agent.md`, and repository governance standards.

This document does not replace `Agent.md` as the single agent entry point.

## Primary Authority Areas

| Area | Canonical Authority |
|---|---|
| Runtime website behavior | `/docs/reference/design/LGFC-Production-Design-and-Standards.md` |
| Content inventory architecture | `/docs/reference/content-inventory-design-spec.md` |
| Content inventory schema | `/docs/reference/content-inventory-d1-schema.md` |
| Repository governance hierarchy | `/docs/governance/standards/document-authority-hierarchy_MASTER.md` |
| Repository governance normalization tracking | Issue #1019 and child governance issues |
| PR governance | `.github/pull_request_template.md` |
| Agent entry point | `Agent.md` |
| Operational work tracking | implementation worklists and active issues |

## Authority Resolution

When authority conflicts:

1. canonical design authority wins for runtime behavior
2. canonical reference docs win for schema and operational facts
3. governance standards win for repository process
4. implementation issues track work and do not create authority unless explicitly promoted by canonical documentation
5. historical planning issues are non-authoritative unless reaffirmed by current canonical authority
