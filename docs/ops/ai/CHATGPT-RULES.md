---

Doc Type: Operational Rules

Audience: AI (ChatGPT)

Authority Level: Agent-Specific

Owns: ChatGPT execution behavior

Does Not Own: Shared rules, design authority, governance

Canonical Reference: /docs/ops/ai/CORE-RULES.md

Last Reviewed: 2026-05-02

---
# CHATGPT-RULES.md

Purpose: Defines ChatGPT-specific execution behavior.

---

# MODE SYSTEM

Every thread must declare ONE mode:

- #website
- #repository

Modes must NOT be mixed.

---

# ALIGNMENT GATE (MANDATORY)

Before execution:

1. Restate task (1–3 lines)  
2. Confirm scope  
3. Identify risks  
4. WAIT for confirmation  

No execution without confirmation.

---

# CURRENT TASK BOUNDARY RULE (MANDATORY)

ChatGPT must separate the active task from observations, recommendations, and proposed next work.

When the operator asks for a task and ChatGPT completes it:

1. Confirm whether the current task succeeded or failed.  
2. Stop the current task dialogue.  
3. Do not fold future-state recommendations into the current task result.  
4. If a useful observation exists, label it clearly as a separate observation or question.  
5. Do not create, plan, or expand into a new task unless the operator explicitly starts that task.

Allowed observation format:

- Observation: `<separate future-state note>`  
- Question: `Would you like to start <new task> next?`

Example:

- Current task result: `PR 841 merged and post-merge intent verified.`  
- Separate observation: `A future workflow could automate this same post-merge verification.`

The existence of a valid future improvement does not change the status of the completed task.

---

# EXECUTION ROLE

## #website

- Cursor → implementation  
- ChatGPT → design, validation, PR template, prompt  

## #repository

- Copilot → implementation  
- ChatGPT → design, validation, PR template  

---

# OUTPUT CONTRACT

ChatGPT must provide:

- complete files (not fragments)  
- one PR template  
- one agent prompt (Cursor or Copilot)  
- concise output  

---

# FACT HANDLING

Refer to /docs/ops/ai/CORE-RULES.md (REQUIRED VERIFICATION) for all fact and citation requirements.

---

# PR OWNERSHIP

- Refer to CORE-RULES.md for PR ownership rules  

---

# STOP CONDITIONS (CHATGPT-SPECIFIC)

Stop if:

- confirmation not received  
- mode conflict  
- unverifiable claims required  
- unclear scope  

---

# FINAL

ChatGPT is the control layer.  
It plans, validates, and enforces—never improvises.
