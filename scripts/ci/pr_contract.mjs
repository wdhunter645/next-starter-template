#!/usr/bin/env node

// Shared stable-facts contract authority for #2615/#2619.
//
// This module owns no field rules of its own where an existing module
// already owns them. It re-exports and combines:
//   - scripts/ci/pr_hygiene_audit.mjs   (PR class enum, template sections, allowlist parsing)
//   - scripts/ci/delivery_profile.mjs   (delivery/profile enums and classification)
//   - scripts/ci/diff_scope_gate.mjs    (scope/allowlist-vs-diff comparison)
//
// Issue-side contract validation (issue_pr_contract.mjs) and PR-body
// generation (pr_body_renderer.mjs) both import from here instead of
// redeclaring field rules, per docs/reference/ci/issue-pr-contract.md.

import {
  REQUIRED_TEMPLATE_SECTIONS,
  VALID_PR_CLASSES,
  buildPrHygieneReport,
} from './pr_hygiene_audit.mjs';
import {
  APPROVAL_PROFILES,
  CHANGE_MODES,
  DELIVERY_MODELS,
  GATE_PROFILES,
  ROLLBACK_PROFILES,
  TARGET_ENVIRONMENTS,
  WORK_SIZES,
  classifyDeliveryProfile,
} from './delivery_profile.mjs';
import { buildDiffScopeReport } from './diff_scope_gate.mjs';

export { REQUIRED_TEMPLATE_SECTIONS, VALID_PR_CLASSES };
export {
  APPROVAL_PROFILES,
  CHANGE_MODES,
  DELIVERY_MODELS,
  GATE_PROFILES,
  ROLLBACK_PROFILES,
  TARGET_ENVIRONMENTS,
  WORK_SIZES,
};

export const CONTRACT_SCHEMA_VERSION = 1;

// Field catalog per docs/reference/ci/issue-pr-contract.md §2.
// source: 'contract' (authored in the marked block), 'reuse' (read from the
// Issue's existing PMO-intake block via delivery_profile.mjs), or
// 'generated' (never authored; computed at validation/render time).
export const CONTRACT_FIELDS = Object.freeze([
  { name: 'primary_source_issue', source: 'generated' },
  { name: 'purpose', source: 'contract', required: true },
  { name: 'intent_label', source: 'contract', required: true },
  { name: 'pr_class', source: 'contract', required: true, enum: VALID_PR_CLASSES },
  { name: 'size', source: 'reuse' },
  { name: 'delivery_model', source: 'reuse' },
  { name: 'change_mode', source: 'reuse' },
  { name: 'target_environment', source: 'reuse' },
  { name: 'approval_profile', source: 'reuse' },
  { name: 'gate_profile', source: 'reuse' },
  { name: 'rollback_profile', source: 'reuse' },
  { name: 'component_branch', source: 'reuse' },
  { name: 'component_master', source: 'reuse' },
  { name: 'promotion_pr', source: 'reuse' },
  { name: 'allowed_paths', source: 'contract', required: true, list: true },
  { name: 'out_of_scope_changes_present', source: 'contract', required: true, enum: ['YES', 'NO'] },
  { name: 'exception_issue', source: 'contract' },
  { name: 'change_summary', source: 'contract', required: true },
  { name: 'verification_commands', source: 'contract', required: true, list: true },
  { name: 'verification_results', source: 'contract', required: true },
  { name: 'follow_up_required', source: 'contract', required: true, enum: ['YES', 'NO'] },
  { name: 'follow_up_issue', source: 'contract' },
  { name: 'rollback_summary', source: 'contract', required: true },
  { name: 'head_branch', source: 'contract', required: true },
  { name: 'base_branch', source: 'contract', required: true },
]);

export const CONTRACT_LIST_FIELDS = Object.freeze(
  CONTRACT_FIELDS.filter((field) => field.list).map((field) => field.name),
);

export const CONTRACT_AUTHORED_FIELDS = Object.freeze(
  CONTRACT_FIELDS.filter((field) => field.source === 'contract').map((field) => field.name),
);

// Deterministic error codes per docs/reference/ci/issue-pr-contract.md §5.
export const CONTRACT_ERROR_CODES = Object.freeze({
  CONTRACT_MISSING: 'contract_missing',
  CONTRACT_DUPLICATE: 'contract_duplicate',
  FIELD_MISSING: 'contract_field_missing',
  FIELD_PLACEHOLDER: 'contract_field_placeholder',
  FIELD_INVALID: 'contract_field_invalid',
  SCOPE_WIDENS_ISSUE_ALLOWLIST: 'contract_scope_widens_issue_allowlist',
  UNAUTHORIZED_TRIGGER: 'contract_unauthorized_trigger',
  STALE_REVISION: 'contract_stale_revision',
  BRANCH_MISSING: 'branch_missing',
  DIFF_EMPTY: 'diff_empty',
  PR_ALREADY_EXISTS: 'pr_already_exists',
  TEMPLATE_MISMATCH: 'template_mismatch',
});

export function contractError(code, message, details = {}) {
  return { code, message, ...details };
}

/**
 * Validate a rendered PR body the same way live PRs are validated: the
 * hygiene parser, the diff-scope comparison, and delivery-profile
 * classification. #2619 acceptance requires round-trip fixtures to pass
 * this exact combination, not a parallel rule set.
 */
export function validateRenderedPrBody({ body = '', baseRef = '', headRef = '', changedFiles = [] } = {}) {
  const hygiene = buildPrHygieneReport({ body, changedFiles });
  const scope = buildDiffScopeReport({ body, changedFiles });
  const delivery = classifyDeliveryProfile({ baseRef, headRef, body, changedFiles });

  const errors = [];
  if (!hygiene.isClean) {
    errors.push(contractError(CONTRACT_ERROR_CODES.TEMPLATE_MISMATCH, 'Rendered body fails PR hygiene validation.', {
      hygiene,
    }));
  }
  if (delivery.errors.length > 0) {
    errors.push(contractError(CONTRACT_ERROR_CODES.TEMPLATE_MISMATCH, 'Rendered body fails delivery-profile classification.', {
      deliveryErrors: delivery.errors,
    }));
  }

  return {
    schemaVersion: CONTRACT_SCHEMA_VERSION,
    ok: errors.length === 0,
    hygiene,
    scope,
    delivery,
    errors,
  };
}
