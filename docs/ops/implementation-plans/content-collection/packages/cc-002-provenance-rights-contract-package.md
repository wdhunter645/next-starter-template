---
Doc Type: Implementation Plan
Audience: Bill, ChatGPT, Cursor, LGFC maintainers, implementation agents
Authority Level: Operational Plan (non-authoritative until promoted via Issue/PR)
Owns: CC-002 implementation envelope — source, provenance, rights, privacy, publication-review, takedown, and human-review authority for Content Collection assets
Does Not Own: Legal conclusions, automated rights determination, or merge authorization
Canonical Reference: /docs/reference/website/lou-gehrig-source-provenance-model.md
Related Issues: #2361, #2359, #2360, #1738, #2286, #2433, #2434
Last Reviewed: 2026-07-21
---

# CC-002 Source Provenance and Rights Contract Package

## Purpose

Define the source, credit, citation, provenance, rights, privacy, publication-review, takedown, and human-review authority contract for LGFC content assets — as a companion to CC-001 and **merged into** existing Lou Gehrig provenance/rights reference authority.

## Scope

**In scope:**

- Field and state models for source identification and exposure control.
- Public/member display rules by rights and privacy state.
- Human-review authority (no AI auto-approval).
- Gap matrix vs existing reference docs.
- Repo-verified paths, allowlist, validation, and freeze dependency on CC-001.

**Out of scope:**

- Creating `docs/reference/website/content-collection/provenance-and-rights-contract.md` as a parallel SOT (rejected per #2360 C4).
- Gallery/Library/Memorabilia/Club route implementation.
- Legal advice or automated rights determination.

## Current known truth

| Surface | Repo path | Role |
| --- | --- | --- |
| Source provenance model | `docs/reference/website/lou-gehrig-source-provenance-model.md` | Credit, contributor records, conflicting sources (#1741) |
| Rights/privacy/publication review | `docs/reference/website/lou-gehrig-rights-privacy-publication-review.md` | Clearance states, no-publish conditions (#1742) |
| Metadata schema | `docs/reference/website/lou-gehrig-content-metadata-schema.md` | Required candidate fields + enforcement vocabulary |
| Provenance how-to | `docs/how-to/website/lou-gehrig-source-provenance-review.md` | Operator workflow |
| #2286 pipeline | `functions/_lib/content-pipeline-publication-prep.ts`, `content-pipeline-candidate-admin.ts` | Publication-prep, display-safety, and review surfaces |
| Intake draft | `_incoming/.../CC-002 … Draft.docx` on `atlas/drive-draft-intake-2367` | Non-authority |

**ChatGPT disposition (#2360):** CC-002 is `merge_into_existing`. Prefer updates to existing Lou Gehrig provenance/rights docs unless ChatGPT freezes supersession.

## Relationship to CC-001 and #2286

- CC-002 is a **companion** to CC-001; public/member display lanes require both contracts frozen.
- CC-002 **consumes** #2286 publication-prep and admin review APIs — does not rebuild them.
- `contract_dependency`: `CONTRACT-FROZEN: content-asset-model v1` (verified on #2433 / PR #2675 at `d233e2956f4cabd93bf3a41be516e36993723c32`) before downstream feature display implementation.
- Runtime enforcement helper: `evaluatePublicMemberDisplaySafety` (fail-closed).

## Gap matrix (resolved for #2434 freeze)

| CC-002 draft concept | Existing authority | Disposition |
| --- | --- | --- |
| Source fields (`source_name`, `source_type`, `source_credit`, `citation_text`, …) | metadata schema + provenance model | **Resolved** — canonical names + research↔pipeline mapping documented |
| `source_type` values (member_submission, archive_reference, …) | candidate `source_type` / `acquisition_method` / `input_stream` | **Resolved** — map draft enums to #2286 `source_type` + `input_stream` |
| Rights state model | rights model + #2286 `rights_status` | **Resolved** — enforcement uses underscore enums; research aliases mapped |
| Privacy state model | `privacy_flag` + `privacy_review_status` | **Resolved** — draft `privacy_status` alias rejected for runtime |
| Publication review states | `review_status` + `publication_status` | **Resolved** — draft `publication_status` alias for review rejected; both fields kept orthogonal |
| Human review authority rule | metadata schema automation boundary; rights model | **Resolved** — reinforced in refs + runtime comments |
| Takedown/suppression fields | soft-delete (`deleted_at`, `retention_reason`, audit actor) | **Resolved (mapped)** — dedicated `takedown_*` columns **deferred** until migration-authorized follow-up; soft-delete fail-closes display |
| Per-surface display requirements | provenance credit table + CC-001 view contracts | **Resolved** — credit rules + shared fail-closed display gate; surface-specific UI remains feature-lane work |
| Public display block rules | rights model + `evaluatePublicMemberDisplaySafety` | **Resolved** — testable fail-closed gates |

## Rights and privacy public-display rules

Content **must not** display on public or member surfaces when any CC-002 gate fails.
Canonical field names only: `rights_status`, `privacy_flag`, `privacy_review_status`,
`review_status`, `publication_status`, `deleted_at`.

### Field-name normalization (canonical → draft alias)

| Canonical (repo authority) | CC-002 draft alias | Notes |
| --- | --- | --- |
| `privacy_flag` | `privacy_status` | Draft alias only — do not use at runtime |
| `privacy_review_status` | (none) | Orthogonal to `privacy_flag` |
| `review_status` | `publication_status` (misused) | Draft sometimes overloaded review with publication — keep fields separate |
| `publication_status` | draft publication labels | Use #2286 publication enum |
| `rights_status` | draft rights labels (`unknown_pending_review`, …) | Map to #2286 `rights_status` before enforcement |

### Blocking values (fail-closed)

| Domain | Blocking values |
| --- | --- |
| `rights_status` | `unknown`, `permission_needed`, `permission_requested`, `copyright_restricted`, `blocked` (allow only `permission_granted` or `public_domain_candidate`) |
| `privacy_review_status` | `pending_review`, `restricted`, `blocked` |
| `privacy_flag` | `living_person`, `donor_member`, `minors`, `sensitive`, `other` unless `privacy_review_status = approved` |
| `review_status` | anything other than `approved_public_candidate` |
| `publication_status` | anything other than `published` |
| Suppression | `deleted_at` set (soft_deleted) |

## Human review authority rule

Human/operator review is authoritative. AI, OCR, automated tagging, or inferred metadata **must not** approve publication, rights, privacy, credit, or provenance. AI-ready fields remain advisory until human workflow completes.

## Takedown and suppression

Required draft concepts map to #2286 soft-delete:

| Draft field | Mapping |
| --- | --- |
| `suppression_reason` | `retention_reason` (+ notes) |
| `suppressed_by` | soft-delete audit actor |
| `suppressed_at` | `deleted_at` |
| `takedown_request_source` | **Deferred** — notes until schema extension |
| `takedown_resolution_note` | **Deferred** — notes until schema extension |

## Freeze marker (blocks feature work)

Until Atlas verifies both CC-001 and CC-002 freeze evidence, **P2/P3/P4/P5 feature implementation must not start**:

```text
CONTRACT-FROZEN: provenance-rights-publication v1
```

### Freeze evidence packet (PREPARED — not self-approved)

```text
CONTRACT-FROZEN: provenance-rights-publication v1
Status: PREPARED — awaiting independent Atlas verification (Cursor must not self-approve)
source issue: #2434
package path: docs/ops/implementation-plans/content-collection/packages/cc-002-provenance-rights-contract-package.md
CC-001 dependency: CONTRACT-FROZEN: content-asset-model v1 verified via #2433 / PR #2675 @ d233e2956f4cabd93bf3a41be516e36993723c32
merged PR reference: pending component merge of this child PR (fill SHA after merge)
fields included:
  - canonical field-name alignment (privacy_flag, privacy_review_status, rights_status, review_status, publication_status)
  - research ↔ #2286 enum mapping tables
  - fail-closed public/member display block rules
  - human review authority (no AI approval path)
  - takedown/suppression mapping onto soft-delete + deferred dedicated columns
  - runtime helper evaluatePublicMemberDisplaySafety + admin re-export
  - negative-case tests under tests/*provenance*, tests/*rights*, tests/*content-asset*
downstream lanes released: NONE — P2 Gallery, P3 Library, P4 Memorabilia, P5 Club remain blocked until Atlas verifies CC-001 and CC-002 freeze evidence
known limitations:
  - Dedicated takedown_request_source / takedown_resolution_note columns deferred (no migration in #2434 allowlist)
  - Surface-specific credit UI remains feature-lane work under CC-001 view contracts
  - No Gallery/Library/Memorabilia/Club route implementation in this PR
ChatGPT verification request: Verify gap matrix dispositions, fail-closed display rules, human-authority preservation, and whether the freeze marker may be posted on #2434 / #2431
```

## Repo-verified implementation surfaces

| Kind | Verified paths |
| --- | --- |
| Canonical reference (update when child issue authorizes) | `docs/reference/website/lou-gehrig-source-provenance-model.md`, `docs/reference/website/lou-gehrig-rights-privacy-publication-review.md`, `docs/reference/website/lou-gehrig-content-metadata-schema.md` |
| Package envelope | `docs/ops/implementation-plans/content-collection/packages/cc-002-provenance-rights-contract-package.md` |
| Pipeline integration | `functions/_lib/content-pipeline-publication-prep.ts`, `functions/_lib/content-pipeline-candidate-admin.ts` |
| Tests | `tests/*provenance*`, `tests/*rights*`, `tests/*content-asset*` |

**Hot zones — require explicit approval:**

- `src/app/fanclub/**` route files
- `.github/workflows/**`, `scripts/ci/**`
- `functions/_middleware.ts`, broad unrelated migrations

## File allowlist (CC-002 implementation child issue)

```text
docs/reference/website/lou-gehrig-source-provenance-model.md
docs/reference/website/lou-gehrig-rights-privacy-publication-review.md
docs/reference/website/lou-gehrig-content-metadata-schema.md
docs/ops/implementation-plans/content-collection/packages/cc-002-provenance-rights-contract-package.md
functions/_lib/content-pipeline-publication-prep.ts
functions/_lib/content-pipeline-candidate-admin.ts
tests/*provenance*
tests/*rights*
tests/*content-asset*
```

## Parallel execution control

| Field | Value |
| --- | --- |
| `parallel_safe` | `conditional` |
| `contract_dependency` | CC-001 freeze marker for downstream feature lanes |
| `required_freeze_marker` | `CONTRACT-FROZEN: provenance-rights-publication v1` |
| `merge_order_constraint` | CC-002 should merge before public/member-facing content display lanes |
| `prohibited_parallel_lanes` | public/member-facing P2–P5 until Atlas verifies CC-001 and CC-002 |

## Validation plan

**What to verify:**

- Source/rights/privacy/publication models documented with canonical names.
- Public/member display cannot bypass review states.
- Human review authority preserved.
- Downstream lanes know display/enforcement fields.

**Commands (docs review):**

```bash
bash scripts/ci/docs_check_headers.sh
node scripts/ci/diataxis_folder_audit.mjs
node .agents/checks/agent-governance-check.mjs
```

**Commands (runtime / tests):**

```bash
npm run typecheck
npm test -- --run tests/provenance*
npm test -- --run tests/rights*
npm test -- --run tests/content-asset*
```

**Pass:** Public/member-visible content cannot bypass source/rights/privacy requirements.

**Fail:** Unsafe public display path exists — stop affected display lane.

## PR closeout requirements

- Source issue, package path, field/state summary.
- Public/private display rules stated.
- Human review authority statement.
- CC-001 freeze dependency noted.
- Validation evidence and downstream lane impacts.
- Freeze marker status (`PREPARED` until Atlas verifies).

## Procedure

1. Read CC-001 package and canonical provenance/rights refs.
2. Resolve gap matrix (especially takedown/suppression fields).
3. Implement only within child-issue allowlist.
4. Verify negative-case fixtures: blocked rights/privacy states never render on public routes.
5. Prepare freeze evidence packet; do not self-approve.
6. Post `CHATGPT HANDOFF` for independent Atlas verification.

## Acceptance criteria

- [x] Source/provenance/rights contract documented with repo-verified merge targets.
- [x] Public/private exposure rules explicit and testable.
- [x] Human review remains authoritative; no AI auto-approval path.
- [x] CC-001 freeze dependency documented for feature lanes.
- [x] Validation commands and evidence requirements defined.
- [x] No parallel SOT under rejected `content-collection/` reference tree.
- [x] Freeze evidence prepared for Atlas (not self-approved).
