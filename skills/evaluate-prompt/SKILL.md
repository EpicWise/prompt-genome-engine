---
name: evaluate-prompt
description: "Evaluate any LLM prompt against best practices and a stated use case, producing a scored rubric, actionable feedback, and an improved version. Use this skill whenever someone asks to review, evaluate, assess, critique, score, grade, or improve a prompt — whether they paste it inline, point to a file path, or say 'check my prompt'. Also trigger when someone asks 'is this prompt good?', 'how can I improve this prompt?', 'what's wrong with my prompt?', or references prompt quality, prompt review, or prompt audit. Works for system prompts, user prompts, multi-turn templates, and agentic prompt chains."
---

# Prompt Evaluator

Evaluate LLM prompts for quality, technique fitness, and robustness — then produce a scored report and an improved version.

## Who this is for

Prompt engineers building production-grade prompts for LLM applications. The evaluation is rigorous and technique-aware, not surface-level grammar checking.

## Inputs

Accept the prompt in one of two ways:

1. **File path** — The user says something like "evaluate the prompt at ./prompts/system.md" or "review my prompt in /path/to/file". Read the file.
2. **Inline paste** — The user pastes the prompt directly in the conversation.

If the user says "evaluate my prompt" without providing either, ask: "Can you paste your prompt here, or give me the file path where it lives?"

In addition to the prompt itself, you need the **use case**. This is a short description of what the prompt is meant to do. Examples:
- "Customer support chatbot for a SaaS product"
- "Code review agent for Python repos"
- "Classification pipeline for support ticket routing"
- "RAG-based research assistant"

If the user doesn't provide a use case, ask for one. The use-case context is what makes this evaluation meaningful — without it, feedback stays generic.

If the user provides both a system prompt and a user prompt, evaluate them together as a unit.

## Evaluation Dimensions

Score each dimension on a 1–5 scale. Read `references/techniques.md` before evaluating — it contains the technique-to-use-case mapping and robustness checklists drawn from the Prompt Engineering Guide (promptingguide.ai).

### 1. Clarity & Specificity (1-5)

Is the prompt unambiguous? Could a "brilliant new employee with no context" follow it?

**What to check:**
- Instructions are action-oriented ("do X" rather than "don't do Y")
- Desired output format and constraints are explicit
- Sequential steps use numbered lists or clear ordering
- No room for misinterpretation on key requirements

**Scoring guide:**
- 5: Crystal clear, a colleague with zero context could follow it perfectly
- 4: Minor ambiguities that wouldn't affect most outputs
- 3: Some instructions require inference to interpret correctly
- 2: Multiple instructions are vague or contradictory
- 1: Fundamentally unclear what the prompt wants

### 2. Context & Motivation (1-5)

Does the prompt explain *why*, not just *what*? Context helps the model generalize beyond the literal instructions.

**What to check:**
- Background information about the task's purpose or audience
- Motivation behind specific constraints (e.g., "responses will be read aloud by TTS, so avoid ellipses" vs. "NEVER use ellipses")
- Enough context for the model to handle unstated edge cases intelligently

**Scoring guide:**
- 5: Rich context that enables intelligent generalization
- 4: Good context, one or two constraints could use more motivation
- 3: Some context present but key "why" explanations are missing
- 2: Mostly bare instructions with no background
- 1: No context at all — just raw instructions

### 3. Structure & Organization (1-5)

Does the prompt use structural elements to prevent misinterpretation?

**What to check:**
- XML tags to separate instructions, context, examples, and input data
- Long documents placed at the top, query/instructions at the bottom
- Clear section boundaries for different types of content
- Consistent tag naming and nesting hierarchy
- Appropriate use of separators between prompt components

**Scoring guide:**
- 5: Well-structured with clear tags, hierarchy, and separation of concerns
- 4: Good structure, minor improvements possible
- 3: Some structure but mixing of instructions and data
- 2: Minimal structure — wall of text with no clear sections
- 1: No structural organization at all

### 4. Examples & Few-Shot Quality (1-5)

Are there demonstrations? Are they effective?

**What to check:**
- 3-5 diverse examples that cover typical cases and edge cases
- Examples wrapped in `<example>` / `<examples>` tags
- Examples mirror actual use case inputs (realistic, not contrived)
- Balanced across categories/labels (for classification)
- Format consistency across examples

**Scoring guide:**
- 5: 3+ diverse, realistic, well-structured examples covering edge cases
- 4: Good examples but missing edge cases or slight imbalance
- 3: 1-2 examples, or examples that are too similar to each other
- 2: Examples present but poorly formatted, unrealistic, or misleading
- 1: No examples where they would clearly help (score N/A if examples aren't needed for the use case)

**Important:** Not every prompt needs examples. For simple, well-specified tasks, zero-shot is fine. Score this dimension as N/A (and exclude from the overall score) when few-shot examples would add no value.

### 5. Output Contract (1-5)

Does the prompt define what "done" looks like?

**What to check:**
- Expected format (JSON, markdown, prose, structured response)
- Length constraints or guidance
- Tone and style requirements
- Required sections or fields in the response
- Handling of edge cases and uncertainty (what to output when unsure)
- Fallback behavior specification

**Scoring guide:**
- 5: Complete output spec — format, length, tone, required fields, edge case handling
- 4: Good output definition, missing one element (e.g., no edge case handling)
- 3: Partial output spec — format defined but other aspects left to inference
- 2: Vague output guidance ("return a good response")
- 1: No output specification at all

### 6. Technique Fitness (1-5)

Given the stated use case, is the prompt using the *right* prompting techniques?

**This is the dimension that requires `references/techniques.md`.** Consult the "Use Case → Recommended Techniques" section to determine what techniques are appropriate, then check whether the prompt employs them.

**What to check:**
- Classification prompts: structured output, balanced examples, clear label definitions
- Reasoning prompts: chain-of-thought or step-by-step decomposition
- Agentic prompts: ReAct pattern, tool definitions, safety rails, state management
- RAG prompts: grounding in provided context, source attribution instructions
- Code generation prompts: schema definitions, language/framework specification
- Evaluation prompts: explicit criteria, role assignment, comparative format

#### Source Fidelity Sub-Rubric (conditional)

Activate this sub-rubric when the use case involves retrieval-grounded or multi-source context — for example: RAG systems, hybrid graph agents, code intelligence pipelines, legal citation systems, or any prompt where the LLM receives pre-retrieved context from external systems.

When activated, Technique Fitness scoring must also account for:

**a) Per-source-type fidelity rules:**
Different context types have different preservation requirements. The prompt should specify these explicitly rather than applying a blanket "cite your sources" instruction. Consult the "Multi-Source RAG" section in `references/techniques.md` for the full fidelity matrix. In brief:
- **Code:** Must be reproduced character-for-character in fenced code blocks. A single altered character can change semantics. The LLM explains *around* the code, never rewrites it.
- **Structured data (Jira tickets, DB records):** Key fields (IDs, statuses, assignees) must be preserved exactly. Descriptions can be quoted but not silently paraphrased.
- **Conversational context (Slack, Teams, chat):** Messages should be attributed to the speaker. The prompt should distinguish opinions from facts and instruct the LLM on how to handle each.
- **Legal/compliance documents (PDFs, contracts, policies):** Exact quotes with page/section references. No paraphrasing, no interpolation between clauses.

**b) Context tagging structure:**
The prompt should tag each source by type (e.g., `<source type="code">`, `<source type="jira">`, `<source type="document">`) so the LLM knows which fidelity rules apply to which block. Without this tagging, the LLM has no way to differentiate a code snippet from a Slack message.

**c) Attribution and traceability:**
The prompt should instruct the LLM to cite the origin of each piece of information — file path and line numbers for code, ticket IDs for Jira, channel and timestamp for Slack, page and section for documents. This makes the response verifiable.

**d) Conflict resolution:**
When multiple sources are present, they can contradict each other (e.g., a Jira ticket says "resolved" but a Slack thread says "still broken"). The prompt should tell the LLM how to handle this — surface the conflict, prefer one source over another, or escalate to the user.

**e) Separation of LLM reasoning from source material:**
The prompt should instruct the LLM to clearly demarcate its own analysis/explanation from the preserved source material. This prevents the reader from confusing the LLM's interpretation with the original content.

**Scoring guide (applies to all use cases):**
- 5: Excellent technique selection — the prompt leverages exactly the right patterns for this use case. For multi-source RAG: per-type fidelity rules, proper context tagging, attribution, conflict resolution, and clear separation of LLM reasoning from source material.
- 4: Good technique use, one missed opportunity. For multi-source RAG: most fidelity patterns present but one gap (e.g., no conflict resolution).
- 3: Some relevant techniques used but significant gaps. For multi-source RAG: blanket "cite your sources" without per-type rules.
- 2: Techniques don't match the use case (e.g., zero-shot for complex reasoning, no source preservation for RAG).
- 1: No awareness of prompting techniques — just a bare instruction.

### 7. Robustness & Edge Cases (1-5)

Does the prompt handle adversarial inputs, ambiguity, and failure modes?

**Consult the "Risks & Robustness Checklist" in `references/techniques.md`.**

**What to check:**
- Separation of instructions from user-supplied data (prompt injection defense)
- Instructions for handling uncertainty or missing information
- Guardrails against hallucination (grounding, self-checking, "I don't know")
- Safety rails for agentic prompts (confirmation before destructive actions)
- Bias mitigation in examples and framing

**Scoring guide:**
- 5: Comprehensive robustness — handles adversarial input, uncertainty, and failure modes
- 4: Good robustness, one area could be strengthened
- 3: Some robustness measures but significant gaps
- 2: Minimal consideration of edge cases or failure modes
- 1: No robustness consideration at all

**Important:** Weight this dimension more heavily for production/user-facing prompts and less for internal/experimental prompts. Note this in your feedback.

---

## Output

Produce two artifacts:

### 1. Evaluation Report

Write a markdown report with this structure:

```
# Prompt Evaluation Report

## Summary
- **Use case:** [stated use case]
- **Overall score:** [weighted average]/5
- **Top strength:** [highest-scoring dimension and why]
- **Priority fix:** [lowest-scoring dimension and why]

## Dimension Scores

| Dimension | Score | Summary |
|-----------|-------|---------|
| Clarity & Specificity | X/5 | [one-line justification] |
| Context & Motivation | X/5 | [one-line justification] |
| Structure & Organization | X/5 | [one-line justification] |
| Examples & Few-Shot | X/5 or N/A | [one-line justification] |
| Output Contract | X/5 | [one-line justification] |
| Technique Fitness | X/5 | [one-line justification] |
| Robustness & Edge Cases | X/5 | [one-line justification] |

## Detailed Feedback

[For each dimension scoring 3 or below, provide:]
### [Dimension Name] — [Score]/5
**What's missing:** [specific gap]
**Why it matters:** [impact on the use case]
**Recommended fix:** [concrete, actionable change with example text]

## Techniques Recommended for This Use Case
[Based on the use case, list the 2-3 most relevant techniques from the reference and explain how they apply]

## Changes Summary
[Table mapping each change in the improved prompt to the dimension it addresses:]
| Change | Dimension Improved | Before → After |
|--------|-------------------|----------------|
| [what was changed] | [which dimension] | [brief before/after] |
```

### Output File Naming (versioned with timestamps)

Every lint run produces timestamped files so that repeated runs on the same prompt build a history rather than overwriting each other.

**Timestamp format:** `YYYYMMDD_HHMMSS` (e.g., `20260323_143052`). Generate this from the current time at the start of the lint run.

**File naming patterns:**

If the original file is `system_prompt.md`:
- Report: `system_prompt_lint_20260323_143052.md`
- Improved: `system_prompt_improved_20260323_143052.md`

If the prompt was pasted inline (no file):
- Report: `prompt_lint_20260323_143052.md`
- Improved: `prompt_improved_20260323_143052.md`

Save both files in the same directory as the original file (if a file path was provided) or in the current working directory (if the prompt was pasted inline).

This way, when the user runs the linter again after making changes, the previous report and improved prompt are preserved:
```
system_prompt.md                                  ← original (unchanged)
system_prompt_lint_20260323_143052.md              ← first lint
system_prompt_improved_20260323_143052.md          ← first improved version
system_prompt_lint_20260324_091500.md              ← second lint (after changes)
system_prompt_improved_20260324_091500.md          ← second improved version
```

The timestamps make it easy to diff across iterations in VS Code and see how the prompt evolved over time.

### 2. Improved Prompt

Rewrite the prompt incorporating all feedback. The rewrite should:
- Be **clean and production-ready** — the user should be able to copy it directly into their codebase with zero cleanup
- Fix every issue identified in the detailed feedback
- Preserve the original prompt's intent and voice where possible
- Add XML structure if the original lacked it
- Add examples if the original needed them
- Define the output contract if it was missing
- **Do NOT include inline annotations, XML comments (`<!-- ... -->`), or change markers in the improved prompt.** The prompt must be ready to use as-is. All explanations of what changed and why belong in the evaluation report's "Changes Summary" section, not in the prompt itself.

If the original prompt was embedded in code (e.g., a Python string, a YAML config), preserve that code wrapper in the improved version so it remains copy-pasteable into the original file.

---

## Workflow

1. Read `references/techniques.md` to load the technique mapping and robustness checklists.
2. Obtain the prompt (read file or use inline content).
3. Confirm the use case is stated. If not, ask for it.
4. Generate a timestamp (`YYYYMMDD_HHMMSS`) for this evaluation run — this will be used in both output filenames.
5. Score all 7 dimensions with justifications.
6. Write the evaluation report and save to timestamped file.
7. Write the improved prompt and save to timestamped file.
8. Present a brief summary to the user with the overall score, top strength, priority fix, and file paths for both outputs. Keep the summary concise — the reports speak for themselves.

---

## Important guidelines

- Be honest in scoring. A 5 should mean genuinely excellent, not "pretty good." Most prompts will score 2-4 on most dimensions, and that's fine — the value is in the specific, actionable feedback.
- When rewriting, be ambitious but respectful. The improved version should be meaningfully better, not a conservative tweak. But preserve the original author's intent and style where it's working well.
- The technique fitness dimension is what makes this evaluation valuable beyond generic advice. Invest real thought in matching the use case to the right techniques.
- For prompts that are already strong (4+ across the board), focus feedback on the 1-2 areas with room for improvement and acknowledge what's working well.
- If the prompt is for a specific model (Claude, GPT-4, Gemini), factor in model-specific patterns. For example, Claude benefits from XML tags and responds well to explained motivation; Claude 4.6 models don't support prefilled responses; etc.
