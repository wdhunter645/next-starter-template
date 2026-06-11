import {
  isResolvedReviewText,
  isTrustedReviewer,
  TRUSTED_REVIEWERS,
} from './reviewer_lifecycle_gate.mjs';

export { TRUSTED_REVIEWERS };

export const IGNORE_MARKER = /<!--\s*reviewer-response-ignore\s*-->/i;
const DISPOSITION_LINE_PATTERN =
  /^[\s\-*]*review-comment:(\d+)\s*[—\-]\s*(.+)$/gim;
const THREAD_STATE_PATTERN = /thread state:\s*([^\s—\-]+)/i;
const FOLLOW_UP_ISSUE_PATTERN = /follow-up-issue:#(\d+)/i;
const ACTIONABLE_TOP_LEVEL_PATTERN =
  /(^|[^A-Za-z0-9])(P0|P1|P2|P3)([^A-Za-z0-9]|$)|high[- ]priority|request changes|requested changes|must fix|blocking|action required|please (fix|update|change|address)|security|bug\b/i;
const NON_ACTIONABLE_TOP_LEVEL_PATTERN =
  /^(?:✅|looks good|no (?:issues|findings|actionable)|all checks passed|summary by cubic|written for commit)/i;

export const ACCEPTED_DISPOSITION_VERBS = new Set([
  'accepted',
  'rejected',
  'acknowledged',
  'not applicable',
  'not-applicable',
  'n/a',
]);

export const ACCEPTED_THREAD_STATES = new Set([
  'resolved',
  'outdated',
  'unresolved-with-rationale',
  'follow-up',
]);

function sortCommentsChronologically(comments) {
  return [...comments].sort((left, right) => {
    const leftTime = Date.parse(left.created_at || left.submitted_at || '') || 0;
    const rightTime = Date.parse(right.created_at || right.submitted_at || '') || 0;
    if (leftTime !== rightTime) return leftTime - rightTime;
    return (left.id || 0) - (right.id || 0);
  });
}

function resolveThreadRootId(comment, commentsById) {
  let current = comment;
  const visited = new Set();

  while (current?.in_reply_to_id) {
    if (visited.has(current.in_reply_to_id)) return current.in_reply_to_id;
    visited.add(current.in_reply_to_id);
    const parent = commentsById.get(current.in_reply_to_id);
    if (!parent) return current.in_reply_to_id;
    current = parent;
  }

  return current.id;
}

export function extractReviewerAccountingSection(body = '') {
  const match = String(body || '').match(/##\s*REVIEWER RESPONSE ACCOUNTING([\s\S]*?)(?=\n##\s|$)/i);
  return match ? match[1] : '';
}

export function parseReviewerDispositions(body = '') {
  const section = extractReviewerAccountingSection(body);
  const dispositions = new Map();
  const pattern = new RegExp(DISPOSITION_LINE_PATTERN.source, DISPOSITION_LINE_PATTERN.flags);

  for (const match of section.matchAll(pattern)) {
    const commentId = String(match[1]);
    const remainder = String(match[2] || '').trim();
    const parts = remainder.split(/\s*[—\-]\s*/).map((part) => part.trim()).filter(Boolean);
    const verb = String(parts[0] || '').toLowerCase();
    const rationale = parts.slice(1).join(' — ').replace(THREAD_STATE_PATTERN, '').replace(FOLLOW_UP_ISSUE_PATTERN, '').trim();
    const threadStateMatch = remainder.match(THREAD_STATE_PATTERN);
    const followUpMatch = remainder.match(FOLLOW_UP_ISSUE_PATTERN);
    const threadState = String(threadStateMatch?.[1] || '').trim().toLowerCase();
    const followUpIssue = followUpMatch?.[1] ? String(followUpMatch[1]) : '';

    dispositions.set(commentId, {
      commentId,
      verb,
      rationale,
      threadState,
      followUpIssue,
    });
  }

  return dispositions;
}

export function hasValidDisposition(disposition) {
  if (!disposition) return false;
  if (disposition.followUpIssue) return true;
  if (!ACCEPTED_DISPOSITION_VERBS.has(disposition.verb)) return false;
  if (!disposition.rationale) return false;
  if (disposition.threadState && !ACCEPTED_THREAD_STATES.has(disposition.threadState)) return false;
  return true;
}

export function isOutdatedComment(comment, headSha = '') {
  if (!headSha || !comment?.commit_id) return false;
  return comment.commit_id !== headSha;
}

export function isActionableTopLevelComment(body = '') {
  const text = String(body || '').trim();
  if (!text || IGNORE_MARKER.test(text)) return false;
  if (NON_ACTIONABLE_TOP_LEVEL_PATTERN.test(text)) return false;
  return ACTIONABLE_TOP_LEVEL_PATTERN.test(text);
}

export function isActionableReviewSubmission(review) {
  if (!review || IGNORE_MARKER.test(review.body || '')) return false;
  if (review.state === 'CHANGES_REQUESTED') return true;
  if (review.state === 'COMMENTED' && isActionableTopLevelComment(review.body || '')) return true;
  return false;
}

function dispositionForComment(commentId, dispositions, threadComments) {
  const direct = dispositions.get(String(commentId));
  if (hasValidDisposition(direct)) return direct;

  for (const comment of threadComments) {
    const nested = dispositions.get(String(comment.id));
    if (hasValidDisposition(nested)) return nested;
  }

  return null;
}

function threadResolvedInGitHub(threadComments) {
  const ordered = sortCommentsChronologically(threadComments);
  const latest = ordered[ordered.length - 1];
  return Boolean(latest?.is_resolved) || ordered.some((comment) => comment.is_resolved === true);
}

function threadResolvedByReply(threadComments) {
  const ordered = sortCommentsChronologically(threadComments);
  const latest = ordered[ordered.length - 1];
  return isResolvedReviewText(latest?.body || '');
}

function isAfterTimestamp(value, boundary) {
  if (!value || !boundary) return false;
  return new Date(value).getTime() > new Date(boundary).getTime();
}

export function collectInlineReviewThreads(reviewComments = []) {
  const commentsById = new Map(
    reviewComments.filter((comment) => comment.id != null).map((comment) => [comment.id, comment]),
  );
  const threads = new Map();

  for (const comment of reviewComments) {
    const threadId = resolveThreadRootId(comment, commentsById);
    if (!threads.has(threadId)) threads.set(threadId, []);
    threads.get(threadId).push(comment);
  }

  return [...threads.entries()].map(([threadId, comments]) => ({
    threadId,
    comments: sortCommentsChronologically(comments),
    root: sortCommentsChronologically(comments)[0],
  }));
}

export function evaluateReviewerCommentDisposition({
  body = '',
  issueComments = [],
  reviewComments = [],
  reviews = [],
  headSha = '',
  readyForReviewAt = '',
  mergedAt = '',
  auditPhase = 'pre_merge',
} = {}) {
  const dispositions = parseReviewerDispositions(body);
  const undispositioned = [];
  const outdatedWithoutDisposition = [];
  const lateFindings = [];
  const failures = [];

  for (const { threadId, comments, root } of collectInlineReviewThreads(reviewComments)) {
    const user = root.user?.login || '';
    if (!isTrustedReviewer(user)) continue;
    if (root.line == null && root.position == null) continue;
    if (comments.some((comment) => IGNORE_MARKER.test(comment.body || ''))) continue;

    const disposition = dispositionForComment(threadId, dispositions, comments);
    const resolved = threadResolvedInGitHub(comments) || threadResolvedByReply(comments);
    const outdated = isOutdatedComment(root, headSha);
    const createdAt = root.created_at || root.submitted_at || '';
    const isLate =
      auditPhase === 'pre_merge'
        ? isAfterTimestamp(createdAt, readyForReviewAt)
        : isAfterTimestamp(createdAt, mergedAt);

    if (isLate) {
      lateFindings.push({
        code: auditPhase === 'post_merge' ? 'late_post_merge_reviewer_comment' : 'late_pre_merge_reviewer_comment',
        commentId: String(threadId),
        reviewer: user,
        outdated,
        message: `Late trusted reviewer inline comment ${threadId} requires disposition before ${auditPhase === 'post_merge' ? 'closeout' : 'merge'}.`,
      });
      if (!hasValidDisposition(disposition) && !resolved) {
        undispositioned.push({
          commentId: String(threadId),
          reviewer: user,
          kind: 'inline-thread',
          outdated,
          late: true,
        });
      }
      continue;
    }

    if (resolved && !outdated) continue;

    if (outdated) {
      if (!hasValidDisposition(disposition)) {
        outdatedWithoutDisposition.push({
          commentId: String(threadId),
          reviewer: user,
          kind: 'inline-thread',
        });
      }
      continue;
    }

    if (!resolved && !hasValidDisposition(disposition)) {
      undispositioned.push({
        commentId: String(threadId),
        reviewer: user,
        kind: 'inline-thread',
        outdated: false,
      });
    }
  }

  const latestReviews = new Map();
  for (const review of reviews) {
    const user = review.user?.login || '';
    if (!isTrustedReviewer(user)) continue;
    const existing = latestReviews.get(user);
    const reviewTime = Date.parse(review.submitted_at || '') || review.id || 0;
    const existingTime = existing ? Date.parse(existing.submitted_at || '') || existing.id || 0 : -1;
    if (!existing || reviewTime >= existingTime) latestReviews.set(user, review);
  }

  for (const review of latestReviews.values()) {
    if (!isActionableReviewSubmission(review)) continue;
    const commentId = String(review.id);
    const disposition = dispositions.get(commentId);
    const resolved = isResolvedReviewText(review.body || '') && review.state !== 'CHANGES_REQUESTED';
    const createdAt = review.submitted_at || '';
    const isLate =
      auditPhase === 'pre_merge'
        ? isAfterTimestamp(createdAt, readyForReviewAt)
        : isAfterTimestamp(createdAt, mergedAt);

    if (isLate) {
      lateFindings.push({
        code: auditPhase === 'post_merge' ? 'late_post_merge_reviewer_comment' : 'late_pre_merge_reviewer_comment',
        commentId,
        reviewer: review.user?.login || 'unknown-reviewer',
        outdated: false,
        message: `Late trusted reviewer submission ${commentId} requires disposition before ${auditPhase === 'post_merge' ? 'closeout' : 'merge'}.`,
      });
      if (!hasValidDisposition(disposition) && !resolved) {
        undispositioned.push({
          commentId,
          reviewer: review.user?.login || 'unknown-reviewer',
          kind: 'review-submission',
          late: true,
        });
      }
      continue;
    }

    if (!resolved && !hasValidDisposition(disposition)) {
      undispositioned.push({
        commentId,
        reviewer: review.user?.login || 'unknown-reviewer',
        kind: 'review-submission',
      });
    }
  }

  for (const comment of issueComments) {
    const user = comment.user?.login || '';
    if (!isTrustedReviewer(user)) continue;
    if (!isActionableTopLevelComment(comment.body || '')) continue;

    const commentId = String(comment.id);
    const disposition = dispositions.get(commentId);
    const resolved = isResolvedReviewText(comment.body || '');
    const createdAt = comment.created_at || '';
    const isLate =
      auditPhase === 'pre_merge'
        ? isAfterTimestamp(createdAt, readyForReviewAt)
        : isAfterTimestamp(createdAt, mergedAt);

    if (isLate) {
      lateFindings.push({
        code: auditPhase === 'post_merge' ? 'late_post_merge_reviewer_comment' : 'late_pre_merge_reviewer_comment',
        commentId,
        reviewer: user,
        outdated: false,
        message: `Late trusted reviewer top-level comment ${commentId} requires disposition before ${auditPhase === 'post_merge' ? 'closeout' : 'merge'}.`,
      });
      if (!hasValidDisposition(disposition) && !resolved) {
        undispositioned.push({
          commentId,
          reviewer: user,
          kind: 'top-level-comment',
          late: true,
        });
      }
      continue;
    }

    if (!resolved && !hasValidDisposition(disposition)) {
      undispositioned.push({
        commentId,
        reviewer: user,
        kind: 'top-level-comment',
      });
    }
  }

  for (const item of undispositioned) {
    failures.push({
      code: item.late ? 'late_undispositioned_reviewer_comment' : 'undispositioned_reviewer_comment',
      message: `Trusted reviewer comment ${item.commentId} (${item.kind}) lacks required PR-body disposition.`,
      commentId: item.commentId,
      reviewer: item.reviewer,
    });
  }

  for (const item of outdatedWithoutDisposition) {
    failures.push({
      code: 'outdated_reviewer_thread_without_disposition',
      message: `Outdated trusted reviewer thread ${item.commentId} requires explicit PR-body disposition with comment ID and thread state.`,
      commentId: item.commentId,
      reviewer: item.reviewer,
    });
  }

  const lateUndispositionedCount = undispositioned.filter((item) => item.late).length;

  return {
    ok: failures.length === 0,
    undispositionedCount: undispositioned.length,
    outdatedWithoutDispositionCount: outdatedWithoutDisposition.length,
    lateFindingsCount: lateFindings.length,
    lateUndispositionedCount,
    failures,
    undispositioned,
    outdatedWithoutDisposition,
    lateFindings,
    summary: failures.length
      ? `${failures.length} reviewer disposition failure(s); ${undispositioned.length} undispositioned, ${outdatedWithoutDisposition.length} outdated without disposition, ${lateFindings.length} late finding(s).`
      : 'All actionable trusted reviewer comments are dispositioned.',
  };
}
