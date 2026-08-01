import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildPrompt } from '../scripts/cursor-bridge/lib/launch.mjs';
import { FALLBACK_PREFIXES } from '../scripts/cursor-bridge/lib/notify.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function read(rel) {
  return fs.readFileSync(path.join(root, rel), 'utf8');
}

describe('cursor bridge shared Issue-status lifecycle (#2997)', () => {
  it('removes routine ACK/STARTED/COMPLETED config prefixes', () => {
    const cfg = JSON.parse(read('config/cursor-bridge/bridge.json'));
    expect(cfg).not.toHaveProperty('ackCommentPrefix');
    expect(cfg).not.toHaveProperty('startedCommentPrefix');
    expect(cfg).not.toHaveProperty('completedCommentPrefix');
    expect(cfg.fallbackCommentPrefix).toMatch(/FALLBACK/);

    const schema = JSON.parse(read('config/cursor-bridge/bridge.schema.json'));
    expect(schema.properties).not.toHaveProperty('ackCommentPrefix');
    expect(schema.properties).not.toHaveProperty('startedCommentPrefix');
    expect(schema.properties).not.toHaveProperty('completedCommentPrefix');
    expect(schema.properties).toHaveProperty('fallbackCommentPrefix');
  });

  it('does not post routine STARTED/COMPLETED telemetry from bridge.mjs', () => {
    const src = read('scripts/cursor-bridge/bridge.mjs');
    expect(src).not.toMatch(/postIssueComment\s*\(/);
    expect(src).not.toMatch(/startedCommentPrefix/);
    expect(src).not.toMatch(/completedCommentPrefix/);
    expect(src).toMatch(/Do not post routine CURSOR BRIDGE STARTED/);
    expect(src).toMatch(/Do not post routine CURSOR BRIDGE COMPLETED/);
  });

  it('wake workflow does not emit routine ACK comments', () => {
    const yml = read('.github/workflows/cursor-local-wake.yml');
    expect(yml).not.toMatch(/gh issue comment/);
    expect(yml).toMatch(/CURSOR BRIDGE ACK Issue comments are prohibited/);
    expect(yml).toMatch(/issues: read/);
    expect(yml).not.toMatch(/issues: write/);
  });

  it('retains actionable FALLBACK prefixes for fault reporting', () => {
    expect(FALLBACK_PREFIXES.unclaimed).toMatch(/FALLBACK: unclaimed/);
    expect(FALLBACK_PREFIXES.launchRetry).toMatch(/FALLBACK: launch-retry/);
    expect(FALLBACK_PREFIXES.acceptedRunFailure).toMatch(/FALLBACK: accepted-run-failure/);
  });

  it('launch prompt assigns Issue status + handoff as shared lifecycle', () => {
    const prompt = buildPrompt({
      issueNumber: 2997,
      issue: {
        title: 'test',
        state: 'OPEN',
        labels: [{ name: 'agent:cursor' }],
        body: 'body',
      },
      comments: [],
      resumeUrl: 'https://example.com/resume',
      responseUrl: 'https://example.com/response',
      semanticFindings: [],
    });
    expect(prompt).toMatch(/status:implementation/);
    expect(prompt).toMatch(/status:review/);
    expect(prompt).toMatch(/Bridge does not post ACK\/STARTED\/COMPLETED telemetry/);
    expect(prompt).toMatch(/IMPLEMENTATION HANDOFF/);
  });
});
