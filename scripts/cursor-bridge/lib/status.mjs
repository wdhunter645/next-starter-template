import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { bridgeHome, ensureDirs } from './paths.mjs';
import { readClaim, isClaimActive } from './claim.mjs';
import { readHeartbeat, heartbeatAgeSeconds } from './heartbeat.mjs';
import { cliAuthPreflight, resolveWorkspace } from './launch.mjs';
import { freeDiskMb } from './atomic-write.mjs';

function listPackets(queueDir) {
  if (!fs.existsSync(queueDir)) return [];
  return fs
    .readdirSync(queueDir)
    .filter((f) => f.endsWith('.json'))
    .map((f) => path.join(queueDir, f))
    .sort();
}

function oldestPacketAgeSeconds(queueDir) {
  const files = listPackets(queueDir);
  if (files.length === 0) return null;
  let oldest = null;
  for (const file of files) {
    try {
      const st = fs.statSync(file);
      const age = (Date.now() - st.mtimeMs) / 1000;
      if (oldest === null || age > oldest) oldest = age;
    } catch {
      /* ignore */
    }
  }
  return oldest;
}

function ghAuthStatus() {
  const r = spawnSync('gh', ['auth', 'status'], { encoding: 'utf8' });
  const out = `${r.stdout || ''}${r.stderr || ''}`.trim();
  const loggedIn = /Logged in to/i.test(out) && r.status === 0;
  return {
    ok: loggedIn,
    detail: out.slice(0, 240).replace(/Token:\s*\S+/gi, 'Token: [redacted]'),
  };
}

function systemdUnitActive(unit) {
  const r = spawnSync('systemctl', ['--user', 'is-active', unit], { encoding: 'utf8' });
  return (r.stdout || '').trim() || (r.status === 0 ? 'active' : 'unknown');
}

/**
 * Secret-safe readiness status for operators and the watchdog.
 */
export function collectStatus(config, opts = {}) {
  const dirs = ensureDirs(config);
  const claim = readClaim(config);
  const ttl = config.claimTtlSeconds || 7200;
  const claimActive = claim && isClaimActive(claim, ttl);
  const claimAgeSeconds = claim?.acquiredAt
    ? (Date.now() - new Date(claim.acquiredAt).getTime()) / 1000
    : null;
  const heartbeat = readHeartbeat(config);
  const queueFiles = listPackets(dirs.queue);
  const workspace = resolveWorkspace(config);
  const diskMb = freeDiskMb(dirs.home);
  const minDisk = config.watchdog?.minDiskMb ?? 256;

  const lastReconcile = heartbeat?.lastReconcile || null;
  const lastDrain = heartbeat?.lastDrain || null;

  return {
    schemaVersion: 1,
    collectedAt: new Date().toISOString(),
    home: bridgeHome(),
    workspace: {
      path: workspace,
      present: fs.existsSync(workspace),
    },
    transport: {
      note: 'GitHub Actions runner is transport only; Bridge owns health, claim, and launch',
      wakePacketQueueWritable: isDirWritable(dirs.queue),
      runnerObservedLocally: opts.skipSystemd ? null : observeRunnerUnit(config),
    },
    bridge: {
      service: opts.skipSystemd
        ? null
        : systemdUnitActive(config.watchdog?.bridgeUnit || 'lgfc-cursor-bridge.service'),
      heartbeat: heartbeat
        ? {
            updatedAt: heartbeat.updatedAt,
            ageSeconds: Math.round(heartbeatAgeSeconds(heartbeat) * 10) / 10,
            pid: heartbeat.pid,
            serviceMode: heartbeat.serviceMode,
            queueDepth: heartbeat.queueDepth,
          }
        : null,
      lastDrain,
      lastReconcile,
      lastInboundPacketAt: heartbeat?.lastInboundPacketAt || null,
      lastOutboundGithubAt: heartbeat?.lastOutboundGithubAt || null,
      lastRecoveryReason: heartbeat?.lastReconcile?.reason || null,
    },
    queue: {
      depth: queueFiles.length,
      oldestAgeSeconds: (() => {
        const age = oldestPacketAgeSeconds(dirs.queue);
        return age != null ? Math.round(age) : null;
      })(),
      files: queueFiles.map((f) => path.basename(f)),
    },
    claim: claimActive
      ? {
          state: 'active',
          issueNumber: claim.issueNumber,
          resumeCommentId: claim.resumeCommentId,
          acquiredAt: claim.acquiredAt,
          ageSeconds: claimAgeSeconds != null ? Math.round(claimAgeSeconds) : null,
          stale: claimAgeSeconds != null && claimAgeSeconds > ttl,
          ttlSeconds: ttl,
        }
      : claim
        ? {
            state: 'stale_or_expired',
            issueNumber: claim.issueNumber,
            resumeCommentId: claim.resumeCommentId,
            acquiredAt: claim.acquiredAt,
            ageSeconds: claimAgeSeconds != null ? Math.round(claimAgeSeconds) : null,
            stale: true,
            ttlSeconds: ttl,
          }
        : { state: 'none', stale: false, ttlSeconds: ttl },
    githubAuth: ghAuthStatus(),
    cursorCliAuth: (() => {
      const auth = cliAuthPreflight(config);
      return {
        ok: auth.ok,
        reason: auth.reason || null,
        // detail already truncated in cliAuthPreflight; still scrub tokens
        detail: String(auth.detail || '')
          .replace(/CURSOR_API_KEY=\S+/gi, 'CURSOR_API_KEY=[redacted]')
          .replace(/Token:\s*\S+/gi, 'Token: [redacted]')
          .slice(0, 200),
      };
    })(),
    disk: {
      freeMb: diskMb,
      minMb: minDisk,
      ok: diskMb == null ? null : diskMb >= minDisk,
    },
  };
}

function isDirWritable(dir) {
  try {
    fs.accessSync(dir, fs.constants.R_OK | fs.constants.W_OK);
    return true;
  } catch {
    return false;
  }
}

function observeRunnerUnit(config) {
  const configured = config.watchdog?.runnerUnit;
  if (configured) {
    return { unit: configured, state: systemdUnitActive(configured) };
  }
  // Best-effort discovery of GitHub Actions runner user units without assuming a fixed name.
  const r = spawnSync('systemctl', ['--user', 'list-units', '--type=service', '--all', '--no-legend'], {
    encoding: 'utf8',
  });
  if (r.status !== 0) return { unit: null, state: 'unknown' };
  const line = (r.stdout || '')
    .split('\n')
    .map((l) => l.trim())
    .find((l) => /actions\.runner/i.test(l));
  if (!line) return { unit: null, state: 'not_observed' };
  const unit = line.split(/\s+/)[0];
  return { unit, state: systemdUnitActive(unit) };
}
