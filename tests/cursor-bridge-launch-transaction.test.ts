import { EventEmitter } from 'node:events';
import { PassThrough } from 'node:stream';
import { describe, expect, it, vi } from 'vitest';
import {
  isAgentAcceptedEvent,
  monitorAgentProcess,
} from '../scripts/cursor-bridge/lib/launch-transaction.mjs';

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
});
