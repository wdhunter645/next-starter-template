/**
 * Delivery-first eligibility for Cursor Local Bridge (#2997).
 *
 * Mechanical safety gates may block launch. Semantic task-authority
 * assessment (response/resume shape, action count, queue routing) is
 * reported to Cursor and must not discard a trusted notification.
 */

import { classifyQueueCandidate } from '../../orchestrator/queue-routing.mjs';

const RESPONSE_MARKERS = ['CHATGPT RESPONSE', 'CHATGPT CLOSEOUT'];
const RESUME_MARKER = 'LOCAL CURSOR RESUME';

/** Errors that remain Bridge-side hard stops before launch. */
const MECHANICAL_ERROR_PREFIXES = [
  'source_issue_not_open',
  'missing_label:',
  'repository_mismatch',
];

function commentBody(c) {
  return c.body || c.bodyText || '';
}

function findLatestMarkerComment(comments, markers) {
  const matches = comments.filter((c) => {
    const body = commentBody(c).trimStart();
    return markers.some((m) => body.startsWith(m) || body.includes(`\n${m}`));
  });
  if (matches.length === 0) return null;
  return matches[matches.length - 1];
}

function parseResume(body) {
  const lines = body.split(/\r?\n/);
  const issueMatch = body.match(/Issue:\s*#(\d+)/i);
  const sourceHandoff = body.match(/Source handoff:\s*(\S+)/i);
  const resumeFrom = body.match(/Resume from:\s*(\S+)/i);
  // #2997 / Claude resume style uses "Response:" for the canonical comment URL.
  const responseRef = body.match(/^Response:\s*(\S+)/im);
  const actionLines = [];
  let inActions = false;
  for (const line of lines) {
    const trimmed = line.trim();
    // Single-line Action: form used by Engineering resumes.
    const singleAction = trimmed.match(/^Action:\s+(.+)$/i);
    if (singleAction) {
      actionLines.push(singleAction[1].trim());
      continue;
    }
    if (/^Next local action:/i.test(trimmed)) {
      inActions = true;
      continue;
    }
    if (inActions) {
      if (/^[A-Za-z].*:/.test(trimmed) && !trimmed.startsWith('-')) break;
      const m = line.match(/^\s*-\s+(.+)\s*$/);
      if (m) actionLines.push(m[1].trim());
      else if (trimmed === '') continue;
      else if (actionLines.length > 0) break;
    }
  }
  return {
    issueNumber: issueMatch ? Number(issueMatch[1]) : null,
    sourceHandoff: sourceHandoff?.[1] || null,
    resumeFrom: resumeFrom?.[1] || null,
    responseRef: responseRef?.[1] || null,
    actions: actionLines,
  };
}

function urlContainsCommentId(url, commentId) {
  if (!url || !commentId) return false;
  return String(url).includes(String(commentId));
}

function isMechanicalError(error) {
  return MECHANICAL_ERROR_PREFIXES.some(
    (prefix) => error === prefix || error.startsWith(prefix),
  );
}

/**
 * Assess semantic readiness for Cursor. Findings never block Bridge launch.
 */
export function assessSemanticReadiness(issue, comments, opts = {}) {
  const findings = [];
  const sorted = [...comments].sort(
    (a, b) => new Date(a.createdAt || a.created_at) - new Date(b.createdAt || b.created_at),
  );

  const response = findLatestMarkerComment(sorted, RESPONSE_MARKERS);
  if (!response) findings.push('missing_chatgpt_response');

  const resume = findLatestMarkerComment(sorted, [RESUME_MARKER]);
  if (!resume) findings.push('missing_local_cursor_resume');

  let parsed = null;
  if (resume) {
    parsed = parseResume(commentBody(resume));
    if (parsed.actions.length !== 1) {
      findings.push(`resume_action_count:${parsed.actions.length}`);
    }
    if (parsed.issueNumber && Number(issue.number) !== parsed.issueNumber) {
      findings.push('resume_issue_mismatch');
    }
    if (response) {
      const responseId = response.id || response.databaseId;
      const refCandidates = [parsed.resumeFrom, parsed.sourceHandoff, parsed.responseRef];
      const refOk = refCandidates.some(
        (ref) =>
          urlContainsCommentId(ref, responseId) ||
          (ref && commentBody(resume).includes(String(responseId))),
      );
      const urlOk =
        !!response.url &&
        refCandidates.some((ref) => ref === response.url);
      if (!refOk && !urlOk) {
        if (!parsed.resumeFrom && !parsed.sourceHandoff && !parsed.responseRef) {
          findings.push('resume_missing_response_reference');
        } else if (response.url) {
          const body = commentBody(resume);
          if (!body.includes(response.url) && !body.includes(`#issuecomment-`)) {
            findings.push('resume_does_not_reference_response');
          }
        }
      }
      const rAt = new Date(response.createdAt || response.created_at).getTime();
      const sAt = new Date(resume.createdAt || resume.created_at).getTime();
      if (sAt < rAt) findings.push('resume_before_response');
    }
  }

  const labels = (issue.labels || []).map((l) => (typeof l === 'string' ? l : l.name));
  const queueRelevant = labels.some(
    (label) =>
      label.startsWith('team:') ||
      label.startsWith('ops:') ||
      label.startsWith('pmo:priority:') ||
      label.startsWith('eng:priority:') ||
      label.startsWith('pmo:stage:') ||
      label === 'pmo:task' ||
      label === 'pmo:active' ||
      label === 'pmo:pipeline',
  );
  let queueClassification = null;
  if (queueRelevant && opts.skipQueueRoutingCheck !== true) {
    queueClassification = classifyQueueCandidate(
      {
        number: issue.number,
        state: issue.state === 'OPEN' || issue.state === 'open' ? 'open' : issue.state,
        labels,
        body: issue.body || '',
      },
      opts.queueContext || {},
    );
    if (
      queueClassification.failClosed &&
      queueClassification.reasons?.some((reason) =>
        /cross_namespace|multiple_team|pmo_child_carries|unclassified|ops_requires|pipeline_requires|pipeline_missing|active_shape|missing_or_mismatched_parent|parent_not_valid/.test(
          reason,
        ),
      )
    ) {
      findings.push(`queue_routing_ineligible:${queueClassification.reasons.join(',')}`);
    }
  }

  return {
    findings,
    response,
    resume,
    parsed,
    labels,
    queueClassification,
  };
}

/**
 * @param {object} issue - gh issue view JSON
 * @param {object[]} comments - issue comments newest-last preferred
 * @param {object} opts
 * @returns {{
 *   ok: boolean,
 *   errors: string[],
 *   semanticFindings: string[],
 *   response: object|null,
 *   resume: object|null,
 *   parsed: object|null,
 *   labels: string[],
 *   queueClassification: object|null,
 * }}
 */
export function validateEligibility(issue, comments, opts = {}) {
  const errors = [];
  const requiredLabels = opts.requiredLabels || ['agent:cursor', 'handoff:ready'];

  if (!issue || issue.state !== 'OPEN') {
    errors.push('source_issue_not_open');
  }

  const labels = (issue.labels || []).map((l) => (typeof l === 'string' ? l : l.name));
  for (const need of requiredLabels) {
    if (!labels.includes(need)) errors.push(`missing_label:${need}`);
  }

  if (opts.expectedRepo && issue.repository && issue.repository.nameWithOwner) {
    if (issue.repository.nameWithOwner !== opts.expectedRepo) {
      errors.push('repository_mismatch');
    }
  }

  const semantic = assessSemanticReadiness(issue, comments, opts);

  // Branch hint remains a soft finding only (never mechanical).
  if (opts.branchHint && semantic.resume) {
    const body = commentBody(semantic.resume);
    if (/Branch:\s*(\S+)/i.test(body)) {
      const branch = body.match(/Branch:\s*(\S+)/i)[1];
      if (opts.branchHint !== branch && opts.strictBranch) {
        semantic.findings.push(`branch_mismatch:${branch}`);
      }
    }
  }

  const mechanicalErrors = errors.filter(isMechanicalError);
  // Defend against accidental non-mechanical entries in errors[].
  for (const e of errors) {
    if (!isMechanicalError(e) && !mechanicalErrors.includes(e)) {
      semantic.findings.push(e);
    }
  }

  return {
    ok: mechanicalErrors.length === 0,
    errors: mechanicalErrors,
    semanticFindings: semantic.findings,
    response: semantic.response,
    resume: semantic.resume,
    parsed: semantic.parsed,
    labels: semantic.labels.length ? semantic.labels : labels,
    queueClassification: semantic.queueClassification,
  };
}

/**
 * Stable dedupe/claim key for a wake. Prefers resume comment id; falls back
 * to packet identity so delivery-first launches remain idempotent without a
 * parseable resume.
 */
export function resolveDeliveryKey({ packet, eligibility, issueNumber }) {
  if (eligibility?.resume?.id != null) return String(eligibility.resume.id);
  if (packet?.resumeCommentId != null) return String(packet.resumeCommentId);
  if (packet?.resumeHint != null) return String(packet.resumeHint);
  if (packet?.deliveryId) return String(packet.deliveryId);
  return `issue-${issueNumber}`;
}

export {
  parseResume,
  RESPONSE_MARKERS,
  RESUME_MARKER,
  MECHANICAL_ERROR_PREFIXES,
  isMechanicalError,
};
