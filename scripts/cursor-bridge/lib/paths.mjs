import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export function bridgeHome() {
  return process.env.LGFC_CURSOR_BRIDGE_HOME || path.join(os.homedir(), 'lgfc-cursor-bridge');
}

export function loadConfig() {
  const candidates = [
    path.join(bridgeHome(), 'bridge.json'),
    path.resolve(__dirname, '../../../config/cursor-bridge/bridge.json'),
  ];
  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      return JSON.parse(fs.readFileSync(candidate, 'utf8'));
    }
  }
  throw new Error('bridge.json not found');
}

export function ensureDirs(config) {
  const home = bridgeHome();
  const queue = path.join(home, config.queueDir || 'queue');
  const consumed = path.join(home, config.consumedDir || 'consumed');
  fs.mkdirSync(queue, { recursive: true, mode: 0o700 });
  fs.mkdirSync(consumed, { recursive: true, mode: 0o700 });
  fs.chmodSync(home, 0o700);
  return { home, queue, consumed };
}

export function maintenancePaths(config = {}) {
  const home = bridgeHome();
  return {
    identity: path.join(home, config.maintenance?.identityPath || 'package-identity.json'),
    result: path.join(home, config.maintenance?.resultPath || 'maintenance-result.json'),
    alertState: path.join(home, config.maintenance?.alertStatePath || 'maintenance-alert-state.json'),
  };
}
