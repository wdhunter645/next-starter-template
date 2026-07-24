/**
 * Deterministic current-head finding classification for #2677-002 / #2771.
 *
 * Classification is conservative: unresolved current-head findings control
 * until an exact live source-Issue comment authorizes a bounded correction.
 * Caller-supplied authorization selectors are hints only and must resolve
 * against trusted live source-Issue comments.
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
  if (!Number.isFinite(sourceIssueNumber) || sourceIssueNumber <= 0) {
    return failClosed('missing_source_issue', 'Source Issue identity is required.');
  }

  const reviewFindings = collectCurrentHeadFindings(packet, options.findings || []);
  const checkFindings = collectRequiredCheckFindings(packet, options.requiredChecks || []);
  const findings = [...reviewFindings, ...checkFindings].sort((a, b) =>
    a.identity.localeCompare(b.identity),
  );
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
        'At least one current-head finding requires protected authority or lacks an exact live source-Issue bounded-correction decision.',
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
    reason: 'Every controlling current-head finding has an exact live source-Issue bounded correction.',
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
    if (!isCurrentHeadReviewEvidence(thread, headSha, { allowMissingHead: true })) continue;
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
    if (!isCurrentHeadReviewEvidence(review, headSha, { allowMissingHead: true })) continue;
    findings.push({
      identity: `review-submission:${stableId(review)}`,
      source: 'review_submission',
      decisionClass: normalizeDecisionClass(review.decisionClass || 'engineering-approval'),
      summary: review.body || review.bodyPreview || 'Changes requested on current head',
      headSha,
    });
  }

  for (const comment of reviewEvidence.lateIssueComments || []) {
    if (isRoutingDecisionComment(comment)) continue;
    if (!isExplicitlyActionable(comment)) continue;
    if (!isCurrentHeadReviewEvidence(comment, headSha, { allowMissingHead: true })) continue;
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

export function collectRequiredCheckFindings(packet = {}, requiredChecks = []) {
  const names = [...new Set((requiredChecks || []).map(String).filter(Boolean))];
  if (names.length === 0) return [];

  const headSha = normalizeSha(packet?.pullRequest?.headSha);
  const checks = Array.isArray(packet.checks) ? packet.checks : [];
  const findings = [];

  for (const name of names) {
    const matches = checks.filter((check) => String(check.name || check.context || '') === name);
    if (matches.length === 0) {
      findings.push({
        identity: `check:${name}:missing`,
        source: 'required_check',
        decisionClass: 'engineering-approval',
        summary: `Required check "${name}" is missing from current-head evidence.`,
        headSha,
        actionable: true,
      });
      continue;
    }

    for (const check of matches) {
      const checkHead = normalizeSha(check.headSha || check.head_sha);
      const status = String(check.status || '').toLowerCase();
      const conclusion = String(check.conclusion || '').toLowerCase();
      if (checkHead && checkHead !== headSha) {
        findings.push({
          identity: `check:${name}:stale-head`,
          source: 'required_check',
          decisionClass: 'engineering-approval',
          summary: `Required check "${name}" targets a stale head SHA.`,
          headSha,
          actionable: true,
        });
        continue;
      }
      if (!(status === 'completed' && conclusion === 'success')) {
        findings.push({
          identity: `check:${name}:${status || 'unknown'}:${conclusion || 'none'}`,
          source: 'required_check',
          decisionClass: 'engineering-approval',
          summary: `Required check "${name}" is not terminal-success (status=${status || 'missing'}, conclusion=${conclusion || 'missing'}).`,
          headSha,
          actionable: true,
        });
      }
    }
  }

  return findings;
}

/**
 * Resolve authorization selectors against trusted live source-Issue comments.
 * Selectors are hints only; missing or mismatched live evidence fails closed.
 */
export function resolveLiveAuthorizations({
  selectors = [],
  liveComments = [],
  repository = 'wdhunter645/next-starter-template',
  sourceIssueNumber,
  prNumber,
  headSha,
  trustedAuthors = [],
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

  const trusted = new Set((trustedAuthors || []).map((author) => String(author).toLowerCase()));
  const authorizations = [];

  for (const selector of selectors || []) {
    if (!selector) continue;
    const decisionUrl = String(selector.sourceIssueDecisionUrl || '').trim();
    if (!decisionUrl) {
      return failClosed(
        'source_issue_decision_not_live',
        'Authorization selector requires an exact source-Issue decision URL.',
      );
    }

    const comment = findLiveCommentByDecisionUrl(liveComments, decisionUrl, issueNumber);
    if (!comment) {
      return failClosed(
        'source_issue_decision_not_live',
        'Authorization selector does not resolve to a live source-Issue comment.',
        { sourceIssueDecisionUrl: decisionUrl },
      );
    }

    const authorLogin = String(comment.author?.login || comment.user?.login || '').toLowerCase();
    if (trusted.size > 0 && !trusted.has(authorLogin)) {
      return failClosed(
        'source_issue_decision_author_untrusted',
        'Live source-Issue decision author is not trusted.',
        { author: authorLogin || null },
      );
    }

    const parsed = parseAuthorizationFromLiveComment(comment, {
      issueNumber,
      prNumber: pullNumber,
      headSha: head,
      repository,
    });
    if (!parsed.ok) return parsed;

    const hintFinding = String(selector.findingIdentity || selector.identity || '');
    const hintAction = String(selector.requestedAction || '').trim();
    const hintHead = normalizeSha(selector.headSha);
    const hintDisposition = selector.disposition
      ? normalizeDispositionValue(selector.disposition)
      : null;
    const hintClass = selector.decisionClass
      ? normalizeDecisionClass(selector.decisionClass)
      : null;

    if (
      (hintFinding && hintFinding !== parsed.authorization.findingIdentity) ||
      (hintHead && hintHead !== parsed.authorization.headSha) ||
      (hintDisposition && hintDisposition !== parsed.authorization.disposition) ||
      (hintClass && hintClass !== parsed.authorization.decisionClass) ||
      (hintAction && hintAction !== parsed.authorization.requestedAction)
    ) {
      return failClosed(
        'source_issue_decision_mismatch',
        'Authorization selector does not match the live source-Issue decision comment.',
      );
    }

    authorizations.push({
      ...parsed.authorization,
      sourceIssueDecisionUrl: decisionUrl,
    });
  }

  return { ok: true, authorizations };
}

/**
 * Build authorizations only from comments collected from the live source Issue.
 * Caller-provided authorization objects are never consulted operationally.
 */
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
    const decisionClass = normalizeDecisionClass(
      extractField(body, 'Decision class') || 'implementation',
    );
    const commentId = String(matching.id || matching.databaseId || '');
    authorizations.push({
      findingIdentity: finding.identity,
      disposition: DISPOSITION_CLASSES.BOUNDED_CORRECTION,
      authorized: true,
      decisionClass,
      sourceIssueDecisionUrl:
        `https://github.com/${repository}/issues/${issueNumber}#issuecomment-${commentId}`,
      sourceIssueCommentId: commentId,
      headSha: head,
      requestedAction: extractRequestedAction(body) || finding.summary,
      dispositionRevision: revision,
    });
  }

  return {
    ok: true,
    authorizations,
    dispositionRevision: highestRevision,
  };
}

export function normalizeDecisionClass(value) {
  const normalized = String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[_\s/]+/g, '-');
  return PROTECTED_ALIASES[normalized] || normalized;
}

function evaluateFinding(finding, authorization, sourceIssueNumber, headSha) {
  const findingClass = normalizeDecisionClass(finding.decisionClass);
  const authClass = authorization
    ? normalizeDecisionClass(authorization.decisionClass)
    : null;
  // Review threads default to engineering-approval and may be authorized as a
  // bounded correction. Explicit hard-protected finding classes cannot be
  // downgraded by a caller authorization hint.
  const nonOverridableProtected =
    findingClass !== 'engineering-approval' &&
    PROTECTED_DECISION_CLASSES.includes(findingClass);
  const decisionClass = nonOverridableProtected
    ? findingClass
    : authClass || findingClass;
  const protectedDecision = PROTECTED_DECISION_CLASSES.includes(decisionClass);
  const sourceIssueDecision = isSourceIssueDecision(
    authorization?.sourceIssueDecisionUrl,
    sourceIssueNumber,
  );
  const authorizationHead = normalizeSha(authorization?.headSha || '');
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

function isCurrentHeadReviewEvidence(item, headSha, { allowMissingHead = true } = {}) {
  if (item?.isOutdated === true) return false;
  const evidenceHead = normalizeSha(
    item?.headSha ||
      item?.commitOid ||
      item?.commitId ||
      item?.commit?.oid ||
      item?.originalCommitOid ||
      item?.commitSHA,
  );
  if (evidenceHead) return evidenceHead === headSha;
  return allowMissingHead;
}

function commentAuthorizesFinding(comment, { findingIdentity, prNumber, headSha }) {
  const body = String(comment?.body || comment?.bodyText || '');
  if (!body) return false;
  if (!/^(?:CHATGPT RESPONSE|ADJUSTMENT)\b/im.test(body.trim())) return false;
  if (!/\bbounded correction authorized\b/i.test(body) && !/\bDisposition:\s*bounded_correction\b/i.test(body)) {
    return false;
  }
  if (!body.includes(String(findingIdentity))) return false;
  if (!new RegExp(`\\bPR:\\s*#${prNumber}\\b`, 'i').test(body)) return false;
  const statedHead = normalizeSha(extractField(body, 'Head SHA') || '');
  return statedHead === headSha;
}

function findLiveCommentByDecisionUrl(comments, decisionUrl, sourceIssueNumber) {
  const commentId = extractIssueCommentId(decisionUrl, sourceIssueNumber);
  if (!commentId) return null;
  return (
    (comments || []).find((comment) => {
      const id = String(comment?.id || comment?.databaseId || '');
      const url = String(comment?.html_url || comment?.url || '');
      return (
        id === commentId ||
        url === decisionUrl ||
        extractIssueCommentId(url, sourceIssueNumber) === commentId
      );
    }) || null
  );
}

function extractIssueCommentId(url, sourceIssueNumber) {
  if (!url) return null;
  const escaped = String(sourceIssueNumber).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = String(url).match(new RegExp(`/issues/${escaped}#issuecomment-(\\d+)\\b`));
  return match ? match[1] : null;
}

function parseAuthorizationFromLiveComment(
  comment,
  { issueNumber, prNumber, headSha, repository },
) {
  const body = String(comment?.body || comment?.bodyText || '');
  if (!/^(?:CHATGPT RESPONSE|ADJUSTMENT)\b/im.test(body.trim())) {
    return failClosed(
      'source_issue_decision_mismatch',
      'Live source-Issue comment is not a bounded-correction authorization.',
    );
  }

  const findingIdentity =
    extractField(body, 'Finding identity') || extractField(body, 'Finding');
  const liveHead = normalizeSha(extractField(body, 'Head SHA'));
  const disposition = normalizeDispositionValue(
    extractField(body, 'Disposition') || DISPOSITION_CLASSES.BOUNDED_CORRECTION,
  );
  const decisionClass = normalizeDecisionClass(
    extractField(body, 'Decision class') || 'bounded-correction',
  );
  const requestedAction = extractRequestedAction(body);
  const statedPr = extractField(body, 'PR');

  if (!findingIdentity || !liveHead || !requestedAction) {
    return failClosed(
      'source_issue_decision_mismatch',
      'Live source-Issue decision comment is missing required fields.',
    );
  }
  if (liveHead !== headSha) {
    return failClosed(
      'source_issue_decision_mismatch',
      'Live source-Issue decision comment targets a different head SHA.',
    );
  }
  if (statedPr && !new RegExp(`^#?${prNumber}$`).test(String(statedPr).trim())) {
    return failClosed(
      'source_issue_decision_mismatch',
      'Live source-Issue decision comment targets a different PR.',
    );
  }
  if (disposition !== DISPOSITION_CLASSES.BOUNDED_CORRECTION) {
    return failClosed(
      'source_issue_decision_mismatch',
      'Live source-Issue decision comment disposition is not bounded_correction.',
    );
  }

  const commentId = String(comment.id || comment.databaseId || '');
  return {
    ok: true,
    authorization: {
      findingIdentity: String(findingIdentity).trim(),
      disposition: DISPOSITION_CLASSES.BOUNDED_CORRECTION,
      authorized: true,
      decisionClass,
      headSha: liveHead,
      requestedAction,
      sourceIssueCommentId: commentId,
      sourceIssueDecisionUrl:
        comment.html_url ||
        comment.url ||
        `https://github.com/${repository}/issues/${issueNumber}#issuecomment-${commentId}`,
    },
  };
}

function isSourceIssueDecision(url, issueNumber) {
  if (!url) return false;
  const escaped = String(issueNumber).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`/issues/${escaped}#issuecomment-\\d+\\b`).test(String(url));
}

function isRoutingDecisionComment(comment) {
  const body = String(comment.body || comment.bodyPreview || '').trim();
  if (/<!--\s*agent-routing-(?:response|resume|escalation):/i.test(body)) return true;
  if (
    /^(?:CHATGPT RESPONSE|ADJUSTMENT)\b/i.test(body) &&
    /\bbounded correction authorized\b/i.test(body) &&
    /\bFinding identity\s*:/i.test(body)
  ) {
    return true;
  }
  if (/^HOLD\b/i.test(body) && /\bDisposition identity\s*:/i.test(body)) return true;
  return false;
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

function normalizeDispositionValue(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[_\s]+/g, '_');
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
