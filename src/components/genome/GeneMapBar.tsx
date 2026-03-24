'use client'

import { cn } from '@/lib/utils'
import type { Gene, GeneType } from '@/types/genome'
import { GENE_TYPE_LABELS, geneScoreColor } from '@/types/genome'

interface GeneMapBarProps {
  genes: Gene[]
  selectedGene: GeneType | null
  onSelectGene: (type: GeneType) => void
}

export function GeneMapBar({ genes, selectedGene, onSelectGene }: GeneMapBarProps) {
  const presentGenes = genes.filter(g => g.content !== null)
  const missingGenes = genes.filter(g => g.content === null)

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          Prompt Genome Map
        </h3>
        <span className="text-xs text-muted-foreground">
          {presentGenes.length} present · {missingGenes.length} missing
        </span>
      </div>

      {/* Gene bar — equal width segments */}
      <div className="grid h-12 rounded-lg overflow-hidden border border-border" style={{ gridTemplateColumns: `repeat(${genes.length}, 1fr)` }}>
        {/* Present genes first, then missing */}
        {presentGenes.map((gene) => (
          <button
            key={gene.type}
            className={cn(
              'flex items-center justify-center text-xs font-medium text-white transition-all hover:brightness-110 cursor-pointer',
              selectedGene === gene.type && 'ring-2 ring-white ring-inset'
            )}
            style={{ backgroundColor: geneScoreColor(gene.score) }}
            onClick={() => onSelectGene(gene.type)}
            title={`${GENE_TYPE_LABELS[gene.type]}: ${gene.score}/5`}
          >
            {GENE_TYPE_LABELS[gene.type]}
          </button>
        ))}
        {missingGenes.map((gene) => (
          <button
            key={gene.type}
            className={cn(
              'flex items-center justify-center text-xs font-medium transition-all cursor-pointer border-l border-dashed border-border',
              'bg-muted/50 text-muted-foreground hover:bg-muted',
              selectedGene === gene.type && 'ring-2 ring-foreground/20 ring-inset'
            )}
            onClick={() => onSelectGene(gene.type)}
            title={`${GENE_TYPE_LABELS[gene.type]}: Missing`}
          >
            {GENE_TYPE_LABELS[gene.type]} !
          </button>
        ))}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: '#16a34a' }} />
          Strong (4-5)
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: '#ca8a04' }} />
          Adequate (3)
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: '#ea580c' }} />
          Weak (2)
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: '#dc2626' }} />
          Missing (1)
        </span>
      </div>
    </div>
  )
}
