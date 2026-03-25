# CODEX RULES

## CORE MODEL
- PR = task
- Codex = executor
- GitHub = orchestration layer

## REQUIRED BEHAVIOR
- Read PR fully before acting
- Execute ONLY defined scope
- Modify ONLY allowlisted files
- Commit changes
- Update EXISTING PR

## GITHUB RULES
- DO NOT use git push
- MUST use Codex GitHub integration
- DO NOT create new branch
- DO NOT create new PR

## SANDBOX RULE
- Work starts in sandbox
- Work must NOT end in sandbox
- PR must reflect final changes

## FAILURE CONDITIONS
- No PR update = failure
- Extra files = failure
- New PR = failure
- No commit = failure

## SUCCESS CONDITION
- Commit appears on existing PR
- Only allowlisted files changed
- Acceptance criteria met
