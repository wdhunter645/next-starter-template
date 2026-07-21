---
Doc Type: How-to
Audience: Human + AI
Authority Level: Procedure
Owns: Single execution path for requesting, acknowledging, responding to, and completing cross-agent collaboration
Does Not Own: Queue priority, source-Issue scope, implementation authority, PR approval, Production authorization, or recovery strategy
Canonical Reference: /docs/governance/WORK-QUEUES-AND-COLLABORATION.md
Related Issues: #2699
Last Reviewed: 2026-07-21
---

# Request Agent Collaboration

## Purpose

Use one collaboration method for Operations, PMO, Engineering, and PR-related work without creating a second source Issue or changing queue ownership.

## Preconditions

Confirm:

- one authoritative source Issue exists;
- the Issue has one current team owner;
- the requesting agent owns or is authorized to act on the current work;
- the requested contribution is bounded;
- the collaborator has the required role or expertise;
- collaboration is not being used to bypass implementation Go, independent review, Project Graduation, or Production authority.

## Step 1 — Post the request on the source Issue

```text
COLLABORATION REQUEST

Source Issue: #<number>
Source team: Operations | PMO | Engineering
Current owner: <agent or role>
Requesting agent / role: <agent and role>
Target agent / role: <agent and role>

Requested contribution:
<exact bounded analysis, evidence, validation, guidance, or review support>

Evidence:
<logs, files, checks, deployment identity, PR number and head SHA, design references, or findings>

Blocking scope:
Blocking current work | Non-blocking | Blocking a later decision only

Authority retained by:
<current owner or controlling role>

Acknowledgment required: Yes

Completion condition:
<specific response required>
```

Do not change the Issue's team or priority namespace.

## Step 2 — Collaborator acknowledges

```text
COLLABORATION ACKNOWLEDGED

Accepted scope:
<bounded contribution>

Evidence received:
<references>

Missing evidence:
None | <specific missing evidence>

Response boundary:
<what the collaborator will and will not decide or perform>
```

The collaborator responds on the same source Issue.

## Step 3 — Collaborator performs bounded work

Permitted examples include:

- design or architecture interpretation;
- technical feasibility evidence;
- repository inspection;
- failure diagnosis;
- acceptance-criteria clarification;
- validation analysis;
- recovery-plan guidance;
- authorized independent PR review.

The collaborator does not take over implementation, branch ownership, queue ownership, approval authority, or Production authority unless a separate explicit handoff or role decision authorizes it.

## Step 4 — Collaborator posts the response

```text
COLLABORATION RESPONSE

Evidence reviewed:
<exact Issue, file, check, deployment, PR, commit, or head SHA>

Response:
<bounded analysis, guidance, validation result, or recommendation>

Disposition:
GUIDANCE | ADJUSTMENT | PLAN CHANGE REQUIRED | HOLD | RESUME | Evidence only

Remaining condition:
None | <specific condition>

Next action:
<action returned to the Issue owner>
```

## Step 5 — Issue owner resumes work

The Issue owner:

1. acknowledges the response when required;
2. applies or routes the response within existing authority;
3. continues the branch, PR, remediation, preparation, or project work;
4. requests clarification or a new collaboration cycle when evidence materially changes.

## Step 6 — Close the collaboration cycle

```text
COLLABORATION COMPLETE

Result:
<completed contribution>

Evidence identity:
<exact evidence reviewed>

Open conditions:
None | <conditions>

Execution ownership:
Returned to <Issue owner>
```

Do not close the source Issue merely because collaboration is complete.

## Pull-request use

When collaboration depends on a PR:

1. post the request on the source Issue;
2. identify the PR and relevant head SHA;
3. collaborator reads the PR, diff, checks, or threads as necessary;
4. collaborator posts the response on the source Issue;
5. Issue owner applies the response and resumes PR work.

The collaborator does not need to comment on or modify the PR for normal advisory collaboration.

Formal PR review is separate:

- it must be explicitly requested or required by policy;
- the reviewer must have the required independent-review role;
- findings and approval use GitHub-native review surfaces;
- the controlling disposition is routed back to the source Issue;
- formal review does not transfer Issue ownership.

## Operations example

Cursor requests ChatGPT Tier 2 support on the same `OPS:` Issue. The Issue remains `team:operations` with its existing Operations priority or state. ChatGPT supplies specialist guidance; Cursor resumes remediation.

## PMO example

Cursor requests ChatGPT design clarification on the active child task that owns the implementation work. The parent PMO priority and child sequence remain unchanged. ChatGPT responds; Cursor resumes implementation.

## Engineering example

ChatGPT requests Cursor feasibility evidence on the Engineering preparation Issue. The Issue remains `team:engineering`; Cursor supplies bounded technical evidence. The collaboration does not authorize Active implementation.

## Stop conditions

Stop and route clarification when:

- no authoritative source Issue exists;
- the request would create dual team ownership;
- the request is actually an ownership handoff;
- requested work exceeds the collaborator's authority;
- material plan change or Project Graduation is required;
- required independent review is being replaced with advisory collaboration;
- Production, credential, legal, privacy, destructive, or cost authority is unresolved.