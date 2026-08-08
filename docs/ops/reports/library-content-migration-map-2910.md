---
Doc Type: Operations Report
Audience: Bill, Work, Cursor, LGFC maintainers, and implementation agents
Authority Level: Controlled
Owns: #2910 field map, source identity, duplicate/conflict rules, attribution/publication handling, privacy-safe row-class count model, dual-read preservation, and exact implementation requirements for #2911–#2913
Does Not Own: Migration execution, backfill tooling, schema changes, D1/B2 mutation, Production access, or Production promotion
Canonical Reference: /docs/reference/website/content-inventory-model.md
Related Issues: #2910, #2860, #2911, #2912, #2913, #1256
Last Reviewed: 2026-08-08
---

# Library entries → content inventory migration map (#2910)

## Purpose

Reconcile legacy `library_entries` with canonical `content_inventory` so later
`#2860` children can implement idempotent dry-run/backfill, mixed-version
verification, and controlled Production batches without inventing mapping rules.

This report is documentation only. It does not migrate, mutate, or retire any
rows.

## Evidence baseline

| Surface | Path / identity | Role |
| --- | --- | --- |
| Starting SHA | `034ad9e5b8c88fe7b1d57cbe38fb103ce5a340b1` | Component branch base after #3178 / #2657 merge |
| Component branch | `component/library-content-migration` | Model B PR target for #2860 children |
| Legacy schema (early) | `migrations/0002_library_entries.sql` | `id`, `name`, `email`, `title`, `content`, `created_at` |
| Legacy schema (init) | `migrations/0004_init_schema.sql` | Adds `is_approved INTEGER NOT NULL DEFAULT 0` |
| Canonical schema | `migrations/0035_editorial_archive.sql` + `0036_content_inventory_schema_delta.sql` | `content_inventory` + summary/perspective/event_year |
| Model authority | `docs/reference/website/content-inventory-model.md` | Field and publication invariants |
| Dual-read runtime | `functions/api/fanclub/library.ts`, `functions/_lib/content-inventory-public.ts` | Inventory-first, legacy fallback |

Production D1 row counts were **not** queried in this task (no Production access
authorized). Live privacy-safe aggregates are an explicit #2912/#2913 evidence
requirement using the row-class model below.

## Current dual-read behavior (must be preserved)

Member library (`GET /api/fanclub/library`) and related-story helpers already
implement inventory-first fallback:

1. If `content_inventory` has at least one **published** row eligible for the
   relevant section (`library` or `related_content`), serve inventory.
2. Else if `library_entries` exists, serve legacy rows.
3. Else return empty.

`#2911`–`#2913` must not remove or weaken this fallback until cutover criteria
in this map are met and WORK accepts the successor package.

Legacy library list shape today maps:

| Legacy column used | Response field |
| --- | --- |
| `id` | `id` |
| `title` | `title` |
| `content` | `content` + truncated `description` |
| `created_at` | `year` (year slice only) |
| (none) | `author` / `url` are null |

Important: the live library fallback query does **not** filter `is_approved`.
Any Production count or cutover plan must treat unapproved rows as a distinct
class rather than assuming the API already hides them.

## Field-by-field map

### Deterministic source identity

Every migrated inventory row must carry a deterministic, collision-safe source
identity derived only from the legacy primary key:

```text
source_identity = legacy:library_entries:{id}
tag             = legacy-library-{id}
```

Rules:

- `tag` is the durable story group key and must be unique for the migrated
  canonical row (`canonical = 1`).
- Re-running backfill with the same `source_identity` / `tag` is idempotent:
  update in place; do not create a second canonical row.
- Do not encode `email`, `name`, or raw `content` into `tag` or any public
  identity field.

Optional future schema (out of scope for #2910; may be proposed in #2911 if
needed): a dedicated `migration_source` / `legacy_library_entry_id` column. Until
then, `tag = legacy-library-{id}` is the approved identity contract.

### Column mapping

| `library_entries` | `content_inventory` | Rule |
| --- | --- | --- |
| `id` | identity via `tag` / source identity | Never overwrite an unrelated inventory `id`; new inserts receive a new inventory `id`. |
| `title` | `title` | Required. Empty/whitespace title → **fail closed** (do not publish). |
| `content` | `text` | Required. Empty/whitespace content → **fail closed** (do not publish). |
| `created_at` | `created_at`; also seed `published_at` only when status becomes `published` | Preserve original timestamp string when present; otherwise use migration clock. |
| `name` | `credit_line` (preferred) and/or `submitted_by` | Attribution for member-submitted legacy rows. Never place email here. |
| `email` | **not mapped to public inventory** | PII. Do not copy into `source_url`, `text`, `summary`, `search_text`, `credit_line`, or `source_name`. Retention of email, if required for Day-2 audit, belongs in a private/operator-only surface authorized later — not in this map's public inventory path. |
| `is_approved` (when column exists) | `status` | `1` → candidate for `published` only after attribution guardrails pass; `0` or missing approval → `draft`. |
| (none) | `source_name` | Default `LGFC Fan Club Library (legacy submission)` for migrated rows. |
| (none) | `source_url` | Leave null unless a durable non-PII URL already exists (none on legacy table). |
| (none) | `story_type` | Default `brief`. |
| (none) | `allowed_sections` | Default `["library"]`. Add `related_content` / `search` only when editorial policy for that row is accepted in a later child. |
| (none) | `canonical` | `1` for the migrated primary row. |
| (none) | `priority` | `0`. |
| (none) | `feature_weight` | `1`. |
| (none) | `search_text` | Derived from approved `title`, `text`, `credit_line`, `source_name`, and `tag` only — never email. |
| (none) | `summary` | Optional truncate of `text` (≤160 chars) for list teasers. |
| (none) | `media` | `[]` unless a later authorized media association task links photos. |

### Attribution / publication handling

Published inventory already fail-closes without `source_name` and `credit_line`
(schema triggers in `0036` and `publishedInventoryWhere` in runtime helpers).

For migrated rows:

| Condition | Resulting status | Publishable? |
| --- | --- | --- |
| `is_approved = 1` and non-empty `title`/`content` and non-empty mapped `credit_line` (from `name` or approved default credit) | `published` | Yes, after dry-run proof |
| `is_approved = 1` but missing usable credit/name | `draft` | No — requires editorial credit before publish |
| `is_approved = 0` / unknown | `draft` | No |
| Empty title or content | **excluded from auto-migration** | Fail closed; list in dry-run exception report |

Default credit when `name` is blank but approval exists:

```text
credit_line = Member library submission (legacy)
source_name = LGFC Fan Club Library (legacy submission)
```

## Duplicate and conflict rules

| Case | Detection | Disposition |
| --- | --- | --- |
| Re-run same legacy id | `tag = legacy-library-{id}` already present | Idempotent upsert of mapped fields; keep inventory `id`. |
| Inventory tag collision with non-legacy tag | Existing `content_inventory.tag` equals proposed tag but row is not this migration source | **Fail closed** — stop that row; escalate to editorial. |
| Two legacy rows with identical normalized title+content | Same fingerprint, different ids | Migrate both as separate tags (`legacy-library-{id}`); do not auto-merge. Optional later editorial merge into one tag with alternate perspectives. |
| Legacy row vs existing editorial inventory with same title | Title match only | Not automatic conflict. Migrate under `legacy-library-{id}` unless WORK/editorial records a merge decision. |
| Partial unique canonical-tag violation | Second canonical insert for same tag | Impossible under identity rule if tag is per legacy id; any violation aborts the batch row. |

Conflict outcome for tooling: per-row fail closed, continue other eligible rows
only when the dry-run/backfill mode is explicitly `continue-on-row-error`. Default
mode for Production batches (#2913) is **stop batch on first unresolved
conflict class** unless the runbook records otherwise.

## Privacy-safe row-class count model

Do **not** export names, emails, titles, or content in evidence. Use only class
counts and boolean flags.

| Class ID | Definition (schema/query intent) | Privacy note |
| --- | --- | --- |
| `LE_TOTAL` | `COUNT(*)` from `library_entries` | Aggregate only |
| `LE_APPROVED` | rows with `is_approved = 1` when column exists | Aggregate only |
| `LE_UNAPPROVED` | rows with `is_approved = 0` or column absent treated as unapproved for publish | Aggregate only |
| `LE_INVALID_EMPTY` | empty/whitespace `title` or `content` | Aggregate only |
| `LE_MISSING_NAME` | approved-looking rows with empty/whitespace `name` | Aggregate only |
| `LE_HAS_EMAIL` | rows with non-empty `email` | Count only — never sample values |
| `CI_LIBRARY_PUBLISHED` | published inventory with `library` in `allowed_sections` | Aggregate only |
| `CI_LEGACY_TAG` | inventory rows whose `tag` LIKE `legacy-library-%` | Aggregate only |
| `CI_LEGACY_PUBLISHED` | subset of `CI_LEGACY_TAG` with `status = 'published'` | Aggregate only |
| `GAP_UNMIGRATED_APPROVED` | `LE_APPROVED - CI_LEGACY_TAG` (by id parse) | Computed after dry-run |

Live Production fills of this table are required evidence for #2912/#2913. This
#2910 package approves the class taxonomy and forbids PII leakage in reports.

### Schema variance note

Repositories contain two historical `library_entries` definitions (`0002`
without `is_approved`, `0004` with it). Tooling must probe columns at runtime
(`PRAGMA table_info`) and classify approval using:

- column present → use `is_approved`;
- column absent → treat all rows as **unapproved for auto-publish** (`draft`
  only) unless a later WORK decision authorizes a different rule.

## Preserved fallback contract

Until WORK accepts cutover:

1. Keep inventory-first dual-read in library and related-content paths.
2. Do not drop `library_entries` reads.
3. Do not delete legacy rows as part of #2911 dry-run.
4. Cutover eligibility requires:
   - every `LE_APPROVED` non-invalid row represented as `CI_LEGACY_TAG`;
   - `CI_LIBRARY_PUBLISHED > 0` (or explicit empty-library acceptance);
   - dual-read tests still green;
   - rollback path proven (#2912).

## Exact implementation requirements for successors

### #2911 — Idempotent dry-run / backfill tooling and audit evidence

- Implement read-only dry-run and optional non-Production backfill using this map.
- Enforce source identity `tag = legacy-library-{id}`.
- Never write `email` into inventory fields.
- Emit privacy-safe class counts + per-row exception codes (no PII payloads).
- Prove idempotency (second run → zero net new tags).
- Leave Production writes to #2913.

### #2912 — Mixed-version behavior and isolated recovery execution

- Verify inventory-first + legacy fallback against mixed datasets.
- Prove recovery: revert inventory migration rows by tag prefix without destroying
  non-legacy inventory.
- Fill the privacy-safe count table from authorized environments.
- Confirm library/search/related surfaces do not regress.

### #2913 — Controlled Production batches and post-migration handoff

- Batch by class (`LE_APPROVED` first; drafts later only with editorial Go).
- Fail closed on conflict classes defined above.
- Post redacted counts before/after; no content/email/name samples.
- Do not retire `library_entries` fallback in the same batch as first write unless
  cutover criteria are already met and explicitly accepted.

## Acceptance checklist (#2910)

- [x] Every legacy column class is mapped or explicitly excluded (email).
- [x] Deterministic source identity defined.
- [x] Duplicate/conflict rules fail closed.
- [x] Attribution/publication rules align with inventory publish guardrails.
- [x] Dual-read behavior preserved until cutover criteria.
- [x] Privacy-safe row-class count model defined without live PII.
- [x] Exact requirements recorded for #2911–#2913.

## Rollback

Revert the documentation PR that introduces this report and the paired model
reference update. No data rollback is required for #2910.
