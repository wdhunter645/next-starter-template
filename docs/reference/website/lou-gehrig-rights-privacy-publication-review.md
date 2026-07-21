---
Doc Type: Reference
Audience: LGFC operators, editors, and Bill/Atlas
Authority Level: Controlled
Owns: Clearance states, public-domain review, privacy review, excerpt/summary treatment, and no-publish conditions
Does Not Own: Legal conclusions, automated rights determination, or public publication
Canonical Reference: /docs/ops/pmo/lou-gehrig-content-collection-expansion-readiness.md
Related Issues: #1738, #1742, #1741, #2434, #2286
Last Reviewed: 2026-07-21
---

# Lou Gehrig Rights, Privacy, and Publication Review Model

## Purpose

Define operator review workflow for rights clearance, copyright assessment,
privacy review, excerpt/summary treatment, and conditions that block publication.

This is an operator review workflow, not legal advice. Bill/Atlas retain final
authority on ambiguous cases. AI, OCR, crawlers, and automated tagging **must
not** approve rights, privacy, credit, provenance, or publication.

## Clearance states (canonical #2286 names)

Enforcement and tests use `functions/_lib/content-pipeline-candidate-constants.ts`.
Research hyphen aliases map per
`docs/reference/website/lou-gehrig-content-metadata-schema.md`.

| `rights_status` | Meaning | Public / member display |
| --- | --- | --- |
| `unknown` | Not yet assessed | **Block** |
| `public_domain_candidate` | Likely PD; needs confirmation for reproduction confidence | Allowed only after human confirmation path; prep may treat as acceptable rights gate, display still requires human `approved_public_candidate` + `published` |
| `permission_needed` | Rights holder approval required | **Block** |
| `permission_requested` | Request outstanding | **Block** |
| `permission_granted` | Documented approval | Allowed per license terms when other gates pass |
| `copyright_restricted` | Rights unacceptable for reproduction | **Block** |
| `blocked` | Hard block / rejected-equivalent | **Block** |

Citation / link-only research intent maps to
`review_status = approved_citation_reference_only` (no media reproduction on
Gallery/Memorabilia). Do not invent a parallel `link-only` rights enum at runtime.

## Public-domain review process

1. Identify work type (text, photo, government document, etc.).
2. Determine publication date and jurisdiction considerations.
3. Document assessment in notes; do not assume PD from age alone.
4. Set `public_domain_candidate` until Bill/Atlas or qualified human review confirms.
5. Confirmed public domain may proceed toward `approved_internal_reference` or
   `approved_public_candidate` with human approval recorded.

## Privacy review process

| `privacy_flag` | Review action |
| --- | --- |
| `none` | Standard review; `privacy_review_status` may be `not_applicable` |
| `living_person` | Verify consent or public-interest editorial justification; require `privacy_review_status = approved` before display |
| `donor_member` | Apply Fan Club privacy rules; no unauthorized disclosure; require approved privacy review before display |
| `minors` | Escalate to Bill/Atlas; default reject for public/member display |
| `sensitive` | Redact or defer; document mitigation; require approved privacy review before display |
| `other` | Document case-specific review; require approved privacy review before display |

| `privacy_review_status` | Display effect |
| --- | --- |
| `not_applicable` | Allowed only when `privacy_flag` is `none` |
| `pending_review` | **Block** |
| `approved` | Allowed when other gates pass |
| `restricted` | **Block** |
| `blocked` | **Block** |

Do not publish private personal data about living people without explicit human review.

## Excerpt and summary treatment

| Treatment | When allowed | Requirements |
| --- | --- | --- |
| Short quote with attribution | Fair use editorial judgment + rights review | Credit line, source citation |
| Summary in operator words | Rights allow reference | No wholesale copying |
| Link-only reference | High copyright risk | `approved_citation_reference_only`; no body reproduction |
| Photo thumbnail | Rare; high bar | Explicit permission or PD confirmation + human approval |

When uncertain, use citation-only / reference-only and defer public-copy approval.

## Fail-closed public / member display block rules (CC-002)

Downstream feature lanes **must not** render candidate-derived content on public
or member surfaces when any gate fails. Runtime helper:
`evaluatePublicMemberDisplaySafety` in
`functions/_lib/content-pipeline-publication-prep.ts` (also re-exported from
`content-pipeline-candidate-admin.ts`).

Block when **any** of the following is true:

- `deleted_at` is set (soft-delete / suppression);
- `rights_status` is `unknown`, `permission_needed`, `permission_requested`,
  `copyright_restricted`, or `blocked` (or not `permission_granted` /
  `public_domain_candidate`);
- `privacy_review_status` is `pending_review`, `restricted`, or `blocked`;
- `privacy_flag` is `living_person`, `donor_member`, `minors`, `sensitive`, or
  `other` **and** `privacy_review_status` is not `approved`;
- `review_status` is not `approved_public_candidate` (human-approved only);
- `publication_status` is not `published`;
- human editorial approval has not been recorded (`reviewer` / review audit).

Admin prep eligibility (`evaluatePublicationPrepEligibility`) is a **separate**
internal gate and must not be treated as authorization to display on public or
member routes.

## Publication approval path

Publication requires sequential gates:

1. Provenance review complete.
2. Rights and privacy review complete (human).
3. Editorial conversion complete (Task 005).
4. Human editor approval recorded (`reviewer`, `reviewed_at` / review audit).
5. Placement decision per unified content workflow.
6. Inventory conversion sets `publication_status = published` only via the
   authorized publication/conversion workflow (admin review cannot self-set
   `published`).

No automated publication is authorized by Program #1738 or Content Collection
Phase 1.

## Takedown and suppression

See metadata schema mapping: soft-delete uses `deleted_at` + `retention_reason`
(+ audit actor). Dedicated takedown columns remain deferred until a
migration-authorized follow-up. Soft-deleted candidates fail closed for display.

## Acceptance checklist

- [x] Review states documented with canonical #2286 names
- [x] Fail-closed no-publish / display block conditions documented
- [x] Privacy review rules documented
- [x] Copyright/public-domain review documented as operator workflow
- [x] Human review authority preserved; AI cannot approve
