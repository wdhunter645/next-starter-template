#!/usr/bin/env bash
set -euo pipefail
echo "[+] GitHub login guard starting..."

# kill injected tokens in THIS shell
unset GITHUB_TOKEN || true
unset GH_TOKEN || true

# pull PAT from env/secret or prompt
TOKEN="${GH_PAT:-}"
[[ -z "${TOKEN}" && -r /run/secrets/GH_PAT ]] && TOKEN="$(cat /run/secrets/GH_PAT)"
if [[ -z "${TOKEN:-}" ]]; then
  printf "Paste your GitHub PAT (ghp_…): " >&2
  IFS= read -rs TOKEN; echo >&2
fi

# auth and verify
printf "%s" "$TOKEN" | gh auth login --hostname github.com --with-token >/dev/null
gh auth status -h github.com >/dev/null || { echo "[!] Login failed"; exit 1; }

# git creds + no GPG signing
git config --global credential.helper "!gh auth git-credential"
git config --global commit.gpgsign false
git config --global user.name  "wdhunter645"
git config --global user.email "LouGehrigFanClub@gmail.com"

echo "[+] GitHub login verified and Git configured."
