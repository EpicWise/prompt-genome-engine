'use client'

import type { GeneInteraction } from '@/types/genome'
import { GENE_TYPE_LABELS } from '@/types/genome'

interface GeneInteractionMatrixProps {
  interactions: GeneInteraction[]
  summary: string
  loading?: boolean
}

export function GeneInteractionMatrix({ interactions, summary, loading }: GeneInteractionMatrixProps) {
  if (loading) {
    return (
      <div className="border border-border rounded-lg p-4 space-y-2">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          Gene Interactions
        </h3>
        <div className="text-xs text-muted-foreground animate-pulse">
          Analyzing inter-gene dependencies...
        </div>
      </div>
    )
  }

  const conflicts = interactions.filter(i => i.type === 'conflict')
  const dependencies = interactions.filter(i => i.type === 'dependency')

  return (
    <div className="border border-border rounded-lg bg-card p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          Gene Interactions
        </h3>
        <div className="flex gap-2 text-[10px]">
          {conflicts.length > 0 && (
            <span className="bg-red-50 text-red-700 px-1.5 py-0.5 rounded-full">
              {conflicts.length} conflict{conflicts.length > 1 ? 's' : ''}
            </span>
          )}
          {dependencies.length > 0 && (
            <span className="bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded-full">
              {dependencies.length} dependenc{dependencies.length > 1 ? 'ies' : 'y'}
            </span>
          )}
        </div>
      </div>

      {summary && (
        <p className="text-xs text-muted-foreground">{summary}</p>
      )}

      <div className="space-y-2">
        {conflicts.map((interaction, i) => (
          <div key={`c-${i}`} className="flex items-start gap-2 text-xs border-l-2 border-red-400 pl-2.5 py-1">
            <span className="text-red-600 font-medium shrink-0">
              {GENE_TYPE_LABELS[interaction.geneA]} ↔ {GENE_TYPE_LABELS[interaction.geneB]}
            </span>
            <span className="text-muted-foreground">{interaction.description}</span>
          </div>
        ))}
        {dependencies.map((interaction, i) => (
          <div key={`d-${i}`} className="flex items-start gap-2 text-xs border-l-2 border-blue-400 pl-2.5 py-1">
            <span className="text-blue-600 font-medium shrink-0">
              {GENE_TYPE_LABELS[interaction.geneA]} → {GENE_TYPE_LABELS[interaction.geneB]}
            </span>
            <span className="text-muted-foreground">{interaction.description}</span>
          </div>
        ))}
      </div>

      {interactions.length === 0 && (
        <p className="text-xs text-muted-foreground italic">
          No significant interactions detected between genes.
        </p>
      )}
    </div>
  )
}
