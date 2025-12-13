/**
 * Cloudflare Pages (Next.js output: export) guardrail.
 * Ensures routing files land in the deploy output directory (out/).
 *
 * Why:
 * - Cloudflare Pages only reads _routes.json and _redirects from the output dir root.
 * - Next export copies /public into out/, but a root-level _routes.json is not copied.
 */
import fs from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();
const outDir = path.join(repoRoot, "out");

function fail(msg) {
  console.error(`[cf-postbuild] ${msg}`);
  process.exit(1);
}

if (!fs.existsSync(outDir)) {
  fail(`Missing out/ directory. Build did not produce a static export.`);
}

const candidates = [
  path.join(repoRoot, "public", "_routes.json"),
  path.join(repoRoot, "_routes.json"),
];

const outRoutes = path.join(outDir, "_routes.json");
const outRedirects = path.join(outDir, "_redirects");

let srcRoutes = null;
for (const c of candidates) {
  if (fs.existsSync(c)) {
    srcRoutes = c;
    break;
  }
}
if (!srcRoutes) {
  fail(`Missing _routes.json in repo root or public/.`);
}

// Copy routing artifacts into out/
fs.copyFileSync(srcRoutes, outRoutes);

// _redirects should already be in public/ and therefore copied by Next,
// but we hard-fail if missing in out/.
if (!fs.existsSync(outRedirects)) {
  // Try to copy from public as a fallback.
  const pubRedirects = path.join(repoRoot, "public", "_redirects");
  if (fs.existsSync(pubRedirects)) {
    fs.copyFileSync(pubRedirects, outRedirects);
  }
}

if (!fs.existsSync(outRoutes)) fail(`Failed to materialize out/_routes.json.`);
if (!fs.existsSync(outRedirects)) fail(`Failed to materialize out/_redirects.`);

// Sanity check _routes.json is valid JSON
try {
  JSON.parse(fs.readFileSync(outRoutes, "utf8"));
} catch (e) {
  fail(`out/_routes.json is not valid JSON: ${e?.message ?? e}`);
}

console.log("[cf-postbuild] OK: out/_routes.json and out/_redirects present.");
