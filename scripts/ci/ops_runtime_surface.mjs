import fs from 'node:fs';
import path from 'node:path';

const WORKFLOW_DIR = '.github/workflows';

export const OPS_RUNTIME_TRIGGER_CLASSES = [
  'schedule',
  'main-push',
  'manual',
  'post-merge',
];

export const OPS_RUNTIME_SURFACE = [
  {
    file: 'ops-assess.yml',
    workflowName: 'OPS — Site Assessment',
    jobIds: ['assess'],
    escalation: 'assessment-failure',
    triggerClass: ['schedule', 'main-push', 'manual'],
    prMergeVerdict: 'advisory',
    runtimeVerdict: 'soft-fail',
    notes: 'Route and page-marker health via npm run assess:ci.',
  },
  {
    file: 'ops-cf-pages-retry.yml',
    workflowName: 'OPS — Cloudflare Pages Auto-Retry',
    jobIds: ['retry-on-internal-error'],
    escalation: 'optional-recovery',
    triggerClass: ['manual'],
    prMergeVerdict: 'advisory',
    runtimeVerdict: 'advisory',
    retryCap: 2,
    notes: 'Capped Cloudflare Pages retry helper; exhaustion is non-blocking.',
  },
  {
    file: 'production-audit.yml',
    workflowName: 'OPS — Production Audit',
    jobIds: ['prod_audit'],
    escalation: 'change-ops',
    triggerClass: ['schedule', 'main-push', 'manual'],
    prMergeVerdict: 'advisory',
    runtimeVerdict: 'fail-closed',
    notes: 'Playwright production invariants with artifact preservation.',
  },
  {
    file: 'ops-main-change-monitor.yml',
    workflowName: 'OPS — Main Change Monitor',
    jobIds: ['monitor-main-changes'],
    escalation: 'unapproved-main-change',
    triggerClass: ['main-push', 'manual'],
    prMergeVerdict: 'advisory',
    runtimeVerdict: 'fail-closed',
    notes: 'Detects direct pushes to main outside merged PR flow.',
  },
  {
    file: 'snapshot.yml',
    workflowName: 'OPS — Snapshot Backup',
    jobIds: ['repo_snapshot', 'cloudflare_pages_snapshot'],
    escalation: 'ops-runtime-failure',
    triggerClass: ['schedule', 'main-push', 'manual'],
    prMergeVerdict: 'advisory',
    runtimeVerdict: 'fail-closed',
    notes: 'Preserves repo and Cloudflare Pages rollback evidence.',
  },
  {
    file: 'b2-s3-smoke-test.yml',
    workflowName: 'OPS — B2 S3 Smoke Test',
    jobIds: ['smoke-test'],
    escalation: 'ops-runtime-failure',
    triggerClass: ['schedule', 'manual'],
    prMergeVerdict: 'advisory',
    runtimeVerdict: 'fail-closed',
    notes: 'Daily B2 connectivity smoke test before D1 sync.',
  },
  {
    file: 'b2-d1-daily-sync.yml',
    workflowName: 'OPS — B2 D1 Daily Sync',
    jobIds: ['smoke-test', 'sync'],
    escalation: 'ops-runtime-failure',
    triggerClass: ['schedule', 'manual'],
    prMergeVerdict: 'advisory',
    runtimeVerdict: 'fail-closed',
    notes: 'Incremental B2 to D1 sync with pre-sync smoke test.',
  },
];

export const OPS_RUNTIME_SCRIPTS = [
  'scripts/ci/ops_runtime_escalation.mjs',
  'scripts/ci/install_aws_cli_v2.sh',
  'scripts/ci/production_base_url.txt',
  'scripts/assess.mjs',
  'scripts/b2_s3_smoketest.sh',
  'scripts/b2_d1_incremental_sync.sh',
  'scripts/snapshot_repo.sh',
  'scripts/cf_pages_snapshot.sh',
];

function extractWorkflowName(contents) {
  const match = contents.match(/^name:\s*(.+)$/m);
  return match ? match[1].trim() : '';
}

function extractJobIds(contents) {
  const jobsMatch = contents.match(/^jobs:\s*$/m);
  if (!jobsMatch) return [];

  const jobsSection = contents.slice(jobsMatch.index);
  const ids = [];
  for (const match of jobsSection.matchAll(/^  ([A-Za-z0-9_-]+):\s*$/gm)) {
    ids.push(match[1]);
  }
  return ids;
}

export function validateOpsRuntimeSurface(options = {}) {
  const root = options.root ?? process.cwd();
  const errors = [];

  for (const entry of OPS_RUNTIME_SURFACE) {
    const workflowPath = path.join(root, WORKFLOW_DIR, entry.file);
    if (!fs.existsSync(workflowPath)) {
      errors.push(`Missing OPS runtime workflow: ${entry.file}`);
      continue;
    }

    const contents = fs.readFileSync(workflowPath, 'utf8');
    const workflowName = extractWorkflowName(contents);
    const jobIds = extractJobIds(contents);

    if (workflowName !== entry.workflowName) {
      errors.push(`${entry.file} workflow name must be "${entry.workflowName}" (found "${workflowName}")`);
    }

    for (const jobId of entry.jobIds) {
      if (!jobIds.includes(jobId)) {
        errors.push(`${entry.file} must define job id "${jobId}"`);
      }
    }

    if (entry.file === 'ops-cf-pages-retry.yml' && !contents.includes("MAX_RETRIES: '2'")) {
      errors.push('ops-cf-pages-retry.yml must keep capped retry visibility via MAX_RETRIES');
    }
  }

  for (const scriptPath of OPS_RUNTIME_SCRIPTS) {
    if (!fs.existsSync(path.join(root, scriptPath))) {
      errors.push(`Missing OPS runtime script: ${scriptPath}`);
    }
  }

  return { ok: errors.length === 0, errors, surface: OPS_RUNTIME_SURFACE };
}

export function renderOpsRuntimeChecklist() {
  const lines = [
    '## LGFC OPS Runtime Surface',
    '',
    'OPS runtime workflows monitor production health after deployment. They must not block PR merge.',
    '',
  ];

  for (const entry of OPS_RUNTIME_SURFACE) {
    const triggers = (entry.triggerClass || []).join(', ');
    lines.push(
      `- \`${entry.file}\` (${entry.workflowName}) — triggers: ${triggers}; PR merge: ${entry.prMergeVerdict}; runtime: ${entry.runtimeVerdict} — ${entry.notes}`,
    );
  }

  lines.push('', 'Shared escalation helper: `scripts/ci/ops_runtime_escalation.mjs`');
  lines.push('', 'Snapshot reference: `docs/ops/reports/program-1-ops-monitoring-snapshot.md`');
  return lines.join('\n');
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const result = validateOpsRuntimeSurface();
  if (!result.ok) {
    for (const error of result.errors) {
      console.error(`ERROR: ${error}`);
    }
    process.exit(1);
  }

  console.log('OK: OPS runtime surface validated.');
  console.log('');
  console.log(renderOpsRuntimeChecklist());
}
