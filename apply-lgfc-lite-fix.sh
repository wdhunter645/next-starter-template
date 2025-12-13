#!/usr/bin/env bash
set -euo pipefail

# LGFC-Lite Cloudflare Pages fix:
# - Ensure _routes.json and _redirects are present in out/ after Next export build
# - Force export to /route/index.html (trailingSlash)
# - Rewrite common routes to /route/index.html (Cloudflare Pages static hosting)
# - Add lightweight secret scanning (gitleaks) workflow

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT"

echo "[fix] repo: $ROOT"

# safety: require we are at a repo root with package.json
test -f package.json || { echo "[fix] ERROR: package.json not found. Run from repo root."; exit 1; }

# 1) next.config.ts (ensure trailingSlash: true)
if ! grep -q "trailingSlash: true" next.config.ts; then
  echo "[fix] updating next.config.ts (trailingSlash: true)"
  python - <<'PY'
from pathlib import Path
p=Path("next.config.ts")
s=p.read_text()
if "trailingSlash" in s:
  # don't stomp; just ensure true if present
  import re
  s=re.sub(r"trailingSlash\s*:\s*false", "trailingSlash: true", s)
  if "trailingSlash: true" not in s:
    # present but not false; leave as-is
    pass
else:
  marker="// Skip trailing slash to match Cloudflare Pages defaults"
  if marker in s:
    s=s.replace(marker, "trailingSlash: true, // Export /route/index.html for Pages\n\t// (Pages does not reliably map /route to /route.html)")
  else:
    # last resort: insert before closing
    s=s.replace("};\n\nexport default nextConfig;\n", "\ttrailingSlash: true,\n};\n\nexport default nextConfig;\n")
p.write_text(s)
PY
fi

# 2) Ensure public/_routes.json exists (Cloudflare Pages needs it in output root)
if [ -f "_routes.json" ] && [ ! -f "public/_routes.json" ]; then
  echo "[fix] creating public/_routes.json from repo root _routes.json"
  cp -f "_routes.json" "public/_routes.json"
elif [ ! -f "public/_routes.json" ] && [ ! -f "_routes.json" ]; then
  echo "[fix] ERROR: no _routes.json found (repo root or public/)."
  exit 1
fi

# 3) Rewrite public/_redirects to /route/index.html (both /route and /route/)
echo "[fix] rewriting public/_redirects to index.html rewrites"
python - <<'PY'
from pathlib import Path
p=Path("public/_redirects")
routes=[
"/library","/photos","/memorabilia","/weekly","/matchup","/charities","/news","/calendar","/join",
"/member","/admin","/about","/contact","/privacy","/terms"
]
lines=[]
for r in routes:
  lines.append(f"{r}        {r}/index.html        200")
  lines.append(f"{r}/       {r}/index.html        200")
p.write_text("\n".join(lines)+"\n")
PY

# 4) Add scripts/cf-postbuild.mjs
if [ ! -f "scripts/cf-postbuild.mjs" ]; then
  echo "[fix] adding scripts/cf-postbuild.mjs"
  mkdir -p scripts
  cat > scripts/cf-postbuild.mjs <<'EOF'
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
EOF
fi

# 5) Ensure package.json has postbuild hook
echo "[fix] ensuring npm postbuild hook exists"
python - <<'PY'
import json
from pathlib import Path
p=Path("package.json")
pkg=json.loads(p.read_text())
scripts=pkg.get("scripts",{})
scripts["postbuild"]="node scripts/cf-postbuild.mjs"
pkg["scripts"]=scripts
p.write_text(json.dumps(pkg, indent=2)+"\n")
PY

# 6) Add gitleaks workflow
if [ ! -f ".github/workflows/gitleaks.yml" ]; then
  echo "[fix] adding .github/workflows/gitleaks.yml"
  mkdir -p .github/workflows
  cat > .github/workflows/gitleaks.yml <<'EOF'
name: Secret scan (gitleaks)

on:
  pull_request:
  push:
    branches: [ main ]

jobs:
  gitleaks:
    runs-on: ubuntu-latest
    permissions:
      contents: read
    steps:
      - name: Checkout
        uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Run gitleaks
        uses: gitleaks/gitleaks-action@v2
        env:
          GITLEAKS_LICENSE: ""  # OSS mode
EOF
fi

echo "[fix] DONE. Next:"
echo "  1) npm ci (or npm install)"
echo "  2) npm run build"
echo "  3) verify: ls -la out/_routes.json out/_redirects"
echo "  4) git status, commit, push"
