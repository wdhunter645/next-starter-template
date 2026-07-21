#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$ROOT"
TMP=$(mktemp -d /tmp/lgfc-bridge-val-XXXXXX)
cleanup() { rm -rf "$TMP"; }
trap cleanup EXIT
export LGFC_CURSOR_BRIDGE_HOME="$TMP"
export LGFC_CURSOR_BRIDGE_WORKSPACE="$ROOT"
mkdir -p "$TMP/queue" "$TMP/consumed" "$TMP/scripts"
cp -a "$ROOT/scripts/cursor-bridge/." "$TMP/scripts/"
cp "$ROOT/config/cursor-bridge/bridge.json" "$TMP/bridge.json"
cp "$ROOT/config/cursor-bridge/bridge.schema.json" "$TMP/bridge.schema.json"
chmod +x "$TMP/scripts/"*.mjs "$TMP/scripts/"*.sh || true

echo '== self-check =='
node "$ROOT/scripts/cursor-bridge/self-check.mjs"

echo '== heartbeat via once =='
node "$TMP/scripts/bridge.mjs" once
test -f "$TMP/heartbeat.json"
node --input-type=module -e '
import fs from "fs";
const hb = JSON.parse(fs.readFileSync(process.env.LGFC_CURSOR_BRIDGE_HOME + "/heartbeat.json", "utf8"));
if (!hb.pid || hb.serviceMode !== "once") process.exit(1);
console.log("heartbeat ok", hb.updatedAt);
'

echo '== status secret-safe =='
node "$TMP/scripts/bridge.mjs" status > "$TMP/status.json"
node --input-type=module -e '
import fs from "fs";
const raw = fs.readFileSync(process.env.LGFC_CURSOR_BRIDGE_HOME + "/status.json", "utf8");
if (/CURSOR_API_KEY=/.test(raw) || /ghp_[A-Za-z0-9]+/.test(raw)) process.exit(1);
const s = JSON.parse(raw);
if (!s.bridge || !s.queue || !s.claim || !s.githubAuth || !s.cursorCliAuth) process.exit(1);
console.log("status ok");
'

echo '== recovery packet dedupe =='
node --input-type=module -e '
import { buildRecoveryPacket, writeRecoveryPacket, shouldQueueRecovery } from "./scripts/cursor-bridge/lib/reconcile.mjs";
const queue = process.env.LGFC_CURSOR_BRIDGE_HOME + "/queue";
const d = shouldQueueRecovery({ eligibilityOk:true, resumeId:"999", consumed:false, hasPendingPacket:false, claimBlocks:false });
if (!d.queue) process.exit(1);
const blocked = shouldQueueRecovery({ eligibilityOk:true, resumeId:"999", consumed:false, hasPendingPacket:false, claimBlocks:true });
if (blocked.queue || blocked.reason !== "serial_lane_busy") process.exit(1);
const p = buildRecoveryPacket({ issueNumber: 1, resumeCommentId: 999 });
const w = writeRecoveryPacket(queue, p);
const w2 = writeRecoveryPacket(queue, p);
if (!w.wrote || w2.wrote) process.exit(1);
console.log("recovery dedupe ok");
'

echo '== watchdog evaluate =='
node --input-type=module -e '
import fs from "fs";
import { evaluateHealth } from "./scripts/cursor-bridge/watchdog.mjs";
const cfg = JSON.parse(fs.readFileSync(process.env.LGFC_CURSOR_BRIDGE_HOME + "/bridge.json", "utf8"));
const stale = evaluateHealth(cfg, {
  serviceActive: true,
  heartbeat: { updatedAt: new Date(Date.now()-120000).toISOString() },
  queueReadableWritable: true,
  workspacePresent: true,
  ghAuthOk: true,
  cursorAuthOk: true,
  claim: null,
  diskMb: 2048,
});
const healthy = evaluateHealth(cfg, {
  serviceActive: true,
  heartbeat: { updatedAt: new Date().toISOString() },
  queueReadableWritable: true,
  workspacePresent: true,
  ghAuthOk: true,
  cursorAuthOk: true,
  claim: null,
  diskMb: 2048,
});
const corrupt = evaluateHealth(cfg, {
  serviceActive: true,
  heartbeat: { updatedAt: "not-a-date" },
  queueReadableWritable: true,
  workspacePresent: true,
  ghAuthOk: true,
  cursorAuthOk: true,
  claim: null,
  diskMb: 2048,
});
if (!stale.restartNeeded || !healthy.healthy || !corrupt.restartNeeded) process.exit(1);
console.log("watchdog evaluate ok");
'

echo '== reconcile fail-closed =='
node --input-type=module -e '
import { runReconcileSweep } from "./scripts/cursor-bridge/lib/reconcile.mjs";
import { loadConfig, ensureDirs } from "./scripts/cursor-bridge/lib/paths.mjs";
const config = loadConfig();
const dirs = ensureDirs(config);
const result = await runReconcileSweep(config, dirs, {
  ghJson: () => { throw new Error("simulated_api_failure"); },
});
if (result.ok || !result.failedClosed) process.exit(1);
console.log("reconcile fail-closed ok");
'

echo '== consumed/ineligible ignored =='
node --input-type=module -e '
import { shouldQueueRecovery } from "./scripts/cursor-bridge/lib/reconcile.mjs";
if (shouldQueueRecovery({ eligibilityOk:false, resumeId:"1", consumed:false, hasPendingPacket:false, claimBlocks:false }).queue) process.exit(1);
if (shouldQueueRecovery({ eligibilityOk:true, resumeId:"1", consumed:true, hasPendingPacket:false, claimBlocks:false }).queue) process.exit(1);
console.log("ignore rules ok");
'

echo "ALL ISOLATED HOST CHECKS PASS"
