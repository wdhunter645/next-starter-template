---
Doc Type: Reference
Audience: Human + AI
Authority Level: Controlled
Owns: Repository documentation metadata field definitions and normalization expectations
Does Not Own: Runtime behavior, product design, governance hierarchy, authority-resolution rules, or implementation status
Canonical Reference: /docs/governance/standards/document-status-and-naming_MASTER.md
Related Issues: #1021
Last Reviewed: 2026-05-14
---

# Governance Metadata Normalization Standard

## Purpose

This document defines the standard metadata fields used by repository documentation so humans, AI agents, reviewers, and governance checks can identify document type, audience, authority level, ownership boundaries, canonical references, and review currency consistently.

## Scope

This standard applies to repository documentation that carries authority or is intended to be consumed by implementation, governance, operations, or AI-agent workflows.

It defines metadata field expectations only. It does not redefine the repository governance hierarchy, authority-resolution process, route behavior, runtime architecture, schema authority, or implementation tracking.

## Current Known Truth

Repository documentation already uses YAML-style authority headers, but field usage is inconsistent across older documents. Current governance requires documents to include minimum content sections and prohibits list-only or placeholder-only documents.

The current canonical governance source for document status and naming requirements is `/docs/governance/standards/document-status-and-naming_MASTER.md`.

## Intended Final State

Repository documents should use consistent frontmatter metadata, clear ownership boundaries, explicit canonical references, and normalized authority levels so future governance checks can validate documentation without relying on tribal knowledge.

## Required Authority Headers

Authoritative documentation must include a YAML frontmatter block at the top of the file delimited by `---`. The following keys are required:

- `Doc Type:`
- `Audience:`
- `Authority Level:`
- `Owns:`
- `Does Not Own:`
- `Canonical Reference:`
- `Last Reviewed:`

## Optional Extended Headers

Where applicable, documents may include:

- `Supersedes:`
- `Superseded By:`
- `Related Issues:`
- `Related PRs:`
- `Implementation Tracking:`

## Valid Doc Type Values

Use the existing repository vocabulary unless a future canonical governance document expands it.

Allowed values:

- `Governance`
- `Reference`
- `Explanation`
- `How-To`
- `Tutorial`
- `Operations`

## Valid Authority Level Values

Allowed values:

- `Canonical` — active source of truth for the owned domain
- `Controlled` — governed reference that routes, constrains, or supports authority without superseding higher governance
- `Operational` — current operating record or execution state
- `Historical` — retained context only; not active authority
- `Deprecated` — invalid for future implementation unless explicitly reinstated

## Ownership Rules

A document may define only the authority explicitly listed in its `Owns:` field.

The `Does Not Own:` field must identify adjacent authority areas that the document must not redefine.

A `Canonical` authority level does not allow a document to redefine subjects outside its `Owns:` boundary. Canonical status applies only to the document's declared ownership domain and remains subject to higher-level repository governance.

Documents must not silently redefine:

- runtime behavior
- routing
- schema ownership
- governance precedence
- authority-resolution rules
- implementation authority

unless that subject is explicitly listed in `Owns:` and the document is in the correct folder for that authority type.

## Validation Expectations

Future automated checks may validate:

- presence of required frontmatter keys
- valid `Doc Type:` values
- valid `Authority Level:` values
- resolvable `Canonical Reference:` paths
- non-empty `Owns:` and `Does Not Own:` fields
- absence of authority claims outside the document's declared scope
