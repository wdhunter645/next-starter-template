#!/usr/bin/env node

// Advisory Issue PR-contract validation for #2615/#2620.
//
// Orchestrates #2619's shared modules (issue_pr_contract.mjs, pr_contract.mjs)
// into the full request-level evaluation `status:pr-ready` requires: issue
// open-state, marker version support, contract selection/validation, delivery
// profile, base/head syntax, and live-state re-check immediately before any
// mutation. This module is read-only — it returns a result; it never calls
// the GitHub API. The workflow (.github/workflows/issue-pr-contract-validate.yml)
// owns evidence gathering and the label/comment mutation.

import fs from 'node:fs';
import { selectIssuePrContract, validateIssuePrContract } from './issue_pr_contract.mjs';
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
 * Full advisory evaluation for one `status:pr-ready` request.
 *
 * @param {object} args
 * @param {{number:number, body:string, state:string, triggerActor?:string}} args.issue
 * @param {Array} args.comments - Issue comments (for status-marker/staleness lookup).
 * @param {string[]} args.authorizedActors
 * @param {object} args.liveState - headBranchExists, hasDiff, openPrExists, lastValidatedRev.
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
    return { ok: false, errors, contract: null, rev: null };
  }

  const versionedMarkers = findVersionedContractMarkers(issue.body || '');
  const unsupported = versionedMarkers.filter((marker) => marker.version !== SUPPORTED_MARKER_VERSION);
  if (unsupported.length > 0 && versionedMarkers.length === unsupported.length) {
    errors.push(contractError(VALIDATE_ERROR_CODES.MARKER_VERSION_UNSUPPORTED, `Only marker version ${SUPPORTED_MARKER_VERSION} is supported.`, {
      foundVersions: [...new Set(unsupported.map((marker) => marker.version))],
    }));
    return { ok: false, errors, contract: null, rev: null };
  }

  const selection = selectIssuePrContract({ issue, comments, authorizedActors });
  if (!selection.ok) {
    return { ok: false, errors: selection.errors, contract: selection.contract, rev: selection.contract?.rev ?? null };
  }

  const validated = validateIssuePrContract({ issue, contract: selection.contract, liveState });
  if (!validated.ok) {
    return { ok: false, errors: validated.errors, contract: selection.contract, rev: selection.contract.rev };
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

  if (liveState.raceDetected === true) {
    errors.push(contractError(VALIDATE_ERROR_CODES.LIVE_STATE_CHANGED, 'Live Issue/label/PR state changed since this evaluation began; re-run required.'));
  }

  return {
    ok: errors.length === 0,
    errors,
    contract: selection.contract,
    rev: selection.contract.rev,
    fields,
    deliveryProfile,
    primarySourceIssue: validated.primarySourceIssue,
  };
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

if (import.meta.url === `file://${process.argv[1]}`) {
  process.exitCode = runCli();
}
