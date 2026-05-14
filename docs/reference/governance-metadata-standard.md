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

Current repository metadata contains more `Doc Type:` and `Authority Level:` values than this PR can safely normalize without a repository-wide metadata audit.

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

## Metadata Vocabulary Rule

This PR does not establish a blocking whitelist for `Doc Type:` or `Authority Level:` values.

Repository metadata vocabulary must be normalized in this sequence:

1. audit all current `Doc Type:` and `Authority Level:` values across the repository
2. classify each observed value as active, transitional, historical, or deprecated
3. document migration rules for deprecated or duplicate values
4. only then introduce blocking validation for allowed values

Until that audit is complete, `Doc Type:` and `Authority Level:` values are descriptive metadata fields, not enforceable whitelist fields.

## Observed Doc Type Examples

Examples currently or historically used in the repository include, but are not limited to:

- `Architecture Reference`
- `Design Authority`
- `Explanation`
- `Governance`
- `How-To`
- `Implementation Plan`
- `Operations`
- `Operational Rules`
- `Postmortem`
- `Reference`
- `Specification`
- `Task`
- `Template`
- `Ticket`
- `Tutorial`

These examples are not a final allowed-value list.

## Observed Authority Level Examples

Examples currently or historically used in the repository include, but are not limited to:

- `Canonical`
- `Canonical Architecture Specification`
- `Canonical CI Specification`
- `Canonical Design Specification`
- `Controlled`
- `Historical`
- `Informational`
- `Operational`
- `Operational Authority`
- `Supporting`
- `Task Control`
- `Working Task`

These examples are not a final allowed-value list.

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
- documented `Doc Type:` values after a repository-wide metadata audit
- documented `Authority Level:` values after a repository-wide metadata audit
- resolvable `Canonical Reference:` paths
- non-empty `Owns:` and `Does Not Own:` fields
- absence of authority claims outside the document's declared scope

Future checks must not enforce `Doc Type:` or `Authority Level:` whitelists until the repository-wide metadata audit and migration plan are complete.
