# Prompt Engineering Techniques Reference

This reference maps techniques to use cases. When evaluating a prompt, check whether it uses techniques appropriate for its stated use case.

## Technique → Use Case Matrix

### Zero-Shot Prompting
- **What:** Direct instruction, no examples.
- **Best for:** Simple classification, tasks within model's training distribution, quick baselines.
- **Red flag if used for:** Complex reasoning, arithmetic, tasks needing specific output format.

### Few-Shot Prompting
- **What:** 1-5 examples demonstrating expected input→output pattern.
- **Best for:** Classification with specific label sets, format-sensitive tasks, style matching.
- **Quality checklist:** Examples should be diverse (cover edge cases), relevant (mirror real inputs), structured (wrapped in `<example>` tags), and balanced across labels.
- **Red flag if:** Examples are all trivially similar, labels are imbalanced, no edge cases shown.

### Chain-of-Thought (CoT)
- **What:** "Let's think step by step" or explicit reasoning demonstrations.
- **Best for:** Arithmetic, logical reasoning, commonsense reasoning, multi-step problems.
- **Red flag if absent:** Prompt asks for complex reasoning but expects direct answer.
- **Red flag if present:** Simple factual lookups or classification — CoT adds unnecessary tokens.

### ReAct (Reasoning + Acting)
- **What:** Interleaved reasoning traces and tool/action calls.
- **Best for:** Knowledge-intensive QA, fact verification, dynamic decision-making, agentic tasks.
- **Requires:** Tool definitions, action space specification, observation handling.
- **Red flag if absent:** Agentic prompt with tool access but no reasoning-action pattern.

### Retrieval Augmented Generation (RAG)
- **What:** Retrieve relevant documents, concatenate as context, then generate.
- **Best for:** Up-to-date factual QA, knowledge-grounded generation, reducing hallucination.
- **Red flag if absent:** Prompt expects factual accuracy on evolving topics without retrieval.

### Tree of Thoughts (ToT)
- **What:** Explore multiple reasoning paths with BFS/DFS, evaluate and backtrack.
- **Best for:** Strategic reasoning, puzzles, problems with multiple solution paths.
- **Red flag if used for:** Simple tasks — ToT is computationally expensive.

### Self-Consistency
- **What:** Sample multiple reasoning paths, majority-vote on the answer.
- **Best for:** Tasks where single-path reasoning is unreliable (math, commonsense).
- **Implementation note:** Requires multiple sampling rounds; not a prompt-level technique but a system design choice.

### Prompt Chaining
- **What:** Break task into sequential subtasks, each with its own prompt.
- **Best for:** Multi-step document processing, complex transformations, pipelines.
- **Red flag if absent:** A single monolithic prompt tries to do extraction + analysis + formatting + summarization.

### Automatic Prompt Engineer (APE)
- **What:** Use LLMs to generate and evaluate candidate instructions automatically.
- **Best for:** Optimizing prompts at scale, finding better zero-shot instructions.
- **Note:** A system-level technique, not a prompt-level one.

### Meta Prompting
- **What:** Focus on structural/syntactical patterns rather than specific content.
- **Best for:** Mathematical proofs, coding challenges, theoretical queries.
- **Red flag if used for:** Tasks requiring domain-specific examples.

---

## Use Case → Recommended Techniques

### Classification
- **Primary:** Few-shot with balanced, diverse examples across all label categories.
- **Structure:** Define categories explicitly, use structured output (JSON/enum), wrap examples in tags.
- **Anti-pattern:** Relying on zero-shot for nuanced multi-label classification.

### Code Generation
- **Primary:** Zero-shot with detailed specification, or few-shot with input→output code examples.
- **Structure:** Provide schema definitions, specify language/framework, use code comments as instructions.
- **Anti-pattern:** Vague descriptions ("make it better"), missing schema for DB queries.

### Creative Writing
- **Primary:** Few-shot with style examples, role assignment, constraint specification.
- **Structure:** Define creative constraints clearly but don't over-specify (kills creativity).
- **Anti-pattern:** Overly rigid templates for creative tasks.

### Evaluation / LLM-as-Judge
- **Primary:** Role assignment (teacher, critic), comparative format, explicit criteria.
- **Structure:** Present outputs side-by-side, define evaluation rubric, request structured scores.
- **Anti-pattern:** Vague "which is better?" without criteria.

### Information Extraction
- **Primary:** Zero-shot with explicit entity definitions and output format.
- **Structure:** Define entities precisely, specify output format (JSON), include fallback for uncertainty.
- **Anti-pattern:** No fallback for missing data, ambiguous entity boundaries.

### Question Answering
- **Closed-domain:** Provide facts, use "exclusively from the provided information" constraint.
- **Open-domain:** Set behavioral expectations, provide fallback for uncertainty ("I don't know").
- **Anti-pattern:** No grounding context for factual QA, no uncertainty handling.

### Reasoning & Logic
- **Primary:** Chain-of-Thought, step-by-step decomposition, proof by contradiction.
- **Structure:** Number steps explicitly, define logical constraints, request systematic consideration.
- **Anti-pattern:** Expecting complex logical conclusions without intermediate reasoning steps.

### Summarization
- **Primary:** Zero-shot with length/format constraint, or extraction-then-synthesis chain.
- **Structure:** Specify target length, audience, and format (bullet points vs. paragraph).
- **Anti-pattern:** No length constraint, no specification of what to prioritize.

### Truthfulness / Fact Verification
- **Primary:** Provide reference material, ask for claim-by-claim verification.
- **Structure:** Separate facts from claims, request evidence citations, flag unsupported statements.
- **Anti-pattern:** Asking model to verify without providing reference material.

### Function Calling / Tool Use
- **Primary:** Structured function definitions with typed parameters, clear descriptions.
- **Structure:** JSON schema for each function, required vs. optional params, return type specification.
- **Anti-pattern:** Vague function descriptions, missing parameter types, no required field marking.

### Agentic Systems
- **Primary:** ReAct pattern, tool definitions, safety rails, state management.
- **Structure:** Define action space, specify when to use which tool, include safety/confirmation prompts for destructive actions, state persistence instructions.
- **Anti-pattern:** No safety rails for irreversible actions, no state management, monolithic "do everything" prompt without tool definitions.

### Data Generation
- **Primary:** Few-shot with explicit format, distribution specification, category examples.
- **Structure:** Specify quantity, distribution across categories, output format, diversity requirements.
- **Anti-pattern:** No distribution specification, no format template, insufficient diversity constraints.

---

## Multi-Source RAG (Hybrid Graph / Retrieval-Grounded Systems)

This section applies when the prompt is for a response generator that receives pre-retrieved context from multiple heterogeneous systems — code intelligence engines, project management tools, messaging platforms, document stores, etc.

The central problem: each source type has different fidelity requirements, and the LLM must preserve source material while synthesizing and explaining across sources.

### Source Type Fidelity Matrix

| Source Type | Fidelity Level | Preservation Rules | Attribution Format |
|-------------|---------------|-------------------|-------------------|
| **Code** (code graph, AST, file reads) | **Exact** — character-for-character | Reproduce in fenced code blocks with language tag. Never rewrite, refactor, simplify, or add comments to retrieved code. The LLM explains *around* the code. | File path, line numbers, repository, branch/commit |
| **Structured records** (Jira, Linear, Asana, DB rows) | **Field-exact** — key fields verbatim | Ticket IDs, statuses, assignees, dates, priorities must appear exactly as retrieved. Descriptions can be quoted but not silently paraphrased. | Ticket ID, project key, link to source |
| **Conversational context** (Slack, Teams, Discord) | **Attributed** — content preserved, speaker identified | Messages quoted with speaker attribution. The prompt should instruct the LLM to distinguish opinions ("@alice thinks...") from facts ("the deployment log shows..."). Timestamps matter for recency. | Channel, thread timestamp, speaker name |
| **Legal/compliance documents** (PDFs, contracts, policies) | **Verbatim** — no paraphrasing | Exact quotes in blockquotes with section/page references. Never interpolate between clauses. Never summarize legal language — the wording is the meaning. | Document title, version, page, section number |
| **Technical documentation** (wikis, READMEs, API docs) | **High fidelity** — can lightly paraphrase with citation | Key terms and definitions preserved. API signatures and config values verbatim. | Document title, section, URL |

### Context Tagging Pattern

The prompt should instruct the upstream system (or itself) to tag each context block by type so the LLM can apply the correct fidelity rules:

```xml
<context>
  <source type="code" origin="code-graph" repo="acme/backend" file="auth/handler.py" lines="42-67">
    def verify_token(token: str) -> bool:
        ...
  </source>
  <source type="jira" ticket="ACME-1234" status="In Progress" assignee="alice@acme.com">
    Title: Token expiry not handled for refresh tokens
    Description: When a refresh token expires...
  </source>
  <source type="slack" channel="#backend-team" thread_ts="2026-03-20T14:32:00Z" participants="alice,bob">
    alice: I think the issue is in the verify_token path
    bob: Confirmed — the refresh flow skips expiry check
  </source>
  <source type="document" title="Auth Service SLA" version="2.1" page="7" section="3.2">
    "All authentication tokens MUST be validated against the expiry timestamp..."
  </source>
</context>
```

### Conflict Resolution

When multiple sources are present, they can contradict each other. The prompt must specify a resolution strategy. Common patterns:

- **Surface the conflict explicitly:** "When sources disagree, present both perspectives with their source attribution and flag the discrepancy for the user."
- **Source hierarchy:** "Prefer code over documentation (code is the source of truth). Prefer recent Slack messages over older Jira tickets for current status."
- **Escalate:** "When sources conflict on factual matters, do not guess — present both and ask the user to clarify."

### Separation of LLM Reasoning from Source Material

The prompt should instruct the LLM to clearly demarcate:
- **Source material:** In code blocks, blockquotes, or tagged sections — always attributed
- **LLM's own analysis:** In regular prose, clearly framed as interpretation ("Based on this code...", "This suggests that...")

This prevents the reader from confusing the LLM's interpretation with the original content.

### Anti-patterns for Multi-Source RAG

- Blanket "cite your sources" without per-type fidelity rules
- No context tagging — all sources dumped as a single text blob
- Code reproduced with "improvements" or "cleanup" the user didn't ask for
- Legal text paraphrased or summarized
- Slack messages treated as ground truth without speaker attribution
- No conflict resolution strategy when sources disagree
- LLM analysis mixed into source quotes without clear demarcation

---

## Risks & Robustness Checklist

### Adversarial Robustness
- Does the prompt protect against prompt injection (untrusted user input mixed with instructions)?
- Are instructions and user data clearly separated (e.g., via XML tags)?
- Does it guard against prompt leaking (extraction of system prompt)?
- Are there instruction-level warnings about ignoring injected instructions?

### Factuality & Hallucination Prevention
- Does the prompt ground responses in provided context?
- Does it instruct the model to admit uncertainty ("I don't know")?
- Are temperature/sampling settings appropriate (lower for factual tasks)?
- Does it include verification steps or self-checking?

### Bias Mitigation
- Are few-shot examples balanced across categories/labels?
- Is example ordering randomized or at least not systematically biased?
- Does the prompt avoid language that could prime biased outputs?
- For classification tasks, is the label distribution representative?
