---
Doc Type: As-Built
Audience: Human + AI
Authority Level: Supporting
Owns: Runtime note for Weekly Matchup photo URL normalization on read-path APIs
Does Not Own: Component design, homepage layout, voting behavior, design authority
Canonical Reference: /docs/as-built/weekly-matchup-photo-url-normalization.md
Last Reviewed: 2026-03-26
---

# Weekly Matchup photo URL normalization

## Purpose
Records the runtime behavior added to normalize `photos.url` values before Weekly Matchup consumers render them.

## Scope
This note covers read-path behavior only.
It does not change homepage layout, voting flow, matchup selection, or component contract.

## Files
- `functions/_lib/photo-url.ts`
- `functions/api/photos/get.ts`
- `functions/api/photos/list.ts`

## Behavior
The API now normalizes raw `photos.url` values into browser-ready absolute URLs before returning payloads.
Supported input forms:
- Absolute URLs
- Protocol-relative URLs
- Root-relative paths
- Object-key style values
- Values requiring URL encoding

## Environment dependency
When `PUBLIC_B2_BASE_URL` is present, object-key style values should resolve against that public asset base.
If that variable is missing, fallback resolution may still produce a valid absolute URL string but not necessarily the intended B2 asset origin.

## Invariants preserved
- `WeeklyMatchup` still receives `item.url`
- No component-level workaround was introduced
- No visual/layout change was made in homepage rendering
- No vote or results behavior was changed

## Operational note
If images still fail after this code change, investigate D1 source data quality and the production value of `PUBLIC_B2_BASE_URL` before changing the UI layer.
