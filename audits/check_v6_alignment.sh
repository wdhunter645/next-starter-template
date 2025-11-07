#!/usr/bin/env bash
set -euo pipefail
OUT="audits/repo_alignment_$(date -u +%Y%m%d_%H%M%SZ).txt"
{
  echo "LGFC V6 Alignment Audit"
  echo "Timestamp: $(date -u +%F_%T)Z"
  echo "Repo: $(basename "$(pwd)")"
  echo "============================================================"

  echo; echo "== 1) globals.css tokens present? =="
  TOKENS=(lgfc-blue section-gap title-lgfc joinBanner topWhitespace)
  for t in "${TOKENS[@]}"; do
    if grep -qE "$t" src/app/globals.css 2>/dev/null; then
      echo "PASS  token: $t"
    else
      echo "FAIL  token: $t (missing)"
    fi
  done

  echo; echo "== 2) Header.tsx non-sticky + absolute logo/menu, with .topWhitespace below =="
  if grep -qE "Header|header" src/components/Header.tsx 2>/dev/null; then
    grep -nE "position:\s*sticky" src/components/Header.tsx && echo "FAIL  sticky found" || echo "PASS  non-sticky"
    (grep -qE "position:\s*absolute" src/components/Header.tsx && grep -qE "top:\s*(1[0-9]|12)" src/components/Header.tsx) \
      && echo "PASS  absolute positions present" || echo "FAIL  absolute positions missing"
  else
    echo "FAIL  src/components/Header.tsx missing"
  fi
  grep -Rqn "topWhitespace" src || echo "FAIL  .topWhitespace not rendered under header"

  echo; echo "== 3) WeeklyMatchup.tsx title text + blue + centered =="
  if grep -qE "Weekly Photo Matchup\. Vote for your favorite!" src/components/WeeklyMatchup.tsx 2>/dev/null; then
    echo "PASS  exact title text"
  else
    echo "FAIL  weekly title text mismatch"
  fi
  grep -qE "title-lgfc" src/components/WeeklyMatchup.tsx && echo "PASS  title-lgfc class" || echo "FAIL  missing title-lgfc class"

  echo; echo "== 4) page.tsx section gaps + join banner exact copy =="
  GAP_TARGETS=(Weekly Join Social FAQ Milestones)
  for f in src/app/page.tsx; do
    if [[ -f "$f" ]]; then
      grep -q "section-gap" "$f" && echo "PASS  section-gap present in $f" || echo "FAIL  section-gap absent in $f"
      if grep -q "Become a member\. Get access to the Gehrig library, media archive, memorabilia archive, group discussions, and more\." "$f"; then
        echo "PASS  join banner exact copy"
      else
        echo "FAIL  join banner copy mismatch"
      fi
    else
      echo "FAIL  $f missing"
    fi
  done
} | tee "$OUT"
echo "WROTE $OUT"
