#!/usr/bin/env bash
# Verifies canonical hash baseline file matches current.

set +u
ROOT="${1:-.}"
LIST="$ROOT/docs/reference/design/.canonical-files.txt"
BASE="$ROOT/docs/reference/design/.canonical-hashes.sha256"

if [ ! -f "$LIST" ]; then
  echo "Missing canonical file list: $LIST"
  exit 1
fi
if [ ! -f "$BASE" ]; then
  echo "Missing canonical hash baseline: $BASE"
  echo "Run: scripts/ci/docs_canonical_hashes_generate.sh"
  exit 1
fi

tmp="$(mktemp)"
while IFS= read -r f; do
  [ -z "$f" ] && continue
  [ ! -f "$ROOT/$f" ] && { echo "Missing canonical file: $f"; exit 1; }
  sha256sum "$ROOT/$f" >> "$tmp"
done < "$LIST"

sort "$tmp" | diff -u "$BASE" - || {
  echo "Canonical drift detected. If intentional, regenerate baseline:"
  echo "  ./scripts/ci/docs_canonical_hashes_generate.sh"
  rm -f "$tmp"
  exit 1
}

rm -f "$tmp"
echo "Canonical drift check PASSED."
