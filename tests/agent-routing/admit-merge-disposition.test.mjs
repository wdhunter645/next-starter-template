import { describe, expect, it } from 'vitest';
import {
  classifyPullsMergeResult,
  formatAdmitMergeEvidenceLine,
} from '../../scripts/agent-routing/admit-merge-disposition.mjs';

describe('classifyPullsMergeResult (#2622 / #3043)', () => {
  it('classifies a successful merge', () => {
    expect(classifyPullsMergeResult({
      merged: true,
      sha: 'abc123',
      message: 'Pull Request successfully merged',
    })).toEqual({
      disposition: 'merged',
      merged: true,
      mergeSha: 'abc123',
      message: 'Pull Request successfully merged',
    });
  });

  it('classifies API success with merged:false as refused (not API failure)', () => {
    expect(classifyPullsMergeResult({
      merged: false,
      message: 'Pull Request is not mergeable',
    })).toEqual({
      disposition: 'refused',
      merged: false,
      mergeSha: '',
      message: 'Pull Request is not mergeable',
    });
  });

  it('classifies thrown errors as api_failure', () => {
    expect(classifyPullsMergeResult({
      error: new Error('Resource not accessible by integration'),
    })).toEqual({
      disposition: 'api_failure',
      merged: false,
      mergeSha: '',
      message: 'Resource not accessible by integration',
    });
  });
});

describe('formatAdmitMergeEvidenceLine (#2622 / #3043)', () => {
  it('preserves the gate-failure evidence path', () => {
    expect(formatAdmitMergeEvidenceLine({
      gatesPassed: false,
      merged: false,
    })).toContain('a required gate failed or was unavailable');
  });

  it('labels MERGE REFUSED when pulls.merge returns merged:false', () => {
    const line = formatAdmitMergeEvidenceLine({
      gatesPassed: true,
      merged: false,
      mergeDisposition: 'refused',
      mergeMessage: 'Pull Request is not mergeable',
    });
    expect(line).toContain('MERGE REFUSED');
    expect(line).toContain('Pull Request is not mergeable');
    expect(line).not.toContain('MERGE API FAILURE');
    expect(line).not.toContain('required gate failed');
  });

  it('labels MERGE API FAILURE when the merge call throws', () => {
    const line = formatAdmitMergeEvidenceLine({
      gatesPassed: true,
      merged: false,
      mergeDisposition: 'api_failure',
      mergeMessage: 'Server Error',
    });
    expect(line).toContain('MERGE API FAILURE');
    expect(line).toContain('Server Error');
    expect(line).not.toContain('MERGE REFUSED');
    expect(line).not.toContain('required gate failed');
  });

  it('records a successful merge SHA', () => {
    expect(formatAdmitMergeEvidenceLine({
      gatesPassed: true,
      merged: true,
      mergeSha: 'deadbeef',
    })).toBe('Automatically merged: YES (merge SHA deadbeef)');
  });
});
