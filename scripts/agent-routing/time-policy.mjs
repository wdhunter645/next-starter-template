import { minutesBetween } from './lib/stable.mjs';

const MAPPINGS = [
  ['readyAt', 'readyWithoutAck', 'ready_without_ack'],
  ['heartbeatAt', 'inProgressHeartbeat', 'heartbeat_stale'],
  ['greenAt', 'greenWithoutIntegration', 'green_without_integration'],
  ['integratedAt', 'integrationWithoutSuccessor', 'integration_without_successor'],
  ['handoffAt', 'unresolvedHandoff', 'handoff_stale'],
  ['controllerHeartbeatAt', 'controllerHeartbeat', 'controller_heartbeat_stale'],
  ['workflowFailureAt', 'workflowFailureWithoutDisposition', 'workflow_failure_undispositioned'],
];

export function evaluateThresholds({ now, timestamps = {}, thresholdsMinutes = {} }) {
  return MAPPINGS.flatMap(([timestampKey, thresholdKey, code]) => {
    if (!timestamps[timestampKey] || !Number.isFinite(thresholdsMinutes[thresholdKey])) return [];
    const ageMinutes = minutesBetween(timestamps[timestampKey], now);
    return ageMinutes >= thresholdsMinutes[thresholdKey]
      ? [{ code, ageMinutes, thresholdMinutes: thresholdsMinutes[thresholdKey] }]
      : [];
  });
}
