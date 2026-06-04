#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

export const AI_BUILD_LABEL = 'ai-build';

export const REQUIRED_SECTIONS = [
  '## Approved Task',
  '## Scope',
  '## Allowed Files',
  '## Acceptance Criteria',
  '## Validation',
];

export const UNSAFE_PATH_RULES = [
  {
    id: 'workflow-glob',
    test: (value) => value === '.github/workflows/*' || value.startsWith('.github/workflows/'),
    message: 'Workflow paths are not allowed in Allowed Files',
  },
  {
    id: 'recursive-glob',
    test: (value) => value === '**/*' || value.includes('**/*'),
    message: 'Recursive wildcard paths are not allowed',
  },
  {
    id: 'dotenv',
    test: (value) => value === '.env' || value.startsWith('.env.'),
    message: 'Environment files are not allowed',
  },
  {
    id: 'secrets',
    test: (value) => /secret|credential|private[_-]?key|api[_-]?key/i.test(value),
    message: 'Paths that may contain secrets are not allowed',
  },
  {
    id: 'traversal',
    test: (value) => {
      const segments = value.split(/[/\\]/);
      return (
        segments.includes('..') ||
        value.startsWith('/') ||
        value.startsWith('\\') ||
        /^[a-zA-Z]:[/\\]/.test(value)
      );
    },
    message: 'Path traversal and absolute paths are not allowed',
  },
];

export function parseSectionMap(body = '') {
  const sections = new Map();
  const lines = String(body).split(/\r?\n/);
  let currentHeading = null;
  let currentLines = [];

  const flush = () => {
    if (!currentHeading) return;
    sections.set(currentHeading, currentLines.join('\n').trim());
  };

  for (const line of lines) {
    const headingMatch = /^##\s+(.+)$/.exec(line);
    if (headingMatch) {
      flush();
      currentHeading = `## ${headingMatch[1].trim()}`;
      currentLines = [];
      continue;
    }
    if (currentHeading) currentLines.push(line);
  }

  flush();
  return sections;
}

export function getSectionBody(body, heading) {
  return parseSectionMap(body).get(heading) || '';
}

export function extractAllowedFiles(body = '') {
  const sectionBody = getSectionBody(body, '## Allowed Files');
  if (!sectionBody) return [];

  const files = [];
  for (const line of sectionBody.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    const bulletMatch = /^[-*]\s+`?([^\s`]+)`?\s*$/.exec(trimmed);
    const inlineMatch = /^`([^\s`]+)`$/.exec(trimmed);
    const plainMatch = /^[-*]?\s*([^\s#]+)\s*$/.exec(trimmed);

    const candidate = bulletMatch?.[1] || inlineMatch?.[1] || plainMatch?.[1];
    if (!candidate) continue;
    files.push(candidate.trim());
  }

  return [...new Set(files)];
}

export function isUnsafeAllowedPath(filePath) {
  const normalized = String(filePath || '').trim();
  if (!normalized) {
    return { unsafe: true, ruleId: 'empty', message: 'Allowed file entry is empty' };
  }

  for (const rule of UNSAFE_PATH_RULES) {
    if (rule.test(normalized)) {
      return { unsafe: true, ruleId: rule.id, message: rule.message };
    }
  }

  return { unsafe: false };
}

export function findMissingRequiredSections(body = '') {
  const sectionMap = parseSectionMap(body);
  return REQUIRED_SECTIONS.filter((heading) => !sectionMap.has(heading) || !sectionMap.get(heading));
}

export function assessAllowedFiles(body = '') {
  const files = extractAllowedFiles(body);
  const errors = [];

  if (!files.length) {
    errors.push('## Allowed Files is missing or empty');
  }

  for (const filePath of files) {
    const unsafe = isUnsafeAllowedPath(filePath);
    if (unsafe.unsafe) {
      errors.push(`${filePath}: ${unsafe.message}`);
    }
  }

  return { files, errors };
}

export function isPullRequestIssue(issue = {}) {
  return Boolean(issue.pull_request);
}

export function getAddedLabelName(event = {}) {
  return event?.label?.name || '';
}

export function assessAiBuildIssueEvent(event = {}) {
  const action = event?.action || '';
  const labelName = getAddedLabelName(event);
  const issue = event?.issue || {};

  if (action === 'labeled' && labelName !== AI_BUILD_LABEL) {
    return {
      status: 'noop',
      ok: true,
      skipped: true,
      reason: 'label-not-ai-build',
      label: labelName,
      issueNumber: issue.number ?? null,
      errors: [],
      allowedFiles: [],
    };
  }

  if (action !== 'labeled' || labelName !== AI_BUILD_LABEL) {
    return {
      status: 'noop',
      ok: true,
      skipped: true,
      reason: 'unsupported-event',
      label: labelName,
      issueNumber: issue.number ?? null,
      errors: [],
      allowedFiles: [],
    };
  }

  if (isPullRequestIssue(issue)) {
    return {
      status: 'failed',
      ok: false,
      skipped: false,
      reason: 'issue-is-pull-request',
      label: labelName,
      issueNumber: issue.number ?? null,
      errors: ['Issue event is associated with a pull request and cannot be executed'],
      allowedFiles: [],
    };
  }

  const body = issue.body || '';
  const missingSections = findMissingRequiredSections(body);
  const allowed = assessAllowedFiles(body);
  const errors = [];

  if (typeof issue.number !== 'number' || issue.number <= 0) {
    errors.push('Issue number is missing or invalid');
  }

  for (const heading of missingSections) {
    errors.push(`Missing required section: ${heading}`);
  }

  errors.push(...allowed.errors);

  return {
    status: errors.length ? 'failed' : 'passed',
    ok: errors.length === 0,
    skipped: false,
    reason: errors.length ? 'validation-failed' : 'validation-passed',
    label: labelName,
    issueNumber: issue.number ?? null,
    issueTitle: issue.title || '',
    errors,
    allowedFiles: allowed.files,
    sections: Object.fromEntries(
      REQUIRED_SECTIONS.map((heading) => [heading, getSectionBody(body, heading)]),
    ),
  };
}

export function buildResultPayload(assessment, repository = '') {
  return {
    bridge: 'ai-execution',
    version: 1,
    repository,
    generatedAt: new Date().toISOString(),
    ...assessment,
  };
}

export function loadGithubEvent(eventPath) {
  const raw = fs.readFileSync(eventPath, 'utf8');
  return JSON.parse(raw);
}

export function writeJsonOutput(filePath, payload) {
  fs.writeFileSync(filePath, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
}

export function runValidation({
  eventPath = process.env.GITHUB_EVENT_PATH,
  outputPath = process.env.AI_EXECUTION_BRIDGE_RESULT_PATH || 'ai-execution-bridge-result.json',
  repository = process.env.GITHUB_REPOSITORY || '',
} = {}) {
  if (!eventPath) {
    throw new Error('GITHUB_EVENT_PATH is required');
  }

  const event = loadGithubEvent(eventPath);
  const assessment = assessAiBuildIssueEvent(event);
  const payload = buildResultPayload(assessment, repository);
  writeJsonOutput(outputPath, payload);

  if (!assessment.ok && !assessment.skipped) {
    return { exitCode: 1, payload };
  }

  return { exitCode: 0, payload };
}

export function main() {
  try {
    const { exitCode } = runValidation();
    process.exit(exitCode);
  } catch (error) {
    const payload = buildResultPayload({
      status: 'failed',
      ok: false,
      skipped: false,
      reason: 'validator-error',
      errors: [error instanceof Error ? error.message : String(error)],
      allowedFiles: [],
    });
    const outputPath = process.env.AI_EXECUTION_BRIDGE_RESULT_PATH || 'ai-execution-bridge-result.json';
    writeJsonOutput(outputPath, payload);
    console.error(error);
    process.exit(1);
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main();
}
