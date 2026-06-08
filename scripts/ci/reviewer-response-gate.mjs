#!/usr/bin/env node

import { evaluateReviewerCommentDisposition } from './reviewer_comment_disposition.mjs';

export { evaluateReviewerCommentDisposition } from './reviewer_comment_disposition.mjs';
export {
  parseReviewerDispositions,
  hasValidDisposition,
  isOutdatedComment,
  collectInlineReviewThreads,
} from './reviewer_comment_disposition.mjs';

export function assessReviewerResponseGate({
  body = '',
  issueComments = [],
  reviewComments = [],
  reviews = [],
  headSha = '',
  readyForReviewAt = '',
  mergedAt = '',
  auditPhase = 'pre_merge',
  enforceFailure = false,
} = {}) {
  const disposition = evaluateReviewerCommentDisposition({
    body,
    issueComments,
    reviewComments,
    reviews,
    headSha,
    readyForReviewAt,
    mergedAt,
    auditPhase,
  });

  const lines = [
    disposition.ok
      ? 'Reviewer response gate passed.'
      : enforceFailure
        ? 'Reviewer response gate failed.'
        : 'Reviewer response gate advisory refreshed.',
    '',
    'Every actionable trusted reviewer comment must be resolved, explicitly dispositioned in the PR body, or linked to a bounded follow-up issue.',
    'Outdated review threads require explicit PR-body disposition with review-comment ID and thread state.',
    'Late reviewer comments arriving after READY FOR REVIEW (pre-merge) or after merge (post-merge audit) require disposition before merge or closeout.',
    '',
    `Audit phase: ${auditPhase}`,
    `Current head SHA: ${headSha || 'unknown'}`,
    `Undispositioned reviewer comments: ${disposition.undispositionedCount}`,
    `Outdated threads without disposition: ${disposition.outdatedWithoutDispositionCount}`,
    `Late reviewer findings: ${disposition.lateFindingsCount}`,
    `Enforcing event: ${enforceFailure ? 'yes' : 'no'}`,
    '',
    disposition.summary,
  ];

  if (!disposition.ok && disposition.failures.length) {
    lines.push('', '## Disposition failures');
    for (const failure of disposition.failures) {
      lines.push(`- ${failure.code}: ${failure.message}`);
    }
  }

  return {
    disposition,
    report: lines.join('\n'),
    shouldFail: enforceFailure && !disposition.ok,
  };
}
