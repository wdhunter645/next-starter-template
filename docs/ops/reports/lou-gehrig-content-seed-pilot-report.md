---
Doc Type: Operations
Audience: Bill, Atlas, Cursor, LGFC operators, and implementation agents
Authority Level: Controlled
Owns: Manual seed pilot plan and registry governance for Program #2273 Task-003 (#2276)
Does Not Own: Crawler automation, D1 migrations, admin UI, or public publication
Canonical Reference: /docs/reference/content/lgfc-content-candidate-model.md
Related issues: #2273, #2276, #2275, #2270
Last Reviewed: 2026-07-05
---

# Lou Gehrig Content Seed Pilot Report (Task-003)

## Purpose

Define the first controlled manual seed pilot for Lou Gehrig content collection
without crawler or search automation. Deliver the transitional candidate registry
at `data/research/lou-gehrig-content-candidates.json`.

Predecessor: `#2275` canonical model and JSON Schema.

## Registry classification

| Property | Value |
| --- | --- |
| File | `data/research/lou-gehrig-content-candidates.json` |
| Schema | `data/research/lou-gehrig-content-candidates.schema.json` |
| Class | `seed_transitional` |
| Operational authority | **No** — D1 remains source of truth for published content |
| Public publication implied | **No** — inclusion does not publish |

## Trusted source categories (pilot)

Manual URL intake only from these approved categories (3–5 sources represented):

| # | Source category | Example source | Intake method |
| --- | --- | --- | --- |
| 1 | National Baseball Hall of Fame | baseballhall.org | Manual catalog/search URL |
| 2 | Library of Congress | loc.gov | Manual search URL |
| 3 | New York Times Archive | nytimes.com | Manual search URL |
| 4 | Columbia University Archives | library.columbia.edu | Manual archive URL |
| 5 | Yankees / MLB official history | mlb.com/yankees | Manual history URL |

**Not in pilot:** broad web crawl, Search API automation, social scraping, paywall
copy ingestion, binary download without rights.

## Manual intake process

1. Operator selects URL from approved source category.
2. Operator creates candidate with conservative defaults:
   - `rights_status = unknown` or `permission_needed`
   - `review_status = pending_review`
   - `publication_status = not_ready`
   - `source_trust_status = trusted` only after domain/category check
3. Operator fills required schema fields per canonical model.
4. Operator runs duplicate check (exact `source_url` + `content_type`).
5. Operator records provenance in `provenance_notes` and `source_metadata.date_accessed`.
6. No candidate is promoted to `content_inventory` from this task.

## Pilot registry contents

| Metric | Value |
| --- | --- |
| Total candidates | 30 |
| Target range | 25–50 |
| `public_research` | 28 |
| `admin_seed` | 1 |
| `member_submission` (shaped example) | 1 |
| `scheduled_discovery` | 0 |
| Duplicate example | 1 (`duplicate_of` set) |
| Review states represented | pending, internal reference, deferred rights, rejected, public candidate |
| Rights states represented | unknown, public_domain_candidate, permission_needed, permission_granted |

## Duplicate detection expectations

| Level | Rule | Pilot action |
| --- | --- | --- |
| Exact | Same `source_url` and `content_type` | Set `duplicate_of`; do not merge automatically |
| Near | Same title + source_name | Flag in `admin_notes`; human confirms |
| Editorial | Same story tag after conversion | Handled at inventory layer (future) |

## Promotion path to durable surfaces

```text
Seed JSON (this pilot)
  → operator review in future admin candidate UI
  → D1 content_items table (#2278 plan)
  → editorial conversion → content_inventory
  → public surfaces (published inventory only)
```

Member-shaped pilot record demonstrates field requirements before runtime upload
exists. Operational intake remains `POST /api/library/submit` → `submission_queue`.

## Pilot success criteria (planning)

| Criterion | Pilot status |
| --- | --- |
| 25–50 candidates | 30 seeded |
| ≥2 input streams | public_research + admin_seed + member_submission |
| 3–5 trusted sources | 5 categories |
| Every candidate tagged | people/topic/location tags populated |
| Provenance notes | present on research records |
| Conservative rights/review | defaults applied |
| Duplicates identified | 1 exact duplicate example |
| No automatic publication | all `publication_status` ≠ published |
| Admin review rules testable | states span review/rights/defer/reject |

## Out of scope

- Crawler/search automation
- D1 migration
- Admin UI/API
- Public publishing
- Hard production source approval

## Next steps

- Task-004 (#2277): member submission intake model
- Task-005 (#2278): D1/storage implementation path
- Task-006 (#2279): admin review and publication-prep plan
