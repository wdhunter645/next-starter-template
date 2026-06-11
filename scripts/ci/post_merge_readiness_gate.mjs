#!/usr/bin/env node

import fs from 'node:fs';
import process from 'node:process';
import {
  blockingMetadataFailures,
  implementationEvidenceFailures,
  preMergeReviewerDispositionFailures,
  preMergeReadinessBodyFailures,
  sourceIssueAccounting,
} from './post_merge_validator.mjs';

function parseArgs(argv = process.argv.slice(2)) {
  const options = {};
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (!arg.startsWith('--')) continue;
    const key = arg.slice(2).replace(/-([a-z])/g, (_, char) => char.toUpperCase());
    const next = argv[index + 1];
    if (!next || next.startsWith('--')) {
      options[key] = true;
    } else {
      options[key] = next;
      index += 1;
    }
  }
  return options;
}

function readJson(filePath, fallback) {
  if (!filePath) return fallback;
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function normalizeFiles(files = []) {
  return files.map((file) => {
    if (typeof file === 'string') return file;
    return {
      filename: file.filename || file.path || '',
      status: file.status || '',
    };
  });
}

function normalizePr(pr = {}) {
  return {
    number: pr.number || pr.pull_number || null,
    body: pr.body || '',
    isDraft: pr.isDraft ?? pr.draft ?? false,
    baseRefName: pr.baseRefName || pr.base?.ref || '',
    headSha: pr.headSha || pr.head?.sha || '',
    readyForReviewAt: pr.readyForReviewAt || pr.ready_for_review_at || pr.updated_at || pr.created_at || '',
  };
}

export function evaluatePostMergeReadinessGate({
  pr = {},
  files = [],
  issueComments = [],
  reviewComments = [],
  reviews = [],
  repository = '',
} = {}) {
  const normalizedPr = normalizePr(pr);
  const body = normalizedPr.body || '';
  const normalizedFiles = normalizeFiles(files);
  const metadata = preMergeReadinessBodyFailures(body);
  const blockingMetadata = blockingMetadataFailures(metadata);
  const implementation = implementationEvidenceFailures({ body, files: normalizedFiles });
  const reviewerDispositionFailures = preMergeReviewerDispositionFailures({
    body,
    issueComments,
    reviewComments,
    reviews,
    headSha: normalizedPr.headSha,
    readyForReviewAt: normalizedPr.readyForReviewAt,
  });
  const sourceIssue = sourceIssueAccounting(body, { repository });
  const failures = [
    ...blockingMetadata,
    ...implementation,
    ...reviewerDispositionFailures,
  ];

  return {
    status: failures.length === 0 ? 'pass' : 'fail',
    pr: normalizedPr.number,
    source_issue: sourceIssue.issueNumber || null,
    counts: {
      metadata_failures: metadata.length,
      blocking_metadata_failures: blockingMetadata.length,
      implementation_failures: implementation.length,
      reviewer_disposition_failures: reviewerDispositionFailures.length,
    },
    metadata_failures: metadata,
    implementation_failures: implementation,
    reviewer_disposition_failures: reviewerDispositionFailures,
    failures,
  };
}

export function renderGateReport(result) {
  const lines = [
    `Post-merge readiness gate result: ${result.status}`,
    '',
    '## Summary',
    `- PR: ${result.pr ? `#${result.pr}` : 'unknown'}`,
    `- Source issue: ${result.source_issue ? `#${result.source_issue}` : 'none'}`,
    `- Metadata failures: ${result.counts.metadata_failures}`,
    `- Implementation evidence failures: ${result.counts.implementation_failures}`,
    `- Reviewer disposition failures: ${result.counts.reviewer_disposition_failures}`,
  ];

  for (const [heading, failures] of [
    ['Metadata failures', result.metadata_failures],
    ['Implementation evidence failures', result.implementation_failures],
    ['Reviewer disposition failures', result.reviewer_disposition_failures],
  ]) {
    lines.push('', `## ${heading}`);
    if (!failures.length) {
      lines.push('- none');
      continue;
    }
    for (const failure of failures) {
      lines.push(`- ${failure.code}: ${failure.message}`);
    }
  }

  return `${lines.join('\n')}\n`;
}

export async function main(argv = process.argv.slice(2)) {
  const options = parseArgs(argv);
  const pr = readJson(options.pr, {});
  const files = readJson(options.files, []);
  const issueComments = readJson(options.issueComments, []);
  const reviewComments = readJson(options.reviewComments, []);
  const reviews = readJson(options.reviews, []);
  const result = evaluatePostMergeReadinessGate({
    pr,
    files,
    issueComments,
    reviewComments,
    reviews,
    repository: options.repository || process.env.GITHUB_REPOSITORY || '',
  });

  const report = renderGateReport(result);
  process.stdout.write(report);
  if (options.output) {
    fs.writeFileSync(options.output, `${JSON.stringify(result, null, 2)}\n`);
  }
  if (result.status !== 'pass') {
    process.exitCode = 1;
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
