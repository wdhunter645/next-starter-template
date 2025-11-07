#!/usr/bin/env node
/**
 * LGFC Snapshot Tool
 * - Outputs /docs/snapshots/snapshot-YYYYMMDD-HHMMSS.md and /docs/snapshots/latest.md
 * - Read-only: inspects repo, computes hashes, optionally queries Cloudflare Pages
 * - No secrets are printed. CF section is optional and skipped if env not set.
 */
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import fsp from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';

const ROOT = process.cwd();
const SNAP_DIR = path.join(ROOT, 'docs', 'snapshots');
const NOW = new Date();
const ts = (d => {
  const pad = n => String(n).padStart(2, '0');
  return `${d.getFullYear()}${pad(d.getMonth()+1)}${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
})(NOW);
const SNAP_FILE = path.join(SNAP_DIR, `snapshot-${ts}.md`);
const LATEST_FILE = path.join(SNAP_DIR, 'latest.md');

const EXCLUDE_DIRS = new Set([
  'node_modules', '.git', '.next', 'out', 'dist', 'build',
  '.vercel', '.wrangler', '.cache', '.parcel-cache', '.turbo', 'coverage'
]);
const EXCLUDE_FILES = new Set(['.DS_Store']);

const KEY_FILES = [
  'package.json',
  'wrangler.toml',
  'tsconfig.json',
  'next.config.js',
  'next.config.ts',
  'src/app/globals.css',
  'src/components/Header.tsx',
  'src/components/WeeklyMatchup.tsx',
  'src/app/page.tsx',
  'docs/lgfc-homepage-legacy-v6.html',
  'docs/website-PR-process.md',
  'docs/website-PR-governance.md',
];

const ANC_HREFS = [
  'docs/lgfc-homepage-legacy-v6.html',
  'docs/website-PR-process.md',
  'docs/website-PR-governance.md',
];

function sh(cmd) {
  try {
    return execSync(cmd, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
  } catch {
    return '';
  }
}

function rel(p) {
  return path.relative(ROOT, p).replaceAll('\\', '/');
}

async function ensureDir(p) {
  await fsp.mkdir(p, { recursive: true });
}

function hashFileSync(filePath) {
  try {
    const buf = fs.readFileSync(filePath);
    return crypto.createHash('sha256').update(buf).digest('hex');
  } catch {
    return null;
  }
}

async function exists(p) {
  try { await fsp.access(p, fs.constants.F_OK); return true; } catch { return false; }
}

async function* walk(dir) {
  const ents = await fsp.readdir(dir, { withFileTypes: true });
  for (const ent of ents) {
    const full = path.join(dir, ent.name);
    const name = ent.name;
    if (ent.isDirectory()) {
      if (EXCLUDE_DIRS.has(name)) continue;
      yield* walk(full);
    } else if (ent.isFile()) {
      if (EXCLUDE_FILES.has(name)) continue;
      yield full;
    }
  }
}

async function buildFileTree() {
  const files = [];
  for await (const f of walk(ROOT)) {
    files.push(rel(f));
  }
  files.sort((a, b) => a.localeCompare(b));
  return files;
}

function readFewLines(filePath, maxLines = 50) {
  try {
    const txt = fs.readFileSync(filePath, 'utf8');
    const lines = txt.split(/\r?\n/).slice(0, maxLines);
    return lines.join('\n');
  } catch {
    return null;
  }
}

async function anchorsTable() {
  const rows = await Promise.all(ANC_HREFS.map(async f => {
    const ok = await exists(path.join(ROOT, f));
    return `| \`${f}\` | ${ok ? '✅ present' : '❌ missing'} |`;
  }));
  return [
    '| Anchor | Status |',
    '|---|---|',
    ...rows
  ].join('\n');
}

async function hashTable() {
  const rows = await Promise.all(KEY_FILES.map(async f => {
    const p = path.join(ROOT, f);
    const present = await exists(p);
    const h = present ? hashFileSync(p) : null;
    return `| \`${f}\` | ${present ? '✅' : '❌'} | ${h ?? ''} |`;
  }));
  return [
    '| File | Exists | SHA-256 |',
    '|---|:---:|---|',
    ...rows
  ].join('\n');
}

async function cloudflareSection() {
  const token = process.env.CF_API_TOKEN;
  const account = process.env.CF_ACCOUNT_ID;
  const project = process.env.CF_PAGES_PROJECT;
  if (!token || !account || !project) {
    return [
      '#### Cloudflare Pages (optional)',
      '',
      '- Status: **Not verifiable** (missing env: `CF_API_TOKEN`, `CF_ACCOUNT_ID`, or `CF_PAGES_PROJECT`).',
      '- Manual check (example):',
      '  - curl -s -H "Authorization: Bearer <TOKEN>" \\',
      `    "https://api.cloudflare.com/client/v4/accounts/${account ?? '<ACCOUNT>'}/pages/projects/${project ?? '<PROJECT>'}/deployments?per_page=1"`,
      ''
    ].join('\n');
  }
  try {
    // Node 18+ has fetch. Query latest deployment.
    const url = `https://api.cloudflare.com/client/v4/accounts/${account}/pages/projects/${project}/deployments?per_page=1`;
    const res = await fetch(url, { headers: { 'Authorization': `Bearer ${token}` } });
    const json = await res.json();
    if (!json?.success) {
      throw new Error('Cloudflare API returned non-success');
    }
    const dep = json?.result?.[0];
    if (!dep) {
      return [
        '#### Cloudflare Pages',
        '',
        `- Project: \`${project}\``,
        '- Latest deployment: not found',
        ''
      ].join('\n');
    }
    const fields = [
      ['project', project],
      ['deployment_id', dep.id],
      ['environment', dep.environment],
      ['source', `${dep.source?.type ?? ''} ${dep.source?.config?.repo_name ?? ''}#${dep.source?.config?.production_branch ?? ''}`.trim()],
      ['url', dep.url],
      ['created_on', dep.created_on],
      ['build_config', JSON.stringify(dep.build_config ?? {}, null, 2)]
    ];
    return [
      '#### Cloudflare Pages',
      '',
      ...fields.map(([k, v]) => `- **${k}**: ${v}`),
      ''
    ].join('\n');
  } catch {
    return [
      '#### Cloudflare Pages (error)',
      '',
      '- Status: **Not verifiable** (API error).',
      '- Manual check (example):',
      '  - curl -s -H "Authorization: Bearer $CF_API_TOKEN" \\',
      `    "https://api.cloudflare.com/client/v4/accounts/${account}/pages/projects/${project}/deployments?per_page=1"`,
      ''
    ].join('\n');
  }
}

async function main() {
  await ensureDir(SNAP_DIR);

  const commit = sh('git rev-parse HEAD');
  const branch = sh('git rev-parse --abbrev-ref HEAD');
  const status = sh('git status --porcelain');

  const files = await buildFileTree();
  const anchors = await anchorsTable();
  const hashes = await hashTable();

  // Small excerpts of key config files (never secrets)
  const excerpts = [];
  for (const f of KEY_FILES) {
    const p = path.join(ROOT, f);
    if (fs.existsSync(p)) {
      const head = readFewLines(p, 60);
      if (head !== null) {
        excerpts.push([
          `##### ${f}`,
          '',
          '```',
          head,
          '```',
          ''
        ].join('\n'));
      }
    }
  }

  const cf = await cloudflareSection();

  const body = [
    `# Repository Snapshot — ${NOW.toISOString()}`,
    '',
    '## Repo State',
    '',
    `- **Commit**: \`${commit || 'unknown'}\``,
    `- **Branch**: \`${branch || 'unknown'}\``,
    `- **Working tree clean**: ${status ? '❌ changes present' : '✅ clean'}`,
    '',
    '## Anchors',
    '',
    anchors,
    '',
    '## File Tree (filtered)',
    '',
    '```',
    ...files.map(f => f),
    '```',
    '',
    '## Key File Hashes',
    '',
    hashes,
    '',
    cf,
    '',
    '## Key File Excerpts (first ~60 lines, if present)',
    '',
    ...excerpts
  ].join('\n');

  await fsp.writeFile(SNAP_FILE, body, 'utf8');
  await fsp.writeFile(LATEST_FILE, body, 'utf8');

  // Also print a tiny notice to stdout (safe)
  process.stdout.write(`Wrote snapshot:\n- ${rel(SNAP_FILE)}\n- ${rel(LATEST_FILE)}\n`);
}

main().catch(e => {
  console.error('Snapshot failed:', e?.message || e);
  process.exit(1);
});
