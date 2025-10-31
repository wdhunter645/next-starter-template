#!/usr/bin/env bash
# sweep_docs.sh — gather Markdown into docs/ and archive/ (dry-run by default)
set -euo pipefail

DAYS="${DAYS:-120}"                 # stale threshold
CONFIRM="${CONFIRM:-0}"             # set CONFIRM=1 to actually move files
KEEP_ROOT_README="${KEEP_ROOT_README:-1}"  # leave README.md at repo root
NOW_EPOCH="$(date +%s)"

REPO_ROOT="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
cd "$REPO_ROOT"

mkdir -p docs archive

# list tracked .md files (fallback to find if not a git repo)
if git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  mapfile -t FILES < <(git ls-files '*.md')
else
  mapfile -t FILES < <(find . -type f -name '*.md' -print)
fi

skip_path () {
  case "$1" in
    ./docs/*|docs/*|./archive/*|archive/*|.git/*|./.git/*|node_modules/*|./node_modules/*|.github/*|./.github/*)
      return 0 ;;
  esac
  return 1
}

get_last_epoch () {
  local f="$1"
  if git rev-parse --is-inside-work-tree >/dev/null 2>&1 && git ls-files --error-unmatch "$f" >/dev/null 2>&1; then
    local ts
    ts="$(git log -1 --format=%ct -- "$f" 2>/dev/null || echo "")"
    if [[ -n "$ts" ]]; then echo "$ts"; return; fi
  fi
  date -r "$f" +%s 2>/dev/null || stat -f %m "$f" 2>/dev/null || echo "$NOW_EPOCH"
}

is_stale () {
  local f="$1"
  local last_epoch; last_epoch="$(get_last_epoch "$f")"
  local age_days=$(( (NOW_EPOCH - last_epoch) / 86400 ))
  [[ "$age_days" -gt "$DAYS" ]]
}

basename_lc () { echo "$(basename "$1")" | tr '[:upper:]' '[:lower:]'; }

ACTIVE_RE='(guide|spec|plan|design|howto|notes|docs)'
STALE_RE='(old|deprecated|backup|copy|archive|tmp)'

ACTIVE_LIST=()
ARCHIVE_LIST=()

for f in "${FILES[@]}"; do
  f="${f#./}"
  if skip_path "$f"; then continue; fi
  if [[ "$KEEP_ROOT_README" = "1" && "$f" = "README.md" ]]; then
    continue
  fi
  name_lc="$(basename_lc "$f")"
  if [[ "$name_lc" =~ $STALE_RE ]]; then
    ARCHIVE_LIST+=("$f"); continue
  fi
  if [[ "$name_lc" =~ $ACTIVE_RE ]]; then
    ACTIVE_LIST+=("$f"); continue
  fi
  if is_stale "$f"; then
    ARCHIVE_LIST+=("$f")
  else
    ACTIVE_LIST+=("$f")
  fi
done

echo "=== Sweep plan (dry-run=${CONFIRM}, stale>${DAYS}d) ==="
echo "--- To docs/ (${#ACTIVE_LIST[@]} files) ---"
printf '  - %s\n' "${ACTIVE_LIST[@]}" 2>/dev/null || true
echo "--- To archive/ (${#ARCHIVE_LIST[@]} files) ---"
printf '  - %s\n' "${ARCHIVE_LIST[@]}" 2>/dev/null || true

if [[ "$CONFIRM" != "1" ]]; then
  echo
  echo "Dry-run complete. To execute moves:"
  echo "  CONFIRM=1 ./scripts/sweep_docs.sh"
  exit 0
fi

shopt -s nullglob

move_file () {
  local src="$1" dest_dir="$2"
  local base="$(basename "$src")"
  local target="$dest_dir/$base"
  if [[ -e "$target" ]]; then
    local shorthash
    if git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
      shorthash="$(git hash-object "$src" | cut -c1-7)"
    else
      shorthash="$(cksum < "$src" | awk '{print $1}' | cut -c1-7)"
    fi
    target="$dest_dir/${shorthash}__$base"
  fi
  git mv "$src" "$target" 2>/dev/null || mv "$src" "$target"
}

for f in "${ACTIVE_LIST[@]}";   do move_file "$f" "docs";    done
for f in "${ARCHIVE_LIST[@]}";  do move_file "$f" "archive"; done

{
  echo "# Documentation Index"
  echo
  echo "## Active (docs/)"
  for p in docs/*.md; do
    [[ -e "$p" ]] || continue
    t="$(head -n 1 "$p" | sed 's/^#\s*//;s/\r//')"
    echo "- [$(basename "$p")]($p)${t:+ — $t}"
  done
  echo
  echo "## Archived (archive/)"
  for p in archive/*.md; do
    [[ -e "$p" ]] || continue
    t="$(head -n 1 "$p" | sed 's/^#\s*//;s/\r//')"
    echo "- [$(basename "$p")]($p)${t:+ — $t}"
  done
} > docs/INDEX.md

echo "=== Done. Created docs/INDEX.md and moved files. ==="
