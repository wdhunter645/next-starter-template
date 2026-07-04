#!/usr/bin/env node

import fs from 'node:fs';

export const PR_PROCESS_GATE_IDS = [
  'pr-hygiene',
  'diff-scope',
  'reviewer-response-completion',
  'quality',
  'gitleaks',
];

export function normalizeCheckConclusion(conclusion = '') {
  const value = String(conclusion || '').toLowerCase();
  if (value === 'success') return 'pass';
  if (value === 'failure') return 'fail';
  if (value === 'cancelled' || value === 'skipped') return 'skipped';
  if (value === 'neutral') return 'neutral';
  return value || 'unknown';
}

export function checkTimestamp(check = {}) {
  const value = check.completedAt || check.completed_at || check.startedAt || check.started_at || '';
  const parsed = Date.parse(String(value));
  return Number.isNaN(parsed) ? 0 : parsed;
}

export function dedupeTrackedChecks(checks = []) {
  const byName = new Map();

  for (const check of checks) {
    const name = String(check.name || '').trim();
    if (!PR_PROCESS_GATE_IDS.includes(name)) continue;

    const existing = byName.get(name);
    if (!existing) {
      byName.set(name, check);
      continue;
    }

    const existingTs = checkTimestamp(existing);
    const checkTs = checkTimestamp(check);

    if (checkTs > existingTs || (checkTs === existingTs && checkTs === 0)) {
      byName.set(name, check);
    }
  }

  return [...byName.values()];
}

export function buildPrProcessMetricsRecord({
  prNumber = '',
  headSha = '',
  checks = [],
  runAttempt = 1,
} = {}) {
  const gateChecks = dedupeTrackedChecks(checks);
  const requiredChecks = gateChecks.filter((check) => check.required !== false);
  const advisoryChecks = gateChecks.filter((check) => check.required === false);

  const failedRequired = requiredChecks.filter((check) => normalizeCheckConclusion(check.conclusion) === 'fail');
  const failedAdvisory = advisoryChecks.filter((check) => normalizeCheckConclusion(check.conclusion) === 'fail');
  const passedRequired = requiredChecks.every((check) => normalizeCheckConclusion(check.conclusion) === 'pass');
  const passedAllTracked = gateChecks.every((check) => {
    const outcome = normalizeCheckConclusion(check.conclusion);
    return outcome === 'pass' || outcome === 'skipped' || outcome === 'neutral';
  });

  return {
    schemaVersion: 1,
    recordedAt: new Date().toISOString(),
    prNumber: String(prNumber || ''),
    headSha: String(headSha || ''),
    runAttempt: Number(runAttempt) || 1,
    firstPassSuccess: runAttempt === 1 && passedAllTracked,
    secondPassSuccess: runAttempt === 2 && passedAllTracked,
    requiredChecksGreen: passedRequired,
    failedRequiredChecks: failedRequired.map((check) => check.name),
    failedAdvisoryChecks: failedAdvisory.map((check) => check.name),
    trackedChecks: gateChecks.map((check) => ({
      name: check.name,
      conclusion: normalizeCheckConclusion(check.conclusion),
      required: check.required !== false,
      detailsUrl: check.detailsUrl || '',
    })),
  };
}

export function renderPrProcessMetricsReport(record) {
  return [
    '## PR Process Metrics',
    '',
    `- PR: #${record.prNumber || 'unknown'}`,
    `- Head SHA: ${record.headSha || 'unknown'}`,
    `- Run attempt: ${record.runAttempt}`,
    `- First-pass success: ${record.firstPassSuccess ? 'yes' : 'no'}`,
    `- Second-pass success: ${record.secondPassSuccess ? 'yes' : 'no'}`,
    `- Required checks green: ${record.requiredChecksGreen ? 'yes' : 'no'}`,
    `- Failed required checks: ${record.failedRequiredChecks.length ? record.failedRequiredChecks.join(', ') : 'none'}`,
    `- Failed advisory checks: ${record.failedAdvisoryChecks.length ? record.failedAdvisoryChecks.join(', ') : 'none'}`,
  ].join('\n');
}

function readJsonFile(path) {
  if (!path || !fs.existsSync(path)) return null;
  return JSON.parse(fs.readFileSync(path, 'utf8'));
}

export function runCli(env = process.env) {
  const inline = env.PR_PROCESS_METRICS_JSON;
  const filePath = env.PR_PROCESS_METRICS_FILE;
  const payload = inline ? JSON.parse(inline) : readJsonFile(filePath);

  if (!payload) {
    console.error('PR_PROCESS_METRICS_JSON or PR_PROCESS_METRICS_FILE is required.');
    return 2;
  }

  const record = buildPrProcessMetricsRecord(payload);
  const jsonPath = env.PR_PROCESS_METRICS_RESULT_JSON;
  const mdPath = env.PR_PROCESS_METRICS_RESULT_MD;

  if (jsonPath) {
    fs.writeFileSync(jsonPath, `${JSON.stringify(record, null, 2)}\n`);
  }
  if (mdPath) {
    fs.writeFileSync(mdPath, `${renderPrProcessMetricsReport(record)}\n`);
  }

  console.log(renderPrProcessMetricsReport(record));
  return 0;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  process.exitCode = runCli();
}
