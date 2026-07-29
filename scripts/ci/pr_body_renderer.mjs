#!/usr/bin/env node

// Renders a `.github/pull_request_template.md`-compatible PR body from a
// validated Issue-side contract, for #2615/#2619.
//
// The rendered body must pass scripts/ci/pr_contract.mjs's
// validateRenderedPrBody() unchanged — this module owns layout only, never
// a second copy of field rules.

function line(label, value) {
  return `- ${label}: ${value || 'not-applicable'}`;
}

function renderList(items = []) {
  if (!items || items.length === 0) return '- `path/to/file`';
  return items.map((item) => `- \`${item}\``).join('\n');
}

/**
 * @param {{ issue: object, contract: { fields: object }, deliveryProfile: object }} args
 * @returns {string} PR body markdown.
 */
export function renderPrBody({ issue = {}, contract = {}, deliveryProfile = {} } = {}) {
  const fields = contract.fields || {};
  const primaryIssue = fields.primary_source_issue || issue.number;

  const summary = [
    '# PR Summary',
    '',
    `- **Issue:** #${primaryIssue}`,
    line('Intent label', fields.intent_label),
    line('PR class', fields.pr_class),
    line('Size', deliveryProfile.size),
    line('Delivery model', deliveryProfile.deliveryModel),
    line('Change mode', deliveryProfile.changeMode),
    line('Target environment', deliveryProfile.targetEnvironment),
    line('Approval profile', deliveryProfile.approvalProfile),
    line('Gate profile', deliveryProfile.gateProfile),
    line('Rollback profile', deliveryProfile.rollbackProfile),
    line('Component branch', deliveryProfile.componentBranch),
    line('Component master', deliveryProfile.componentMaster),
    line('Promotion PR', deliveryProfile.promotionPr),
  ].join('\n');

  const scope = [
    '## Scope',
    '',
    'Allowed paths:',
    renderList(fields.allowed_paths),
    '',
    `Out-of-scope changes present: ${fields.out_of_scope_changes_present || 'NO'}`,
    `Exception issue/approval if YES: ${fields.exception_issue || 'not-applicable'}`,
  ].join('\n');

  const changeSummary = [
    '## Change Summary',
    '',
    fields.change_summary || '',
  ].join('\n');

  const verificationCommands = Array.isArray(fields.verification_commands) ? fields.verification_commands : [];
  const localVerification = verificationCommands.length > 0
    ? verificationCommands
      .map((command) => `- Command: \`${command}\`\n  Result: ${fields.verification_results || 'NOT RUN'}`)
      .join('\n')
    : `- Command: (none)\n  Result: ${fields.verification_results || 'NOT RUN'}`;

  const verification = [
    '## Verification',
    '',
    'Local verification:',
    localVerification,
    '',
    'CI verification:',
    '- Required checks expected to pass: YES',
    '- Known failing/advisory checks: none',
  ].join('\n');

  const acceptance = [
    '## Acceptance Criteria',
    '',
    '- [x] Source issue acceptance criteria reviewed',
    '- [x] Criteria complete, or a follow-up issue is linked below',
    '',
    `Follow-up issue required: ${fields.follow_up_required || 'NO'}`,
    `Follow-up issue if required: ${fields.follow_up_issue || 'not-applicable'}`,
  ].join('\n');

  const rollback = [
    '## Rollback',
    '',
    fields.rollback_summary || '',
  ].join('\n');

  // Reviewer attestation is always generated unchecked — lifecycle-dependent
  // state is never authored ahead of time (docs/reference/ci/issue-pr-contract.md §2).
  const attestation = [
    '## Reviewer / Bot Review Attestation',
    '',
    '- [ ] I have read all human review threads on this PR',
    '- [ ] I have read all bot/advisory findings on this PR',
  ].join('\n');

  const sections = [summary, scope, changeSummary, verification, acceptance];
  if (fields.rollback_summary) sections.push(rollback);
  sections.push(attestation);

  return sections.join('\n\n').trim() + '\n';
}
