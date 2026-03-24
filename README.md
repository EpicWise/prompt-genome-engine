# Prompt Genome Engine

A novel prompt engineering tool that decomposes LLM prompts into functional **genes**, scores each independently, and applies targeted **mutations** backed by research. Also includes a holistic **Lint** mode for 7-dimension scoring.

Available as a [web app](https://promptlint.vercel.app), a [Claude Code plugin](https://docs.claude.com), and an [npm package](https://www.npmjs.com/package/@ceoepicwise/prompt-genome-engine).

## What's New: Prompt Genome Engine (v2.0)

> **Every existing prompt tool treats your prompt as a single block of text. PromptLint is the first to decompose it into functional genes.**

```
┌──────────────────────────────────────────────────────────────────┐
│  YOUR PROMPT                                                      │
│                                                                    │
│  ┌──────┐ ┌──────┐ ┌────────┐ ┌──────┐ ┌─────────┐ ┌──────────┐ │
│  │ Role │ │ Task │ │Context │ │Format│ │Examples │ │Guardrails│ │
│  │ 4/5  │ │ 5/5  │ │  3/5   │ │ 5/5  │ │  1/5 !  │ │   2/5    │ │
│  └──────┘ └──────┘ └────────┘ └──────┘ └─────────┘ └──────────┘ │
│                                  ▲                                │
│                    Fix THIS gene, not the whole prompt             │
└──────────────────────────────────────────────────────────────────┘
```

### How the Genome Engine works

| Step | What it does |
|------|-------------|
| **1. Decompose** | Breaks your prompt into 9 functional genes: Role, Task, Context, Taxonomy, Output Format, Examples, Reasoning, Constraints, Guardrails |
| **2. Score** | Rates each gene 1-5 independently — see exactly which region is strong and which is dragging the prompt down |
| **3. Mutate** | Applies a surgical, research-backed fix to the weakest gene (not a full rewrite) |
| **4. Detect** | Analyzes inter-gene dependencies and conflicts ("your Constraints contradict your Examples") |

### Research-backed suggestions

Every mutation technique maps to a published paper. Citations are validated against a curated database — hallucinated papers are stripped automatically.

| Technique | Paper | Impact |
|-----------|-------|--------|
| Few-shot prompting | Brown et al. 2020 (NeurIPS) | +15-30% accuracy |
| Chain-of-thought | Wei et al. 2022 (NeurIPS) | +20-40% on reasoning |
| Context grounding | Lewis et al. 2020 (NeurIPS) | -30-40% hallucination |
| Self-refine validation | Madaan et al. 2023 (NeurIPS) | +20% output quality |
| Constraint specification | Bai et al. 2022 | -50-70% harmful outputs |
| Task decomposition | Khot et al. 2023 (ICLR) | +10-30% on multi-step tasks |
| ReAct pattern | Yao et al. 2023 (ICLR) | +20-30% agentic success |

15 technique-to-gene mappings in the database today.

### What makes this different from DSPy / EvoPrompt / PromptWizard?

| Tool | Approach | Structural awareness |
|------|----------|---------------------|
| DSPy | Optimizes entire prompt as atomic unit | None |
| EvoPrompt | Genetic algorithms on whole prompt strings | None |
| PromptWizard (Microsoft) | Self-evolving prompts, holistic critique | None |
| GAAPO (2026) | GA-based prompt optimization | None |
| **PromptLint Genome** | **Decomposes into 9 named genes, scores each, mutates the weakest** | **Gene-level** |

---

## Lint Mode (v1)

The original PromptLint: scores your prompt across 7 dimensions and generates an improved version.

Run `/promptlint` on any LLM prompt and get:

1. **A scored evaluation** across 7 dimensions (1-5 scale each)
2. **Actionable feedback** with concrete fixes for every weak area
3. **An improved prompt** that's clean and production-ready

### The 7 Evaluation Dimensions

| Dimension | What it checks |
|-----------|---------------|
| **Clarity & Specificity** | Could a "brilliant new employee" with zero context follow this? |
| **Context & Motivation** | Does it explain *why*, not just *what*? |
| **Structure & Organization** | XML tags, clear sections, consistent hierarchy? |
| **Examples & Few-Shot Quality** | Diverse demonstrations covering edge cases? |
| **Output Contract** | Format, length, tone, fallback behavior defined? |
| **Technique Fitness** | Right prompting patterns for the use case? |
| **Robustness & Edge Cases** | Prompt injection defense, hallucination guardrails? |

### Use-Case-Aware Evaluation

| Use Case | What PromptLint Checks |
|----------|----------------------|
| **Classification** | Label definitions, structured output, balanced examples |
| **Agentic** | ReAct pattern, tool definitions, state management, safety rails |
| **RAG** | Grounding, source attribution, context tagging |
| **Code Generation** | Schema definitions, language/framework specification |
| **Reasoning** | Chain-of-thought, step-by-step decomposition |

---

## Web App

Try it at **[promptlint.vercel.app](https://promptlint.vercel.app)**

- Switch between **Lint** and **Genome** tabs
- Bring your own API key (Anthropic, OpenAI, or OpenRouter)
- Paste any prompt + use case → see results

No account required. No data stored. Your API key is never logged.

## Installation (Claude Code Plugin)

### One-command install (recommended)

```bash
npx @ceoepicwise/promptlint
```

This installs the plugin into your Claude Code environment. Restart Claude Code and `/promptlint` is ready.

To uninstall:

```bash
npx @ceoepicwise/promptlint --uninstall
```

### Manual install

```bash
git clone https://github.com/EpicWise/prompt-genome-engine.git
claude --plugin-dir ./promptlint
```

## Usage (CLI)

```
/promptlint ./prompts/system-prompt.md Customer support chatbot handling refunds

/promptlint ./src/rag-prompt.txt Hybrid code intelligence assistant with Jira context

/promptlint paste Classification pipeline for routing support tickets
```

**First argument:** file path to the prompt, or `paste` to paste inline.
**Remaining arguments:** the use case description.

## Local Development

```bash
cd promptlint
npm install
npm run dev      # Start Next.js dev server at localhost:3000
npm test         # Run 35 Vitest tests
npm run build    # Production build
```

## Project Structure

```
promptlint/
├── src/
│   ├── app/
│   │   ├── page.tsx                    # Main UI (Lint + Genome tabs)
│   │   └── api/
│   │       ├── lint/route.ts           # POST /api/lint — holistic evaluation
│   │       ├── genome/route.ts         # POST /api/genome — gene decomposition
│   │       ├── mutate/route.ts         # POST /api/mutate — targeted mutation
│   │       ├── interact/route.ts       # POST /api/interact — gene interactions
│   │       └── verify/route.ts         # POST /api/verify — API key check
│   ├── components/genome/
│   │   ├── GenomeHero.tsx              # Visual hero with process cards
│   │   ├── GenomeTab.tsx               # Main genome tab integration
│   │   ├── GeneMapBar.tsx              # Color-coded gene visualization bar
│   │   ├── GeneDetailCard.tsx          # Per-gene score, feedback, citations
│   │   ├── GeneAnnotatedPrompt.tsx     # Prompt with gene regions highlighted
│   │   ├── GenomeOverview.tsx          # Score ring + summary
│   │   ├── GeneInteractionMatrix.tsx   # Dependency/conflict matrix
│   │   └── PromptDiffView.tsx          # Before/after mutation diff
│   ├── lib/
│   │   ├── llm-client.ts              # Shared multi-provider LLM client
│   │   └── schemas.ts                 # Zod validation schemas
│   ├── prompts/
│   │   ├── genome-decompose.ts         # Gene decomposition system prompt
│   │   ├── genome-mutate.ts            # Mutation system prompt
│   │   └── genome-interact.ts          # Interaction analysis system prompt
│   ├── data/
│   │   └── research-citations.ts       # 15 technique→paper mappings
│   └── types/
│       └── genome.ts                   # TypeScript types for genome engine
├── skills/
│   └── evaluate-prompt/
│       ├── SKILL.md                    # Core evaluation engine (CLI)
│       └── references/techniques.md    # Technique-to-use-case mapping
├── commands/
│   └── lint.md                         # /promptlint slash command
├── evals/                              # Test cases and sample prompts
├── vitest.config.ts                    # Test configuration
└── package.json
```

## Contributing

Contributions are welcome — see [CONTRIBUTING.md](CONTRIBUTING.md). Areas where help is especially valuable:

- **Research citations** — know a prompt engineering paper with empirical results? Add it to the citation database.
- **Gene scoring rubrics** — the 5 remaining gene types (Task, Context, Taxonomy, Constraints, Guardrails) need detailed 1-5 rubrics.
- **Test corpus** — diverse prompts from healthcare, legal, finance, devtools for decomposition validation.
- **Use-case sub-rubrics** — domain-specific gene scoring (e.g., medical prompts need stricter Guardrails scoring).
- **New gene types** — if you find a functional region that doesn't fit the 9 types, propose it.

## Roadmap

- **v1.0** — Prompt evaluation and improvement (Lint tab)
- **v2.0** (current) — Prompt Genome Engine (decompose, score, mutate, interact)
- **v2.1** — Shareable genome reports, gene health history, genome-aware prompt generation
- **v3.0** — Failure-driven evolution (feed bad outputs → trace to gene → auto-fix)

## License

[MIT](LICENSE) — Copyright 2026 EpicWise
