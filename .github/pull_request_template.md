<!--
LGFC PR Template — stable facts only

Canonical PR-process authority: docs/governance/PR_PROCESS.md

Design principle: this body holds only facts that are stable at PR-open time
and concise human-readable implementation evidence. It does not hold dynamic
GitHub lifecycle state such as review comment IDs, review-thread status, check
state, merge-readiness status, or post-merge closeout status.

Dynamic state lives in GitHub reviews, review threads, labels, required checks,
and post-merge closeout records. Merge authority remains GitHub branch
protection and required checks. The ready-for-merge label is a derived
operator-visibility signal only.
-->

# PR Summary

- **Issue:** #____
- Intent label: <!-- intent:docs / intent:feature / intent:fix / intent:chore / intent:config / intent:ci / intent:ops -->
- PR class: <!-- docs-governance / docs-content / code / config / ci / release / ops / mixed-approved -->
- Size: <!-- medium-provisional / small / medium / large -->
- Delivery model: <!-- A / B-child / B-promotion / emergency-recovery -->
- Change mode: <!-- project / routine-ops / planned-migration / emergency -->
- Target environment: <!-- component / preview / production / recovery -->
- Approval profile: <!-- component-auto-integration / chat-bill-production / protected-change-review / emergency-approval -->
- Gate profile: <!-- component-child / production-candidate / component-promotion / emergency-recovery -->
- Rollback profile: <!-- one-step / multi-step / emergency-stabilization -->
- Component branch: <!-- component/<release-unit> / not-applicable -->
- Component master: <!-- #<program-issue> / not-applicable -->

## Scope

Allowed paths:
- `path/to/file`
- `path/to/directory/**`

Out-of-scope changes present: NO
Exception issue/approval if YES: #____ / not-applicable

## Change Summary

<!-- 2-5 sentences. State what changed and why. Do not list dynamic check or review state here. -->

## Verification

Local verification:
- Command: ``
  Result: PASS / FAIL / NOT RUN

CI verification:
- Required checks expected to pass: YES / NO
- Known failing/advisory checks: none

## Acceptance Criteria

- [ ] Source issue acceptance criteria reviewed
- [ ] Criteria complete, or a follow-up issue is linked below

Follow-up issue required: NO
Follow-up issue if required: #____ / not-applicable

## Reviewer / Bot Review Attestation

- [ ] I have read all human review threads on this PR
- [ ] I have read all bot/advisory findings on this PR

<!--
Do not paste comment IDs, review-thread state, generated auto-repair blocks,
check status, or merge-readiness status here.

Resolve actionable threads directly in GitHub. Reviewer lifecycle automation must
read GitHub-native review state and review-thread state via API; it must not use
this PR body as a lifecycle database.
-->
