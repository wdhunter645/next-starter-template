<!-- CURSOR_AGENT_PR_BODY_BEGIN -->
- **Issue:** #1853

## QUEUE / DEPENDENCY MAP STATUS
- Dependency-map result: pass
- Next queue item: #1854 — rollout checkpoint validation
- Continue/halt decision: continue after #1853 post-merge verification

## PRE-MERGE CLOSEOUT PREDICTION
- Pre-merge closeout prediction: pass
- Source issue state before merge: open
- Expected post-merge source issue action: manual close
- Reviewer disposition parseability: pass
- Queue continuation after closeout: continue to #1854

## PROGRESS + READINESS
- Phase: MERGED
- Status: MERGED
- Scope Confirmed: YES
- Blocking Issues: none
- Notes: Merged as PR #1889 at `810db3262b4e21dd1b9373b629bda7b69599f45f`. Post-merge closeout body replay registered.

## DOCUMENTATION SOURCE
- [x] DIATAXIS_ROUTED

Source Files Used:
- `docs/reference/ci/post-merge-self-healing-classification-contract.md`

## LABEL
- Intent label for this PR: docs-only

## DESIGN SOURCE OF TRUTH (NON-NEGOTIABLE)
- Canonical process reference: `/docs/governance/PR_PROCESS.md`
- Canonical governance reference: `/docs/governance/PR_GOVERNANCE.md`
- Canonical troubleshooting reference: `/docs/reference/governance/troubleshooting-data-surface-requirements.md`
- Canonical design reference: `/docs/reference/design/LGFC-Production-Design-and-Standards.md`

## FILE-TOUCH ALLOWLIST (MANDATORY)
Allowed files:
- `docs/how-to/ci/post-merge-self-healing-runbook.md`

## VISUAL / UX INVARIANTS (MANDATORY)
- [x] Header, footer, navigation, auth, and route invariants preserved
- [x] No unauthorized visual drift introduced
- [x] No out-of-scope UX changes introduced
- [x] Store behavior, Join/Login behavior, and Fan Club/Admin gating remain compliant

## DRIFT GATE ALIGNMENT (MANDATORY)
- [x] Exactly ONE intent label applied
- [x] File changes match allowlist exactly
- [x] No mixed-intent changes present

## CHANGE SUMMARY
- Add operator runbook for self-healing workflow dispatch and artifact review.

## BUILD / TEST / VERIFICATION
- `npm test -- tests/docs-guardrails.test.mjs` (docs header guardrails) — PASS on merged head
- Runbook includes required `## Procedure` section per DIATAXIS how-to routing

## ACCEPTANCE CRITERIA
- [x] Runbook documents dry-run dispatch, artifact review, and escalation handoff
- [x] Docs-only scope limited to allowlisted runbook path

## REVIEWER RESPONSE ACCOUNTING
- [x] No actionable reviewer findings on latest head.
<!-- CURSOR_AGENT_PR_BODY_END -->
