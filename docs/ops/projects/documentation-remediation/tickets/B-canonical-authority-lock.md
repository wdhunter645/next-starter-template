---
Doc Type: Operations
Audience: Human + AI
Authority Level: Operational Authority
Owns: Canonical authority lock workstream scope and done criteria
Does Not Own: Redefining governance hierarchy; design/architecture/platform specs
Canonical Reference: /docs/ops/OPERATING_MANUAL.md
Last Reviewed: 2026-03-26
---

# Workstream B — Canonical Authority Lock

Status: OPEN  
Owner: UNASSIGNED

## Purpose
This workstream ensures that LGFC has a single, explicit canonical authority for production design and standards, and that all dependent documentation clearly and consistently defers to that authority. By locking in a canonical source of truth, we reduce drift, conflicting guidance, and ambiguity in operational and product documentation.

## Current Known Truth
- `docs/reference/design/LGFC-Production-Design-and-Standards.md` is intended to be the canonical reference for production design and standards.
- Many existing documents either do not reference this canonical authority at all or reference it inconsistently.
- Some documents embed partial or outdated versions of guidance that should instead be sourced from, or explicitly defer to, the canonical design and standards document.
- There is no uniform, repository-wide pattern for indicating the canonical authority for a given document.

## Scope
This workstream covers the definition and enforcement of a repeatable, repository-wide pattern for declaring and honoring canonical authority in documentation.

- Align all docs with the governance-defined authority hierarchy (governance → design → architecture/platform → ops).
- Treat `LGFC-Production-Design-and-Standards.md` as the canonical design spec within that hierarchy and add canonical authority headers to all docs.

## Done Criteria
- All docs explicitly reference and comply with the governance → design → architecture/platform → ops authority hierarchy.
- No statements about "source of truth" or authority remain that conflict with the governance model or the role of the design spec.

## Intended Final State
When this workstream is complete:

- The repository has a clearly documented, consistently applied pattern for declaring canonical authority in documentation.
- `LGFC-Production-Design-and-Standards.md` is unambiguously recognized and treated as the canonical design spec, with other docs deferring to it rather than re-specifying its contents.
- Any document that might otherwise define overlapping guidance makes its dependency on the canonical authority explicit via the standard header metadata.
- Routine documentation maintenance and future workstreams can rely on this canonical-authority pattern to avoid reintroducing conflicting or duplicated standards.
