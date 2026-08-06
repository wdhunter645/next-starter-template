---
Doc Type: Reference
Audience: Human + AI
Authority Level: Operational Evidence Report
Owns: Member photo intake, validation, quarantine, and rate-limit implementation (#2899)
Does Not Own: Schema/persistence contract decisions (#3119); moderation UI, publication flow, photo-detail UX (#2900)
Canonical Reference: /docs/reference/design/LGFC-Production-Design-and-Standards.md
Last Reviewed: 2026-08-06
Related issues: #2857, #2898, #2899, #2900, #3118, #3119
---

# Member photo intake and quarantine persistence (#2899)

## Objective

Implement authenticated, fail-closed member photo intake: strict image
validation, randomized quarantine persistence, pending non-public records,
rate limiting, and deterministic failure handling — the collision-safe
portion executable in parallel with #3119's schema-contract work.

## What was implemented

### `functions/_lib/member-photo-upload.ts`

- **Validation** (`validateUploadedImage`): accepts JPEG, PNG, and WebP only,
  detected by binary signature (not trusted from the declared `Content-Type`),
  rejecting mismatches (`SIGNATURE_MISMATCH`), unsupported types
  (`UNSUPPORTED_TYPE`, catches SVG and everything else), oversized files
  (`OVERSIZED`, 10 MiB cap), empty files (`EMPTY`), and structurally
  malformed/truncated files (`MALFORMED`, via per-format header/dimension
  parsing). A pre-check (`containsPolyglotMarker`) scans the leading bytes
  for embedded `<svg`/`<script`/`<?php`/`<html` markers as defense-in-depth
  against polyglot files with a spoofed declared MIME type
  (`SUSPECT_POLYGLOT`).
  - PNG and JPEG dimension parsing is complete (IHDR chunk / SOF marker
    scan). WebP dimension parsing is complete for the VP8X (extended) chunk
    format; VP8 (lossy) and VP8L (lossless) are validated structurally
    (recognized FourCC, plausible minimum chunk length) but their bitstream
    pixel dimensions are not extracted — documented as an explicit scope
    limit ("decodeability checks where supported" per this task's own
    wording), not a silent gap.
- **Quarantine keys** (`generateQuarantineKey`): randomized via
  `crypto.getRandomValues`, namespaced `member-photos/quarantine/<yyyy>/<mm>/<32-hex>.<ext>`.
  Not derived from filename, member email, or any other caller-supplied
  value — verified by test.
- **Rate limiting** (`checkUploadRateLimit`, `recordUploadAttempt`): mirrors
  `functions/api/login.ts`'s `login_attempts` pattern exactly, against
  #3119's `photo_upload_attempts` table (`member_email`, `ip`, `ok`,
  `created_at`; 1-hour window; threshold `MAX_UPLOAD_ATTEMPTS_PER_HOUR = 10`).
  Per this task's explicit instruction not to invent storage schema, the
  check detects table presence at request time via `sqlite_master` and
  **fails open** (`allowed: true, schemaAvailable: false`) when the table
  doesn't exist yet — upload must never be blocked solely because rate-limit
  infrastructure is absent.
- **Pending record persistence** (`hasPendingPhotoSchema`,
  `insertPendingPhotoRecord`): detects #3119's additive `photos` columns
  (`status`, `submitted_by`, `quarantine_key`) via `PRAGMA table_info(photos)`
  at request time. When present, inserts a `status = 'pending'` row. When
  absent — the current state of `component/member-photo-experience`, since
  #3121/#3119 has not merged yet — the handler **fails closed** with a
  deterministic `SCHEMA_UNAVAILABLE` 503, rather than accepting an upload
  with nowhere safe to record it or guessing at a schema.
- **B2 quarantine storage I/O** (`putQuarantineObject`,
  `deleteQuarantineObject`): `functions/_lib/b2.ts` is read-only (list-only)
  and is not in this task's writable allowlist; #2898's report already
  flagged this gap. Resolution: this module imports the existing
  `AwsClient` S3 signer (from `functions/_lib/aws4fetch.ts`) and
  `requireB2`/`B2Bindings` (from `functions/_lib/b2.ts`) — both read-only,
  unmodified imports — and implements PUT/DELETE directly here, inside the
  allowlist. `deleteQuarantineObject` is the cleanup path for a D1-failed/
  B2-succeeded race: if the pending-record insert fails after the B2 PUT
  succeeded, the orphaned quarantine object is deleted rather than left
  behind.

### `functions/api/fanclub/photos/upload.ts`

`POST /api/fanclub/photos/upload` — wires the above into a single
fail-closed request pipeline: `requireMember` auth → B2 config check →
rate-limit check → multipart parse → consent-confirmation check → size
check → signature/dimension validation → schema-availability check →
quarantine key generation → B2 PUT → pending-record insert (with B2
cleanup on failure) → best-effort attempt logging on every path (success
and every failure branch). Every response includes a `requestId` and a
deterministic `code`, matching `functions/api/login.ts`'s pattern.

## Preserved behavior

No existing file was modified. `functions/api/fanclub/photos.ts` (read/list),
`functions/api/photos.ts` (public read), and all existing gallery/search/tag
behavior are unchanged.

## Known test failure and required follow-up (protected stop)

`npx vitest run` (full suite) has exactly one failing test outside this
task's own new test file:

```
FAIL tests/preview-isolation-inventory.test.ts > preview isolation inventory
     > documents every mutating Pages Function handler in the manifest
Add missing mutating handlers: functions/api/fanclub/photos/upload.ts
```

This is a real, correct finding by that test: the new `onRequestPost`
handler is a mutating endpoint and must be registered in
`scripts/ci/preview-isolation-manifest.json`'s `mutatingRoutes` array.
**That file is outside this task's 4-file writable allowlist**, and per
this task's own "Protected stops" clause ("write outside allowlist... stops
only the affected action[,] does not convert this Issue or the Claude queue
to HOLD"), this PR does not edit it. The exact entry needed, matching the
existing format precisely (e.g. the neighboring `functions/api/login.ts`
entry), is:

```json
{ "method": "POST", "path": "/api/fanclub/photos/upload", "handler": "functions/api/fanclub/photos/upload.ts", "classification": "production-shared", "tables": ["photos", "photo_upload_attempts"] }
```

This should be added either by WORK directly, or via a small follow-up task
with that one file in its allowlist, before or alongside this PR's merge —
`preview-isolation-inventory.test.ts` will keep failing until then. Flagging
this explicitly rather than silently working around the allowlist boundary
or silently leaving the suite red without explanation.

## Validation performed

- `npx vitest run tests/member-photo-upload.test.ts` — PASS (25/25):
  signature detection, full validation matrix (valid PNG/JPEG/WebP-VP8X/
  WebP-VP8, oversized, unsupported type, mismatch, malformed/truncated,
  polyglot), quarantine-key format/uniqueness/no-caller-data, and
  schema-gated D1 behavior (rate limit fail-open when table absent,
  threshold enforcement when present, per-member isolation, pending-record
  insert when schema present, fail-closed when absent) — the schema-present
  tests apply #3119's migration inline (`ALTER TABLE`/`CREATE TABLE`
  statements matching `migrations/0045_...` in PR #3121) via `node:sqlite`,
  since that migration has not merged into this branch; this keeps the test
  self-contained rather than depending on #3121's merge order.
- `npx vitest run` (full suite) — 969/970 pass; the one failure is the
  documented, expected `preview-isolation-inventory.test.ts` finding above.
- `npx tsc --noEmit -p .` — PASS, no errors.
- `git diff --check` — PASS.
- Confirmed only the 4 allowlisted files changed (plus this report).

## Rollback

One component PR revert. No B2 objects or D1 rows are written by this PR
itself — `putQuarantineObject`/`insertPendingPhotoRecord` only execute at
request time against a live deployment; no migration, seed, or Production
mutation is performed by this change.

## Exact instructions for #2900

- The `status = 'published'` read-filter requirement on
  `functions/api/fanclub/photos.ts`/`functions/api/photos.ts` (per #3119's
  post-review correction) is unaffected by this PR — it still must ship
  alongside the first code path that writes a non-`'published'` row, which
  is this PR's `insertPendingPhotoRecord`. Confirm that filter is in place
  before/alongside enabling this endpoint in an environment where #3121 has
  merged.
- Moderation transition from `pending` still requires promoting the object
  from `quarantine_key`'s B2 path to a public path and rewriting `url` —
  this PR's `putQuarantineObject`/`deleteQuarantineObject` operate only on
  the quarantine namespace; no promotion/copy-to-public helper exists yet.
