import { describe, expect, it } from 'vitest';
import {
  isComponentOrSandboxRef,
  isComponentRef,
  isSandboxRef,
} from '../scripts/ci/branch_ref_classification.mjs';

describe('branch_ref_classification (#2622)', () => {
  it('isComponentRef accepts component/** with a nonempty suffix', () => {
    expect(isComponentRef('component/example')).toBe(true);
    expect(isComponentRef('component/issue-contract-draft-pr')).toBe(true);
  });

  it('isComponentRef rejects a bare "component/" or a non-component ref', () => {
    expect(isComponentRef('component/')).toBe(false);
    expect(isComponentRef('componentfoo')).toBe(false);
    expect(isComponentRef('main')).toBe(false);
    expect(isComponentRef('')).toBe(false);
  });

  it('isSandboxRef accepts sandbox/** with a nonempty suffix', () => {
    expect(isSandboxRef('sandbox/example')).toBe(true);
    expect(isSandboxRef('sandbox/issue-contract-draft-pr')).toBe(true);
  });

  it('isSandboxRef rejects a bare "sandbox/" or a non-sandbox ref', () => {
    expect(isSandboxRef('sandbox/')).toBe(false);
    expect(isSandboxRef('sandboxfoo')).toBe(false);
    expect(isSandboxRef('component/example')).toBe(false);
    expect(isSandboxRef('')).toBe(false);
  });

  it('isComponentOrSandboxRef accepts either shape and rejects everything else', () => {
    expect(isComponentOrSandboxRef('component/example')).toBe(true);
    expect(isComponentOrSandboxRef('sandbox/example')).toBe(true);
    expect(isComponentOrSandboxRef('main')).toBe(false);
    expect(isComponentOrSandboxRef('feature/random')).toBe(false);
  });
});
