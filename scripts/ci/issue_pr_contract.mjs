#!/usr/bin/env node

// Issue-side PR contract parser/selector/validator for #2615/#2619.
//
// Marker syntax (docs/reference/ci/issue-pr-contract.md §1):
//
//   <!-- lgfc-issue-pr-contract:v1:rev=<n> -->
//   key: value
//   list_key:
//   - item
//   <!-- /lgfc-issue-pr-contract:v1 -->
//
// Validation-status marker (posted as one upserted Issue comment, never in
// the Issue body):
//
//   <!-- lgfc-issue-pr-contract-status:v1:<valid|invalid>:rev=<n> -->

import {
  CONTRACT_ERROR_CODES,
  CONTRACT_FIELDS,
  CONTRACT_LIST_FIELDS,
  CONTRACT_SCHEMA_VERSION,
  contractError,
} from './pr_contract.mjs';
import { parseAllowedFiles } from './pr_hygiene_audit.mjs';

const BLOCK_PATTERN = /<!--\s*lgfc-issue-pr-contract:v1:rev=(\d+)\s*-->([\s\S]*?)<!--\s*\/lgfc-issue-pr-contract:v1\s*-->/g;
const STATUS_PATTERN = /<!--\s*lgfc-issue-pr-contract-status:v1:(valid|invalid):rev=(\d+)\s*-->/;

export const CONTRACT_MARKER_PREFIX = 'lgfc-issue-pr-contract:v1';
export const CONTRACT_STATUS_MARKER_PREFIX = 'lgfc-issue-pr-contract-status:v1';

export function buildStatusMarker(state, rev) {
  return `<!-- ${CONTRACT_STATUS_MARKER_PREFIX}:${state}:rev=${rev} -->`;
}

function isPlaceholderValue(value = '') {
  const cleaned = String(value || '').trim();
  if (!cleaned) return true;
  if (cleaned.includes('____')) return true;
  if (/^<.+>$/.test(cleaned)) return true;
  if (/^(todo|tbd|placeholder)$/i.test(cleaned)) return true;
  return false;
}

/**
 * Find every lgfc-issue-pr-contract:v1 block in the given text. Returns raw
 * blocks only; does not validate field content.
 */
export function findContractBlocks(body = '') {
  const text = String(body || '');
  const blocks = [];
  let match;
  BLOCK_PATTERN.lastIndex = 0;
  while ((match = BLOCK_PATTERN.exec(text)) !== null) {
    blocks.push({
      rev: Number(match[1]),
      innerText: match[2],
      index: match.index,
    });
  }
  return blocks;
}

/**
 * Parse one contract block's inner markdown into structured fields. Pure
 * syntax parsing only — required/placeholder/enum checks happen in
 * validateIssuePrContract so this function stays reusable for dry-run
 * inspection of an incomplete contract.
 */
export function parseIssuePrContract(markdown = '') {
  const lines = String(markdown || '').split(/\r?\n/);
  const fields = {};
  const errors = [];
  const knownListFields = new Set(CONTRACT_LIST_FIELDS);

  let index = 0;
  while (index < lines.length) {
    const line = lines[index];
    const scalarMatch = line.match(/^\s*([a-z_]+):\s*(.*)$/);
    if (!scalarMatch) {
      index += 1;
      continue;
    }
    const [, key, inlineValue] = scalarMatch;

    if (knownListFields.has(key)) {
      const items = [];
      let cursor = index + 1;
      while (cursor < lines.length) {
        const itemMatch = lines[cursor].match(/^\s*[-*]\s+(.+?)\s*$/);
        if (!itemMatch) break;
        items.push(itemMatch[1].replace(/^`|`$/g, '').trim());
        cursor += 1;
      }
      fields[key] = items;
      index = cursor;
      continue;
    }

    fields[key] = inlineValue.trim();
    index += 1;
  }

  return { fields, errors };
}

/**
 * Select exactly one canonical contract block from the Issue body, and
 * surface the most recent validation-status comment (if any) for
 * staleness comparison. Does not itself run field validation.
 */
export function selectIssuePrContract({ issue = {}, comments = [], authorizedActors = [] } = {}) {
  const blocks = findContractBlocks(issue.body || '');
  const errors = [];

  let lastStatus = null;
  for (const comment of comments || []) {
    const match = String(comment.body || '').match(STATUS_PATTERN);
    if (match) {
      lastStatus = { state: match[1], rev: Number(match[2]), commentId: comment.id };
    }
  }

  if (blocks.length === 0) {
    errors.push(contractError(CONTRACT_ERROR_CODES.CONTRACT_MISSING, 'No lgfc-issue-pr-contract:v1 block found in the Issue body.'));
    return { ok: false, block: null, contract: null, lastStatus, errors };
  }

  if (blocks.length > 1) {
    errors.push(contractError(CONTRACT_ERROR_CODES.CONTRACT_DUPLICATE, 'More than one lgfc-issue-pr-contract:v1 block found.', {
      count: blocks.length,
    }));
    return { ok: false, block: null, contract: null, lastStatus, errors };
  }

  const block = blocks[0];
  const parsed = parseIssuePrContract(block.innerText);

  let authorized = true;
  if (Array.isArray(authorizedActors) && authorizedActors.length > 0 && issue.triggerActor) {
    authorized = authorizedActors.includes(issue.triggerActor);
    if (!authorized) {
      errors.push(contractError(CONTRACT_ERROR_CODES.UNAUTHORIZED_TRIGGER, `Actor ${issue.triggerActor} is not authorized to trigger contract validation.`, {
        actor: issue.triggerActor,
        authorizedActors,
      }));
    }
  }

  return {
    ok: authorized,
    block,
    contract: { rev: block.rev, fields: parsed.fields },
    lastStatus,
    errors,
  };
}

/**
 * Full field-level validation: required/placeholder/enum checks, scope
 * narrowing against the Issue's own allowlist, and stale-revision
 * detection against the last recorded validation-status comment.
 * liveState (all optional — supplied by the calling workflow from
 * GitHub-native evidence) covers head/base branch existence, diff
 * emptiness, and existing-PR detection.
 */
export function validateIssuePrContract({ issue = {}, contract = null, liveState = {} } = {}) {
  const errors = [];

  if (!contract) {
    errors.push(contractError(CONTRACT_ERROR_CODES.CONTRACT_MISSING, 'No parsed contract was supplied.'));
    return { ok: false, schemaVersion: CONTRACT_SCHEMA_VERSION, errors };
  }

  const fields = contract.fields || {};

  for (const field of CONTRACT_FIELDS) {
    if (field.source !== 'contract') continue;
    const value = fields[field.name];

    if (field.list) {
      if (field.required && (!Array.isArray(value) || value.length === 0)) {
        errors.push(contractError(CONTRACT_ERROR_CODES.FIELD_MISSING, `${field.name} is required and must be a non-empty list.`, { field: field.name }));
      }
      continue;
    }

    if (field.required && (value === undefined || value === '')) {
      errors.push(contractError(CONTRACT_ERROR_CODES.FIELD_MISSING, `${field.name} is required.`, { field: field.name }));
      continue;
    }

    if (value !== undefined && isPlaceholderValue(value)) {
      errors.push(contractError(CONTRACT_ERROR_CODES.FIELD_PLACEHOLDER, `${field.name} is a placeholder value.`, { field: field.name, value }));
      continue;
    }

    if (field.enum && value !== undefined && value !== '' && !field.enum.includes(value)) {
      errors.push(contractError(CONTRACT_ERROR_CODES.FIELD_INVALID, `${field.name} must be one of: ${field.enum.join(', ')}.`, { field: field.name, value, validValues: field.enum }));
    }
  }

  if (fields.out_of_scope_changes_present === 'YES' && (!fields.exception_issue || fields.exception_issue === 'not-applicable')) {
    errors.push(contractError(CONTRACT_ERROR_CODES.FIELD_MISSING, 'exception_issue is required when out_of_scope_changes_present is YES.', { field: 'exception_issue' }));
  }
  if (fields.follow_up_required === 'YES' && (!fields.follow_up_issue || fields.follow_up_issue === 'not-applicable')) {
    errors.push(contractError(CONTRACT_ERROR_CODES.FIELD_MISSING, 'follow_up_issue is required when follow_up_required is YES.', { field: 'follow_up_issue' }));
  }

  const issueAllowedPaths = parseAllowedFiles(issue.body || '');
  const contractAllowedPaths = Array.isArray(fields.allowed_paths) ? fields.allowed_paths : [];
  if (issueAllowedPaths.length > 0) {
    const widened = contractAllowedPaths.filter((path) => !issueAllowedPaths.includes(path));
    if (widened.length > 0) {
      errors.push(contractError(CONTRACT_ERROR_CODES.SCOPE_WIDENS_ISSUE_ALLOWLIST, 'Contract allowed_paths includes paths outside the Issue\'s own Scope allowlist.', {
        widened,
        issueAllowedPaths,
      }));
    }
  }

  if (liveState.lastValidatedRev !== undefined && liveState.lastValidatedRev !== contract.rev) {
    errors.push(contractError(CONTRACT_ERROR_CODES.STALE_REVISION, 'Last recorded validation revision does not match the current contract revision.', {
      lastValidatedRev: liveState.lastValidatedRev,
      currentRev: contract.rev,
    }));
  }

  if (liveState.headBranchExists === false) {
    errors.push(contractError(CONTRACT_ERROR_CODES.BRANCH_MISSING, `head_branch ${fields.head_branch || ''} does not exist.`, { field: 'head_branch' }));
  }
  if (liveState.hasDiff === false) {
    errors.push(contractError(CONTRACT_ERROR_CODES.DIFF_EMPTY, 'head_branch has no diff against base_branch.'));
  }
  if (liveState.openPrExists === true) {
    errors.push(contractError(CONTRACT_ERROR_CODES.PR_ALREADY_EXISTS, 'An open PR already exists for this source Issue/head-branch pair.'));
  }

  return {
    ok: errors.length === 0,
    schemaVersion: CONTRACT_SCHEMA_VERSION,
    primarySourceIssue: fields.primary_source_issue || issue.number || null,
    fields,
    rev: contract.rev,
    errors,
  };
}
