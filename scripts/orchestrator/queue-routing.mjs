#!/usr/bin/env node
/**
 * Queue-aware dispatch and collaboration routing (#2726).
 *
 * Pure decision API over issue label/state snapshots. Does not mutate GitHub.
 * Authority: .github/queue-label-registry.json + #2724 routing matrix.
 */

const OPS_NUMBERED = new Set([
  'ops:priority:1',
  'ops:priority:2',
  'ops:priority:3',
  'ops:priority:4'
]);
const OPS_INTERVAL = new Set(['ops:monitoring', 'ops:hold']);
const PMO_PRIORITIES = new Set([
  'pmo:priority:1',
  'pmo:priority:2',
  'pmo:priority:3',
  'pmo:priority:4'
]);
const ENG_PRIORITIES = new Set([
  'eng:priority:1',
  'eng:priority:2',
  'eng:priority:3',
  'eng:priority:4',
  'eng:priority:idea'
]);
const TEAM_LABELS = new Set(['team:operations', 'team:pmo', 'team:engineering']);

export function normalizeLabels(input) {
  return (input || [])
    .map((label) => (typeof label === 'string' ? label : label?.name))
    .filter(Boolean);
}

function labelsOf(issue) {
  return normalizeLabels(issue?.labels);
}

function teamLabels(labels) {
  return labels.filter((label) => TEAM_LABELS.has(label) || label.startsWith('team:'));
}

function firstMatch(labels, set) {
  return labels.find((label) => set.has(label)) || null;
}

function parentRef(body) {
  const text = String(body || '');
  const match = text.match(/^\s*Parent(?:\s+(?:program|project|issue))?\s*:\s*#?(\d+)\b/im);
  return match ? Number(match[1]) : null;
}

function failClosed(partial = {}) {
  return {
    eligible: false,
    failClosed: true,
    action: partial.action || 'fail_closed',
    lane: partial.lane || null,
    precedenceRank: null,
    blocksNormalWork: false,
    authorizesActiveImplementation: false,
    reasons: partial.reasons || ['fail_closed'],
    ...partial
  };
}

/**
 * Classify one issue for queue-aware dispatch.
 * @param {object} issue
 * @param {object} [context]
 */
export function classifyQueueCandidate(issue, context = {}) {
  if (context.readFailure) {
    return failClosed({
      action: 'fail_closed',
      reasons: [`read_failure:${context.readFailure}`]
    });
  }
  if (context.staleSnapshot || context.headShaChanged) {
    return failClosed({
      action: 'reevaluate',
      reasons: ['stale_snapshot_or_changed_head']
    });
  }
  if (context.claimActive) {
    return failClosed({
      action: 'no_duplicate_launch',
      reasons: ['active_claim']
    });
  }
  if (context.handoffConsumed) {
    return failClosed({
      action: 'no_duplicate_launch',
      reasons: ['handoff_consumed']
    });
  }

  if (!issue || issue.state === 'closed') {
    return failClosed({ reasons: ['issue_closed_or_missing'] });
  }

  const labels = labelsOf(issue);
  const teams = teamLabels(labels);
  if (teams.length > 1) {
    return failClosed({ reasons: [`multiple_team_owners:${teams.join(',')}`] });
  }

  const opsStates = labels.filter(
    (label) => OPS_NUMBERED.has(label) || OPS_INTERVAL.has(label) || label.startsWith('ops:')
  );
  const pmoPriorities = labels.filter((label) => label.startsWith('pmo:priority:'));
  const engPriorities = labels.filter((label) => label.startsWith('eng:priority:'));

  // Cross-namespace priority / ownership conflicts fail closed.
  const namespacesPresent = [
    opsStates.length > 0,
    pmoPriorities.length > 0,
    engPriorities.length > 0
  ].filter(Boolean).length;
  if (namespacesPresent > 1) {
    return failClosed({ reasons: ['cross_namespace_priority'] });
  }

  const isTask = labels.includes('pmo:task');
  if (isTask && (teams.length > 0 || pmoPriorities.length || engPriorities.length || opsStates.length)) {
    return failClosed({
      lane: 'pmo_active',
      reasons: ['pmo_child_carries_team_or_priority']
    });
  }

  // Operations lane
  if (teams[0] === 'team:operations' || (opsStates.length && teams.length === 0)) {
    if (teams[0] && teams[0] !== 'team:operations') {
      return failClosed({ reasons: ['ops_state_without_operations_owner'] });
    }
    if (teams[0] !== 'team:operations') {
      return failClosed({ reasons: ['ops_requires_team_operations'] });
    }
    const numbered = firstMatch(labels, OPS_NUMBERED);
    const interval = firstMatch(labels, OPS_INTERVAL);
    if (numbered && interval) {
      return failClosed({ reasons: ['ops_numbered_and_interval_conflict'] });
    }
    if (numbered) {
      return {
        eligible: true,
        failClosed: false,
        lane: 'operations',
        action: 'dispatch',
        precedenceRank: 1,
        blocksNormalWork: true,
        authorizesActiveImplementation: false,
        priorityLabel: numbered,
        reasons: ['numbered_operations_interrupt']
      };
    }
    if (interval) {
      return {
        eligible: false,
        failClosed: false,
        lane: 'operations',
        action: 'interval_update',
        precedenceRank: 4,
        blocksNormalWork: false,
        authorizesActiveImplementation: false,
        priorityLabel: interval,
        reasons: ['operations_interval_non_blocking']
      };
    }
    return failClosed({ lane: 'operations', reasons: ['operations_missing_state'] });
  }

  // PMO Active child / parent
  if (labels.includes('pmo:active') || isTask) {
    if (isTask) {
      const parentNumber = parentRef(issue.body);
      const parent = context.parent || null;
      if (!parentNumber || !parent || Number(parent.number) !== parentNumber) {
        return failClosed({
          lane: 'pmo_active',
          reasons: ['missing_or_mismatched_parent']
        });
      }
      const parentLabels = labelsOf(parent);
      if (
        !parentLabels.includes('team:pmo') ||
        !parentLabels.includes('pmo:active') ||
        !firstMatch(parentLabels, PMO_PRIORITIES)
      ) {
        return failClosed({
          lane: 'pmo_active',
          reasons: ['parent_not_valid_active_pmo']
        });
      }
      if (!context.implementationAuthorized || !context.childSequenceReady) {
        return failClosed({
          lane: 'pmo_active',
          reasons: ['implementation_or_sequence_not_ready']
        });
      }
      return {
        eligible: true,
        failClosed: false,
        lane: 'pmo_active',
        action: 'dispatch',
        precedenceRank: 2,
        blocksNormalWork: false,
        authorizesActiveImplementation: true,
        priorityLabel: firstMatch(parentLabels, PMO_PRIORITIES),
        reasons: ['pmo_active_executable_child']
      };
    }

    // Active portfolio parent itself is selection context, not a leaf dispatch by default.
    if (teams[0] === 'team:pmo' && firstMatch(labels, PMO_PRIORITIES)) {
      return {
        eligible: false,
        failClosed: false,
        lane: 'pmo_active',
        action: 'select_parent',
        precedenceRank: 2,
        blocksNormalWork: false,
        authorizesActiveImplementation: false,
        priorityLabel: firstMatch(labels, PMO_PRIORITIES),
        reasons: ['pmo_active_parent_selection_only']
      };
    }
    return failClosed({ lane: 'pmo_active', reasons: ['active_shape_invalid'] });
  }

  // Engineering Pipeline preparation
  if (labels.includes('pmo:pipeline') || teams[0] === 'team:engineering') {
    if (teams[0] !== 'team:engineering') {
      return failClosed({
        lane: 'engineering_pipeline',
        reasons: ['pipeline_requires_team_engineering']
      });
    }
    const engPriority = firstMatch(labels, ENG_PRIORITIES);
    if (!engPriority) {
      return failClosed({
        lane: 'engineering_pipeline',
        reasons: ['pipeline_missing_engineering_priority']
      });
    }
    if (pmoPriorities.length) {
      return failClosed({
        lane: 'engineering_pipeline',
        reasons: ['pipeline_cross_namespace_pmo_priority']
      });
    }
    const ready = labels.includes('pmo:stage:ready-for-launch');
    if (ready && context.productionGo) {
      // Go still does not auto-authorize Active implementation from Pipeline alone.
      return {
        eligible: true,
        failClosed: false,
        lane: 'engineering_pipeline',
        action: 'preparation',
        precedenceRank: 3,
        blocksNormalWork: false,
        authorizesActiveImplementation: false,
        priorityLabel: engPriority,
        reasons: ['pipeline_ready_still_preparation_until_graduation']
      };
    }
    return {
      eligible: true,
      failClosed: false,
      lane: 'engineering_pipeline',
      action: 'preparation',
      precedenceRank: 3,
      blocksNormalWork: false,
      authorizesActiveImplementation: false,
      priorityLabel: engPriority,
      reasons: ['engineering_preparation_only']
    };
  }

  return failClosed({ reasons: ['unclassified_or_ambiguous'] });
}

/**
 * Collaboration must never transfer queue ownership or authority.
 */
export function evaluateCollaborationBoundary(sourceIssue, collaboration = {}) {
  const labels = labelsOf(sourceIssue);
  const owner = teamLabels(labels)[0] || collaboration.sourceOwner || null;
  const priority =
    firstMatch(labels, OPS_NUMBERED) ||
    firstMatch(labels, PMO_PRIORITIES) ||
    firstMatch(labels, ENG_PRIORITIES) ||
    collaboration.sourcePriority ||
    null;

  return {
    ownershipTransferred: false,
    priorityTransferred: false,
    executionAuthorityTransferred: false,
    approvalAuthorityTransferred: false,
    productionAuthorityTransferred: false,
    retainedOwner: owner,
    retainedPriority: priority,
    requestedAgent: collaboration.requestedAgent || null,
    reasons: ['collaboration_adds_participant_only']
  };
}

function prioritySortKey(classification) {
  const label = classification.priorityLabel || '';
  const numbered = label.match(/:(\d+)$/);
  if (numbered) return Number(numbered[1]);
  if (label.endsWith(':idea')) return 50;
  if (label === 'ops:monitoring') return 90;
  if (label === 'ops:hold') return 91;
  return 99;
}

/**
 * Select the next dispatch candidate using required routing order.
 */
export function selectNextDispatch(candidates = [], sharedContext = {}) {
  const classified = candidates.map((candidate) => {
    const issue = candidate.issue || candidate;
    const context = { ...sharedContext, ...(candidate.context || {}) };
    const classification = classifyQueueCandidate(issue, context);
    return {
      issueNumber: Number(issue.number),
      issue,
      classification
    };
  });

  const intervalOnly = classified
    .filter((entry) => entry.classification.action === 'interval_update')
    .map((entry) => entry.issueNumber);

  const dispatchable = classified
    .filter((entry) => entry.classification.eligible)
    .sort((a, b) => {
      const rankA = a.classification.precedenceRank ?? 99;
      const rankB = b.classification.precedenceRank ?? 99;
      if (rankA !== rankB) return rankA - rankB;
      const prio = prioritySortKey(a.classification) - prioritySortKey(b.classification);
      if (prio !== 0) return prio;
      return a.issueNumber - b.issueNumber;
    });

  const selected = dispatchable[0] || null;
  return {
    selectedIssueNumber: selected ? selected.issueNumber : null,
    selected,
    intervalOnly,
    classified
  };
}

export {
  OPS_NUMBERED,
  OPS_INTERVAL,
  PMO_PRIORITIES,
  ENG_PRIORITIES,
  TEAM_LABELS,
  parentRef
};
