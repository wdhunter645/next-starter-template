---

Doc Type: Operational Rules

Audience: AI (ChatGPT)

Authority Level: Agent-Specific

Owns: ChatGPT execution behavior

Does Not Own: Shared rules, design authority, governance

Canonical Reference: /docs/ops/ai/CORE-RULES.md

Last Reviewed: 2026-04-22

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
