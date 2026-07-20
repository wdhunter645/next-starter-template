#!/usr/bin/env node
/** Lightweight eligibility unit checks (no network). */
import assert from 'node:assert/strict';
import { validateEligibility, parseResume } from './lib/eligibility.mjs';

const baseIssue = {
  number: 2667,
  state: 'OPEN',
  labels: [{ name: 'agent:cursor' }, { name: 'handoff:ready' }],
};

const response = {
  id: 111,
  url: 'https://github.com/wdhunter645/next-starter-template/issues/2667#issuecomment-111',
  body: 'CHATGPT RESPONSE\nStatus: go\n',
  createdAt: '2026-07-20T12:00:00Z',
};

const resume = {
  id: 222,
  url: 'https://github.com/wdhunter645/next-starter-template/issues/2667#issuecomment-222',
  body: `LOCAL CURSOR RESUME
Issue: #2667
Source handoff: ${response.url}
Resume from: ${response.url}
Next local action:
- Implement bridge soak validation only
`,
  createdAt: '2026-07-20T12:01:00Z',
};

{
  const r = validateEligibility(baseIssue, [response, resume]);
  assert.equal(r.ok, true, r.errors.join(','));
  assert.equal(r.parsed.actions.length, 1);
}

{
  const bad = {
    ...resume,
    body: `LOCAL CURSOR RESUME
Issue: #2667
Resume from: ${response.url}
Next local action:
- first
- second
`,
  };
  const r = validateEligibility(baseIssue, [response, bad]);
  assert.equal(r.ok, false);
  assert.ok(r.errors.some((e) => e.startsWith('resume_action_count')));
}

{
  const r = validateEligibility(
    { ...baseIssue, labels: [{ name: 'agent:cursor' }] },
    [response, resume],
  );
  assert.equal(r.ok, false);
  assert.ok(r.errors.includes('missing_label:handoff:ready'));
}

{
  const p = parseResume(resume.body);
  assert.equal(p.issueNumber, 2667);
  assert.equal(p.actions[0], 'Implement bridge soak validation only');
}

console.log('eligibility self-check: PASS');
