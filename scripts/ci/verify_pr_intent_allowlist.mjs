import fs from 'node:fs';
import { execSync } from 'node:child_process';

const cfg = JSON.parse(fs.readFileSync('scripts/ci/pr_intent_allowlists.json', 'utf8'));

const base = process.env.GITHUB_BASE_SHA;
const head = process.env.GITHUB_HEAD_SHA;
if (!base || !head) {
  console.error('ERROR: Missing GITHUB_BASE_SHA / GITHUB_HEAD_SHA');
  process.exit(1);
}

const labelsRaw = process.env.GITHUB_PR_LABELS || '';
const labels = labelsRaw.split(',').map(s => s.trim()).filter(Boolean);

const intentLabels = Object.keys(cfg.intents);
const matched = intentLabels.filter(l => labels.includes(l));

if (matched.length !== 1) {
  console.error('ERROR: PR must include exactly ONE intent label.');
  console.error(`Allowed intent labels: ${intentLabels.join(', ')}`);
  console.error(`Found: ${matched.length ? matched.join(', ') : '(none)'}`);
  process.exit(1);
}

const intent = matched[0];
const allow = cfg.intents[intent];

const changed = execSync(`git diff --name-only ${base}..${head}`, { encoding: 'utf8' })
  .split('\n').map(s => s.trim()).filter(Boolean);

function isDenied(p) {
  return (allow.deny_prefixes || []).some(d => p.startsWith(d));
}
function isAllowed(p) {
  if (isDenied(p)) return false;
  return (allow.allow_prefixes || []).some(a => p.startsWith(a));
}

const violations = changed.filter(p => !isAllowed(p));

// Special check: if both wrangler.toml and functions/** are touched, recommend platform label
const hasWrangler = changed.some(p => p === 'wrangler.toml');
const hasFunctions = changed.some(p => p.startsWith('functions/'));
if (hasWrangler && hasFunctions && intent !== 'platform') {
  console.error('ERROR: Use intent label `platform` for mixed wrangler.toml + functions/** changes.');
  console.error('This PR touches both wrangler.toml and functions/** files.');
  console.error('Please apply the `platform` label instead of `' + intent + '`.');
  process.exit(1);
}

if (violations.length) {
  console.error(`ERROR: File-touch allowlist violation for intent '${intent}'.`);
  console.error(`Allowed prefixes: ${(allow.allow_prefixes||[]).join(', ') || '(none)'}`);
  console.error(`Denied prefixes: ${(allow.deny_prefixes||[]).join(', ') || '(none)'}`);
  console.error('Violations:');
  for (const v of violations) console.error(` - ${v}`);
  process.exit(1);
}

console.log(`OK: Intent '${intent}' allowlist satisfied (${changed.length} files).`);
