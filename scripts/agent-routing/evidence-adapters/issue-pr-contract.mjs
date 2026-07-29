// Normalizes #2620's advisory issue_pr_contract_validate.mjs evaluation
// result (plus the fresh live-state facts the same workflow already
// gathers) into the flat evidence shape the #2294 state resolver and
// action planner consume for the CREATE_DRAFT_PR action (#2621).
//
// This adapter never calls the GitHub API and never re-derives contract
// semantics itself — it only reshapes the single source of truth already
// produced by scripts/ci/issue_pr_contract_validate.mjs, so the two
// modules cannot drift into a second, forked notion of "valid".

const UNAUTHORIZED_CODE = 'contract_unauthorized_trigger';

/**
 * @param {object|null} validationResult - Output of evaluateIssuePrContractRequest.
 * @param {object} [existingPr] - {number, url, headBranch, sourceIssue, state} if one is already known.
 */
export function normalizeIssuePrContractEvidence(validationResult, existingPr = null) {
  if (!validationResult) {
    return {
      status: 'missing',
      rev: null,
      actorAuthorized: null,
      headBranch: null,
      baseBranch: null,
      headSha: null,
      baseSha: null,
      hasDiff: null,
      changedFiles: [],
      existingPr,
    };
  }

  const errors = validationResult.errors || [];
  const actorAuthorized = errors.some((error) => error.code === UNAUTHORIZED_CODE) ? false : true;
  const snapshot = validationResult.liveSnapshot || {};

  return {
    status: validationResult.ok ? 'valid' : 'invalid',
    rev: validationResult.rev ?? null,
    actorAuthorized,
    headBranch: validationResult.fields?.head_branch ?? null,
    baseBranch: validationResult.fields?.base_branch ?? null,
    headSha: snapshot.headSha ?? null,
    baseSha: snapshot.baseSha ?? null,
    hasDiff: snapshot.hasDiff ?? null,
    changedFiles: Array.isArray(snapshot.changedFiles) ? snapshot.changedFiles : [],
    existingPr,
  };
}

/**
 * Detect an existing open PR for the same source Issue or head branch, so
 * the planner reconciles instead of duplicating (#2621 requirement 6).
 */
export function findExistingDraftPr(pullRequests = [], { sourceIssue, headBranch } = {}) {
  return (pullRequests || []).find((pr) => pr.state === 'open'
    && (pr.headBranch === headBranch || pr.sourceIssue === sourceIssue)) || null;
}
