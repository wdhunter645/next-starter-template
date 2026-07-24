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
import {
  extractDeliveryProfile,
  extractPrimarySourceIssueRefs,
} from './evidence-collector.mjs';

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
    trustedReviewAuthors: componentIntegration.trustedReviewAuthors || [],
    trustedIntegrationAuthorizationAuthors:
      componentIntegration.trustedIntegrationAuthorizationAuthors || [],
    targetBranch,
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

/**
 * Execute one bounded GitHub-native component merge.
 *
 * The operation performs two complete state collections. The second collection
 * occurs immediately before the sole merge call and must match the first and
 * all operator-supplied expected identities.
 */
export async function executeComponentIntegration({
  repository,
  token,
  issueNumber,
  prNumber,
  expectedHeadSha,
  targetBranch,
  expectedTargetHeadSha,
  componentIntegration = {},
  fetchFn = globalThis.fetch,
  collectState = null,
  mergePullRequest = null,
  verifyTargetContainsSha = null,
  rereadSourceIssue = null,
} = {}) {
  if (componentIntegration?.enabled !== true) {
    return {
      ok: true,
      integrated: false,
      suppressed: true,
      code: 'component_integration_disabled',
      mutations: 0,
    };
  }

  const expected = assertExecutionInputs({
    repository,
    issueNumber,
    prNumber,
    expectedHeadSha,
    targetBranch,
    expectedTargetHeadSha,
    componentIntegration,
  });
  if (!expected.ok) return expected;

  const collector =
    collectState ||
    ((args) =>
      collectGitHubIntegrationState({
        ...args,
        token,
        fetchFn,
      }));
  const merger =
    mergePullRequest ||
    ((args) =>
      mergeGitHubPullRequest({
        ...args,
        token,
        fetchFn,
      }));
  const verifier =
    verifyTargetContainsSha ||
    ((args) =>
      verifyGitHubTargetContainsSha({
        ...args,
        token,
        fetchFn,
      }));
  const sourceIssueReader =
    rereadSourceIssue ||
    ((args) =>
      rereadGitHubSourceIssue({
        ...args,
        token,
        fetchFn,
      }));

  const collectArgs = {
    repository,
    issueNumber: expected.issueNumber,
    prNumber: expected.prNumber,
    targetBranch: expected.targetBranch,
  };
  const initial = await collector(collectArgs);
  if (!initial?.ok) return normalizeExecutionFailure(initial, 'initial_integration_reread_failed');

  const initialEvaluation = evaluateExecutionState(initial.state, expected, componentIntegration);
  if (!initialEvaluation.ok) return initialEvaluation;
  if (initialEvaluation.alreadyMerged) {
    return verifyEquivalentPriorIntegration({
      state: initial.state,
      expected,
      verifier,
      repository,
    });
  }

  const final = await collector(collectArgs);
  if (!final?.ok) return normalizeExecutionFailure(final, 'final_integration_reread_failed');
  const finalEvaluation = evaluateExecutionState(final.state, expected, componentIntegration);
  if (!finalEvaluation.ok) return finalEvaluation;
  if (finalEvaluation.alreadyMerged) {
    return verifyEquivalentPriorIntegration({
      state: final.state,
      expected,
      verifier,
      repository,
    });
  }

  if (integrationStateFingerprint(initial.state) !== integrationStateFingerprint(final.state)) {
    return executionFailure(
      'integration_expected_state_drift',
      'GitHub-native integration state changed before the merge mutation.',
    );
  }

  const merged = await merger({
    repository,
    prNumber: expected.prNumber,
    expectedHeadSha: expected.headSha,
    mergeMethod: componentIntegration.mergeMethod || 'squash',
  });
  if (!merged?.ok || merged.merged !== true) {
    return normalizeExecutionFailure(merged, 'component_merge_failed');
  }
  const mergeSha = normalizeSha(merged.mergeSha || merged.sha);
  if (!mergeSha) {
    return executionFailure('missing_merge_sha', 'GitHub merge response omitted the merge SHA.', {
      mutations: 1,
    });
  }

  const verified = await verifier({
    repository,
    targetBranch: expected.targetBranch,
    mergeSha,
  });
  if (!verified?.ok || verified.contains !== true) {
    return executionFailure(
      'merge_sha_not_on_target',
      'The authorized target does not contain the exact merge SHA.',
      { mergeSha, mutations: 1 },
    );
  }

  const sourceIssueAfterMerge = await sourceIssueReader({
    repository,
    issueNumber: expected.issueNumber,
  });
  if (!sourceIssueAfterMerge?.ok) {
    return normalizeExecutionFailure(
      { ...(sourceIssueAfterMerge || {}), mutations: 1 },
      'post_merge_source_issue_reread_failed',
    );
  }
  if (String(sourceIssueAfterMerge.state || '').toUpperCase() !== 'OPEN') {
    return executionFailure(
      sourceIssueAfterMerge.state ? 'post_merge_source_issue_not_open' : 'post_merge_source_issue_unavailable',
      'Source Issue must be explicitly OPEN after the merge mutation.',
      { sourceIssueState: sourceIssueAfterMerge.state || null, mutations: 1 },
    );
  }

  const integrationIdentity = buildIntegrationIdentity({
    sourceIssueNumber: expected.issueNumber,
    prNumber: expected.prNumber,
    headSha: expected.headSha,
    targetBranch: expected.targetBranch,
    integrationDisposition: 'clean',
    mergeSha,
  });
  return {
    ok: true,
    integrated: true,
    suppressed: false,
    code: 'component_integration_verified',
    sourceIssueNumber: expected.issueNumber,
    prNumber: expected.prNumber,
    headSha: expected.headSha,
    targetBranch: expected.targetBranch,
    priorTargetHeadSha: expected.targetHeadSha,
    mergeSha,
    integrationIdentity,
    mutations: 1,
    sourceIssueState: 'OPEN',
    closeout: false,
    successorActivation: false,
  };
}

export async function collectGitHubIntegrationState({
  repository,
  issueNumber,
  prNumber,
  targetBranch,
  token,
  fetchFn = globalThis.fetch,
} = {}) {
  if (!token) return executionFailure('live_evidence_unavailable', 'GITHUB_TOKEN is required.');
  const headers = githubHeaders(token);
  const get = async (apiPath) => {
    const response = await fetchFn(`https://api.github.com/repos/${repository}${apiPath}`, {
      method: 'GET',
      headers,
    });
    if (!response.ok) {
      throw new Error(`GET ${apiPath} failed: ${response.status} ${await response.text()}`);
    }
    return response.json();
  };
  const getAll = async (apiPath) => {
    const items = [];
    for (let page = 1; ; page += 1) {
      const separator = apiPath.includes('?') ? '&' : '?';
      const batch = await get(`${apiPath}${separator}per_page=100&page=${page}`);
      if (!Array.isArray(batch)) throw new Error(`GET ${apiPath} did not return an array`);
      items.push(...batch);
      if (batch.length < 100) return items;
    }
  };

  try {
    const [issue, pr, targetRef] = await Promise.all([
      get(`/issues/${Number(issueNumber)}`),
      get(`/pulls/${Number(prNumber)}`),
      get(`/git/ref/heads/${encodeURIComponent(String(targetBranch))}`),
    ]);
    if (issue?.pull_request) {
      return executionFailure(
        'source_issue_is_pull_request',
        'Source Issue identity resolved to a pull request, not an Issue.',
      );
    }
    const headSha = normalizeSha(pr?.head?.sha);
    if (!headSha) return executionFailure('missing_current_head', 'PR head SHA is unavailable.');
    const [checksPayload, reviews, comments, threads] = await Promise.all([
      collectGitHubCheckRuns({
        repository,
        headSha,
        token,
        fetchFn,
      }),
      getAll(`/pulls/${Number(prNumber)}/reviews`),
      getAll(`/issues/${Number(issueNumber)}/comments`),
      collectGitHubReviewThreads({
        repository,
        prNumber,
        token,
        fetchFn,
      }),
    ]);
    return {
      ok: true,
      state: {
        sourceIssue: {
          number: issue?.number,
          state: String(issue?.state || '').toUpperCase(),
          body: issue?.body || '',
        },
        pullRequest: {
          number: pr?.number,
          state: String(pr?.state || '').toUpperCase(),
          merged: pr?.merged === true,
          mergeSha: normalizeSha(pr?.merge_commit_sha),
          body: pr?.body || '',
          headSha,
          baseRef: pr?.base?.ref || '',
          author: String(pr?.user?.login || '').toLowerCase(),
        },
        targetBranch: String(targetBranch),
        targetHeadSha: normalizeSha(targetRef?.object?.sha),
        checks: (checksPayload || []).map((check) => ({
          name: check.name || '',
          status: check.status || null,
          conclusion: check.conclusion || null,
          headSha: normalizeSha(check.head_sha),
        })),
        reviews: (reviews || []).map((review) => ({
          id: String(review.id || ''),
          state: review.state || null,
          commitId: normalizeSha(review.commit_id),
          author: { login: review.user?.login || null },
        })),
        comments: (comments || []).map((comment) => ({
          id: String(comment.id || ''),
          body: comment.body || '',
          author: { login: comment.user?.login || null },
          html_url: comment.html_url || null,
        })),
        reviewThreads: threads,
      },
    };
  } catch (error) {
    return executionFailure(
      'live_evidence_unavailable',
      `GitHub-native integration collection failed: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
  }
}

async function mergeGitHubPullRequest({
  repository,
  prNumber,
  expectedHeadSha,
  mergeMethod,
  token,
  fetchFn,
}) {
  const response = await fetchFn(
    `https://api.github.com/repos/${repository}/pulls/${Number(prNumber)}/merge`,
    {
      method: 'PUT',
      headers: githubHeaders(token),
      body: JSON.stringify({
        sha: expectedHeadSha,
        merge_method: mergeMethod,
      }),
    },
  );
  const payload = await response.json();
  return response.ok && payload.merged === true
    ? { ok: true, merged: true, mergeSha: payload.sha }
    : executionFailure(
        'component_merge_failed',
        `GitHub refused component merge: ${response.status} ${payload.message || ''}`.trim(),
      );
}

async function verifyGitHubTargetContainsSha({
  repository,
  targetBranch,
  mergeSha,
  token,
  fetchFn,
}) {
  const response = await fetchFn(
    `https://api.github.com/repos/${repository}/compare/${mergeSha}...${encodeURIComponent(
      targetBranch,
    )}`,
    { method: 'GET', headers: githubHeaders(token) },
  );
  if (!response.ok) {
    return executionFailure(
      'target_verification_failed',
      `GitHub compare failed: ${response.status} ${await response.text()}`,
    );
  }
  const payload = await response.json();
  return {
    ok: true,
    contains: ['ahead', 'identical'].includes(String(payload.status || '').toLowerCase()),
  };
}

async function rereadGitHubSourceIssue({
  repository,
  issueNumber,
  token,
  fetchFn,
}) {
  const response = await fetchFn(
    `https://api.github.com/repos/${repository}/issues/${Number(issueNumber)}`,
    { method: 'GET', headers: githubHeaders(token) },
  );
  if (!response.ok) {
    return executionFailure(
      'post_merge_source_issue_unavailable',
      `GitHub source-Issue reread failed: ${response.status} ${await response.text()}`,
    );
  }
  const payload = await response.json();
  if (payload?.pull_request) {
    return executionFailure(
      'post_merge_source_issue_is_pull_request',
      'Post-merge source-Issue reread resolved to a pull request, not an Issue.',
    );
  }
  return {
    ok: true,
    state: String(payload?.state || '').toUpperCase(),
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
  trustedReviewAuthors = [],
  trustedIntegrationAuthorizationAuthors = [],
  targetBranch = null,
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
    const trustedReviewers = normalizeAuthorSet(trustedReviewAuthors);
    if (trustedReviewers.size === 0) {
      return failClosed(
        'missing_trusted_reviewer_allowlist',
        'Protected approval profile requires a configured trusted reviewer allowlist.',
      );
    }
    const approvedReview = (reviewSubmissions || []).find((review) => {
      const state = String(review.state || '').toUpperCase();
      if (state !== 'APPROVED') return false;
      const commitId = normalizeSha(review.commit_id || review.commitId || review.headSha);
      if (!commitId || commitId !== headSha) return false;
      const reviewer = reviewAuthor(review);
      const prAuthor = String(packet?.pullRequest?.author || '').trim().toLowerCase();
      if (!reviewer || !prAuthor) return false;
      if (!trustedReviewers.has(reviewer)) return false;
      return reviewer !== prAuthor;
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
      targetBranch,
      trustedAuthors: trustedIntegrationAuthorizationAuthors,
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
      if (!checkHead) {
        return failClosed(
          'missing_required_check_head',
          `Required check "${name}" does not identify a commit.`,
        );
      }
      if (checkHead !== headSha) {
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

function findIntegrationAuthorizationComment(
  comments = [],
  { sourceIssueNumber, prNumber, headSha, targetBranch, trustedAuthors = [] },
) {
  const issue = Number(sourceIssueNumber);
  const pr = Number(prNumber);
  const head = normalizeSha(headSha);
  const target = String(targetBranch || '').trim();
  const trusted = normalizeAuthorSet(trustedAuthors);
  if (trusted.size === 0 || !target) return null;
  for (const comment of comments || []) {
    const author = commentAuthor(comment);
    if (!author || !trusted.has(author)) continue;
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
    const statedTarget = extractField(body, 'Target branch') || extractField(body, 'Target');
    if (statedPr == null || statedPr !== pr) continue;
    if (!statedHead || statedHead !== head) continue;
    if (statedIssue == null || statedIssue !== issue) continue;
    if (!statedTarget || statedTarget !== target) continue;
    return {
      ...comment,
      author: comment.author || comment.user || { login: author },
      authorLogin: author,
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

function assertExecutionInputs({
  repository,
  issueNumber,
  prNumber,
  expectedHeadSha,
  targetBranch,
  expectedTargetHeadSha,
  componentIntegration,
}) {
  if (!repository || !String(repository).includes('/')) {
    return executionFailure('missing_repository', 'Exact owner/repository identity is required.');
  }
  const issue = Number(issueNumber);
  const pr = Number(prNumber);
  const headSha = normalizeSha(expectedHeadSha);
  const targetHeadSha = normalizeSha(expectedTargetHeadSha);
  if (!Number.isInteger(issue) || issue <= 0) {
    return executionFailure('missing_source_issue', 'Exact source Issue number is required.');
  }
  if (!Number.isInteger(pr) || pr <= 0) {
    return executionFailure('missing_pr_number', 'Exact PR number is required.');
  }
  if (!headSha) {
    return executionFailure('missing_expected_head_sha', 'Exact expected PR head SHA is required.');
  }
  if (!targetHeadSha) {
    return executionFailure(
      'missing_expected_target_head_sha',
      'Exact expected target-head SHA is required.',
    );
  }
  const targetCheck = assertAuthorizedComponentTarget({
    targetBranch,
    declaredTarget: targetBranch,
    baseRef: targetBranch,
    profile: { targetEnvironment: 'component', componentBranch: targetBranch },
    allowedTargetPrefixes: componentIntegration.allowedTargetPrefixes || ['component/'],
  });
  if (!targetCheck.ok) return { ...targetCheck, integrated: false, mutations: 0 };
  return {
    ok: true,
    issueNumber: issue,
    prNumber: pr,
    headSha,
    targetBranch: targetCheck.targetBranch,
    targetHeadSha,
  };
}

function evaluateExecutionState(state, expected, componentIntegration) {
  if (String(state?.sourceIssue?.state || '').toUpperCase() !== 'OPEN') {
    return executionFailure(
      'source_issue_not_open',
      'Source Issue must be explicitly OPEN immediately before integration.',
    );
  }
  if (Number(state?.sourceIssue?.number) !== expected.issueNumber) {
    return executionFailure('source_issue_mismatch', 'Live source Issue identity changed.');
  }
  if (Number(state?.pullRequest?.number) !== expected.prNumber) {
    return executionFailure('pull_request_mismatch', 'Live PR identity changed.');
  }
  const refs = extractPrimarySourceIssueRefs(state?.pullRequest?.body || '');
  if (refs.length !== 1 || refs[0] !== expected.issueNumber) {
    return executionFailure(
      'source_issue_pr_mismatch',
      'PR body must declare exactly the authorized source Issue.',
    );
  }
  const liveHead = normalizeSha(state?.pullRequest?.headSha);
  if (liveHead !== expected.headSha) {
    return executionFailure('expected_head_drift', 'Live PR head differs from expected head.');
  }
  const liveTarget = String(state?.pullRequest?.baseRef || '');
  if (liveTarget !== expected.targetBranch || String(state?.targetBranch || '') !== expected.targetBranch) {
    return executionFailure('target_base_drift', 'Live PR target differs from authorized target.');
  }

  const merged = state?.pullRequest?.merged === true;
  if (!merged && String(state?.pullRequest?.state || '').toUpperCase() !== 'OPEN') {
    return executionFailure('pull_request_not_open', 'PR must be OPEN before integration.');
  }
  if (merged) {
    const mergeSha = normalizeSha(state?.pullRequest?.mergeSha);
    if (!mergeSha) {
      return executionFailure('missing_merge_sha', 'Merged PR omitted its merge SHA.');
    }
    return { ok: true, alreadyMerged: true, mergeSha };
  }

  if (normalizeSha(state?.targetHeadSha) !== expected.targetHeadSha) {
    return executionFailure(
      'expected_target_head_drift',
      'Target branch head changed before integration.',
    );
  }

  const profile = extractDeliveryProfile(state?.pullRequest?.body || '');
  const packet = {
    sourceIssue: state.sourceIssue,
    pullRequest: {
      number: expected.prNumber,
      headSha: liveHead,
      baseRef: liveTarget,
      author: state.pullRequest.author || null,
      deliveryProfile: profile,
    },
    checks: state.checks || [],
    reviewEvidence: {
      unresolvedReviewThreads: state.reviewThreads || [],
      reviewSubmissions: state.reviews || [],
    },
  };
  const eligibility = evaluateComponentIntegrationTransaction({
    packet,
    classification: DISPOSITION_CLASSES.CLEAN,
    existingComments: state.comments || [],
    reviewSubmissions: state.reviews || [],
    requiredChecks: componentIntegration.requiredChecks || [],
    componentIntegration,
    observedTargetBranch: expected.targetBranch,
  });
  if (!eligibility.ok || eligibility.eligible !== true) {
    return executionFailure(
      eligibility.code || 'component_integration_not_eligible',
      eligibility.message || 'Live state is not eligible for integration.',
      { eligibility },
    );
  }
  return { ok: true, alreadyMerged: false, eligibility };
}

async function verifyEquivalentPriorIntegration({
  state,
  expected,
  verifier,
  repository,
}) {
  const mergeSha = normalizeSha(state?.pullRequest?.mergeSha);
  const verified = await verifier({
    repository,
    targetBranch: expected.targetBranch,
    mergeSha,
  });
  if (!verified?.ok || verified.contains !== true) {
    return executionFailure(
      'prior_merge_sha_not_on_target',
      'Equivalent merged PR could not be verified on the authorized target.',
      { mergeSha },
    );
  }
  return {
    ok: true,
    integrated: false,
    suppressed: true,
    code: 'equivalent_integration_already_completed',
    mergeSha,
    targetBranch: expected.targetBranch,
    headSha: expected.headSha,
    mutations: 0,
    sourceIssueState: 'OPEN',
    closeout: false,
    successorActivation: false,
  };
}

function integrationStateFingerprint(state) {
  const normalize = {
    issue: {
      number: Number(state?.sourceIssue?.number),
      state: String(state?.sourceIssue?.state || '').toUpperCase(),
      body: String(state?.sourceIssue?.body || ''),
    },
    pr: {
      number: Number(state?.pullRequest?.number),
      state: String(state?.pullRequest?.state || '').toUpperCase(),
      merged: state?.pullRequest?.merged === true,
      mergeSha: normalizeSha(state?.pullRequest?.mergeSha),
      body: String(state?.pullRequest?.body || ''),
      headSha: normalizeSha(state?.pullRequest?.headSha),
      baseRef: String(state?.pullRequest?.baseRef || ''),
      author: String(state?.pullRequest?.author || '').toLowerCase(),
    },
    targetBranch: String(state?.targetBranch || ''),
    targetHeadSha: normalizeSha(state?.targetHeadSha),
    checks: [...(state?.checks || [])]
      .map((check) => ({
        name: String(check.name || ''),
        status: String(check.status || ''),
        conclusion: String(check.conclusion || ''),
        headSha: normalizeSha(check.headSha || check.head_sha),
      }))
      .sort((a, b) => a.name.localeCompare(b.name)),
    reviews: [...(state?.reviews || [])]
      .map((review) => ({
        id: String(review.id || ''),
        state: String(review.state || ''),
        commitId: normalizeSha(review.commitId || review.commit_id),
        author: reviewAuthor(review),
      }))
      .sort((a, b) => a.id.localeCompare(b.id)),
    threads: [...(state?.reviewThreads || [])]
      .map((thread) => ({
        id: String(thread.id || ''),
        isResolved: thread.isResolved === true,
        isOutdated: thread.isOutdated === true,
      }))
      .sort((a, b) => a.id.localeCompare(b.id)),
    comments: [...(state?.comments || [])]
      .map((comment) => ({
        id: String(comment.id || ''),
        author: commentAuthor(comment),
        body: String(comment.body || comment.bodyText || ''),
      }))
      .sort((a, b) => a.id.localeCompare(b.id)),
  };
  return JSON.stringify(normalize);
}

async function collectGitHubReviewThreads({ repository, prNumber, token, fetchFn }) {
  const [owner, repo] = String(repository).split('/');
  const query = `query($owner:String!,$repo:String!,$number:Int!,$cursor:String){
    repository(owner:$owner,name:$repo){
      pullRequest(number:$number){
        reviewThreads(first:100,after:$cursor){
          pageInfo{hasNextPage endCursor}
          nodes{id isResolved isOutdated}
        }
      }
    }
  }`;
  const threads = [];
  let cursor = null;
  let pageCount = 0;
  const maxPages = 20;
  do {
    pageCount += 1;
    if (pageCount > maxPages) {
      throw new Error('GraphQL review threads exceeded the safe pagination limit');
    }
    const response = await fetchFn('https://api.github.com/graphql', {
      method: 'POST',
      headers: githubHeaders(token),
      body: JSON.stringify({
        query,
        variables: { owner, repo, number: Number(prNumber), cursor },
      }),
    });
    if (!response.ok) throw new Error(`GraphQL review threads failed: ${response.status}`);
    const payload = await response.json();
    if (payload.errors?.length) {
      throw new Error(`GraphQL review threads failed: ${JSON.stringify(payload.errors)}`);
    }
    const connection = payload.data?.repository?.pullRequest?.reviewThreads;
    if (!connection) throw new Error('GraphQL review threads response is incomplete');
    threads.push(...(connection.nodes || []));
    if (connection.pageInfo?.hasNextPage && !connection.pageInfo.endCursor) {
      throw new Error('GraphQL review threads pagination omitted endCursor');
    }
    cursor = connection.pageInfo?.hasNextPage ? connection.pageInfo.endCursor : null;
  } while (cursor);
  return threads;
}

export async function collectGitHubCheckRuns({
  repository,
  headSha,
  token,
  fetchFn = globalThis.fetch,
  maxPages = 20,
} = {}) {
  const head = normalizeSha(headSha);
  if (!head) throw new Error('check-run collection requires an exact head SHA');
  const checks = [];
  let expectedTotal = null;
  for (let page = 1; page <= maxPages; page += 1) {
    const response = await fetchFn(
      `https://api.github.com/repos/${repository}/commits/${head}/check-runs?per_page=100&page=${page}`,
      { method: 'GET', headers: githubHeaders(token) },
    );
    if (!response.ok) {
      throw new Error(`GET check-runs failed: ${response.status} ${await response.text()}`);
    }
    const payload = await response.json();
    if (!Array.isArray(payload?.check_runs)) {
      throw new Error('GET check-runs did not return check_runs array');
    }
    if (Number.isInteger(payload.total_count)) expectedTotal = payload.total_count;
    checks.push(...payload.check_runs);
    if (expectedTotal != null && checks.length >= expectedTotal) return checks;
    if (payload.check_runs.length < 100) {
      if (expectedTotal != null && checks.length < expectedTotal) {
        throw new Error('GET check-runs ended before total_count was collected');
      }
      return checks;
    }
  }
  throw new Error('GET check-runs exceeded the safe pagination limit');
}

function githubHeaders(token) {
  return {
    Authorization: `Bearer ${token}`,
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'User-Agent': 'lgfc-agent-routing-controller',
    'Content-Type': 'application/json',
  };
}

function reviewAuthor(review) {
  return String(
    typeof review?.author === 'string'
      ? review.author
      : review?.author?.login || review?.user?.login || '',
  )
    .trim()
    .toLowerCase();
}

function commentAuthor(comment) {
  return String(
    typeof comment?.author === 'string'
      ? comment.author
      : comment?.author?.login || comment?.user?.login || '',
  )
    .trim()
    .toLowerCase();
}

function normalizeAuthorSet(authors = []) {
  return new Set(
    (authors || [])
      .map((author) => String(author).trim().toLowerCase())
      .filter(Boolean),
  );
}

function normalizeExecutionFailure(result, fallbackCode) {
  if (result?.ok === false) {
    return executionFailure(result.code || fallbackCode, result.message || fallbackCode, result);
  }
  return executionFailure(fallbackCode, fallbackCode);
}

function executionFailure(code, message, details = {}) {
  return {
    ok: false,
    integrated: false,
    suppressed: false,
    code,
    message,
    mutations: 0,
    closeout: false,
    successorActivation: false,
    ...details,
  };
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
