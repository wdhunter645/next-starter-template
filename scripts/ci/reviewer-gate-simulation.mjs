import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const {
  issueRefsFromBody,
  issueRefsFromBranch,
} = require('./pr-issue-accounting-parser.js');

const [parsedOwner, parsedRepo] = (process.env.GITHUB_REPOSITORY || '').split('/');
const DEFAULT_OWNER = parsedOwner || 'owner';
const DEFAULT_REPO = parsedRepo || 'repo';
const REMEDIATION_LABELS = new Set(['governance', 'ci', 'remediation', 'hotfix-governance']);
const INTENT_CONFIG_PATH = path.resolve('scripts/ci/pr_intent_allowlists.json');

export function loadIntentConfig(configPath = INTENT_CONFIG_PATH) {
  return JSON.parse(fs.readFileSync(configPath, 'utf8'));
}

export function labelNames(labels = []) {
  return labels.map((label) => typeof label === 'string' ? label : label?.name).filter(Boolean);
}

export function hasRemediationLabel(labels = []) {
  return labelNames(labels).some((label) => REMEDIATION_LABELS.has(label));
}

export function classifyProtectedScope(files = []) {
  const changedFiles = files.map((file) => typeof file === 'string' ? file : file?.filename).filter(Boolean);
  const protectedFiles = changedFiles.filter((file) => (
    file.startsWith('.github/workflows/') ||
    file.startsWith('scripts/ci/')
  ));
  const docsFiles = changedFiles.filter((file) => file.startsWith('docs/'));
  const websiteFiles = changedFiles.filter((file) => (
    file.startsWith('src/') ||
    file.startsWith('functions/') ||
    file.startsWith('public/')
  ));

  return {
    changedFiles,
    protectedFiles,
    hasProtectedScope: protectedFiles.length > 0,
    docsOnly: changedFiles.length > 0 && docsFiles.length === changedFiles.length,
    websiteOnly: changedFiles.length > 0 && websiteFiles.length === changedFiles.length,
  };
}

export function evaluateIntentAllowlist(files = [], labels = [], config = loadIntentConfig()) {
  const names = labelNames(labels);
  const intentLabels = Object.keys(config.intents);
  const matched = intentLabels.filter((label) => names.includes(label));
  const changedFiles = files.map((file) => typeof file === 'string' ? file : file?.filename).filter(Boolean);

  if (matched.length !== 1) {
    return {
      ok: false,
      intent: null,
      violations: changedFiles,
      reason: matched.length === 0 ? 'missing-intent-label' : 'multiple-intent-labels',
    };
  }

  const intent = matched[0];
  const allow = config.intents[intent];
  const isDenied = (file) => (allow.deny_prefixes || []).some((prefix) => file.startsWith(prefix));
  const isAllowed = (file) => !isDenied(file) && (allow.allow_prefixes || []).some((prefix) => file.startsWith(prefix));
  const violations = changedFiles.filter((file) => !isAllowed(file));
  const hasWrangler = changedFiles.includes('wrangler.toml');
  const hasFunctions = changedFiles.some((file) => file.startsWith('functions/'));

  if (hasWrangler && hasFunctions && intent !== 'platform') {
    return { ok: false, intent, violations: changedFiles, reason: 'platform-label-required' };
  }

  return {
    ok: violations.length === 0,
    intent,
    violations,
    reason: violations.length ? 'allowlist-violation' : 'allowlist-ok',
  };
}

export function evaluateIssueAccounting({
  body = '',
  headRef = '',
  owner = DEFAULT_OWNER,
  repo = DEFAULT_REPO,
  openIssues = [],
} = {}) {
  const bodyRefs = issueRefsFromBody(body, owner, repo);
  const discoveredRefs = [
    ...bodyRefs.refs,
    ...issueRefsFromBranch(headRef),
  ];
  const invalidRefs = bodyRefs.invalidRefs || [];
  const uniqueIssues = [...new Set(discoveredRefs.map((ref) => ref.issueNumber))];
  const openIssueSet = new Set(openIssues);

  if (invalidRefs.length) {
    return { ok: false, reason: 'invalid-issue-reference', discoveredRefs, invalidRefs, uniqueIssues };
  }

  if (uniqueIssues.length !== 1) {
    return {
      ok: false,
      reason: uniqueIssues.length === 0 ? 'missing-issue-mapping' : 'multiple-issue-violation',
      discoveredRefs,
      invalidRefs,
      uniqueIssues,
    };
  }

  if (openIssues.length > 0 && !openIssueSet.has(uniqueIssues[0])) {
    return { ok: false, reason: 'source-issue-not-open', discoveredRefs, invalidRefs, uniqueIssues };
  }

  return { ok: true, reason: 'issue-accounting-ok', discoveredRefs, invalidRefs, uniqueIssues };
}

export function evaluateReviewerAccounting({
  eventName = 'pull_request',
  labels = [],
  files = [],
  currentHeadLinkedReview = false,
  staleTrustedReviewOnly = false,
  breakGlassOverride = false,
  unresolvedProtectedThreads = 0,
  advisoryFindings = 0,
  undispositionedReviewerComments = 0,
  outdatedWithoutDisposition = 0,
  lateUndispositionedReviewerComments = 0,
} = {}) {
  const scope = classifyProtectedScope(files);
  const remediation = hasRemediationLabel(labels);
  const advisoryDowngraded = remediation && advisoryFindings > 0;

  if (eventName === 'pull_request_target' && undispositionedReviewerComments > 0) {
    return {
      ok: false,
      severity: 'blocking',
      reason: 'undispositioned-reviewer-comment',
      advisoryDowngraded,
      scope,
    };
  }

  if (eventName === 'pull_request_target' && outdatedWithoutDisposition > 0) {
    return {
      ok: false,
      severity: 'blocking',
      reason: 'outdated-reviewer-thread-without-disposition',
      advisoryDowngraded,
      scope,
    };
  }

  if (eventName === 'pull_request_target' && lateUndispositionedReviewerComments > 0) {
    return {
      ok: false,
      severity: 'blocking',
      reason: 'late-reviewer-comment-requires-disposition',
      advisoryDowngraded,
      scope,
    };
  }

  if (
    scope.hasProtectedScope &&
    eventName === 'pull_request_target' &&
    breakGlassOverride
  ) {
    return {
      ok: true,
      severity: 'break-glass',
      reason: 'break-glass-override-for-protected-scope',
      advisoryDowngraded,
      scope,
    };
  }

  if (scope.hasProtectedScope && unresolvedProtectedThreads > 0) {
    return {
      ok: false,
      severity: 'blocking',
      reason: 'unresolved-protected-review-thread',
      advisoryDowngraded,
      scope,
    };
  }

  if (scope.hasProtectedScope && eventName === 'pull_request_target' && !currentHeadLinkedReview) {
    return {
      ok: false,
      severity: 'blocking',
      reason: staleTrustedReviewOnly
        ? 'stale-trusted-review-for-protected-scope'
        : 'missing-current-head-review-for-protected-scope',
      advisoryDowngraded,
      scope,
    };
  }

  return {
    ok: true,
    severity: advisoryFindings > 0 ? 'advisory' : 'none',
    reason: advisoryDowngraded ? 'advisory-downgraded-for-remediation' : 'reviewer-accounting-ok',
    advisoryDowngraded,
    scope,
  };
}

export function simulateGovernanceCase(testCase, config = loadIntentConfig()) {
  const payload = testCase.payload || {};
  const pr = payload.pull_request || {};
  const labels = testCase.labels || labelNames(pr.labels || []);
  const files = testCase.changedFiles || [];
  const issue = evaluateIssueAccounting({
    body: testCase.body ?? pr.body ?? '',
    headRef: testCase.headRef ?? pr.head?.ref ?? '',
    owner: testCase.owner || DEFAULT_OWNER,
    repo: testCase.repo || DEFAULT_REPO,
    openIssues: testCase.openIssues || [],
  });
  const allowlist = evaluateIntentAllowlist(files, labels, config);
  const reviewer = evaluateReviewerAccounting({
    eventName: testCase.eventName || payload.eventName || 'pull_request',
    labels,
    files,
    currentHeadLinkedReview: Boolean(testCase.currentHeadLinkedReview),
    staleTrustedReviewOnly: Boolean(testCase.staleTrustedReviewOnly),
    breakGlassOverride: Boolean(testCase.breakGlassOverride),
    unresolvedProtectedThreads: testCase.unresolvedProtectedThreads || 0,
    advisoryFindings: testCase.advisoryFindings || 0,
    undispositionedReviewerComments: testCase.undispositionedReviewerComments || 0,
    outdatedWithoutDisposition: testCase.outdatedWithoutDisposition || 0,
    lateUndispositionedReviewerComments: testCase.lateUndispositionedReviewerComments || 0,
  });

  return {
    name: testCase.name,
    issue,
    allowlist,
    reviewer,
    protectedScope: classifyProtectedScope(files),
    mergeSafe: issue.ok && allowlist.ok && reviewer.ok,
  };
}
