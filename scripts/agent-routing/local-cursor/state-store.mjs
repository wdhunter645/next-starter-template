import fs from 'node:fs';
import path from 'node:path';

export function loadPollerState(statePath) {
  if (!fs.existsSync(statePath)) return { enabled: true, consumedEventIds: [], activeClaims: [], heartbeatAt: null };
  const state = JSON.parse(fs.readFileSync(statePath, 'utf8'));
  return {
    enabled: state.enabled !== false,
    consumedEventIds: Array.isArray(state.consumedEventIds) ? state.consumedEventIds : [],
    activeClaims: Array.isArray(state.activeClaims) ? state.activeClaims : [],
    heartbeatAt: state.heartbeatAt || null,
    ...state,
  };
}

export function savePollerState(statePath, state) {
  fs.mkdirSync(path.dirname(statePath), { recursive: true, mode: 0o700 });
  const temporary = `${statePath}.tmp`;
  fs.writeFileSync(temporary, `${JSON.stringify(state, null, 2)}\n`, { mode: 0o600 });
  fs.renameSync(temporary, statePath);
  fs.chmodSync(statePath, 0o600);
}
