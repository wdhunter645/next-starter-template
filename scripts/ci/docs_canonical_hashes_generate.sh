#!/usr/bin/env bash
# Generates canonical hash baseline file.

set +u
ROOT="${1:-.}"
LIST="$ROOT/docs/reference/design/.canonical-files.txt"
OUT="$ROOT/docs/reference/design/.canonical-hashes.sha256"

if [ ! -f "$LIST" ]; then
  echo "Missing canonical file list: $LIST"
  exit 1
fi

tmp="$(mktemp)"
while IFS= read -r f; do
  [ -z "$f" ] && continue
  [ ! -f "$ROOT/$f" ] && { echo "Missing canonical file: $f"; exit 1; }
  sha256sum "$ROOT/$f" >> "$tmp"
done < "$LIST"

sort "$tmp" > "$OUT"
rm -f "$tmp"

echo "Wrote: $OUT"
