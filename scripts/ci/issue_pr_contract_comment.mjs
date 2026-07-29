#!/usr/bin/env node

// Renders and locates the upserted validation-status comment for #2620.
//
// Ownership split: issue_pr_contract_validate.mjs decides whether a request
// is valid; this module turns that decision into the exact comment body and
// finds the one existing comment (if any) that must be updated in place, so
// the calling workflow never creates duplicate feedback comments.

import { buildStatusMarker, CONTRACT_STATUS_MARKER_PREFIX } from './issue_pr_contract.mjs';

/**
 * Find the single upserted validation-status comment among an Issue's
 * comments, if one already exists. Multiple matches (should not happen under
 * correct upsert behavior) resolve to the most recent one; the workflow
 * should treat any additional matches as evidence of a prior non-idempotent
 * run and log it, but must still update only the most recent.
 */
export function findExistingValidationComment(comments = []) {
  const matches = (comments || []).filter((comment) => String(comment.body || '').includes(CONTRACT_STATUS_MARKER_PREFIX));
  if (matches.length === 0) return null;
  return matches.reduce((latest, comment) => {
    if (!latest) return comment;
    return new Date(comment.created_at) > new Date(latest.created_at) ? comment : latest;
  }, null);
}

/**
 * Build the exact upserted status-marker + human-readable body for one
 * evaluation result from issue_pr_contract_validate.mjs.
 */
export function renderValidationComment(result) {
  const state = result.ok ? 'valid' : 'invalid';
  const marker = result.rev != null
    ? buildStatusMarker(state, result.rev)
    : `<!-- ${CONTRACT_STATUS_MARKER_PREFIX}:${state} -->`;

  if (result.ok) {
    return [
      marker,
      '## Issue PR-Contract Validation',
      '',
      'Contract is complete, in-scope, and ready. A revision-bound plan preview follows.',
      '',
      '```text',
      `Primary source Issue: #${result.primarySourceIssue}`,
      `Head branch: ${result.fields.head_branch}`,
      `Base branch: ${result.fields.base_branch}`,
      `Intent label: ${result.fields.intent_label}`,
      `PR class: ${result.fields.pr_class}`,
      '```',
      '',
      'This is advisory validation only. No branch or PR was created.',
    ].join('\n');
  }

  const lines = [
    marker,
    '## Issue PR-Contract Validation',
    '',
    'Validation failed. Correct the listed fields, bump the contract revision, and reapply the trigger label.',
    '',
  ];
  for (const error of result.errors) {
    lines.push(`- \`${error.code}\`: ${error.message}`);
  }
  lines.push('', 'This is advisory validation only. No branch or PR was created; the trigger label has been removed.');
  return lines.join('\n');
}
