#!/usr/bin/env node
/** Lightweight Bridge unit checks (no network). */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { validateEligibility, parseResume } from './lib/eligibility.mjs';
import {
  shouldQueueRecovery,
  buildRecoveryPacket,
  writeRecoveryPacket,
  packetMentionsResume,
  hasPendingOrProcessingPacket,
} from './lib/reconcile.mjs';
import { evaluateHealth, pruneRestarts, normalizeState } from './watchdog.mjs';
import { atomicWriteJson } from './lib/atomic-write.mjs';
import { writeHeartbeat, readHeartbeat, heartbeatAgeSeconds } from './lib/heartbeat.mjs';
import { runPreflight, TOP_LEVEL_RESULTS, isPreflightAllowingClaim } from './lib/preflight.mjs';

const baseIssue = {
  number: 2667,
  state: 'OPEN',
  labels: [{ name: 'agent:cursor' }, { name: 'handoff:ready' }],
};

const response = {
  id: 111,
  url: 'https://github.com/wdhunter645/next-starter-template/issues/2667#issuecomment-111',
  body: 'CHATGPT RESPONSE\nStatus: go\n',
  createdAt: '2026-07-20T12:00:00Z',
};

const resume = {
  id: 222,
  url: 'https://github.com/wdhunter645/next-starter-template/issues/2667#issuecomment-222',
  body: `LOCAL CURSOR RESUME
Issue: #2667
Source handoff: ${response.url}
Resume from: ${response.url}
Next local action:
- Implement bridge soak validation only
`,
  createdAt: '2026-07-20T12:01:00Z',
};

{
  const r = validateEligibility(baseIssue, [response, resume]);
  assert.equal(r.ok, true, r.errors.join(','));
  assert.equal(r.parsed.actions.length, 1);
}

{
  const bad = {
    ...resume,
    body: `LOCAL CURSOR RESUME
Issue: #2667
Resume from: ${response.url}
Next local action:
- first
- second
`,
  };
  const r = validateEligibility(baseIssue, [response, bad]);
  assert.equal(r.ok, false);
  assert.ok(r.errors.some((e) => e.startsWith('resume_action_count')));
}

{
  const r = validateEligibility(
    { ...baseIssue, labels: [{ name: 'agent:cursor' }] },
    [response, resume],
  );
  assert.equal(r.ok, false);
  assert.ok(r.errors.includes('missing_label:handoff:ready'));
}

{
  const p = parseResume(resume.body);
  assert.equal(p.issueNumber, 2667);
  assert.equal(p.actions[0], 'Implement bridge soak validation only');
}

{
  assert.deepEqual(
    shouldQueueRecovery({
      eligibilityOk: true,
      resumeId: '222',
      consumed: false,
      hasPendingPacket: false,
      claimBlocks: false,
    }),
    { queue: true, reason: 'missed_eligible_handoff' },
  );
  assert.equal(
    shouldQueueRecovery({
      eligibilityOk: false,
      resumeId: '222',
      consumed: false,
      hasPendingPacket: false,
      claimBlocks: false,
    }).queue,
    false,
  );
  assert.equal(
    shouldQueueRecovery({
      eligibilityOk: true,
      resumeId: '222',
      consumed: true,
      hasPendingPacket: false,
      claimBlocks: false,
    }).reason,
    'already_consumed',
  );
  assert.equal(
    shouldQueueRecovery({
      eligibilityOk: true,
      resumeId: '222',
      consumed: false,
      hasPendingPacket: true,
      claimBlocks: false,
    }).reason,
    'packet_pending',
  );
  assert.equal(
    shouldQueueRecovery({
      eligibilityOk: true,
      resumeId: '222',
      consumed: false,
      hasPendingPacket: false,
      claimBlocks: true,
    }).reason,
    'serial_lane_busy',
  );
}

{
  const packet = buildRecoveryPacket({ issueNumber: 2694, resumeCommentId: 5036049606 });
  assert.equal(packet.eventName, 'reconcile-recovery');
  assert.equal(packet.resumeHint, '5036049606');
  assert.equal(packet.recovery, true);
  assert.ok(packet.deliveryId.startsWith('reconcile-5036049606-'));
  assert.ok(packetMentionsResume(packet, '5036049606'));
}

{
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'lgfc-bridge-'));
  const queue = path.join(tmp, 'queue');
  fs.mkdirSync(queue, { recursive: true, mode: 0o700 });
  const packet = buildRecoveryPacket({ issueNumber: 1, resumeCommentId: 99 });
  const write = writeRecoveryPacket(queue, packet);
  assert.equal(write.wrote, true);
  assert.equal(hasPendingOrProcessingPacket(queue, '99'), true);
  const write2 = writeRecoveryPacket(queue, packet);
  assert.equal(write2.wrote, false);
  fs.rmSync(tmp, { recursive: true, force: true });
}

{
  const healthy = evaluateHealth(
    { claimTtlSeconds: 7200, watchdog: { heartbeatStaleSeconds: 90, minDiskMb: 256 } },
    {
      serviceActive: true,
      heartbeat: { updatedAt: new Date().toISOString() },
      queueReadableWritable: true,
      workspacePresent: true,
      ghAuthOk: true,
      cursorAuthOk: true,
      claim: null,
      diskMb: 1024,
    },
  );
  assert.equal(healthy.healthy, true);

  const stale = evaluateHealth(
    { claimTtlSeconds: 7200, watchdog: { heartbeatStaleSeconds: 90, minDiskMb: 256 } },
    {
      serviceActive: true,
      heartbeat: { updatedAt: new Date(Date.now() - 120_000).toISOString() },
      queueReadableWritable: true,
      workspacePresent: true,
      ghAuthOk: true,
      cursorAuthOk: true,
      claim: null,
      diskMb: 1024,
    },
  );
  assert.equal(stale.restartNeeded, true);
  assert.ok(stale.failures.some((f) => f.startsWith('heartbeat_stale')));

  const stopped = evaluateHealth(
    { claimTtlSeconds: 7200, watchdog: { heartbeatStaleSeconds: 90, minDiskMb: 256 } },
    {
      serviceActive: false,
      heartbeat: { updatedAt: new Date().toISOString() },
      queueReadableWritable: true,
      workspacePresent: true,
      ghAuthOk: true,
      cursorAuthOk: true,
      claim: null,
      diskMb: 1024,
    },
  );
  assert.equal(stopped.restartNeeded, true);

  const corruptHb = evaluateHealth(
    { claimTtlSeconds: 7200, watchdog: { heartbeatStaleSeconds: 90, minDiskMb: 256 } },
    {
      serviceActive: true,
      heartbeat: { updatedAt: 'not-a-date' },
      queueReadableWritable: true,
      workspacePresent: true,
      ghAuthOk: true,
      cursorAuthOk: true,
      claim: null,
      diskMb: 1024,
    },
  );
  assert.equal(corruptHb.restartNeeded, true);
  assert.ok(corruptHb.failures.some((f) => f.startsWith('heartbeat_stale')));
}

{
  assert.equal(heartbeatAgeSeconds({ updatedAt: 'not-a-date' }), Number.POSITIVE_INFINITY);
  assert.equal(heartbeatAgeSeconds({ updatedAt: '' }), Number.POSITIVE_INFINITY);
  assert.equal(heartbeatAgeSeconds(null), Number.POSITIVE_INFINITY);
}

{
  const normalized = normalizeState({ restarts: 'bad', lastGithubFaultAt: 123, lastLocalAlertAt: 'nope' });
  assert.deepEqual(normalized.restarts, []);
  assert.equal(normalized.lastGithubFaultAt, null);
  assert.equal(normalized.lastLocalAlertAt, null);
  const ok = normalizeState({
    restarts: ['2026-07-21T12:00:00.000Z', 'bogus'],
    lastGithubFaultAt: '2026-07-21T12:00:00.000Z',
    lastLocalAlertAt: null,
  });
  assert.deepEqual(ok.restarts, ['2026-07-21T12:00:00.000Z']);
  assert.equal(ok.lastGithubFaultAt, '2026-07-21T12:00:00.000Z');
}

{
  const now = Date.now();
  const kept = pruneRestarts(
    [new Date(now - 1000).toISOString(), new Date(now - 10_000_000).toISOString()],
    1800,
  );
  assert.equal(kept.length, 1);
}

{
  const prevHome = process.env.LGFC_CURSOR_BRIDGE_HOME;
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'lgfc-hb-'));
  process.env.LGFC_CURSOR_BRIDGE_HOME = tmp;
  try {
    const config = {
      heartbeatPath: 'heartbeat.json',
      claimPath: 'claim.json',
      claimTtlSeconds: 7200,
    };
    const hb = writeHeartbeat(config, {
      serviceMode: 'watch',
      queueDepth: 0,
      lastDrain: { at: new Date().toISOString(), drained: 0, ok: true },
    });
    assert.equal(hb.pid, process.pid);
    assert.equal(hb.serviceMode, 'watch');
    const read = readHeartbeat(config);
    assert.ok(read);
    assert.ok(heartbeatAgeSeconds(read) < 5);
    const mode = fs.statSync(path.join(tmp, 'heartbeat.json')).mode & 0o777;
    assert.equal(mode, 0o600);
  } finally {
    if (prevHome === undefined) delete process.env.LGFC_CURSOR_BRIDGE_HOME;
    else process.env.LGFC_CURSOR_BRIDGE_HOME = prevHome;
    fs.rmSync(tmp, { recursive: true, force: true });
  }
}

{
  const configPath = path.resolve(
    path.dirname(new URL(import.meta.url).pathname),
    '../../config/cursor-bridge/bridge.json',
  );
  const schemaPath = path.resolve(
    path.dirname(new URL(import.meta.url).pathname),
    '../../config/cursor-bridge/bridge.schema.json',
  );
  const cfg = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));
  assert.equal(cfg.schemaVersion, schema.properties.schemaVersion.const);
  assert.equal(cfg.reconcileIntervalSeconds, 900);
  assert.equal(cfg.reconcileEnabled, true);
  assert.ok(cfg.watchdog);
  assert.equal(cfg.heartbeatPath, 'heartbeat.json');
}

{
  // atomic write leaves no tmp residue
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'lgfc-atomic-'));
  const target = path.join(tmp, 'x.json');
  atomicWriteJson(target, { a: 1 }, 0o600);
  assert.equal(JSON.parse(fs.readFileSync(target, 'utf8')).a, 1);
  assert.equal(fs.readdirSync(tmp).filter((f) => f.includes('.tmp')).length, 0);
  fs.rmSync(tmp, { recursive: true, force: true });
}


{
  const prevHome = process.env.LGFC_CURSOR_BRIDGE_HOME;
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'lgfc-pf-'));
  process.env.LGFC_CURSOR_BRIDGE_HOME = tmp;
  try {
    fs.mkdirSync(path.join(tmp, 'queue'), { recursive: true, mode: 0o700 });
    const config = {
      repository: 'wdhunter645/next-starter-template',
      requiredLabels: ['agent:cursor', 'handoff:ready'],
      queueDir: 'queue',
      consumedDir: 'consumed',
      claimPath: 'claim.json',
      claimTtlSeconds: 7200,
      preflight: { enforce: true, resultPath: 'preflight-result.json', alertStatePath: 'preflight-alert-state.json', retrySeconds: 60 },
    };
    const probes = {
      configuration: () => ({ ok: true }),
      runner: () => ({ ok: true }),
      bridge: () => ({ ok: true }),
      githubAuth: () => ({ ok: true }),
      cursorAuth: () => ({ ok: true }),
      cursorCapacity: () => ({ ok: true, status: 'unknown' }),
      workspace: () => ({ ok: true, path: tmp }),
      queue: () => ({ ok: true }),
      claim: () => ({ ok: true }),
    };
    const ready = runPreflight(config, { probes, notify: false });
    assert.equal(ready.result, 'ready');
    assert.equal(isPreflightAllowingClaim(ready), true);
    assert.ok(TOP_LEVEL_RESULTS.includes('runner_unavailable'));
    const blocked = runPreflight(config, {
      probes: { ...probes, githubAuth: () => ({ ok: false, detail: 'Token: ghp_SECRET' }) },
      notify: false,
    });
    assert.equal(blocked.result, 'github_not_authenticated');
    assert.equal(isPreflightAllowingClaim(blocked), false);
    assert.ok(!JSON.stringify(blocked).includes('ghp_SECRET'));
  } finally {
    if (prevHome === undefined) delete process.env.LGFC_CURSOR_BRIDGE_HOME;
    else process.env.LGFC_CURSOR_BRIDGE_HOME = prevHome;
    fs.rmSync(tmp, { recursive: true, force: true });
  }
}

console.log('bridge self-check: PASS');
