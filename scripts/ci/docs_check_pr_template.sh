#!/usr/bin/env bash

ROOT="${1:-.}"
EVENT_PATH="${GITHUB_EVENT_PATH:-}"
PR_BODY=""

if [ -n "$EVENT_PATH" ] && [ -f "$EVENT_PATH" ]; then
  PR_BODY="$(python3 - <<'PY'
import json, os
path = os.environ.get("GITHUB_EVENT_PATH", "")
body = ""
if path and os.path.isfile(path):
    with open(path, "r", encoding="utf-8") as f:
        data = json.load(f)
    body = (((data.get("pull_request") or {}).get("body")) or "")
print(body)
PY
)"
fi

if [ -z "$PR_BODY" ]; then
  echo "SKIP: pull_request body not available in this environment"
  exit 0
fi

required_sections=(
  "## MANDATORY FIRST STEP (ZIP SAFETY)"
  "## DESIGN SOURCE OF TRUTH (NON-NEGOTIABLE)"
  "## FILE-TOUCH ALLOWLIST (MANDATORY)"
  "## VISUAL / UX INVARIANTS (MANDATORY)"
  "## REQUIRED PRE-REVIEW SELF-CHECK"
  "Allowed files:"
)

missing=0

for section in "${required_sections[@]}"; do
  if ! printf '%s\n' "$PR_BODY" | grep -Fq "$section"; then
    echo "MISSING: $section"
    missing=1
  fi
done

if ! printf '%s\n' "$PR_BODY" | grep -Eq '^\- \[x\] (No ZIP file exists in the repo root|No ZIP found in repo root|Any ZIP file present in the repo root was deleted before any other change)$'; then
  echo "MISSING: ZIP safety confirmation"
  missing=1
fi

if [ "$missing" -ne 0 ]; then
  echo "FAIL: PR template requirements not met"
  exit 1
fi

echo "PASS: PR template requirements met"
