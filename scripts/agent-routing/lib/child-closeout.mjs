#!/usr/bin/env node
/**
 * Verified child closeout plus exactly-one-successor activation (#2677-004 / #2773).
 *
 * This executor is intentionally separate from component integration. It rereads
 * all authoritative GitHub state twice before mutation, executes one logical
 * closeout/successor transaction, then rereads and verifies the resulting state.
 * It cannot merge code, mutate main, or act on protected source-Issue classes.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  assessSuccessorLaunchPackage,
  buildSuccessorResume,
  labelsForSuccessorActivation,
  resolveParentProjectNumber,
} from './successor-activation.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../../..');
const DEFAULT_CONFIG_PATH = path.join(ROOT, 'config/agent-routing/controller.json');
const PROTECTED_SOURCE_TITLE = /^(?:PROJECT|PROGRAM|PROMOTION CANDIDATE|PRODUCTION|INCIDENT|OPS|PRODUCT AUTHORITY)\s*:/i;

export function buildCloseoutIdentity({
  sourceIssueNumber,
  prNumber,
  headSha,
  targetBranch,
  integrationSha,
  successorIssueNumber,
} = {}) {
  const source = positiveInteger(sourceIssueNumber);
  const pr = positiveInteger(prNumber);
  const successor = positiveInteger(successorIssueNumber);
  const head = normalizeSha(headSha);
  const integration = normalizeSha(integrationSha);
  const target = String(targetBranch || '').trim();
  if (!source || !pr || !successor || !head || !integration || !target) {
    throw new Error('closeout_identity_requires_complete_expected_state');
  }
  return `source:${source}:pr:${pr}:head:${head}:target:${target}:integration:${integration}:successor:${successor}`;
}

export function evaluateCloseoutSuccessorTransaction({
  sourceIssue,
  parentIssue,
  successorIssue,
  pullRequest,
  sourceComments = [],
  parentComments = [],
  successorComments = [],
  targetContainsIntegrationSha = false,
  expected = {},
  config = {},
} = {}) {
  const configCheck = validateCloseoutConfig(config);
  if (!configCheck.ok) return configCheck;

  let identity;
  try {
    identity = buildCloseoutIdentity(expected);
  } catch (error) {
    return failClosed(
      'closeout_expected_state_incomplete',
      error instanceof Error ? error.message : String(error),
    );
  }

  const sourceNumber = positiveInteger(sourceIssue?.number);
  const expectedSource = positiveInteger(expected.sourceIssueNumber);
  if (!sourceNumber || sourceNumber !== expectedSource) {
    return failClosed('closeout_source_issue_mismatch', 'Source Issue identity does not match expected state.');
  }
  const sourceState = String(sourceIssue?.state || '').toUpperCase();
  const closeoutMarkerPresent = commentHasMarker(
    sourceComments,
    'closeout',
    identity,
    config.trustedControllerAuthors,
  );
  if (sourceState !== 'OPEN' && !(sourceState === 'CLOSED' && closeoutMarkerPresent)) {
    return failClosed('closeout_source_issue_not_open', 'Source Issue must be OPEN before closeout.');
  }
  if (sourceState === 'OPEN') {
    if (!hasAcceptanceCriteriaSection(sourceIssue?.body || '')) {
      return failClosed(
        'source_acceptance_section_missing',
        'Source Issue must include an Acceptance criteria section.',
      );
    }
    if (!closeoutMarkerPresent) {
      const sourceLabels = new Set((sourceIssue?.labels || []).map(labelName));
      if (!sourceLabels.has('agent:cursor')) {
        return failClosed(
          'source_owner_label_missing',
          'OPEN source Issue must retain agent:cursor ownership before closeout.',
        );
      }
    }
  }
  if (PROTECTED_SOURCE_TITLE.test(String(sourceIssue?.title || '').trim())) {
    return failClosed(
      'protected_source_issue_class',
      'Project/master, program, Promotion Candidate, Production, incident, standalone Operations, and Product Authority Issues are protected from child closeout.',
    );
  }

  const explicitParent = resolveParentProjectNumber(sourceIssue?.body || '');
  if (!explicitParent || Number(parentIssue?.number) !== explicitParent) {
    return failClosed('parent_issue_mismatch', 'Source Issue parent authority is missing or mismatched.');
  }
  if (String(parentIssue?.state || '').toUpperCase() !== 'OPEN') {
    return failClosed('parent_issue_not_open', 'Parent project must remain OPEN during child closeout.');
  }
  const parentSequence = validateParentSequence(
    parentIssue?.body || '',
    expectedSource,
    positiveInteger(expected.successorIssueNumber),
  );
  if (!parentSequence.ok) return parentSequence;

  const expectedPr = positiveInteger(expected.prNumber);
  if (Number(pullRequest?.number) !== expectedPr) {
    return failClosed('closeout_pr_mismatch', 'Related PR identity does not match expected state.');
  }
  const merged = pullRequest?.merged === true || Boolean(pullRequest?.merged_at || pullRequest?.mergedAt);
  if (!merged || String(pullRequest?.state || '').toLowerCase() !== 'closed') {
    return failClosed('closeout_pr_not_merged', 'Related PR must be merged before closeout.');
  }
  const liveHead = normalizeSha(pullRequest?.head?.sha || pullRequest?.headSha || pullRequest?.headRefOid);
  if (!liveHead || liveHead !== normalizeSha(expected.headSha)) {
    return failClosed('closeout_pr_head_mismatch', 'Merged PR head does not match expected head SHA.');
  }
  const liveTarget = String(pullRequest?.base?.ref || pullRequest?.baseRefName || '').trim();
  const expectedTarget = String(expected.targetBranch || '').trim();
  if (!expectedTarget.startsWith('component/') || liveTarget !== expectedTarget) {
    return failClosed('closeout_target_mismatch', 'Closeout is restricted to the exact component target.');
  }
  const liveMerge = normalizeSha(
    pullRequest?.merge_commit_sha || pullRequest?.mergeCommitSha || pullRequest?.mergeSha,
  );
  if (!liveMerge || liveMerge !== normalizeSha(expected.integrationSha)) {
    return failClosed('closeout_integration_sha_mismatch', 'Merged PR integration SHA does not match expected state.');
  }
  if (targetContainsIntegrationSha !== true) {
    return failClosed('integration_sha_not_on_target', 'Exact integration SHA is not verified on the component target.');
  }

  const refs = extractPrimaryIssueRefs(pullRequest?.body || '');
  if (refs.length !== 1 || refs[0] !== expectedSource) {
    return failClosed('closeout_pr_source_linkage_invalid', 'PR must declare exactly this source Issue.');
  }
  const unchecked = extractUncheckedAcceptance(sourceIssue?.body || '');
  if (unchecked.length > 0) {
    return failClosed('source_acceptance_incomplete', 'Source acceptance criteria remain unchecked.', {
      uncheckedAcceptanceCriteria: unchecked,
    });
  }

  const closeoutAuthority = validateCloseoutAuthority(sourceComments, {
    expected,
    trustedAuthors: config.trustedDecisionAuthors,
  });
  if (!closeoutAuthority.ok) return closeoutAuthority;

  const successorAssessment = assessSuccessorLaunchPackage({
    sourceIssue,
    successorIssue,
    expectedSuccessorNumber: expected.successorIssueNumber,
    successorComments,
    trustedDecisionAuthors: config.trustedDecisionAuthors,
  });
  if (!successorAssessment.ok) return successorAssessment;

  return {
    ok: true,
    eligible: true,
    identity,
    sourceIssueNumber: expectedSource,
    parentIssueNumber: explicitParent,
    successorIssueNumber: successorAssessment.successorIssueNumber,
    closeoutAuthorityCommentId: String(
      closeoutAuthority.comment?.id || closeoutAuthority.comment?.databaseId || '',
    ),
    launchPackage: successorAssessment,
    existing: transactionMarkers({
      identity,
      sourceComments,
      parentComments,
      successorComments,
      trustedControllerAuthors: config.trustedControllerAuthors,
    }),
  };
}

export async function executeCloseoutSuccessorTransaction({
  repository,
  sourceIssueNumber,
  prNumber,
  headSha,
  targetBranch,
  integrationSha,
  successorIssueNumber,
  config,
  token = null,
  fetchFn = globalThis.fetch,
  collectState = null,
  mutate = null,
} = {}) {
  const expected = {
    sourceIssueNumber: Number(sourceIssueNumber),
    prNumber: Number(prNumber),
    headSha,
    targetBranch,
    integrationSha,
    successorIssueNumber: Number(successorIssueNumber),
  };
  let identity;
  try {
    identity = buildCloseoutIdentity(expected);
  } catch (error) {
    return failClosed(
      'closeout_expected_state_incomplete',
      error instanceof Error ? error.message : String(error),
    );
  }
  const configCheck = validateCloseoutConfig(config);
  if (!configCheck.ok) return configCheck;

  const collector =
    collectState ||
    (() =>
      collectGitHubCloseoutState({
        repository,
        sourceIssueNumber: expected.sourceIssueNumber,
        prNumber: expected.prNumber,
        successorIssueNumber: expected.successorIssueNumber,
        targetBranch: expected.targetBranch,
        integrationSha: expected.integrationSha,
        token,
        fetchFn,
      }));
  const mutator =
    mutate ||
    ((operation) =>
      mutateGitHubCloseoutState({
        repository,
        operation,
        token,
        fetchFn,
      }));

  const initial = await collector();
  if (!initial?.ok && initial?.ok !== undefined) return initial;
  const initialMarkers = transactionMarkers({
    identity,
    sourceComments: initial.sourceComments,
    parentComments: initial.parentComments,
    successorComments: initial.successorComments,
    trustedControllerAuthors: config.trustedControllerAuthors,
  });
  if (isCompletedState(initial, initialMarkers)) {
    return {
      ok: true,
      verified: true,
      suppressed: true,
      code: 'closeout_successor_already_completed',
      identity,
      transactions: 0,
      actions: [],
    };
  }

  const evaluation = evaluateCloseoutSuccessorTransaction({
    ...initial,
    expected,
    config,
  });
  if (!evaluation.ok) return evaluation;

  const finalRead = await collector();
  if (!finalRead?.ok && finalRead?.ok !== undefined) return finalRead;
  if (stateFingerprint(initial) !== stateFingerprint(finalRead)) {
    return failClosed(
      'closeout_expected_state_drift',
      'Source, parent, PR, integration, or successor state changed before mutation.',
      { transactions: 0, actions: [] },
    );
  }

  const markers = evaluation.existing;
  const sourceCloseoutBody = buildCloseoutPacket({
    state: finalRead,
    expected,
    identity,
    evaluation,
  });
  const parentReportBody = buildParentReport({ expected, identity, evaluation });
  const successorResumeBody = buildSuccessorResume({
    sourceIssueNumber: expected.sourceIssueNumber,
    successorIssueNumber: expected.successorIssueNumber,
    identity,
    launchPackage: evaluation.launchPackage,
    resumeMarker: config.resumeMarker || 'LOCAL CURSOR RESUME',
  });
  const operations = [];

  if (!markers.closeout) {
    operations.push({
      type: 'comment-source-closeout',
      issueNumber: expected.sourceIssueNumber,
      body: sourceCloseoutBody,
    });
  }
  if (String(finalRead.sourceIssue?.state || '').toUpperCase() !== 'CLOSED') {
    operations.push({
      type: 'close-source-issue',
      issueNumber: expected.sourceIssueNumber,
      labels: labelsForSourceCloseout(finalRead.sourceIssue?.labels || []),
    });
  }
  if (!markers.parent) {
    operations.push({
      type: 'comment-parent-report',
      issueNumber: evaluation.parentIssueNumber,
      body: parentReportBody,
    });
  }
  if (!successorLabelsActivated(finalRead.successorIssue?.labels || [])) {
    operations.push({
      type: 'activate-successor-labels',
      issueNumber: expected.successorIssueNumber,
      labels: labelsForSuccessorActivation(finalRead.successorIssue?.labels || []),
    });
  }
  if (!markers.successor) {
    operations.push({
      type: 'comment-successor-resume',
      issueNumber: expected.successorIssueNumber,
      body: successorResumeBody,
    });
  }

  if (operations.length === 0) {
    return failClosed(
      'closeout_transaction_inconsistent',
      'No mutation was required, but completed-state verification did not pass.',
    );
  }

  for (const operation of operations) {
    const result = await mutator(operation);
    if (!result?.ok) {
      return failClosed(
        result?.code || 'closeout_mutation_failed',
        result?.message || `Closeout mutation failed: ${operation.type}`,
        {
          identity,
          transactions: 1,
          mutationsCompleted: operations.indexOf(operation),
          failedOperation: operation.type,
        },
      );
    }
  }

  const post = await collector();
  if (!post?.ok && post?.ok !== undefined) {
    return { ...post, identity, transactions: 1, mutationsCompleted: operations.length };
  }
  const postMarkers = transactionMarkers({
    identity,
    sourceComments: post.sourceComments,
    parentComments: post.parentComments,
    successorComments: post.successorComments,
    trustedControllerAuthors: config.trustedControllerAuthors,
  });
  if (!isCompletedState(post, postMarkers)) {
    return failClosed(
      'closeout_post_mutation_verification_failed',
      'Post-mutation reread did not prove closeout, parent reporting, successor activation, and exact resume.',
      { identity, transactions: 1, mutationsCompleted: operations.length },
    );
  }

  return {
    ok: true,
    verified: true,
    suppressed: false,
    code: 'closeout_successor_completed',
    identity,
    transactions: 1,
    mutationsCompleted: operations.length,
    sourceIssueNumber: expected.sourceIssueNumber,
    parentIssueNumber: evaluation.parentIssueNumber,
    successorIssueNumber: expected.successorIssueNumber,
    actions: operations.map((operation) => operation.type),
  };
}

export async function collectGitHubCloseoutState({
  repository,
  sourceIssueNumber,
  prNumber,
  successorIssueNumber,
  targetBranch,
  integrationSha,
  token,
  fetchFn = globalThis.fetch,
} = {}) {
  if (!repository || !token) {
    return failClosed('closeout_live_evidence_unavailable', 'Repository and GitHub token are required.');
  }
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
  const getAll = async (apiPath, maxPages = 20) => {
    const items = [];
    for (let page = 1; page <= maxPages; page += 1) {
      const separator = apiPath.includes('?') ? '&' : '?';
      const batch = await get(`${apiPath}${separator}per_page=100&page=${page}`);
      if (!Array.isArray(batch)) throw new Error(`GET ${apiPath} did not return an array`);
      items.push(...batch);
      if (batch.length < 100) return items;
    }
    throw new Error(`GET ${apiPath} exceeded safe pagination limit`);
  };

  try {
    const [sourceIssue, pullRequest, successorIssue, sourceComments, successorComments] =
      await Promise.all([
        get(`/issues/${Number(sourceIssueNumber)}`),
        get(`/pulls/${Number(prNumber)}`),
        get(`/issues/${Number(successorIssueNumber)}`),
        getAll(`/issues/${Number(sourceIssueNumber)}/comments`),
        getAll(`/issues/${Number(successorIssueNumber)}/comments`),
      ]);
    if (sourceIssue?.pull_request || successorIssue?.pull_request) {
      return failClosed('closeout_issue_identity_invalid', 'Source or successor identity resolved to a PR.');
    }
    const parentIssueNumber = resolveParentProjectNumber(sourceIssue?.body || '');
    if (!parentIssueNumber) {
      return failClosed('parent_issue_missing', 'Source Issue does not declare a parent project.');
    }
    const [parentIssue, parentComments, compare] = await Promise.all([
      get(`/issues/${parentIssueNumber}`),
      getAll(`/issues/${parentIssueNumber}/comments`),
      get(
        `/compare/${encodeURIComponent(String(integrationSha))}...${encodeURIComponent(
          String(targetBranch),
        )}`,
      ),
    ]);
    return {
      sourceIssue: normalizeIssue(sourceIssue),
      parentIssue: normalizeIssue(parentIssue),
      successorIssue: normalizeIssue(successorIssue),
      pullRequest,
      sourceComments: sourceComments.map(normalizeComment),
      parentComments: parentComments.map(normalizeComment),
      successorComments: successorComments.map(normalizeComment),
      targetContainsIntegrationSha: ['ahead', 'identical'].includes(String(compare?.status || '')),
      collectedAt: new Date().toISOString(),
    };
  } catch (error) {
    return failClosed(
      'closeout_live_evidence_unavailable',
      error instanceof Error ? error.message : String(error),
    );
  }
}

export async function mutateGitHubCloseoutState({
  repository,
  operation,
  token,
  fetchFn = globalThis.fetch,
} = {}) {
  const headers = githubHeaders(token);
  const request = async (apiPath, method, body) => {
    const response = await fetchFn(`https://api.github.com/repos/${repository}${apiPath}`, {
      method,
      headers,
      body: JSON.stringify(body),
    });
    if (!response.ok) {
      return failClosed(
        'closeout_github_mutation_failed',
        `${method} ${apiPath} failed: ${response.status} ${await response.text()}`,
      );
    }
    return { ok: true, payload: await response.json() };
  };
  if (operation.type === 'comment-source-closeout' || operation.type === 'comment-parent-report' || operation.type === 'comment-successor-resume') {
    return request(`/issues/${operation.issueNumber}/comments`, 'POST', { body: operation.body });
  }
  if (operation.type === 'close-source-issue') {
    return request(`/issues/${operation.issueNumber}`, 'PATCH', {
      state: 'closed',
      state_reason: 'completed',
      labels: operation.labels,
    });
  }
  if (operation.type === 'activate-successor-labels') {
    return request(`/issues/${operation.issueNumber}`, 'PATCH', { labels: operation.labels });
  }
  return failClosed('unsupported_closeout_mutation', `Unsupported operation: ${operation.type}`);
}

function validateCloseoutConfig(config = {}) {
  if (config.enabled !== true) return failClosed('closeout_successor_disabled', 'Closeout/successor mutation is disabled.');
  if (config.allowMain !== false || config.allowProduction !== false) {
    return failClosed('closeout_successor_unsafe_config', 'Main and Production must remain forbidden.');
  }
  if (Number(config.maxTransactionsPerRun) !== 1) {
    return failClosed('closeout_successor_unsafe_config', 'Exactly one logical transaction per run is required.');
  }
  if (!nonEmptyStrings(config.trustedDecisionAuthors) || !nonEmptyStrings(config.trustedControllerAuthors)) {
    return failClosed('closeout_successor_unsafe_config', 'Trusted decision and controller authors are required.');
  }
  return { ok: true };
}

function validateCloseoutAuthority(comments, { expected, trustedAuthors }) {
  const trusted = new Set((trustedAuthors || []).map(normalizeAuthor).filter(Boolean));
  for (const comment of comments || []) {
    if (!trusted.has(commentAuthor(comment))) continue;
    const body = String(comment?.body || comment?.bodyText || '');
    if (!/^APPROVED FOR CLOSEOUT\b/im.test(body)) continue;
    if (!/Status:\s*closeout and successor activation authorized/i.test(body)) continue;
    const identityOk =
      extractNumberField(body, 'Issue') === Number(expected.sourceIssueNumber) &&
      extractNumberField(body, 'PR') === Number(expected.prNumber) &&
      normalizeSha(extractField(body, 'Head SHA')) === normalizeSha(expected.headSha) &&
      String(extractField(body, 'Target branch') || '') === String(expected.targetBranch) &&
      normalizeSha(extractField(body, 'Integration SHA')) === normalizeSha(expected.integrationSha) &&
      extractNumberField(body, 'Successor') === Number(expected.successorIssueNumber);
    if (!identityOk) continue;

    const reviewDisposition = extractField(body, 'Review disposition');
    if (!reviewDisposition || !/^accepted$/i.test(reviewDisposition.trim())) {
      return failClosed(
        'closeout_review_disposition_not_accepted',
        'Trusted closeout authority requires Review disposition: accepted.',
      );
    }

    const integrationVerification = extractField(body, 'Integration verification');
    if (!integrationVerification || !/^verified$/i.test(integrationVerification.trim())) {
      return failClosed(
        'closeout_integration_verification_not_verified',
        'Trusted closeout authority requires Integration verification: verified.',
      );
    }

    return { ok: true, comment };
  }
  return failClosed(
    'closeout_authority_missing',
    'A trusted exact closeout and successor-activation authorization is required.',
  );
}

function validateParentSequence(parentBody, sourceNumber, successorNumber) {
  const source = positiveInteger(sourceNumber);
  const successor = positiveInteger(successorNumber);
  if (!source || !successor) {
    return failClosed(
      'parent_sequence_dependency_invalid',
      'Parent project body must identify the source Issue before the successor in explicit sequence order.',
    );
  }
  const refs = extractOrderedIssueRefs(parentBody);
  const sourceIndex = refs.indexOf(source);
  const successorIndex = refs.indexOf(successor);
  if (sourceIndex === -1 || successorIndex === -1 || sourceIndex >= successorIndex) {
    return failClosed(
      'parent_sequence_dependency_invalid',
      'Parent project body must identify the source Issue before the successor in explicit sequence order.',
    );
  }
  return { ok: true };
}

function extractOrderedIssueRefs(body) {
  const refs = [];
  for (const match of String(body || '').matchAll(/#(\d+)/g)) {
    refs.push(Number(match[1]));
  }
  return refs;
}

function hasAcceptanceCriteriaSection(body) {
  return /^##\s+Acceptance criteria\b/im.test(String(body || ''));
}

function buildCloseoutPacket({ state, expected, identity, evaluation }) {
  return [
    'CHATGPT CLOSEOUT',
    '',
    `Issue: #${expected.sourceIssueNumber}`,
    `Parent: #${evaluation.parentIssueNumber}`,
    `PR: #${expected.prNumber}`,
    `Head SHA: ${normalizeSha(expected.headSha)}`,
    `Target branch: ${expected.targetBranch}`,
    `Integration SHA: ${normalizeSha(expected.integrationSha)}`,
    `Successor: #${expected.successorIssueNumber}`,
    `Decision authority comment id: ${evaluation.closeoutAuthorityCommentId}`,
    'Transaction executor: deterministic closeout-successor controller',
    'Integration verification: exact merge SHA contained on exact component target',
    `Validation evidence: source acceptance complete; PR merged; parent #${evaluation.parentIssueNumber} OPEN; successor launch package complete`,
    'Parent reporting: recorded in this transaction',
    'Successor disposition: activate exactly one successor and post one bounded resume',
    'Unresolved gaps: none recorded by this transaction',
    `Source title: ${state.sourceIssue?.title || ''}`,
    '',
    `<!-- agent-routing-closeout:${identity} -->`,
  ].join('\n');
}

function buildParentReport({ expected, identity, evaluation }) {
  return [
    'CHILD CLOSEOUT REPORT',
    '',
    `Parent: #${evaluation.parentIssueNumber}`,
    `Completed child: #${expected.sourceIssueNumber}`,
    `Integration SHA: ${normalizeSha(expected.integrationSha)}`,
    `Activated successor: #${expected.successorIssueNumber}`,
    'Disposition: verified child closeout and exactly-one-successor activation',
    '',
    `<!-- agent-routing-parent:${identity} -->`,
  ].join('\n');
}

function transactionMarkers({
  identity,
  sourceComments,
  parentComments,
  successorComments,
  trustedControllerAuthors = [],
}) {
  return {
    closeout: commentHasMarker(sourceComments, 'closeout', identity, trustedControllerAuthors),
    parent: commentHasMarker(parentComments, 'parent', identity, trustedControllerAuthors),
    successor: commentHasMarker(successorComments, 'successor', identity, trustedControllerAuthors),
  };
}

function commentHasMarker(comments = [], kind, identity, trustedControllerAuthors = []) {
  const marker = `<!-- agent-routing-${kind}:${identity} -->`;
  const trusted = new Set((trustedControllerAuthors || []).map(normalizeAuthor).filter(Boolean));
  return (comments || []).some((comment) => {
    const body = String(comment?.body || comment?.bodyText || '');
    if (!body.includes(marker)) return false;
    if (trusted.size === 0) return false;
    return trusted.has(commentAuthor(comment));
  });
}

function isCompletedState(state, markers) {
  return (
    String(state.sourceIssue?.state || '').toUpperCase() === 'CLOSED' &&
    markers.closeout &&
    markers.parent &&
    markers.successor &&
    sourceLabelsComplete(state.sourceIssue?.labels || []) &&
    successorLabelsComplete(state.successorIssue?.labels || [])
  );
}

function sourceLabelsComplete(labels) {
  const set = new Set((labels || []).map(labelName).filter(Boolean));
  if (!set.has('status:complete')) return false;
  if (set.has('agent:cursor') || set.has('handoff:ready')) return false;
  for (const label of set) {
    if (label.startsWith('status:') && label !== 'status:complete') return false;
  }
  return true;
}

function successorLabelsComplete(labels) {
  const set = new Set((labels || []).map(labelName).filter(Boolean));
  if (!set.has('agent:cursor') || !set.has('handoff:ready') || !set.has('status:in-progress')) {
    return false;
  }
  return !set.has('status:blocked');
}

function successorLabelsActivated(labels) {
  const set = new Set((labels || []).map(labelName));
  return set.has('agent:cursor') && set.has('handoff:ready') && set.has('status:in-progress');
}

function labelsForSourceCloseout(labels) {
  const set = new Set((labels || []).map(labelName).filter(Boolean));
  for (const label of [...set]) {
    if (label.startsWith('status:')) set.delete(label);
  }
  set.delete('agent:cursor');
  set.delete('handoff:ready');
  set.add('status:complete');
  return [...set].sort();
}

function stateFingerprint(state) {
  return JSON.stringify({
    sourceIssue: fingerprintIssue(state.sourceIssue),
    parentIssue: fingerprintIssue(state.parentIssue),
    successorIssue: fingerprintIssue(state.successorIssue),
    pullRequest: {
      number: Number(state.pullRequest?.number),
      state: state.pullRequest?.state || null,
      merged: state.pullRequest?.merged === true || Boolean(state.pullRequest?.merged_at),
      body: state.pullRequest?.body || '',
      headSha: normalizeSha(state.pullRequest?.head?.sha || state.pullRequest?.headSha),
      baseRef: state.pullRequest?.base?.ref || state.pullRequest?.baseRefName || null,
      mergeSha: normalizeSha(state.pullRequest?.merge_commit_sha || state.pullRequest?.mergeSha),
    },
    sourceComments: fingerprintComments(state.sourceComments),
    parentComments: fingerprintComments(state.parentComments),
    successorComments: fingerprintComments(state.successorComments),
    targetContainsIntegrationSha: state.targetContainsIntegrationSha === true,
  });
}

function fingerprintIssue(issue) {
  return {
    number: Number(issue?.number),
    state: String(issue?.state || '').toUpperCase(),
    title: issue?.title || '',
    body: issue?.body || '',
    labels: (issue?.labels || []).map(labelName).filter(Boolean).sort(),
  };
}

function fingerprintComments(comments = []) {
  return (comments || [])
    .map((comment) => ({
      id: String(comment?.id || comment?.databaseId || ''),
      author: commentAuthor(comment),
      body: String(comment?.body || comment?.bodyText || ''),
    }))
    .sort((a, b) => a.id.localeCompare(b.id));
}

function extractPrimaryIssueRefs(body) {
  const refs = [];
  for (const line of String(body || '').split(/\r?\n/)) {
    const normalized = line.replace(/^[>\s]*[-*+]\s+/, '').replace(/[`*_]+/g, ' ').trim();
    const match = normalized.match(/^Issue:\s*#(\d+)\b/i);
    if (match) refs.push(Number(match[1]));
  }
  return [...new Set(refs)];
}

function extractUncheckedAcceptance(body) {
  const lines = String(body || '').split(/\r?\n/);
  let active = false;
  const unchecked = [];
  for (const line of lines) {
    if (/^##\s+Acceptance criteria\b/i.test(line.trim())) {
      active = true;
      continue;
    }
    if (active && /^##\s+/.test(line.trim())) break;
    if (!active) continue;
    const match = line.match(/^\s*[-*]\s*\[([ xX])\]\s+(.+)$/);
    if (match && match[1].toLowerCase() !== 'x') unchecked.push(match[2].trim());
  }
  return unchecked;
}

function normalizeIssue(issue) {
  return {
    number: issue?.number,
    state: String(issue?.state || '').toUpperCase(),
    title: issue?.title || '',
    body: issue?.body || '',
    labels: (issue?.labels || []).map(labelName).filter(Boolean),
  };
}

function normalizeComment(comment) {
  return {
    id: String(comment?.id || ''),
    author: { login: comment?.user?.login || null },
    body: comment?.body || '',
    createdAt: comment?.created_at || null,
  };
}

function extractField(body, label) {
  const escaped = String(label).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = String(body || '').match(new RegExp(`^\\s*${escaped}\\s*:\\s*(.+?)\\s*$`, 'im'));
  return match?.[1]?.trim() || null;
}

function extractNumberField(body, label) {
  const match = String(extractField(body, label) || '').match(/#?(\d+)/);
  return match ? Number(match[1]) : null;
}

function labelName(label) {
  return typeof label === 'string' ? label : label?.name || '';
}

function commentAuthor(comment) {
  return normalizeAuthor(
    typeof comment?.author === 'string'
      ? comment.author
      : comment?.author?.login || comment?.user?.login || '',
  );
}

function normalizeAuthor(value) {
  return String(value || '').trim().toLowerCase();
}

function nonEmptyStrings(value) {
  return Array.isArray(value) && value.length > 0 && value.every((item) => typeof item === 'string' && item.trim());
}

function positiveInteger(value) {
  const number = Number(value);
  return Number.isInteger(number) && number > 0 ? number : null;
}

function normalizeSha(value) {
  const sha = String(value || '').trim().toLowerCase();
  return /^[0-9a-f]{7,40}$/.test(sha) ? sha : '';
}

function githubHeaders(token) {
  return {
    Authorization: `Bearer ${token}`,
    Accept: 'application/vnd.github+json',
    'Content-Type': 'application/json',
    'X-GitHub-Api-Version': '2022-11-28',
    'User-Agent': 'lgfc-closeout-successor-controller',
  };
}

function failClosed(code, message, details = {}) {
  return { ok: false, code, message, ...details };
}

function parseArgs(argv) {
  const out = {
    configPath: DEFAULT_CONFIG_PATH,
    repository: process.env.GITHUB_REPOSITORY || null,
    token: process.env.GITHUB_TOKEN || process.env.GH_TOKEN || null,
    sourceIssueNumber: null,
    prNumber: null,
    headSha: null,
    targetBranch: null,
    integrationSha: null,
    successorIssueNumber: null,
    outputPath: null,
  };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--config') out.configPath = argv[++i];
    else if (arg === '--repository') out.repository = argv[++i];
    else if (arg === '--source-issue') out.sourceIssueNumber = argv[++i];
    else if (arg === '--pr') out.prNumber = argv[++i];
    else if (arg === '--expected-head') out.headSha = argv[++i];
    else if (arg === '--target-branch') out.targetBranch = argv[++i];
    else if (arg === '--integration-sha') out.integrationSha = argv[++i];
    else if (arg === '--successor') out.successorIssueNumber = argv[++i];
    else if (arg === '--output') out.outputPath = argv[++i];
    else if (arg === '--help' || arg === '-h') out.help = true;
  }
  return out;
}

export async function main(argv = process.argv.slice(2)) {
  const args = parseArgs(argv);
  if (args.help) {
    process.stdout.write(
      'Usage: node scripts/agent-routing/lib/child-closeout.mjs --source-issue <n> --pr <n> --expected-head <sha> --target-branch <component/ref> --integration-sha <sha> --successor <n> [--output <json>]\n',
    );
    return 0;
  }
  const controllerConfig = JSON.parse(fs.readFileSync(args.configPath, 'utf8'));
  const result = await executeCloseoutSuccessorTransaction({
    repository: args.repository,
    sourceIssueNumber: args.sourceIssueNumber,
    prNumber: args.prNumber,
    headSha: args.headSha,
    targetBranch: args.targetBranch,
    integrationSha: args.integrationSha,
    successorIssueNumber: args.successorIssueNumber,
    config: controllerConfig.closeoutSuccessor,
    token: args.token,
  });
  const payload = `${JSON.stringify(result, null, 2)}\n`;
  if (args.outputPath) {
    fs.mkdirSync(path.dirname(args.outputPath), { recursive: true });
    fs.writeFileSync(args.outputPath, payload, 'utf8');
  } else {
    process.stdout.write(payload);
  }
  return result.ok ? 0 : 1;
}

const isDirect =
  process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isDirect) {
  main().then(
    (code) => {
      process.exitCode = code;
    },
    (error) => {
      process.stderr.write(`error: ${error instanceof Error ? error.message : String(error)}\n`);
      process.exitCode = 1;
    },
  );
}
