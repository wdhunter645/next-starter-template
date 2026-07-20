/**
 * Full eligibility contract for Cursor Local Bridge auto-start.
 * Fail closed: every check must pass.
 */

const RESPONSE_MARKERS = ['CHATGPT RESPONSE', 'CHATGPT CLOSEOUT'];
const RESUME_MARKER = 'LOCAL CURSOR RESUME';

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
  const actionLines = [];
  let inActions = false;
  for (const line of lines) {
    if (/^Next local action:/i.test(line.trim())) {
      inActions = true;
      continue;
    }
    if (inActions) {
      if (/^[A-Za-z].*:/.test(line.trim()) && !line.trim().startsWith('-')) break;
      const m = line.match(/^\s*-\s+(.+)\s*$/);
      if (m) actionLines.push(m[1].trim());
      else if (line.trim() === '') continue;
      else if (actionLines.length > 0) break;
    }
  }
  return {
    issueNumber: issueMatch ? Number(issueMatch[1]) : null,
    sourceHandoff: sourceHandoff?.[1] || null,
    resumeFrom: resumeFrom?.[1] || null,
    actions: actionLines,
  };
}

function urlContainsCommentId(url, commentId) {
  if (!url || !commentId) return false;
  return String(url).includes(String(commentId));
}

/**
 * @param {object} issue - gh issue view JSON
 * @param {object[]} comments - issue comments newest-last preferred
 * @param {object} opts
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

  const sorted = [...comments].sort(
    (a, b) => new Date(a.createdAt || a.created_at) - new Date(b.createdAt || b.created_at),
  );

  const response = findLatestMarkerComment(sorted, RESPONSE_MARKERS);
  if (!response) errors.push('missing_chatgpt_response');

  const resume = findLatestMarkerComment(sorted, [RESUME_MARKER]);
  if (!resume) errors.push('missing_local_cursor_resume');

  let parsed = null;
  if (resume) {
    parsed = parseResume(commentBody(resume));
    if (parsed.actions.length !== 1) {
      errors.push(`resume_action_count:${parsed.actions.length}`);
    }
    if (parsed.issueNumber && Number(issue.number) !== parsed.issueNumber) {
      errors.push('resume_issue_mismatch');
    }
    if (response) {
      const responseId = response.id || response.databaseId;
      const refOk =
        urlContainsCommentId(parsed.resumeFrom, responseId) ||
        urlContainsCommentId(parsed.sourceHandoff, responseId) ||
        (parsed.resumeFrom && commentBody(resume).includes(String(responseId)));
      // Also accept explicit URL equality to response.url
      const urlOk =
        (response.url &&
          (parsed.resumeFrom === response.url || parsed.sourceHandoff === response.url)) ||
        false;
      if (!refOk && !urlOk) {
        // Soft reference: require Resume from / Source handoff fields present
        if (!parsed.resumeFrom && !parsed.sourceHandoff) {
          errors.push('resume_missing_response_reference');
        } else if (response.url) {
          const body = commentBody(resume);
          if (!body.includes(response.url) && !body.includes(`#issuecomment-`)) {
            errors.push('resume_does_not_reference_response');
          }
        }
      }
      // Chronology: resume must be at or after response
      const rAt = new Date(response.createdAt || response.created_at).getTime();
      const sAt = new Date(resume.createdAt || resume.created_at).getTime();
      if (sAt < rAt) errors.push('resume_before_response');
    }
  }

  if (opts.expectedRepo && issue.repository && issue.repository.nameWithOwner) {
    if (issue.repository.nameWithOwner !== opts.expectedRepo) {
      errors.push('repository_mismatch');
    }
  }

  if (opts.branchHint && parsed) {
    const body = commentBody(resume || {});
    if (/Branch:\s*(\S+)/i.test(body)) {
      const branch = body.match(/Branch:\s*(\S+)/i)[1];
      if (opts.branchHint !== branch && opts.strictBranch) {
        errors.push(`branch_mismatch:${branch}`);
      }
    }
  }

  return {
    ok: errors.length === 0,
    errors,
    response,
    resume,
    parsed,
    labels,
  };
}

export { parseResume, RESPONSE_MARKERS, RESUME_MARKER };
