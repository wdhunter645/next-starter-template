import { resolveRepositoryState } from './state-resolver.mjs';
import { planAction } from './action-planner.mjs';
import { evaluateLaneEligibility } from './lane-eligibility.mjs';
import { evaluateCursorPickup } from './local-cursor/poller.mjs';
import { rankWatcherCandidates } from './watcher-candidate-planner.mjs';
import { claimAction } from './claim-ledger.mjs';
import { reconcileSnapshots } from './reconciler.mjs';
import { resolveWorkflowManifestSelection } from '../pmo-projects/lib/workflow-policy.mjs';
import { resolveOperatingLaneState, evaluateProfileTransition, planFourLaneAction } from './four-lane-runtime.mjs';
import { normalizeIncidentEvidence, upsertOperationalIncident } from './evidence-adapters/incident-evidence.mjs';
import config from './config.json' with { type: 'json' };

const scenario = (id, ok, detail) => ({ id, ok: Boolean(ok), detail });

export function runAcceptanceScenarios({ now = new Date().toISOString() } = {}) {
  const base = resolveRepositoryState({
    project: { issueNumber: 2294, lifecycle: 'active', projectBranch: 'component/agent-issue-polling-handoff-routing' },
    task: { issueNumber: 2593, id: '001', state: 'active', predecessors: [], wakeEligible: true },
    labels: ['agent:cursor', 'handoff:ready'],
    events: [{ id: 1, marker: 'CURSOR ASSIGNMENT', createdAt: now }],
    pullRequests: [], checks: [], reviews: [], claims: [], consumedEventIds: [], fileScope: ['scripts/agent-routing/**'],
  });
  const assignment = planAction(base, { mode: 'advance' });
  const chat = resolveRepositoryState({ ...base, labels: ['agent:ChatGPT', 'status:blocked'], events: [{ id: 2, marker: 'CHATGPT HANDOFF', createdAt: now }] });
  const broad = rankWatcherCandidates([{ id: 'broad', responsibility: 'chatgpt', safety: 5, priority: 1, unblockValue: 5, objectiveImpact: 5, hasAlert: false }]);
  const firstClaim = claimAction([], { actionKey: 'broad:r1', watcherId: 'w1', now, leaseMinutes: 10 });
  const secondClaim = claimAction(firstClaim.claims, { actionKey: 'broad:r1', watcherId: 'w2', now, leaseMinutes: 10 });
  const independent = { ...base, identity: { projectIssue: 3000, taskIssue: 3001 }, revision: 'independent', fileScope: ['docs/other/**'], activeClaims: [] };
  const blocked = { ...base, identity: { projectIssue: 2294, taskIssue: 2594 }, revision: 'blocked', dependencyState: 'blocked', activeClaims: [] };
  const main = planAction({ ...base, pullRequests: [{ number: 9, base: 'main', state: 'open', mergeable: true }] }, { mode: 'integrate' });
  const ciFailure = planAction({ ...base, checks: [{ name: 'quality', required: true, status: 'completed', conclusion: 'failure', transient: true, runId: 42 }] }, { mode: 'advance' });
  const materializerNewBranch = resolveWorkflowManifestSelection({ eventName: 'push', beforeSha: '0'.repeat(40), changedFiles: [{ status: 'A', path: 'docs/ops/implementation-plans/agent-issue-polling-handoff-routing/project-manifest.json' }] });
  const materializerChanged = resolveWorkflowManifestSelection({ eventName: 'push', beforeSha: '1'.repeat(40), changedFiles: [{ status: 'M', path: 'docs/ops/implementation-plans/agent-issue-polling-handoff-routing/project-manifest.json' }] });
  const poller = evaluateCursorPickup({ number: 2593, lane: '2294', eligible: true, labels: ['agent:cursor', 'handoff:ready'], latestEvent: { id: 1, marker: 'CURSOR ASSIGNMENT' } }, { consumedEventIds: [], activeClaims: [] });
  const scenarios = [
    scenario(1, assignment.class === 'cursor_ack_required', 'routine assignment and ACK plan'),
    scenario(2, planAction(chat, { mode: 'advance' }).class === 'chatgpt_review', 'genuine ChatGPT handoff'),
    scenario(3, broad[0]?.id === 'broad', 'broad watcher candidate without alert'),
    scenario(4, rankWatcherCandidates([{ id: 'urgent', responsibility: 'chatgpt', safety: 5, priority: 5, unblockValue: 5, objectiveImpact: 5, hasAlert: true }])[0]?.id === 'urgent', 'alert acceleration'),
    scenario(5, firstClaim.acquired && !secondClaim.acquired, 'watcher race suppression'),
    scenario(6, reconcileSnapshots([blocked, independent], { mode: 'observe', now }).selected.identity.taskIssue === 3001, 'work-conserving independent lane'),
    scenario(7, !evaluateLaneEligibility(base, [{ ...base, identity: { projectIssue: 2294, taskIssue: 999 }, activeClaims: [{ lane: '2294', expiresAt: '2099-01-01T00:00:00Z' }] }], { now }).eligible, 'collision prevention'),
    scenario(8, assignment.actionKey === planAction(base, { mode: 'advance' }).actionKey, 'duplicate event idempotency'),
    scenario(9, resolveRepositoryState({ ...base, labels: ['agent:cursor', 'agent:ChatGPT'] }).ambiguous, 'stale/contradictory state halt'),
    scenario(10, reconcileSnapshots([independent], { mode: 'observe', now }).selected !== null, 'missed event reconciliation'),
    scenario(11, ciFailure.class === 'ci_failure_disposition' && ciFailure.mutations[0]?.type === 'rerun_failed_job', 'required CI failure routes to bounded disposition'),
    scenario(12, main.class === 'human_decision', 'protected production review'),
    scenario(13, poller.eligible, 'local poller restart-safe pickup contract'),
    scenario(14, planAction(base, { mode: 'disabled' }).class === 'noop', 'controller mutation disable'),
    scenario(15, materializerNewBranch.skip === true && materializerNewBranch.reason === 'new_branch_no_manifest_delta' && materializerChanged.paths[0]?.includes('agent-issue-polling-handoff-routing'), 'materializer selects the changed project and skips inherited manifests on new branch creation'),
    scenario(16, main.mutations.length === 0, 'automatic main merge rejected'),
    scenario(17, config.fourLaneRuntime?.enabled === false, 'four-lane runtime config-gated off by default'),
    scenario(18, (() => {
      const lanes = resolveOperatingLaneState({
        project: { lifecycle: 'active' },
        events: [{ id: 1, marker: 'IMPLEMENTATION HANDOFF', createdAt: now }],
      });
      return lanes.topology.vertical === 'administration-communications'
        && lanes.lanes['implementation-operations'].implementationHandoffComplete === true
        && lanes.lanes['implementation-operations'].nestedReview.phase === 'review-pending';
    })(), 'four-lane topology with nested review and implementationHandoffComplete'),
    scenario(19, (() => {
      const four = { mode: 'advance', fourLaneRuntime: { enabled: true } };
      const held = resolveRepositoryState({
        project: { issueNumber: 2294, lifecycle: 'active', projectBranch: 'component/agent-issue-polling-handoff-routing' },
        task: { issueNumber: 2639, id: '015', state: 'active' },
        labels: ['agent:cursor', 'handoff:ready'],
        events: [{ id: 9, marker: 'OPERATIONAL INCIDENT', createdAt: now }],
        operationalHold: { active: true, scope: 'assessment', severityClassified: false },
        claims: [], consumedEventIds: [], pullRequests: [], checks: [], reviews: [],
      }, four);
      return planAction(held, four).class === 'operational_assessment';
    })(), 'day-2 assessment hold preempts delivery planning'),
    scenario(20, (() => {
      const created = upsertOperationalIncident([], normalizeIncidentEvidence({
        trusted: true, source: 'ci', subject: 'prod', runId: 7, summary: 'degraded',
      }), { now });
      const elevated = upsertOperationalIncident(created.incidents, normalizeIncidentEvidence({
        trusted: true, source: 'ci', subject: 'prod', runId: 7, summary: 'degraded',
      }), { now });
      return created.ok && elevated.reason === 'elevated_existing' && elevated.incidents.length === 1;
    })(), 'trusted incident evidence creates and deduplicates operational issues'),
    scenario(21, (() => {
      const lanes = resolveOperatingLaneState({
        projectGo: true,
        profile: 'development',
        events: [{ id: 1, marker: 'CURSOR ACK', createdAt: now }],
      });
      const bypass = evaluateProfileTransition('development', 'production');
      const halt = planFourLaneAction(
        { operatingLanes: lanes, identity: { taskIssue: 2639 }, pullRequests: [] },
        { mode: 'advance', currentProfile: 'development', targetProfile: 'production' },
      );
      const allowed = evaluateProfileTransition('development', 'promotion-candidate');
      return lanes.promotionProfile.profiles.includes('promotion-candidate')
        && bypass.allowed === false
        && bypass.code === 'prohibited_bypass'
        && halt.class === 'halt'
        && allowed.allowed === true;
    })(), 'promotion-profile matrix rejects Development→Production bypass'),
  ];
  return {
    ok: scenarios.every((item) => item.ok),
    generatedAt: now,
    scenarios,
    invariants: {
      noOpenAIApi: true,
      noAutomaticMainMerge: true,
      observeByDefault: true,
      fourLaneConfigGated: config.fourLaneRuntime?.enabled === false,
    },
  };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  process.stdout.write(`${JSON.stringify(runAcceptanceScenarios(), null, 2)}\n`);
}
