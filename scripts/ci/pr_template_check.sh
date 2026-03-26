#!/usr/bin/env bash

PR_BODY_FILE=".pr_body_check.txt"

if [ -z "$PR_BODY" ]; then
  echo "ERROR: PR_BODY not provided"
  exit 1
fi

echo "$PR_BODY" > $PR_BODY_FILE

REQUIRED_SECTIONS=(
  "ZIP SAFETY"
  "DESIGN SOURCE OF TRUTH"
  "FILE-TOUCH ALLOWLIST"
  "REQUIRED PRE-REVIEW SELF-CHECK"
)

FAIL=0

for section in "${REQUIRED_SECTIONS[@]}"; do
  if ! grep -q "$section" "$PR_BODY_FILE"; then
    echo "Missing required section: $section"
    FAIL=1
  fi
done

if [ $FAIL -eq 1 ]; then
  echo "PR TEMPLATE CHECK FAILED"
  exit 1
fi

echo "PR TEMPLATE CHECK PASSED"
exit 0
