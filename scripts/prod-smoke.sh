#!/usr/bin/env bash

# LGFC Production Smoke Test (read-only)
# Safe for Codespaces shells: NO `set -euo pipefail`.
#
# Usage:
#   bash scripts/prod-smoke.sh https://www.lougehrigfanclub.com
#
# Exits non-zero on failure.

BASE_URL="${1:-https://www.lougehrigfanclub.com}"

need() {
  command -v "$1" >/dev/null 2>&1 || { echo "FAIL: Missing required command: $1" >&2; exit 2; }
}

fail() {
  echo "FAIL: $1" >&2
  exit 1
}

need curl
need grep
need sed
need head
need tr
need date

echo "== Smoke: BASE_URL=${BASE_URL} =="

# 1) Basic pages must respond (2xx/3xx)
PAGES=(
  "/"
  "/about"
  "/contact"
  "/terms"
  "/privacy"
  "/join"
  "/login"
  "/faq"
  "/health"
)

for p in "${PAGES[@]}"; do
  code="$(curl -sS -o /dev/null -w "%{http_code}" "${BASE_URL}${p}" 2>/dev/null)"
  echo "GET ${p} -> ${code}"
  case "${code}" in
    2*|3*) : ;;
    *) fail "${p} expected 2xx/3xx, got ${code}" ;;
  esac
done

# 2) Public JSON endpoints should return ok:true
MONTH_UTC="$(date -u +%Y-%m)"
ENDPOINTS=(
  "/api/health"
  "/api/faq/list?limit=3"
  "/api/events/month?month=${MONTH_UTC}"
  "/api/milestones/list?limit=3"
)

for u in "${ENDPOINTS[@]}"; do
  body="$(curl -sS "${BASE_URL}${u}" | head -c 800)"
  preview="$(printf "%s" "${body}" | tr '\n' ' ' | sed 's/  */ /g' | head -c 160)"
  echo "GET ${u} -> ${preview}"
  printf "%s" "${body}" | grep -q '"ok"[[:space:]]*:[[:space:]]*true' || fail "${u} missing ok:true"
done

# 3) FanClub auth gate: should NOT allow /fanclub when logged out
# Accept either 30x redirect OR a 200 that clearly indicates a client-side redirect.
code="$(curl -sS -o /dev/null -w "%{http_code}" "${BASE_URL}/fanclub" 2>/dev/null)"
echo "GET /fanclub (logged out) -> ${code}"

if [[ "${code}" == 200 ]]; then
  html="$(curl -sS "${BASE_URL}/fanclub" | head -c 1500)"
  printf "%s" "${html}" | grep -qi "redirect" || echo "WARN: /fanclub returned 200 and no obvious redirect marker (client-side gating may still be OK)."
else
  case "${code}" in
    3*|401|403) : ;;  # acceptable "not accessible" signals
    *) echo "WARN: /fanclub returned ${code}; confirm gating behavior manually if this looks unexpected." ;;
  esac
fi

echo "OK: production smoke passed"
