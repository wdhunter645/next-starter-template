#!/usr/bin/env node
/**
 * Deterministic non-main component integration transaction (#2677-003 / #2772).
 *
 * This module permits exactly one merge mutation after a final live reread
 * proves source-Issue, PR, head, target, checks, review and thread authority.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { collectLiveGitHubEvidence, extractDeliveryProfile } from './evidence-collector.mjs';
import { verifyPostIntegration } from './post-integration-verify.mjs';

export const INTEGRATION_DISPOSITIONS = Object.freeze({
  ELIGIBLE: 'component_integration_eligible',
  BLOCKED: 'component_integration_blocked',
  SUPPRESSED: 'component_integration_suppressed',
  INTEGRATED: 'component_integrated',
});

export function buildComponentIntegrationIdentity({
  sourceIssueNumber,
  prNumber,
  headSha,
  targetBranch,
  disposition = INTEGRATION_DISPOSITIONS.ELIGIBLE,
  mergeSha = 'pending',
} = {}) {
  return [
    `issue:${Number(sourceIssueNumber)}`,
    `pr:${Number(prNumber)}`,
    `head:${normalizeSha(headSha)}`,
    `target:${String(targetBranch || '').trim()}`,
    `disposition:${disposition}`,
    `merge:${normalizeSha(mergeSha) || 'pending'}`,
  ].join(':');
}

export function evaluateComponentIntegration({
  live = {},
  config = {},
  expectedHeadSha = null,
  expectedTargetHeadSha = null,
  priorIntegrations = [],
} = {}) {
  const sourceIssue = live.sourceIssue || {};
  const pullRequest = live.pullRequest || {};
  const headSha = normalizeSha(
    pullRequest.headSha || pullRequest.headRefOid || pullRequest.head?.sha || live.headSha,
  );
  const targetBranch = String(
    pullRequest.baseRefName || pullRequest.base?.ref || live.targetBranch || '',
  ).trim();
  const targetHeadSha = normalizeSha(live.targetBranchHeadSha || '');
  const prNumber = Number(pullRequest.number);
  const sourceIssueNumber = Number(sourceIssue.number);

  const context = {
    sourceIssueNumber,
    prNumber,
    headSha,
    targetBranch,
    targetHeadSha,
  };
  const block = (code, message, details = {}) => ({
    ok: true,
    disposition: INTEGRATION_DISPOSITIONS.BLOCKED,
    mutationAllowed: false,
    code,
    message,
    context,
    ...details,
  });

  if (!Number.isInteger(sourceIssueNumber) || sourceIssueNumber <= 0) {
    return block('invalid_source_issue', 'One exact source Issue is required.');
  }
  if (String(sourceIssue.state || '').toUpperCase() !== 'OPEN') {
    return block('source_issue_not_open', 'The source Issue must remain open for this transaction.');
  }
  if (!Number.isInteger(prNumber) || prNumber <= 0) {
    return block('invalid_pr_number', 'One exact pull request is required.');
  }
  if (String(pullRequest.state || '').toUpperCase() !== 'OPEN') {
    return block('pull_request_not_open', 'The pull request must be open immediately before integration.');
  }
  if (!headSha) return block('missing_current_head', 'The current PR head SHA is required.');
  const expectedHead = normalizeSha(expectedHeadSha || '');
  if (expectedHead && expectedHead !== headSha) {
    return block('head_drift', 'The current PR head differs from the authorized head.');
  }
  if (!targetBranch) return block('missing_target_branch', 'The PR target branch is required.');
  if (!isAuthorizedTarget(targetBranch, config)) {
    return block('target_not_authorized', 'The target is not an authorized component branch.');
  }
  if (isProtectedTarget(targetBranch, config)) {
    return block('protected_target', 'main, Production, and other protected targets are forbidden.');
  }
  const expectedTarget = normalizeSha(expectedTargetHeadSha || '');
  if (expectedTarget && (!targetHeadSha || expectedTarget !== targetHeadSha)) {
    return block('target_drift', 'The target branch changed after authorization.');
  }

  const profile = pullRequest.deliveryProfile || extractDeliveryProfile(pullRequest.body || '');
  if (String(profile.targetEnvironment || '').toLowerCase() !== 'component') {
    return block('non_component_environment', 'Only component-target delivery profiles are eligible.');
  }
  const approvalProfile = String(profile.approvalProfile || '').trim();
  const allowedApprovalProfiles = new Set(config.allowedApprovalProfiles || []);
  if (!allowedApprovalProfiles.has(approvalProfile)) {
    return block('approval_profile_not_authorized', 'The approval profile is not authorized.');
  }

  const currentChecks = normalizeCurrentHeadChecks(live.checks || [], headSha);
  const requiredChecks = [...new Set((config.requiredChecks || []).map(String).filter(Boolean))];
  if (requiredChecks.length === 0) {
    return block('required_checks_unconfigured', 'A nonempty required-check set is mandatory.');
  }
  for (const requiredName of requiredChecks) {
    const matches = currentChecks.filter((check) => checkNameMatches(check.name, requiredName));
    if (matches.length === 0) {
      return block('required_check_missing', `Required check "${requiredName}" is missing.`);
    }
    if (
      matches.some(
        (check) =>
          check.status !== 'completed' ||
          check.conclusion !== 'success',
      )
    ) {
      return block('required_check_not_successful', `Required check "${requiredName}" is not successful.`);
    }
  }

  const unresolvedThreads = (live.reviewThreads || []).filter(
    (thread) => thread && thread.isResolved !== true && thread.isOutdated !== true,
  );
  if (unresolvedThreads.length > 0) {
    return block('unresolved_review_threads', 'Unresolved current-head review threads block integration.', {
      unresolvedThreadIds: unresolvedThreads.map((thread) => thread.id || null),
    });
  }
  const blockingReviews = (live.reviewSubmissions || live.reviews || []).filter((review) => {
    const state = String(review.state || '').toUpperCase();
    const reviewHead = normalizeSha(
      review.headSha || review.commitId || review.commit_id || review.commit?.oid || '',
    );
    return state === 'CHANGES_REQUESTED' && (!reviewHead || reviewHead === headSha);
  });
  if (blockingReviews.length > 0) {
    return block('changes_requested', 'A current-head changes-requested review blocks integration.');
  }

  const deterministicProfiles = new Set(config.deterministicApprovalProfiles || []);
  const independentReview = live.independentReview || {};
  const independentlyApproved =
    independentReview.approved === true &&
    normalizeSha(independentReview.headSha || headSha) === headSha &&
    independentReview.author !== pullRequest.author;
  if (!independentlyApproved && !deterministicProfiles.has(approvalProfile)) {
    return block(
      'independent_review_missing',
      'Independent approval or an exact deterministic integration profile is required.',
    );
  }

  const protectedSignals = [
    ...(live.protectedConditions || []),
    ...(pullRequest.protectedConditions || []),
  ].filter(Boolean);
  if (protectedSignals.length > 0) {
    return block('protected_condition', 'Protected decisions require an explicit stop.', {
      protectedConditions: protectedSignals,
    });
  }

  const pendingIdentity = buildComponentIntegrationIdentity({
    sourceIssueNumber,
    prNumber,
    headSha,
    targetBranch,
  });
  const prior = (priorIntegrations || []).find(
    (record) =>
      record &&
      Number(record.sourceIssueNumber) === sourceIssueNumber &&
      Number(record.prNumber) === prNumber &&
      normalizeSha(record.headSha) === headSha &&
      String(record.targetBranch || '') === targetBranch &&
      normalizeSha(record.mergeSha || ''),
  );
  if (prior) {
    return {
      ok: true,
      disposition: INTEGRATION_DISPOSITIONS.SUPPRESSED,
      mutationAllowed: false,
      code: 'already_integrated',
      message: 'An equivalent component integration is already recorded.',
      context,
      integrationIdentity: buildComponentIntegrationIdentity({
        sourceIssueNumber,
        prNumber,
        headSha,
        targetBranch,
        disposition: INTEGRATION_DISPOSITIONS.INTEGRATED,
        mergeSha: prior.mergeSha,
      }),
      priorIntegration: prior,
    };
  }

  return {
    ok: true,
    disposition: INTEGRATION_DISPOSITIONS.ELIGIBLE,
    mutationAllowed: true,
    code: 'eligible',
    message: 'Current live evidence authorizes one component integration mutation.',
    context,
    deliveryProfile: profile,
    integrationIdentity: pendingIdentity,
    mergeMethod: config.mergeMethod || 'squash',
    maxMutations: 1,
  };
}

export async function executeComponentIntegration({
  live,
  config,
  expectedHeadSha = null,
  expectedTargetHeadSha = null,
  priorIntegrations = [],
  adapter,
} = {}) {
  const evaluated = evaluateComponentIntegration({
    live,
    config,
    expectedHeadSha,
    expectedTargetHeadSha,
    priorIntegrations,
  });
  if (!evaluated.ok || evaluated.disposition !== INTEGRATION_DISPOSITIONS.ELIGIBLE) {
    return evaluated;
  }
  if (!adapter || typeof adapter.mergePullRequest !== 'function') {
    return failClosed('integration_adapter_missing', 'A merge adapter is required.');
  }

  const mergeResult = await adapter.mergePullRequest({
    prNumber: evaluated.context.prNumber,
    expectedHeadSha: evaluated.context.headSha,
    targetBranch: evaluated.context.targetBranch,
    mergeMethod: evaluated.mergeMethod,
  });
  if (!mergeResult?.merged || !normalizeSha(mergeResult.mergeSha || '')) {
    return failClosed('integration_failed', 'The component merge transaction did not return a merge SHA.', {
      mergeResult,
    });
  }
  const mergeSha = normalizeSha(mergeResult.mergeSha);
  const verificationEvidence =
    typeof adapter.readVerificationEvidence === 'function'
      ? await adapter.readVerificationEvidence({
          sourceIssueNumber: evaluated.context.sourceIssueNumber,
          prNumber: evaluated.context.prNumber,
          targetBranch: evaluated.context.targetBranch,
          mergeSha,
        })
      : {};
  const verification = verifyPostIntegration({
    sourceIssueNumber: evaluated.context.sourceIssueNumber,
    prNumber: evaluated.context.prNumber,
    sourceIssueState: verificationEvidence.sourceIssueState || live.sourceIssue?.state,
    targetBranch: evaluated.context.targetBranch,
    mergeSha,
    targetHeadSha: verificationEvidence.targetHeadSha,
    compareStatus: verificationEvidence.compareStatus,
    expectedTargetBranch: evaluated.context.targetBranch,
  });
  if (!verification.ok) {
    return {
      ...verification,
      mutationOccurred: true,
      mergeSha,
      requiresAuthorizedRecovery: true,
    };
  }

  return {
    ok: true,
    disposition: INTEGRATION_DISPOSITIONS.INTEGRATED,
    mutationOccurred: true,
    mutationCount: 1,
    sourceIssueNumber: evaluated.context.sourceIssueNumber,
    prNumber: evaluated.context.prNumber,
    headSha: evaluated.context.headSha,
    targetBranch: evaluated.context.targetBranch,
    mergeSha,
    integrationIdentity: buildComponentIntegrationIdentity({
      ...evaluated.context,
      disposition: INTEGRATION_DISPOSITIONS.INTEGRATED,
      mergeSha,
    }),
    verification,
    closeoutAllowed: false,
    successorActivationAllowed: false,
  };
}

export async function collectComponentIntegrationEvidence({
  repository,
  issueNumber,
  prNumber,
  token,
  fetchFn = globalThis.fetch,
} = {}) {
  const collected = await collectLiveGitHubEvidence({
    repository,
    issueNumber,
    prNumber,
    token,
    fetchFn,
  });
  if (!collected.ok) return collected;
  const live = collected.live;
  const targetBranch = String(
    live.pullRequest?.baseRefName || live.pullRequest?.base?.ref || '',
  ).trim();
  if (!targetBranch) return failClosed('missing_target_branch', 'The live PR target branch is missing.');
  const branch = await githubJson({
    repository,
    path: `/branches/${encodeURIComponent(targetBranch)}`,
    token,
    fetchFn,
  });
  if (!branch.ok) return branch;
  return {
    ok: true,
    live: {
      ...live,
      targetBranch,
      targetBranchHeadSha: normalizeSha(branch.data?.commit?.sha || ''),
    },
  };
}

export function createGitHubIntegrationAdapter({
  repository,
  token,
  fetchFn = globalThis.fetch,
} = {}) {
  return {
    async mergePullRequest({ prNumber, expectedHeadSha, mergeMethod }) {
      const response = await githubJson({
        repository,
        path: `/pulls/${prNumber}/merge`,
        method: 'PUT',
        body: {
          sha: expectedHeadSha,
          merge_method: mergeMethod || 'squash',
        },
        token,
        fetchFn,
      });
      if (!response.ok) return { merged: false, error: response };
      return {
        merged: response.data?.merged === true,
        mergeSha: response.data?.sha || null,
        message: response.data?.message || null,
      };
    },
    async readVerificationEvidence({ sourceIssueNumber, targetBranch, mergeSha }) {
      const [issue, branch, compare] = await Promise.all([
        githubJson({
          repository,
          path: `/issues/${sourceIssueNumber}`,
          token,
          fetchFn,
        }),
        githubJson({
          repository,
          path: `/branches/${encodeURIComponent(targetBranch)}`,
          token,
          fetchFn,
        }),
        githubJson({
          repository,
          path: `/compare/${encodeURIComponent(mergeSha)}...${encodeURIComponent(targetBranch)}`,
          token,
          fetchFn,
        }),
      ]);
      return {
        sourceIssueState: issue.data?.state || null,
        targetHeadSha: branch.data?.commit?.sha || null,
        compareStatus: compare.data?.status || null,
      };
    },
  };
}

async function githubJson({
  repository,
  path: apiPath,
  method = 'GET',
  body = null,
  token,
  fetchFn,
}) {
  if (!repository || !token || typeof fetchFn !== 'function') {
    return failClosed('github_client_unavailable', 'Repository, token, and fetch are required.');
  }
  let response;
  try {
    response = await fetchFn(`https://api.github.com/repos/${repository}${apiPath}`, {
      method,
      headers: {
        Accept: 'application/vnd.github+json',
        Authorization: `Bearer ${token}`,
        'X-GitHub-Api-Version': '2022-11-28',
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
  } catch (error) {
    return failClosed('github_request_failed', error instanceof Error ? error.message : String(error));
  }
  let data = null;
  try {
    data = await response.json();
  } catch {
    data = null;
  }
  if (!response.ok) {
    return failClosed('github_request_failed', `GitHub API returned ${response.status}.`, {
      status: response.status,
      data,
    });
  }
  return { ok: true, data };
}

function normalizeCurrentHeadChecks(checks, headSha) {
  return (checks || [])
    .filter(
      (check) =>
        normalizeSha(check.headSha || check.head_sha || check.commit_sha || headSha) === headSha,
    )
    .map((check) => ({
      name: String(check.name || check.context || ''),
      status: String(check.status || '').toLowerCase(),
      conclusion: String(check.conclusion || check.state || '').toLowerCase(),
    }));
}

function checkNameMatches(actual, required) {
  const a = normalizeName(actual);
  const r = normalizeName(required);
  return a === r || a.endsWith(r) || a.includes(r);
}

function normalizeName(value) {
  return String(value || '').toLowerCase().replace(/[^a-z0-9]+/g, '');
}

function isAuthorizedTarget(target, config) {
  const exact = new Set(config.allowedTargets || []);
  if (exact.has(target)) return true;
  return (config.allowedTargetPrefixes || []).some((prefix) => target.startsWith(prefix));
}

function isProtectedTarget(target, config) {
  const normalized = target.toLowerCase();
  if (['main', 'master', 'production', 'prod'].includes(normalized)) return true;
  if ((config.forbiddenTargets || []).map((value) => String(value).toLowerCase()).includes(normalized)) {
    return true;
  }
  return /(production|prod|credential|secret|destructive)/i.test(target);
}

function normalizeSha(value) {
  const sha = String(value || '').trim().toLowerCase();
  return /^[0-9a-f]{7,40}$/.test(sha) ? sha : '';
}

function failClosed(code, message, details = {}) {
  return { ok: false, code, message, mutationAllowed: false, ...details };
}

function parseArgs(argv) {
  const args = {
    configPath: 'config/agent-routing/controller.json',
    outputPath: 'reports/agent-routing/component-integration.json',
    integrate: false,
    repository: process.env.GITHUB_REPOSITORY || null,
    token: process.env.GITHUB_TOKEN || process.env.GH_TOKEN || null,
  };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--issue') args.issueNumber = Number(argv[++i]);
    else if (arg === '--pr') args.prNumber = Number(argv[++i]);
    else if (arg === '--repository') args.repository = argv[++i];
    else if (arg === '--config') args.configPath = argv[++i];
    else if (arg === '--output') args.outputPath = argv[++i];
    else if (arg === '--expected-head') args.expectedHeadSha = argv[++i];
    else if (arg === '--expected-target-head') args.expectedTargetHeadSha = argv[++i];
    else if (arg === '--integrate') args.integrate = true;
  }
  return args;
}

export async function main(argv = process.argv.slice(2)) {
  const args = parseArgs(argv);
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
  const config = JSON.parse(fs.readFileSync(path.resolve(root, args.configPath), 'utf8'));
  const integrationConfig = config.componentIntegration || {};
  if (!integrationConfig.enabled) {
    throw new Error('component_integration_disabled');
  }
  const evidence = await collectComponentIntegrationEvidence({
    repository: args.repository,
    issueNumber: args.issueNumber,
    prNumber: args.prNumber,
    token: args.token,
  });
  let result = evidence;
  if (evidence.ok) {
    if (args.integrate) {
      result = await executeComponentIntegration({
        live: evidence.live,
        config: integrationConfig,
        expectedHeadSha: args.expectedHeadSha,
        expectedTargetHeadSha: args.expectedTargetHeadSha,
        adapter: createGitHubIntegrationAdapter({
          repository: args.repository,
          token: args.token,
        }),
      });
    } else {
      result = evaluateComponentIntegration({
        live: evidence.live,
        config: integrationConfig,
        expectedHeadSha: args.expectedHeadSha,
        expectedTargetHeadSha: args.expectedTargetHeadSha,
      });
    }
  }
  const output = path.resolve(root, args.outputPath);
  fs.mkdirSync(path.dirname(output), { recursive: true });
  fs.writeFileSync(output, `${JSON.stringify(result, null, 2)}\n`);
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  return result.ok && result.disposition !== INTEGRATION_DISPOSITIONS.BLOCKED ? 0 : 1;
}

const isDirect =
  process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isDirect) {
  main().then(
    (code) => {
      process.exitCode = code;
    },
    (error) => {
      process.stderr.write(`${error instanceof Error ? error.stack || error.message : String(error)}\n`);
      process.exitCode = 1;
    },
  );
}
