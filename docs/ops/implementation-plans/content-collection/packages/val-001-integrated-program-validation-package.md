---
Doc Type: Implementation Plan
Audience: Bill, ChatGPT, Cursor, LGFC maintainers, program validators
Authority Level: Operational Plan (non-authoritative until promoted via Issue/PR)
Owns: VAL-001 integrated program validation — lane evidence requirements, closeout checklist, blocker classification, and evidence report template for Content Collection successor program
Does Not Own: Feature implementation, CI script implementation, merge authorization, or canonical validation law (defers to verification-closeout skill and governance standards)
Canonical Reference: /docs/ops/pmo/lou-gehrig-content-collection-expansion-readiness.md
Related Issues: #2361, #2359, #2360, #1738, #2286
Last Reviewed: 2026-07-08
---

# VAL-001 Integrated Program Validation Package

## Purpose

Define integrated terminal validation for the LGFC Content Collection successor program (#2359). Every implementation lane must know **before coding** what evidence is required for program closeout.

VAL-001 merges the intake draft into this operational package and defers duplicate authority to existing verification doctrine.

## Scope

**In scope:**

- Per-lane required evidence and pass conditions.
- Integrated validation checklist (build, routes, content integrity, design, parallel execution, documentation).
- Blocker vs administrative warning classification.
- Evidence report template.
- Repo-verified paths and allowlist.

**Out of scope:**

- Inventing acceptance criteria after implementation completes.
- Feature code changes in #2361.
- Replacing `.agents/skills/lgfc-verification-closeout/SKILL.md` or `docs/governance/standards/implementation-coverage-audit-standard.md`.

## Current known truth

| Surface | Repo path | Role |
| --- | --- | --- |
| Program readiness | `docs/ops/pmo/lou-gehrig-content-collection-expansion-readiness.md` | Launch/readiness authority (#1738) |
| Implementation plan | `docs/ops/implementation-plans/lou-gehrig-content-collection-expansion.md` | Predecessor task sequence |
| #2360 audit | `docs/ops/reports/content-collection-docs-audit-dedup-2360.md` | Disposition and path remap |
| Foundation packages | `docs/ops/implementation-plans/content-collection/packages/*.md` | CC-001, CC-002, CI-001, CI-002 |
| Verification closeout skill | `.agents/skills/lgfc-verification-closeout/SKILL.md` | Agent closeout procedure |
| Coverage audit standard | `docs/governance/standards/implementation-coverage-audit-standard.md` | Coverage expectations |
| Intake `docs/ops/programs/.../validation-plan.md` | — | **Rejected** — use this package path |

**Approved package path:** `docs/ops/implementation-plans/content-collection/packages/val-001-integrated-program-validation-package.md`

**Relationship to Validation and Evidence Standard intake draft:** `merge_into_existing` per #2360 C5 — single validation plan authority; intake standard remains planning input until promoted separately.

## Program closeout must prove

- Gallery, Library, Memorabilia display governed content (when lanes not deferred).
- Club Newspaper scoped design implemented without auth/exposure regression.
- Metadata/source-credit requirements satisfied for scoped surfaces.
- Source/provenance/rights/privacy/publication rules enforced or documented.
- No public/private exposure defect remains open.
- Validation evidence and as-built documentation exist per lane.
- Administrative closeout queue resolved or explicitly accepted.
- ChatGPT verification and Bill acceptance recorded where required.

## Lane evidence requirements

### Lane 1 — Standards and authority chain

| Evidence | Pass condition |
| --- | --- |
| Digital Asset Standard path (if promoted) | Complete; no v1 conflicts |
| Code Package Standard path (if promoted) | Codex language stripped |
| Package index: `docs/ops/implementation-plans/content-collection/package-index.md` | Reflects repo reality |

### Lane 2 — CI orchestration

| Evidence | Pass condition |
| --- | --- |
| CI Stage 0 report | Inventory complete |
| CI-001 / CI-002 packages or deferral rationale | Documented in package-index |
| Test/dry-run artifacts | Present if implementation landed |

### Lane 3 — Content asset model

| Evidence | Pass condition |
| --- | --- |
| CC-001 and CC-002 package paths | Gap matrices current |
| Implementation PRs (if any) | Merged with validation |
| `CONTRACT-FROZEN: content-asset-model v1` | Posted before feature lanes |

### Lanes 4–7 — Gallery, Library, Memorabilia, Club

Each lane requires when not deferred:

- Package path and implementation PR.
- `npm run build` / relevant test output.
- Route smoke output or screenshot.
- Source/credit/alt-text validation.
- Public/private exposure validation.
- Design compliance citation (`docs/reference/design/LGFC-Production-Design-and-Standards.md`).
- As-built doc path under `docs/ops/reports/` or scoped how-to.

### Lane 8 — Metadata / SEO / source credit

- Package or docs-only rationale.
- Source-credit display validation.
- Index/noindex rationale where scoped.

### Lane 9 — Storage / free-tier controls

- Acquisition/storage boundary documented.
- No uncontrolled expansion authorized.

### Lane 10 — AI-ready tagging guardrails

- No live AI runtime behavior in code (grep/validation evidence).
- Human-review authority statement matches CC-002.

### Lane 11 — Program validation (this package)

- Final validation report from template below.
- Administrative queue disposition.
- ChatGPT verification comment; Bill acceptance where required.

## Integrated validation checklist

### Build and test

```bash
npm run typecheck
npm run build
npm test
```

- No security/secrets failure (`gitleaks` / CI).
- No auth/exposure failure on scoped routes.

### Routes and surfaces

| Surface | Smoke check |
| --- | --- |
| Gallery | `/fanclub/photo` or scoped route — loads governed content |
| Library | `/fanclub/library` — not empty unless deferred with rationale |
| Memorabilia | `/fanclub/memorabilia` — grid/cards render |
| Club | `/fanclub` — newspaper block without auth regression |
| Admin/member private | Protected routes remain protected |

### Content integrity

- Required type/status/visibility fields present on displayed assets.
- Source/provenance/rights/privacy states present where required.
- Rejected/suppressed/soft-deleted/private-admin content not public.

### Design compliance

- Scoped surfaces cite design authority.
- Responsive behavior acceptable for scoped views.

### Parallel execution closeout

- No unresolved allowlist collisions.
- Hot-zone files not in conflict.
- `CONTRACT-FROZEN` posted before dependent implementation (if applicable).

### Documentation

- Package docs exist under `docs/ops/implementation-plans/content-collection/`.
- As-built docs exist per merged lane.
- Deferred items documented with issue links.

## Failure classification

### Program closeout blockers

- Build/typecheck/test failure.
- Broken Gallery/Library/Memorabilia/Club route.
- Public/private exposure defect.
- Source/rights/privacy bypass.
- Missing required as-built or validation evidence.
- Unresolved shared contract drift.
- Unauthorized AI runtime behavior.
- Uncontrolled storage/acquisition behavior.

### Administrative warnings (may queue)

- Stale label or dashboard state.
- Duplicate closeout exception.
- Non-critical PR body formatting post-merge.
- Missing non-critical status comment.

Administrative warnings must not hide product/scope/security/build/data defects (see CI-002 package).

## Evidence report template

Use for terminal closeout issue comment or `docs/ops/reports/content-collection-final-validation-<issue>.md`:

```markdown
# Content Collection Final Validation Report

## Program
- Successor program issue: #2359
- Predecessor #1738 disposition: [text]
- #2286 foundation: consumed, not duplicated
- Validation date: YYYY-MM-DD
- Validator: [agent/operator]
- Final status: complete | complete-with-admin-warnings | blocked | deferred

## Merged PRs
| PR | Source issue | Lane | Package | Result |
| --- | --- | --- | --- | --- |
| #NNNN | #NNNN | Gallery | GAL-001 | pass |

## Route / feature evidence
- Gallery: [pass/fail + notes]
- Library: [pass/fail + notes]
- Memorabilia: [pass/fail + notes]
- Club Newspaper: [pass/fail + notes]

## Public/private exposure
| Content type | Rule tested | Result |
| --- | --- | --- |

## Closeout queue
| Item | Classification | Disposition | Blocking |
| --- | --- | --- | --- |

## Final decision
- [ ] Program complete
- [ ] Complete with accepted administrative warnings
- [ ] Blocked — remediation issues: #___
- [ ] Deferred — rationale: [text]

ChatGPT verification: [link/comment]
Bill acceptance: [link/comment or N/A]
```

## Repo-verified paths

| Path | Purpose |
| --- | --- |
| This package | Terminal validation plan |
| `docs/ops/implementation-plans/content-collection/package-index.md` | Package navigation |
| `docs/ops/reports/` | As-built and final validation reports |
| `docs/how-to/website/club-home-content-operations-runbook.md` | Operator smoke context |
| `tests/*content-collection*`, `tests/*gallery*`, etc. | Validation tests when authorized |

## File allowlist (VAL-001 docs/tests child issue)

```text
docs/ops/implementation-plans/content-collection/packages/val-001-integrated-program-validation-package.md
docs/ops/implementation-plans/content-collection/package-index.md
docs/ops/reports/content-collection-final-validation-*.md
tests/*content-collection*
tests/*gallery*
tests/*library*
tests/*memorabilia*
tests/*club-home*
```

**Do not touch without approval:** feature implementation files (except scoped validation tests), global CI workflows, middleware/auth.

## Parallel execution control

| Field | Value |
| --- | --- |
| `parallel_safe` | `conditional` |
| `contract_dependency` | All non-deferred implementation lanes |
| `required_freeze_marker` | `CONTRACT-FROZEN: content-asset-model v1` |
| `merge_order_constraint` | Terminal validation follows non-deferred lane merges |

## Validation plan

**#2361 docs-only verification:**

```bash
bash scripts/ci/docs_check_headers.sh
node scripts/ci/diataxis_folder_audit.mjs
node .agents/checks/agent-governance-check.mjs
node scripts/check-repo-structure.mjs
```

**Terminal program closeout (future):** execute integrated checklist above; attach evidence report template; run post-merge validator clean on all lane PRs.

## Procedure

1. Ensure foundation packages (CC-001, CC-002, CI-001, CI-002) are indexed and current.
2. Before each lane starts, copy that lane's evidence row into the child issue acceptance criteria.
3. At program end, fill evidence report template.
4. Classify every open item as blocker or administrative warning.
5. Post `CHATGPT HANDOFF` for closeout review; Bill acceptance for program termination.

## Acceptance criteria

- [ ] Integrated validation plan exists with lane-specific evidence requirements.
- [ ] Evidence report template included.
- [ ] Blocker vs administrative warning rules defined and aligned with CI-002.
- [ ] As-built and closeout requirements defined.
- [ ] Repo-verified paths; no rejected `docs/ops/programs/` tree.
- [ ] Final validation executable without inventing criteria post-implementation.
