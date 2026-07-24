/**
 * Exact post-integration verification for #2677-003 / #2772.
 *
 * Verifies the recorded merge/integration SHA is present on the authorized
 * component target and that the source Issue remains open. This module never
 * closes Issues or activates successors.
 */

import {
  buildVerificationIdentity,
  commentContainsIdentity,
  identityMarker,
} from './idempotency.mjs';

/**
 * Verify an already-recorded component integration result.
 */
export function verifyPostIntegration({
  packet,
  targetBranch = null,
  mergeSha = null,
  targetBranchContainsMergeSha = null,
  targetBranchHeadSha = null,
  existingComments = [],
  componentIntegration = {},
} = {}) {
  if (componentIntegration?.enabled !== true) {
    return {
      ok: true,
      verified: false,
      suppressed: true,
      code: 'component_integration_disabled',
      actions: [],
    };
  }

  const sourceIssueNumber = Number(packet?.sourceIssue?.number);
  const prNumber = Number(packet?.pullRequest?.number);
  const headSha = normalizeSha(packet?.pullRequest?.headSha);
  const recordedMergeSha = normalizeSha(mergeSha);
  const resolvedTarget = String(
    targetBranch ||
      packet?.pullRequest?.deliveryProfile?.componentBranch ||
      packet?.pullRequest?.baseRef ||
      '',
  ).trim();

  if (!Number.isInteger(sourceIssueNumber) || sourceIssueNumber <= 0) {
    return failClosed('missing_source_issue', 'Source Issue identity is required.');
  }
  if (!Number.isInteger(prNumber) || prNumber <= 0) {
    return failClosed('missing_pr_number', 'Pull request number is required.');
  }
  if (!headSha) {
    return failClosed('missing_current_head', 'Pre-integration head SHA is required.');
  }
  if (!recordedMergeSha) {
    return failClosed(
      'missing_merge_sha',
      'Exact merge/integration SHA is required for post-integration verification.',
    );
  }
  if (!resolvedTarget) {
    return failClosed('missing_target_branch', 'Exact target branch is required.');
  }
  if (/^(main|master|production|prod)$/i.test(resolvedTarget)) {
    return failClosed(
      'forbidden_verification_target',
      'Post-integration verification refuses main/Production targets.',
      { targetBranch: resolvedTarget },
    );
  }

  const sourceState = String(packet?.sourceIssue?.state || '').toUpperCase();
  if (sourceState && sourceState !== 'OPEN') {
    return failClosed(
      'source_issue_closed_prematurely',
      'Source Issue must remain open after the integration transaction.',
      { state: sourceState },
    );
  }

  const containsMerge =
    targetBranchContainsMergeSha === true ||
    normalizeSha(targetBranchHeadSha) === recordedMergeSha;
  if (!containsMerge) {
    return failClosed(
      'merge_sha_not_on_target',
      'Target branch does not contain the recorded merge/integration SHA.',
      {
        targetBranch: resolvedTarget,
        mergeSha: recordedMergeSha,
        targetBranchHeadSha: normalizeSha(targetBranchHeadSha) || null,
      },
    );
  }

  const verificationIdentity = buildVerificationIdentity({
    sourceIssueNumber,
    prNumber,
    headSha,
    targetBranch: resolvedTarget,
    mergeSha: recordedMergeSha,
  });

  if (commentContainsIdentity(existingComments, 'verification', verificationIdentity)) {
    return {
      ok: true,
      verified: true,
      suppressed: true,
      code: 'verification_already_recorded',
      verificationIdentity,
      targetBranch: resolvedTarget,
      mergeSha: recordedMergeSha,
      sourceIssueState: 'OPEN',
      closeout: false,
      successorActivation: false,
      actions: [],
    };
  }

  const action = {
    type: 'record_post_integration_verification',
    issueNumber: sourceIssueNumber,
    prNumber,
    headSha,
    targetBranch: resolvedTarget,
    mergeSha: recordedMergeSha,
    identity: verificationIdentity,
    body: verificationBody({
      sourceIssueNumber,
      prNumber,
      headSha,
      targetBranch: resolvedTarget,
      mergeSha: recordedMergeSha,
      verificationIdentity,
    }),
  };

  return {
    ok: true,
    verified: true,
    suppressed: false,
    code: 'verification_recorded',
    verificationIdentity,
    targetBranch: resolvedTarget,
    mergeSha: recordedMergeSha,
    sourceIssueState: 'OPEN',
    closeout: false,
    successorActivation: false,
    actions: [action],
  };
}

function verificationBody({
  sourceIssueNumber,
  prNumber,
  headSha,
  targetBranch,
  mergeSha,
  verificationIdentity,
}) {
  return `POST-INTEGRATION VERIFICATION
Issue: #${sourceIssueNumber}
PR: #${prNumber}
Pre-integration head SHA: ${headSha}
Target branch: ${targetBranch}
Merge SHA: ${mergeSha}
Source Issue state: OPEN
Closeout: deferred
Successor activation: deferred
Mutation boundary:
- Verification only.
- Do not close the source Issue.
- Do not activate a successor.
- Do not mutate main or Production.
${identityMarker('verification', verificationIdentity)}`;
}

function normalizeSha(value) {
  const sha = String(value || '').trim().toLowerCase();
  return /^[0-9a-f]{7,40}$/.test(sha) ? sha : '';
}

function failClosed(code, message, details = {}) {
  return {
    ok: false,
    verified: false,
    suppressed: false,
    code,
    message,
    closeout: false,
    successorActivation: false,
    actions: [],
    ...details,
  };
}
