import { describe, expect, it } from 'vitest';
import {
  resolveEnvironmentTier,
  requiredGatesForTier,
  environmentTitleLabel,
  REQUIRED_INLINE_GATES,
} from '../../scripts/agent-routing/environment-profiles.mjs';

describe('resolveEnvironmentTier (#2622 progressive admission)', () => {
  it('resolves sandbox/* branches to the sandbox tier', () => {
    expect(resolveEnvironmentTier('sandbox/issue-contract-draft-pr')).toBe('sandbox');
    expect(resolveEnvironmentTier('sandbox/anything-else')).toBe('sandbox');
  });

  it('resolves other non-main branches to the development tier', () => {
    expect(resolveEnvironmentTier('component/issue-contract-draft-pr')).toBe('development');
    expect(resolveEnvironmentTier('cursor/2622-example')).toBe('development');
  });

  it('never resolves main to any auto-admission tier', () => {
    expect(resolveEnvironmentTier('main')).toBeNull();
  });

  it('never resolves an empty/missing base branch to any tier', () => {
    expect(resolveEnvironmentTier('')).toBeNull();
    expect(resolveEnvironmentTier(undefined)).toBeNull();
  });
});

describe('requiredGatesForTier / REQUIRED_INLINE_GATES', () => {
  it('sandbox requires only the secret scan', () => {
    expect(requiredGatesForTier('sandbox')).toEqual(['secret_scan']);
  });

  it('development requires the secret scan plus quality', () => {
    expect(requiredGatesForTier('development')).toEqual(['secret_scan', 'quality']);
  });

  it('returns null for an unimplemented or unknown tier', () => {
    expect(requiredGatesForTier('transition')).toBeNull();
    expect(requiredGatesForTier('production')).toBeNull();
    expect(requiredGatesForTier(undefined)).toBeNull();
  });

  it('gate lists are monotonic: sandbox is a subset of development', () => {
    for (const gate of REQUIRED_INLINE_GATES.sandbox) {
      expect(REQUIRED_INLINE_GATES.development).toContain(gate);
    }
  });

  it('returns a fresh array each call so callers cannot mutate the shared profile', () => {
    const first = requiredGatesForTier('sandbox');
    first.push('tampered');
    expect(requiredGatesForTier('sandbox')).toEqual(['secret_scan']);
  });
});

describe('environmentTitleLabel', () => {
  it('labels known tiers', () => {
    expect(environmentTitleLabel('sandbox')).toBe('Sandbox');
    expect(environmentTitleLabel('development')).toBe('Development');
  });

  it('falls back to the raw tier string for unknown tiers', () => {
    expect(environmentTitleLabel('transition')).toBe('transition');
  });
});
