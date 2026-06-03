import fs from 'node:fs';
import path from 'node:path';

const WORKFLOW_DIR = '.github/workflows';

/** @type {Array<{ file: string; workflowName: string; jobIds: string[]; required: boolean; notes?: string }>} */
export const MERGE_PROTECTION_SURFACE = [
  {
    file: 'gate-quality.yml',
    workflowName: 'GATE — Quality Checks',
    jobIds: ['quality'],
    required: true,
    notes: 'Consolidated lint, typecheck, test, build, and tracked-ZIP checks.',
  },
  {
    file: 'gitleaks.yml',
    workflowName: 'GATE — Secret Scan',
    jobIds: ['gitleaks'],
    required: true,
    notes: 'Deterministic secret exposure blocker.',
  },
  {
    file: 'ops-pr-issue-accounting.yml',
    workflowName: 'GATE — PR Issue Accounting',
    jobIds: ['pr-issue-accounting'],
    required: true,
    notes: 'Deterministic Issue-first source accounting.',
  },
];

/** @type {string[]} */
export const RETIRED_MERGE_PROTECTION_WORKFLOWS = ['gate-zip-safety.yml'];

function readWorkflow(relativePath) {
  return fs.readFileSync(path.join(WORKFLOW_DIR, relativePath), 'utf8');
}

function extractWorkflowName(contents) {
  const match = contents.match(/^name:\s*(.+)$/m);
  return match ? match[1].trim() : '';
}

function extractJobIds(contents) {
  const jobsMatch = contents.match(/^jobs:\s*$/m);
  if (!jobsMatch) {
    return [];
  }

  const jobsSection = contents.slice(jobsMatch.index);
  const ids = [];
  for (const match of jobsSection.matchAll(/^  ([A-Za-z0-9_-]+):\s*$/gm)) {
    ids.push(match[1]);
  }
  return ids;
}

export function validateMergeProtectionSurface(options = {}) {
  const root = options.root ?? process.cwd();
  const errors = [];

  for (const retired of RETIRED_MERGE_PROTECTION_WORKFLOWS) {
    if (fs.existsSync(path.join(root, WORKFLOW_DIR, retired))) {
      errors.push(`${retired} must be retired; ZIP checks belong in gate-quality.yml`);
    }
  }

  for (const entry of MERGE_PROTECTION_SURFACE) {
    const workflowPath = path.join(root, WORKFLOW_DIR, entry.file);
    if (!fs.existsSync(workflowPath)) {
      errors.push(`Missing merge-protection workflow: ${entry.file}`);
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
  }

  const qualityContents = readWorkflow('gate-quality.yml');
  for (const requiredStep of [
    'npm run build',
    'scripts/ci/check_no_tracked_zips.sh',
    'scripts/ci/verify_zip_history_pr.sh',
  ]) {
    if (!qualityContents.includes(requiredStep)) {
      errors.push(`gate-quality.yml must invoke ${requiredStep}`);
    }
  }

  return {
    ok: errors.length === 0,
    errors,
    surface: MERGE_PROTECTION_SURFACE,
    retired: RETIRED_MERGE_PROTECTION_WORKFLOWS,
  };
}

export function renderBranchProtectionChecklist() {
  const lines = [
    '## LGFC Merge Protection Required Checks',
    '',
    'Configure branch protection for `main` with these deterministic checks only:',
    '',
  ];

  for (const entry of MERGE_PROTECTION_SURFACE) {
    for (const jobId of entry.jobIds) {
      lines.push(`- \`${jobId}\` (${entry.workflowName})`);
    }
  }

  lines.push(
    '',
    'Retired checks (remove from branch protection if still listed):',
    '',
    '- `check-no-zip-files` (`GATE — ZIP Safety`) — assimilated into `quality`',
    '',
    'Non-merge-protection checks such as drift control, reviewer lifecycle, PR hygiene advisories, and OPS runtime workflows must not be treated as merge blockers unless explicitly reclassified.',
  );

  return lines.join('\n');
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const result = validateMergeProtectionSurface();
  if (!result.ok) {
    for (const error of result.errors) {
      console.error(`ERROR: ${error}`);
    }
    process.exit(1);
  }

  console.log('OK: merge protection surface validated.');
  console.log('');
  console.log(renderBranchProtectionChecklist());
}
