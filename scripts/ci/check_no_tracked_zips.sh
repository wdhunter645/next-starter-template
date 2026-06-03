#!/usr/bin/env bash
set -euo pipefail

echo "Checking for tracked ZIP files..."
ZIP_FILES="$(git ls-files '*.zip' '*.ZIP' || true)"

if [[ -n "${ZIP_FILES}" ]]; then
  echo "ERROR: ZIP files are not allowed to be committed to this repository."
  echo ""
  echo "The following ZIP files were found:"
  echo "${ZIP_FILES}"
  echo ""
  echo "ZIP files are for transport only and must be deleted before merge."
  echo "Remove them with: git rm <filename> && git commit -m 'Remove ZIP artifact'"
  exit 1
fi

echo "OK: No tracked ZIP files found."
