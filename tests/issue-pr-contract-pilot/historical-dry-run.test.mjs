import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

import { runHistoricalDryRun } from '../../scripts/ci/issue_pr_contract_dry_run.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const fixturePath = path.join(__dirname, 'dry-run-sample/historical-issues.json');
const issues = JSON.parse(fs.readFileSync(fixturePath, 'utf8'));

describe('#2622 Phase 1: historical dry run against real Issue bodies', () => {
  it('evaluates every fixture Issue read-only and reports contract_missing for all of them', () => {
    const { summary, results } = runHistoricalDryRun(issues);

    // Regression guard: as of this pilot, no real (non-fixture) Issue in the
    // repository has adopted the lgfc-issue-pr-contract:v1 marker yet. If this
    // ever fails, the fixture set is stale and #2622's evidence needs a refresh.
    expect(summary.issuesWithAnyMarker).toBe(0);
    expect(summary.issuesPassingValidation).toBe(0);
    expect(summary.errorCodeFrequency).toEqual({ contract_missing: summary.issuesEvaluated });
    expect(results).toHaveLength(issues.length);
  });

  it('does not misidentify an unrelated lgfc-* marker as the issue-pr-contract block (#2615 hard case)', () => {
    const { results } = runHistoricalDryRun(issues);
    const hardCase = results.find((r) => r.issueNumber === 2615);
    expect(hardCase).toBeDefined();
    expect(hardCase.versionedMarkersFound).toBe(0);
    expect(hardCase.errorCodes).toEqual(['contract_missing']);
  });

  it('covers a representative delivery-model spread (Model A, B-child, B-promotion, and no-model-stated legacy issues)', () => {
    const models = new Set(issues.map((i) => i.deliveryModelStated));
    expect([...models].some((m) => m === 'Model A')).toBe(true);
    expect([...models].some((m) => m === 'Model B promotion')).toBe(true);
    expect([...models].some((m) => m === 'Model B child')).toBe(true);
    expect([...models].some((m) => m === null)).toBe(true);
  });
});
