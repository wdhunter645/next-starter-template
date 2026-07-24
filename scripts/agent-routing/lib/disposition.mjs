/**
 * Deterministic current-head finding classification for #2677-002 / #2771.
 *
 * Classification is deliberately conservative: an unresolved current-head
 * finding is controlling until a source-Issue disposition explicitly
 * authorizes a bounded correction.
 */

export const DISPOSITION_CLASSES = Object.freeze({
  CLEAN: 'clean',
  BOUNDED_CORRECTION: 'bounded_correction',
  PROTECTED_STOP: 'protected_stop',
});

export const PROTECTED_DECISION_CLASSES = Object.freeze([
  'product',
  'design',
  'engineering-approval',
  'recovery',
  'credential',
  'secret',
  'destructive',
  'rights-privacy-publication',
  'production',
]);

const PROTECTED_ALIASES = Object.freeze({
  architecture: 'design',
  acceptance: 'design',
  approval: 'engineering-approval',
  engineering: 'engineering-approval',
  incident: 'recovery',
  credentials: 'credential',
  privacy: 'rights-privacy-publication',
  rights: 'rights-privacy-publication',
  publication: 'rights-privacy-publication',
  main: 'production',
});

/**
 * @param {object} packet normalized evidence packet
 * @param {{ findings?: object[], authorizations?: object[] }} options
 */
export function classifyDisposition(packet = {}, options = {}) {
  const headSha = normalizeSha(packet?.pullRequest?.headSha);
  const sourceIssueNumber = Number(packet?.sourceIssue?.number);
  if (!headSha) return failClosed('missing_current_head', 'Current PR head SHA is required.');
  if (!Number.isFinite(sourceIssueNumber) || sourceIssueNumber <= 0) {
    return failClosed('missing_source_issue', 'Source Issue identity is required.');
  }

  const findings = collectCurrentHeadFindings(packet, options.findings || []);
  const authorizations = authorizationMap(options.authorizations || []);
  const evidence = {
    sourceIssueNumber,
    prNumber: packet?.pullRequest?.number == null ? null : Number(packet.pullRequest.number),
    headSha,
    currentHeadFindingIdentities: findings.map((finding) => finding.identity),
    checkConclusions: (packet.checks || []).map((check) => ({
      name: check.name || '',
      conclusion: check.conclusion || check.state || null,
    })),
  };

  if (findings.length === 0) {
    return {
      ok: true,
      classification: DISPOSITION_CLASSES.CLEAN,
      reason: 'No unresolved actionable finding controls the current PR head.',
      evidence,
      findings: [],
      dispositionRevision: normalizeRevision(options.dispositionRevision),
    };
  }

  const evaluated = findings.map((finding) => {
    const authorization = authorizations.get(finding.identity) || null;
    return evaluateFinding(finding, authorization, sourceIssueNumber, headSha);
  });
  const blocking = evaluated.filter((item) => !item.boundedCorrectionAuthorized);

  if (blocking.length > 0) {
    return {
      ok: true,
      classification: DISPOSITION_CLASSES.PROTECTED_STOP,
      reason:
        'At least one current-head finding requires subjective/protected authority or lacks an exact source-Issue bounded-correction decision.',
      evidence: {
        ...evidence,
        blockingFindingIdentities: blocking.map((item) => item.identity),
      },
      findings: evaluated,
      dispositionRevision: normalizeRevision(options.dispositionRevision),
    };
  }

  return {
    ok: true,
    classification: DISPOSITION_CLASSES.BOUNDED_CORRECTION,
    reason: 'Every controlling current-head finding has an exact source-Issue bounded correction.',
    evidence,
    findings: evaluated,
    dispositionRevision: normalizeRevision(options.dispositionRevision),
  };
}

export function collectCurrentHeadFindings(packet = {}, additionalFindings = []) {
  const headSha = normalizeSha(packet?.pullRequest?.headSha);
  const reviewEvidence = packet.reviewEvidence || {};
  const findings = [];

  for (const thread of reviewEvidence.unresolvedReviewThreads || []) {
    if (thread.dispositioned === true || thread.actionable === false) continue;
    findings.push({
      identity: `review-thread:${stableId(thread)}`,
      source: 'review_thread',
      decisionClass: normalizeDecisionClass(thread.decisionClass || 'engineering-approval'),
      summary: thread.body || thread.bodyPreview || 'Unresolved current-head review thread',
      headSha,
    });
  }

  for (const review of reviewEvidence.reviewSubmissions || []) {
    if (String(review.state || '').toUpperCase() !== 'CHANGES_REQUESTED') continue;
    if (review.dispositioned === true) continue;
    findings.push({
      identity: `review-submission:${stableId(review)}`,
      source: 'review_submission',
      decisionClass: normalizeDecisionClass(review.decisionClass || 'engineering-approval'),
      summary: review.body || review.bodyPreview || 'Changes requested on current head',
      headSha,
    });
  }

  for (const comment of reviewEvidence.lateIssueComments || []) {
    if (!isExplicitlyActionable(comment)) continue;
    findings.push({
      identity: `late-comment:${stableId(comment)}`,
      source: 'late_issue_comment',
      decisionClass: normalizeDecisionClass(comment.decisionClass || 'engineering-approval'),
      summary: comment.body || comment.bodyPreview || 'Late actionable finding',
      headSha,
    });
  }

  for (const finding of additionalFindings || []) {
    if (finding.actionable === false || finding.dispositioned === true) continue;
    const findingHead = normalizeSha(finding.headSha || headSha);
    if (findingHead && findingHead !== headSha) continue;
    findings.push({
      identity: String(finding.identity || finding.findingIdentity || stableId(finding)),
      source: finding.source || finding.sourceSurface || 'provided_finding',
      decisionClass: normalizeDecisionClass(finding.decisionClass || 'engineering-approval'),
      summary: finding.summary || finding.body || 'Actionable current-head finding',
      headSha,
    });
  }

  return [...new Map(findings.map((finding) => [finding.identity, finding])).values()].sort((a, b) =>
    a.identity.localeCompare(b.identity),
  );
}

export function normalizeDecisionClass(value) {
  const normalized = String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[_\s/]+/g, '-');
  return PROTECTED_ALIASES[normalized] || normalized;
}

function evaluateFinding(finding, authorization, sourceIssueNumber, headSha) {
  const decisionClass = normalizeDecisionClass(
    authorization?.decisionClass || finding.decisionClass,
  );
  const protectedDecision = PROTECTED_DECISION_CLASSES.includes(decisionClass);
  const sourceIssueDecision = isSourceIssueDecision(
    authorization?.sourceIssueDecisionUrl,
    sourceIssueNumber,
  );
  const authorizationHead = normalizeSha(authorization?.headSha || headSha);
  const currentHead = authorizationHead === headSha;
  const boundedCorrectionAuthorized =
    !protectedDecision &&
    authorization?.authorized === true &&
    authorization?.disposition === DISPOSITION_CLASSES.BOUNDED_CORRECTION &&
    sourceIssueDecision &&
    currentHead;

  return {
    ...finding,
    decisionClass,
    protectedDecision,
    authorizationPresent: Boolean(authorization),
    sourceIssueDecision,
    sourceIssueDecisionUrl: authorization?.sourceIssueDecisionUrl || null,
    requestedAction: authorization?.requestedAction || null,
    currentHead,
    boundedCorrectionAuthorized,
  };
}

function authorizationMap(authorizations) {
  return new Map(
    authorizations
      .filter(Boolean)
      .map((authorization) => [
        String(authorization.findingIdentity || authorization.identity || ''),
        authorization,
      ])
      .filter(([identity]) => identity),
  );
}

function isSourceIssueDecision(url, issueNumber) {
  if (!url) return false;
  const escaped = String(issueNumber).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`/issues/${escaped}#issuecomment-\\d+\\b`).test(String(url));
}

function isExplicitlyActionable(comment) {
  if (comment.actionable === true) return true;
  const body = String(comment.body || comment.bodyPreview || '');
  return /^(?:PR REVIEW FINDING|CHANGES REQUESTED|PROBLEM FOUND|ADJUSTMENT)\b/i.test(
    body.trim(),
  );
}

function stableId(value) {
  const id = value?.id || value?.databaseId || value?.node_id;
  if (id) return String(id);
  return simpleHash(JSON.stringify(value || {}));
}

function simpleHash(value) {
  let hash = 2166136261;
  for (const char of String(value)) {
    hash ^= char.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16);
}

function normalizeRevision(value) {
  const revision = String(value || '1').trim();
  return revision || '1';
}

function normalizeSha(value) {
  const sha = String(value || '').trim().toLowerCase();
  return /^[0-9a-f]{7,40}$/.test(sha) ? sha : '';
}

function failClosed(code, message) {
  return { ok: false, code, message };
}
