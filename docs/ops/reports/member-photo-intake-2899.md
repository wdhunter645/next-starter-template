---
Doc Type: Reference
Audience: Human + AI
Authority Level: Operational Evidence Report
Owns: Member photo intake, validation, quarantine, and rate-limit implementation (#2899)
Does Not Own: Schema/persistence contract decisions (#3119); moderation UI, publication flow, photo-detail UX (#2900)
Canonical Reference: /docs/reference/design/LGFC-Production-Design-and-Standards.md
Last Reviewed: 2026-08-07
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
check (fast-path on `File.size`, then an authoritative check on the actual
read byte length) → signature/dimension validation → schema-availability
check → quarantine key generation → B2 PUT → pending-record insert (with B2
cleanup on failure). Every response includes a `requestId` and a
deterministic `code`, matching `functions/api/login.ts`'s pattern —
including the B2-not-configured path, which previously returned a bare
`Response` without either field (fixed after review, see below).

**Attempt logging is intentionally not on every exit path.** `recordUploadAttempt`
is called on every branch that reflects something the *member* did (missing
consent, oversized/invalid/malformed file, B2 PUT failure, pending-record
insert failure). It is deliberately **not** called when: the request never
reached an authenticated member (no `db`/`email` yet); the request was
rejected for being *already* rate-limited (logging that would keep
re-extending the trailing 1-hour window every time a blocked client retries,
effectively making the rate limit self-perpetuating); B2 is unconfigured for
this environment; or the schema contract isn't available yet. The last three
are environment/system conditions, not user error, and logging them would
unfairly count against the member's own attempt budget.

## Preserved behavior

No existing file was modified. `functions/api/fanclub/photos.ts` (read/list),
`functions/api/photos.ts` (public read), and all existing gallery/search/tag
behavior are unchanged.

## Copilot review round — fixes applied and one clarified dependency

- **Fixed:** `hasPendingPhotoSchema` now checks all six columns
  `insertPendingPhotoRecord` writes (`status`, `submitted_by`, `submitted_at`,
  `quarantine_key`, `consent_confirmed`, `credit_line`), not just three. A
  partially-applied migration now correctly fails the schema gate with
  `SCHEMA_UNAVAILABLE` instead of passing the gate and failing at insert time
  with a generic `PERSIST_FAILED`. Covered by a new regression test.
- **Fixed:** the B2-not-configured early return now returns the same
  `{ ok, error, requestId, code }` shape as every other branch, instead of a
  bare `Response` missing `requestId`/`code`.
- **Fixed:** the handler now checks `File.size` and fails fast on an
  oversized upload before reading the full body into memory; the
  post-read byte-length check remains as the authoritative guard, since
  `File.size` is advisory.
- **Fixed:** `validateUploadedImage` now treats an empty or
  `application/octet-stream` declared MIME type as "unspecified" and
  validates purely from the binary signature, instead of rejecting an
  otherwise-valid upload outright — some multipart clients send no
  `Content-Type` or the generic fallback. An explicit, specific declared
  type that disagrees with the detected signature is still rejected
  (`SIGNATURE_MISMATCH`) — the security boundary remains the signature and
  structural checks, not the declared type. Since the declared type can no
  longer be trusted as the B2 object's `Content-Type` in the unspecified
  case, `putQuarantineObject` now receives a canonical MIME type derived
  from the *detected* kind (`canonicalMimeTypeForKind`) instead of the raw
  declared value.
- **Fixed:** logging-coverage language in this report (previous wording
  overstated it — see "What was implemented" above for the corrected,
  precise claim).
- **Clarified, not fixed here (promotion-gate dependency, not a same-PR
  merge blocker):** Copilot correctly noted that once #3119 merges,
  `insertPendingPhotoRecord` writes `quarantine_key` into `photos.url`, and
  the existing read endpoints (`functions/api/fanclub/photos.ts`,
  `functions/api/photos.ts`) select all rows unconditionally — so without
  the `status = 'published'` read-filter, pending rows would be publicly
  exposed. That filter's required file paths are **not** in this task's
  4-file allowlist (only `functions/api/fanclub/photos/upload.ts`,
  `functions/_lib/member-photo-upload.ts`, its test, and this report are).
  This is not an immediate risk for *this* PR: it merges into
  `component/member-photo-experience`, a pre-production component branch,
  and #3121's migration (the only thing that makes non-`'published'` rows
  possible at all) has not merged there yet either — so no live environment
  can currently be exposed by this PR alone. It **is** a hard requirement
  before any future Promotion PR from this component branch to `main`: the
  read-filter must land (in-scope for #2900, or via an explicit allowlist
  exception for this task) before or in the same promotion as this PR's
  code. Recorded here as an explicit, named promotion-gate condition rather
  than left implicit.

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

- `npx vitest run tests/member-photo-upload.test.ts` — PASS (31/31):
  signature detection, full validation matrix (valid PNG/JPEG/WebP-VP8X/
  WebP-VP8, oversized, unsupported type, mismatch, malformed/truncated,
  polyglot, unspecified/`application/octet-stream` MIME trusting the
  signature, explicit-mismatch still rejected), `canonicalMimeTypeForKind`,
  quarantine-key format/uniqueness/no-caller-data, and schema-gated D1
  behavior (rate limit fail-open when table absent, threshold enforcement
  when present, per-member isolation, pending-record insert when schema
  present, fail-closed when absent or only partially applied) — the
  schema-present tests apply #3119's migration inline (`ALTER TABLE`/
  `CREATE TABLE` statements matching `migrations/0045_...` in PR #3121) via
  `node:sqlite`, since that migration has not merged into this branch; this
  keeps the test self-contained rather than depending on #3121's merge order.
- `npx vitest run` (full suite) — 975/976 pass; the one failure is the
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
