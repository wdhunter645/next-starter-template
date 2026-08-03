import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const TASK_ISSUE = 2974;
const PARENT_ISSUE = 2678;
const REPO = 'wdhunter645/next-starter-template';

const spawnSyncMock = vi.fn();
const spawnMock = vi.fn();

vi.mock('node:child_process', () => {
  const mocked = {
    spawnSync: (...args) => spawnSyncMock(...args),
    spawn: (...args) => spawnMock(...args),
  };
  return { ...mocked, default: mocked };
});

vi.mock('../scripts/cursor-bridge/lib/notify.mjs', () => ({
  appendBridgeLog: vi.fn(),
  fallbackAcceptedFailure: vi.fn(),
  fallbackLaunchRetry: vi.fn(),
  fallbackUnclaimed: vi.fn(),
  postIssueComment: vi.fn(),
  notifyLocal: vi.fn(),
}));

function ghResult(payload) {
  return { status: 0, stdout: JSON.stringify(payload), stderr: '' };
}

function configureSpawnSync({ taskIssue, parentIssue }) {
  spawnSyncMock.mockImplementation((cmd, args) => {
    if (cmd !== 'gh') return { status: 0, stdout: '', stderr: '' };

    if (args[0] === 'issue' && args[1] === 'view' && args[2] === String(TASK_ISSUE)) {
      return ghResult(taskIssue);
    }
    if (args[0] === 'api' && String(args[1]).includes(`/issues/${TASK_ISSUE}/comments`)) {
      return ghResult([]);
    }
    if (args[0] === 'issue' && args[1] === 'view' && args[2] === String(PARENT_ISSUE)) {
      return parentIssue === undefined
        ? { status: 1, stdout: '', stderr: 'not found' }
        : ghResult(parentIssue);
    }
    throw new Error(`unexpected gh invocation: ${JSON.stringify(args)}`);
  });
}

describe('cursor bridge parent-context resolution (#2974)', () => {
  let tmpHome;
  let bridge;
  let notify;

  beforeEach(async () => {
    tmpHome = mkdtempSync(join(tmpdir(), 'lgfc-bridge-test-'));
    process.env.LGFC_CURSOR_BRIDGE_HOME = tmpHome;
    spawnSyncMock.mockReset();
    vi.resetModules();
    bridge = await import('../scripts/cursor-bridge/bridge.mjs');
    notify = await import('../scripts/cursor-bridge/lib/notify.mjs');
  });

  afterEach(() => {
    delete process.env.LGFC_CURSOR_BRIDGE_HOME;
    rmSync(tmpHome, { recursive: true, force: true });
  });

  let bridgePaths;

  beforeEach(async () => {
    bridgePaths = await import('../scripts/cursor-bridge/lib/paths.mjs');
  });

  function buildConfigAndDirs() {
    const config = bridgePaths.loadConfig();
    const dirs = bridgePaths.ensureDirs(config);
    return { config, dirs };
  }

  const taskIssueBody = (parentNumber) =>
    [
      `Parent Project: #${parentNumber}`,
      'Task ID: 999',
      'Task State: ELIGIBLE',
    ].join('\n');

  const validParentLabels = [
    { name: 'team:pmo' },
    { name: 'pmo:active' },
    { name: 'pmo:priority:1' },
  ];

  it('fetches and passes the declared parent so a valid parent no longer fails closed with missing_or_mismatched_parent', async () => {
    configureSpawnSync({
      taskIssue: {
        number: TASK_ISSUE,
        title: 'TASK: #2678-999',
        state: 'OPEN',
        labels: [{ name: 'agent:cursor' }, { name: 'handoff:ready' }, { name: 'pmo:active' }, { name: 'pmo:task' }],
        url: `https://github.com/${REPO}/issues/${TASK_ISSUE}`,
        body: taskIssueBody(PARENT_ISSUE),
      },
      parentIssue: { number: PARENT_ISSUE, state: 'OPEN', labels: validParentLabels },
    });

    const { config, dirs } = buildConfigAndDirs();
    const packetPath = join(dirs.queue, `wake-${TASK_ISSUE}.json`);
    writeFileSync(packetPath, JSON.stringify({ issueNumber: TASK_ISSUE }));

    const result = await bridge.processPacket(config, dirs, packetPath);

    // #2997: missing RESPONSE/RESUME is semantic — Bridge must not reject pre-launch.
    expect(result.reason).not.toBe('validation_failed');
    const validationFallbacks = notify.fallbackUnclaimed.mock.calls.filter((call) =>
      String(call[2] || '').includes('missing_chatgpt_response'),
    );
    expect(validationFallbacks).toHaveLength(0);

    // Prove the fix actually fetched the parent, not just that the label check passed by accident.
    const parentFetchCalls = spawnSyncMock.mock.calls.filter(
      ([cmd, args]) => cmd === 'gh' && args[0] === 'issue' && args[1] === 'view' && args[2] === String(PARENT_ISSUE),
    );
    expect(parentFetchCalls).toHaveLength(1);
  });

  it('fetches the real parent (not just a truthy stand-in) when the declared parent does not carry the required PMO labels', async () => {
    configureSpawnSync({
      taskIssue: {
        number: TASK_ISSUE,
        title: 'TASK: #2678-999',
        state: 'OPEN',
        labels: [{ name: 'agent:cursor' }, { name: 'handoff:ready' }, { name: 'pmo:active' }, { name: 'pmo:task' }],
        url: `https://github.com/${REPO}/issues/${TASK_ISSUE}`,
        body: taskIssueBody(PARENT_ISSUE),
      },
      parentIssue: { number: PARENT_ISSUE, state: 'OPEN', labels: [{ name: 'documentation' }] },
    });

    const { config, dirs } = buildConfigAndDirs();
    const packetPath = join(dirs.queue, `wake-${TASK_ISSUE}.json`);
    writeFileSync(packetPath, JSON.stringify({ issueNumber: TASK_ISSUE }));

    const result = await bridge.processPacket(config, dirs, packetPath);

    // #2997: queue-routing parent validity is semantic (passed to Cursor), not a
    // Bridge pre-launch rejection. Parent fetch must still occur.
    expect(result.reason).not.toBe('validation_failed');
    const parentFetchCalls = spawnSyncMock.mock.calls.filter(
      ([cmd, args]) => cmd === 'gh' && args[0] === 'issue' && args[1] === 'view' && args[2] === String(PARENT_ISSUE),
    );
    expect(parentFetchCalls).toHaveLength(1);
  });

  it('does not throw when the declared parent cannot be fetched; parent absence is a semantic finding (#2997)', async () => {
    configureSpawnSync({
      taskIssue: {
        number: TASK_ISSUE,
        title: 'TASK: #2678-999',
        state: 'OPEN',
        labels: [{ name: 'agent:cursor' }, { name: 'handoff:ready' }, { name: 'pmo:active' }, { name: 'pmo:task' }],
        url: `https://github.com/${REPO}/issues/${TASK_ISSUE}`,
        body: taskIssueBody(PARENT_ISSUE),
      },
      parentIssue: undefined,
    });

    const { config, dirs } = buildConfigAndDirs();
    const packetPath = join(dirs.queue, `wake-${TASK_ISSUE}.json`);
    writeFileSync(packetPath, JSON.stringify({ issueNumber: TASK_ISSUE }));

    await expect(bridge.processPacket(config, dirs, packetPath)).resolves.not.toMatchObject({
      reason: 'validation_failed',
    });
    const validationFallbacks = notify.fallbackUnclaimed.mock.calls.filter((call) =>
      String(call[2] || '').includes('missing_or_mismatched_parent'),
    );
    expect(validationFallbacks).toHaveLength(0);
  });

  it('fetchParentIssueMeta returns null instead of throwing on a failed gh invocation', async () => {
    spawnSyncMock.mockReturnValue({ status: 1, stdout: '', stderr: 'boom' });
    expect(bridge.fetchParentIssueMeta(PARENT_ISSUE)).toBeNull();
  });

  it('fetchParentIssueMeta parses a successful gh response', async () => {
    spawnSyncMock.mockReturnValue(ghResult({ number: PARENT_ISSUE, state: 'OPEN', labels: validParentLabels }));
    const result = bridge.fetchParentIssueMeta(PARENT_ISSUE);
    expect(result).toEqual({ number: PARENT_ISSUE, state: 'OPEN', labels: validParentLabels });
  });
});
