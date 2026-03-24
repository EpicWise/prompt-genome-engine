# Contributing to PromptLint

Thanks for your interest in improving PromptLint! Here's how to get involved.

## How to contribute

1. **Fork the repo** and create a branch from `main`.
2. **Make your changes** — whether it's a new evaluation dimension, a technique reference update, a bug fix, or documentation.
3. **Test your changes** using the evals framework (see below).
4. **Open a pull request** against `main` with a clear description of what you changed and why.

## Areas where contributions are especially welcome

- **New technique references** in `skills/evaluate-prompt/references/techniques.md` — if you know a prompting pattern that should be part of the evaluation, add it to the technique matrix.
- **New test cases** in `evals/test-prompts/` — the more diverse prompts we test against, the better the linter gets. Add prompts from different domains (healthcare, legal, finance, devtools) with expected score ranges.
- **Use-case-specific sub-rubrics** — similar to the Source Fidelity Sub-Rubric for multi-source RAG, other use cases may benefit from specialized checks (e.g., safety-critical systems, multi-language prompts).
- **Model-specific guidance** — if you have deep experience with a specific model's prompting quirks, add model-aware checks.

## Running evals

Test prompts and expected outcomes live in `evals/`. To verify the skill works correctly:

1. Load the plugin: `claude --plugin-dir ./`
2. Run each test case from `evals/evals.json` and compare against expected outcomes.
3. Add new test cases for any scenarios your changes affect.

## Code of conduct

Be kind, be constructive. We're all here to make prompts better.

## Questions?

Open an issue or reach out to the maintainers.
