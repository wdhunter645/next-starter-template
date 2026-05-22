#!/usr/bin/env node

import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';

const statePath = '.github/ci-orchestration-state.json';
const phaseMarkerPrefix = 'lgfc-ci-phase:';
const remediationMarker = 'lgfc-ci-orchestration-remediation';
const activeStatuses = new Set([
  'status:queued',
  'status:assigned',
  'status:pr-draft',
  'status:implementation',
  'status:review',
  'status:post-merge-verify'
]);
const failedStatus = 'status:failed';
const completeStatus = 'status:complete';
const failureConclusions = new Set(['failure', 'timed_out', 'action_required']);
const runningStatuses = new Set(['queued', 'in_progress', 'waiting', 'pending']);

function gh(args) {
  return execFileSync('gh', args, { encoding: 'utf8' }).trim();
}

function labelNames(issue) {
  return new Set((issue.labels || []).map((label) => label.name));
}

function hasLabel(issue, label) {
  return labelNames(issue).has(label);
}

function phaseMarker(id) {
  return `<!-- ${phaseMarkerPrefix}${id} -->`;
}

function containsPhaseMarker(issue, phaseId) {
  return (issue.body || '').includes(`${phaseMarkerPrefix}${phaseId}`);
}

function isCiOrchestrationIssue(issue) {
  return (issue.body || '').includes(phaseMarkerPrefix) || hasLabel(issue, 'type:ci');
}

function isComplete(issue) {
  return hasLabel(issue, completeStatus);
}

function isActiveOrFailed(issue) {
  const names = labelNames(issue);
  if (names.has(failedStatus)) return true;
  return [...activeStatuses].some((status) => names.has(status));
}

function daysBetween(fromIso, toDate) {
  const from = new Date(fromIso);
  if (Number.isNaN(from.valueOf())) return 0;
  return (toDate.valueOf() - from.valueOf()) / (24 * 60 * 60 * 1000);
}

function hoursBetween(fromIso, toDate) {
  const from = new Date(fromIso);
  if (Number.isNaN(from.valueOf())) return 0;
  return (toDate.valueOf() - from.valueOf()) / (60 * 60 * 1000);
}

function completedPhaseIds(issues) {
  const completed = new Set();
  for (const issue of issues) {
    if (!isCiOrchestrationIssue(issue) || !isComplete(issue)) continue;
    for (const match of (issue.body || '').matchAll(new RegExp(`${phaseMarkerPrefix}([a-z0-9-]+)`, 'g'))) {
      completed.add(match[1]);
    }
  }
  return completed;
}

export function nextPhase(state, issues) {
  const completed = completedPhaseIds(issues);
  return state.phases.find((phase) => {
    if (completed.has(phase.id)) return false;
    return (phase.dependsOn || []).every((dependency) => completed.has(dependency));
  }) || null;
}

export function ciHealthReport(runs = [], monitoring = {}, now = new Date()) {
  const expected = monitoring.expectedWorkflows || [];
  const repeatedFailureThreshold = monitoring.repeatedFailureThreshold || 2;
  const staleRunHours = monitoring.staleRunHours || 6;
  const blocking = [];
  const warnings = [];
  const observedWorkflows = new Set();
  const failureCounts = new Map();

  for (const run of runs) {
    if (run.workflowName) observedWorkflows.add(run.workflowName);

    if (failureConclusions.has(run.conclusion)) {
      failureCounts.set(run.workflowName, (failureCounts.get(run.workflowName) || 0) + 1);
    }

    if (runningStatuses.has(run.status) && hoursBetween(run.createdAt, now) >= staleRunHours) {
      blocking.push({
        code: 'stale_workflow_run',
        message: `${run.workflowName || 'unknown workflow'} has been ${run.status} since ${run.createdAt}`,
        evidence: run.url || ''
      });
    }
  }

  for (const [workflowName, count] of failureCounts) {
    if (count >= repeatedFailureThreshold) {
      blocking.push({
        code: 'repeated_workflow_failure',
        message: `${workflowName || 'unknown workflow'} failed ${count} times in the recent run window`,
        evidence: ''
      });
    }
  }

  for (const workflowName of expected) {
    if (!observedWorkflows.has(workflowName)) {
      warnings.push({
        code: 'expected_workflow_not_seen',
        message: `${workflowName} did not appear in the recent run window`,
        evidence: ''
      });
    }
  }

  return {
    stable: blocking.length === 0,
    blocking,
    warnings
  };
}

export function rolloutDecision({ state, issues = [], runs = [], now = new Date() }) {
  const ciIssues = issues.filter(isCiOrchestrationIssue);
  const failedIssue = ciIssues.find((issue) => hasLabel(issue, failedStatus));
  if (failedIssue) {
    return {
      action: 'pause',
      reason: 'failed_issue',
      issue: failedIssue,
      evidence: [`Issue #${failedIssue.number} is labeled ${failedStatus}.`]
    };
  }

  const activeIssue = ciIssues.find((issue) => issue.state !== 'CLOSED' && isActiveOrFailed(issue));
  if (activeIssue) {
    const staleDays = daysBetween(activeIssue.createdAt, now);
    const evidence = [`Issue #${activeIssue.number} is still active.`];
    if (staleDays >= state.monitoring.staleIssueDays) {
      evidence.push(`Issue #${activeIssue.number} has been active for ${Math.floor(staleDays)} days.`);
    }
    return {
      action: 'pause',
      reason: staleDays >= state.monitoring.staleIssueDays ? 'stale_active_issue' : 'active_issue',
      issue: activeIssue,
      evidence
    };
  }

  const next = nextPhase(state, ciIssues);
  if (!next) {
    return {
      action: 'done',
      reason: 'all_phases_complete',
      evidence: ['All CI orchestration phases are complete.']
    };
  }

  const duplicate = ciIssues.find((issue) => containsPhaseMarker(issue, next.id));
  if (duplicate) {
    return {
      action: 'pause',
      reason: 'duplicate_phase_issue',
      issue: duplicate,
      evidence: [`Issue #${duplicate.number} already exists for phase ${next.id}.`]
    };
  }

  const health = ciHealthReport(runs, state.monitoring, now);
  if (!health.stable) {
    return {
      action: 'pause',
      reason: 'ci_instability',
      phase: next,
      health,
      evidence: health.blocking.map((item) => item.message)
    };
  }

  return {
    action: 'create',
    phase: next,
    health,
    evidence: [`Next phase is ${next.title}.`]
  };
}

function sectionList(items) {
  return (items || []).map((item) => `- ${item}`).join('\n');
}

export function buildIssueBody(state, phase) {
  return [
    phaseMarker(phase.id),
    '',
    `Primary Source Issue: #${state.sourceIssue}`,
    `Related Program Issue: #${state.programIssue}`,
    `CI Phase: ${phase.title}`,
    '',
    '## Objective',
    phase.objective,
    '',
    '## Source-of-Truth Docs',
    sectionList(state.canonicalDocs.map((doc) => `\`${doc}\``)),
    '',
    '## Exact Scope',
    sectionList(phase.workflowScope),
    '',
    '## Allowed Files',
    sectionList(phase.allowedFiles.map((file) => `\`${file}\``)),
    '',
    '## Forbidden Scope',
    sectionList(phase.forbiddenScope),
    '',
    '## Rollback Boundary',
    phase.rollbackBoundary,
    '',
    '## Validation Requirements',
    sectionList(phase.validation.map((command) => `\`${command}\``)),
    '',
    '## Acceptance Criteria',
    sectionList(phase.acceptanceCriteria),
    '',
    '## Post-Merge Verification Requirements',
    sectionList(phase.postMergeVerification),
    '',
    '## Orchestration Rules',
    '- Create one implementation PR for this issue only.',
    '- Do not create or start the next CI implementation issue until this issue is implemented, merged, post-merge verified, and CI is stable.',
    '- Pause and report evidence if scope is ambiguous, rollback is recommended, required gates fail, or CI instability appears.'
  ].join('\n');
}

export function buildRemediationBody(decision) {
  const evidence = decision.evidence?.length ? sectionList(decision.evidence) : '- No evidence recorded.';
  const healthWarnings = decision.health?.warnings?.length
    ? sectionList(decision.health.warnings.map((item) => item.message))
    : '- None recorded.';

  return [
    `<!-- ${remediationMarker} -->`,
    '',
    '# CI Orchestration Paused',
    '',
    `Reason: ${decision.reason}`,
    '',
    '## Blocking Evidence',
    evidence,
    '',
    '## Monitoring Warnings',
    healthWarnings,
    '',
    '## Required Recovery',
    '- Investigate the blocking evidence.',
    '- Complete or close failed/stale orchestration work.',
    '- Rerun the CI orchestration engine after CI is stable.'
  ].join('\n');
}

function loadState() {
  return JSON.parse(fs.readFileSync(statePath, 'utf8'));
}

function repoLabelNames(repo) {
  const output = gh(['label', 'list', '--repo', repo, '--json', 'name', '--limit', '1000']);
  return new Set(JSON.parse(output).map((label) => label.name));
}

function ensureLabels(repo, state) {
  const existing = repoLabelNames(repo);
  const definitions = state.labels.definitions || {};

  for (const label of state.labels.required || []) {
    if (existing.has(label)) continue;

    const definition = definitions[label] || {
      color: '0E8A16',
      description: 'LGFC orchestration state label'
    };

    gh([
      'label',
      'create',
      label,
      '--repo',
      repo,
      '--color',
      definition.color,
      '--description',
      definition.description
    ]);
  }
}

function listCiIssues(repo) {
  const output = gh([
    'issue',
    'list',
    '--repo',
    repo,
    '--state',
    'all',
    '--search',
    'label:orchestrator',
    '--json',
    'number,title,body,labels,state,createdAt,url',
    '--limit',
    '100'
  ]);
  return JSON.parse(output).filter(isCiOrchestrationIssue);
}

function listWorkflowRuns(repo, state) {
  const output = gh([
    'run',
    'list',
    '--repo',
    repo,
    '--branch',
    'main',
    '--limit',
    String(state.monitoring.recentRunLimit),
    '--json',
    'databaseId,workflowName,status,conclusion,createdAt,url'
  ]);
  return JSON.parse(output);
}

function createPhaseIssue(repo, state, phase) {
  const body = buildIssueBody(state, phase);
  const title = `CI-IMPL — ${phase.title}`;
  const labels = ['orchestrator', 'status:queued', 'type:ci', 'agent:cursor'];

  gh([
    'issue',
    'create',
    '--repo',
    repo,
    '--title',
    title,
    '--body',
    body,
    '--label',
    labels.join(',')
  ]);
}

function findRemediationIssue(issues) {
  return issues.find((issue) => issue.state !== 'CLOSED' && (issue.body || '').includes(remediationMarker));
}

function createOrUpdateRemediation(repo, issues, decision) {
  const body = buildRemediationBody(decision);
  const existing = findRemediationIssue(issues);

  if (existing) {
    gh(['issue', 'comment', String(existing.number), '--repo', repo, '--body', body]);
    return;
  }

  gh([
    'issue',
    'create',
    '--repo',
    repo,
    '--title',
    'CI orchestration paused — remediation required',
    '--body',
    body,
    '--label',
    'orchestrator,status:failed,type:ci,agent:cursor'
  ]);
}

export function main() {
  const repo = process.env.GITHUB_REPOSITORY;
  const dryRun = process.env.DRY_RUN === 'true';

  if (!repo) {
    console.error('GITHUB_REPOSITORY is required.');
    process.exit(1);
  }

  const state = loadState();
  if (!dryRun) ensureLabels(repo, state);

  const issues = listCiIssues(repo);
  const runs = listWorkflowRuns(repo, state);
  const decision = rolloutDecision({ state, issues, runs });

  console.log(`CI orchestration decision: ${decision.action} (${decision.reason || decision.phase?.id || 'ready'})`);
  for (const line of decision.evidence || []) console.log(`- ${line}`);
  for (const warning of decision.health?.warnings || []) console.log(`warning: ${warning.message}`);

  if (dryRun) return;

  if (decision.action === 'create') {
    createPhaseIssue(repo, state, decision.phase);
  } else if (decision.action === 'pause' && ['ci_instability', 'failed_issue', 'stale_active_issue'].includes(decision.reason)) {
    createOrUpdateRemediation(repo, issues, decision);
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main();
}
