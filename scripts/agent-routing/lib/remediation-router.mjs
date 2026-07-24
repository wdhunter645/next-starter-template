import {
  classifyDisposition,
  DISPOSITION_CLASSES,
} from './disposition.mjs';
import {
  assessExpectedState,
  buildDispositionIdentity,
  buildEscalationIdentity,
  buildResponseIdentity,
  buildResumeIdentity,
  commentContainsIdentity,
  identityMarker,
} from './idempotency.mjs';

/**
 * Convert a normalized current-head packet into bounded source-Issue actions.
 * Returned actions are instructions; this module performs no network mutation.
 */
export function routeRemediation({
  packet,
  findings = [],
  authorizations = [],
  dispositionRevision = '1',
  existingComments = [],
  latestDisposition = null,
  branch = null,
  prUrl = null,
} = {}) {
  const classification = classifyDisposition(packet, {
    findings,
    authorizations,
    dispositionRevision,
  });
  if (!classification.ok) return classification;

  const expectedState = assessExpectedState({
    proposedHeadSha: packet.pullRequest.headSha,
    dispositionRevision,
    latestDisposition,
  });
  if (!expectedState.ok) {
    return {
      ok: false,
      code: expectedState.code,
      message: 'A newer disposition revision already controls this PR head.',
      classification,
      expectedState,
      actions: [],
    };
  }

  const dispositionIdentity = buildDispositionIdentity({
    sourceIssueNumber: packet.sourceIssue.number,
    prNumber: packet.pullRequest.number,
    headSha: packet.pullRequest.headSha,
    findingIdentities: classification.evidence.currentHeadFindingIdentities,
    dispositionRevision: classification.dispositionRevision,
  });
  const base = {
    ok: true,
    classification,
    dispositionIdentity,
    expectedState,
    actions: [],
  };

  if (classification.classification === DISPOSITION_CLASSES.CLEAN) {
    return base;
  }

  if (classification.classification === DISPOSITION_CLASSES.PROTECTED_STOP) {
    const escalationIdentity = buildEscalationIdentity(dispositionIdentity);
    if (!commentContainsIdentity(existingComments, 'escalation', escalationIdentity)) {
      base.actions.push({
        type: 'post_source_issue_escalation',
        issueNumber: Number(packet.sourceIssue.number),
        identity: escalationIdentity,
        body: protectedStopBody({
          packet,
          classification,
          dispositionIdentity,
          escalationIdentity,
        }),
      });
    }
    return base;
  }

  const responseIdentity = buildResponseIdentity(dispositionIdentity);
  const resumeIdentity = buildResumeIdentity(dispositionIdentity);
  const responseExists = commentContainsIdentity(
    existingComments,
    'response',
    responseIdentity,
  );
  const resumeExists = commentContainsIdentity(existingComments, 'resume', resumeIdentity);

  if (!responseExists) {
    base.actions.push({
      type: 'post_source_issue_response',
      issueNumber: Number(packet.sourceIssue.number),
      identity: responseIdentity,
      body: boundedResponseBody({
        packet,
        classification,
        dispositionIdentity,
        responseIdentity,
      }),
    });
  }

  if (!resumeExists) {
    base.actions.push({
      type: 'post_local_cursor_resume',
      issueNumber: Number(packet.sourceIssue.number),
      identity: resumeIdentity,
      responseIdentity,
      resumeFromUrl: findCommentUrl(existingComments, 'response', responseIdentity),
      bodyTemplate: localCursorResumeBody({
        packet,
        classification,
        dispositionIdentity,
        resumeIdentity,
        resumeFromUrl: '{{RESPONSE_COMMENT_URL}}',
        branch,
        prUrl,
      }),
    });
  }

  return base;
}

function boundedResponseBody({
  packet,
  classification,
  dispositionIdentity,
  responseIdentity,
}) {
  const decisions = classification.findings
    .map(
      (finding) =>
        `- ${finding.identity}: ${finding.sourceIssueDecisionUrl} — ${finding.requestedAction || finding.summary}`,
    )
    .join('\n');
  return `ADJUSTMENT
Subject: #${packet.sourceIssue.number}
Profile: development
Status: bounded correction authorized
PR: #${packet.pullRequest.number}
Head SHA: ${packet.pullRequest.headSha}
Disposition revision: ${classification.dispositionRevision}
Disposition identity: ${dispositionIdentity}
Evidence:
${decisions}
Requested action:
- Apply only the source-Issue-authorized bounded corrections listed above.
Blocking scope:
- This task and current PR head only.
Decision authority:
- Existing source-Issue decisions referenced above.
Resume condition:
- This response is followed by its action-scoped LOCAL CURSOR RESUME.
${identityMarker('response', responseIdentity)}`;
}

function localCursorResumeBody({
  packet,
  classification,
  dispositionIdentity,
  resumeIdentity,
  resumeFromUrl,
  branch,
  prUrl,
}) {
  const actions = classification.findings
    .map((finding) => `- ${finding.requestedAction || finding.summary}`)
    .join('\n');
  return `LOCAL CURSOR RESUME
Issue: #${packet.sourceIssue.number}
Resume from: ${resumeFromUrl}
Runtime: local
Branch: ${branch || 'current authorized task branch'}
PR: ${prUrl || `#${packet.pullRequest.number}`}
Head SHA: ${packet.pullRequest.headSha}
Disposition identity: ${dispositionIdentity}
Next local action:
${actions}
${identityMarker('resume', resumeIdentity)}`;
}

function protectedStopBody({
  packet,
  classification,
  dispositionIdentity,
  escalationIdentity,
}) {
  const findings = classification.findings
    .filter((finding) => !finding.boundedCorrectionAuthorized)
    .map(
      (finding) =>
        `- ${finding.identity}: class=${finding.decisionClass}; source=${finding.source}; ${finding.summary}`,
    )
    .join('\n');
  return `HOLD
Subject: #${packet.sourceIssue.number}
Profile: development
Status: protected stop
PR: #${packet.pullRequest.number}
Head SHA: ${packet.pullRequest.headSha}
Disposition identity: ${dispositionIdentity}
Evidence:
${findings}
Requested action:
- The owning Product, design, Engineering approval, recovery, credential/secret, destructive, rights/privacy/publication, or Production role must disposition the finding on this source Issue.
Blocking scope:
- This task and current PR head only.
Mutation boundary:
- No remediation response, resume, merge, closeout, or successor mutation was emitted.
Resume condition:
- A current-head source-Issue decision explicitly authorizes a bounded correction.
${identityMarker('escalation', escalationIdentity)}`;
}

function findCommentUrl(comments, kind, identity) {
  const marker = identityMarker(kind, identity);
  const match = (comments || []).find((comment) =>
    String(comment?.body || comment?.bodyText || '').includes(marker),
  );
  return match?.html_url || match?.url || null;
}
