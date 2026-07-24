/**
 * Stable identities and stale/duplicate suppression for remediation routing.
 */

export function buildDispositionIdentity({
  sourceIssueNumber,
  prNumber,
  headSha,
  findingIdentities = [],
  dispositionRevision = '1',
} = {}) {
  const issue = positiveInteger(sourceIssueNumber, 'disposition_identity_requires_source_issue');
  const pr = positiveInteger(prNumber, 'disposition_identity_requires_pr');
  const head = normalizeSha(headSha);
  if (!head) throw new Error('disposition_identity_requires_head_sha');
  const findings = [...new Set((findingIdentities || []).map(String))].sort();
  const findingKey = findings.length > 0 ? findings.join(',') : 'none';
  const revision = String(dispositionRevision || '1').trim() || '1';
  return `issue:${issue}:pr:${pr}:head:${head}:findings:${findingKey}:revision:${revision}`;
}

export function buildResponseIdentity(dispositionIdentity) {
  if (!dispositionIdentity) throw new Error('response_identity_requires_disposition');
  return `response:${dispositionIdentity}`;
}

export function buildResumeIdentity(dispositionIdentity) {
  if (!dispositionIdentity) throw new Error('resume_identity_requires_disposition');
  return `resume:${dispositionIdentity}`;
}

export function buildEscalationIdentity(dispositionIdentity) {
  if (!dispositionIdentity) throw new Error('escalation_identity_requires_disposition');
  return `escalation:${dispositionIdentity}`;
}

export function identityMarker(kind, identity) {
  if (!['response', 'resume', 'escalation'].includes(kind)) {
    throw new Error('unsupported_identity_marker_kind');
  }
  return `<!-- agent-routing-${kind}:${identity} -->`;
}

export function commentContainsIdentity(comments = [], kind, identity) {
  const marker = identityMarker(kind, identity);
  return (comments || []).some((comment) =>
    String(comment?.body || comment?.bodyText || '').includes(marker),
  );
}

/** Resolve the most recent recorded disposition from live source-Issue comments. */
export function findLatestDisposition(
  comments = [],
  { sourceIssueNumber = null, prNumber = null } = {},
) {
  const issue = sourceIssueNumber == null ? null : Number(sourceIssueNumber);
  const pr = prNumber == null ? null : Number(prNumber);
  let latest = null;

  for (const comment of comments || []) {
    const body = String(comment?.body || comment?.bodyText || '');
    const matches = body.matchAll(
      /issue:(\d+):pr:(\d+):head:([0-9a-f]{7,40}):findings:[^\s<]+:revision:([^\s<]+)/gi,
    );
    for (const match of matches) {
      const candidate = {
        sourceIssueNumber: Number(match[1]),
        prNumber: Number(match[2]),
        headSha: normalizeSha(match[3]),
        dispositionRevision: match[4],
        commentId: String(comment?.id || comment?.databaseId || ''),
        createdAt: comment?.createdAt || comment?.created_at || null,
      };
      if (issue != null && candidate.sourceIssueNumber !== issue) continue;
      if (pr != null && candidate.prNumber !== pr) continue;
      if (!latest || isLater(candidate, latest)) latest = candidate;
    }
  }
  return latest;
}

/**
 * A recorded disposition on another head is never reusable. A higher numeric
 * revision on the same head suppresses a stale proposed transaction.
 */
export function assessExpectedState({
  proposedHeadSha,
  dispositionRevision = '1',
  latestDisposition = null,
} = {}) {
  if (!latestDisposition) return { ok: true, stale: false };
  const proposedHead = normalizeSha(proposedHeadSha);
  const latestHead = normalizeSha(latestDisposition.headSha);
  if (latestHead && proposedHead && latestHead !== proposedHead) {
    return {
      ok: true,
      stale: false,
      requiresCurrentHeadReevaluation: true,
      priorHeadSha: latestHead,
      currentHeadSha: proposedHead,
    };
  }
  if (
    compareRevisions(latestDisposition.dispositionRevision, dispositionRevision) > 0
  ) {
    return {
      ok: false,
      stale: true,
      code: 'stale_disposition_revision',
      latestDispositionRevision: String(latestDisposition.dispositionRevision),
      proposedDispositionRevision: String(dispositionRevision),
    };
  }
  return { ok: true, stale: false };
}

export function compareRevisions(left, right) {
  const a = String(left ?? '0');
  const b = String(right ?? '0');
  const aNumber = Number(a);
  const bNumber = Number(b);
  if (Number.isFinite(aNumber) && Number.isFinite(bNumber)) return aNumber - bNumber;
  return a.localeCompare(b, undefined, { numeric: true });
}

function isLater(candidate, current) {
  const candidateTime = Date.parse(candidate.createdAt || '');
  const currentTime = Date.parse(current.createdAt || '');
  if (!Number.isNaN(candidateTime) && !Number.isNaN(currentTime) && candidateTime !== currentTime) {
    return candidateTime > currentTime;
  }
  return compareRevisions(candidate.dispositionRevision, current.dispositionRevision) >= 0;
}

function positiveInteger(value, errorCode) {
  const number = Number(value);
  if (!Number.isInteger(number) || number <= 0) throw new Error(errorCode);
  return number;
}

function normalizeSha(value) {
  const sha = String(value || '').trim().toLowerCase();
  return /^[0-9a-f]{7,40}$/.test(sha) ? sha : '';
}
