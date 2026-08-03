import fs from 'node:fs';
import path from 'node:path';
import { bridgeHome } from './paths.mjs';
import { atomicWriteJson } from './atomic-write.mjs';

export function isAgentAcceptedEvent(event) {
  return (
    event?.type === 'system' &&
    event?.subtype === 'init' &&
    typeof event?.session_id === 'string' &&
    event.session_id.length > 0
  );
}

export function sanitizeDiagnostic(value) {
  return String(value ?? '')
    .replace(/CURSOR_API_KEY\s*=\s*\S+/gi, 'CURSOR_API_KEY=[redacted]')
    .replace(/Authorization:\s*Bearer\s+\S+/gi, 'Authorization: Bearer [redacted]')
    .replace(/Token:\s*\S+/gi, 'Token: [redacted]')
    .replace(/\bsk-[A-Za-z0-9_-]+\b/g, '[redacted]')
    .slice(0, 1000);
}

export function summarizeStreamEvent(event) {
  if (!event || typeof event !== 'object') return 'stream_event:invalid';
  const summary = {
    type: event.type || null,
    subtype: event.subtype || null,
    session_id: event.session_id || null,
    call_id: event.call_id || null,
  };
  return sanitizeDiagnostic(JSON.stringify(summary));
}

export function prepareRetryPacket(
  packet,
  { reason, now = new Date(), baseDelaySeconds = 30, maxDelaySeconds = 900 } = {},
) {
  const attempts = Math.max(0, Number(packet?.launchAttempts || 0)) + 1;
  const delaySeconds = Math.min(
    Math.max(1, Number(maxDelaySeconds || 900)),
    Math.max(1, Number(baseDelaySeconds || 30)) * 2 ** Math.max(0, attempts - 1),
  );
  const timestamp = now instanceof Date ? now : new Date(now);
  return {
    ...packet,
    launchAttempts: attempts,
    lastLaunchFailure: reason || 'unknown_preaccept_failure',
    lastLaunchFailureAt: timestamp.toISOString(),
    notBefore: new Date(timestamp.getTime() + delaySeconds * 1000).toISOString(),
  };
}

export function classifyInterruptedLaunch(record) {
  if (!record) return 'none';
  if (!record.acceptedAt && ['claimed', 'cli_spawned'].includes(record.state)) {
    return 'retry_preaccept';
  }
  return 'hold_postaccept';
}

export function inFlightPath(config) {
  return path.join(bridgeHome(), config.inFlightPath || 'in-flight.json');
}

export function readInFlight(config) {
  const target = inFlightPath(config);
  if (!fs.existsSync(target)) return null;
  try {
    return JSON.parse(fs.readFileSync(target, 'utf8'));
  } catch {
    return null;
  }
}

export function writeInFlight(config, record) {
  const next = {
    schemaVersion: 1,
    ...record,
    updatedAt: new Date().toISOString(),
  };
  atomicWriteJson(inFlightPath(config), next, 0o600);
  return next;
}

export function clearInFlight(config) {
  const target = inFlightPath(config);
  if (fs.existsSync(target)) fs.unlinkSync(target);
}

function parseStreamLine(line) {
  const trimmed = String(line || '').trim();
  if (!trimmed) return null;
  try {
    return JSON.parse(trimmed);
  } catch {
    return null;
  }
}

export function monitorAgentProcess({
  child,
  startupTimeoutMs = 60_000,
  executionTimeoutMs = 7_200_000,
  heartbeatIntervalMs = 2_000,
  killGraceMs = 2_000,
  onAccepted = () => {},
  onHeartbeat = () => {},
  onDiagnostic = () => {},
} = {}) {
  if (!child || typeof child.on !== 'function') {
    throw new TypeError('monitorAgentProcess requires a child process');
  }

  return new Promise((resolve) => {
    let accepted = false;
    let sessionId = null;
    let settled = false;
    let stdoutBuffer = '';
    let stderrBuffer = '';
    let terminationReason = null;
    let killTimer = null;

    const cleanup = () => {
      clearTimeout(startupTimer);
      clearTimeout(executionTimer);
      clearInterval(heartbeatTimer);
      if (killTimer) clearTimeout(killTimer);
    };

    const finish = ({ reason, exitCode = null, signal = null }) => {
      if (settled) return;
      settled = true;
      cleanup();
      resolve({
        accepted,
        sessionId,
        reason,
        exitCode,
        signal,
      });
    };

    const terminate = (reason) => {
      if (settled || terminationReason) return;
      terminationReason = reason;
      try {
        child.kill('SIGTERM');
      } catch {
        finish({ reason });
        return;
      }
      killTimer = setTimeout(() => {
        if (settled) return;
        try {
          child.kill('SIGKILL');
        } catch {
          /* process may already be gone */
        }
        finish({ reason });
      }, killGraceMs);
    };

    const accept = (event) => {
      if (accepted) return;
      accepted = true;
      sessionId = event.session_id;
      clearTimeout(startupTimer);
      try {
        onAccepted({ event, sessionId, acceptedAt: new Date().toISOString() });
      } catch (error) {
        onDiagnostic(`acceptance_callback_failed:${sanitizeDiagnostic(error?.message || error)}`);
        terminate('acceptance_callback_failed');
      }
    };

    const consumeStdoutLine = (line) => {
      const event = parseStreamLine(line);
      if (!event) {
        onDiagnostic(`stdout_non_json:${sanitizeDiagnostic(line)}`);
        return;
      }
      onDiagnostic(summarizeStreamEvent(event));
      if (isAgentAcceptedEvent(event)) accept(event);
    };

    const consumeStderrLine = (line) => {
      if (!String(line || '').trim()) return;
      onDiagnostic(`stderr:${sanitizeDiagnostic(line)}`);
    };

    child.stdout?.on('data', (chunk) => {
      stdoutBuffer += chunk.toString();
      const lines = stdoutBuffer.split('\n');
      stdoutBuffer = lines.pop() || '';
      for (const line of lines) consumeStdoutLine(line);
    });

    child.stderr?.on('data', (chunk) => {
      stderrBuffer += chunk.toString();
      const lines = stderrBuffer.split('\n');
      stderrBuffer = lines.pop() || '';
      for (const line of lines) consumeStderrLine(line);
    });

    child.on('error', (error) => {
      onDiagnostic(`child_error:${sanitizeDiagnostic(error?.message || error)}`);
      finish({ reason: accepted ? 'cli_error_after_accept' : 'cli_error_preaccept' });
    });

    child.on('close', (code, signal) => {
      if (stdoutBuffer.trim()) consumeStdoutLine(stdoutBuffer);
      if (stderrBuffer.trim()) consumeStderrLine(stderrBuffer);
      if (terminationReason) {
        finish({ reason: terminationReason, exitCode: code, signal });
        return;
      }
      if (!accepted) {
        finish({ reason: `preaccept_exit_${code ?? 'signal'}`, exitCode: code, signal });
        return;
      }
      finish({
        reason: code === 0 ? 'completed' : `cli_exit_${code ?? 'signal'}`,
        exitCode: code,
        signal,
      });
    });

    const startupTimer = setTimeout(() => terminate('startup_timeout'), startupTimeoutMs);
    const executionTimer = setTimeout(
      () => terminate(accepted ? 'execution_timeout' : 'startup_timeout'),
      executionTimeoutMs,
    );
    const heartbeatTimer = setInterval(() => {
      try {
        onHeartbeat({
          accepted,
          sessionId,
          state: accepted ? 'running' : 'cli_spawned',
          at: new Date().toISOString(),
        });
      } catch (error) {
        onDiagnostic(`heartbeat_callback_failed:${sanitizeDiagnostic(error?.message || error)}`);
      }
    }, heartbeatIntervalMs);
  });
}
