#!/usr/bin/env node

// Renders and locates the upserted validation-status comment for #2620.
//
// Ownership split: issue_pr_contract_validate.mjs decides whether a request
// is valid; this module turns that decision into the exact comment body and
// finds the one existing comment (if any) that must be updated in place, so
// the calling workflow never creates duplicate feedback comments.

import fs from 'node:fs';
import { buildStatusMarker, CONTRACT_STATUS_MARKER_PREFIX } from './issue_pr_contract.mjs';

export { CONTRACT_STATUS_MARKER_PREFIX };

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

function readJsonFile(filePath, fallback) {
  if (!filePath || !fs.existsSync(filePath)) return fallback;
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

/**
 * CLI entrypoint. Reads an evaluation result and a fresh comments list
 * (fetched by the workflow immediately before mutation, per the re-read-
 * before-mutate rule), writes { body, existingCommentId, removeLabel }.
 * Never calls the GitHub API — the calling workflow step performs the
 * actual create/update/removeLabel calls using this output, so the
 * marker/render/find logic has exactly one implementation.
 */
export function runCli(env = process.env) {
  const result = readJsonFile(env.ISSUE_PR_CONTRACT_RESULT_JSON, null);
  if (!result) {
    console.error('ISSUE_PR_CONTRACT_RESULT_JSON is required and must point to an existing file.');
    return 2;
  }
  const comments = readJsonFile(env.ISSUE_PR_CONTRACT_COMMENTS_JSON, []);

  const existing = findExistingValidationComment(comments);
  const output = {
    body: renderValidationComment(result),
    existingCommentId: existing ? existing.id : null,
    removeLabel: result.ok !== true,
  };

  const outputPath = env.ISSUE_PR_CONTRACT_COMMENT_OUTPUT_JSON;
  if (outputPath) {
    fs.writeFileSync(outputPath, `${JSON.stringify(output, null, 2)}\n`);
  }
  console.log(JSON.stringify(output, null, 2));
  return 0;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  process.exitCode = runCli();
}
