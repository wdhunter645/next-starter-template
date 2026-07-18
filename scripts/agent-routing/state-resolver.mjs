import { stableHash } from './lib/stable.mjs';

const EVENT_ORDER = ['CURSOR ASSIGNMENT', 'CURSOR ACK', 'CURSOR STATUS', 'CURSOR COMPLETE', 'CHATGPT HANDOFF', 'CHATGPT RESPONSE', 'CHATGPT CLOSEOUT'];

function latestEvent(events = []) {
  return [...events].sort((a, b) => {
    const time = String(a.createdAt || '').localeCompare(String(b.createdAt || ''));
    if (time !== 0) return time;
    return Number(a.id || 0) - Number(b.id || 0);
  }).at(-1) || null;
}

export function resolveRepositoryState(input = {}) {
  const labels = [...new Set(input.labels || [])].sort();
  const cursor = labels.includes('agent:cursor');
  const chatgpt = labels.includes('agent:ChatGPT');
  const ready = labels.includes('handoff:ready');
  const inProgress = labels.includes('handoff:in-progress');
  const contradictory = (cursor && chatgpt) || (ready && inProgress);
  const event = latestEvent(input.events || []);
  const eventKnown = !event || EVENT_ORDER.includes(event.marker);
  const project = input.project || {};
  const task = input.task || {};
  const predecessorStates = input.predecessorStates || [];
  const predecessorsComplete = predecessorStates.every((state) => state === 'complete' || state === 'integrated');
  const dependencyState = contradictory || !eventKnown
    ? 'ambiguous'
    : task.state === 'complete'
      ? 'complete'
      : predecessorsComplete
        ? 'ready'
        : 'blocked';
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
    pullRequests: input.pullRequests || [],
    checks: input.checks || [],
    reviews: input.reviews || [],
    activeClaims: input.claims || [],
    consumedEventIds: input.consumedEventIds || [],
    fileScope: input.fileScope || [],
    wakeEligible: task.wakeEligible === true,
    projectLifecycle: project.lifecycle || 'unknown',
  };
  return {
    ...snapshotData,
    ambiguous: contradictory || !eventKnown,
    ambiguityReasons: [contradictory ? 'contradictory_labels' : null, !eventKnown ? 'unknown_event_marker' : null].filter(Boolean),
    revision: stableHash(snapshotData, 'state'),
  };
}
