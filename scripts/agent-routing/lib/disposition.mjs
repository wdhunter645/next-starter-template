/**
 * Deterministic current-head finding classification for #2677-002 / #2771.
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

export function classifyDisposition(packet = {}, options = {}) {
  const headSha = normalizeSha(packet?.pullRequest?.headSha);
  const sourceIssueNumber = Number(packet?.sourceIssue?.number);
  if (!headSha) return failClosed('missing_current_head', 'Current PR head SHA is required.');
  if (!Number.isInteger(sourceIssueNumber) || sourceIssueNumber <= 0) {
    return failClosed('missing_source_issue', 'Source Issue identity is required.');
  }

  const findings = deduplicateFindings([
    ...collectCurrentHeadFindings(packet, options.findings || []),
    ...collectRequiredCheckFindings(packet, options.requiredChecks || []),
  ]);
  const authorizations = authorizationMap(options.authorizations || []);
  const evidence = {
    sourceIssueNumber,
    prNumber: packet?.pullRequest?.number == null ? null : Number(packet.pullRequest.number),
    headSha,
    currentHeadFindingIdentities: findings.map((finding) => finding.identity),
    checkConclusions: (packet.checks || []).map((check) => ({
      name: check.name || check.context || '',
      status: check.status || null,
      conclusion: check.conclusion || check.state || null,
      headSha: check.headSha || check.head_sha || null,
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

  const evaluated = findings.map((finding) =>
    evaluateFinding(
      finding,
      authorizations.get(finding.identity) || null,
      sourceIssueNumber,
      headSha,
    ),
  );
  const blocking = evaluated.filter((finding) => !finding.boundedCorrectionAuthorized);

  return {
    ok: true,
    classification:
      blocking.length === 0
        ? DISPOSITION_CLASSES.BOUNDED_CORRECTION
        : DISPOSITION_CLASSES.PROTECTED_STOP,
    reason:
      blocking.length === 0
        ? 'Every controlling current-head finding has exact live source-Issue bounded authority.'
        : 'At least one controlling finding is protected or lacks exact bounded authority.',
    evidence: {
      ...evidence,
      ...(blocking.length > 0
        ? { blockingFindingIdentities: blocking.map((finding) => finding.identity) }
        : {}),
    },
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
    if (!isCurrentHeadEvidence(thread, headSha, true)) continue;
    findings.push({
      identity: `review-thread:${stableId(thread)}`,
      source: 'review_thread',
      decisionClass: normalizeDecisionClass(thread.decisionClass || 'implementation'),
      summary: thread.body || thread.bodyPreview || 'Unresolved current-head review thread',
      headSha,
    });
  }

  for (const review of reviewEvidence.reviewSubmissions || []) {
    if (String(review.state || '').toUpperCase() !== 'CHANGES_REQUESTED') continue;
    if (review.dispositioned === true) continue;
    if (!isCurrentHeadEvidence(review, headSha, true)) continue;
    findings.push({
      identity: `review-submission:${stableId(review)}`,
      source: 'review_submission',
      decisionClass: normalizeDecisionClass(review.decisionClass || 'engineering-approval'),
      summary: review.body || review.bodyPreview || 'Changes requested on current head',
      headSha,
    });
  }

  for (const comment of reviewEvidence.lateIssueComments || []) {
    if (isRoutingTransactionComment(comment) || !isExplicitlyActionable(comment)) continue;
    if (!isCurrentHeadEvidence(comment, headSha, true)) continue;
    findings.push({
      identity: `late-comment:${stableId(comment)}`,
      source: 'late_issue_comment',
      decisionClass: normalizeDecisionClass(comment.decisionClass || 'implementation'),
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
      decisionClass: normalizeDecisionClass(finding.decisionClass || 'implementation'),
      summary: finding.summary || finding.body || 'Actionable current-head finding',
      headSha,
    });
  }

  return deduplicateFindings(findings);
}

export function collectRequiredCheckFindings(packet = {}, requiredChecks = []) {
  const names = [...new Set((requiredChecks || []).map(String).map((name) => name.trim()).filter(Boolean))];
  const headSha = normalizeSha(packet?.pullRequest?.headSha);
  const checks = Array.isArray(packet.checks) ? packet.checks : [];
  const findings = [];

  if (names.length === 0) {
    return [{
      identity: 'checks:required-set-missing',
      source: 'required_check',
      decisionClass: 'engineering-approval',
      summary: 'The configured required-check set is empty.',
      headSha,
    }];
  }

  for (const name of names) {
    const matches = checks.filter((check) => String(check.name || check.context || '') === name);
    if (matches.length === 0) {
      findings.push({
        identity: `check:${name}:missing`,
        source: 'required_check',
        decisionClass: 'engineering-approval',
        summary: `Required check "${name}" is missing from current-head evidence.`,
        headSha,
      });
      continue;
    }

    for (const check of matches) {
      const checkHead = normalizeSha(check.headSha || check.head_sha || '');
      const status = String(check.status || '').toLowerCase();
      const conclusion = String(check.conclusion || check.state || '').toLowerCase();
      if (!checkHead || checkHead !== headSha) {
        findings.push({
          identity: `check:${name}:stale-or-unproven-head`,
          source: 'required_check',
          decisionClass: 'engineering-approval',
          summary: `Required check "${name}" is not proven against the current head.`,
          headSha,
        });
      } else if (status !== 'completed' || conclusion !== 'success') {
        findings.push({
          identity: `check:${name}:${status || 'unknown'}:${conclusion || 'none'}`,
          source: 'required_check',
          decisionClass: 'engineering-approval',
          summary: `Required check "${name}" is not terminal-success.`,
          headSha,
        });
      }
    }
  }

  return deduplicateFindings(findings);
}

export function extractSourceIssueAuthorizations({
  comments = [],
  findings = [],
  sourceIssueNumber,
  prNumber,
  headSha,
  repository = 'wdhunter645/next-starter-template',
} = {}) {
  const issueNumber = Number(sourceIssueNumber);
  const pullNumber = Number(prNumber);
  const head = normalizeSha(headSha);
  if (!Number.isInteger(issueNumber) || issueNumber <= 0) {
    return failClosed('invalid_source_issue', 'Source Issue number is invalid.');
  }
  if (!Number.isInteger(pullNumber) || pullNumber <= 0) {
    return failClosed('invalid_pr_number', 'Pull request number is invalid.');
  }
  if (!head) return failClosed('missing_current_head', 'Current PR head SHA is required.');

  const authorizations = [];
  let highestRevision = '1';
  for (const finding of findings || []) {
    const matching = [...(comments || [])].reverse().find((comment) =>
      commentAuthorizesFinding(comment, {
        findingIdentity: finding.identity,
        prNumber: pullNumber,
        headSha: head,
      }),
    );
    if (!matching) continue;

    const body = String(matching.body || matching.bodyText || '');
    const revision = extractField(body, 'Disposition revision') || '1';
    if (compareRevisions(revision, highestRevision) > 0) highestRevision = revision;
    const commentId = String(matching.id || matching.databaseId || '');
    authorizations.push({
      findingIdentity: finding.identity,
      disposition: DISPOSITION_CLASSES.BOUNDED_CORRECTION,
      authorized: true,
      decisionClass: normalizeDecisionClass(extractField(body, 'Decision class') || 'implementation'),
      sourceIssueDecisionUrl:
        matching.html_url ||
        `https://github.com/${repository}/issues/${issueNumber}#issuecomment-${commentId}`,
      sourceIssueCommentId: commentId,
      headSha: head,
      requestedAction: extractRequestedAction(body) || finding.summary,
      dispositionRevision: revision,
    });
  }

  return { ok: true, authorizations, dispositionRevision: highestRevision };
}

export function normalizeDecisionClass(value) {
  const normalized = String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[_\s/]+/g, '-');
  return PROTECTED_ALIASES[normalized] || normalized;
}

function evaluateFinding(finding, authorization, sourceIssueNumber, headSha) {
  const findingClass = normalizeDecisionClass(finding.decisionClass || 'implementation');
  const authorizationClass = normalizeDecisionClass(
    authorization?.decisionClass || findingClass,
  );
  const findingProtected = PROTECTED_DECISION_CLASSES.includes(findingClass);
  const authorizationProtected = PROTECTED_DECISION_CLASSES.includes(authorizationClass);
  const protectedDecision = findingProtected || authorizationProtected;
  const decisionClass = findingProtected ? findingClass : authorizationClass;
  const sourceIssueDecision = isSourceIssueDecision(
    authorization?.sourceIssueDecisionUrl,
    sourceIssueNumber,
  );
  const currentHead = normalizeSha(authorization?.headSha || '') === headSha;
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
    (authorizations || [])
      .filter(Boolean)
      .map((authorization) => [
        String(authorization.findingIdentity || authorization.identity || ''),
        authorization,
      ])
      .filter(([identity]) => identity),
  );
}

function isCurrentHeadEvidence(item, headSha, allowMissingHead) {
  if (item?.isOutdated === true) return false;
  const evidenceHead = normalizeSha(
    item?.headSha ||
      item?.commitSha ||
      item?.commitOid ||
      item?.commitId ||
      item?.commit?.oid ||
      item?.originalCommitOid ||
      item?.commitSHA ||
      '',
  );
  return evidenceHead ? evidenceHead === headSha : allowMissingHead;
}

function commentAuthorizesFinding(comment, { findingIdentity, prNumber, headSha }) {
  const body = String(comment?.body || comment?.bodyText || '');
  if (!body || isRoutingTransactionComment(comment)) return false;
  if (!/^(?:CHATGPT RESPONSE|ADJUSTMENT)\b/im.test(body.trim())) return false;
  if (!/\bbounded correction authorized\b/i.test(body)) return false;
  if (!body.includes(String(findingIdentity))) return false;
  if (!new RegExp(`\\bPR:\\s*#${prNumber}\\b`, 'i').test(body)) return false;
  return normalizeSha(extractField(body, 'Head SHA') || '') === headSha;
}

function isSourceIssueDecision(url, issueNumber) {
  if (!url) return false;
  const escaped = String(issueNumber).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`/issues/${escaped}#issuecomment-\\d+\\b`).test(String(url));
}

function isRoutingTransactionComment(comment) {
  const body = String(comment?.body || comment?.bodyPreview || '').trim();
  if (/<!--\s*agent-routing-(?:response|resume|escalation):/i.test(body)) return true;
  if (/^LOCAL CURSOR RESUME\b/im.test(body)) return true;
  if (/^(?:CHATGPT RESPONSE|ADJUSTMENT)\b/i.test(body) &&
      /\bbounded correction authorized\b/i.test(body) &&
      /\bFinding identity\s*:/i.test(body)) return true;
  return /^HOLD\b/i.test(body) && /\bDisposition identity\s*:/i.test(body);
}

function isExplicitlyActionable(comment) {
  if (comment.actionable === true) return true;
  const body = String(comment.body || comment.bodyPreview || '');
  return /^(?:PR REVIEW FINDING|CHANGES REQUESTED|PROBLEM FOUND|ADJUSTMENT)\b/i.test(
    body.trim(),
  );
}

function extractField(body, label) {
  const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = String(body).match(new RegExp(`^\\s*${escaped}\\s*:\\s*(.+?)\\s*$`, 'im'));
  return match?.[1]?.trim() || null;
}

function extractRequestedAction(body) {
  const match = String(body).match(
    /^Requested action:\s*\n((?:\s*[-*]\s+.+(?:\n|$))+)/im,
  );
  if (!match) return null;
  return match[1]
    .split(/\r?\n/)
    .map((line) => line.replace(/^\s*[-*]\s+/, '').trim())
    .filter(Boolean)
    .join(' ');
}

function deduplicateFindings(findings) {
  return [...new Map((findings || []).map((finding) => [finding.identity, finding])).values()]
    .sort((left, right) => left.identity.localeCompare(right.identity));
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
  return String(value || '1').trim() || '1';
}

function compareRevisions(left, right) {
  const a = String(left ?? '0');
  const b = String(right ?? '0');
  const aNumber = Number(a);
  const bNumber = Number(b);
  if (Number.isFinite(aNumber) && Number.isFinite(bNumber)) return aNumber - bNumber;
  return a.localeCompare(b, undefined, { numeric: true });
}

function normalizeSha(value) {
  const sha = String(value || '').trim().toLowerCase();
  return /^[0-9a-f]{7,40}$/.test(sha) ? sha : '';
}

function failClosed(code, message, details = {}) {
  return { ok: false, code, message, ...details };
}
