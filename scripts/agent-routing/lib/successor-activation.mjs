/**
 * Deterministic successor eligibility and activation payloads for #2677-004.
 * This module is pure: it evaluates authority and builds the exact resume body,
 * but performs no GitHub mutation.
 */

const REQUIRED_SUCCESSOR_FIELDS = Object.freeze([
  'Implementation Agent',
  'Runtime',
  'Delivery Model',
  'Project branch / PR target',
  'Working branch',
]);

const REQUIRED_SUCCESSOR_SECTIONS = Object.freeze([
  'Exact file-touch allowlist',
  'Acceptance criteria',
  'Validation',
  'Rollback',
  'Stop point',
]);

export function resolveExplicitSuccessorNumber(body = '') {
  const value = extractField(body, 'Successor');
  const match = String(value || '').match(/#?(\d+)/);
  return match ? Number(match[1]) : null;
}

export function resolveParentProjectNumber(body = '') {
  const value = extractField(body, 'Parent Project') || extractField(body, 'Parent');
  const match = String(value || '').match(/#?(\d+)/);
  return match ? Number(match[1]) : null;
}

export function assessSuccessorLaunchPackage({
  sourceIssue,
  successorIssue,
  expectedSuccessorNumber,
  successorComments = [],
  trustedDecisionAuthors = [],
} = {}) {
  const expected = positiveInteger(expectedSuccessorNumber);
  if (!expected) return failClosed('invalid_successor_issue', 'Expected successor Issue number is invalid.');
  const explicit = resolveExplicitSuccessorNumber(sourceIssue?.body || '');
  if (explicit !== expected) {
    return failClosed('successor_identity_mismatch', 'Source Issue sequence does not identify the expected successor.', {
      explicitSuccessorIssueNumber: explicit,
      expectedSuccessorIssueNumber: expected,
    });
  }
  if (Number(successorIssue?.number) !== expected) {
    return failClosed('successor_identity_mismatch', 'Resolved successor Issue does not match the expected successor.');
  }
  if (String(successorIssue?.state || '').toUpperCase() !== 'OPEN') {
    return failClosed('successor_not_open', 'Successor Issue must be OPEN before activation.');
  }

  const body = String(successorIssue?.body || '');
  const missingFields = REQUIRED_SUCCESSOR_FIELDS.filter((field) => !extractField(body, field));
  const missingSections = REQUIRED_SUCCESSOR_SECTIONS.filter(
    (section) => !new RegExp(`^##\\s+${escapeRegExp(section)}\\b`, 'im').test(body),
  );
  if (missingFields.length || missingSections.length) {
    return failClosed(
      'successor_launch_package_incomplete',
      'Successor implementation package is incomplete.',
      { missingFields, missingSections },
    );
  }

  const trusted = new Set(
    (trustedDecisionAuthors || []).map((author) => normalizeAuthor(author)).filter(Boolean),
  );
  const implementationGo = (successorComments || []).find((comment) => {
    if (!trusted.has(commentAuthor(comment))) return false;
    const commentBody = String(comment?.body || comment?.bodyText || '');
    if (!/^CHATGPT RESPONSE\b/im.test(commentBody)) return false;
    const statedIssue = extractIssueNumber(extractField(commentBody, 'Issue'));
    if (statedIssue != null && statedIssue !== expected) return false;
    return /Disposition:\s*(?:APPROVED TO IMPLEMENT|APPROVED TO RESUME|APPROVED TO EXECUTE)/i.test(
      commentBody,
    );
  });
  if (!implementationGo) {
    return failClosed(
      'successor_implementation_go_missing',
      'A trusted, explicit successor implementation-Go decision is required.',
    );
  }

  return {
    ok: true,
    successorIssueNumber: expected,
    runtime: extractField(body, 'Runtime'),
    implementationAgent: extractField(body, 'Implementation Agent'),
    workingBranch: stripTicks(extractField(body, 'Working branch')),
    targetBranch: stripTicks(extractField(body, 'Project branch / PR target')),
    stopPoint: sectionText(body, 'Stop point'),
    implementationGoCommentId: String(implementationGo.id || implementationGo.databaseId || ''),
  };
}

export function buildSuccessorResume({
  sourceIssueNumber,
  successorIssueNumber,
  identity,
  launchPackage,
  resumeMarker = 'LOCAL CURSOR RESUME',
} = {}) {
  const source = positiveInteger(sourceIssueNumber);
  const successor = positiveInteger(successorIssueNumber);
  if (!source || !successor || !identity || !launchPackage?.workingBranch || !launchPackage?.targetBranch) {
    throw new Error('successor_resume_requires_complete_identity_and_launch_package');
  }
  return [
    resumeMarker,
    '',
    `Issue: #${successor}`,
    `Predecessor: #${source}`,
    `Runtime: ${launchPackage.runtime || 'local'}`,
    `Branch: ${launchPackage.workingBranch}`,
    `PR target: ${launchPackage.targetBranch}`,
    `Implementation Go comment id: ${launchPackage.implementationGoCommentId || 'recorded-on-source'}`,
    '',
    'Next local action:',
    `- Execute #${successor} exactly as specified in its authoritative Issue body; preserve its allowlist, validation, rollback, and stop point, open one PR to ${launchPackage.targetBranch}, post one current-head CHATGPT HANDOFF, and stop before approval, merge, successor activation, main, or Production mutation.`,
    '',
    `<!-- agent-routing-successor:${identity} -->`,
  ].join('\n');
}

export function labelsForSuccessorActivation(labels = []) {
  const current = new Set((labels || []).map(labelName).filter(Boolean));
  for (const removable of [
    'status:blocked',
    'status:review',
    'status:post-merge-verify',
    'status:complete',
  ]) {
    current.delete(removable);
  }
  current.add('agent:cursor');
  current.add('handoff:ready');
  current.add('status:in-progress');
  return [...current].sort();
}

export function extractField(body, label) {
  const escaped = escapeRegExp(label);
  const match = String(body || '').match(
    new RegExp(`^\\s*(?:[-*]\\s*)?(?:\\*\\*)?${escaped}(?:\\*\\*)?\\s*:\\s*(.+?)\\s*$`, 'im'),
  );
  return match?.[1]?.trim() || null;
}

function sectionText(body, heading) {
  const escaped = escapeRegExp(heading);
  const match = String(body || '').match(
    new RegExp(`^##\\s+${escaped}\\s*$([\\s\\S]*?)(?=^##\\s+|$)`, 'im'),
  );
  return match?.[1]?.trim() || null;
}

function labelName(label) {
  return typeof label === 'string' ? label : label?.name || '';
}

function commentAuthor(comment) {
  return normalizeAuthor(
    typeof comment?.author === 'string'
      ? comment.author
      : comment?.author?.login || comment?.user?.login || '',
  );
}

function normalizeAuthor(value) {
  return String(value || '').trim().toLowerCase();
}

function extractIssueNumber(value) {
  const match = String(value || '').match(/#?(\d+)/);
  return match ? Number(match[1]) : null;
}

function stripTicks(value) {
  return String(value || '').replace(/`/g, '').trim();
}

function positiveInteger(value) {
  const number = Number(value);
  return Number.isInteger(number) && number > 0 ? number : null;
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function failClosed(code, message, details = {}) {
  return { ok: false, code, message, ...details };
}
