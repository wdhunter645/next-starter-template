#!/usr/bin/env node
/**
 * Task 01 Smoke Test (read-only)
 * Fast wiring/availability check for Day-1 baseline.
 * - Routes + JSON endpoints + basic auth-gate sanity
 * - Outputs JSON + Markdown reports
 *
 * Usage:
 *   node task01-smoke.mjs https://www.lougehrigfanclub.com
 *   SMOKE_BASE_URL=https://... node task01-smoke.mjs
 */

import fs from "node:fs";

const now = new Date();
const ts = now.toISOString().replace(/[:.]/g, "-");
const baseUrlArg = process.argv[2];
const BASE_URL = (baseUrlArg || process.env.SMOKE_BASE_URL || "https://www.lougehrigfanclub.com").replace(/\/+$/, "");

const OUT_DIR = "reports/smoke";
fs.mkdirSync(OUT_DIR, { recursive: true });

function normalizeUrl(p) {
  if (!p.startsWith("/")) throw new Error(`Path must start with "/": ${p}`);
  return `${BASE_URL}${p}`;
}

async function httpGet(p, accept = "text/html") {
  const url = normalizeUrl(p);
  const res = await fetch(url, {
    method: "GET",
    redirect: "manual",
    headers: { "accept": accept, "user-agent": "LGFC-Task01-Smoke/1.0" },
  }).catch((e) => ({ ok: false, status: 0, statusText: String(e), text: async () => "" }));

  let body = "";
  try {
    if (typeof res.text === "function") {
      const full = await res.text();
      body = full.slice(0, 2000);
    }
  } catch {}

  return {
    status: res.status ?? 0,
    ok: Boolean(res.ok),
    body
  };
}

function ok2xxOr3xx(status) {
  return status >= 200 && status <= 399;
}

function containsOkTrue(s) {
  return /"ok"\s*:\s*true/i.test(s);
}

async function run() {
  const checks = [];

  async function add(id, sev, title, fn) {
    let passed = false;
    let detail = {};
    try {
      const r = await fn();
      passed = r.passed;
      detail = r.detail || {};
    } catch (e) {
      passed = false;
      detail = { error: String(e) };
    }
    checks.push({ id, sev, title, passed, detail });
  }

  // Sev-0
  await add("home-http", 0, "Homepage responds", async () => {
    const r = await httpGet("/");
    return { passed: ok2xxOr3xx(r.status), detail: { status: r.status } };
  });

  await add("api-health-ok", 0, "/api/health returns ok:true", async () => {
    const r = await httpGet("/api/health", "application/json");
    return { passed: ok2xxOr3xx(r.status) && containsOkTrue(r.body), detail: { status: r.status } };
  });

  await add("health-page-http", 0, "/health page responds", async () => {
    const r = await httpGet("/health");
    return { passed: ok2xxOr3xx(r.status), detail: { status: r.status } };
  });

  // Sev-1 pages
  const corePages = ["/about", "/contact", "/terms", "/privacy", "/join", "/login", "/faq"];
  for (const p of corePages) {
    await add(`page-${p}`, 1, `${p} responds`, async () => {
      const r = await httpGet(p);
      return { passed: ok2xxOr3xx(r.status), detail: { status: r.status } };
    });
  }

  // Sev-1 JSON endpoints
  const month = new Date().toISOString().slice(0, 7);
  const jsonEndpoints = [
    `/api/faq/list?limit=3`,
    `/api/events/month?month=${encodeURIComponent(month)}`,
    `/api/milestones/list?limit=3`,
  ];
  for (const p of jsonEndpoints) {
    await add(`json-${p}`, 1, `${p} returns ok:true`, async () => {
      const r = await httpGet(p, "application/json");
      return {
        passed: ok2xxOr3xx(r.status) && containsOkTrue(r.body),
        detail: { status: r.status }
      };
    });
  }

  // Auth gate sanity
  await add("fanclub-gate", 1, "Logged-out /fanclub is gated", async () => {
    const r = await httpGet("/fanclub");
    return { passed: r.status !== 200, detail: { status: r.status } };
  });

  const sev0Fails = checks.filter(c => c.sev === 0 && !c.passed);
  const sev1Fails = checks.filter(c => c.sev === 1 && !c.passed);

  const summary = {
    baseUrl: BASE_URL,
    timestamp: now.toISOString(),
    totals: {
      checks: checks.length,
      passed: checks.filter(c => c.passed).length,
      failed: checks.filter(c => !c.passed).length,
      sev0Failed: sev0Fails.length,
      sev1Failed: sev1Fails.length
    },
    status: sev0Fails.length > 0 ? "FAIL" : (sev1Fails.length > 0 ? "WARN" : "PASS")
  };

  const report = { summary, checks };

  fs.writeFileSync(`${OUT_DIR}/task01-latest.json`, JSON.stringify(report, null, 2));

  console.log("Task01 Smoke:", summary.status);
  console.log(`Passed ${summary.totals.passed}/${summary.totals.checks}`);
  console.log(`Sev0 fails: ${summary.totals.sev0Failed} | Sev1 fails: ${summary.totals.sev1Failed}`);

  process.exit(summary.status === "FAIL" ? 1 : 0);
}

run();
