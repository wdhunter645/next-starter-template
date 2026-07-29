#!/usr/bin/env node

// Advisory Issue PR-contract validation for #2615/#2620.
//
// Orchestrates #2619's shared modules (issue_pr_contract.mjs, pr_contract.mjs)
// into the full request-level evaluation `status:pr-ready` requires: issue
// open-state, marker version support, contract selection/validation, delivery
// profile, and base/head syntax. This module is read-only — it returns a
// result computed from one snapshot; it never calls the GitHub API and cannot
// itself detect a race against its own snapshot. The workflow's mutate job
// (.github/workflows/issue-pr-contract-validate.yml) re-reads live Issue/label
// state immediately before mutating and skips cleanly (VALIDATE_ERROR_CODES.
// LIVE_STATE_CHANGED) if it no longer matches what evaluate saw, rather than
// this module guessing at staleness from a single evaluation pass.

import fs from 'node:fs';
import { findContractBlocks, selectIssuePrContract, validateIssuePrContract } from './issue_pr_contract.mjs';
import { CONTRACT_ERROR_CODES, contractError } from './pr_contract.mjs';
import { classifyDeliveryProfile } from './delivery_profile.mjs';

const VERSIONED_BLOCK_PATTERN = /<!--\s*lgfc-issue-pr-contract:v(\d+):rev=(\d+)\s*-->/g;
const SUPPORTED_MARKER_VERSION = 1;

// Additive to CONTRACT_ERROR_CODES (#2618/#2619). Where #2620's own Issue
// text names a concept #2619 already implements under a different code name,
// this module emits the #2619 canonical code (single source of truth) rather
// than forking a parallel vocabulary; the mapping is documented in
// docs/reference/ci/issue-pr-contract.md.
export const VALIDATE_ERROR_CODES = Object.freeze({
  ...CONTRACT_ERROR_CODES,
  MARKER_VERSION_UNSUPPORTED: 'contract_marker_version_unsupported',
  DELIVERY_PROFILE_INVALID: 'delivery_profile_invalid',
  ISSUE_NOT_OPEN: 'issue_not_open',
  BASE_HEAD_INVALID: 'base_head_invalid',
  // Not emitted by evaluateIssuePrContractRequest (a single-snapshot function
  // cannot detect its own staleness). Detected and acted on only by the
  // workflow's mutate job pre-mutation re-check; kept here as the shared
  // constant/name so the workflow and docs reference one canonical string.
  LIVE_STATE_CHANGED: 'live_state_changed',
});

/**
 * Detect every `lgfc-issue-pr-contract:v<n>` marker regardless of version, so
 * an unsupported version produces a distinct, honest error instead of being
 * silently treated as "missing" by the v1-only parser in issue_pr_contract.mjs.
 */
export function findVersionedContractMarkers(body = '') {
  const text = String(body || '');
  const markers = [];
  let match;
  VERSIONED_BLOCK_PATTERN.lastIndex = 0;
  while ((match = VERSIONED_BLOCK_PATTERN.exec(text)) !== null) {
    markers.push({ version: Number(match[1]), rev: Number(match[2]) });
  }
  return markers;
}

function isComponentOrMainRef(ref = '') {
  return ref === 'main' || /^component\/[^/].*/.test(String(ref || ''));
}

/**
 * Syntactic base/head validation only — does not decide profile-transition
 * legality (that remains classifyDeliveryProfile's job). Catches empty,
 * identical, or structurally invalid branch names before any live lookup.
 */
export function validateBaseHeadSyntax({ headBranch = '', baseBranch = '' } = {}) {
  const errors = [];
  if (!headBranch || !baseBranch) {
    errors.push(contractError(VALIDATE_ERROR_CODES.BASE_HEAD_INVALID, 'head_branch and base_branch are both required.'));
    return errors;
  }
  if (headBranch === baseBranch) {
    errors.push(contractError(VALIDATE_ERROR_CODES.BASE_HEAD_INVALID, 'head_branch and base_branch must not be identical.', {
      headBranch,
      baseBranch,
    }));
  }
  if (!isComponentOrMainRef(baseBranch)) {
    errors.push(contractError(VALIDATE_ERROR_CODES.BASE_HEAD_INVALID, 'base_branch must be component/** or main.', {
      baseBranch,
    }));
  }
  return errors;
}

/**
 * Build the decision-critical live-state snapshot an evaluation was based
 * on, so the mutate job can re-fetch the same facts immediately before
 * mutating and detect drift (a new commit, an opened PR, an edited
 * contract) instead of only checking issue-open/label state.
 */
export function buildLiveSnapshot({ contractBlockText = null, contractRev = null, liveState = {} } = {}) {
  return {
    contractRev,
    contractBlockText,
    headSha: liveState.headSha ?? null,
    baseSha: liveState.baseSha ?? null,
    hasDiff: liveState.hasDiff ?? null,
    changedFiles: Array.isArray(liveState.changedFiles) ? [...liveState.changedFiles].sort() : null,
    openPrExists: liveState.openPrExists ?? null,
  };
}

/**
 * Full advisory evaluation for one `status:pr-ready` request.
 *
 * @param {object} args
 * @param {{number:number, body:string, state:string, triggerActor?:string}} args.issue
 * @param {Array} args.comments - Issue comments (for status-marker/staleness lookup).
 * @param {string[]} args.authorizedActors
 * @param {object} args.liveState - headBranchExists, headSha, baseSha, hasDiff, changedFiles, openPrExists, lastValidatedRev.
 */
export function evaluateIssuePrContractRequest({
  issue = {},
  comments = [],
  authorizedActors = [],
  liveState = {},
} = {}) {
  const errors = [];

  if (issue.state && issue.state !== 'open') {
    errors.push(contractError(VALIDATE_ERROR_CODES.ISSUE_NOT_OPEN, `Issue #${issue.number} is not open.`, {
      state: issue.state,
    }));
    return { ok: false, errors, contract: null, rev: null, liveSnapshot: buildLiveSnapshot({ liveState }) };
  }

  const versionedMarkers = findVersionedContractMarkers(issue.body || '');
  const unsupported = versionedMarkers.filter((marker) => marker.version !== SUPPORTED_MARKER_VERSION);
  if (unsupported.length > 0) {
    // Fail closed whenever ANY unsupported-version marker is present, even
    // alongside a valid v1 block — a body cannot be allowed to silently
    // select v1 and ignore a conflicting/ambiguous future-version marker.
    errors.push(contractError(VALIDATE_ERROR_CODES.MARKER_VERSION_UNSUPPORTED, `Only marker version ${SUPPORTED_MARKER_VERSION} is supported.`, {
      foundVersions: [...new Set(unsupported.map((marker) => marker.version))],
    }));
    return { ok: false, errors, contract: null, rev: null, liveSnapshot: buildLiveSnapshot({ liveState }) };
  }

  const selection = selectIssuePrContract({ issue, comments, authorizedActors });
  if (!selection.ok) {
    return {
      ok: false,
      errors: selection.errors,
      contract: selection.contract,
      rev: selection.contract?.rev ?? null,
      liveSnapshot: buildLiveSnapshot({
        contractBlockText: selection.block?.innerText ?? null,
        contractRev: selection.contract?.rev ?? null,
        liveState,
      }),
    };
  }

  const liveSnapshot = buildLiveSnapshot({
    contractBlockText: selection.block.innerText,
    contractRev: selection.contract.rev,
    liveState,
  });

  const validated = validateIssuePrContract({ issue, contract: selection.contract, liveState });
  if (!validated.ok) {
    return { ok: false, errors: validated.errors, contract: selection.contract, rev: selection.contract.rev, liveSnapshot };
  }

  const fields = validated.fields;
  const deliveryProfile = classifyDeliveryProfile({
    baseRef: fields.base_branch,
    headRef: fields.head_branch,
    body: issue.body || '',
    changedFiles: Array.isArray(liveState.changedFiles) ? liveState.changedFiles : undefined,
  });
  if (deliveryProfile.errors.length > 0) {
    errors.push(contractError(VALIDATE_ERROR_CODES.DELIVERY_PROFILE_INVALID, 'Delivery profile classification failed.', {
      deliveryErrors: deliveryProfile.errors,
    }));
  }

  errors.push(...validateBaseHeadSyntax({ headBranch: fields.head_branch, baseBranch: fields.base_branch }));

  return {
    ok: errors.length === 0,
    errors,
    contract: selection.contract,
    rev: selection.contract.rev,
    fields,
    deliveryProfile,
    primarySourceIssue: validated.primarySourceIssue,
    liveSnapshot,
  };
}

/**
 * Compare a fresh live-state snapshot (re-read by the mutate job immediately
 * before mutating) against the snapshot an evaluation was based on. Returns
 * the list of changed field names, or an empty array if nothing decision-
 * critical drifted. Any non-empty result means the workflow must skip
 * mutation (VALIDATE_ERROR_CODES.LIVE_STATE_CHANGED) rather than publish a
 * result computed against state that no longer holds.
 */
export function detectLiveStateDrift(evaluatedSnapshot = {}, freshSnapshot = {}) {
  const changed = [];
  const fields = ['contractRev', 'contractBlockText', 'headSha', 'baseSha', 'hasDiff', 'openPrExists'];
  for (const field of fields) {
    if (JSON.stringify(evaluatedSnapshot[field] ?? null) !== JSON.stringify(freshSnapshot[field] ?? null)) {
      changed.push(field);
    }
  }
  const evaluatedFiles = JSON.stringify(evaluatedSnapshot.changedFiles ?? null);
  const freshFiles = JSON.stringify(freshSnapshot.changedFiles ?? null);
  if (evaluatedFiles !== freshFiles) {
    changed.push('changedFiles');
  }
  return changed;
}

function readJsonFile(filePath, fallback) {
  if (!filePath || !fs.existsSync(filePath)) return fallback;
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

/**
 * CLI entrypoint. Reads issue/comments/live-state JSON files and the
 * authorized-actors list, writes the evaluation result as JSON. Never calls
 * the GitHub API — the calling workflow job is read-only by design (#2620
 * requirement 9); a separate job performs the comment/label mutation.
 */
export function runCli(env = process.env) {
  const issue = readJsonFile(env.ISSUE_PR_CONTRACT_ISSUE_JSON, null);
  if (!issue) {
    console.error('ISSUE_PR_CONTRACT_ISSUE_JSON is required and must point to an existing file.');
    return 2;
  }
  const comments = readJsonFile(env.ISSUE_PR_CONTRACT_COMMENTS_JSON, []);
  const authorizedActors = readJsonFile(env.ISSUE_PR_CONTRACT_AUTHORIZED_ACTORS_JSON, []);
  const liveState = readJsonFile(env.ISSUE_PR_CONTRACT_LIVE_STATE_JSON, {});

  const result = evaluateIssuePrContractRequest({ issue, comments, authorizedActors, liveState });

  const resultPath = env.ISSUE_PR_CONTRACT_RESULT_JSON;
  if (resultPath) {
    fs.writeFileSync(resultPath, `${JSON.stringify(result, null, 2)}\n`);
  }
  console.log(JSON.stringify(result, null, 2));
  return 0;
}

/**
 * Drift-check CLI entrypoint, run by the mutate job's pre-mutation re-check
 * step. Re-derives a fresh live-state snapshot from GitHub-native evidence
 * the workflow just re-fetched (fresh issue state/labels/body, fresh
 * branch SHAs/diff/PR-existence) and compares it against the liveSnapshot
 * an earlier evaluate-job run computed. Any decision-critical drift, an
 * issue no longer open, or the trigger label already removed means the
 * workflow must skip mutation (VALIDATE_ERROR_CODES.LIVE_STATE_CHANGED)
 * rather than act on a stale decision. Never calls the GitHub API itself —
 * purely a comparison over JSON the calling workflow step already fetched.
 */
export function runDriftCheckCli(env = process.env) {
  const evaluatedResult = readJsonFile(env.ISSUE_PR_CONTRACT_RESULT_JSON, null);
  if (!evaluatedResult) {
    console.error('ISSUE_PR_CONTRACT_RESULT_JSON is required and must point to an existing file.');
    return 2;
  }
  const freshIssue = readJsonFile(env.ISSUE_PR_CONTRACT_FRESH_ISSUE_JSON, null);
  if (!freshIssue) {
    console.error('ISSUE_PR_CONTRACT_FRESH_ISSUE_JSON is required and must point to an existing file.');
    return 2;
  }
  const freshLiveState = readJsonFile(env.ISSUE_PR_CONTRACT_FRESH_LIVE_STATE_JSON, {});

  const reasons = [];

  if (freshIssue.state && freshIssue.state !== 'open') {
    reasons.push('issue_not_open');
  }
  if (Array.isArray(freshIssue.labels) && !freshIssue.labels.includes('status:pr-ready')) {
    reasons.push('trigger_label_removed');
  }

  const freshBlocks = findContractBlocks(freshIssue.body || '');
  const freshBlock = freshBlocks.length === 1 ? freshBlocks[0] : null;
  const freshSnapshot = buildLiveSnapshot({
    contractBlockText: freshBlock ? freshBlock.innerText : null,
    contractRev: freshBlock ? freshBlock.rev : null,
    liveState: freshLiveState,
  });

  const drift = detectLiveStateDrift(evaluatedResult.liveSnapshot || {}, freshSnapshot);
  for (const field of drift) {
    reasons.push(`live_state_changed:${field}`);
  }

  const result = { proceed: reasons.length === 0, reasons };

  const outputPath = env.ISSUE_PR_CONTRACT_DRIFT_OUTPUT_JSON;
  if (outputPath) {
    fs.writeFileSync(outputPath, `${JSON.stringify(result, null, 2)}\n`);
  }
  console.log(JSON.stringify(result, null, 2));
  return 0;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  process.exitCode = process.env.ISSUE_PR_CONTRACT_MODE === 'drift-check' ? runDriftCheckCli() : runCli();
}
