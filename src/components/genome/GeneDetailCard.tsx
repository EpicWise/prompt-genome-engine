'use client'

import type { Gene } from '@/types/genome'
import { GENE_TYPE_LABELS, geneScoreColor, geneScoreLabel } from '@/types/genome'

interface GeneDetailCardProps {
  gene: Gene
  onMutate?: () => void
}

export function GeneDetailCard({ gene, onMutate }: GeneDetailCardProps) {
  const color = geneScoreColor(gene.score)
  const label = geneScoreLabel(gene.score)

  return (
    <div className="border border-border rounded-lg bg-card p-4 space-y-3">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-sm font-semibold">
            {GENE_TYPE_LABELS[gene.type]} Gene
            {gene.content === null && (
              <span className="ml-2 text-xs text-muted-foreground font-normal">— Missing</span>
            )}
          </h3>
          <span className="text-xs text-muted-foreground">{label}</span>
        </div>
        <span
          className="text-2xl font-bold"
          style={{ color }}
        >
          {gene.score}/5
        </span>
      </div>

      <p className="text-sm text-muted-foreground leading-relaxed">{gene.feedback}</p>

      {/* Citations */}
      {gene.citations.length > 0 && (
        <div className="text-xs text-muted-foreground bg-muted/50 rounded p-2.5 space-y-1">
          {gene.citations.map((c, i) => (
            <div key={i} className="flex gap-1">
              <span className="shrink-0">📄</span>
              <span>
                <strong>{c.paper}</strong> — {c.finding}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Mutation suggestion */}
      {gene.suggestedMutation && (
        <div className="border border-dashed border-border rounded-lg p-3 space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground uppercase">
              Suggested Mutation
            </span>
            <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded-full">
              {gene.suggestedMutation.operator.replace(/_/g, ' ')}
            </span>
            {gene.suggestedMutation.technique && (
              <span className="text-[10px] bg-green-50 text-green-700 px-1.5 py-0.5 rounded-full">
                {gene.suggestedMutation.technique.replace(/-/g, ' ')}
              </span>
            )}
          </div>

          {gene.suggestedMutation.preview && (
            <pre className="text-xs bg-green-50 border-l-2 border-green-500 p-2 rounded whitespace-pre-wrap font-mono leading-relaxed">
              {gene.suggestedMutation.preview}
            </pre>
          )}

          {onMutate && (
            <button
              onClick={onMutate}
              className="text-xs bg-foreground text-background px-3 py-1.5 rounded-md hover:opacity-90 transition-opacity"
            >
              Apply Mutation
            </button>
          )}
        </div>
      )}
    </div>
  )
}
