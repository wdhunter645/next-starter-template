#!/usr/bin/env node

import fs from 'node:fs';

export const REQUIRED_TEMPLATE_SECTIONS = [
  'MANDATORY FIRST STEP (ZIP SAFETY)',
  'DESIGN SOURCE OF TRUTH (NON-NEGOTIABLE)',
  'FILE-TOUCH ALLOWLIST (MANDATORY)',
  'VISUAL / UX INVARIANTS (MANDATORY)',
  'REQUIRED PRE-REVIEW SELF-CHECK',
];

export function findIssueReferences(body) {
  const text = body || '';
  return [...text.matchAll(/#(\d+)/g)].map((match) => Number(match[1]));
}

export function hasRequiredIssueLine(body) {
  return /^- \*\*Issue:\*\* #\d+\s*$/m.test(body || '');
}

export function findCanonicalIssueLine(body) {
  const text = body || '';
  return text.split(/\r?\n/).find((line) => /^- \*\*Issue:\*\* #\d+\s*$/.test(line.trim())) || '';
}

export function suggestCanonicalIssueLine(body) {
  const references = [...new Set(findIssueReferences(body))];
  if (references.length !== 1) return '';
  return `- **Issue:** #${references[0]}`;
}

export function hasZipSafetyStatement(body) {
  const text = body || '';
  return /No ZIP file exists in the repo root/i.test(text)
    || /No ZIP found in repo root/i.test(text)
    || /Any ZIP file present in the repo root was deleted before any other change/i.test(text);
}

export function parseAllowedFiles(body) {
  const lines = (body || '').split(/\r?\n/);
  const allowedIndex = lines.findIndex((line) => /^Allowed files:\s*$/i.test(line.trim()));
  if (allowedIndex === -1) return [];

  const files = [];
  for (const line of lines.slice(allowedIndex + 1)) {
    if (/^##\s+/.test(line)) break;
    const match = line.match(/^\s*-\s+`?([^`\n]+?)`?\s*$/);
    if (match) files.push(match[1].trim());
    if (line.trim() === 'All other files are out of scope') break;
  }
  return files;
}

export function missingTemplateSections(body) {
  const text = body || '';
  return REQUIRED_TEMPLATE_SECTIONS.filter((section) => !text.includes(`## ${section}`));
}

function allowedFileMatches(changedFile, allowedPattern) {
  if (allowedPattern.endsWith('/**')) {
    return changedFile.startsWith(allowedPattern.slice(0, -3));
  }
  return changedFile === allowedPattern;
}

export function findUnlistedChangedFiles(changedFiles, allowedFiles) {
  return changedFiles.filter((changedFile) => !allowedFiles.some((allowedFile) => allowedFileMatches(changedFile, allowedFile)));
}

export function buildPrHygieneReport({ body = '', changedFiles = [] } = {}) {
  const allowedFiles = parseAllowedFiles(body);
  const missingSections = missingTemplateSections(body);
  const unlistedChangedFiles = findUnlistedChangedFiles(changedFiles, allowedFiles);
  const issueReferences = [...new Set(findIssueReferences(body))];
  const canonicalIssueLine = findCanonicalIssueLine(body);
  const suggestedIssueLine = hasRequiredIssueLine(body) ? canonicalIssueLine : suggestCanonicalIssueLine(body);

  return {
    hasRequiredIssueLine: hasRequiredIssueLine(body),
    issueReferences,
    canonicalIssueLine,
    suggestedIssueLine,
    hasZipSafetyStatement: hasZipSafetyStatement(body),
    missingSections,
    allowedFiles,
    unlistedChangedFiles,
    isClean: hasRequiredIssueLine(body)
      && hasZipSafetyStatement(body)
      && missingSections.length === 0
      && unlistedChangedFiles.length === 0,
  };
}

export function renderPrHygieneReport(report) {
  const lines = ['## PR Hygiene Advisory', ''];

  if (report.isClean) {
    lines.push('No PR hygiene defects detected.');
    return lines.join('\n');
  }

  if (!report.hasRequiredIssueLine) {
    lines.push('- Missing canonical source issue line: `- **Issue:** #123`.');
    if (report.suggestedIssueLine) {
      lines.push(`  - Suggested correction: \`${report.suggestedIssueLine}\`.`);
    }
    if (report.issueReferences.length > 1) {
      lines.push(`  - Multiple issue references detected: ${report.issueReferences.map((issue) => `#${issue}`).join(', ')}. Keep exactly one primary source issue in the canonical line.`);
    }
  }

  if (!report.hasZipSafetyStatement) {
    lines.push('- Missing ZIP safety statement under `MANDATORY FIRST STEP (ZIP SAFETY)`.');
  }

  for (const section of report.missingSections) {
    lines.push(`- Missing required PR template section: \`${section}\`.`);
  }

  if (report.unlistedChangedFiles.length > 0) {
    lines.push('- Changed files not covered by `Allowed files:`:');
    for (const file of report.unlistedChangedFiles) {
      lines.push(`  - \`${file}\``);
    }
  }

  if (report.allowedFiles.length === 0) {
    lines.push('- Missing or empty `Allowed files:` list under `FILE-TOUCH ALLOWLIST (MANDATORY)`.');
  }

  return lines.join('\n');
}

function readListFile(path) {
  if (!path || !fs.existsSync(path)) return [];
  return fs.readFileSync(path, 'utf8').split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
}

export function runCli(env = process.env) {
  const bodyPath = env.PR_HYGIENE_BODY_FILE;
  const changedFilesPath = env.PR_HYGIENE_CHANGED_FILES_FILE;

  if (!bodyPath || !fs.existsSync(bodyPath)) {
    console.error('PR_HYGIENE_BODY_FILE is required.');
    return 2;
  }

  const body = fs.readFileSync(bodyPath, 'utf8');
  const changedFiles = readListFile(changedFilesPath);
  const report = buildPrHygieneReport({ body, changedFiles });
  console.log(renderPrHygieneReport(report));

  return report.isClean ? 0 : 1;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  process.exitCode = runCli();
}
