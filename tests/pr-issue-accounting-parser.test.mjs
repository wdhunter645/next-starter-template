import { createRequire } from 'node:module';
import { describe, expect, it } from 'vitest';

const require = createRequire(import.meta.url);
const {
  issueRefsFromBody,
  issueRefsFromBranch,
  issueRefsFromTrustedSources,
  normalizeIssueLine,
} = require('../scripts/ci/pr-issue-accounting-parser.js');

const owner = 'wdhunter645';
const repo = 'next-starter-template';

function bodyRefs(body) {
  return issueRefsFromBody(body, owner, repo);
}

describe('PR issue-accounting parser', () => {
  it.each([
    '- **Issue:** #1053',
    '- **Issue**: #1053',
    'Issue: #1053',
    'Issue #1053',
    'Related Issue: #1053',
    'Related Issue https://github.com/wdhunter645/next-starter-template/issues/1053',
  ])('accepts semantic source issue format: %s', (line) => {
    const result = bodyRefs(line);
    expect(result.invalidRefs).toEqual([]);
    expect(result.refs).toEqual([{ issueNumber: 1053, source: 'primary-body-line' }]);
  });

  it('normalizes equivalent source issue lines to one canonical line', () => {
    const result = normalizeIssueLine(
      [
        '- **Issue:** #1053',
        '- **Issue**: #1053',
        'Related Issue: #1053',
        '',
        '## CHANGE SUMMARY',
      ].join('\n'),
      1053
    );

    expect(result).toBe(['- **Issue:** #1053', '', '## CHANGE SUMMARY'].join('\n'));
  });

  it('does not replace ordinary prose that starts with Issue', () => {
    const result = normalizeIssueLine(
      [
        'Closes #1053',
        'Issue reproduction steps: open the PR body and inspect the source issue line.',
      ].join('\n'),
      1053
    );

    expect(result).toBe(
      [
        '- **Issue:** #1053',
        '',
        'Closes #1053',
        'Issue reproduction steps: open the PR body and inspect the source issue line.',
      ].join('\n')
    );
  });

  it('continues to detect same-repository closing keyword references', () => {
    const result = bodyRefs('Closes https://github.com/wdhunter645/next-starter-template/issues/1053');
    expect(result.invalidRefs).toEqual([]);
    expect(result.refs).toEqual([{ issueNumber: 1053, source: 'closing-keyword-body-line' }]);
  });

  it('does not manufacture issue refs from malformed references', () => {
    const result = bodyRefs('Issue: not-an-issue');
    expect(result.invalidRefs).toEqual([]);
    expect(result.refs).toEqual([]);
  });

  it('preserves multiple-issue violations for enforcement', () => {
    const result = bodyRefs(['Issue: #1053', 'Related Issue: #1054'].join('\n'));
    const unique = [...new Set(result.refs.map((ref) => ref.issueNumber))];
    expect(result.invalidRefs).toEqual([]);
    expect(unique).toEqual([1053, 1054]);
  });

  it('rejects cross-repository explicit issue references', () => {
    const result = bodyRefs('Issue: https://github.com/other/repo/issues/1053');
    expect(result.refs).toEqual([]);
    expect(result.invalidRefs).toEqual([
      {
        ref: 'https://github.com/other/repo/issues/1053',
        source: 'primary-body-line',
      },
    ]);
  });

  it('reports missing issue references as no discovered refs', () => {
    const result = bodyRefs('## CHANGE SUMMARY\nNo source issue here.');
    expect(result.invalidRefs).toEqual([]);
    expect(result.refs).toEqual([]);
  });

  it('keeps branch-name issue discovery available as a fallback surface', () => {
    expect(issueRefsFromBranch('ci/1058-semantic-issue-parser')).toEqual([
      { issueNumber: 1058, source: 'branch-name' },
    ]);
  });

  it('ignores cubic auto-generated PR description blocks for issue accounting', () => {
    const body = [
      '- **Issue:** #1483',
      '',
      '<!-- This is an auto-generated description by cubic. -->',
      'Expected outcome on merge: close #1411 and #1488; resolve #1483, #1487, and #1490.',
      '<!-- End of auto-generated description by cubic. -->',
    ].join('\n');

    expect(issueRefsFromTrustedSources(body, '', owner, repo)).toEqual({
      invalidRefs: [],
      refs: [{ issueNumber: 1483, source: 'primary-body-line' }],
    });
  });

  it('uses branch-name issue discovery only when body source refs are absent', () => {
    expect(
      issueRefsFromTrustedSources('- **Issue:** #1075', 'cursor/ci-orchestration-engine-1265', owner, repo)
    ).toEqual({
      invalidRefs: [],
      refs: [{ issueNumber: 1075, source: 'primary-body-line' }],
    });

    expect(issueRefsFromTrustedSources('## CHANGE SUMMARY', 'ci/1058-semantic-issue-parser', owner, repo)).toEqual({
      invalidRefs: [],
      refs: [{ issueNumber: 1058, source: 'branch-name' }],
    });
  });
});
