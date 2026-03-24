'use client'

import { useState, useCallback } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { DimensionsSection } from '@/components/ui/feature-section-with-hover-effects'
import { cn } from '@/lib/utils'
import { GenomeTab } from '@/components/genome/GenomeTab'
import { GenomeHero } from '@/components/genome/GenomeHero'

interface Dimension {
  name: string
  score: number | null
  summary: string
  feedback: string | null
}

interface Change {
  change: string
  dimension: string
  beforeAfter: string
}

interface LintResult {
  overallScore: number
  topStrength: string
  priorityFix: string
  dimensions: Dimension[]
  techniquesRecommended: string
  changesSummary: Change[]
  improvedPrompt: string
}

function ScoreBadge({ score }: { score: number | null }) {
  if (score === null) return <span className="text-sm text-muted-foreground">N/A</span>
  const color =
    score >= 4 ? 'text-green-600 bg-green-50' : score >= 3 ? 'text-yellow-600 bg-yellow-50' : 'text-red-600 bg-red-50'
  return (
    <span className={cn('inline-flex items-center justify-center w-10 h-10 rounded-lg font-bold text-lg', color)}>
      {score}
    </span>
  )
}

function OverallScore({ score }: { score: number }) {
  const strokeColor =
    score >= 4 ? '#16a34a' : score >= 3 ? '#ca8a04' : '#dc2626'
  const pct = (score / 5) * 100
  const r = 54
  const circ = 2 * Math.PI * r
  const offset = circ - (pct / 100) * circ
  return (
    <div className="flex flex-col items-center gap-2">
      <svg width="140" height="140" viewBox="0 0 140 140">
        <circle cx="70" cy="70" r={r} fill="none" stroke="hsl(var(--border))" strokeWidth="8" />
        <circle
          cx="70" cy="70" r={r} fill="none"
          stroke={strokeColor} strokeWidth="8" strokeLinecap="round"
          strokeDasharray={circ} strokeDashoffset={offset}
          transform="rotate(-90 70 70)"
          style={{ transition: 'stroke-dashoffset 0.8s ease-out' }}
        />
        <text x="70" y="65" textAnchor="middle" fill={strokeColor} fontSize="32" fontWeight="700">
          {score.toFixed(1)}
        </text>
        <text x="70" y="88" textAnchor="middle" fill="hsl(var(--muted-foreground))" fontSize="14">
          / 5.0
        </text>
      </svg>
      <span className="text-sm font-medium text-muted-foreground">
        Overall Score
      </span>
    </div>
  )
}

function LoadingDots() {
  return (
    <div className="flex items-center gap-1.5">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="w-2.5 h-2.5 rounded-full loading-dot bg-foreground"
        />
      ))}
    </div>
  )
}

const EXAMPLE_PROMPT = `You are a customer support chatbot. Answer questions about our product. Be helpful.`
const EXAMPLE_USECASE = `Customer support chatbot for a SaaS product`

type Provider = 'anthropic' | 'openai' | 'openrouter'

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
  const [keyVerified, setKeyVerified] = useState<boolean | null>(null)
  const [verifying, setVerifying] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<LintResult | null>(null)
  const [activeTab, setActiveTab] = useState<'report' | 'improved'>('report')
  const [copied, setCopied] = useState(false)
  const [showApiKey, setShowApiKey] = useState(false)
  const [mode, setMode] = useState<'lint' | 'genome'>('genome')

  const handleVerify = useCallback(async () => {
    if (!apiKey.trim()) {
      setError('Please enter an API key.')
      return
    }
    setVerifying(true)
    setError(null)
    setKeyVerified(null)

    try {
      const res = await fetch('/api/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey, provider }),
      })
      const data = await res.json()
      if (data.valid) {
        setKeyVerified(true)
      } else {
        setKeyVerified(false)
        setError(data.error || 'API key verification failed.')
      }
    } catch {
      setKeyVerified(false)
      setError('Network error. Could not verify key.')
    } finally {
      setVerifying(false)
    }
  }, [apiKey, provider])

  const handleLint = useCallback(async () => {
    if (!apiKey.trim()) {
      setError('API key is required.')
      return
    }
    if (!prompt.trim() || !useCase.trim()) {
      setError('Please fill in all fields.')
      return
    }
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const res = await fetch('/api/lint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, useCase, apiKey, provider }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Something went wrong.')
        return
      }
      setResult(data)
      setActiveTab('report')
    } catch {
      setError('Network error. Please check your connection.')
    } finally {
      setLoading(false)
    }
  }, [prompt, useCase, apiKey, provider])

  const handleCopy = useCallback(() => {
    if (!result?.improvedPrompt) return
    navigator.clipboard.writeText(result.improvedPrompt)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [result])

  const loadExample = useCallback(() => {
    setPrompt(EXAMPLE_PROMPT)
    setUseCase(EXAMPLE_USECASE)
    setResult(null)
    setError(null)
  }, [])

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      {/* Header */}
      <header className="border-b px-6 py-4">
        <div className="w-full flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-foreground flex items-center justify-center text-background font-bold text-sm">
              PL
            </div>
            <h1 className="text-lg font-semibold tracking-tight">PromptLint</h1>
            <span className="text-xs px-2 py-0.5 rounded-full border text-muted-foreground">
              v2.0
            </span>
          </div>
          <div className="flex items-center gap-4">
            <a
              href="https://github.com/EpicWise/promptlint"
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
        {/* Hero — changes based on mode */}
        <div className="text-center mb-6">
          {mode === 'lint' ? (
            <>
              <h2 className="text-3xl font-bold tracking-tight mb-3">
                Your prompt is only as strong as its weakest dimension
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Most prompts fail not because they&apos;re bad overall, but because they&apos;re
                blind in one area — missing context, no output contract, weak on edge cases.
                PromptLint scores your prompt across 7 critical dimensions so you can see
                exactly where it breaks before your users do.
              </p>
            </>
          ) : null}
        </div>

        {/* Mode Tabs */}
        <div className="flex gap-0 mb-6 border-b-2 border-border">
          <button
            onClick={() => setMode('lint')}
            className={cn(
              'px-5 py-2.5 text-sm font-medium border-b-2 -mb-[2px] transition-colors',
              mode === 'lint'
                ? 'text-foreground border-foreground'
                : 'text-muted-foreground border-transparent hover:text-foreground'
            )}
          >
            Lint
          </button>
          <button
            onClick={() => setMode('genome')}
            className={cn(
              'px-5 py-2.5 text-sm font-medium border-b-2 -mb-[2px] transition-colors',
              mode === 'genome'
                ? 'text-foreground border-foreground'
                : 'text-muted-foreground border-transparent hover:text-foreground'
            )}
          >
            Genome
          </button>
        </div>

        {mode === 'lint' && (
        <>
        {/* 7 Dimensions */}
        <DimensionsSection />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Panel */}
          <div className="flex flex-col gap-4">
            {/* Provider & API Key */}
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1.5">
                Provider
              </label>
              <div className="flex gap-2 mb-3">
                {PROVIDERS.map((p) => (
                  <button
                    key={p.value}
                    onClick={() => {
                      setProvider(p.value)
                      setKeyVerified(null)
                      setError(null)
                    }}
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
              <div className="flex gap-2">
                <input
                  type={showApiKey ? 'text' : 'password'}
                  value={apiKey}
                  onChange={(e) => {
                    setApiKey(e.target.value)
                    setKeyVerified(null)
                  }}
                  placeholder={PROVIDERS.find((p) => p.value === provider)?.placeholder}
                  className="flex-1 px-3 py-2.5 rounded-lg bg-background border border-input text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-colors font-mono"
                />
                <button
                  onClick={handleVerify}
                  disabled={verifying || !apiKey.trim()}
                  className={cn(
                    'px-4 py-2.5 rounded-lg text-sm font-medium transition-all border disabled:opacity-40 disabled:cursor-not-allowed',
                    keyVerified === true
                      ? 'bg-green-600 text-white border-green-600'
                      : keyVerified === false
                      ? 'bg-background text-foreground border-red-400'
                      : 'bg-background text-foreground border-border hover:border-foreground/30'
                  )}
                >
                  {verifying ? '...' : keyVerified === true ? 'Verified' : 'Verify'}
                </button>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Your key is sent directly to the provider — never stored or logged.
              </p>
            </div>

            {/* Use Case */}
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1.5">
                Use Case
              </label>
              <input
                type="text"
                value={useCase}
                onChange={(e) => setUseCase(e.target.value)}
                placeholder="e.g. Customer support chatbot for a SaaS product"
                className="w-full px-3 py-2.5 rounded-lg bg-background border border-input text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-colors"
              />
            </div>

            {/* Prompt */}
            <div className="flex-1 flex flex-col">
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-medium text-muted-foreground">
                  Prompt
                </label>
                <button
                  onClick={loadExample}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors underline underline-offset-2"
                >
                  Load example
                </button>
              </div>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Paste your LLM prompt here..."
                className="flex-1 min-h-[300px] w-full px-4 py-3 rounded-lg bg-background border border-input text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-colors resize-y leading-relaxed"
              />
            </div>

            {/* Lint Button */}
            <button
              onClick={handleLint}
              disabled={loading}
              className="w-full py-3 rounded-lg font-medium text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-foreground text-background hover:bg-foreground/80"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-3">
                  Evaluating <LoadingDots />
                </span>
              ) : (
                'Lint Prompt'
              )}
            </button>

            {error && (
              <div className="px-4 py-3 rounded-lg border border-red-300 bg-red-50 text-sm text-red-700">
                {error}
              </div>
            )}
          </div>

          {/* Results Panel */}
          <div className="flex flex-col gap-4">
            {!result && !loading && (
              <div className="flex-1 rounded-lg border border-dashed flex items-center justify-center min-h-[500px]">
                <div className="text-center max-w-xs">
                  <div className="text-4xl mb-3 opacity-20">&#123;&#125;</div>
                  <p className="text-muted-foreground text-sm mb-2">
                    Your scored evaluation will appear here
                  </p>
                  <p className="text-muted-foreground text-xs leading-relaxed">
                    Each dimension gets a 1–5 score with actionable feedback,
                    plus a production-ready improved prompt you can copy straight
                    into your codebase.
                  </p>
                </div>
              </div>
            )}

            {loading && (
              <div className="flex-1 rounded-lg border bg-muted flex items-center justify-center min-h-[500px]">
                <div className="text-center">
                  <LoadingDots />
                  <p className="text-muted-foreground text-sm mt-4">
                    Evaluating across 7 dimensions...
                  </p>
                  <p className="text-muted-foreground text-xs mt-1">
                    This usually takes 15-30 seconds
                  </p>
                </div>
              </div>
            )}

            {result && (
              <div className="flex flex-col gap-4">
                {/* Score Summary */}
                <div className="rounded-lg border p-6">
                  <div className="flex items-start gap-6">
                    <OverallScore score={result.overallScore} />
                    <div className="flex-1 min-w-0">
                      <div className="grid grid-cols-1 gap-3">
                        <div>
                          <span className="text-xs font-medium text-green-600">Top Strength</span>
                          <p className="text-sm text-muted-foreground mt-0.5">{result.topStrength}</p>
                        </div>
                        <div>
                          <span className="text-xs font-medium text-red-600">Priority Fix</span>
                          <p className="text-sm text-muted-foreground mt-0.5">{result.priorityFix}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Dimension Scores */}
                <div className="rounded-lg border p-4">
                  <h3 className="text-sm font-semibold mb-3">Dimension Scores</h3>
                  <div className="space-y-2">
                    {result.dimensions.map((d) => (
                      <div key={d.name} className="flex items-center gap-3">
                        <ScoreBadge score={d.score} />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium">{d.name}</div>
                          <div className="text-xs text-muted-foreground truncate">{d.summary}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Tabs: Report / Improved */}
                <div className="rounded-lg border overflow-hidden">
                  <div className="flex border-b">
                    <button
                      onClick={() => setActiveTab('report')}
                      className={cn(
                        'flex-1 px-4 py-2.5 text-sm font-medium transition-colors border-b-2',
                        activeTab === 'report'
                          ? 'text-foreground border-foreground'
                          : 'text-muted-foreground border-transparent hover:text-foreground'
                      )}
                    >
                      Detailed Feedback
                    </button>
                    <button
                      onClick={() => setActiveTab('improved')}
                      className={cn(
                        'flex-1 px-4 py-2.5 text-sm font-medium transition-colors border-b-2',
                        activeTab === 'improved'
                          ? 'text-foreground border-foreground'
                          : 'text-muted-foreground border-transparent hover:text-foreground'
                      )}
                    >
                      Improved Prompt
                    </button>
                  </div>

                  <div className="p-5 max-h-[500px] overflow-y-auto">
                    {activeTab === 'report' && (
                      <div>
                        {result.dimensions
                          .filter((d) => d.feedback)
                          .map((d) => (
                            <div key={d.name} className="mb-5 last:mb-0">
                              <div className="flex items-center gap-2 mb-2">
                                <ScoreBadge score={d.score} />
                                <h4 className="text-sm font-semibold">{d.name}</h4>
                              </div>
                              <div className="markdown-report text-sm">
                                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                  {d.feedback!}
                                </ReactMarkdown>
                              </div>
                            </div>
                          ))}

                        {result.dimensions.filter((d) => d.feedback).length === 0 && (
                          <p className="text-sm text-muted-foreground">
                            All dimensions scored well. Check the improved prompt for minor enhancements.
                          </p>
                        )}

                        {result.techniquesRecommended && (
                          <div className="mt-5 pt-5 border-t">
                            <h4 className="text-sm font-semibold mb-2">Recommended Techniques</h4>
                            <div className="markdown-report text-sm">
                              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                {result.techniquesRecommended}
                              </ReactMarkdown>
                            </div>
                          </div>
                        )}

                        {result.changesSummary?.length > 0 && (
                          <div className="mt-5 pt-5 border-t">
                            <h4 className="text-sm font-semibold mb-2">Changes Made</h4>
                            <div className="space-y-2">
                              {result.changesSummary.map((c, i) => (
                                <div
                                  key={i}
                                  className="text-xs p-3 rounded-lg bg-muted border"
                                >
                                  <span className="font-medium">{c.change}</span>
                                  <span className="text-muted-foreground"> — {c.dimension}</span>
                                  <div className="text-muted-foreground mt-1">{c.beforeAfter}</div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {activeTab === 'improved' && (
                      <div>
                        <div className="flex justify-end mb-3">
                          <button
                            onClick={handleCopy}
                            className="text-xs px-3 py-1.5 rounded-md border text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors"
                          >
                            {copied ? 'Copied!' : 'Copy to clipboard'}
                          </button>
                        </div>
                        <pre className="text-sm leading-relaxed whitespace-pre-wrap break-words p-4 rounded-lg bg-muted border text-foreground font-mono">
                          {result.improvedPrompt}
                        </pre>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        </>
        )}

        {mode === 'genome' && (
          <>
          <GenomeHero />
          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,3fr)_minmax(0,7fr)] gap-6 mt-8">
            {/* Input Panel (shared with lint) */}
            <div className="flex flex-col gap-4">
              {/* Provider & API Key */}
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1.5">
                  Provider
                </label>
                <div className="flex gap-2 mb-3">
                  {PROVIDERS.map((p) => (
                    <button
                      key={p.value}
                      onClick={() => {
                        setProvider(p.value)
                        setKeyVerified(null)
                        setError(null)
                      }}
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

                <label className="block text-sm font-medium text-muted-foreground mb-1.5">
                  API Key
                </label>
                <input
                  type="password"
                  placeholder={PROVIDERS.find(p => p.value === provider)?.placeholder}
                  value={apiKey}
                  onChange={(e) => { setApiKey(e.target.value); setKeyVerified(null) }}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm mb-3"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1.5">
                  Use Case
                </label>
                <input
                  placeholder="e.g. RAG customer support chatbot"
                  value={useCase}
                  onChange={(e) => setUseCase(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm mb-3"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1.5">
                  Prompt
                </label>
                <textarea
                  placeholder="Paste your prompt here..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm font-mono resize-y"
                  style={{ minHeight: '200px' }}
                />
              </div>
            </div>

            {/* Results Panel */}
            <div>
              <GenomeTab
                prompt={prompt}
                useCase={useCase}
                apiKey={apiKey}
                provider={provider}
              />
            </div>
          </div>
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t px-6 py-4">
        <div className="w-full flex items-center justify-between text-xs text-muted-foreground">
          <span>PromptLint by EpicWise — MIT License</span>
          <div className="flex gap-4">
            <a
              href="https://github.com/EpicWise/promptlint"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground transition-colors"
            >
              Source
            </a>
            <a
              href="https://github.com/EpicWise/promptlint/blob/main/CONTRIBUTING.md"
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
