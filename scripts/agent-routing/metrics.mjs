import { minutesBetween } from './lib/stable.mjs';

export function calculateLatencyMetrics(input = {}) {
  return {
    readyToAckMinutes: minutesBetween(input.readyAt, input.ackAt),
    greenToIntegrationMinutes: minutesBetween(input.greenAt, input.integratedAt),
    integrationToSuccessorMinutes: minutesBetween(input.integratedAt, input.successorAt),
    handoffToResponseMinutes: minutesBetween(input.handoffAt, input.responseAt),
    duplicatesSuppressed: Number(input.duplicatesSuppressed || 0),
    idleReason: input.idleReason || null,
  };
}
