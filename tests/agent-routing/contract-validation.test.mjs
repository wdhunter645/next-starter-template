import fs from 'node:fs';
import { describe, expect, it } from 'vitest';

const readJson = (path) => JSON.parse(fs.readFileSync(path, 'utf8'));
const config = readJson('scripts/agent-routing/config.json');

const schemas = [
  'state-snapshot.schema.json',
  'action-plan.schema.json',
  'routing-alert.schema.json',
  'watcher-claim.schema.json',
].map((name) => readJson(`scripts/agent-routing/schemas/${name}`));

describe('agent routing contract', () => {
  it('starts observe-only and defines the approved rollout modes', () => {
    expect(config.mode).toBe('observe');
    expect(config.allowedModes).toEqual(['disabled', 'observe', 'normalize', 'advance', 'integrate']);
    expect(config.production.autoMergeMain).toBe(false);
    expect(config.actions.mergeMain).toBe(false);
  });

  it('defines positive bounded thresholds', () => {
    for (const value of Object.values(config.thresholdsMinutes)) {
      expect(Number.isFinite(value)).toBe(true);
      expect(value).toBeGreaterThan(0);
    }
  });

  it('publishes strict machine-readable schemas', () => {
    for (const schema of schemas) {
      expect(schema.$schema).toContain('json-schema.org');
      expect(schema.additionalProperties).toBe(false);
      expect(schema.required.length).toBeGreaterThan(0);
    }
  });

  it('keeps repository runner bootstrap manual and untrusted jobs excluded', () => {
    expect(config.repositoryRunner.bootstrapMode).toBe('manual-health-only');
    expect(config.repositoryRunner.allowedEvents).toEqual(['workflow_dispatch']);
    expect(config.repositoryRunner.forbiddenWorkloads).toContain('pull_request');
    expect(config.repositoryRunner.forbiddenWorkloads).toContain('deployment');
  });

  it('documents broad connector-backed watcher review', () => {
    const handoff = fs.readFileSync('docs/ops/ai/chatgpt-cursor-handoff-workflow.md', 'utf8');
    const queue = fs.readFileSync('docs/ops/pmo/queue-watch-and-dispatch-protocol.md', 'utf8');
    const contract = fs.readFileSync('docs/reference/ci/agent-routing-controller-contract.md', 'utf8');
    for (const text of [handoff, queue, contract]) {
      expect(text).toContain('GitHub connector');
      expect(text).toContain('broad');
      expect(text).toContain('Alerts');
      expect(text).toContain('automatic merge to `main`');
    }
  });
});
