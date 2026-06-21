#!/usr/bin/env node

import fs from 'node:fs';
import process from 'node:process';
import { pathToFileURL } from 'node:url';
import {
  blockerDeclarationFailures,
  blockingMetadataFailures,
  implementationEvidenceFailures,
  preMergeReviewerDispositionFailures,
  preMergeReadinessBodyFailures,
  sourceIssueAccounting,
} from './post_merge_validator.mjs';

export class GateInputError extends Error {
  constructor(code, message) {
    super(message);
    this.name = 'GateInputError';
    this.code = code;
  }
}

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
  if (filePath === true || filePath === false) {
    throw new GateInputError('invalid_input_path', `Invalid file path option: ${String(filePath)}`);
  }
  if (!filePath || typeof filePath !== 'string') {
    return fallback;
  }
  if (!fs.existsSync(filePath)) {
    throw new GateInputError('missing_input_file', `Input file not found: ${filePath}`);
  }
  const raw = fs.readFileSync(filePath, 'utf8');
  if (!raw.trim()) {
    return fallback;
  }
  try {
    return JSON.parse(raw);
  } catch (error) {
    throw new GateInputError(
      'invalid_input_json',
      `Malformed JSON in ${filePath}: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

function normalizeFiles(files) {
  if (!Array.isArray(files)) return [];
  return files
    .filter((file) => file != null)
    .map((file) => {
      if (typeof file === 'string') return file;
      if (typeof file !== 'object') {
        return { filename: '', status: '' };
      }
      return {
        filename: file.filename || file.path || '',
        status: file.status || '',
      };
    });
}

function normalizePr(pr) {
  if (pr == null || typeof pr !== 'object') {
    return {
      number: null,
      body: '',
      isDraft: false,
      baseRefName: '',
      headSha: '',
      readyForReviewAt: '',
    };
  }
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
  const inputFailures = [];
  if (!Array.isArray(files)) {
    inputFailures.push({
      code: 'invalid_changed_files_input',
      message: 'Changed-file input must be a JSON array.',
    });
  }
  const normalizedFiles = Array.isArray(files) ? normalizeFiles(files) : [];
  const metadata = [
    ...preMergeReadinessBodyFailures(body),
    ...blockerDeclarationFailures(body),
  ].map((failure) => ({
    ...failure,
    message: failure.message
      .replaceAll('Merged PR body', 'PR body')
      .replaceAll('CI refused deterministic source issue closeout', 'merge is blocked'),
  }));
  const blockingMetadata = blockingMetadataFailures(metadata);
  const implementation = implementationEvidenceFailures({
    body,
    files: normalizedFiles,
  }).map((failure) => ({
    ...failure,
    message: failure.message
      .replaceAll('Merged PR body', 'PR body')
      .replaceAll('Merged changed file', 'Changed file')
      .replaceAll('left unchecked at merge', 'left unchecked before merge'),
  }));
  const reviewerDispositionFailures = preMergeReviewerDispositionFailures({
    body,
    issueComments: Array.isArray(issueComments) ? issueComments : [],
    reviewComments: Array.isArray(reviewComments) ? reviewComments : [],
    reviews: Array.isArray(reviews) ? reviews : [],
    headSha: normalizedPr.headSha,
    readyForReviewAt: normalizedPr.readyForReviewAt,
  });
  const sourceIssue = sourceIssueAccounting(body, { repository });
  const failures = [
    ...inputFailures,
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
    input_failures: inputFailures,
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
    `- Metadata failures: ${result.counts?.metadata_failures ?? 0}`,
    `- Implementation evidence failures: ${result.counts?.implementation_failures ?? 0}`,
    `- Reviewer disposition failures: ${result.counts?.reviewer_disposition_failures ?? 0}`,
  ];

  for (const [heading, failures] of [
    ['Metadata failures', result.metadata_failures || []],
    ['Implementation evidence failures', result.implementation_failures || []],
    ['Reviewer disposition failures', result.reviewer_disposition_failures || []],
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

  if (result.input_failures?.length) {
    lines.push('', '## Input failures');
    for (const failure of result.input_failures) {
      lines.push(`- ${failure.code}: ${failure.message}`);
    }
  }

  return `${lines.join('\n')}\n`;
}

function writeOutput(options, result) {
  if (!options.output || options.output === true) {
    return;
  }
  if (typeof options.output !== 'string') {
    throw new GateInputError('invalid_output_path', '--output requires a valid file path string');
  }
  fs.writeFileSync(options.output, `${JSON.stringify(result, null, 2)}\n`);
}

export async function main(argv = process.argv.slice(2)) {
  const options = parseArgs(argv);
  try {
    if (options.output === true) {
      throw new GateInputError('invalid_output_path', '--output requires a file path value');
    }

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
    writeOutput(options, result);
    if (result.status !== 'pass') {
      process.exitCode = 1;
    }
  } catch (error) {
    const inputFailures = error instanceof GateInputError
      ? [{ code: error.code, message: error.message }]
      : [{ code: 'gate_runtime_error', message: error instanceof Error ? error.message : String(error) }];
    const result = {
      status: 'fail',
      pr: null,
      source_issue: null,
      counts: {
        metadata_failures: 0,
        blocking_metadata_failures: 0,
        implementation_failures: 0,
        reviewer_disposition_failures: 0,
      },
      metadata_failures: [],
      implementation_failures: [],
      reviewer_disposition_failures: [],
      input_failures: inputFailures,
      failures: inputFailures,
    };
    process.stdout.write(renderGateReport(result));
    writeOutput(options, result);
    process.exitCode = 1;
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main();
}
