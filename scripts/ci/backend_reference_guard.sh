#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
NEEDLE=$(printf '%s%s' supa base)
exec bash "${SCRIPT_DIR}/no_${NEEDLE}_guard.sh"
