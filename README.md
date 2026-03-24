# Prompt Genome Engine

Decompose LLM prompts into functional **genes**, score each independently, and apply targeted **mutations** backed by research.

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

> **Every existing prompt tool treats your prompt as a single block of text. This is the first to decompose it into functional genes.**

## How it works

| Step | What it does |
|------|-------------|
| **1. Decompose** | Breaks your prompt into 9 functional genes: Role, Task, Context, Taxonomy, Output Format, Examples, Reasoning, Constraints, Guardrails |
| **2. Score** | Rates each gene 1-5 independently — see exactly which region is strong and which is dragging the prompt down |
| **3. Mutate** | Applies a surgical, research-backed fix to the weakest gene (not a full rewrite) |
| **4. Detect** | Analyzes inter-gene dependencies and conflicts ("your Constraints contradict your Examples") |

## Research-backed suggestions

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

## What makes this different

| Tool | Approach | Structural awareness |
|------|----------|---------------------|
| DSPy | Optimizes entire prompt as atomic unit | None |
| EvoPrompt | Genetic algorithms on whole prompt strings | None |
| PromptWizard (Microsoft) | Self-evolving prompts, holistic critique | None |
| GAAPO (2026) | GA-based prompt optimization | None |
| **Prompt Genome Engine** | **Decomposes into 9 named genes, scores each, mutates the weakest** | **Gene-level** |

## Getting started

### Web app

Bring your own API key (Anthropic, OpenAI, or OpenRouter). Paste any prompt. See its genome.

No account required. No data stored. Your API key is never logged.

### Local development

```bash
git clone https://github.com/EpicWise/prompt-genome-engine.git
cd prompt-genome-engine
npm install
npm run dev      # Start at localhost:3000
npm test         # Run 35 tests
npm run build    # Production build
```

## API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/genome` | POST | Decompose prompt into genes, score each |
| `/api/mutate` | POST | Apply targeted mutation to a specific gene |
| `/api/interact` | POST | Analyze inter-gene dependencies and conflicts |
| `/api/verify` | POST | Validate API key with provider |

All endpoints accept `{ prompt, useCase, apiKey, provider }` — see [src/lib/schemas.ts](src/lib/schemas.ts) for full Zod schemas.

## Project Structure

```
prompt-genome-engine/
├── src/
│   ├── app/
│   │   ├── page.tsx                    # Main UI
│   │   └── api/
│   │       ├── genome/route.ts         # Gene decomposition + scoring
│   │       ├── mutate/route.ts         # Targeted gene mutation
│   │       ├── interact/route.ts       # Inter-gene interaction analysis
│   │       └── verify/route.ts         # API key validation
│   ├── components/genome/
│   │   ├── GenomeHero.tsx              # Visual hero with process cards
│   │   ├── GenomeTab.tsx               # Main genome interface
│   │   ├── GeneMapBar.tsx              # Color-coded gene visualization bar
│   │   ├── GeneDetailCard.tsx          # Per-gene score, feedback, citations
│   │   ├── GeneAnnotatedPrompt.tsx     # Prompt with gene regions highlighted
│   │   ├── GenomeOverview.tsx          # Score ring + evolution potential
│   │   ├── GeneInteractionMatrix.tsx   # Dependency/conflict matrix
│   │   └── PromptDiffView.tsx          # Before/after mutation diff
│   ├── lib/
│   │   ├── llm-client.ts              # Multi-provider LLM client
│   │   └── schemas.ts                 # Zod validation schemas
│   ├── prompts/
│   │   ├── genome-decompose.ts         # Gene decomposition system prompt
│   │   ├── genome-mutate.ts            # Mutation system prompt
│   │   └── genome-interact.ts          # Interaction analysis system prompt
│   ├── data/
│   │   └── research-citations.ts       # 15 technique-to-paper mappings
│   └── types/
│       └── genome.ts                   # TypeScript types
├── vitest.config.ts
└── package.json
```

## Contributing

Contributions welcome. High-impact areas:

- **Research citations** — know a prompt engineering paper with empirical results? Add it to the citation database.
- **Gene scoring rubrics** — the remaining gene types need detailed 1-5 rubrics.
- **Test corpus** — diverse prompts from different domains for decomposition validation.
- **New gene types** — if you find a functional region that doesn't fit the 9 types, propose it.

## Roadmap

- **v2.0** (current) — Gene decomposition, scoring, mutation, interaction analysis
- **v2.1** — Shareable genome reports, gene health history, genome-aware prompt generation
- **v3.0** — Failure-driven evolution (feed bad outputs -> trace to gene -> auto-fix)

## License

[MIT](LICENSE) — Copyright 2026 EpicWise
