import { describe, expect, it } from 'vitest';
import {
  COMPONENT_STATES,
  HOLD_LABELS,
  evaluateComponentIntegration,
} from '../scripts/ci/component_integration_eligibility.mjs';

function eligibleProfile(overrides = {}) {
  return {
    deliveryModel: 'B-child',
    gateProfile: 'component-child',
    approvalProfile: 'component-auto-integration',
    componentBranch: 'component/delivery-system-v1',
    componentMaster: '#2477',
    protectedChange: false,
    errors: [],
    baseRef: 'component/delivery-system-v1',
    baseBehindComponentHead: 0,
    ...overrides,
  };
}

function greenChecks() {
  return [
    { name: 'GATE — Quality Checks', conclusion: 'success' },
    { name: 'GATE — Diff Scope', conclusion: 'success' },
  ];
}

function evaluate(overrides = {}, options = {}) {
  const profile = eligibleProfile(overrides.profile);
  return evaluateComponentIntegration({
    profile,
    checks: 'checks' in options ? options.checks : greenChecks(),
    reviews: options.reviews || [],
    componentState: options.componentState || 'green',
    labels: options.labels || [],
    changedFiles: options.changedFiles || ['src/components/example.tsx'],
  });
}

describe('component integration contract constants', () => {
  it('exports stable hold labels and component states', () => {
    expect(HOLD_LABELS).toEqual(['component-integration-hold', 'hold:component-integration']);
    expect(COMPONENT_STATES).toEqual(['green', 'red', 'hold']);
  });
});

describe('component integration negative fixtures', () => {
  it('blocks failed checks', () => {
    const result = evaluate({}, {
      checks: [
        { name: 'GATE — Quality Checks', conclusion: 'success' },
        { name: 'GATE — Diff Scope', conclusion: 'failure' },
      ],
    });

    expect(result.eligible).toBe(false);
    expect(result.blockedReasons.map((reason) => reason.code)).toContain('failed_check');
    expect(result.requiresChatReview).toBe(false);
  });

  it('blocks pending checks', () => {
    const result = evaluate({}, {
      checks: [
        { name: 'GATE — Quality Checks', conclusion: 'success' },
        { name: 'GATE — Diff Scope', status: 'in_progress' },
      ],
    });

    expect(result.eligible).toBe(false);
    expect(result.blockedReasons.map((reason) => reason.code)).toContain('pending_check');
  });

  it('blocks non-component base branches', () => {
    const result = evaluate({
      profile: {
        baseRef: 'main',
        componentBranch: 'component/delivery-system-v1',
      },
    });

    expect(result.eligible).toBe(false);
    expect(result.blockedReasons.map((reason) => reason.code)).toContain('non_component_base');
  });

  it('blocks protected changes and requires Chat review', () => {
    const result = evaluate({
      profile: {
        protectedChange: true,
        approvalProfile: 'protected-change-review',
      },
    }, {
      changedFiles: ['.github/workflows/gate-quality.yml'],
    });

    expect(result.eligible).toBe(false);
    expect(result.requiresChatReview).toBe(true);
    expect(result.blockedReasons.map((reason) => reason.code)).toContain('protected_change');
  });

  it('blocks component integration holds from labels', () => {
    const result = evaluate({}, {
      labels: [{ name: 'component-integration-hold' }],
    });

    expect(result.eligible).toBe(false);
    expect(result.blockedReasons.map((reason) => reason.code)).toContain('component_hold');
  });

  it('blocks component red integration state', () => {
    const result = evaluate({}, { componentState: 'red' });

    expect(result.eligible).toBe(false);
    expect(result.blockedReasons.map((reason) => reason.code)).toContain('component_red_state');
  });

  it('blocks component branch metadata mismatch', () => {
    const result = evaluate({
      profile: {
        componentBranch: 'component/other-release',
        baseRef: 'component/delivery-system-v1',
      },
    });

    expect(result.eligible).toBe(false);
    expect(result.blockedReasons.map((reason) => reason.code)).toContain('branch_mismatch');
  });

  it('blocks missing component master metadata', () => {
    const result = evaluate({
      profile: {
        componentMaster: '',
      },
    });

    expect(result.eligible).toBe(false);
    expect(result.blockedReasons.map((reason) => reason.code)).toContain('missing_component_master');
  });

  it('blocks stale PR base behind component branch head', () => {
    const result = evaluate({
      profile: {
        baseBehindComponentHead: 3,
      },
    });

    expect(result.eligible).toBe(false);
    expect(result.blockedReasons.map((reason) => reason.code)).toContain('stale_base');
  });

  it('blocks production and emergency delivery models', () => {
    const production = evaluate({
      profile: {
        deliveryModel: 'A',
        gateProfile: 'production-candidate',
        approvalProfile: 'chat-bill-production',
        componentBranch: '',
        componentMaster: '',
        baseRef: 'main',
      },
    });
    const emergency = evaluate({
      profile: {
        deliveryModel: 'emergency-recovery',
        gateProfile: 'emergency-recovery',
        approvalProfile: 'emergency-approval',
        componentBranch: '',
        componentMaster: '',
        baseRef: 'main',
      },
    });

    expect(production.eligible).toBe(false);
    expect(emergency.eligible).toBe(false);
    expect(production.blockedReasons.map((reason) => reason.code)).toContain('invalid_delivery_model');
    expect(emergency.blockedReasons.map((reason) => reason.code)).toContain('invalid_delivery_model');
  });
});

describe('component integration positive fixture', () => {
  it('marks a clean eligible Model B child as auto-integration eligible', () => {
    const result = evaluate();

    expect(result).toEqual({
      eligible: true,
      blockedReasons: [],
      requiresChatReview: false,
      componentState: 'green',
      deliveryModel: 'B-child',
      gateProfile: 'component-child',
      approvalProfile: 'component-auto-integration',
      componentBranch: 'component/delivery-system-v1',
      componentMaster: '#2477',
      protectedChange: false,
    });
  });
});
