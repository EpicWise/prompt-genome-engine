---
description: "Lint an LLM prompt against best practices and a stated use case — produces a scored rubric, actionable feedback, and an improved version"
argument-hint: "<prompt-file-path or 'paste'> <use case description>"
---

# /promptlint -- Lint & Improve a Prompt

Lint any LLM prompt against 7 quality dimensions, produce a scored rubric with actionable feedback, and generate an improved version.

## Invocation

```
/promptlint ./prompts/system-prompt.md Agentic customer support bot handling refunds
/promptlint ./src/prompts/rag-prompt.txt Hybrid code intelligence assistant with Jira and Slack context
/promptlint paste Classification pipeline for routing 500 support tickets/day
```

**Arguments:**
- **First argument:** A file path to the prompt, OR the word `paste` (the user will then paste the prompt inline).
- **Remaining arguments:** The use case description — what the prompt is meant to do, the context it operates in, and any constraints the linter should know about.

## Workflow

### Step 1: Obtain the prompt

Parse `$ARGUMENTS` to determine the input method:

- If the first argument looks like a file path (contains `/`, `.`, or a common extension like `.md`, `.txt`, `.yaml`, `.json`), read that file.
- If the first argument is `paste` or if no file path is detected, ask the user to paste their prompt.
- Everything after the file path (or `paste`) is the use case description.

If no use case description is provided, ask: "What's the use case for this prompt? For example: 'customer support chatbot', 'code review agent', 'classification pipeline for ticket routing'."

### Step 2: Apply the evaluate-prompt skill

Apply the `evaluate-prompt` skill with:
- The prompt content (from file or paste)
- The use case description
- The original file path (if provided — needed for naming the improved prompt file)

The skill handles the full evaluation: reading the techniques reference, scoring all 7 dimensions, writing the evaluation report, and generating the improved prompt.

### Step 3: Present results

After the skill completes, show a concise summary:

```
## PromptLint Report

**Use case:** [stated use case]
**Overall score:** [X.X]/5

| Dimension | Score |
|-----------|-------|
| Clarity & Specificity | X/5 |
| Context & Motivation | X/5 |
| Structure & Organization | X/5 |
| Examples & Few-Shot | X/5 or N/A |
| Output Contract | X/5 |
| Technique Fitness | X/5 |
| Robustness & Edge Cases | X/5 |

**Top strength:** [one line]
**Priority fix:** [one line]

**Files saved:**
- Lint report: `system_prompt_lint_20260323_143052.md`
- Improved prompt: `system_prompt_improved_20260323_143052.md`
```

### Step 4: Offer next steps

After presenting results, offer:
- "Want me to walk through the detailed feedback for any dimension?"
- "Want me to diff the original and improved prompts?"
- "Want me to re-lint after you make changes?"

## Notes

- **Versioned outputs:** Every lint run produces timestamped files (`_YYYYMMDD_HHMMSS`), so running the linter multiple times on the same prompt builds a history rather than overwriting previous results. This makes it easy to diff across iterations and track how the prompt evolved.
- For multi-source RAG prompts (code intelligence, hybrid graph systems), the linter activates a specialized Source Fidelity Sub-Rubric that checks per-source-type preservation rules, context tagging, attribution, and conflict resolution.
- Scoring is strict by design. A 5/5 means genuinely excellent. Most production prompts score 2-4, and that's normal — the value is in the specific, actionable feedback.
