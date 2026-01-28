# PR Intent Labels — Canonical Set

**Status:** AUTHORITATIVE  
**Effective Date:** 2026-01-28  
**Purpose:** Define the canonical PR intent label model for repository governance

---

## Overview

All pull requests to this repository MUST have exactly ONE intent label applied. The intent label determines:
1. Which files the PR is allowed to modify (via allowlist)
2. How the PR is routed for review
3. Which CI validations apply

**Enforcement:** The `drift-gate` workflow validates that:
- PR has exactly ONE intent label
- All changed files match the intent's allowlist
- PRs cannot merge if validation fails

---

## Canonical Intent Labels

### 1. infra
**Purpose:** Infrastructure, CI/CD, build configuration, and tooling

**Allowed paths:**
- `.github/**` (workflows, actions, templates)
- `scripts/**` (all scripts except application code)
- Build configuration files (`package.json`, `next.config.ts`, `wrangler.toml`, etc.)
- Editor/formatter configuration (`.prettierrc`, `.editorconfig`, etc.)
- Node version files (`.node-version`, `.nvmrc`, `.npmrc`)

**Denied paths:**
- (None - but practically limited to allowed paths)

**Use cases:**
- GitHub Actions workflow changes
- CI/CD pipeline updates
- Build configuration modifications
- Script additions/updates
- Dependency version updates (infrastructure tools)

---

### 2. feature
**Purpose:** Application features, UI components, API endpoints, business logic

**Allowed paths:**
- `src/**` (all application source code)
- `functions/**` (Cloudflare Pages Functions / API endpoints)
- `migrations/**` (database schema changes)
- `public/**` (static assets)
- `reports/**` (generated reports)
- `scripts/assess.mjs`, `scripts/lib/**` (assessment tooling)
- `package.json`, `package-lock.json` (application dependencies)

**Denied paths:**
- `.github/workflows/**` (use `infra` instead)
- `.github/CODEOWNERS` (use `infra` instead)
- `docs/**` (use `docs-only` instead)

**Use cases:**
- New UI components
- API endpoint implementation
- Business logic changes
- Database migrations
- Static asset additions
- Application dependency updates

---

### 3. docs-only
**Purpose:** Documentation changes only, no code modifications

**Allowed paths:**
- `docs/**` (all documentation files)
- `Agent.md` (agent instructions)
- `active_tasklist.md` (task tracking)

**Denied paths:**
- (None - limited to allowed paths only)

**Use cases:**
- Documentation updates
- README changes
- Architecture documentation
- Process documentation
- Agent instruction updates

**Important:** If a PR touches BOTH docs AND code, it MUST be split into separate PRs.

---

### 4. platform
**Purpose:** Cloudflare-specific runtime configuration only

**Allowed paths:**
- `wrangler.toml` (Cloudflare Workers/Pages configuration)
- `functions/**` (Cloudflare Pages Functions)

**Denied paths:**
- (None - but strictly limited to allowed paths)

**Use cases:**
- Cloudflare Pages configuration changes
- Environment variable bindings (D1, KV, R2)
- Runtime compatibility settings
- Edge function implementations

**Important:** 
- If a PR touches BOTH `wrangler.toml` AND `src/**`, it MUST be split into two PRs
- Platform changes should not include documentation updates (split into separate docs-only PR)

**Special validation:**
If a PR touches both `wrangler.toml` and `functions/**`, the drift-gate workflow will recommend using the `platform` label.

---

### 5. change-ops
**Purpose:** Operational changes including database operations, data migrations, operational scripts

**Allowed paths:**
- `migrations/**` (database migrations)
- `scripts/d1-*` (D1 database scripts)
- `scripts/b2-*` (Backblaze B2 backup scripts)
- `scripts/ci/**` (CI operational scripts)
- `data/**` (data files)
- `wrangler.toml` (when related to database bindings)

**Denied paths:**
- `src/**` (use `feature` instead)
- `docs/**` (use `docs-only` instead)
- `.github/workflows/**` (use `infra` instead)

**Use cases:**
- Database migration files
- Data seeding scripts
- Backup/restore scripts
- Database binding configuration
- Operational automation scripts
- Data import/export tools

**Important:** 
- For migrations that require UI changes, split into:
  - PR #1: `change-ops` intent (migration files only)
  - PR #2: `feature` intent (UI changes to use new schema)

---

### 6. codex
**Purpose:** AI/agent configuration, code generation tooling, copilot instructions

**Allowed paths:**
- `.github/copilot-instructions.md` (GitHub Copilot configuration)
- `.github/agents/**` (agent-specific configurations)
- `Agent.md` (general agent instructions)
- `context.md` (agent context)
- `docs/**` (when related to agent/codex documentation)
- `scripts/ci/**` (when related to agent/codex automation)

**Denied paths:**
- `src/**` (use `feature` instead)
- `functions/**` (use `feature` or `platform` instead)

**Use cases:**
- GitHub Copilot instruction updates
- Agent configuration changes
- Code generation template updates
- AI tooling integration
- Agent context documentation

**Important:**
- This label is for tooling/configuration that enables AI-assisted development
- Not for actual application code changes (use `feature` instead)

---

### 7. recovery
**Purpose:** Emergency fixes that may touch multiple areas (break-glass only)

**Allowed paths:**
- ALL PATHS (unrestricted)

**Denied paths:**
- (None - this is a break-glass intent)

**Use cases:**
- Emergency production fixes
- Critical security patches
- Rollback commits
- Cross-cutting emergency changes

**Important:**
- This label is NOT auto-assigned
- MUST be manually applied by repository maintainers
- Should be rare - prefer splitting into focused PRs when possible
- Requires explicit authorization for use

---

## Legacy Labels (Deprecated)

The following labels are **RETIRED** for pull requests and should only be used for issues (if at all):

- `bug` — Use appropriate intent label instead (`feature`, `infra`, etc.) based on file-touch
- `enhancement` — Use `feature` intent for enhancements
- `question` — Use GitHub Discussions instead
- `help wanted` — Issues-only label
- `good first issue` — Issues-only label
- `duplicate` — Issues-only label
- `invalid` — Issues-only label
- `wontfix` — Issues-only label

**Migration guidance:**
- Existing PRs with legacy labels: Apply appropriate intent label before merge
- New PRs: Must use canonical intent labels from day one
- Issues: May continue using legacy labels if desired (not enforced)

---

## Intent Selection Rules

### Deterministic Selection (for agents/automation)

1. **Check docs-only first:**
   - If ALL changed files match `docs/**`, `Agent.md`, or `active_tasklist.md` → `docs-only`

2. **Check infra:**
   - If ALL changed files match `.github/**`, `scripts/**`, or config files → `infra`

3. **Check platform:**
   - If ALL changed files match `wrangler.toml` or `functions/**` → `platform`

4. **Check feature:**
   - If ALL changed files match `src/**`, `functions/**`, `migrations/**`, `public/**` → `feature`

5. **Check change-ops:**
   - If ALL changed files match `migrations/**`, `scripts/d1-*`, `scripts/b2-*`, etc. → `change-ops`

6. **Check codex:**
   - If ALL changed files match `.github/copilot-instructions.md`, `.github/agents/**`, etc. → `codex`

7. **If files span multiple intents:**
   - MUST split PR into separate PRs (one per intent)

### When to Split PRs

**ALWAYS split when file-touch spans intent categories:**
- Platform + Feature → 2 PRs
- Platform + Docs → 2 PRs
- Feature + Docs → 2 PRs
- Infra + Docs → 2 PRs
- Change-ops + Feature → 2 PRs
- Codex + Feature → 2 PRs

**Exception:** Use `recovery` intent for emergency break-glass situations (manual assignment only)

---

## CI Enforcement

### Automated Labeling

The `intent-labeler.yml` workflow automatically:
1. Analyzes changed files in PR
2. Determines matching intent (if any)
3. Applies appropriate label
4. Posts guidance comment if mixed intent detected

### Drift Gate Validation

The `drift-gate.yml` workflow validates:
1. PR has exactly ONE intent label (from canonical set)
2. All changed files are allowed under that intent
3. No denied paths are modified

**If validation fails:**
- PR cannot merge (blocking check)
- Developer must either:
  - Apply correct intent label, OR
  - Split PR into multiple focused PRs

---

## Configuration Files

### Intent Allowlists

**Primary configuration:**
- `scripts/ci/pr_intent_allowlists.json` — Used by drift-gate validation
- `.github/intent-labeler.json` — Used by intent-labeler workflow

Both files MUST stay synchronized. Changes to intent definitions require updating both files.

### Validation Scripts

- `scripts/ci/verify_pr_intent_allowlist.mjs` — Validates PR against intent allowlist
- `scripts/ci/verify_zip_history_pr.sh` — ZIP taint detection
- `scripts/ci/verify_lgfc_invariants.mjs` — Design invariant validation

---

## Troubleshooting

### Error: "PR must include exactly ONE intent label"

**Cause:** PR has zero or multiple intent labels

**Solution:**
1. Check which labels are applied to PR
2. Remove all intent labels except one
3. Ensure the remaining label matches file-touch pattern

### Error: "File-touch allowlist violation"

**Cause:** PR modifies files not allowed under its intent label

**Solution:**
1. Review which files are changed
2. Either:
   - Apply correct intent label that allows those files, OR
   - Split PR into separate PRs (recommended)

### Mixed Intent Guidance Comment

**Cause:** PR changes files across multiple intent categories

**Solution:**
1. Create separate branches for each intent
2. Split changes across multiple PRs
3. Merge in sequence (e.g., migrations first, then feature using new schema)

---

## References

**Related Documentation:**
- `/.github/platform-intent-and-zip-governance.md` — Platform intent and ZIP policy
- `/.github/CI_GUARDRAILS_MAP.md` — CI workflow reference
- `/docs/website-process.md` — PR process and governance

**Configuration Files:**
- `scripts/ci/pr_intent_allowlists.json` — Intent allowlist definitions
- `.github/intent-labeler.json` — Auto-labeler configuration

**Workflows:**
- `.github/workflows/intent-labeler.yml` — Automatic labeling
- `.github/workflows/drift-gate.yml` — Allowlist enforcement

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-01-28 | Initial canonical label set (infra, feature, docs-only, platform, change-ops, codex, recovery) |

---

**END OF PR INTENT LABELS DOCUMENTATION**
