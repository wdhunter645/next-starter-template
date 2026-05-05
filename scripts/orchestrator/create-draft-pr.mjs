#!/usr/bin/env node

import { execFileSync } from 'node:child_process';

const repo = process.env.GITHUB_REPOSITORY;
const issueNumber = process.env.ISSUE_NUMBER;
const baseBranch = process.env.BASE_BRANCH || 'main';

if (!repo) {
  console.error('GITHUB_REPOSITORY is required.');
  process.exit(1);
}

if (!issueNumber) {
  console.error('ISSUE_NUMBER is required.');
  process.exit(1);
}

function runGh(args) {
  return execFileSync('gh', args, { encoding: 'utf8' }).trim();
}

function runGit(args) {
  return execFileSync('git', args, { encoding: 'utf8' }).trim();
}

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48);
}

function extractBlock(body, heading) {
  const pattern = new RegExp(`${heading}:\\n([\\s\\S]*?)(?:\\n[A-Z][A-Za-z ]+:|\\n## |$)`, 'm');
  const match = body.match(pattern);
  return match ? match[1].trim() : '';
}

const issueJson = runGh([
  'issue',
  'view',
  issueNumber,
  '--repo',
  repo,
  '--json',
  'number,title,body,labels'
]);

const issue = JSON.parse(issueJson);
const labels = issue.labels.map((label) => label.name);

if (!labels.includes('orchestrator') || !labels.includes('status:queued')) {
  console.log(`Issue #${issueNumber} is not an orchestrator queued issue. Skipping.`);
  process.exit(0);
}

const branchName = `orchestrator/${issue.number}-${slugify(issue.title)}`;
const issueBody = issue.body || '';
const allowedFiles = extractBlock(issueBody, 'Allowed Files') || '- To be completed by assigned agent from issue scope';
const acceptanceCriteria = extractBlock(issueBody, 'Acceptance Criteria') || '- To be completed by assigned agent';
const validation = extractBlock(issueBody, 'Validation') || '- To be completed by assigned agent';

runGit(['fetch', 'origin', baseBranch]);
runGit(['checkout', '-B', branchName, `origin/${baseBranch}`]);
runGit(['commit', '--allow-empty', '-m', `orchestrator: draft PR for issue #${issue.number}`]);
runGit(['push', '-u', 'origin', branchName]);

const prBody = [
  `- **Issue:** #${issue.number}`,
  '',
  '### PR Template',
  '',
  '#### Reference',
  'Refer to `/.github/pull_request_template.md` for required structure and change conventions.',
  '',
  '#### Governance Reference',
  'Follow operational, rollback, and testing standards in `/docs/governance/PR_GOVERNANCE.md`.',
  '',
  '## MANDATORY FIRST STEP (ZIP SAFETY)',
  '- [ ] No ZIP file exists in the repo root',
  '- [ ] OR any ZIP file that was present in the repo root was deleted before any other change',
  '- [ ] Final diff confirms no ZIP file is committed',
  '',
  '## PROGRESS + READINESS (MANDATORY)',
  '- Phase: Implementation',
  `- Task: ${issue.title}`,
  '- Status: DRAFT',
  '- Scope Confirmed: YES',
  '- Out-of-Scope Changes Present: NO',
  '- Blocking Issues: None currently known',
  '- Notes: This PR shell was created by the LGFC orchestration tier.',
  '',
  '## DOCUMENTATION SOURCE (MANDATORY)',
  '- [ ] DIATAXIS_FULL',
  '- [x] DIATAXIS_ROUTED',
  '- [ ] LEGACY_FALLBACK',
  '',
  'Source Files Used:',
  '- `docs/ops/orchestration-tier-design.md`',
  '- `docs/ops/implementation-plans/README.md`',
  '',
  '## DIATAXIS GAP (REQUIRED IF LEGACY_FALLBACK)',
  '- [ ] Gap Identified',
  '- Link to issue: N/A',
  '- Description: N/A',
  '',
  '## LABEL',
  '- Intent label for this PR: To be completed by assigned agent',
  '',
  '## DESIGN SOURCE OF TRUTH (NON-NEGOTIABLE)',
  '- Canonical process reference: `/docs/governance/PR_PROCESS.md`',
  '- Canonical governance reference: `/docs/governance/PR_GOVERNANCE.md`',
  '- Canonical design reference: `/docs/reference/design/LGFC-Production-Design-and-Standards.md`',
  '- Additional design/reference docs used for this PR:',
  '  - `docs/ops/orchestration-tier-design.md`',
  '',
  '## FILE-TOUCH ALLOWLIST (MANDATORY)',
  'Allowed files:',
  allowedFiles,
  '',
  'All other files are out of scope',
  '',
  '## VISUAL / UX INVARIANTS (MANDATORY)',
  '- [ ] Header, footer, navigation, auth, and route invariants preserved unless explicitly in scope',
  '- [ ] No unauthorized visual drift introduced',
  '- [ ] No out-of-scope UX changes introduced',
  '- [ ] Store behavior, Join/Login behavior, and Fan Club/Admin gating remain compliant unless explicitly in scope',
  '',
  '## DRIFT GATE ALIGNMENT (MANDATORY)',
  '- [ ] Exactly ONE intent label applied',
  '- [ ] File changes match allowlist exactly',
  '- [ ] No mixed-intent changes present',
  '',
  '## CHANGE SUMMARY',
  '- To be completed by assigned agent',
  '',
  '## ACCEPTANCE CRITERIA',
  acceptanceCriteria,
  '',
  '## BUILD / TEST / VERIFICATION',
  'Required validation:',
  validation,
  '',
  'Commands run:',
  '- To be completed by assigned agent',
  '',
  'Result summary:',
  '- To be completed by assigned agent',
  '',
  '## DOCUMENTATION UPDATES',
  '- [ ] Documentation updated in this PR',
  '- [ ] No documentation updates required — explain why',
  'Files:',
  '- To be completed by assigned agent',
  '',
  '## REQUIRED PRE-REVIEW SELF-CHECK',
  '- [ ] PR body contains all required sections with exact headings',
  '- [ ] Allowed files section matches diff exactly',
  '- [ ] No files outside allowlist',
  '- [ ] ZIP safety confirmed',
  '- [ ] Intent label correct and singular',
  '- [ ] Local checks executed and passed',
  '- [ ] Commit message aligns with scope',
  '- [ ] No secrets or forbidden artifacts introduced',
  '',
  '## ORCHESTRATOR TASK DETAILS',
  issueBody
].join('\n');

const prUrl = runGh([
  'pr',
  'create',
  '--repo',
  repo,
  '--base',
  baseBranch,
  '--head',
  branchName,
  '--draft',
  '--title',
  `[Orchestrator] ${issue.title}`,
  '--body',
  prBody
]);

runGh(['issue', 'edit', issueNumber, '--repo', repo, '--remove-label', 'status:queued']);
runGh(['issue', 'edit', issueNumber, '--repo', repo, '--add-label', 'status:pr-draft']);
runGh([
  'issue',
  'comment',
  issueNumber,
  '--repo',
  repo,
  '--body',
  `Draft PR created: ${prUrl}`
]);

console.log(`Created draft PR for issue #${issueNumber}: ${prUrl}`);
