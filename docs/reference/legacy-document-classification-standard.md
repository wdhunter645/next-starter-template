---
Doc Type: Reference
Audience: Human + AI
Authority Level: Controlled
Owns: Document authority and classification model
Does Not Own: Runtime implementation authority, governance hierarchy, authority-resolution rules, or document metadata field definitions
Canonical Reference: docs/governance/standards/document-status-and-naming_MASTER.md
Related Issues: #1022
Last Reviewed: 2026-05-14
---

# Document Authority and Classification Standard

## Purpose

This document defines repository document classification states so humans, AI agents, reviewers, and governance checks can distinguish current authority from transitional, historical, and deprecated material.

## Scope

This standard applies to repository documentation that may be used for planning, implementation, governance, operations, design, audit, or AI-agent workflows.

It defines document classification states and use rules only. It does not define runtime behavior, implementation status, governance hierarchy, authority-resolution precedence, or metadata field syntax.

## Current Known Truth

The repository contains current authoritative documents, active transitional documents, historical planning material, and obsolete guidance. Without explicit classification, humans and AI agents can accidentally treat stale planning material as active authority.

The current canonical governance source for minimum document requirements is `docs/governance/standards/document-status-and-naming_MASTER.md`.

## Intended Final State

Repository documents should be clearly classified so:

- current authority is easy to identify
- transitional documents are migrated or reconciled
- historical documents remain available as context only
- deprecated documents are avoided for implementation decisions
- future governance audits can identify stale or conflicting documentation

## Classification States

### Canonical

A current authoritative source for the domain explicitly listed in its `Owns:` field.

Canonical documents may guide implementation only within their declared ownership boundary and remain subject to higher-level repository governance.

### Transitional

A partially active document pending migration, reconciliation, replacement, or reclassification.

Transitional documents may be consulted when canonical coverage is incomplete, but any derived implementation requirement must be reconciled against current canonical authority.

### Historical

A document retained for project history, operational context, decision background, or traceability.

Historical documents must not be used as implementation authority unless a current canonical document explicitly reaffirms the relevant content.

### Deprecated

A document or guidance source that is no longer valid for implementation, governance, design, or operational decisions.

Deprecated documents must be avoided by humans and AI agents except when reviewing historical drift, postmortems, or migration debt.

## Classification Rules

Documents must not silently override current canonical authority.

Agents must prefer canonical and transitional authority. Historical material should be used for context only, and deprecated documents must be avoided.

When a transitional, historical, or deprecated document appears to contain needed implementation information, the PR or issue must identify that gap and either:

- link to the canonical document that now owns the topic
- update or create canonical documentation
- create a follow-up governance migration issue

## Classification Metadata Expectations

Classification should be visible through document metadata, document title, or a classification section.

Preferred metadata fields include:

- `Authority Level:`
- `Owns:`
- `Does Not Own:`
- `Canonical Reference:`
- `Supersedes:`
- `Superseded By:`
- `Related Issues:`

## Validation Expectations

Future governance checks may validate:

- whether documents have a visible classification state
- whether historical or deprecated documents are referenced as active authority
- whether transitional documents have migration tracking
- whether canonical documents define clear ownership boundaries
- whether conflicting authority claims are routed to a governance issue
