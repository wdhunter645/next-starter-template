import { describe, expect, it } from 'vitest';
import { resolveRepositoryState } from '../../scripts/agent-routing/state-resolver.mjs';
import { planAction } from '../../scripts/agent-routing/action-planner.mjs';
import { evaluateLaneEligibility } from '../../scripts/agent-routing/lane-eligibility.mjs';
import { reconcileSnapshots } from '../../scripts/agent-routing/reconciler.mjs';
import {
  evaluateSuccessorEligibility,
  preserveDeliveryStateForHold,
  releaseOperationalHold,
  resolveOperatingLaneState,
} from '../../scripts/agent-routing/four-lane-runtime.mjs';
import {
  classifyIncidentSeverity,
  normalizeIncidentEvidence,
  planSafeAutoRemediation,
  upsertOperationalIncident,
} from '../../scripts/agent-routing/evidence-adapters/incident-evidence.mjs';
import config from '../../scripts/agent-routing/config.json';

const fourLaneOn = {
  mode: 'advance',
  fourLaneRuntime: { enabled: true, autoOperationalHolds: true, autoRemediation: true },
  actions: { rerunFailedJob: true, mergeMain: false },
};

const base = {
  project: { issueNumber: 2294, lifecycle: 'active', projectBranch: 'component/agent-issue-polling-handoff-routing' },
  task: { issueNumber: 2639, id: '015', state: 'active', wakeEligible: true },
  labels: ['agent:cursor', 'handoff:ready'],
  events: [{ id: 1, marker: 'CURSOR ASSIGNMENT', createdAt: '2026-07-19T16:00:00Z' }],
  pullRequests: [],
  checks: [],
  reviews: [],
  claims: [],
  consumedEventIds: [],
  fileScope: ['scripts/agent-routing/**'],
  dependencyClass: 'none',
};

describe('four-lane runtime', () => {
  it('keeps four-lane disabled by default (conservative serialized planner)', () => {
    expect(config.fourLaneRuntime.enabled).toBe(false);
    const snapshot = resolveRepositoryState(base);
    expect(snapshot.fourLaneEnabled).toBe(false);
    expect(snapshot.operatingLanes).toBeNull();
    expect(planAction(snapshot, { mode: 'advance' }).class).toBe('cursor_ack_required');
  });

  it('exposes all four top-level lane states with nested PR review inside implementation-operations', () => {
    const lanes = resolveOperatingLaneState({
      ...base,
      events: [
        { id: 1, marker: 'IMPLEMENTATION HANDOFF', createdAt: '2026-07-19T16:00:00Z' },
        { id: 2, marker: 'PR REVIEW REQUEST', createdAt: '2026-07-19T16:05:00Z' },
      ],
    });
    expect(lanes.topology.horizontal).toEqual([
      'pmo-engineering',
      'implementation-operations',
      'day2-operations',
    ]);
    expect(lanes.topology.vertical).toBe('administration-communications');
    expect(lanes.lanes['implementation-operations'].nestedReview.phase).toBe('review-pending');
    expect(lanes.lanes['implementation-operations'].implementationHandoffComplete).toBe(true);
    expect(Object.keys(lanes.lanes)).toEqual([
      'pmo-engineering',
      'implementation-operations',
      'day2-operations',
      'administration-communications',
    ]);
  });

  it('allows Task B while Task A is review/admin pending and treats administrative-only as non-blocking', () => {
    expect(evaluateSuccessorEligibility({
      dependencyClass: 'administrative-only',
      predecessorComplete: false,
      nestedReviewPhase: 'review-pending',
    }).eligible).toBe(true);

    const taskA = resolveRepositoryState({
      ...base,
      task: { ...base.task, issueNumber: 2600, id: '008' },
      events: [{ id: 10, marker: 'IMPLEMENTATION HANDOFF', createdAt: '2026-07-19T16:00:00Z' }],
      claims: [],
    }, fourLaneOn);
    const taskB = resolveRepositoryState({
      ...base,
      task: { ...base.task, issueNumber: 2639, id: '015' },
      dependencyClass: 'none',
      predecessorStates: ['complete'],
      fileScope: ['docs/ops/reports/**'],
      claims: [],
    }, fourLaneOn);
    expect(evaluateLaneEligibility(taskA, [taskA, taskB], { now: '2026-07-19T17:00:00Z', policy: fourLaneOn }).eligible).toBe(false);
    expect(evaluateLaneEligibility(taskB, [taskA, taskB], { now: '2026-07-19T17:00:00Z', policy: fourLaneOn }).eligible).toBe(true);
    const selected = reconcileSnapshots([taskA, taskB], { ...fourLaneOn, now: '2026-07-19T17:00:00Z' });
    expect(selected.selected.identity.taskIssue).toBe(2639);
  });

  it('does not let administration block delivery without an explicit substantive defect', () => {
    const clean = resolveRepositoryState(base, fourLaneOn);
    expect(clean.operatingLanes.lanes['administration-communications'].blocksDelivery).toBe(false);
    expect(planAction(clean, fourLaneOn).class).toBe('cursor_ack_required');

    const blocked = resolveRepositoryState({
      ...base,
      administration: { substantiveDefect: true, defectCode: 'acceptance_gap' },
    }, fourLaneOn);
    expect(blocked.operatingLanes.lanes['administration-communications'].blocksDelivery).toBe(true);
    expect(planAction(blocked, fourLaneOn).class).toBe('halt');
  });

  it('covers dependency classes: direct, stacked, collision, protected-stop, explicit-hold', () => {
    expect(evaluateSuccessorEligibility({ dependencyClass: 'direct', predecessorComplete: false }).eligible).toBe(false);
    expect(evaluateSuccessorEligibility({ dependencyClass: 'stacked', predecessorComplete: false }).eligible).toBe(false);
    expect(evaluateSuccessorEligibility({ dependencyClass: 'collision' }).eligible).toBe(false);
    expect(evaluateSuccessorEligibility({ dependencyClass: 'protected-stop' }).eligible).toBe(false);
    expect(evaluateSuccessorEligibility({ dependencyClass: 'explicit-hold' }).eligible).toBe(false);
    expect(evaluateSuccessorEligibility({
      dependencyClass: 'direct',
      predecessorComplete: false,
      nestedReviewPhase: 'review-pending',
    }).reason).toBe('independent_while_prior_in_review_or_admin');
  });

  it('auto-creates/elevates deduplicated high-priority operational incidents from trusted evidence', () => {
    const evidence = normalizeIncidentEvidence({
      trusted: true,
      source: 'ci',
      subject: 'production-health',
      runId: 99,
      summary: 'required gate failed',
      observedAt: '2026-07-19T16:00:00Z',
    });
    const first = upsertOperationalIncident([], evidence, { now: '2026-07-19T16:00:00Z' });
    expect(first.ok).toBe(true);
    expect(first.reason).toBe('created');
    expect(first.incident.priority).toBe('high');
    const second = upsertOperationalIncident(first.incidents, evidence, { now: '2026-07-19T16:05:00Z' });
    expect(second.reason).toBe('elevated_existing');
    expect(second.incident.occurrenceCount).toBe(2);
    expect(upsertOperationalIncident([], { trusted: false, source: 'ci', subject: 'x' }).ok).toBe(false);
  });

  it('applies assessment hold, preserves state, and supports false-positive/low-impact release', () => {
    const snapshot = resolveRepositoryState({
      ...base,
      events: [{ id: 20, marker: 'OPERATIONAL INCIDENT', createdAt: '2026-07-19T16:10:00Z' }],
      operationalHold: { active: true, scope: 'assessment', severityClassified: false },
    }, fourLaneOn);
    expect(snapshot.operatingLanes.operationalHold.active).toBe(true);
    expect(snapshot.operatingLanes.lanes['day2-operations'].status).toBe('assessment-active');
    expect(planAction(snapshot, fourLaneOn).class).toBe('operational_assessment');

    const preserved = preserveDeliveryStateForHold(snapshot, { incidentKey: 'inc-1', preservedAt: '2026-07-19T16:10:00Z' });
    expect(preserved.taskIssue).toBe(2639);
    expect(preserved.watermarks.latestEventMarker).toBe('OPERATIONAL INCIDENT');

    expect(releaseOperationalHold({
      hold: { active: true, preservedState: preserved },
      triage: { falsePositive: true },
    }).released).toBe(true);
    expect(releaseOperationalHold({
      hold: { active: true, preservedState: preserved },
      triage: { lowImpact: true },
    }).reason).toBe('low_impact');
  });

  it('routes safe reversible auto-remediation and recovery/resume transitions deterministically', () => {
    const incident = upsertOperationalIncident([], normalizeIncidentEvidence({
      trusted: true,
      source: 'ci',
      subject: 'prod-ci',
      runId: 42,
    }), { now: '2026-07-19T16:00:00Z' }).incident;
    const remediation = planSafeAutoRemediation(incident, fourLaneOn);
    expect(remediation.safe).toBe(true);
    expect(remediation.reversible).toBe(true);

    const snapshot = resolveRepositoryState({
      ...base,
      events: [{ id: 21, marker: 'OPERATIONAL INCIDENT', createdAt: '2026-07-19T16:00:00Z' }],
      operationalHold: { active: true, scope: 'assessment', severityClassified: true },
      incidentAutoRemediation: remediation,
    }, fourLaneOn);
    expect(planAction(snapshot, fourLaneOn).class).toBe('operational_auto_remediation');

    const classified = classifyIncidentSeverity(incident, { severity: 'high', recoveryVerified: true });
    expect(classified.assessmentHoldReleaseEligible).toBe(true);

    const resumeSnap = resolveRepositoryState({
      ...base,
      events: [
        { id: 21, marker: 'OPERATIONAL INCIDENT', createdAt: '2026-07-19T16:00:00Z' },
        { id: 22, marker: 'RECOVERY VERIFIED', createdAt: '2026-07-19T17:00:00Z' },
      ],
      operationalHold: {
        active: true,
        scope: 'assessment',
        severityClassified: true,
        releaseAuthorized: true,
        preservedState: { taskIssue: 2639 },
      },
    }, fourLaneOn);
    expect(planAction(resumeSnap, fourLaneOn).class).toBe('operational_hold_release');
  });

  it('routes PROBLEM FOUND through plan adjustment without inventing lane decisions', () => {
    const snapshot = resolveRepositoryState({
      ...base,
      events: [{ id: 30, marker: 'PROBLEM FOUND', createdAt: '2026-07-19T16:00:00Z' }],
    }, fourLaneOn);
    expect(snapshot.operatingLanes.planAdjustment.active).toBe(true);
    expect(planAction(snapshot, fourLaneOn).class).toBe('plan_adjustment_route');
  });

  it('suppresses duplicate incident creation and never authorizes main merge under four-lane mode', () => {
    const evidence = normalizeIncidentEvidence({
      trusted: true,
      source: 'health-check',
      subject: 'site-down',
      summary: 'health failed',
    });
    const once = upsertOperationalIncident([], evidence);
    const twice = upsertOperationalIncident(once.incidents, evidence);
    expect(twice.incidents).toHaveLength(1);
    const mainPlan = planAction(resolveRepositoryState({
      ...base,
      pullRequests: [{ number: 9, base: 'main', state: 'open', mergeable: true }],
    }, fourLaneOn), { ...fourLaneOn, mode: 'integrate' });
    expect(mainPlan.class).toBe('human_decision');
    expect(mainPlan.mutations).toEqual([]);
  });

  it('disabling four-lane restores conservative planner and disables automatic operational holds', () => {
    const disabledPolicy = {
      mode: 'advance',
      fourLaneRuntime: { enabled: false, autoOperationalHolds: false },
    };
    const snapshot = resolveRepositoryState(base, disabledPolicy);
    expect(snapshot.operatingLanes).toBeNull();
    expect(snapshot.fourLaneEnabled).toBe(false);
    expect(planAction(snapshot, disabledPolicy).class).toBe('cursor_ack_required');
    expect(planSafeAutoRemediation({
      evidence: [{ source: 'ci', runId: 1 }],
    }, disabledPolicy).authorized).toBe(false);
  });
});
