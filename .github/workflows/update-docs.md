---
name: Auto-Sync Documentation
on:
  push:
    branches:
      - main
    paths:
      - 'components/**'
      - 'app/**'
permissions:
  contents: write
  pull-requests: write
# Corrected: 'agent' now lives inside the engine/sandbox config
engine:
  name: github-copilot
# Corrected: 'tools' must be an object (key: value), not a list
tools:
  read-files: {}
  create-pull-request: {}
---

# Goal
Your goal is to keep the project documentation up to date with the codebase.
... (rest of your instructions)


# Instructions
1. Scan the `components/`, `app/`, and `lib/` directories for any new files or structural changes.
2. Read the `README.md` in the root directory.
3. If the "Project Structure" or "Components" section in the README is outdated, rewrite those sections to reflect the current state of the repository.
4. If significant logic has changed in the Next.js `app/` router, update the "Routing" section of the docs.
5. Do not change the styling or the "Getting Started" section unless the installation steps have changed.

# Output
If changes are needed, use the `create-pull-request` tool to submit a PR titled "docs: automated architecture sync".
