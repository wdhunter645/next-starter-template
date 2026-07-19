import { stableHash } from './lib/stable.mjs';
import {
  FOUR_LANE_EVENT_MARKERS,
  isFourLaneEnabled,
  resolveOperatingLaneState,
} from './four-lane-runtime.mjs';

const LEGACY_EVENT_ORDER = [
  'CURSOR ASSIGNMENT',
  'CURSOR ACK',
  'CURSOR STATUS',
  'CURSOR COMPLETE',
  'CHATGPT HANDOFF',
  'CHATGPT RESPONSE',
  'CHATGPT CLOSEOUT',
];

function latestEvent(events = []) {
  return [...events].sort((a, b) => {
    const time = String(a.createdAt || '').localeCompare(String(b.createdAt || ''));
    if (time !== 0) return time;
    return Number(a.id || 0) - Number(b.id || 0);
  }).at(-1) || null;
}

function knownEventMarkers(policy = {}) {
  return isFourLaneEnabled(policy) ? FOUR_LANE_EVENT_MARKERS : LEGACY_EVENT_ORDER;
}

function resolveDependencyState({
  contradictory,
  eventKnown,
  task,
  predecessorStates,
  dependencyClass,
  policy,
  operatingLanes,
}) {
  if (contradictory || !eventKnown) return 'ambiguous';
  if (task.state === 'complete') return 'complete';

  if (isFourLaneEnabled(policy)) {
    if (operatingLanes?.lanes?.['administration-communications']?.blocksDelivery) {
      return 'blocked';
    }
    if (
      operatingLanes?.operationalHold?.active
      && ['assessment', 'targeted-project'].includes(operatingLanes.operationalHold.scope || 'assessment')
    ) {
      return 'blocked';
    }
    if (dependencyClass === 'administrative-only') return 'ready';
    if (dependencyClass === 'protected-stop' || dependencyClass === 'explicit-hold') return 'blocked';
    if (dependencyClass === 'none') return 'ready';
  }

  const predecessorsComplete = predecessorStates.every((state) => state === 'complete' || state === 'integrated');
  return predecessorsComplete ? 'ready' : 'blocked';
}

export function resolveRepositoryState(input = {}, policy = {}) {
  const labels = [...new Set(input.labels || [])].sort();
  const cursor = labels.includes('agent:cursor');
  const chatgpt = labels.includes('agent:ChatGPT');
  const ready = labels.includes('handoff:ready');
  const inProgress = labels.includes('handoff:in-progress');
  const contradictory = (cursor && chatgpt) || (ready && inProgress);
  const event = latestEvent(input.events || []);
  const markers = knownEventMarkers(policy);
  const eventKnown = !event || markers.includes(event.marker);
  const project = input.project || {};
  const task = input.task || {};
  const predecessorStates = input.predecessorStates || [];
  const dependencyClass = input.dependencyClass || 'none';

  const operatingLanes = isFourLaneEnabled(policy)
    ? resolveOperatingLaneState(input)
    : null;

  const dependencyState = resolveDependencyState({
    contradictory,
    eventKnown,
    task,
    predecessorStates,
    dependencyClass,
    policy,
    operatingLanes,
  });
  const routingOwner = contradictory ? 'ambiguous' : cursor ? 'cursor' : chatgpt ? 'chatgpt' : 'none';
  const identity = {
    projectIssue: project.issueNumber ?? null,
    taskIssue: task.issueNumber ?? null,
    taskId: task.id ?? null,
    projectBranch: project.projectBranch ?? null,
  };
  const snapshotData = {
    identity,
    labels,
    routingOwner,
    latestEvent: event,
    dependencyState,
    dependencyClass,
    pullRequests: input.pullRequests || [],
    checks: input.checks || [],
    reviews: input.reviews || [],
    activeClaims: input.claims || [],
    consumedEventIds: input.consumedEventIds || [],
    fileScope: input.fileScope || [],
    wakeEligible: task.wakeEligible === true,
    projectLifecycle: project.lifecycle || 'unknown',
    fourLaneEnabled: isFourLaneEnabled(policy),
    operatingLanes,
    incidentAutoRemediation: input.incidentAutoRemediation || null,
  };
  return {
    ...snapshotData,
    ambiguous: contradictory || !eventKnown,
    ambiguityReasons: [
      contradictory ? 'contradictory_labels' : null,
      !eventKnown ? 'unknown_event_marker' : null,
    ].filter(Boolean),
    revision: stableHash(snapshotData, 'state'),
  };
}
