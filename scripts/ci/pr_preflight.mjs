#!/usr/bin/env node

import fs from 'node:fs';
import { classifyDeliveryProfile } from './delivery_profile.mjs';
import { buildDiffScopeReport } from './diff_scope_gate.mjs';
import { buildPrHygieneReport } from './pr_hygiene_audit.mjs';
import { sourceIssueAccounting } from './issue_accounting.mjs';
import { evaluatePostMergeReadinessGate } from './post_merge_readiness_gate.mjs';
import { determineQualityPlan } from './pr_class_quality_plan.mjs';
import {
  assessReviewerLifecycle,
  isActorApprovalReview,
  parseImplementationActor,
} from './reviewer_lifecycle_gate.mjs';

export function buildRequiredLocalCommands(qualityPlan = {}) {
  const commands = [];
  if (qualityPlan.typecheck) commands.push('npm run typecheck');
  if (qualityPlan.lint) commands.push('npm run lint');
  if (qualityPlan.test) commands.push('npm test');
  if (qualityPlan.build) commands.push('npm run build');
  return commands;
}

export function evaluatePrPreflight({
  body = '',
  baseRef = '',
  headRef = '',
  changedFiles = [],
  repository = '',
  pr = {},
  issueComments = [],
  reviewComments = [],
  reviews = [],
  reviewThreads = [],
  labels = [],
  sourceIssue = null,
  sourceIssueError = '',
} = {}) {
  const normalizedChangedFiles = Array.isArray(changedFiles) ? changedFiles : [];
  const deliveryProfile = classifyDeliveryProfile({
    baseRef,
    headRef,
    body,
    changedFiles: normalizedChangedFiles,
  });
  const qualityPlan = determineQualityPlan({ body, deliveryProfile });
  const scopeResult = buildDiffScopeReport({ body, changedFiles: normalizedChangedFiles });
  // Informational only, matching pr-hygiene's existing advisory (non-blocking)
  // status — does not affect `result` below (#2619 shared validation authority).
  const hygieneResult = buildPrHygieneReport({ body, changedFiles: normalizedChangedFiles });
  const sourceIssueResult = sourceIssueAccounting(body, { repository });
  const githubEvidence = {
    prBody: Boolean(body),
    changedFiles: Array.isArray(changedFiles),
    reviews: reviews.length > 0,
    reviewThreads: reviewThreads.length > 0,
    sourceIssue: Boolean(sourceIssue),
    labels: labels.length > 0,
  };

  const reviewThreadResult = assessReviewerLifecycle({
    eventName: 'pull_request',
    labels,
    files: normalizedChangedFiles.map((filename) => ({ filename })),
    reviews,
    reviewThreads,
    implementationActor: pr.implementationActor
      || parseImplementationActor(body)
      || pr.author?.login
      || pr.user?.login
      || '',
    requireActorIndependentApproval: reviews.some(isActorApprovalReview),
    enforceFailure: false,
  });

  const closeoutApplicable = ['A', 'B-promotion'].includes(deliveryProfile.deliveryModel);
  let closeoutPrediction = {
    applicable: false,
    status: 'not-applicable',
    failures: [],
  };

  if (closeoutApplicable) {
    const readiness = evaluatePostMergeReadinessGate({
      pr: {
        ...pr,
        body,
        baseRefName: baseRef,
        headSha: pr.headSha || pr.head?.sha || '',
        readyForReviewAt: pr.readyForReviewAt || pr.updated_at || '',
      },
      files: normalizedChangedFiles.map((filename) => ({ filename })),
      issueComments,
      reviewComments,
      reviews,
      repository,
    });
    closeoutPrediction = {
      applicable: true,
      status: readiness.status,
      failures: readiness.failures,
    };
  }

  const blocks = deliveryProfile.errors.map((error) => ({
    code: error.code,
    message: error.message,
  }));
  const failures = [];

  if (!scopeResult.ok && scopeResult.hasAllowedFiles) {
    failures.push({
      code: 'scope_allowlist_mismatch',
      message: 'Changed files outside declared allowlist.',
      unlistedChangedFiles: scopeResult.unlistedChangedFiles,
    });
  }

  if (sourceIssueResult.failures.length) {
    failures.push(...sourceIssueResult.failures.map((failure) => ({
      code: failure.code,
      message: failure.message,
    })));
  }

  if (sourceIssueError) {
    failures.push({
      code: 'source_issue_lookup_failed',
      message: sourceIssueError,
    });
  }

  let result = 'pass';
  if (blocks.length) {
    result = 'block';
  } else if (
    failures.length
    || (closeoutPrediction.applicable && closeoutPrediction.status === 'fail')
    || !reviewThreadResult.assessment.ok
  ) {
    result = 'fail';
  }

  return {
    schemaVersion: 1,
    deliveryProfile,
    qualityPlan,
    scopeResult,
    hygieneResult,
    requiredLocalCommands: buildRequiredLocalCommands(qualityPlan),
    githubEvidence,
    reviewThreadResult: {
      status: reviewThreadResult.assessment.ok ? 'pass' : 'fail',
      severity: reviewThreadResult.assessment.severity,
      blockingReasons: reviewThreadResult.blockingReasons,
    },
    sourceIssueAccounting: sourceIssueResult,
    closeoutPrediction,
    protectedChange: deliveryProfile.protectedChange,
    result,
    blocks,
    failures,
  };
}

export function renderPreflightReport(result) {
  const lines = [
    `PR preflight result: ${result.result}`,
    '',
    '## Delivery profile',
    `- Delivery model: ${result.deliveryProfile.deliveryModel || 'unknown'}`,
    `- Gate profile: ${result.deliveryProfile.gateProfile || 'unknown'}`,
    `- Protected change: ${result.protectedChange ? 'yes' : 'no'}`,
    '',
    '## Quality plan',
    `- PR class: ${result.qualityPlan.prClass}`,
    `- Run typecheck: ${result.qualityPlan.typecheck ? 'yes' : 'no'}`,
    `- Run lint: ${result.qualityPlan.lint ? 'yes' : 'no'}`,
    `- Run unit tests: ${result.qualityPlan.test ? 'yes' : 'no'}`,
    `- Run production build: ${result.qualityPlan.build ? 'yes' : 'no'}`,
    '',
    '## Scope',
    result.scopeResult.ok
      ? '- All changed files are covered by the allowlist.'
      : `- Scope advisory: ${result.scopeResult.unlistedChangedFiles.length} unlisted file(s)`,
    '',
    '## PR hygiene (advisory)',
    result.hygieneResult.isClean
      ? '- No PR hygiene defects detected.'
      : `- Hygiene advisory: ${result.hygieneResult.missingSections.length} missing section(s), ${result.hygieneResult.unlistedChangedFiles.length} unlisted file(s).`,
    '',
    '## Required local commands',
    ...result.requiredLocalCommands.map((command) => `- \`${command}\``),
    '',
    '## GitHub evidence availability',
    `- PR body: ${result.githubEvidence.prBody ? 'yes' : 'no'}`,
    `- Changed files: ${result.githubEvidence.changedFiles ? 'yes' : 'no'}`,
    `- Reviews: ${result.githubEvidence.reviews ? 'yes' : 'no'}`,
    `- Review threads: ${result.githubEvidence.reviewThreads ? 'yes' : 'no'}`,
    `- Source issue snapshot: ${result.githubEvidence.sourceIssue ? 'yes' : 'no'}`,
    '',
    '## Review/thread result',
    `- Status: ${result.reviewThreadResult.status}`,
    `- Severity: ${result.reviewThreadResult.severity}`,
    '',
    '## Source issue accounting',
    `- Issue number: ${result.sourceIssueAccounting.issueNumber || 'none'}`,
    `- Failures: ${result.sourceIssueAccounting.failures.length}`,
    '',
    '## Closeout prediction',
    `- Applicable: ${result.closeoutPrediction.applicable ? 'yes' : 'no'}`,
    `- Status: ${result.closeoutPrediction.status}`,
  ];

  if (result.blocks.length) {
    lines.push('', '## Blocks');
    for (const block of result.blocks) {
      lines.push(`- ${block.code}: ${block.message}`);
    }
  }

  if (result.failures.length) {
    lines.push('', '## Failures');
    for (const failure of result.failures) {
      lines.push(`- ${failure.code}: ${failure.message}`);
    }
  }

  return lines.join('\n');
}

function readJsonFile(path, fallback) {
  if (!path || !fs.existsSync(path)) return fallback;
  return JSON.parse(fs.readFileSync(path, 'utf8'));
}

function readListFile(path) {
  if (!path || !fs.existsSync(path)) return [];
  return fs.readFileSync(path, 'utf8').split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
}

export function runCli(env = process.env) {
  const bodyPath = env.PR_PREFLIGHT_BODY_FILE || env.PR_BODY_FILE || env.PR_HYGIENE_BODY_FILE;
  if (!bodyPath || !fs.existsSync(bodyPath)) {
    console.error('PR_PREFLIGHT_BODY_FILE or PR_BODY_FILE is required and must point to an existing file.');
    return 2;
  }

  const body = fs.readFileSync(bodyPath, 'utf8');
  const changedFiles = readListFile(env.PR_PREFLIGHT_CHANGED_FILES_FILE || env.CHANGED_FILES_FILE);
  const pr = readJsonFile(env.PR_PREFLIGHT_PR_JSON, {});
  const reviews = readJsonFile(env.PR_PREFLIGHT_REVIEWS_JSON, []);
  const reviewComments = readJsonFile(env.PR_PREFLIGHT_REVIEW_COMMENTS_JSON, []);
  const reviewThreads = readJsonFile(env.PR_PREFLIGHT_REVIEW_THREADS_JSON, []);
  const issueComments = readJsonFile(env.PR_PREFLIGHT_ISSUE_COMMENTS_JSON, []);
  const labels = readJsonFile(env.PR_PREFLIGHT_LABELS_JSON, []);
  const sourceIssue = readJsonFile(env.PR_PREFLIGHT_SOURCE_ISSUE_JSON, null);

  const result = evaluatePrPreflight({
    body,
    baseRef: env.PR_BASE_REF || pr.baseRefName || pr.base?.ref || '',
    headRef: env.PR_HEAD_REF || pr.headRefName || pr.head?.ref || '',
    changedFiles,
    repository: env.GITHUB_REPOSITORY || '',
    pr,
    issueComments,
    reviewComments,
    reviews,
    reviewThreads,
    labels,
    sourceIssue,
    sourceIssueError: env.PR_PREFLIGHT_SOURCE_ISSUE_ERROR || '',
  });

  const report = renderPreflightReport(result);
  console.log(report);

  const jsonPath = env.PR_PREFLIGHT_RESULT_JSON;
  if (jsonPath) {
    fs.writeFileSync(jsonPath, `${JSON.stringify(result, null, 2)}\n`);
  }

  if (result.result === 'block') return 2;
  if (result.result === 'fail') return 1;
  return 0;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  process.exitCode = runCli();
}
