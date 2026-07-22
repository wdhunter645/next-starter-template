---
Doc Type: Reference
Audience: LGFC operators, editors, and Bill/ChatGPT
Authority Level: Controlled
Owns: Clearance states, public-domain review, privacy review, excerpt/summary treatment, and no-publish conditions
Does Not Own: Legal conclusions, runtime enforcement, or public publication
Canonical Reference: /docs/ops/pmo/lou-gehrig-content-collection-expansion-readiness.md
Related issues: #1738, #1742, #1741
Last Reviewed: 2026-07-04
---

# Lou Gehrig Rights, Privacy, and Publication Review Model

## Purpose

Define operator review workflow for rights clearance, copyright assessment,
privacy review, excerpt/summary treatment, and conditions that block publication.

This is an operator review workflow, not legal advice. Bill/ChatGPT retain final
authority on ambiguous cases.

## Clearance states

| Rights status | Meaning | Public use |
| --- | --- | --- |
| `unknown` | Not yet assessed | Block public use |
| `public-domain-candidate` | Likely PD; needs confirmation | Reference only until confirmed |
| `permission-needed` | Rights holder approval required | Block public use |
| `permission-granted` | Documented approval | Allowed per license terms |
| `owned` | LGFC owns or created | Allowed with credit |
| `link-only` | Citation/reference only | No reproduction; link allowed |
| `rejected` | Rights unacceptable | Must not use |

## Public-domain review process

1. Identify work type (text, photo, government document, etc.).
2. Determine publication date and jurisdiction considerations.
3. Document assessment in notes; do not assume PD from age alone.
4. Set `public-domain-candidate` until Bill/ChatGPT or qualified review confirms.
5. Confirmed public domain may proceed to `approved-for-reference` or public-copy path.

## Privacy review process

| Privacy flag | Review action |
| --- | --- |
| `none` | Standard review |
| `living-person` | Verify consent or public-interest editorial justification |
| `donor/member` | Apply Fan Club privacy rules; no unauthorized disclosure |
| `minors` | Escalate to Bill/ChatGPT; default reject for public use |
| `sensitive` | Redact or defer; document mitigation |
| `other` | Document case-specific review in notes |

Do not publish private personal data about living people without explicit review.

## Excerpt and summary treatment

| Treatment | When allowed | Requirements |
| --- | --- | --- |
| Short quote with attribution | Fair use editorial judgment + rights review | Credit line, source citation |
| Summary in operator words | Rights allow reference | No wholesale copying |
| Link-only reference | High copyright risk | No body reproduction |
| Photo thumbnail | Rare; high bar | Explicit permission or PD confirmation |

When uncertain, use link-only/reference-only and defer public-copy approval.

## No-publish conditions

Block publication (public routes, `content_inventory`, Fan Club surfaces) when:

- `review_status` is not `approved-for-public-copy`;
- `rights_status` is `unknown`, `permission-needed`, or `rejected`;
- `privacy_flag` requires unresolved consent or redaction;
- `factual_confidence` is `low` without approved uncertainty language;
- `rejection_reason` is present;
- source is disallowed per category inventory;
- human editorial approval has not been recorded.

## Publication approval path

Publication requires sequential gates:

1. Provenance review complete.
2. Rights and privacy review complete.
3. Editorial conversion complete (Task 005).
4. Human editor approval recorded (`reviewer`, `reviewed_at`).
5. Placement decision per unified content workflow.

No automated publication is authorized by Program #1738.

## Acceptance checklist

- [x] Review states documented
- [x] No-publish conditions documented
- [x] Privacy review rules documented
- [x] Copyright/public-domain review documented as operator workflow
