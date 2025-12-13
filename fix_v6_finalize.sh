#!/usr/bin/env bash
# fix_v6_finalize.sh — one-pass fixer for remaining v6 alignment items
set -euo pipefail

BRANCH="fix/v6-finalize-v6-verify"
OUTDIR="audits"
STAMP="$(date -u +%Y%m%d_%H%M%S)"
REPORT="$OUTDIR/verify_fix_${STAMP}.txt"

ensure_branch() {
  git rev-parse --is-inside-work-tree >/dev/null 2>&1 || { echo "Not a git repo. Abort."; exit 1; }
  git switch -c "$BRANCH" 2>/dev/null || git switch "$BRANCH"
}

ensure_paths() {
  [[ -f "src/app/globals.css" ]] || { echo "Missing src/app/globals.css"; exit 1; }
  [[ -f "src/app/page.tsx" ]] || { echo "Missing src/app/page.tsx"; exit 1; }
  mkdir -p "$OUTDIR"
}

patch_globals_css() {
  local css="src/app/globals.css"
  if ! grep -qE '^\s*:root\s*\{[^}]*--lgfc-blue\s*:' "$css"; then
    cat >>"$css" <<'CSS'

/* ==== LGFC V6 tokens & helpers (do not remove) ==== */
:root {
  --lgfc-blue:#0033cc;
  --section-gap:2.5rem;
}
.section-gap { margin-block: var(--section-gap); }
.title-lgfc { color: var(--lgfc-blue); text-align:center; font-weight:700; }
.joinBanner { background: var(--lgfc-blue); color:#fff; border-radius:14px; padding:20px; }
.topWhitespace { height:72px; }
/* ==== /LGFC V6 tokens & helpers ==== */
CSS
  fi
}

add_class() {
  local file="$1" find_re="$2" add="$3"
  perl -0777 -i -pe '
    my $add = $ARGV[0];
    s/(className\s*=\s*")([^"]*)(")/$1 . (index($2, $add)>=0 ? $2 : ($2=~s/\s+$//r) ." $add") . $3/ge
  ' "$add" "$file" 2>/dev/null || true
}

wrap_with_section_gap() {
  local file="$1" heading_re="$2"
  awk -v HRE="$heading_re" '
    function ltrim(s){sub(/^[ \t\r\n]+/, "", s); return s}
    function is_gap_line(s){ return s ~ /<div[^>]*className=["'\''][^"'\''>]*section-gap[^"'\''>]*["'\''][^>]*>\s*$/ }
    {
      buf[NR]=$0
      lines[NR]=$0
    }
    END{
      for(i=1;i<=NR;i++){
        if (lines[i] ~ HRE) {
          p=i-1; while(p>0 && ltrim(lines[p])=="") p--
          if (p<1 || !is_gap_line(lines[p])) {
            print "<div className=\"section-gap\">"
            print lines[i]
            print "</div>"
            next
          }
        }
        print lines[i]
      }
    }
  ' "$file" > "$file.tmp" || true
  [[ -s "$file.tmp" ]] && mv "$file.tmp" "$file" || rm -f "$file.tmp"
}

patch_page_tsx() {
  local f="src/app/page.tsx"
  perl -0777 -i -pe '
    s/Become\s+.*?more\./Become a member\. Get access to the Gehrig library, media archive, memorabilia archive, group discussions, and more\./s
  ' "$f"

  perl -0777 -i -pe '
    s/(<div[^>]*className\s*=\s*")([^"]*)("([^>]*>[^<]*Become a member))/ 
      my $pre=$1; my $cls=$2; my $post=$3;
      $cls =~ m\/\\bjoinBanner\\b\/ or $cls = $cls . " joinBanner";
      $cls =~ m\/\\bsection-gap\\b\/ or $cls = $cls . " section-gap";
      $pre . $cls . $post
    /sge
  ' "$f"

  wrap_with_section_gap "$f" "Weekly Photo Matchup"
  wrap_with_section_gap "$f" "Social Wall"
  wrap_with_section_gap "$f" "FAQ"
  wrap_with_section_gap "$f" "Milestones"
  add_class "$f" "Weekly Photo Matchup" "section-gap"
}

write_verifier() {
cat > "$OUTDIR/verify_v6_lock.sh" <<'EOF'
#!/usr/bin/env bash
set -euo pipefail
OUTDIR="audits"
STAMP="$(date -u +%Y%m%d_%H%M%S)"
REPORT="$OUTDIR/verify_v6_lock_${STAMP}.txt"
mkdir -p "$OUTDIR"

echo "LGFC V6 Lock Verification" | tee "$REPORT"
echo "Timestamp: $(date -u +%Y%m%d_%H%M%S)" | tee -a "$REPORT"
echo "Repo: $(basename "$(pwd)")" | tee -a "$REPORT"
echo "==================================================================" | tee -a "$REPORT"

echo -e "\nChecking anchor docs exist (process/governance/v6 HTML)" | tee -a "$REPORT"
for f in docs/website-PR-process.md docs/website-PR-governance.md docs/lgfc-homepage-legacy-v6.html; do
  if [[ -f "$f" ]]; then echo "PASS | Found anchor: $f" | tee -a "$REPORT"; else echo "FAIL | Missing anchor: $f" | tee -a "$REPORT"; FAIL=1; fi
done

echo -e "\n== GLOBALS.CSS CHECK ==" | tee -a "$REPORT"
CSS="src/app/globals.css"
if [[ -f "$CSS" ]]; then
  grep -E -n "^\s*:root\s*\{[^}]*--lgfc-blue\s*:\s*#0033cc" "$CSS" >/dev/null && echo "[CHECK] :root --lgfc-blue OK" | tee -a "$REPORT" || echo "[CHECK] :root --lgfc-blue FAIL" | tee -a "$REPORT"
  grep -E -n "\.section-gap\s*\{\s*margin-block:\s*var\(--section-gap\)" "$CSS" >/dev/null && echo "[CHECK] .section-gap OK" | tee -a "$REPORT" || echo "[CHECK] .section-gap FAIL" | tee -a "$REPORT"
  grep -E -n "\.title-lgfc\s*\{[^}]*text-align\s*:\s*center" "$CSS" >/dev/null && echo "[CHECK] .title-lgfc (center) OK" | tee -a "$REPORT" || echo "[CHECK] .title-lgfc (center) FAIL" | tee -a "$REPORT"
  grep -E -n "\.joinBanner\s*\{[^}]*background\s*:\s*var\(--lgfc-blue\)" "$CSS" >/dev/null && echo "[CHECK] .joinBanner background OK" | tee -a "$REPORT" || echo "[CHECK] .joinBanner background FAIL" | tee -a "$REPORT"
  grep -E -n "\.topWhitespace\s*\{\s*height\s*:\s*72px" "$CSS" >/dev/null && echo "[CHECK] .topWhitespace height OK" | tee -a "$REPORT" || echo "[CHECK] .topWhitespace height FAIL" | tee -a "$REPORT"
else
  echo "FAIL | Missing $CSS" | tee -a "$REPORT"
fi

echo -e "\n== HEADER.TSX CHECK ==" | tee -a "$REPORT"
HDR="src/components/Header.tsx"
if [[ -f "$HDR" ]]; then
  ! grep -Eq "position\s*:\s*sticky" "$HDR" && echo "[CHECK] no sticky OK" | tee -a "$REPORT" || echo "[CHECK] sticky found FAIL" | tee -a "$REPORT"
  grep -Eq "position\s*:\s*absolute.*top\s*:\s*12px.*left\s*:\s*16px" "$HDR" && echo "[CHECK] logo abs pos OK" | tee -a "$REPORT" || echo "[CHECK] logo abs pos FAIL" | tee -a "$REPORT"
  grep -Eq "position\s*:\s*absolute.*top\s*:\s*12px.*right\s*:\s*16px" "$HDR" && echo "[CHECK] hamburger abs pos OK" | tee -a "$REPORT" || echo "[CHECK] hamburger abs pos FAIL" | tee -a "$REPORT"
  grep -Eq "<div[^>]*className\s*=\s*\"[^\"]*\btopWhitespace\b" "$HDR" && echo "[CHECK] topWhitespace div OK" | tee -a "$REPORT" || echo "[CHECK] topWhitespace div FAIL" | tee -a "$REPORT"
else
  echo "FAIL | Missing $HDR" | tee -a "$REPORT"
fi

echo -e "\n== WEEKLYMATCHUP.TSX CHECK ==" | tee -a "$REPORT"
WM="src/components/WeeklyMatchup.tsx"
if [[ -f "$WM" ]]; then
  grep -Eq "<h2[^>]*className\s*=\s*\"[^\"]*\btitle-lgfc\b[^\"]*\"\s*>Weekly Photo Matchup\. Vote for your favorite!</h2>" "$WM" \
    && echo "[CHECK] Weekly title exact + class OK" | tee -a "$REPORT" || echo "[CHECK] Weekly title exact + class FAIL" | tee -a "$REPORT"
else
  echo "FAIL | Missing $WM" | tee -a "$REPORT"
fi

echo -e "\n== PAGE.TSX CHECK ==" | tee -a "$REPORT"
PAGE="src/app/page.tsx"
if [[ -f "$PAGE" ]]; then
  COUNT=$(grep -o "\bsection-gap\b" "$PAGE" | wc -l | tr -d " ")
  if [[ "$COUNT" -ge 5 ]]; then echo "[CHECK] page.tsx section-gap wrappers (>=5) OK ($COUNT found)" | tee -a "$REPORT"; else echo "[CHECK] page.tsx section-gap wrappers FAIL ($COUNT found)" | tee -a "$REPORT"; fi

  grep -Eq "className\s*=\s*\"[^\"]*\bjoinBanner\b[^\"]*\bsection-gap\b[^\"]*\"" "$PAGE" \
    && echo "[CHECK] joinBanner + section-gap present OK" | tee -a "$REPORT" || echo "[CHECK] joinBanner + section-gap present FAIL" | tee -a "$REPORT"

  grep -Fq "Become a member. Get access to the Gehrig library, media archive, memorabilia archive, group discussions, and more." "$PAGE" \
    && echo "[CHECK] Join banner exact copy OK" | tee -a "$REPORT" || echo "[CHECK] Join banner exact copy FAIL" | tee -a "$REPORT"

  grep -Eq "<div[^>]*className\s*=\s*\"[^\"]*\belfsight-app-[A-F0-9-]{36}\b" "$PAGE" \
    && echo "[CHECK] elfsight placeholder present OK" | tee -a "$REPORT" || echo "[CHECK] elfsight placeholder present FAIL" | tee -a "$REPORT"
else
  echo "FAIL | Missing $PAGE" | tee -a "$REPORT"
fi

echo -e "\nReport written to: $REPORT"
EOF
chmod +x "$OUTDIR/verify_v6_lock.sh"
}

run_verifier() {
  bash "$OUTDIR/verify_v6_lock.sh" | tee "$REPORT"
}

git_stage_and_note() {
  git add -A
  git commit -m "fix(home): finalize v6 lock — restore CSS tokens, enforce Join banner copy/classes, add .section-gap wrappers; add verifier report"
  echo "Branch: $BRANCH"
  echo "Report: $REPORT"
  echo "Next: open a PR targeting main."
}

main() {
  ensure_branch
  ensure_paths
  patch_globals_css
  patch_page_tsx
  write_verifier
  run_verifier
  git_stage_and_note
}

main "$@"
