#!/usr/bin/env bash
# scripts/ci/docs_canonical_hashes_generate.sh
# Generates canonical hash baseline file.

set +u
ROOT="${1:-.}"
LIST="$ROOT/docs/reference/design/.canonical-files.txt"
OUT="$ROOT/docs/reference/design/.canonical-hashes.sha256"

if [ ! -f "$LIST" ]; then
  echo "Missing canonical file list: $LIST"
  exit 1
fi

LIST_DIR="$(dirname "$LIST")"
tmp="$(mktemp)"

while IFS= read -r f; do
  [ -z "$f" ] && continue
  (
    cd "$LIST_DIR" || exit 1
    [ ! -f "$f" ] && { echo "Missing canonical file: $f"; exit 1; }
    sha256sum "$f"
  ) >> "$tmp" || {
    rm -f "$tmp"
    exit 1
  }
done < "$LIST"

sort "$tmp" > "$OUT"
rm -f "$tmp"

echo "Wrote: $OUT"
