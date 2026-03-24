'use client'

import { useState, useCallback } from 'react'
import type { GenomeResult, GeneType } from '@/types/genome'
import { GeneMapBar } from './GeneMapBar'
import { GeneDetailCard } from './GeneDetailCard'
import { GeneAnnotatedPrompt } from './GeneAnnotatedPrompt'
import { GenomeOverview } from './GenomeOverview'

interface GenomeTabProps {
  prompt: string
  useCase: string
  apiKey: string
  provider: 'anthropic' | 'openai' | 'openrouter'
}

function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
      <div className="flex items-center gap-1.5 mb-3">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-2.5 h-2.5 rounded-full loading-dot bg-foreground"
          />
        ))}
      </div>
      <p className="text-sm">Decomposing prompt into genes...</p>
      <p className="text-xs mt-1">Analyzing 9 functional regions</p>
    </div>
  )
}

function EmptyState({ onAnalyze, disabled }: { onAnalyze: () => void; disabled: boolean }) {
  return (
    <div className="border-2 border-dashed border-border rounded-lg p-12 text-center">
      <div className="text-4xl mb-3">🧬</div>
      <h3 className="text-lg font-semibold mb-2">Prompt Genome Engine</h3>
      <p className="text-sm text-muted-foreground mb-4 max-w-md mx-auto">
        Decompose your prompt into functional genes — Role, Task, Context, Examples,
        and more. Score each independently. Mutate the weakest with research-backed techniques.
      </p>
      <button
        onClick={onAnalyze}
        disabled={disabled}
        className="bg-foreground text-background px-6 py-2.5 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
      >
        Decompose &amp; Score
      </button>
    </div>
  )
}

export function GenomeTab({ prompt, useCase, apiKey, provider }: GenomeTabProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<GenomeResult | null>(null)
  const [selectedGene, setSelectedGene] = useState<GeneType | null>(null)

  const handleAnalyze = useCallback(async () => {
    if (!prompt.trim() || !useCase.trim() || !apiKey.trim()) {
      setError('Please fill in the prompt, use case, and API key.')
      return
    }

    setLoading(true)
    setError(null)
    setResult(null)
    setSelectedGene(null)

    try {
      const res = await fetch('/api/genome', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, useCase, apiKey, provider }),
      })
      const data = await res.json()

      if (!res.ok) {
        if (data.fallback === 'holistic') {
          setError('This prompt\'s structure is too ambiguous for gene-level analysis. Try the Lint tab for holistic evaluation.')
        } else {
          setError(data.error || 'Genome analysis failed.')
        }
        return
      }

      setResult(data as GenomeResult)
      // Auto-select weakest gene
      if (data.genomeMap?.weakestGene) {
        setSelectedGene(data.genomeMap.weakestGene)
      }
    } catch {
      setError('Network error. Please check your connection.')
    } finally {
      setLoading(false)
    }
  }, [prompt, useCase, apiKey, provider])

  const selectedGeneData = result?.genes.find(g => g.type === selectedGene)

  const canAnalyze = prompt.trim().length >= 10 && useCase.trim().length >= 3 && apiKey.trim().length > 0

  if (loading) return <LoadingState />
  if (!result) return (
    <div className="space-y-3">
      <EmptyState onAnalyze={handleAnalyze} disabled={!canAnalyze} />
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
          {error}
        </div>
      )}
    </div>
  )

  return (
    <div className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Overview score */}
      <GenomeOverview result={result} />

      {/* Gene Map Bar */}
      <GeneMapBar
        genes={result.genes}
        selectedGene={selectedGene}
        onSelectGene={setSelectedGene}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left: Annotated prompt */}
        <GeneAnnotatedPrompt
          prompt={prompt}
          genes={result.genes}
          selectedGene={selectedGene}
          onSelectGene={setSelectedGene}
        />

        {/* Right: Selected gene detail */}
        <div>
          {selectedGeneData ? (
            <GeneDetailCard gene={selectedGeneData} />
          ) : (
            <div className="border border-dashed border-border rounded-lg p-8 text-center text-sm text-muted-foreground">
              Click a gene in the map above to see details
            </div>
          )}
        </div>
      </div>

      {/* Re-analyze button */}
      <div className="flex justify-end">
        <button
          onClick={handleAnalyze}
          disabled={loading}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          Re-analyze
        </button>
      </div>
    </div>
  )
}
