/**
 * Deterministic non-main component integration transaction for #2677-003 / #2772.
 *
 * Emits at most one integrate instruction per controller run. The module never
 * treats automated eligibility as human approval and never authorizes main,
 * Production, closeout, or successor activation.
 */

import {
  buildIntegrationIdentity,
  commentContainsIdentity,
  identityMarker,
} from './idempotency.mjs';
import { DISPOSITION_CLASSES } from './disposition.mjs';

export const FORBIDDEN_TARGET_REFS = Object.freeze([
  'main',
  'master',
  'production',
  'prod',
]);

export const DETERMINISTIC_APPROVAL_PROFILES = Object.freeze([
  'component-auto-integration',
]);

export const INDEPENDENT_REVIEW_APPROVAL_PROFILES = Object.freeze([
  'protected-change-review',
]);

/**
 * Evaluate whether an observe packet may emit one component-integration instruction.
 */
export function evaluateComponentIntegrationTransaction({
  packet,
  classification = null,
  existingComments = [],
  reviewSubmissions = null,
  requiredChecks = [],
  componentIntegration = {},
  observedTargetBranch = null,
  recordedMergeSha = null,
} = {}) {
  if (componentIntegration?.enabled !== true) {
    return {
      ok: true,
      eligible: false,
      suppressed: true,
      code: 'component_integration_disabled',
      actions: [],
    };
  }

  if (classification && classification !== DISPOSITION_CLASSES.CLEAN) {
    return failClosed(
      'integration_requires_clean_disposition',
      'Component integration requires a clean current-head disposition.',
      { classification },
    );
  }

  const sourceIssueNumber = Number(packet?.sourceIssue?.number);
  const prNumber = Number(packet?.pullRequest?.number);
  const headSha = normalizeSha(packet?.pullRequest?.headSha);
  if (!Number.isInteger(sourceIssueNumber) || sourceIssueNumber <= 0) {
    return failClosed('missing_source_issue', 'Source Issue identity is required.');
  }
  if (!Number.isInteger(prNumber) || prNumber <= 0) {
    return failClosed('missing_pr_number', 'Pull request number is required.');
  }
  if (!headSha) {
    return failClosed('missing_current_head', 'Current PR head SHA is required.');
  }

  const profile = packet?.pullRequest?.deliveryProfile || {};
  const baseRef = String(packet?.pullRequest?.baseRef || '').trim();
  const declaredTarget = String(profile.componentBranch || baseRef || '').trim();
  const targetBranch = String(observedTargetBranch || declaredTarget || '').trim();

  const targetCheck = assertAuthorizedComponentTarget({
    targetBranch,
    declaredTarget,
    baseRef,
    profile,
    allowedTargetPrefixes: componentIntegration.allowedTargetPrefixes || ['component/'],
  });
  if (!targetCheck.ok) return targetCheck;

  const deliveryCheck = assertDeliveryProfileForIntegration(profile);
  if (!deliveryCheck.ok) return deliveryCheck;

  const authority = resolveIntegrationAuthority({
    profile,
    packet,
    reviewSubmissions:
      reviewSubmissions ||
      packet?.reviewEvidence?.reviewSubmissions ||
      [],
    existingComments,
    deterministicProfiles:
      componentIntegration.deterministicApprovalProfiles || DETERMINISTIC_APPROVAL_PROFILES,
    independentReviewProfiles:
      componentIntegration.independentReviewApprovalProfiles ||
      INDEPENDENT_REVIEW_APPROVAL_PROFILES,
  });
  if (!authority.ok) return authority;

  const checkBlock = assessRequiredChecks(packet, requiredChecks);
  if (!checkBlock.ok) return checkBlock;

  const threadBlock = assessBlockingThreads(packet);
  if (!threadBlock.ok) return threadBlock;

  const mergeSha = normalizeSha(recordedMergeSha);
  const integrationDisposition = 'clean';
  const integrationIdentity = buildIntegrationIdentity({
    sourceIssueNumber,
    prNumber,
    headSha,
    targetBranch,
    integrationDisposition,
    mergeSha: mergeSha || 'pending',
  });

  if (commentContainsIdentity(existingComments, 'integration', integrationIdentity)) {
    return {
      ok: true,
      eligible: false,
      suppressed: true,
      code: 'integration_already_recorded',
      integrationIdentity,
      targetBranch,
      headSha,
      mergeSha: mergeSha || null,
      authority,
      actions: [],
    };
  }

  // A completed integration for this exact head/target suppresses a second pending emit.
  const completedIdentity = mergeSha
    ? null
    : findCompletedIntegrationIdentity(existingComments, {
        sourceIssueNumber,
        prNumber,
        headSha,
        targetBranch,
        integrationDisposition,
      });
  if (completedIdentity) {
    return {
      ok: true,
      eligible: false,
      suppressed: true,
      code: 'integration_already_completed',
      integrationIdentity: completedIdentity,
      targetBranch,
      headSha,
      mergeSha: extractMergeShaFromIdentity(completedIdentity),
      authority,
      actions: [],
    };
  }

  if (componentIntegration.maxIntegrationsPerRun != null) {
    const max = Number(componentIntegration.maxIntegrationsPerRun);
    if (!Number.isInteger(max) || max < 1) {
      return failClosed(
        'invalid_max_integrations_per_run',
        'maxIntegrationsPerRun must be a positive integer.',
      );
    }
  }

  const action = {
    type: 'integrate_component_pr',
    issueNumber: sourceIssueNumber,
    prNumber,
    headSha,
    targetBranch,
    mergeMethod: componentIntegration.mergeMethod || 'squash',
    identity: integrationIdentity,
    authority: {
      kind: authority.kind,
      approvalProfile: authority.approvalProfile,
      reviewId: authority.reviewId || null,
      decisionUrl: authority.decisionUrl || null,
    },
    body: integrationInstructionBody({
      sourceIssueNumber,
      prNumber,
      headSha,
      targetBranch,
      integrationIdentity,
      authority,
    }),
  };

  return {
    ok: true,
    eligible: true,
    suppressed: false,
    code: 'integration_authorized',
    integrationIdentity,
    targetBranch,
    headSha,
    mergeSha: null,
    authority,
    actions: [action],
  };
}

export function assertAuthorizedComponentTarget({
  targetBranch,
  declaredTarget = null,
  baseRef = null,
  profile = {},
  allowedTargetPrefixes = ['component/'],
} = {}) {
  const target = String(targetBranch || '').trim();
  if (!target) {
    return failClosed('missing_target_branch', 'An explicit component target branch is required.');
  }

  const normalized = target.toLowerCase();
  if (FORBIDDEN_TARGET_REFS.includes(normalized) || normalized === 'refs/heads/main') {
    return failClosed(
      'forbidden_target_main_or_production',
      'Integration to main, master, or Production refs is forbidden.',
      { targetBranch: target },
    );
  }

  if (
    String(profile.targetEnvironment || '').toLowerCase() === 'production' ||
    String(profile.targetEnvironment || '').toLowerCase() === 'prod'
  ) {
    return failClosed(
      'forbidden_production_target_environment',
      'Production target environment cannot receive component integration.',
      { targetEnvironment: profile.targetEnvironment },
    );
  }

  const allowed = (allowedTargetPrefixes || []).some((prefix) => target.startsWith(prefix));
  if (!allowed) {
    return failClosed(
      'unauthorized_target_prefix',
      'Target branch is outside the authorized component/ prefix set.',
      { targetBranch: target, allowedTargetPrefixes },
    );
  }

  if (baseRef && baseRef !== target) {
    return failClosed(
      'target_base_drift',
      'Observed target branch drifted from the PR base ref.',
      { targetBranch: target, baseRef },
    );
  }

  if (declaredTarget && declaredTarget !== target) {
    return failClosed(
      'target_metadata_drift',
      'Observed target branch drifted from declared component branch metadata.',
      { targetBranch: target, declaredTarget },
    );
  }

  if (profile.componentBranch && profile.componentBranch !== target) {
    return failClosed(
      'component_branch_mismatch',
      'Delivery-profile component branch must match the integration target.',
      { targetBranch: target, componentBranch: profile.componentBranch },
    );
  }

  return { ok: true, targetBranch: target };
}

function assertDeliveryProfileForIntegration(profile = {}) {
  if (profile.deliveryModel !== 'B-child') {
    return failClosed(
      'invalid_delivery_model',
      'Component integration requires Delivery model B-child.',
      { deliveryModel: profile.deliveryModel || null },
    );
  }
  if (profile.gateProfile !== 'component-child') {
    return failClosed(
      'invalid_gate_profile',
      'Component integration requires gate profile component-child.',
      { gateProfile: profile.gateProfile || null },
    );
  }
  if (profile.targetEnvironment && profile.targetEnvironment !== 'component') {
    return failClosed(
      'invalid_target_environment',
      'Component integration requires target environment component.',
      { targetEnvironment: profile.targetEnvironment },
    );
  }
  if (!profile.componentMaster) {
    return failClosed(
      'missing_component_master',
      'Component master Issue reference is required.',
    );
  }
  return { ok: true };
}

function resolveIntegrationAuthority({
  profile,
  packet,
  reviewSubmissions = [],
  existingComments = [],
  deterministicProfiles = DETERMINISTIC_APPROVAL_PROFILES,
  independentReviewProfiles = INDEPENDENT_REVIEW_APPROVAL_PROFILES,
} = {}) {
  const approvalProfile = String(profile.approvalProfile || '').trim();
  if (!approvalProfile) {
    return failClosed(
      'missing_approval_profile',
      'Approval profile is required before component integration.',
    );
  }

  if (deterministicProfiles.includes(approvalProfile)) {
    // Deterministic profile path authorized by repository delivery policy.
    // This is not human approval and must not be described as such.
    return {
      ok: true,
      kind: 'deterministic_profile',
      approvalProfile,
      humanApproval: false,
    };
  }

  if (independentReviewProfiles.includes(approvalProfile)) {
    const headSha = normalizeSha(packet?.pullRequest?.headSha);
    const approvedReview = (reviewSubmissions || []).find((review) => {
      const state = String(review.state || '').toUpperCase();
      if (state !== 'APPROVED') return false;
      const commitId = normalizeSha(review.commit_id || review.commitId || review.headSha);
      return !commitId || commitId === headSha;
    });
    if (approvedReview) {
      return {
        ok: true,
        kind: 'independent_review',
        approvalProfile,
        humanApproval: true,
        reviewId: String(approvedReview.id || approvedReview.databaseId || ''),
      };
    }

    const decision = findIntegrationAuthorizationComment(existingComments, {
      sourceIssueNumber: packet?.sourceIssue?.number,
      prNumber: packet?.pullRequest?.number,
      headSha,
    });
    if (decision) {
      return {
        ok: true,
        kind: 'source_issue_authorization',
        approvalProfile,
        humanApproval: true,
        decisionUrl: decision.url || decision.html_url || null,
      };
    }

    return failClosed(
      'missing_independent_review',
      'Protected approval profile requires recorded independent review or source-Issue integration authorization.',
      { approvalProfile },
    );
  }

  return failClosed(
    'unsupported_approval_profile',
    'Approval profile is not authorized for deterministic component integration.',
    { approvalProfile },
  );
}

function assessRequiredChecks(packet, requiredChecks = []) {
  const names = [...new Set((requiredChecks || []).map(String).filter(Boolean))];
  if (names.length === 0) {
    // When callers do not declare named required checks, still reject explicit failures.
    const failed = (packet?.checks || []).filter((check) => {
      const conclusion = String(check.conclusion || '').toLowerCase();
      return ['failure', 'cancelled', 'timed_out', 'action_required'].includes(conclusion);
    });
    if (failed.length > 0) {
      return failClosed(
        'failed_required_check',
        'At least one current-head check failed.',
        { checks: failed.map((check) => check.name || check.context || 'unknown') },
      );
    }
    return { ok: true };
  }

  const headSha = normalizeSha(packet?.pullRequest?.headSha);
  for (const name of names) {
    const matches = (packet?.checks || []).filter(
      (check) => String(check.name || check.context || '') === name,
    );
    if (matches.length === 0) {
      return failClosed('missing_required_check', `Required check "${name}" is missing.`);
    }
    for (const check of matches) {
      const checkHead = normalizeSha(check.headSha || check.head_sha);
      if (checkHead && checkHead !== headSha) {
        return failClosed(
          'stale_required_check_head',
          `Required check "${name}" does not target the current head.`,
        );
      }
      const status = String(check.status || '').toLowerCase();
      const conclusion = String(check.conclusion || '').toLowerCase();
      if (!(status === 'completed' && conclusion === 'success')) {
        return failClosed(
          'failed_required_check',
          `Required check "${name}" is not terminal-success.`,
          { status, conclusion },
        );
      }
    }
  }
  return { ok: true };
}

function assessBlockingThreads(packet) {
  const unresolved = packet?.reviewEvidence?.unresolvedReviewThreads || [];
  const blocking = unresolved.filter(
    (thread) => thread?.isResolved !== true && thread?.dispositioned !== true,
  );
  if (blocking.length > 0) {
    return failClosed(
      'unresolved_blocking_thread',
      'Unresolved blocking review threads prevent component integration.',
      { threadIds: blocking.map((thread) => thread.id || thread.databaseId || null) },
    );
  }

  const changesRequested = (packet?.reviewEvidence?.reviewSubmissions || []).filter(
    (review) => String(review.state || '').toUpperCase() === 'CHANGES_REQUESTED',
  );
  if (changesRequested.length > 0) {
    return failClosed(
      'changes_requested',
      'A current-head CHANGES_REQUESTED review blocks component integration.',
    );
  }

  return { ok: true };
}

function findIntegrationAuthorizationComment(comments = [], { sourceIssueNumber, prNumber, headSha }) {
  const issue = Number(sourceIssueNumber);
  const pr = Number(prNumber);
  const head = normalizeSha(headSha);
  for (const comment of comments || []) {
    const body = String(comment?.body || comment?.bodyText || '');
    const authorized =
      /^APPROVED FOR INTEGRATION\b/im.test(body) ||
      /Status:\s*component integration authorized\b/i.test(body) ||
      /Disposition:\s*APPROVED FOR INTEGRATION\b/i.test(body);
    if (!authorized) continue;
    const statedPr = extractPrNumber(extractField(body, 'PR'));
    const statedHead = normalizeSha(extractField(body, 'Head SHA'));
    const statedIssue = extractIssueNumber(
      extractField(body, 'Issue') || extractField(body, 'Subject'),
    );
    if (statedPr != null && statedPr !== pr) continue;
    if (statedHead && statedHead !== head) continue;
    if (statedIssue != null && statedIssue !== issue) continue;
    return {
      ...comment,
      url:
        comment.html_url ||
        comment.url ||
        `https://github.com/wdhunter645/next-starter-template/issues/${issue}#issuecomment-${comment.id || ''}`,
    };
  }
  return null;
}

function findCompletedIntegrationIdentity(
  comments = [],
  { sourceIssueNumber, prNumber, headSha, targetBranch, integrationDisposition },
) {
  const prefix = `issue:${Number(sourceIssueNumber)}:pr:${Number(prNumber)}:head:${normalizeSha(headSha)}:target:${targetBranch}:disposition:${integrationDisposition}:merge:`;
  for (const comment of comments || []) {
    const body = String(comment?.body || comment?.bodyText || '');
    const match = body.match(
      new RegExp(
        `<!-- agent-routing-integration:(${escapeRegExp(prefix)}[0-9a-f]{7,40}) -->`,
        'i',
      ),
    );
    if (match) return match[1];
  }
  return null;
}

function extractMergeShaFromIdentity(identity) {
  const match = String(identity || '').match(/:merge:([0-9a-f]{7,40}|pending)$/i);
  if (!match || match[1] === 'pending') return null;
  return normalizeSha(match[1]);
}

function integrationInstructionBody({
  sourceIssueNumber,
  prNumber,
  headSha,
  targetBranch,
  integrationIdentity,
  authority,
}) {
  return `COMPONENT INTEGRATION
Issue: #${sourceIssueNumber}
PR: #${prNumber}
Head SHA: ${headSha}
Target branch: ${targetBranch}
Integration disposition: clean
Authority kind: ${authority.kind}
Approval profile: ${authority.approvalProfile}
Human approval claimed: ${authority.humanApproval === true ? 'yes' : 'no'}
Mutation boundary:
- Integrate only this PR head into the authorized component branch.
- Do not close the source Issue.
- Do not activate a successor.
- Do not mutate main or Production.
${identityMarker('integration', integrationIdentity)}`;
}

function extractField(body, label) {
  const escaped = String(label).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = String(body || '').match(new RegExp(`^\\s*${escaped}\\s*:\\s*(.+?)\\s*$`, 'im'));
  return match?.[1]?.trim() || null;
}

function extractIssueNumber(value) {
  if (value == null) return null;
  const match = String(value).match(/#?(\d+)/);
  return match ? Number(match[1]) : null;
}

function extractPrNumber(value) {
  if (value == null) return null;
  const match = String(value).match(/#?(\d+)/);
  return match ? Number(match[1]) : null;
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function normalizeSha(value) {
  const sha = String(value || '').trim().toLowerCase();
  return /^[0-9a-f]{7,40}$/.test(sha) ? sha : '';
}

function failClosed(code, message, details = {}) {
  return {
    ok: false,
    eligible: false,
    suppressed: false,
    code,
    message,
    actions: [],
    ...details,
  };
}
