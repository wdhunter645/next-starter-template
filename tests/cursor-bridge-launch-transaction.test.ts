import { EventEmitter } from 'node:events';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { PassThrough } from 'node:stream';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { clearInFlightAfterDurable, recoverInterruptedLaunch } from '../scripts/cursor-bridge/bridge.mjs';
import {
  classifyInterruptedLaunch,
  isAgentAcceptedEvent,
  monitorAgentProcess,
  prepareRetryPacket,
  readInFlight,
  sanitizeDiagnostic,
  writeInFlight,
} from '../scripts/cursor-bridge/lib/launch-transaction.mjs';
import {
  FALLBACK_PREFIXES,
  resolveFallbackPrefix,
} from '../scripts/cursor-bridge/lib/notify.mjs';

class FakeChild extends EventEmitter {
  stdout = new PassThrough();
  stderr = new PassThrough();
  killed = false;

  kill(): boolean {
    this.killed = true;
    queueMicrotask(() => this.emit('close', 143, 'SIGTERM'));
    return true;
  }
}

describe('Cursor Bridge launch transaction', () => {
  it('recognizes only the Cursor system/init event as agent acceptance', () => {
    expect(isAgentAcceptedEvent({ type: 'system', subtype: 'init', session_id: 'session-1' })).toBe(
      true,
    );
    expect(isAgentAcceptedEvent({ type: 'assistant', session_id: 'session-1' })).toBe(false);
    expect(isAgentAcceptedEvent({ type: 'system', subtype: 'status' })).toBe(false);
  });

  it('times out a spawned process that never emits an acceptance event', async () => {
    const child = new FakeChild();
    const onAccepted = vi.fn();

    const result = await monitorAgentProcess({
      child,
      startupTimeoutMs: 20,
      executionTimeoutMs: 200,
      heartbeatIntervalMs: 5,
      onAccepted,
    });

    expect(result.accepted).toBe(false);
    expect(result.reason).toBe('startup_timeout');
    expect(child.killed).toBe(true);
    expect(onAccepted).not.toHaveBeenCalled();
  });

  it('treats exit before system/init as pre-accept failure', async () => {
    const child = new FakeChild();
    const pending = monitorAgentProcess({
      child,
      startupTimeoutMs: 100,
      executionTimeoutMs: 500,
      heartbeatIntervalMs: 5,
    });

    child.emit('close', 0, null);
    const result = await pending;

    expect(result.accepted).toBe(false);
    expect(result.reason).toBe('preaccept_exit_0');
  });

  it('accepts system/init once and completes successfully', async () => {
    const child = new FakeChild();
    const onAccepted = vi.fn();

    const pending = monitorAgentProcess({
      child,
      startupTimeoutMs: 100,
      executionTimeoutMs: 500,
      heartbeatIntervalMs: 5,
      onAccepted,
    });

    child.stdout.write(
      `${JSON.stringify({ type: 'system', subtype: 'init', session_id: 'session-2' })}\n`,
    );
    child.stdout.write(
      `${JSON.stringify({ type: 'assistant', session_id: 'session-2', message: { content: [] } })}\n`,
    );
    child.emit('close', 0, null);

    const result = await pending;

    expect(result.accepted).toBe(true);
    expect(result.sessionId).toBe('session-2');
    expect(result.reason).toBe('completed');
    expect(onAccepted).toHaveBeenCalledTimes(1);
  });

  it('continues heartbeat callbacks while an accepted agent is running', async () => {
    const child = new FakeChild();
    const onHeartbeat = vi.fn();

    const pending = monitorAgentProcess({
      child,
      startupTimeoutMs: 100,
      executionTimeoutMs: 500,
      heartbeatIntervalMs: 5,
      onHeartbeat,
    });

    child.stdout.write(
      `${JSON.stringify({ type: 'system', subtype: 'init', session_id: 'session-3' })}\n`,
    );
    await new Promise((resolve) => setTimeout(resolve, 25));
    child.emit('close', 0, null);

    const result = await pending;

    expect(result.accepted).toBe(true);
    expect(onHeartbeat.mock.calls.length).toBeGreaterThanOrEqual(2);
  });

  it('creates a bounded retry packet without marking the handoff consumed', () => {
    const now = new Date('2026-07-22T00:00:00.000Z');
    const retry = prepareRetryPacket(
      { issueNumber: 2739, deliveryId: 'wake-1', launchAttempts: 1 },
      {
        reason: 'startup_timeout',
        now,
        baseDelaySeconds: 30,
        maxDelaySeconds: 120,
      },
    );

    expect(retry.launchAttempts).toBe(2);
    expect(retry.lastLaunchFailure).toBe('startup_timeout');
    expect(retry.notBefore).toBe('2026-07-22T00:01:00.000Z');
    expect(retry).not.toHaveProperty('consumed');
  });

  it('recovers interrupted pre-accept work as retryable and post-accept work as hold', () => {
    expect(classifyInterruptedLaunch({ state: 'cli_spawned', acceptedAt: null })).toBe(
      'retry_preaccept',
    );
    expect(
      classifyInterruptedLaunch({
        state: 'running',
        acceptedAt: '2026-07-22T00:00:00.000Z',
      }),
    ).toBe('hold_postaccept');
  });

  it('keeps live diagnostics secret-safe', () => {
    const text = sanitizeDiagnostic(
      'CURSOR_API_KEY=secret Token: abc123 Authorization: Bearer xyz sk-test-123',
    );

    expect(text).not.toContain('secret');
    expect(text).not.toContain('abc123');
    expect(text).not.toContain('xyz');
    expect(text).not.toContain('sk-test-123');
    expect(text).toContain('[redacted]');
  });
});

describe('Cursor Bridge post-merge remediation (#2746)', () => {
  const previousHome = process.env.LGFC_CURSOR_BRIDGE_HOME;
  let tempHome = '';

  afterEach(() => {
    if (previousHome === undefined) {
      delete process.env.LGFC_CURSOR_BRIDGE_HOME;
    } else {
      process.env.LGFC_CURSOR_BRIDGE_HOME = previousHome;
    }
    if (tempHome && fs.existsSync(tempHome)) {
      fs.rmSync(tempHome, { recursive: true, force: true });
    }
    tempHome = '';
  });

  function makeTempBridgeHome() {
    tempHome = fs.mkdtempSync(path.join(os.tmpdir(), 'lgfc-bridge-2746-'));
    process.env.LGFC_CURSOR_BRIDGE_HOME = tempHome;
    fs.mkdirSync(path.join(tempHome, 'queue'), { recursive: true, mode: 0o700 });
    fs.mkdirSync(path.join(tempHome, 'consumed'), { recursive: true, mode: 0o700 });
    return tempHome;
  }

  it('uses distinct operator-visible fallback classifications for retry and accepted-run failures', () => {
    const unclaimed = resolveFallbackPrefix('unclaimed', {});
    const launchRetry = resolveFallbackPrefix('launch-retry', {});
    const acceptedFailure = resolveFallbackPrefix('accepted-run-failure', {});

    expect(unclaimed).toBe(FALLBACK_PREFIXES.unclaimed);
    expect(launchRetry).toBe(FALLBACK_PREFIXES.launchRetry);
    expect(acceptedFailure).toBe(FALLBACK_PREFIXES.acceptedRunFailure);
    expect(launchRetry).not.toBe(unclaimed);
    expect(acceptedFailure).not.toBe(unclaimed);
    expect(launchRetry).not.toBe(acceptedFailure);
  });

  it('clears in-flight only after durable mutation completes', () => {
    makeTempBridgeHome();
    const config = { inFlightPath: 'in-flight.json' };
    writeInFlight(config, {
      state: 'cli_spawned',
      issueNumber: 2746,
      acceptedAt: null,
    });

    const order: string[] = [];
    clearInFlightAfterDurable(config, () => {
      expect(readInFlight(config)).not.toBeNull();
      order.push('durable');
      fs.writeFileSync(path.join(tempHome, 'durable.marker'), 'ok', { mode: 0o600 });
    });
    order.push('cleared');

    expect(order).toEqual(['durable', 'cleared']);
    expect(readInFlight(config)).toBeNull();
    expect(fs.existsSync(path.join(tempHome, 'durable.marker'))).toBe(true);
  });

  it('retains in-flight when durable mutation throws before completion', () => {
    makeTempBridgeHome();
    const config = { inFlightPath: 'in-flight.json' };
    writeInFlight(config, {
      state: 'cli_spawned',
      issueNumber: 2746,
      acceptedAt: null,
    });

    expect(() =>
      clearInFlightAfterDurable(config, () => {
        throw new Error('simulated_crash_before_durable_complete');
      }),
    ).toThrow(/simulated_crash_before_durable_complete/);

    expect(readInFlight(config)).not.toBeNull();
  });

  it('recovers interrupted pre-accept work by requeueing before clearing in-flight', () => {
    makeTempBridgeHome();
    const config = {
      inFlightPath: 'in-flight.json',
      claimPath: 'claim.json',
      queueDir: 'queue',
      consumedDir: 'consumed',
      launchRetryBaseSeconds: 30,
      launchRetryMaxSeconds: 120,
      alertsLog: 'alerts.log',
      bridgeLog: 'bridge.log',
    };
    const dirs = {
      home: tempHome,
      queue: path.join(tempHome, 'queue'),
      consumed: path.join(tempHome, 'consumed'),
    };
    const packetPath = path.join(dirs.queue, 'wake-2746.json');
    const processing = `${packetPath}.processing`;
    const packet = {
      issueNumber: 2746,
      deliveryId: 'wake-2746',
      launchAttempts: 1,
      launchFallbackPosted: true,
    };
    fs.writeFileSync(processing, JSON.stringify(packet, null, 2), { mode: 0o600 });
    writeInFlight(config, {
      state: 'cli_spawned',
      issueNumber: 2746,
      acceptedAt: null,
      packetPath,
      processingPath: processing,
      packet,
    });

    const result = recoverInterruptedLaunch(config, dirs);

    expect(result).toMatchObject({ recovered: true, reason: 'retry_preaccept', issueNumber: 2746 });
    expect(fs.existsSync(packetPath)).toBe(true);
    expect(fs.existsSync(processing)).toBe(false);
    expect(readInFlight(config)).toBeNull();
    const restored = JSON.parse(fs.readFileSync(packetPath, 'utf8'));
    expect(restored.launchAttempts).toBe(2);
    expect(restored.lastLaunchFailure).toBe('bridge_restart_preaccept');
  });

  it('archives interrupted accepted work before clearing in-flight', () => {
    makeTempBridgeHome();
    const config = {
      inFlightPath: 'in-flight.json',
      claimPath: 'claim.json',
      queueDir: 'queue',
      consumedDir: 'consumed',
      alertsLog: 'alerts.log',
      bridgeLog: 'bridge.log',
      fallbackAcceptedFailureCommentPrefix: FALLBACK_PREFIXES.acceptedRunFailure,
    };
    const dirs = {
      home: tempHome,
      queue: path.join(tempHome, 'queue'),
      consumed: path.join(tempHome, 'consumed'),
    };
    const packetPath = path.join(dirs.queue, 'wake-2746-accepted.json');
    const processing = `${packetPath}.processing`;
    fs.writeFileSync(processing, JSON.stringify({ issueNumber: 0 }, null, 2), { mode: 0o600 });
    writeInFlight(config, {
      state: 'running',
      issueNumber: 0,
      acceptedAt: '2026-07-22T00:00:00.000Z',
      packetPath,
      processingPath: processing,
    });

    const result = recoverInterruptedLaunch(config, dirs);

    expect(result).toMatchObject({ recovered: true, reason: 'hold_postaccept' });
    expect(readInFlight(config)).toBeNull();
    expect(fs.existsSync(processing)).toBe(false);
    const archived = fs.readdirSync(dirs.consumed);
    expect(archived.some((name) => name.includes('interrupted-after-acceptance'))).toBe(true);
  });

});
