import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

import {
  evaluateIssuePrContractRequest,
  findVersionedContractMarkers,
  validateBaseHeadSyntax,
  VALIDATE_ERROR_CODES,
} from '../scripts/ci/issue_pr_contract_validate.mjs';
import {
  findExistingValidationComment,
  renderValidationComment,
} from '../scripts/ci/issue_pr_contract_comment.mjs';
import { CONTRACT_STATUS_MARKER_PREFIX } from '../scripts/ci/issue_pr_contract.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const EVENTS_DIR = path.join(__dirname, 'fixtures/issue-pr-contract/events');

function readEvent(name) {
  return JSON.parse(fs.readFileSync(path.join(EVENTS_DIR, name), 'utf8'));
}

function toIssue(event) {
  return {
    number: event.issueNumber,
    body: event.issueBody,
    state: event.issueState,
    triggerActor: event.triggerActor,
  };
}

function toLiveState(event, overrides = {}) {
  return {
    headBranchExists: true,
    hasDiff: true,
    openPrExists: false,
    changedFiles: event.changedFiles,
    ...overrides,
  };
}

describe('evaluateIssuePrContractRequest (#2620)', () => {
  it('passes a complete, authorized, in-scope request', () => {
    const event = readEvent('valid-request.json');
    const result = evaluateIssuePrContractRequest({
      issue: toIssue(event),
      comments: event.comments,
      authorizedActors: event.authorizedActors,
      liveState: toLiveState(event),
    });
    expect(result.ok).toBe(true);
    expect(result.errors).toEqual([]);
    expect(result.primarySourceIssue).toBe(event.issueNumber);
    expect(result.fields.head_branch).toBe(event.headBranch);
  });

  it('fails deterministically for an unauthorized trigger actor', () => {
    const event = readEvent('unauthorized-actor.json');
    const result = evaluateIssuePrContractRequest({
      issue: toIssue(event),
      comments: event.comments,
      authorizedActors: event.authorizedActors,
      liveState: toLiveState(event),
    });
    expect(result.ok).toBe(false);
    expect(result.errors[0].code).toBe('contract_unauthorized_trigger');
  });

  it('fails contract_marker_version_unsupported for a future marker version', () => {
    const event = readEvent('unsupported-version.json');
    const result = evaluateIssuePrContractRequest({
      issue: toIssue(event),
      comments: event.comments,
      authorizedActors: event.authorizedActors,
      liveState: {},
    });
    expect(result.ok).toBe(false);
    expect(result.errors[0].code).toBe(VALIDATE_ERROR_CODES.MARKER_VERSION_UNSUPPORTED);
  });

  it('fails issue_not_open for a closed issue before any contract parsing', () => {
    const event = readEvent('issue-closed.json');
    const result = evaluateIssuePrContractRequest({
      issue: toIssue(event),
      comments: event.comments,
      authorizedActors: event.authorizedActors,
      liveState: {},
    });
    expect(result.ok).toBe(false);
    expect(result.errors[0].code).toBe(VALIDATE_ERROR_CODES.ISSUE_NOT_OPEN);
  });

  it('fails delivery_profile_invalid when reused PMO fields do not satisfy delivery_profile.mjs invariants', () => {
    const event = readEvent('delivery-profile-invalid.json');
    const result = evaluateIssuePrContractRequest({
      issue: toIssue(event),
      comments: event.comments,
      authorizedActors: event.authorizedActors,
      liveState: toLiveState(event),
    });
    expect(result.ok).toBe(false);
    expect(result.errors.some((error) => error.code === VALIDATE_ERROR_CODES.DELIVERY_PROFILE_INVALID)).toBe(true);
  });

  it('fails live_state_changed when the workflow detects a race before mutation', () => {
    const event = readEvent('valid-request.json');
    const result = evaluateIssuePrContractRequest({
      issue: toIssue(event),
      comments: event.comments,
      authorizedActors: event.authorizedActors,
      liveState: toLiveState(event, { raceDetected: true }),
    });
    expect(result.ok).toBe(false);
    expect(result.errors.some((error) => error.code === VALIDATE_ERROR_CODES.LIVE_STATE_CHANGED)).toBe(true);
  });
});

describe('findVersionedContractMarkers (#2620)', () => {
  it('detects version and revision independent of the v1-only parser', () => {
    const markers = findVersionedContractMarkers('<!-- lgfc-issue-pr-contract:v3:rev=7 -->\nfoo\n<!-- /lgfc-issue-pr-contract:v3 -->');
    expect(markers).toEqual([{ version: 3, rev: 7 }]);
  });
});

describe('validateBaseHeadSyntax (#2620)', () => {
  it('passes a valid component base with a distinct head', () => {
    expect(validateBaseHeadSyntax({ headBranch: 'cursor/1-x', baseBranch: 'component/example' })).toEqual([]);
  });

  it('fails when head and base are identical', () => {
    const errors = validateBaseHeadSyntax({ headBranch: 'component/example', baseBranch: 'component/example' });
    expect(errors.some((error) => error.code === VALIDATE_ERROR_CODES.BASE_HEAD_INVALID)).toBe(true);
  });

  it('fails when base is neither component/** nor main', () => {
    const errors = validateBaseHeadSyntax({ headBranch: 'cursor/1-x', baseBranch: 'feature/random' });
    expect(errors.some((error) => error.code === VALIDATE_ERROR_CODES.BASE_HEAD_INVALID)).toBe(true);
  });
});

describe('issue_pr_contract_comment (#2620)', () => {
  it('renders a valid-state comment with the correct marker and no error list', () => {
    const event = readEvent('valid-request.json');
    const result = evaluateIssuePrContractRequest({
      issue: toIssue(event),
      comments: event.comments,
      authorizedActors: event.authorizedActors,
      liveState: toLiveState(event),
    });
    const body = renderValidationComment(result);
    expect(body).toContain(`${CONTRACT_STATUS_MARKER_PREFIX}:valid:rev=1`);
    expect(body).toContain('Primary source Issue: #9101');
  });

  it('renders an invalid-state comment listing every failing code', () => {
    const event = readEvent('unauthorized-actor.json');
    const result = evaluateIssuePrContractRequest({
      issue: toIssue(event),
      comments: event.comments,
      authorizedActors: event.authorizedActors,
      liveState: toLiveState(event),
    });
    const body = renderValidationComment(result);
    expect(body).toContain('contract_unauthorized_trigger');
    expect(body).toContain('trigger label has been removed');
  });

  it('finds the single existing status comment for upsert, ignoring unrelated comments', () => {
    const comments = [
      { id: 1, created_at: '2026-01-01T00:00:00Z', body: 'unrelated discussion' },
      { id: 2, created_at: '2026-01-02T00:00:00Z', body: `${CONTRACT_STATUS_MARKER_PREFIX}:invalid:rev=1\nold report` },
    ];
    const found = findExistingValidationComment(comments);
    expect(found.id).toBe(2);
  });

  it('resolves to the most recent match when more than one status comment exists (non-idempotent prior run)', () => {
    const comments = [
      { id: 1, created_at: '2026-01-01T00:00:00Z', body: `${CONTRACT_STATUS_MARKER_PREFIX}:invalid:rev=1` },
      { id: 2, created_at: '2026-01-03T00:00:00Z', body: `${CONTRACT_STATUS_MARKER_PREFIX}:valid:rev=2` },
    ];
    const found = findExistingValidationComment(comments);
    expect(found.id).toBe(2);
  });

  it('returns null when no status comment exists yet', () => {
    expect(findExistingValidationComment([{ id: 1, created_at: '2026-01-01T00:00:00Z', body: 'unrelated' }])).toBeNull();
  });
});
