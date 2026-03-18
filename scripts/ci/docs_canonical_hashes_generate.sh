#!/usr/bin/env bash
# Generates canonical hash baseline file.
# Canonical file entries are resolved relative to the list file directory.

set +u
ROOT="${1:-.}"
LIST="$ROOT/docs/reference/design/.canonical-files.txt"
OUT="$ROOT/docs/reference/design/.canonical-hashes.sha256"
LIST_DIR="$(dirname "$LIST")"

if [ ! -f "$LIST" ]; then
  echo "Missing canonical file list: $LIST"
  exit 1
fi

TMP="$(mktemp)"
cleanup() {
  rm -f "$TMP"
}
trap cleanup EXIT

while IFS= read -r f; do
  [ -z "$f" ] && continue

  FILE_PATH="$LIST_DIR/$f"
  if [ ! -f "$FILE_PATH" ]; then
    echo "Missing canonical file: $FILE_PATH"
    exit 1
  fi

  HASH_LINE="$(sha256sum "$FILE_PATH")"
  HASH="${HASH_LINE%% *}"
  printf '%s  %s\n' "$HASH" "$f" >> "$TMP"
done < "$LIST"

sort "$TMP" > "$OUT"

echo "Wrote: $OUT"
