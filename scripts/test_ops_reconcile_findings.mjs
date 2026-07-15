import assert from 'node:assert/strict';

import {
  DEFAULT_FINDINGS_TITLE,
  OPS_RECONCILE_FINDINGS_MARKER,
  buildReconcileFindingsBody,
  reportReconcileFindings,
} from './ci/ops_reconcile_findings.mjs';

const body = buildReconcileFindingsBody({
  retiredCount: '3',
  repairedMatchups: '1',
  staleKeySample: 'a.jpg,b.jpg',
  runUrl: 'https://example.test/run/1',
});

assert.ok(body.includes(OPS_RECONCILE_FINDINGS_MARKER));
assert.ok(body.includes('Soft-retired photo rows: 3'));
assert.ok(body.includes('Active matchups repaired'));
assert.ok(body.includes('`a.jpg`'));
assert.ok(body.includes('No hard deletes'));

const skipped = await reportReconcileFindings({
  token: 'unused',
  repository: 'owner/repo',
  hasFindings: false,
  retiredCount: '0',
  repairedMatchups: '0',
});
assert.equal(skipped.action, 'skipped');
assert.equal(skipped.reason, 'no_actionable_findings');

assert.equal(DEFAULT_FINDINGS_TITLE.includes('B2 D1'), true);

console.log('ops_reconcile_findings tests PASSED');
