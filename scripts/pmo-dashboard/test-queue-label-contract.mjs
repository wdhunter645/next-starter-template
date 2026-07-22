#!/usr/bin/env node
import {
  analyzeQueueLabels,
  isPeerEngineeringPreparation,
  isStandaloneOperationsIssue
} from './queue-label-contract.mjs';

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function analyze({ labels, lifecycle, role = 'portfolio' }) {
  return analyzeQueueLabels({ labels, lifecycle, role });
}

const active = analyze({
  labels: ['pmo', 'pmo:active', 'team:pmo', 'pmo:priority:1'],
  lifecycle: 'active'
});
assert(active.errors.length === 0, 'active parent should be valid');
assert(active.teamLabel === 'team:pmo', 'active team label');
assert(active.priorityLabel === 'pmo:priority:1', 'active priority label');

const pipeline = analyze({
  labels: [
    'pmo',
    'pmo:pipeline',
    'team:engineering',
    'eng:priority:idea',
    'pmo:stage:intake'
  ],
  lifecycle: 'pipeline'
});
assert(pipeline.errors.length === 0, 'pipeline parent should be valid');
assert(pipeline.teamLabel === 'team:engineering', 'pipeline team label');
assert(pipeline.priorityDisplay === 'Idea', 'pipeline idea display');

for (const invalid of [
  analyze({ labels: ['pmo', 'pmo:active', 'pmo:priority:1'], lifecycle: 'active' }),
  analyze({
    labels: ['pmo', 'pmo:active', 'team:pmo', 'eng:priority:1'],
    lifecycle: 'active'
  }),
  analyze({
    labels: ['pmo', 'pmo:pipeline', 'team:engineering', 'pmo:priority:1'],
    lifecycle: 'pipeline'
  }),
  analyze({
    labels: [
      'pmo',
      'pmo:active',
      'team:pmo',
      'team:engineering',
      'pmo:priority:1'
    ],
    lifecycle: 'active'
  }),
  analyze({
    labels: ['pmo', 'pmo:task', 'pmo:active', 'team:pmo'],
    lifecycle: 'active',
    role: 'task'
  }),
  analyze({
    labels: ['pmo', 'pmo:task', 'pmo:active', 'pmo:priority:1'],
    lifecycle: 'active',
    role: 'task'
  })
]) {
  assert(invalid.errors.length > 0, 'invalid queue state must fail closed');
}

const task = analyze({
  labels: ['pmo', 'pmo:task', 'pmo:active'],
  lifecycle: 'active',
  role: 'task'
});
assert(task.errors.length === 0, 'task without team priority should be valid');
assert(task.teamLabel === null, 'task team must be null');
assert(task.priorityLabel === null, 'task priority must be null');

assert(
  isStandaloneOperationsIssue({
    labels: [{ name: 'team:operations' }],
    body: 'Related project: #1'
  }),
  'operations issue detection'
);
assert(
  !isStandaloneOperationsIssue({
    labels: [
      { name: 'team:operations' },
      { name: 'pmo:active' },
      { name: 'pmo:priority:1' }
    ],
    body: 'Related project: #1'
  }),
  'operations issue with PMO lifecycle state must remain visible for fail-closed classification'
);
assert(
  !isStandaloneOperationsIssue({
    labels: [{ name: 'team:operations' }, { name: 'team:pmo' }],
    body: 'Related project: #1'
  }),
  'operations issue with conflicting team ownership must remain visible for validation'
);
assert(
  isPeerEngineeringPreparation({
    labels: [{ name: 'team:engineering' }],
    body: 'Related Pipeline Project: #42\nOwner / Agent: ChatGPT\n'
  }),
  'peer engineering preparation detection'
);
assert(
  !isPeerEngineeringPreparation({
    labels: [{ name: 'team:engineering' }, { name: 'pmo:task' }],
    body: 'Parent Project: #42\n'
  }),
  'project child is not peer engineering preparation'
);
assert(
  !isPeerEngineeringPreparation({
    labels: [
      { name: 'team:engineering' },
      { name: 'pmo:active' },
      { name: 'pmo:priority:1' }
    ],
    body: 'Related Pipeline Project: #42\n'
  }),
  'engineering preparation with PMO lifecycle state must remain visible for fail-closed classification'
);
assert(
  !isPeerEngineeringPreparation({
    labels: [{ name: 'team:engineering' }, { name: 'eng:priority:idea' }],
    body: 'Related Pipeline Project: #42\n'
  }),
  'engineering preparation with queue priority must remain visible for validation'
);

console.log('Queue label contract tests passed');
