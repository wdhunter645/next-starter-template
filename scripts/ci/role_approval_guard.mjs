#!/usr/bin/env node

import fs from 'node:fs';
import { pathToFileURL } from 'node:url';

export const APPROVAL_MARKER = '<!-- lgfc-role-approval:v1 -->';
export const GUARD_COMMENT_MARKER = '<!-- lgfc-role-approval-guard:v1 -->';

const REQUIRED_REVIEWER_ROLE = 'pr approver / engineering';
const REQUIRED_REVIEWER_ACTOR = 'chatgpt';

// This guard does not authenticate separation of duties. Claude Code writes
// and the connected ChatGPT GitHub app both currently write through the
// shared `wdhunter645` repository-owner identity, so `comment.user.login`
// cannot by itself distinguish the PR Approver / Engineering role holder
// from the implementer. What this control DOES provide, and can prove from
// GitHub-native evidence: the approval-shaped comment was posted by an
// authorized repository account (not an outside collaborator or a bot), it
// names the exact current PR/head SHA (any later push invalidates it), and
// the comment's own attested Implementation/Reviewer actor fields are not
// identical. It is exact-head structured approval EVIDENCE and stale/
// unauthorized-account rejection — not authenticated reviewer identity.
export const DEFAULT_AUTHORIZED_APPROVAL_ACCOUNTS = Object.freeze(['wdhunter645']);

function normalize(value = '') {
  return String(value || '').trim().toLowerCase();
}

function cleanFieldLine(line = '') {
  return String(line || '')
    .replace(/^\s*-\s*/, '')
    .replace(/\*\*/g, '')
    .trim();
}

export function parseField(body = '', field = '') {
  const target = normalize(field);
  for (const line of String(body || '').split(/\r?\n/)) {
    const cleaned = cleanFieldLine(line);
    const separator = cleaned.indexOf(':');
    if (separator < 0) continue;
    const name = normalize(cleaned.slice(0, separator));
    if (name !== target) continue;
    return cleaned.slice(separator + 1).trim();
  }
  return '';
}

export function parseSourceIssueNumber(body = '') {
  const value = parseField(body, 'Issue');
  const match = value.match(/^#(\d+)\b/);
  return match ? Number(match[1]) : 0;
}

export function isProtectedApprovalScope({ prBody = '', changedFiles = [] } = {}) {
  const approvalProfile = normalize(parseField(prBody, 'Approval profile'));
  if (approvalProfile === 'protected-change-review') return true;

  return changedFiles.some((filePath) => {
    const value = String(filePath || '');
    return value.startsWith('.github/workflows/') || value.startsWith('scripts/ci/');
  });
}

function parseNumberField(body, field) {
  const value = parseField(body, field);
  const match = value.match(/^#(\d+)\b/);
  return match ? Number(match[1]) : 0;
}

export function parseApprovalComment(comment = {}) {
  const body = String(comment.body || '');
  if (!body.includes(APPROVAL_MARKER)) return null;

  return {
    sourceIssue: parseNumberField(body, 'Source Issue'),
    prNumber: parseNumberField(body, 'PR'),
    headSha: parseField(body, 'Head SHA'),
    reviewerRole: parseField(body, 'Reviewer role'),
    reviewerActor: parseField(body, 'Reviewer actor'),
    implementationActor: parseField(body, 'Implementation actor'),
    decision: parseField(body, 'Decision'),
    commentId: comment.id || 0,
    login: comment.user?.login || '',
    accountType: comment.user?.type || '',
    authorAssociation: comment.author_association || '',
    createdAt: comment.created_at || comment.createdAt || '',
    updatedAt: comment.updated_at || comment.updatedAt || '',
  };
}

function isStructurallyMatchingEvent(event, {
  sourceIssue,
  prNumber,
  headSha,
  implementationActor = '',
}) {
  if (!event) return false;
  if (event.sourceIssue !== sourceIssue || event.prNumber !== prNumber) return false;
  if (normalize(event.headSha) !== normalize(headSha)) return false;
  if (normalize(event.reviewerRole) !== REQUIRED_REVIEWER_ROLE) return false;
  if (normalize(event.reviewerActor) !== REQUIRED_REVIEWER_ACTOR) return false;
  if (normalize(event.decision) !== 'approved for integration') return false;

  const recordedImplementer = normalize(event.implementationActor);
  const expectedImplementer = normalize(implementationActor);
  if (!recordedImplementer) return false;
  if (expectedImplementer && recordedImplementer !== expectedImplementer) return false;
  // Text-attested self-approval rejection. This compares two free-text
  // fields inside the same comment and cannot detect a forged pair; it only
  // catches an event that honestly declares itself self-authored.
  if (recordedImplementer === normalize(event.reviewerActor)) return false;

  return true;
}

/**
 * GitHub-native provenance check: was this comment actually posted by an
 * authorized repository account, and not a bot? This is the one part of the
 * evaluation that IS bound to authenticated GitHub identity rather than
 * free-text comment fields.
 */
export function isAuthorizedApprovalAccount(event, authorizedAccounts = DEFAULT_AUTHORIZED_APPROVAL_ACCOUNTS) {
  if (!event?.login) return false;
  if (normalize(event.accountType) === 'bot') return false;
  return authorizedAccounts.includes(event.login);
}

export function evaluateRoleApprovalGuard({
  prBody = '',
  changedFiles = [],
  comments = [],
  prNumber = 0,
  headSha = '',
  implementationActor = '',
  authorizedAccounts = DEFAULT_AUTHORIZED_APPROVAL_ACCOUNTS,
} = {}) {
  const sourceIssue = parseSourceIssueNumber(prBody);
  const required = isProtectedApprovalScope({ prBody, changedFiles });

  if (!required) {
    return {
      required: false,
      approved: true,
      sourceIssue,
      matchingCommentId: 0,
      acceptedLogin: '',
      acceptedAuthorAssociation: '',
      blockedReasons: [],
    };
  }

  const blockedReasons = [];
  if (!sourceIssue) {
    blockedReasons.push({
      code: 'missing-source-issue',
      message: 'Protected component PRs require one authoritative source Issue.',
    });
  }

  if (!prNumber || !/^[0-9a-f]{40}$/i.test(String(headSha || ''))) {
    blockedReasons.push({
      code: 'invalid-pr-identity',
      message: 'Protected component PRs require an exact PR number and 40-character head SHA.',
    });
  }

  const structurallyMatching = comments
    .map(parseApprovalComment)
    .filter(Boolean)
    .filter((event) => isStructurallyMatchingEvent(event, {
      sourceIssue,
      prNumber,
      headSha,
      implementationActor,
    }));

  const matching = structurallyMatching.find((event) => isAuthorizedApprovalAccount(event, authorizedAccounts));

  if (!matching) {
    if (structurallyMatching.length > 0) {
      blockedReasons.push({
        code: 'unauthorized-approval-account',
        message: 'An exact-head approval-evidence comment exists but was not posted by an authorized repository account, or was posted by a bot; it cannot be accepted as approval evidence.',
        observedLogins: [...new Set(structurallyMatching.map((event) => event.login).filter(Boolean))],
      });
    } else {
      blockedReasons.push({
        code: 'missing-role-approval',
        message: 'No valid exact-head PR Approver / Engineering approval-evidence event exists on the source Issue.',
      });
    }
  }

  return {
    required: true,
    approved: blockedReasons.length === 0,
    sourceIssue,
    matchingCommentId: matching?.commentId || 0,
    acceptedLogin: matching?.login || '',
    acceptedAuthorAssociation: matching?.authorAssociation || '',
    blockedReasons,
  };
}

function readJson(path, fallback = []) {
  if (!path || !fs.existsSync(path)) return fallback;
  return JSON.parse(fs.readFileSync(path, 'utf8'));
}

function readLines(path) {
  if (!path || !fs.existsSync(path)) return [];
  return fs.readFileSync(path, 'utf8').split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
}

function setOutput(name, value) {
  const outputPath = process.env.GITHUB_OUTPUT;
  if (!outputPath) return;
  fs.appendFileSync(outputPath, `${name}=${String(value)}\n`);
}

async function main() {
  const prBodyPath = process.env.PR_BODY_FILE;
  const resultPath = process.env.ROLE_APPROVAL_RESULT_JSON;
  const authorizedAccounts = readJson(process.env.ROLE_APPROVAL_AUTHORIZED_ACCOUNTS_JSON, [...DEFAULT_AUTHORIZED_APPROVAL_ACCOUNTS]);
  const result = evaluateRoleApprovalGuard({
    prBody: prBodyPath && fs.existsSync(prBodyPath) ? fs.readFileSync(prBodyPath, 'utf8') : '',
    changedFiles: readLines(process.env.CHANGED_FILES_FILE),
    comments: readJson(process.env.SOURCE_ISSUE_COMMENTS_JSON, []),
    prNumber: Number(process.env.PR_NUMBER || 0),
    headSha: process.env.HEAD_SHA || '',
    implementationActor: process.env.IMPLEMENTATION_ACTOR || '',
    authorizedAccounts,
  });

  if (resultPath) fs.writeFileSync(resultPath, `${JSON.stringify(result, null, 2)}\n`);
  setOutput('required', result.required);
  setOutput('approved', result.approved);
  setOutput('source_issue', result.sourceIssue || 0);
  setOutput('matching_comment_id', result.matchingCommentId || 0);
  setOutput('accepted_login', result.acceptedLogin || '');
  setOutput('accepted_author_association', result.acceptedAuthorAssociation || '');

  if (result.required && !result.approved) process.exitCode = 2;
}

if (import.meta.url === pathToFileURL(process.argv[1] || '').href) {
  await main();
}
