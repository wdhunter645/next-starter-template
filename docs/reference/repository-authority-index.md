---
Doc Type: Reference
Audience: Human + AI
Authority Level: Controlled
Owns: Repository-wide authority routing index
Does Not Own: Runtime behavior, agent entry-point ownership, governance hierarchy ownership, or implementation status
Canonical Reference: /docs/governance/standards/document-authority-hierarchy_MASTER.md
Related Issues: #1019
Last Reviewed: 2026-05-14
---

# Repository Authority Index

## Purpose

This document is the canonical index for repository authority routing.

Humans and AI agents should refer to this index when resolving document precedence, as directed by primary entry points such as `README.md`, `Agent.md`, and repository governance standards.

This document does not replace `Agent.md` as the single agent entry point.

This document does not replace `/docs/governance/standards/document-authority-hierarchy_MASTER.md` as the governance hierarchy authority. It indexes current authority locations and remains subordinate to the MASTER hierarchy for governance precedence rules.

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
| Task-specific implementation scope | active source issue for the PR |
| Operational work tracking | implementation worklists and active issues |

## Authority Resolution

When authority conflicts:

1. governance and `_MASTER` documents win for repository process, authority hierarchy, and governance policy
2. source issue scope provides task-specific implementation authority for the PR within the repository governance hierarchy
3. canonical design authority wins for runtime website behavior within the repository governance hierarchy
4. canonical reference docs win for schema and operational facts within their owned domains
5. implementation worklists and historical planning issues do not override current canonical authority unless reaffirmed
