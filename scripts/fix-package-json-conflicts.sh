#!/usr/bin/env bash
#
# fix-package-json-conflicts.sh
#
# Automatically resolves merge conflicts in package.json by:
# - Keeping the first side of conflict markers (pre-=======)
# - Validating the resulting JSON
# - Adding Next-on-Pages adapter scripts
# - Installing the @cloudflare/next-on-pages dev dependency
# - Committing and pushing changes to retrigger CI deployments
#
# Usage: Run from repository root
#   ./scripts/fix-package-json-conflicts.sh

set -euo pipefail

# 0) Safety checkpoint: ensure we're in a git repo
git rev-parse --is-inside-work-tree >/dev/null

# 1) Backup the broken file
cp package.json package.json.BAK.$(date +%Y%m%d%H%M%S)

# 2) Auto-fix merge markers in package.json by keeping the FIRST variant (pre-=======)
#    If there are multiple conflicts, it fixes them all.
node - <<'NODE'
const fs = require('fs');
let s = fs.readFileSync('package.json', 'utf8');

// Replace every conflict block <<<<<<< ... ======= ... >>>>>>> with the FIRST half
const re = /<<<<<<<[\s\S]*?^(.*?)^=======([\s\S]*?)^>>>>>>>.*$/gm;
let fixed = s;

// Use a loop because JS 'm' and 's' flags behave differently across engines; the simpler approach is segment-wise.
function resolveOnce(txt){
  return txt.replace(/<<<<<<<[^\n]*\n([\s\S]*?)^=======\n([\s\S]*?)^>>>>>>>[^\n]*\n/gm, (_, first) => first);
}
for (let i = 0; i < 20; i++) {
  const next = resolveOnce(fixed);
  if (next === fixed) break;
  fixed = next;
}

// Trim stray markers if any remain
fixed = fixed.replace(/^[ \t]*<<<<<<<[^\n]*\n/gm, '')
             .replace(/^[ \t]*>>>>>>>[^\n]*\n/gm, '')
             .replace(/^[ \t]*=======[ \t]*\n/gm, '');

try {
  JSON.parse(fixed);
} catch (e) {
  console.error('package.json still invalid after auto-fix. See package.json.BAK.* and fix manually.');
  process.exit(1);
}
fs.writeFileSync('package.json', fixed);
console.log('package.json conflict markers removed and JSON validated.');
NODE

# 3) Ensure Node 20+ in engines (optional harden); ignore errors if npm lacks pkg subcommand
npm pkg set engines.node=">=20" >/dev/null 2>&1 || true

# 4) Install Next-on-Pages adapter as dev dep (needed to generate .open-next/worker.js)
npm i -D @cloudflare/next-on-pages

# 5) Ensure scripts exist (build, cf:adapt, cf:build)
#    Note: npm pkg set handles JSON safely now that the file is valid
npm pkg set "scripts.build=next build"
npm pkg set "scripts.cf:adapt=npx @cloudflare/next-on-pages@latest"
npm pkg set "scripts.cf:build=npm run build && npm run cf:adapt"

# 6) Show diff for sanity
git add -A
git --no-pager diff --staged

# 7) Commit and push (this retriggers your GH Actions deploys)
git commit -m "Fix: resolve package.json merge markers; add Next-on-Pages adapter scripts"
git push

echo "✅ package.json fixed, adapter added, commit pushed. Watch GitHub Actions for new dev/prod deploys."
