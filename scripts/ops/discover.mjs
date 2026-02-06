import fs from 'node:fs';
import path from 'node:path';
import { chromium } from '@playwright/test';

function normalizeBaseUrl(u) {
  const s = String(u || '').trim();
  if (!s) return '';
  return s.replace(/\/+$/, '');
}

function readText(p) {
  return fs.readFileSync(p, 'utf8').replace(/\r\n/g, '\n');
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

function isSameOrigin(base, url) {
  try {
    const b = new URL(base);
    const u = new URL(url, base);
    return b.origin === u.origin;
  } catch {
    return false;
  }
}

function absolutize(base, href) {
  try {
    return new URL(href, base).toString();
  } catch {
    return null;
  }
}

async function main() {
  const baseUrl = pickBaseUrl();
  if (!baseUrl) {
    console.error('Missing BASE_URL (set env BASE_URL, or provide scripts/ci/production_base_url.txt).');
    process.exit(1);
  }

  const maxPages = Number(process.env.DISCOVERY_MAX_PAGES || 40);
  const maxDepth = Number(process.env.DISCOVERY_MAX_DEPTH || 2);

  console.log(`Ops Discovery (manual)\nBase URL: ${baseUrl}\nMax pages: ${maxPages}\nMax depth: ${maxDepth}`);

  const visited = new Set();
  const queue = [{ url: `${baseUrl}/`, depth: 0 }];
  const results = [];

  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 1280, height: 820 } });
  const page = await context.newPage();

  while (queue.length && results.length < maxPages) {
    const { url, depth } = queue.shift();
    if (visited.has(url)) continue;
    visited.add(url);

    let status = null;
    let title = '';
    let h1 = '';
    let h2 = [];

    try {
      const resp = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
      status = resp ? resp.status() : null;
      title = await page.title();

      const h1El = page.locator('h1').first();
      if (await h1El.count()) h1 = (await h1El.innerText()).trim();

      const h2Els = page.locator('h2');
      const h2Count = await h2Els.count();
      for (let i = 0; i < Math.min(h2Count, 12); i++) {
        const t = (await h2Els.nth(i).innerText()).trim();
        if (t) h2.push(t);
      }

      // Collect links for next depth
      if (depth < maxDepth) {
        const hrefs = await page.$$eval('a[href]', (as) => as.map(a => a.getAttribute('href') || '').filter(Boolean));
        for (const href of hrefs) {
          const abs = absolutize(url, href);
          if (!abs) continue;
          if (!abs.startsWith(baseUrl)) continue;
          // Skip obvious non-page routes
          if (abs.includes('#')) continue;
          if (abs.match(/\.(png|jpg|jpeg|webp|svg|gif|css|js|ico|pdf)(\?|$)/i)) continue;
          if (!visited.has(abs)) queue.push({ url: abs, depth: depth + 1 });
        }
      }
    } catch (e) {
      status = 'NAV_ERR';
    }

    const record = { url, depth, status, title, h1, h2 };
    results.push(record);
    console.log(`${results.length.toString().padStart(3,'0')}  [d${depth}]  ${status}  ${url}`);
  }

  await context.close();
  await browser.close();

  const outDir = path.join(process.cwd(), 'artifacts');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir);
  const outFile = path.join(outDir, 'ops-discovery.json');
  fs.writeFileSync(outFile, JSON.stringify({ baseUrl, maxPages, maxDepth, results }, null, 2) + '\n', 'utf8');

  console.log(`\nWrote inventory: ${outFile}`);
}

main().catch((e) => {
  console.error(String(e?.stack || e));
  process.exit(1);
});
