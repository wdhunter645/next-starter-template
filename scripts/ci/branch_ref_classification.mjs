#!/usr/bin/env node

// Shared branch-ref classification, so `delivery_profile.mjs` and
// `issue_pr_contract_validate.mjs` (#2622) do not each maintain their own
// divergent `component/**`/`sandbox/**` regex. Both non-Production
// environment targets recognized by the progressive-admission design
// (docs/governance/DELIVERY-AND-RELEASE.md) live here as the single source
// of truth for "is this ref shaped like an authorized component/sandbox
// branch," independent of any caller's additional rules (main-boundary,
// head/base identity, etc.).

export function isComponentRef(ref) {
  return /^component\/[^/].*/.test(String(ref || ''));
}

export function isSandboxRef(ref) {
  return /^sandbox\/[^/].*/.test(String(ref || ''));
}

export function isComponentOrSandboxRef(ref) {
  return isComponentRef(ref) || isSandboxRef(ref);
}
