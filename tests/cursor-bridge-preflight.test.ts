import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  FAILURE_PRIORITY,
  TOP_LEVEL_RESULTS,
  clearPreflightFailureState,
  isPreflightAllowingClaim,
  preflightAlertStatePath,
  preflightResultPath,
  redactSecrets,
  runPreflight,
} from '../scripts/cursor-bridge/lib/preflight.mjs';

function baseConfig(homeOverrides = {}) {
  return {
    repository: 'wdhunter645/next-starter-template',
    requiredLabels: ['agent:cursor', 'handoff:ready'],
    queueDir: 'queue',
    consumedDir: 'consumed',
    claimPath: 'claim.json',
    claimTtlSeconds: 7200,
    preflight: {
      enforce: true,
      resultPath: 'preflight-result.json',
      alertStatePath: 'preflight-alert-state.json',
      retrySeconds: 60,
      skipBridgeUnitOnStartup: true,
      cursorCapacitySignal: 'unknown',
      ...homeOverrides.preflight,
    },
    watchdog: {
      bridgeUnit: 'lgfc-cursor-bridge.service',
      runnerUnit: 'actions.runner.test.service',
    },
  };
}

function allPassProbes(overrides = {}) {
  return {
    configuration: () => ({ ok: true, detail: 'ok' }),
    runner: () => ({ ok: true, state: 'active', unit: 'actions.runner.test.service' }),
    bridge: () => ({ ok: true, state: 'active', unit: 'lgfc-cursor-bridge.service' }),
    githubAuth: () => ({ ok: true, detail: 'Logged in to github.com' }),
    cursorAuth: () => ({ ok: true, detail: 'logged in' }),
    cursorCapacity: () => ({ ok: true, status: 'unknown', detail: 'unknown' }),
    workspace: () => ({ ok: true, path: '/tmp/ws', detail: 'present' }),
    queue: () => ({ ok: true, detail: 'rw' }),
    claim: () => ({ ok: true, status: 'none', detail: 'none' }),
    ...overrides,
  };
}

describe('Cursor Bridge preflight (#2681)', () => {
  const homes: string[] = [];

  afterEach(() => {
    delete process.env.LGFC_CURSOR_BRIDGE_HOME;
    for (const home of homes.splice(0)) {
      fs.rmSync(home, { recursive: true, force: true });
    }
    vi.restoreAllMocks();
  });

  function withHome() {
    const home = fs.mkdtempSync(path.join(os.tmpdir(), 'lgfc-pf-'));
    homes.push(home);
    process.env.LGFC_CURSOR_BRIDGE_HOME = home;
    fs.mkdirSync(path.join(home, 'queue'), { recursive: true, mode: 0o700 });
    fs.mkdirSync(path.join(home, 'consumed'), { recursive: true, mode: 0o700 });
    return home;
  }

  it('covers every taxonomy result from injected probes', () => {
    withHome();
    const config = baseConfig();
    const cases: Array<[string, Record<string, () => object>]> = [
      ['ready', {}],
      ['configuration_invalid', { configuration: () => ({ ok: false, detail: 'bad' }) }],
      ['runner_unavailable', { runner: () => ({ ok: false, state: 'inactive' }) }],
      ['bridge_unavailable', { bridge: () => ({ ok: false, state: 'inactive' }) }],
      [
        'github_not_authenticated',
        { githubAuth: () => ({ ok: false, detail: 'Token: ghp_SECRETVALUE' }) },
      ],
      ['cursor_not_authenticated', { cursorAuth: () => ({ ok: false, reason: 'cli_not_authenticated' }) }],
      [
        'cursor_capacity_unavailable',
        { cursorCapacity: () => ({ ok: false, status: 'unavailable' }) },
      ],
      ['workspace_unavailable', { workspace: () => ({ ok: false, path: '/missing' }) }],
      ['queue_unavailable', { queue: () => ({ ok: false, detail: 'no rw' }) }],
      ['stale_claim', { claim: () => ({ ok: false, status: 'stale' }) }],
      [
        'unknown_failure',
        {
          configuration: () => {
            throw new Error('boom CURSOR_API_KEY=sk-secret');
          },
        },
      ],
    ];

    const produced = new Set<string>();
    for (const [expected, override] of cases) {
      const result = runPreflight(config, {
        reason: 'manual',
        probes: allPassProbes(override),
        notify: false,
        persist: true,
      });
      expect(result.result).toBe(expected);
      produced.add(result.result);
    }
    for (const code of TOP_LEVEL_RESULTS) {
      expect(produced.has(code)).toBe(true);
    }
    expect(FAILURE_PRIORITY).toContain('runner_unavailable');
    expect(FAILURE_PRIORITY).toContain('bridge_unavailable');
  });

  it('keeps runner and bridge failures distinct', () => {
    withHome();
    const config = baseConfig();
    const runner = runPreflight(config, {
      probes: allPassProbes({ runner: () => ({ ok: false, state: 'failed' }) }),
      notify: false,
    });
    const bridge = runPreflight(config, {
      probes: allPassProbes({ bridge: () => ({ ok: false, state: 'failed' }) }),
      notify: false,
    });
    expect(runner.result).toBe('runner_unavailable');
    expect(bridge.result).toBe('bridge_unavailable');
  });

  it('keeps github auth, cursor auth, and capacity failures distinct', () => {
    withHome();
    const config = baseConfig();
    expect(
      runPreflight(config, {
        probes: allPassProbes({ githubAuth: () => ({ ok: false }) }),
        notify: false,
      }).result,
    ).toBe('github_not_authenticated');
    expect(
      runPreflight(config, {
        probes: allPassProbes({ cursorAuth: () => ({ ok: false }) }),
        notify: false,
      }).result,
    ).toBe('cursor_not_authenticated');
    expect(
      runPreflight(config, {
        probes: allPassProbes({ cursorCapacity: () => ({ ok: false }) }),
        notify: false,
      }).result,
    ).toBe('cursor_capacity_unavailable');
  });

  it('keeps workspace, queue, stale-claim, and config failures distinct', () => {
    withHome();
    const config = baseConfig();
    expect(
      runPreflight(config, {
        probes: allPassProbes({ workspace: () => ({ ok: false }) }),
        notify: false,
      }).result,
    ).toBe('workspace_unavailable');
    expect(
      runPreflight(config, {
        probes: allPassProbes({ queue: () => ({ ok: false }) }),
        notify: false,
      }).result,
    ).toBe('queue_unavailable');
    expect(
      runPreflight(config, {
        probes: allPassProbes({ claim: () => ({ ok: false }) }),
        notify: false,
      }).result,
    ).toBe('stale_claim');
    expect(
      runPreflight(config, {
        probes: allPassProbes({ configuration: () => ({ ok: false }) }),
        notify: false,
      }).result,
    ).toBe('configuration_invalid');
  });

  it('blocks claim when preflight fails and allows claim when ready', () => {
    withHome();
    const config = baseConfig();
    const blocked = runPreflight(config, {
      reason: 'preclaim',
      probes: allPassProbes({ githubAuth: () => ({ ok: false }) }),
      notify: false,
    });
    expect(isPreflightAllowingClaim(blocked)).toBe(false);
    expect(blocked.allowClaim).toBe(false);

    const ready = runPreflight(config, {
      reason: 'preclaim',
      probes: allPassProbes(),
      notify: false,
    });
    expect(isPreflightAllowingClaim(ready)).toBe(true);
  });

  it('enforcement disable still diagnoses but allows claim', () => {
    withHome();
    const config = baseConfig({ preflight: { enforce: false } });
    const result = runPreflight(config, {
      probes: allPassProbes({ runner: () => ({ ok: false }) }),
      notify: false,
    });
    expect(result.result).toBe('runner_unavailable');
    expect(result.enforcementDisabled).toBe(true);
    expect(isPreflightAllowingClaim(result)).toBe(true);
  });

  it('recovery clears active failure and permits next ready claim', () => {
    withHome();
    const config = baseConfig();
    const fail = runPreflight(config, {
      probes: allPassProbes({ queue: () => ({ ok: false }) }),
      notify: true,
    });
    expect(fail.alert.active).toBe(true);
    expect(fail.alert.deduplicated).toBe(false);

    clearPreflightFailureState(config);
    const ready = runPreflight(config, {
      reason: 'recovery',
      probes: allPassProbes(),
      notify: true,
    });
    expect(ready.result).toBe('ready');
    expect(isPreflightAllowingClaim(ready)).toBe(true);
    expect(fs.existsSync(preflightResultPath(config))).toBe(true);
  });

  it('deduplicates repeated periodic failure alerts', () => {
    withHome();
    const config = baseConfig();
    const first = runPreflight(config, {
      reason: 'periodic',
      probes: allPassProbes({ workspace: () => ({ ok: false }) }),
      notify: true,
    });
    const second = runPreflight(config, {
      reason: 'periodic',
      probes: allPassProbes({ workspace: () => ({ ok: false }) }),
      notify: true,
    });
    expect(first.alert.deduplicated).toBe(false);
    expect(first.alert.posted).toBe(true);
    expect(second.alert.deduplicated).toBe(true);
    expect(second.alert.posted).toBe(false);
    expect(fs.existsSync(preflightAlertStatePath(config))).toBe(true);
  });

  it('does not treat unknown capacity as a hard failure', () => {
    withHome();
    const config = baseConfig({ preflight: { cursorCapacitySignal: 'unknown' } });
    const result = runPreflight(config, {
      reason: 'periodic',
      probes: allPassProbes({
        cursorCapacity: () => ({ ok: true, status: 'unknown', detail: 'unknown' }),
      }),
      notify: false,
    });
    expect(result.result).toBe('ready');
    const capacity = result.checks.find((c: { name: string }) => c.name === 'cursorCapacity');
    expect(capacity.ok).toBe(true);
  });

  it('redacts secret-like values from results', () => {
    withHome();
    const config = baseConfig();
    const result = runPreflight(config, {
      probes: allPassProbes({
        githubAuth: () => ({
          ok: false,
          detail: 'Token: ghp_ABCDEFG123 CURSOR_API_KEY=sk-live-xyz',
        }),
      }),
      notify: false,
    });
    const blob = JSON.stringify(result);
    expect(blob).not.toContain('ghp_ABCDEFG123');
    expect(blob).not.toContain('sk-live-xyz');
    expect(redactSecrets('Bearer supersecret')).toContain('[redacted]');
  });

  it('persists result with mode 0600', () => {
    withHome();
    const config = baseConfig();
    runPreflight(config, { probes: allPassProbes(), notify: false });
    const mode = fs.statSync(preflightResultPath(config)).mode & 0o777;
    expect(mode).toBe(0o600);
  });
});
