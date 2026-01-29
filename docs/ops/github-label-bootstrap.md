# GitHub Label Bootstrap (Mandatory)

## Why this exists
Intent labels are repository configuration in GitHub, not files in the repo.
CI workflows and labeler logic assume the labels already exist.

PRs cannot create labels. Missing labels will cause CI failures even when code is correct.

## Canonical intent labels
- change-ops
- feature
- docs-only
- infra
- platform
- codex
- recovery

## Create via GitHub UI
Repository → Issues → Labels → New label (repeat for each intent label)

## Create via GitHub CLI (preferred)
Run from a checked-out repo with `gh` authenticated:

gh label create "change-ops" --color "B60205" --description "Operations, recovery, bug fixes, design realignment; may touch code + as-built docs" --force
gh label create "feature"    --color "1D76DB" --description "Intentional product change: new capabilities or improvements; may touch code + docs" --force
gh label create "docs-only"  --color "0075CA" --description "Docs-only governance/design/standards; no runtime changes" --force
gh label create "infra"      --color "0E8A16" --description "CI/workflows/monitoring/ops tooling; repo plumbing" --force
gh label create "platform"   --color "5319E7" --description "Cloudflare/runtime config only (e.g., wrangler bindings/routes)" --force
gh label create "codex"      --color "FBCA04" --description "Agent/automation control, guardrails, deterministic repo hygiene tooling" --force
gh label create "recovery"   --color "D93F0B" --description "Break-glass recovery / emergency repair intent (broad scope, controlled)" --force
