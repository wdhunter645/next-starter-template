import { pathToFileURL } from 'node:url';

import {
  appendOpsStepSummary,
  upsertOpsRuntimeIssue,
} from './ops_runtime_escalation.mjs';

export const OPS_MATCHUP_DRIFT_MARKER = '<!-- ops-matchup-pair-drift-findings -->';
export const DEFAULT_FINDINGS_TITLE = 'OPS — Weekly matchup pair drift remediated';
export const DEFAULT_FINDINGS_LABELS = ['ops-runtime-finding', 'ops:monitoring'];

export function buildMatchupDriftFindingsBody({
  workflowName = 'OPS — Matchup Pair Monitor',
  runUrl = '',
  commitSha = '',
  weekStart = '',
  fromA = '',
  fromB = '',
  toA = '',
  toB = '',
  remediated = true,
  details = '',
} = {}) {
  const lines = [
    OPS_MATCHUP_DRIFT_MARKER,
    '',
    '## Weekly Photo Matchup pair drift',
    '',
    'Live pair diverged from the Monday/baseline snapshot (#3031).',
    remediated
      ? 'CI replaced **both** photos and reset votes to **0–0** (vote restore is not possible).'
      : 'Watch-only mode: no D1 mutation was performed.',
    '',
    `- Workflow: ${workflowName}`,
    `- Run: ${runUrl || 'unknown'}`,
    `- Commit: ${commitSha || 'unknown'}`,
    `- Week start: ${weekStart || 'unknown'}`,
    `- Baseline (before): \`${fromA || '?'}\` / \`${fromB || '?'}\``,
    remediated
      ? `- New pair (after): \`${toA || '?'}\` / \`${toB || '?'}\``
      : `- Live (unchanged): \`${toA || '?'}\` / \`${toB || '?'}\``,
  ];

  if (details) {
    lines.push('', '## Additional details', details);
  }

  lines.push(
    '',
    '## Required action',
    '- Confirm homepage Weekly Matchup shows the intended pair.',
    '- If this drift was an **authorized** Issue-gated admin change, re-run the workflow with `adopt-current` after the change so CI does not treat it as unauthorized.',
    '- Close this issue when acknowledged.',
  );

  return lines.join('\n');
}

export async function reportMatchupDriftFindings(options = {}) {
  const token = options.token || process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
  const repository = options.repository || process.env.GITHUB_REPOSITORY;
  if (!token || !repository) {
    throw new Error('GITHUB_TOKEN/GH_TOKEN and GITHUB_REPOSITORY are required.');
  }

  const [owner, repo] = repository.split('/');
  const remediated =
    options.remediated === true || process.env.OPS_MATCHUP_REMEDIATED === 'true';
  const title =
    options.title ||
    (remediated ? DEFAULT_FINDINGS_TITLE : 'OPS — Weekly matchup pair drift detected');

  const body = buildMatchupDriftFindingsBody({
    workflowName: options.workflowName || process.env.OPS_MATCHUP_WORKFLOW || 'OPS — Matchup Pair Monitor',
    runUrl: options.runUrl || process.env.OPS_MATCHUP_RUN_URL || '',
    commitSha: options.commitSha || process.env.GITHUB_SHA || '',
    weekStart: options.weekStart || process.env.OPS_MATCHUP_WEEK_START || '',
    fromA: options.fromA || process.env.OPS_MATCHUP_FROM_A || '',
    fromB: options.fromB || process.env.OPS_MATCHUP_FROM_B || '',
    toA: options.toA || process.env.OPS_MATCHUP_TO_A || '',
    toB: options.toB || process.env.OPS_MATCHUP_TO_B || '',
    remediated,
    details: options.details || process.env.OPS_MATCHUP_DETAILS || '',
  });

  const labels = (
    options.labels ||
    process.env.OPS_MATCHUP_LABELS ||
    DEFAULT_FINDINGS_LABELS.join(',')
  )
    .toString()
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  const result = await upsertOpsRuntimeIssue({ token, owner, repo, title, body, labels });
  appendOpsStepSummary(
    `## Matchup drift findings\n- Issue: ${result.issue} (${result.action})`,
  );
  return result;
}

function isMain() {
  const entry = process.argv[1];
  return Boolean(entry) && import.meta.url === pathToFileURL(entry).href;
}

if (isMain()) {
  reportMatchupDriftFindings()
    .then((result) => {
      console.log(JSON.stringify({ ok: true, ...result }));
    })
    .catch((err) => {
      console.error('[ops_matchup_drift_findings]', err);
      process.exitCode = 1;
    });
}
