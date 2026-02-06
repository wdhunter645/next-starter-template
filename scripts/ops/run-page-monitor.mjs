import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function readText(p) {
  return fs.readFileSync(p, 'utf8').replace(/\r\n/g, '\n');
}

function normalizeBaseUrl(u) {
  const s = String(u || '').trim();
  if (!s) return '';
  return s.replace(/\/+$/, '');
}

function pickBaseUrl() {
  const env = process.env.BASE_URL;
  if (env && env.trim()) return normalizeBaseUrl(env);

  const file = path.join(process.cwd(), 'scripts', 'ci', 'production_base_url.txt');
  if (fs.existsSync(file)) {
    const v = readText(file).trim();
    if (v) return normalizeBaseUrl(v);
  }

  return '';
}

function fail(msg) {
  console.error(`FAIL: ${msg}`);
  process.exitCode = 1;
}

async function main() {
  const cfgPath = process.env.PAGE_MONITORS || path.join(process.cwd(), 'docs', 'ops', 'page-monitors.json');
  if (!fs.existsSync(cfgPath)) {
    console.error(`Missing config: ${cfgPath}`);
    process.exit(1);
  }

  const cfg = JSON.parse(readText(cfgPath));
  const baseUrl = pickBaseUrl();
  if (!baseUrl) {
    console.error('Missing BASE_URL (set env BASE_URL, or provide scripts/ci/production_base_url.txt).');
    process.exit(1);
  }

  const pages = Array.isArray(cfg.pages) ? cfg.pages : [];
  if (pages.length === 0) {
    console.error('No pages configured in page-monitors.json');
    process.exit(1);
  }

  console.log(`Ops Page Monitor`);
  console.log(`Base URL: ${baseUrl}`);
  console.log(`Config: ${cfgPath}`);

  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 1280, height: 820 } });
  const page = await context.newPage();

  for (const p of pages) {
    const id = p.id || p.path;
    const url = `${baseUrl}${p.path || '/'}`;

    console.log(`\n---`);
    console.log(`Page: ${id}`);
    console.log(`URL:  ${url}`);

    try {
      await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 });
    } catch (e) {
      fail(`${id}: navigation failed: ${String(e?.message || e)}`);
      continue;
    }

    // Title check
    if (p.title_contains) {
      const t = await page.title();
      if (!t.includes(p.title_contains)) {
        fail(`${id}: title missing "${p.title_contains}" (got: "${t}")`);
      }
    }

    // Selector existence
    for (const sel of (p.must_have_selectors || [])) {
      const loc = page.locator(sel).first();
      const n = await loc.count();
      if (n < 1) {
        fail(`${id}: missing selector: ${sel}`);
      }
    }

    // Selector counts
    if (p.selector_counts && typeof p.selector_counts === 'object') {
      for (const [sel, expected] of Object.entries(p.selector_counts)) {
        const count = await page.locator(sel).count();
        if (count !== expected) {
          fail(`${id}: selector count mismatch for ${sel}: expected ${expected}, got ${count}`);
        }
      }
    }

    // Text checks
    const bodyText = (await page.locator('body').innerText()).replace(/\s+/g, ' ');

    for (const txt of (p.must_have_text || [])) {
      if (!bodyText.includes(txt)) {
        fail(`${id}: missing text: ${txt}`);
      }
    }

    for (const bad of (p.must_not_contain_text || [])) {
      if (bodyText.includes(bad)) {
        fail(`${id}: forbidden text present: ${bad}`);
      }
    }

    console.log(`OK: ${id}`);
  }

  await context.close();
  await browser.close();

  if (process.exitCode && process.exitCode !== 0) {
    console.error('\nOne or more page checks failed.');
    process.exit(process.exitCode);
  }

  console.log('\nAll page checks passed.');
}

main().catch((e) => {
  console.error(String(e?.stack || e));
  process.exit(1);
});
