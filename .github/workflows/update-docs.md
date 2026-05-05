---
name: Auto-Sync Documentation
on:
  push:
    branches:
      - main
    paths:
      - 'src/app/**'
      - 'src/components/**'
      - 'src/lib/**'
permissions:
  contents: read
  pull-requests: read
engine: copilot
safe-outputs:
  create-pull-request:
    max: 1
---

# Goal
Your goal is to keep the project documentation up to date with the codebase.

# Instructions
1. Analyze the `src/app/`, `src/components/`, and `src/lib/` folders.
2. If the folder structure has changed, use the `create-pull-request` tool to update the README.md.
