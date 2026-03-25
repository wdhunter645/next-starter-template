# CURSOR RULES

## CORE MODEL
- Cursor = file editor
- ChatGPT = planner
- GitHub = control plane

## REQUIRED BEHAVIOR
- Use NEW thread per task
- Follow prompt exactly
- Edit ONLY allowlisted files

## PROHIBITED
- DO NOT run git commands
- DO NOT create branches
- DO NOT create PRs
- DO NOT modify files outside scope

## OUTPUT
- Return completed file edits only
- No commentary
- No partial work

## SUCCESS CONDITION
- Files match PR specification exactly
- No scope drift
