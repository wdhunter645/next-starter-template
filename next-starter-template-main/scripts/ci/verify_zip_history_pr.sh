#!/usr/bin/env bash
set -euo pipefail

BASE_SHA="${GITHUB_BASE_SHA:-}"
HEAD_SHA="${GITHUB_HEAD_SHA:-}"

if [[ -z "${BASE_SHA}" || -z "${HEAD_SHA}" ]]; then
  echo "ERROR: Missing GITHUB_BASE_SHA / GITHUB_HEAD_SHA (expected in PR workflow env)."
  exit 1
fi

echo "Checking PR-range history for ZIP paths: ${BASE_SHA}..${HEAD_SHA}"
if git rev-list --objects "${BASE_SHA}..${HEAD_SHA}" | grep -Eim 1 '\.zip$'; then
  echo "ERROR: ZIP file path detected in PR commit range. This introduces ZIPs into history."
  exit 1
fi

echo "OK: No ZIP paths detected in PR-range history."
