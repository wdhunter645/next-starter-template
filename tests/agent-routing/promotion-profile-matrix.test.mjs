import { describe, expect, it } from 'vitest';
import {
  ALLOWED_PROFILE_TRANSITIONS,
  PROMOTION_PROFILES,
  PROHIBITED_PROFILE_BYPASSES,
  assertProfileTransition,
  evaluateProfileTransition,
  gateActionByPromotionProfile,
  listAllowedTransitions,
  listProhibitedBypasses,
  normalizePromotionProfile,
  resolveOperatingLaneState,
  resolvePromotionProfileState,
  planFourLaneAction,
} from '../../scripts/agent-routing/four-lane-runtime.mjs';

describe('promotion-profile transition matrix (#2639)', () => {
  it('exposes the five deterministic promotion profiles', () => {
    expect(PROMOTION_PROFILES).toEqual([
      'sandbox',
      'development',
      'promotion-candidate',
      'production',
      'day2-operations',
    ]);
  });

  it('allows the canonical forward and remediation edges', () => {
    expect(evaluateProfileTransition('none', 'sandbox').allowed).toBe(true);
    expect(evaluateProfileTransition('none', 'development').allowed).toBe(true);
    expect(evaluateProfileTransition('sandbox', 'development').allowed).toBe(true);
    expect(evaluateProfileTransition('development', 'promotion-candidate').allowed).toBe(true);
    expect(evaluateProfileTransition('promotion-candidate', 'production').allowed).toBe(true);
    expect(evaluateProfileTransition('promotion-candidate', 'development').allowed).toBe(true);
    expect(evaluateProfileTransition('production', 'day2-operations').allowed).toBe(true);
    expect(evaluateProfileTransition('day2-operations', 'development').allowed).toBe(true);
    expect(evaluateProfileTransition('day2-operations', 'promotion-candidate').allowed).toBe(true);
  });

  it('rejects the eight prohibited bypass edges', () => {
    expect(PROHIBITED_PROFILE_BYPASSES).toHaveLength(8);
    for (const [from, to] of PROHIBITED_PROFILE_BYPASSES) {
      const result = evaluateProfileTransition(from, to);
      expect(result.allowed).toBe(false);
      expect(result.code).toBe('prohibited_bypass');
    }
    expect(evaluateProfileTransition('sandbox', 'promotion-candidate').code).toBe('prohibited_bypass');
    expect(evaluateProfileTransition('sandbox', 'production').code).toBe('prohibited_bypass');
    expect(evaluateProfileTransition('development', 'production').code).toBe('prohibited_bypass');
  });

  it('normalizes aliases and fails closed on unknown profiles', () => {
    expect(normalizePromotionProfile('Promotion Candidate')).toBe('promotion-candidate');
    expect(normalizePromotionProfile('Day-2 Operations')).toBe('day2-operations');
    expect(evaluateProfileTransition('development', 'mystery').allowed).toBe(false);
    expect(evaluateProfileTransition('mystery', 'production').code).toBe('unknown_profile');
  });

  it('assertProfileTransition throws on prohibited bypass', () => {
    expect(() => assertProfileTransition('development', 'production')).toThrow(/prohibited bypass/);
    expect(assertProfileTransition('development', 'promotion-candidate').allowed).toBe(true);
  });

  it('lists allowed and prohibited edges for fixtures', () => {
    expect(listProhibitedBypasses().map((edge) => edge.edge)).toContain('development->production');
    expect(listAllowedTransitions().map((edge) => edge.edge)).toContain('sandbox->development');
    expect(ALLOWED_PROFILE_TRANSITIONS.sandbox).toEqual(['development']);
  });

  it('resolves promotion-profile state on operating-lane snapshots', () => {
    const lanes = resolveOperatingLaneState({
      projectGo: true,
      profile: 'development',
      events: [
        { id: 1, marker: 'IMPLEMENTATION HANDOFF', createdAt: '2026-07-19T16:00:00Z' },
      ],
    });
    expect(lanes.promotionProfile.profiles).toEqual(PROMOTION_PROFILES);
    expect(lanes.promotionProfile.current).toBe('development');
    expect(lanes.lanes['implementation-operations'].profile).toBe('development');
  });

  it('infers promotion-candidate and production from typed markers', () => {
    expect(resolvePromotionProfileState({
      events: [{ id: 1, marker: 'PROMOTION CANDIDATE READY', createdAt: '2026-07-19T16:00:00Z' }],
    }).current).toBe('promotion-candidate');
    expect(resolvePromotionProfileState({
      events: [{ id: 1, marker: 'PRODUCTION GO', createdAt: '2026-07-19T16:00:00Z' }],
    }).current).toBe('production');
  });

  it('gates four-lane planner actions that request a prohibited profile bypass', () => {
    const lanes = resolveOperatingLaneState({
      projectGo: true,
      profile: 'development',
      events: [{ id: 1, marker: 'CURSOR ACK', createdAt: '2026-07-19T16:00:00Z' }],
    });
    const snapshot = {
      operatingLanes: lanes,
      identity: { taskIssue: 2639, projectBranch: 'component/agent-issue-polling-handoff-routing' },
      pullRequests: [],
    };
    const halted = planFourLaneAction(snapshot, {
      mode: 'advance',
      currentProfile: 'development',
      targetProfile: 'production',
    });
    expect(halted.class).toBe('halt');
    expect(halted.reason).toBe('prohibited_bypass');

    const allowed = planFourLaneAction(snapshot, {
      mode: 'advance',
      currentProfile: 'development',
      targetProfile: 'promotion-candidate',
    });
    expect(allowed.class).not.toBe('halt');
  });

  it('gateActionByPromotionProfile returns halt payload for bypasses', () => {
    const gated = gateActionByPromotionProfile({
      currentProfile: 'sandbox',
      targetProfile: 'production',
      actionClass: 'promote',
    });
    expect(gated.gated).toBe(true);
    expect(gated.actionClass).toBe('halt');
    expect(gated.decision.code).toBe('prohibited_bypass');
  });

  it('fails closed when unknown raw input.profile would otherwise enter lane state', () => {
    const lanes = resolveOperatingLaneState({
      projectGo: true,
      profile: 'mystery',
      events: [{ id: 1, marker: 'CURSOR ACK', createdAt: '2026-07-19T16:00:00Z' }],
    });
    expect(lanes.promotionProfile.unknownRawProfile).toBe(true);
    expect(lanes.promotionProfile.current).toBe('none');
    expect(lanes.lanes['implementation-operations'].profile).toBe('none');
    expect(lanes.lanes['implementation-operations'].profile).not.toBe('mystery');

    const snapshot = {
      operatingLanes: lanes,
      identity: { taskIssue: 2639, projectBranch: 'component/agent-issue-polling-handoff-routing' },
      pullRequests: [],
    };
    const planned = planFourLaneAction(snapshot, { mode: 'advance' });
    expect(planned.class).toBe('halt');
    expect(planned.reason).toBe('unknown_profile');
  });
});
