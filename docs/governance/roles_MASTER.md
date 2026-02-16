# Governance — Roles

Status: _MASTER (Operations authoritative)
Last Updated: 2026-02-05

## Purpose
Define who owns decisions, who executes changes, and who verifies outcomes so operational responsibility is unambiguous.

## Roles (Day-2)
### Operations (Owner of _MASTER)
- Owns production stability.
- Owns incident response.
- Owns `_MASTER` documentation accuracy.
- Blocks merges that violate governance.

### Project (Owner of _DRAFT and _INCOMPLETE)
- Owns future direction and feature planning.
- Produces drafts and incomplete docs that may later mature.

### Automation / Agents
- Execute only what is explicitly specified.
- Must follow file-touch allowlists.
- Must not “helpfully refactor” beyond scope.

## Ownership model
- `_MASTER` = Operations-owned, authoritative.
- `_INCOMPLETE` = Project-owned, reference.
- `_DRAFT` = Project-owned, intent.

See `/docs/governance/document-status-and-naming_MASTER.md`.

## Responsibility boundaries
Operations will not:
- Accept unbounded PR scope.
- Accept changes without verification steps.
- Accept changes that contradict design authority.

Project will not:
- Treat `_DRAFT/_INCOMPLETE` as production truth during incidents.

## Handoff rule
A document becomes `_MASTER` only when:
- Behavior is stable in production.
- Verification and rollback steps are defined.
- Ownership explicitly transfers to Operations.

Governance — Modes

Status: _MASTER (Operations authoritative) Last Updated: 2026-02-05

Purpose

Define the operating modes used to prevent drift and keep work deterministic across sessions and tools.

Modes (authoritative definitions)

Control

Decision-making, scope lock, governance compliance, risk management.
Output: instructions, checklists, acceptance criteria, verification steps.
Execute

Making the change (code/docs/config edits) within an approved scope.
Output: exact file edits (diff-ready), commands, and replacement content.
Verify

Proving the change works and does not regress invariants.
Output: validation commands, observed results, and pass/fail calls.
Mode-switch rule

Mode switches must be explicit in the record (PR description or repo docs). Operations assumes:

Control → Execute → Verify
Repeat as needed until stable
Anti-drift rules

No Execute work without a scope lock.
No Verify claims without explicit evidence.
No “background work” or implied completion.
Day-2 Operations expectation

When in doubt:

Stay in Control until the exact change is defined and bounded.
