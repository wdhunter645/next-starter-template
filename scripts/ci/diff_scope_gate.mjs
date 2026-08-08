#!/usr/bin/env node

import fs from 'node:fs';
import { findUnlistedChangedFiles, parseAllowedFiles } from './pr_hygiene_audit.mjs';
import {
  appendRetryEvidence,
  GitHubApiTransientError,
  githubApiRequestWithRetry,
} from './github_api_retry.mjs';

export const DIFF_SCOPE_MARKER = '<!-- diff-scope-advisory -->';

export function buildDiffScopeReport({ body = '', changedFiles = [], retryEvidence = [] } = {}) {
  const allowedFiles = parseAllowedFiles(body);
  const unlistedChangedFiles = findUnlistedChangedFiles(changedFiles, allowedFiles);

  return {
    gate: 'diff-scope',
    schemaVersion: 2,
    advisory: true,
    classification: 'policy',
    allowedFiles,
    changedFiles,
    unlistedChangedFiles,
    hasAllowedFiles: allowedFiles.length > 0,
    ok: allowedFiles.length > 0 && unlistedChangedFiles.length === 0,
    retryAttempts: retryEvidence.length,
    retryEvidence,
  };
}

export function buildDiffScopeInfrastructureReport({ error, prNumber = '' } = {}) {
  return {
    gate: 'diff-scope',
    schemaVersion: 2,
    advisory: true,
    classification: 'infrastructure-transient',
    infrastructureFailure: true,
    reason: 'github-api-transient-failure',
    ok: false,
    prNumber: String(prNumber || ''),
    allowedFiles: [],
    changedFiles: [],
    unlistedChangedFiles: [],
    hasAllowedFiles: false,
    retryAttempts: error.attempts || error.attemptLog?.length || 0,
    retryEvidence: error.attemptLog || [],
  };
}

export function renderDiffScopeReport(report) {
  if (report.infrastructureFailure) {
    const lines = [
      '## Diff Scope Gate',
      '',
      'Repository policy evaluation did not complete.',
      '',
      '- Classification: infrastructure-transient',
      '- Reason: GitHub API transient failures exhausted the bounded retry policy.',
    ];

    if (report.retryEvidence?.length) {
      lines.push('', '## Retry evidence');
      for (const attempt of report.retryEvidence) {
        lines.push(`- attempt ${attempt.attempt}: status ${attempt.status} — ${attempt.outcome}${attempt.delayMs ? ` — next backoff ${attempt.delayMs}ms` : ''}`);
      }
    }

    return lines.join('\n');
  }

  const lines = ['## Diff Scope Gate', ''];

  if (report.ok) {
    lines.push('All changed files are covered by the PR `Allowed paths:` list.');
  } else {
    if (!report.hasAllowedFiles) {
      lines.push('- Missing or empty `Allowed paths:` list in the PR body.');
    }

    if (report.unlistedChangedFiles.length > 0) {
      lines.push('- Changed files outside declared `Allowed paths:`:');
      for (const file of report.unlistedChangedFiles) {
        lines.push(`  - \`${file}\``);
      }
    }
  }

  if (report.retryEvidence?.length) {
    lines.push('', '## Retry evidence');
    for (const attempt of report.retryEvidence) {
      lines.push(`- ${attempt.operation}: attempt ${attempt.attempt} status ${attempt.status} — ${attempt.outcome}${attempt.delayMs ? ` — next backoff ${attempt.delayMs}ms` : ''}`);
    }
  }

  return lines.join('\n');
}

export function writeDiffScopeArtifacts(report, env = process.env) {
  const jsonPath = env.DIFF_SCOPE_RESULT_JSON || env.PR_VALIDATION_RESULT_JSON;
  const markdownPath = env.DIFF_SCOPE_RESULT_MD || env.PR_VALIDATION_RESULT_MD;

  if (jsonPath) {
    fs.writeFileSync(jsonPath, `${JSON.stringify(report, null, 2)}\n`);
  }
  if (markdownPath) {
    fs.writeFileSync(markdownPath, `${renderDiffScopeReport(report)}\n`);
  }
}

function readListFile(path) {
  if (!path || !fs.existsSync(path)) return [];
  return fs.readFileSync(path, 'utf8').split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
}

async function requestGitHub(path, token, { method = 'GET', body, headers = {} } = {}, { fetchFn, sleepFn, retryEvidence } = {}) {
  const response = await githubApiRequestWithRetry({
    url: `https://api.github.com${path}`,
    method,
    headers: {
      Authorization: ['Bearer', token].join(' '),
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'User-Agent': 'lgfc-diff-scope-gate',
      ...(body ? { 'Content-Type': 'application/json' } : {}),
      ...headers,
    },
    ...(body !== undefined ? { body } : {}),
    fetchFn,
    sleepFn,
  });
  appendRetryEvidence(retryEvidence, `${method} ${path}`, response.attemptLog);
  return response.data;
}

async function paginateGitHub(path, token, dependencies = {}) {
  const results = [];
  let page = 1;

  while (true) {
    const separator = path.includes('?') ? '&' : '?';
    const data = await requestGitHub(`${path}${separator}per_page=100&page=${page}`, token, {}, dependencies);
    if (!Array.isArray(data) || data.length === 0) break;
    results.push(...data);
    if (data.length < 100) break;
    page += 1;
  }

  return results;
}

export async function resolveDiffScopeContext({
  token,
  repository,
  prNumber,
  fetchFn,
  sleepFn,
  retryEvidence = [],
} = {}) {
  const [owner, repo] = String(repository || '').split('/');
  if (!token || !owner || !repo || !prNumber) {
    throw new Error('GITHUB_TOKEN/GH_TOKEN, GITHUB_REPOSITORY, and PR_NUMBER are required to resolve diff scope from GitHub.');
  }

  const pr = await requestGitHub(`/repos/${owner}/${repo}/pulls/${prNumber}`, token, {}, { fetchFn, sleepFn, retryEvidence });
  const files = await paginateGitHub(`/repos/${owner}/${repo}/pulls/${prNumber}/files`, token, { fetchFn, sleepFn, retryEvidence });

  return {
    prNumber: String(prNumber),
    body: pr.body || '',
    changedFiles: files.map((file) => file.filename),
    retryEvidence,
  };
}

export async function upsertDiffScopeComment({
  token,
  repository,
  prNumber,
  report,
  marker = DIFF_SCOPE_MARKER,
  fetchFn,
  sleepFn,
  retryEvidence = [],
} = {}) {
  const [owner, repo] = String(repository || '').split('/');
  const body = `${marker}\n${renderDiffScopeReport(report)}\n\nThis check is advisory and non-blocking during the #2175 / #2208 PR-process rebuild.`;
  const comments = await paginateGitHub(`/repos/${owner}/${repo}/issues/${prNumber}/comments`, token, { fetchFn, sleepFn, retryEvidence });
  const existing = comments.find((comment) => comment.body && comment.body.includes(marker));

  if (existing) {
    await requestGitHub(`/repos/${owner}/${repo}/issues/comments/${existing.id}`, token, {
      method: 'PATCH',
      body: JSON.stringify({ body }),
    }, { fetchFn, sleepFn, retryEvidence });
    return;
  }

  await requestGitHub(`/repos/${owner}/${repo}/issues/${prNumber}/comments`, token, {
    method: 'POST',
    body: JSON.stringify({ body }),
  }, { fetchFn, sleepFn, retryEvidence });
}

async function loadDiffScopeInputs(env = process.env, dependencies = {}) {
  const bodyPath = env.DIFF_SCOPE_BODY_FILE || env.PR_HYGIENE_BODY_FILE;
  const changedFilesPath = env.DIFF_SCOPE_CHANGED_FILES_FILE || env.PR_HYGIENE_CHANGED_FILES_FILE;
  const retryEvidence = [];

  if (bodyPath && fs.existsSync(bodyPath)) {
    return {
      body: fs.readFileSync(bodyPath, 'utf8'),
      changedFiles: readListFile(changedFilesPath),
      retryEvidence,
      prNumber: String(env.PR_NUMBER || ''),
      repository: env.GITHUB_REPOSITORY || '',
      token: env.GITHUB_TOKEN || env.GH_TOKEN || '',
    };
  }

  if (env.GITHUB_REPOSITORY && env.PR_NUMBER && (env.GITHUB_TOKEN || env.GH_TOKEN)) {
    const context = await resolveDiffScopeContext({
      token: env.GITHUB_TOKEN || env.GH_TOKEN,
      repository: env.GITHUB_REPOSITORY,
      prNumber: env.PR_NUMBER,
      fetchFn: dependencies.fetchFn,
      sleepFn: dependencies.sleepFn,
      retryEvidence,
    });
    return {
      ...context,
      repository: env.GITHUB_REPOSITORY,
      token: env.GITHUB_TOKEN || env.GH_TOKEN,
    };
  }

  throw new Error('DIFF_SCOPE_BODY_FILE or PR_HYGIENE_BODY_FILE is required.');
}

export async function runCli(env = process.env, dependencies = {}) {
  let report;

  try {
    const context = await loadDiffScopeInputs(env, dependencies);
    report = buildDiffScopeReport({
      body: context.body,
      changedFiles: context.changedFiles,
      retryEvidence: context.retryEvidence,
    });
    writeDiffScopeArtifacts(report, env);

    if (context.token && context.repository && context.prNumber && env.DIFF_SCOPE_SKIP_COMMENT !== 'true') {
      try {
        await upsertDiffScopeComment({
          token: context.token,
          repository: context.repository,
          prNumber: context.prNumber,
          report,
          fetchFn: dependencies.fetchFn,
          sleepFn: dependencies.sleepFn,
        });
      } catch (error) {
        console.warn(`Failed to upsert diff scope advisory comment: ${error.message}`);
        console.warn('Continuing with advisory diff-scope result; repository policy evaluation already completed.');
      }
    }
  } catch (error) {
    if (error instanceof GitHubApiTransientError) {
      report = buildDiffScopeInfrastructureReport({
        error,
        prNumber: env.PR_NUMBER || '',
      });
      writeDiffScopeArtifacts(report, env);
      console.log(renderDiffScopeReport(report));
      return 1;
    }
    throw error;
  }

  console.log(renderDiffScopeReport(report));

  const enforceFailure = (env.DIFF_SCOPE_ENFORCE_FAILURE || 'false') === 'true';
  if (report.ok) return 0;
  return enforceFailure ? 1 : 0;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  runCli().then((exitCode) => {
    process.exitCode = exitCode;
  }).catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
