import { buildStatusMarker } from '../ci/issue_pr_contract.mjs';
import { renderPrBody } from '../ci/pr_body_renderer.mjs';
import { validateRenderedPrBody } from '../ci/pr_contract.mjs';

const ALLOWED_MUTATIONS = new Set([
  'set_labels',
  'post_comment',
  'rerun_failed_job',
  'merge_pr',
  'close_issue',
  'create_issue',
  'create_draft_pr',
  'update_contract_comment',
]);

const DRAFT_PR_REQUIRED_FIELDS = ['issue', 'headBranch', 'baseBranch', 'expectedHeadSha', 'expectedBaseSha', 'contractRev'];

export function validateMutation(mutation, liveState) {
  if (!mutation || !ALLOWED_MUTATIONS.has(mutation.type)) return { ok: false, reason: 'unsupported_mutation' };
  if (mutation.expectedRevision !== liveState.revision) return { ok: false, reason: 'state_revision_changed' };
  if (mutation.type === 'merge_pr' && mutation.base === 'main') return { ok: false, reason: 'automatic_main_merge_prohibited' };
  if (mutation.type === 'create_issue' && mutation.promoteToMain === true) {
    return { ok: false, reason: 'automatic_main_merge_prohibited' };
  }
  if (mutation.type === 'create_draft_pr') {
    if (mutation.baseBranch === 'main') return { ok: false, reason: 'automatic_main_merge_prohibited' };
    const missing = DRAFT_PR_REQUIRED_FIELDS.filter((field) => !mutation[field]);
    if (missing.length > 0) return { ok: false, reason: 'incomplete_draft_pr_mutation' };
  }
  if (mutation.untrusted === true) return { ok: false, reason: 'untrusted_event' };
  return { ok: true, reason: 'authorized' };
}

export function prepareBoundedMutation(plan, mutation) {
  return { ...mutation, expectedRevision: mutation.expectedRevision || plan.expectedRevision, actionKey: plan.actionKey };
}

/**
 * Re-validate a `create_draft_pr` mutation against freshly re-read live
 * state (branch SHAs, contract revision, existing-PR search) immediately
 * before mutating (#2621 requirement 3/4), and build the exact draft-PR
 * request. Never calls the GitHub API itself — the calling workflow step
 * performs `pulls.create` with the returned request, then applies
 * `commentUpdateTemplate` the same way #2620's comment CLI upserts the
 * validation-status comment, so PR URL + contract revision land in the one
 * existing marked comment rather than a second comment (requirement 7).
 */
export function buildDraftPrPlan(mutation, freshState = {}) {
  if (!mutation || mutation.type !== 'create_draft_pr') {
    return { ok: false, reason: 'unsupported_mutation' };
  }
  if (freshState.issueOpen === false) return { ok: false, reason: 'issue_not_open' };
  if (freshState.actorAuthorized === false) return { ok: false, reason: 'contract_actor_unauthorized' };
  if (freshState.headSha !== mutation.expectedHeadSha) return { ok: false, reason: 'stale_head_sha' };
  if (freshState.baseSha !== mutation.expectedBaseSha) return { ok: false, reason: 'stale_base_sha' };
  if (freshState.contractRev !== mutation.contractRev) return { ok: false, reason: 'stale_contract_revision' };
  // Fail closed rather than silently defaulting to [] — an unset or failed
  // changed-file computation must never be treated as "no files changed",
  // since that lets diff-scope validation trivially pass with zero files to
  // compare against (PR #2952 review findings, discussion_r3681547395 /
  // discussion_r3681547453).
  if (freshState.changedFilesComputeFailed === true) return { ok: false, reason: 'changed_files_compute_failed' };
  if (!Array.isArray(freshState.changedFiles) || freshState.changedFiles.length === 0) {
    return { ok: false, reason: 'changed_files_missing' };
  }

  const existing = (freshState.pullRequests || []).find((pr) => pr.state === 'open'
    && (pr.headBranch === mutation.headBranch || pr.sourceIssue === mutation.issue));
  if (existing) {
    return {
      ok: false,
      reason: 'existing_pr_found',
      commentUpdateTemplate: {
        issue: mutation.issue,
        rev: mutation.contractRev,
        marker: buildStatusMarker('valid', mutation.contractRev),
        prUrl: existing.url || null,
      },
    };
  }

  // Render through the canonical #2619 renderer instead of a second,
  // hand-built template — the ADJUSTMENT on #2622 found the workflow's
  // previous inline two-line body failed shared hygiene validation.
  const body = renderPrBody({
    issue: { number: mutation.issue },
    contract: { fields: mutation.contractFields || {} },
    deliveryProfile: mutation.deliveryProfile || {},
  });
  const rendered = validateRenderedPrBody({
    body,
    baseRef: mutation.baseBranch,
    headRef: mutation.headBranch,
    changedFiles: freshState.changedFiles,
  });
  // Fail closed: a rendered body that cannot pass the same hygiene/
  // diff-scope/delivery-profile validation live PRs are held to must
  // create no PR (#2622 acceptance criterion).
  if (!rendered.ok) {
    return { ok: false, reason: 'rendered_body_invalid', renderedBodyErrors: rendered.errors };
  }

  return {
    ok: true,
    reason: 'authorized',
    request: {
      head: mutation.headBranch,
      base: mutation.baseBranch,
      draft: true,
      issue: mutation.issue,
      title: `Draft: source Issue #${mutation.issue}`,
      body,
    },
    commentUpdateTemplate: {
      issue: mutation.issue,
      rev: mutation.contractRev,
      marker: buildStatusMarker('valid', mutation.contractRev),
    },
  };
}
