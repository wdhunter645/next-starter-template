#!/usr/bin/env node

import fs from 'node:fs';
import { pathToFileURL } from 'node:url';

export const APPROVAL_MARKER = '<!-- lgfc-role-approval:v1 -->';
export const GUARD_COMMENT_MARKER = '<!-- lgfc-role-approval-guard:v1 -->';

const REQUIRED_REVIEWER_ROLE = 'pr approver / engineering';
const REQUIRED_REVIEWER_ACTOR = 'chatgpt / atlas';

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

function parseApprovalComment(comment = {}) {
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
  };
}

function isMatchingApproval(event, {
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
  if (recordedImplementer === normalize(event.reviewerActor)) return false;

  return true;
}

export function evaluateRoleApprovalGuard({
  prBody = '',
  changedFiles = [],
  comments = [],
  prNumber = 0,
  headSha = '',
  implementationActor = '',
} = {}) {
  const sourceIssue = parseSourceIssueNumber(prBody);
  const required = isProtectedApprovalScope({ prBody, changedFiles });

  if (!required) {
    return {
      required: false,
      approved: true,
      sourceIssue,
      matchingCommentId: 0,
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

  const matching = comments
    .map(parseApprovalComment)
    .filter(Boolean)
    .find((event) => isMatchingApproval(event, {
      sourceIssue,
      prNumber,
      headSha,
      implementationActor,
    }));

  if (!matching) {
    blockedReasons.push({
      code: 'missing-role-approval',
      message: 'No valid exact-head ChatGPT / Atlas APPROVED FOR INTEGRATION event exists on the source Issue.',
    });
  }

  return {
    required: true,
    approved: blockedReasons.length === 0,
    sourceIssue,
    matchingCommentId: matching?.commentId || 0,
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
  const result = evaluateRoleApprovalGuard({
    prBody: prBodyPath && fs.existsSync(prBodyPath) ? fs.readFileSync(prBodyPath, 'utf8') : '',
    changedFiles: readLines(process.env.CHANGED_FILES_FILE),
    comments: readJson(process.env.SOURCE_ISSUE_COMMENTS_JSON, []),
    prNumber: Number(process.env.PR_NUMBER || 0),
    headSha: process.env.HEAD_SHA || '',
    implementationActor: process.env.IMPLEMENTATION_ACTOR || '',
  });

  if (resultPath) fs.writeFileSync(resultPath, `${JSON.stringify(result, null, 2)}\n`);
  setOutput('required', result.required);
  setOutput('approved', result.approved);
  setOutput('source_issue', result.sourceIssue || 0);
  setOutput('matching_comment_id', result.matchingCommentId || 0);

  if (result.required && !result.approved) process.exitCode = 2;
}

if (import.meta.url === pathToFileURL(process.argv[1] || '').href) {
  await main();
}
