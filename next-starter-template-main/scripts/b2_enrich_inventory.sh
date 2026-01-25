#!/usr/bin/env bash
set -euo pipefail

IN="${1:-data/b2/inventory.json}"
OUT="${2:-data/b2/inventory_enriched.json}"

if [[ ! -f "${IN}" ]]; then
  echo "ERROR: Input inventory file not found: ${IN}" >&2
  exit 2
fi

IN_FILE="${IN}" OUT_FILE="${OUT}" python3 - <<'PY'
import json, os, sys, re, datetime

inp = os.environ.get("IN_FILE") or "data/b2/inventory.json"
outp = os.environ.get("OUT_FILE") or "data/b2/inventory_enriched.json"
with open(inp, "r", encoding="utf-8") as f:
    data = json.load(f)

objects = data.get("objects") or []
stamp = datetime.datetime.utcnow().strftime("%Y%m%dT%H%M%SZ")

def classify_type(key: str) -> str:
    k = key.lower()
    if any(tok in k for tok in ["memorabilia", "card", "ticket", "program", "stub", "autograph", "jersey", "bat", "scorecard", "poster"]):
        return "memorabilia"
    return "photo"

def classify_source(key: str) -> str:
    k = key.lower()
    if "private" in k:
        return "private"
    if "public" in k:
        return "public"
    return "unknown"

enriched = []
for o in objects:
    key = o.get("key") or o.get("Key") or ""
    o2 = dict(o)
    o2["key"] = key
    o2["era"] = "pre-1939"
    o2["type"] = classify_type(key)
    o2["source"] = classify_source(key)
    # keep url if already present
    if "url" not in o2:
        o2["url"] = None
    enriched.append(o2)

out = {
    "generated_at": stamp,
    "input": os.path.basename(inp),
    "objects": enriched
}

with open(outp, "w", encoding="utf-8") as f:
    json.dump(out, f, ensure_ascii=False)

print(f"✓ Enriched {len(enriched)} objects -> {outp}")
PY
