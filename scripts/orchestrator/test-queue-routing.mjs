#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  classifyQueueCandidate,
  evaluateCollaborationBoundary,
  selectNextDispatch
} from './queue-routing.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const matrixPath = path.join(__dirname, 'fixtures/queue-routing-matrix.json');
const matrix = JSON.parse(fs.readFileSync(matrixPath, 'utf8'));

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function runCase(testCase) {
  if (testCase.collaboration) {
    const result = evaluateCollaborationBoundary(testCase.issue, testCase.collaboration);
    for (const [key, expected] of Object.entries(testCase.expect || {})) {
      assert(
        result[key] === expected,
        `${testCase.id}: expected ${key}=${expected}, got ${result[key]}`
      );
    }
    return;
  }

  const classification = classifyQueueCandidate(testCase.issue, testCase.context || {});
  for (const [key, expected] of Object.entries(testCase.expect || {})) {
    assert(
      classification[key] === expected,
      `${testCase.id}: expected ${key}=${JSON.stringify(expected)}, got ${JSON.stringify(classification[key])} (${classification.reasons?.join(',') || 'no-reasons'})`
    );
  }
}

function runSelection(testCase) {
  const result = selectNextDispatch(testCase.candidates);
  assert(
    result.selectedIssueNumber === testCase.expectSelected,
    `${testCase.id}: expected selected ${testCase.expectSelected}, got ${result.selectedIssueNumber}`
  );
  if (testCase.expectIntervalOnly) {
    for (const number of testCase.expectIntervalOnly) {
      assert(
        result.intervalOnly.includes(number),
        `${testCase.id}: expected interval-only #${number}`
      );
    }
  }
}

for (const testCase of matrix.cases) {
  runCase(testCase);
}
for (const testCase of matrix.selectionCases || []) {
  runSelection(testCase);
}

console.log(
  `Queue routing tests passed (${matrix.cases.length} cases, ${(matrix.selectionCases || []).length} selection cases)`
);
