#!/usr/bin/env node

// #2622 Phase 1: historical dry-run harness. Runs the real, unmodified
// #2619/#2620 validator (findVersionedContractMarkers +
// evaluateIssuePrContractRequest) read-only against a fixture set of real
// historical Issue bodies (tests/issue-pr-contract-pilot/dry-run-sample/
// historical-issues.json). Never mutates anything and never calls the
// GitHub API — the fixture already captures the live body text at
// collection time.

import fs from 'node:fs';
import { evaluateIssuePrContractRequest, findVersionedContractMarkers } from './issue_pr_contract_validate.mjs';

/**
 * @param {Array<{issueNumber:number, title:string, deliveryModelStated:string|null, url:string, body:string}>} issues
 */
export function runHistoricalDryRun(issues = []) {
  const results = issues.map((issue) => {
    const markers = findVersionedContractMarkers(issue.body || '');
    const evaluation = evaluateIssuePrContractRequest({
      issue: { number: issue.issueNumber, body: issue.body, state: 'open' },
      comments: [],
      authorizedActors: [],
      liveState: {},
    });
    return {
      issueNumber: issue.issueNumber,
      title: issue.title,
      deliveryModelStated: issue.deliveryModelStated,
      url: issue.url,
      versionedMarkersFound: markers.length,
      ok: evaluation.ok,
      errorCodes: evaluation.errors.map((error) => error.code),
    };
  });

  const summary = {
    issuesEvaluated: results.length,
    issuesWithAnyMarker: results.filter((r) => r.versionedMarkersFound > 0).length,
    issuesPassingValidation: results.filter((r) => r.ok).length,
    errorCodeFrequency: results.reduce((freq, r) => {
      for (const code of r.errorCodes) freq[code] = (freq[code] || 0) + 1;
      return freq;
    }, {}),
  };

  return { summary, results };
}

function readJsonFile(filePath, fallback) {
  if (!filePath || !fs.existsSync(filePath)) return fallback;
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

/**
 * CLI entrypoint. Reads the fixture file, runs the dry run, writes JSON.
 */
export function runCli(env = process.env) {
  const issues = readJsonFile(
    env.ISSUE_PR_CONTRACT_DRY_RUN_FIXTURE_JSON || 'tests/issue-pr-contract-pilot/dry-run-sample/historical-issues.json',
    [],
  );
  const result = runHistoricalDryRun(issues);

  const outputPath = env.ISSUE_PR_CONTRACT_DRY_RUN_OUTPUT_JSON;
  if (outputPath) {
    fs.writeFileSync(outputPath, `${JSON.stringify(result, null, 2)}\n`);
  }
  console.log(JSON.stringify(result, null, 2));
  return 0;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  process.exitCode = runCli();
}
