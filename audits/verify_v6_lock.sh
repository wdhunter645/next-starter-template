#!/usr/bin/env bash
set -euo pipefail
<<<<<<< HEAD
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
=======
mkdir -p audits

REPORT="audits/verify_v6_lock_$(date +%Y%m%d_%H%M%S).txt"
{
  echo "LGFC V6 Lock Verification"
  echo "Timestamp: $(date +%Y%m%d_%H%M%S)"
  echo "Repo: $(basename "$(pwd)")"
  echo "==========================================="
  echo
  echo "Checking anchor docs exist (process/governance/v6 HTML)"
  echo "-------------------------------------------"

  FAIL=0
  for f in docs/website-PR-process.md docs/website-PR-governance.md docs/lgfc-homepage-legacy-v6.html; do
    if [[ -f "$f" ]]; then
      echo "PASS | Found anchor: $f"
    else
      echo "FAIL | Missing anchor: $f"
      FAIL=1
    fi
  done

  echo
  if [[ $FAIL -eq 0 ]]; then
    echo "✅ All required anchors found."
  else
    echo "❌ Aborting: required anchors missing."
  fi
} | tee "$REPORT"
>>>>>>> 2c12d41 (elfsight installation)
