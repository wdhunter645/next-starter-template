---
Doc Type: Template
Audience: Human + AI
Authority Level: Operational
Owns: Copy-ready GitHub issue body for controlled AI execution bridge (`ai-build`) tasks
Does Not Own: Bridge validation logic, workflow behavior, or merge approval
Canonical Reference: /docs/how-to/ops/controlled-ai-execution-bridge.md
Last Reviewed: 2026-06-12
---

# AI Build Issue Template

Copy the body below into a new GitHub issue. Replace placeholder text before applying the `ai-build` label.

---

## Approved Task

Describe the exact documentation or governance maintenance task approved for automation.

Example: Update the controlled AI execution bridge how-to with the phase-1 safety model.

## Scope

State what is in scope and what is explicitly out of scope.

Example: Docs and CI bridge files only. No runtime code, secrets, or workflow edits.

## Allowed Files

List one exact repository path per bullet. Do not use broad wildcards.

- docs/how-to/ops/controlled-ai-execution-bridge.md
- docs/templates/ai-build-issue-template.md

## Acceptance Criteria

- [ ] Required sections are complete and accurate.
- [ ] Allowed files match the intended diff only.
- [ ] Validation commands pass locally and in CI.
- [ ] One PR is opened with exactly one source issue line.

## Validation

List exact commands maintainers and agents must run:

- `npm test -- tests/ai-execution-bridge.test.mjs`
- Any additional governance or docs checks required for the touched paths.
