#!/usr/bin/env bash
set -euo pipefail

PKG=package.json
TMP=.pkg.tmp.json

command -v jq >/dev/null 2>&1 || { echo "jq is required"; exit 2; }

# Ensure file exists
[ -f "$PKG" ] || { echo "package.json not found"; exit 3; }

# Desired fields
read -r -d '' SCRIPTS_JSON <<'J' || true
{
  "build": "next build",
  "cf:prep": "npx @cloudflare/next-on-pages@latest --experimental-minify",
  "cf:build": "npm run build && npm run cf:prep"
}
J

read -r -d '' DEVDEPS_JSON <<'J' || true
{
  "@cloudflare/next-on-pages": "latest",
  "wrangler": "^4"
}
J

# Ensure specific scripts are set to the exact values (hard-set these three)
jq --argjson addScripts "$SCRIPTS_JSON" '
  .scripts.build = $addScripts.build |
  .scripts["cf:prep"] = $addScripts["cf:prep"] |
  .scripts["cf:build"] = $addScripts["cf:build"]
' "$PKG" > "$TMP.step1.json"

# Merge devDependencies (add or update these packages)
jq --argjson addDev "$DEVDEPS_JSON" '
  .devDependencies = (.devDependencies // {}) |
  .devDependencies["@cloudflare/next-on-pages"] = $addDev["@cloudflare/next-on-pages"] |
  .devDependencies.wrangler = $addDev.wrangler
' "$TMP.step1.json" > "$TMP"

mv "$TMP" "$PKG"
rm -f "$TMP".step*.json || true
echo "package.json merged successfully."
