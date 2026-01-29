/*
  Purpose:
  - Find the Cloudflare Pages preview URL for a PR using ONLY GitHub API + GITHUB_TOKEN.
  Output:
  - Prints a single URL to stdout (no extra text) when found.
  - Exits 1 if not found within timeout.
*/
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const REPO = process.env.REPO; // "owner/name"
const PR_NUMBER = process.env.PR_NUMBER;
const PR_SHA = process.env.PR_SHA;

if (!GITHUB_TOKEN || !REPO || !PR_NUMBER || !PR_SHA) {
  console.error("Missing env. Require: GITHUB_TOKEN, REPO, PR_NUMBER, PR_SHA");
  process.exit(1);
}

const [owner, repo] = REPO.split("/");
const API = "https://api.github.com";

function sleep(ms) { return new Promise((r) => setTimeout(r, ms)); }

async function gh(path) {
  const res = await fetch(`${API}${path}`, {
    headers: {
      Authorization: `Bearer ${GITHUB_TOKEN}`,
      Accept: "application/vnd.github+json",
      "User-Agent": "preview-invariants",
      "X-GitHub-Api-Version": "2022-11-28",
    },
  });
  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`GitHub API ${path} failed: ${res.status} ${res.statusText} ${txt}`.trim());
  }
  return res.json();
}

function extractPagesUrls(text) {
  if (!text) return [];
  const urls = [];
  const re = /https:\/\/[a-z0-9-]+\.pages\.dev[^\s)"]*/gi;
  let m;
  while ((m = re.exec(text)) !== null) urls.push(m[0]);
  return urls;
}

async function tryFromComments() {
  const comments = await gh(`/repos/${owner}/${repo}/issues/${PR_NUMBER}/comments?per_page=100`);
  for (let i = comments.length - 1; i >= 0; i--) {
    const body = comments[i]?.body || "";
    const urls = extractPagesUrls(body);
    if (urls.length > 0) return urls[0];
  }
  return null;
}

async function tryFromCheckRuns() {
  const data = await gh(`/repos/${owner}/${repo}/commits/${PR_SHA}/check-runs?per_page=100`);
  const runs = data?.check_runs || [];
  for (let i = runs.length - 1; i >= 0; i--) {
    const r = runs[i];
    const text = `${r?.output?.title || ""}\n${r?.output?.summary || ""}\n${r?.output?.text || ""}`;
    const urls = extractPagesUrls(text);
    if (urls.length > 0) return urls[0];
    const d = r?.details_url || "";
    if (d.includes(".pages.dev")) return d;
  }
  return null;
}

async function tryFromDeployments() {
  const deps = await gh(`/repos/${owner}/${repo}/deployments?sha=${PR_SHA}&per_page=50`);
  for (let i = deps.length - 1; i >= 0; i--) {
    const dep = deps[i];
    const statuses = await gh(`/repos/${owner}/${repo}/deployments/${dep.id}/statuses?per_page=50`);
    for (let j = statuses.length - 1; j >= 0; j--) {
      const s = statuses[j];
      const candidates = [s?.environment_url, s?.target_url, s?.log_url].filter(Boolean);
      for (const c of candidates) {
        if (typeof c === "string" && c.includes(".pages.dev")) return c;
      }
    }
  }
  return null;
}

async function main() {
  const timeoutMs = 20 * 60 * 1000;
  const intervalMs = 15 * 1000;
  const start = Date.now();

  while (Date.now() - start < timeoutMs) {
    try { const u = await tryFromComments(); if (u) { process.stdout.write(u); return; } } catch (_) {}
    try { const u = await tryFromCheckRuns(); if (u) { process.stdout.write(u); return; } } catch (_) {}
    try { const u = await tryFromDeployments(); if (u) { process.stdout.write(u); return; } } catch (_) {}
    await sleep(intervalMs);
  }
  console.error("Timed out waiting for Cloudflare Pages preview URL (20 minutes).");
  process.exit(1);
}

main().catch((e) => { console.error(String(e?.stack || e)); process.exit(1); });
