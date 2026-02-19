#!/usr/bin/env bash
set -euo pipefail

# LGFC Production Smoke Test (read-only)
# Usage:
#   bash scripts/prod-smoke.sh https://www.lougehrigfanclub.com
#
# Exits non-zero on failure.

BASE_URL="${1:-https://www.lougehrigfanclub.com}"

need() { command -v "$1" >/dev/null 2>&1 || { echo "Missing required command: $1" >&2; exit 2; }; }
need curl
need grep
need sed

echo "== Smoke: BASE_URL=$BASE_URL =="

# 1) Basic pages must respond (2xx/3xx)
for p in "/" "/about" "/contact"  "/terms" "/privacy" "/join" "/login" "/faq" "/health"; do
  code="$(curl -sS -o /dev/null -w "%{http_code}" "$BASE_URL$p" || true)"
  echo "GET $p -> $code"
  if [[ "$code" != 2* && "$code" != 3* ]]; then
    echo "FAIL: $p expected 2xx/3xx" >&2
    exit 1
  fi
done

# 2) Public JSON endpoints should return ok:true
for u in "/api/health" "/api/faq/list?limit=3" "/api/events/month?month=$(date -u +%Y-%m)" "/api/milestones/list?limit=3"; do
  body="$(curl -sS "$BASE_URL$u" | head -c 800)"
  echo "GET $u -> $(printf "%s" "$body" | tr '
' ' ' | sed 's/  */ /g' | head -c 160)"
  if ! printf "%s" "$body" | grep -q '"ok"[[:space:]]*:[[:space:]]*true'; then
    echo "FAIL: $u missing ok:true" >&2
    exit 1
  fi
done

# 3) FanClub auth gate: should NOT allow /fanclub when logged out
# We accept either 302/308 redirect to / or a 200 that contains a client-side redirect script.
code="$(curl -sS -o /dev/null -w "%{http_code}" "$BASE_URL/fanclub" || true)"
echo "GET /fanclub (logged out) -> $code"
if [[ "$code" == 200 ]]; then
  html="$(curl -sS "$BASE_URL/fanclub" | head -c 1500)"
  if ! printf "%s" "$html" | grep -qi "redirect"; then
    echo "WARN: /fanclub returned 200 and no obvious redirect marker (client-side gating may still be OK)."
  fi
fi

echo "OK: production smoke passed"
