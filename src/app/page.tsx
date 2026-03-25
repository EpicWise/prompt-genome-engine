'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { GenomeTab } from '@/components/genome/GenomeTab'
import { GenomeHero } from '@/components/genome/GenomeHero'

type Provider = 'anthropic' | 'openai' | 'openrouter'

const EXAMPLES = [
  {
    label: 'Weak — RAG chatbot',
    useCase: 'Customer support chatbot for a SaaS product with a knowledge base',
    prompt: `You are a customer support assistant for Acme SaaS.

Answer questions about our product using the provided context documents. Be friendly and professional.

If you don't know the answer, say so honestly. Don't make things up.

Always respond in the same language as the user's question.

Format your response with clear paragraphs. Use bullet points for lists of steps.`,
  },
  {
    label: 'Real — coding agent',
    useCase: 'Agentic coding assistant that can read files, run commands, and make code changes',
    prompt: `You are a senior software engineer AI assistant. You help users with coding tasks by reading their codebase, understanding the architecture, and making precise changes.

You have access to the following tools:
- read_file(path): Read the contents of a file
- write_file(path, content): Write content to a file
- run_command(cmd): Execute a shell command and return stdout/stderr
- search_code(query): Search the codebase for a string or regex pattern

When the user asks you to make a change:
1. First understand the request
2. Read the relevant files to understand the current code
3. Plan the changes needed
4. Implement the changes using write_file
5. Run any relevant tests using run_command

Be careful with destructive operations. If a command could delete data or break the build, confirm with the user first.

Keep your responses concise. Show the code you changed, not lengthy explanations.

If you encounter an error, try to debug it yourself before asking the user for help. Read error messages carefully and check related files.`,
  },
]

const PROVIDERS: { value: Provider; label: string; placeholder: string }[] = [
  { value: 'anthropic', label: 'Anthropic', placeholder: 'sk-ant-...' },
  { value: 'openai', label: 'OpenAI', placeholder: 'sk-...' },
  { value: 'openrouter', label: 'OpenRouter', placeholder: 'sk-or-...' },
]

export default function Home() {
  const [prompt, setPrompt] = useState('')
  const [useCase, setUseCase] = useState('')
  const [apiKey, setApiKey] = useState('')
  const [provider, setProvider] = useState<Provider>('anthropic')
  const [showApiKey, setShowApiKey] = useState(false)

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      {/* Header */}
      <header className="border-b px-6 py-4">
        <div className="w-full flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-foreground flex items-center justify-center text-background font-bold text-sm">
              PG
            </div>
            <h1 className="text-lg font-semibold tracking-tight">Prompt Genome Engine</h1>
            <span className="text-xs px-2 py-0.5 rounded-full border text-muted-foreground">
              v2.0
            </span>
          </div>
          <div className="flex items-center gap-4">
            <a
              href="https://github.com/EpicWise/prompt-genome-engine"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              GitHub
            </a>
            <span className="text-xs text-muted-foreground">by EpicWise</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full px-6 py-8">
        {/* Hero */}
        <GenomeHero />

        {/* Genome Interface — 30/70 split */}
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,3fr)_minmax(0,7fr)] gap-6 mt-8">
          {/* Input Panel */}
          <div className="flex flex-col gap-4">
            {/* Provider */}
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1.5">
                Provider
              </label>
              <div className="flex gap-2 mb-3">
                {PROVIDERS.map((p) => (
                  <button
                    key={p.value}
                    onClick={() => setProvider(p.value)}
                    className={cn(
                      'flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all border',
                      provider === p.value
                        ? 'bg-foreground text-background border-foreground'
                        : 'bg-background text-muted-foreground border-border hover:border-foreground/30'
                    )}
                  >
                    {p.label}
                  </button>
                ))}
              </div>

              {/* API Key */}
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-medium text-muted-foreground">
                  API Key
                </label>
                <button
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  {showApiKey ? 'Hide' : 'Show'}
                </button>
              </div>
              <input
                type={showApiKey ? 'text' : 'password'}
                placeholder={PROVIDERS.find(p => p.value === provider)?.placeholder}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm mb-3"
              />
              <p className="text-[10px] text-muted-foreground mb-3">
                Your key is sent directly to the provider. Never stored or logged.
              </p>
            </div>

            {/* Use Case */}
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1.5">
                Use Case
              </label>
              <input
                placeholder="e.g. RAG customer support chatbot"
                value={useCase}
                onChange={(e) => setUseCase(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm"
              />
            </div>

            {/* Prompt */}
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1.5">
                Prompt
              </label>
              <textarea
                placeholder="Paste your LLM prompt here..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm font-mono resize-y"
                style={{ minHeight: '240px' }}
              />
              <div className="mt-2 flex gap-3">
                {EXAMPLES.map((ex) => (
                  <button
                    key={ex.label}
                    onClick={() => { setPrompt(ex.prompt); setUseCase(ex.useCase) }}
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors underline underline-offset-2"
                  >
                    {ex.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Results Panel */}
          <div>
            <GenomeTab
              prompt={prompt}
              useCase={useCase}
              apiKey={apiKey}
              provider={provider}
              onPromptChange={setPrompt}
            />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t px-6 py-4">
        <div className="w-full flex items-center justify-between text-xs text-muted-foreground">
          <span>Prompt Genome Engine by EpicWise — MIT License</span>
          <div className="flex gap-4">
            <a
              href="https://github.com/EpicWise/prompt-genome-engine"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground transition-colors"
            >
              Source
            </a>
            <a
              href="https://github.com/EpicWise/prompt-genome-engine/blob/main/CONTRIBUTING.md"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground transition-colors"
            >
              Contribute
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}
