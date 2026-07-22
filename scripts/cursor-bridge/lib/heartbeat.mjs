import fs from 'node:fs';
import path from 'node:path';
import { bridgeHome } from './paths.mjs';
import { atomicWriteJson, hostnameSafe } from './atomic-write.mjs';
import { readClaim, isClaimActive } from './claim.mjs';

export function heartbeatPath(config) {
  return path.join(bridgeHome(), config.heartbeatPath || 'heartbeat.json');
}

export function readHeartbeat(config) {
  const p = heartbeatPath(config);
  if (!fs.existsSync(p)) return null;
  try {
    return JSON.parse(fs.readFileSync(p, 'utf8'));
  } catch {
    return null;
  }
}

/**
 * Write a local Bridge heartbeat. Never publishes to GitHub.
 */
export function writeHeartbeat(config, partial = {}) {
  const claim = readClaim(config);
  const ttl = config.claimTtlSeconds || 7200;
  const activeClaim =
    claim && isClaimActive(claim, ttl)
      ? {
          issueNumber: claim.issueNumber,
          resumeCommentId: claim.resumeCommentId,
          acquiredAt: claim.acquiredAt,
          pid: claim.pid,
        }
      : null;

  const record = {
    schemaVersion: 1,
    updatedAt: new Date().toISOString(),
    pid: process.pid,
    hostname: hostnameSafe(),
    serviceMode: partial.serviceMode || 'watch',
    queueDepth: partial.queueDepth ?? null,
    activeClaim,
    activeLaunch: partial.activeLaunch ?? null,
    lastDrain: partial.lastDrain || null,
    lastReconcile: partial.lastReconcile || null,
    lastInboundPacketAt: partial.lastInboundPacketAt || null,
    lastOutboundGithubAt: partial.lastOutboundGithubAt || null,
  };

  atomicWriteJson(heartbeatPath(config), record, 0o600);
  return record;
}

export function heartbeatAgeSeconds(heartbeat) {
  if (!heartbeat?.updatedAt) return Number.POSITIVE_INFINITY;
  const ms = new Date(heartbeat.updatedAt).getTime();
  // Invalid/corrupted timestamps must look stale so watchdog restarts, not skip.
  if (!Number.isFinite(ms)) return Number.POSITIVE_INFINITY;
  return (Date.now() - ms) / 1000;
}
