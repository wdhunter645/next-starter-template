# Governance — Modes

Status: _MASTER (Operations authoritative)
Last Updated: 2026-02-05

## Purpose
Define the operating modes used to prevent drift and keep work deterministic across sessions and tools.

## Modes (authoritative definitions)
### Control
- Decision-making, scope lock, governance compliance, risk management.
- Output: instructions, checklists, acceptance criteria, verification steps.

### Execute
- Making the change (code/docs/config edits) within an approved scope.
- Output: exact file edits (diff-ready), commands, and replacement content.

### Verify
- Proving the change works and does not regress invariants.
- Output: validation commands, observed results, and pass/fail calls.

## Mode-switch rule
Mode switches must be explicit in the record (PR description or repo docs).
Operations assumes:
- Control → Execute → Verify
- Repeat as needed until stable

## Anti-drift rules
- No Execute work without a scope lock.
- No Verify claims without explicit evidence.
- No “background work” or implied completion.

## Day-2 Operations expectation
When in doubt:
- Stay in Control until the exact change is defined and bounded.
