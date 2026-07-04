#!/usr/bin/env node

import fs from 'node:fs';
import { findUnlistedChangedFiles, parseAllowedFiles } from './pr_hygiene_audit.mjs';

export function buildDiffScopeReport({ body = '', changedFiles = [] } = {}) {
  const allowedFiles = parseAllowedFiles(body);
  const unlistedChangedFiles = findUnlistedChangedFiles(changedFiles, allowedFiles);

  return {
    allowedFiles,
    changedFiles,
    unlistedChangedFiles,
    hasAllowedFiles: allowedFiles.length > 0,
    ok: allowedFiles.length > 0 && unlistedChangedFiles.length === 0,
  };
}

export function renderDiffScopeReport(report) {
  const lines = ['## Diff Scope Gate', ''];

  if (report.ok) {
    lines.push('All changed files are covered by the PR `Allowed paths:` list.');
    return lines.join('\n');
  }

  if (!report.hasAllowedFiles) {
    lines.push('- Missing or empty `Allowed paths:` list in the PR body.');
  }

  if (report.unlistedChangedFiles.length > 0) {
    lines.push('- Changed files outside declared `Allowed paths:`:');
    for (const file of report.unlistedChangedFiles) {
      lines.push(`  - \`${file}\``);
    }
  }

  return lines.join('\n');
}

function readListFile(path) {
  if (!path || !fs.existsSync(path)) return [];
  return fs.readFileSync(path, 'utf8').split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
}

export function runCli(env = process.env) {
  const bodyPath = env.DIFF_SCOPE_BODY_FILE || env.PR_HYGIENE_BODY_FILE;
  const changedFilesPath = env.DIFF_SCOPE_CHANGED_FILES_FILE || env.PR_HYGIENE_CHANGED_FILES_FILE;

  if (!bodyPath || !fs.existsSync(bodyPath)) {
    console.error('DIFF_SCOPE_BODY_FILE or PR_HYGIENE_BODY_FILE is required.');
    return 2;
  }

  const body = fs.readFileSync(bodyPath, 'utf8');
  const changedFiles = readListFile(changedFilesPath);
  const report = buildDiffScopeReport({ body, changedFiles });
  console.log(renderDiffScopeReport(report));

  return report.ok ? 0 : 1;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  process.exitCode = runCli();
}
