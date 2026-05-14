---
Doc Type: Reference
Audience: Human + AI
Authority Level: Controlled
Owns: Cross-reference normalization requirements for authority documents, implementation issues, PRs, operational trackers, and migration records
Does Not Own: Runtime behavior, implementation state, governance hierarchy, authority-resolution rules, or metadata field definitions
Canonical Reference: docs/governance/standards/document-status-and-naming_MASTER.md
Related Issues: #1023
Last Reviewed: 2026-05-14
---

# Cross-Reference Normalization Standard

## Purpose

This document defines how repository cross-references should connect authority documents, implementation issues, pull requests, operational trackers, and migration records so humans and AI agents can trace work from authority through implementation and follow-up governance debt.

## Scope

This standard applies to repository documentation, issues, pull requests, trackers, and migration records that participate in governance, implementation, operations, design, audit, or AI-agent workflows.

It defines cross-reference expectations only. It does not define runtime behavior, implementation status, governance hierarchy, authority-resolution precedence, or metadata field syntax.

## Current Known Truth

The repository contains multiple authority documents, implementation issues, PRs, operational trackers, and migration records. Some of these references are complete; others are transitional, stale, or implicit.

When cross-references are missing or ambiguous, agents can mistake historical context for current authority, treat issues as canonical documentation, or implement work without clear acceptance criteria.

The current canonical governance source for minimum document requirements is `docs/governance/standards/document-status-and-naming_MASTER.md`.

## Intended Final State

Repository work should be traceable in both directions:

- authority documents identify related implementation tracking where applicable
- implementation issues identify their governing authority
- PRs identify source issues and governing authority
- operational trackers identify the authority and implementation records they summarize
- migration records identify superseded sources, target authority, and remaining debt

## Terms

### Source Issue

The issue that authorizes or scopes a specific PR.

### Implementation Issue

An issue that tracks build, repair, migration, governance, or operational execution.

### Implementation Tracking

The broader tracking surface for implementation status. This may include source issues, child issues, worklists, operational trackers, or migration backlog records.

### Operational Tracker

A repository document or issue used to summarize execution status, open work, closed work, or operational state.

### Migration Record

A repository document, issue, or tracker entry that records movement from older authority, legacy documentation, obsolete guidance, or transitional material into current authority.

## Required Relationships

### Authority Documents

Authority documents should reference:

- canonical upstream authority
- related governance docs
- related implementation tracking where applicable
- known superseded or transitional sources where applicable

### Implementation Issues

Implementation issues should reference:

- governing authority documents
- related implementation dependencies
- acceptance criteria
- validation expectations
- related parent or child issues where applicable

### Pull Requests

PRs should reference:

- source issue
- governing authority documents
- changed-file allowlist
- implementation tracking when different from the source issue
- reviewer-response accounting when required
- validation or acceptance evidence

### Operational Trackers

Operational trackers should reference:

- governing authority documents
- related implementation issues
- related PRs where applicable
- current status of tracked work
- open follow-up work or blockers

### Migration Records

Migration records should reference:

- source material being migrated or deprecated
- destination canonical authority
- unresolved migration debt
- follow-up implementation or governance issues
- superseded and superseding documents where applicable

## Orphan Prevention

Repository implementation surfaces should not exist without:

- governing authority
- source or implementation tracking
- acceptance criteria
- validation expectations
- ownership boundaries

If a surface cannot identify these references, the PR or issue should document the gap and create follow-up governance work rather than silently inventing authority.

## Validation Expectations

Future governance checks may validate:

- missing source issues in PRs
- missing governing authority links in implementation issues
- authority documents without upstream canonical references
- operational trackers with stale or missing issue links
- migration records without destination authority
- orphan implementation surfaces without acceptance criteria
