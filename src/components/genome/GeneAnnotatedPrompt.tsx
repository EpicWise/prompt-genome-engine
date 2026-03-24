'use client'

import type { Gene, GeneType } from '@/types/genome'
import { GENE_TYPE_LABELS, geneScoreColor } from '@/types/genome'
import { cn } from '@/lib/utils'

interface GeneAnnotatedPromptProps {
  prompt: string
  genes: Gene[]
  selectedGene: GeneType | null
  onSelectGene: (type: GeneType) => void
}

/**
 * Displays the prompt with each gene region highlighted in its score color.
 * Genes with content are highlighted inline; missing genes are not shown
 * (they appear in the Gene Map Bar instead).
 */
export function GeneAnnotatedPrompt({
  prompt,
  genes,
  selectedGene,
  onSelectGene,
}: GeneAnnotatedPromptProps) {
  const presentGenes = genes
    .filter(g => g.content !== null && g.content.length > 0)
    .sort((a, b) => a.startLine - b.startLine)

  // Build annotated segments
  const lines = prompt.split('\n')
  const segments: Array<{
    text: string
    gene?: Gene
  }> = []

  // Simple approach: highlight each gene's content with a background color
  // by finding the gene text within the prompt
  let remainingPrompt = prompt
  const usedRanges: Array<[number, number]> = []

  for (const gene of presentGenes) {
    if (!gene.content) continue
    const idx = remainingPrompt.indexOf(gene.content.substring(0, 60))
    if (idx !== -1) {
      usedRanges.push([idx, idx + gene.content.length])
    }
  }

  // If we can't do precise matching, fall back to line-based highlighting
  if (presentGenes.length === 0) {
    segments.push({ text: prompt })
  } else {
    // Line-based highlighting using startLine/endLine
    const lineGeneMap = new Map<number, Gene>()
    for (const gene of presentGenes) {
      if (gene.startLine > 0) {
        for (let i = gene.startLine; i <= gene.endLine; i++) {
          lineGeneMap.set(i, gene)
        }
      }
    }

    let currentGene: Gene | undefined
    let currentText = ''

    for (let i = 0; i < lines.length; i++) {
      const lineNum = i + 1 // 1-based
      const gene = lineGeneMap.get(lineNum)

      if (gene !== currentGene) {
        if (currentText) {
          segments.push({ text: currentText, gene: currentGene })
        }
        currentText = lines[i]
        currentGene = gene
      } else {
        currentText += '\n' + lines[i]
      }
    }
    if (currentText) {
      segments.push({ text: currentText, gene: currentGene })
    }
  }

  return (
    <div className="border border-border rounded-lg bg-card p-4 space-y-2">
      <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
        Gene-Annotated Prompt
      </div>
      <div className="font-mono text-xs leading-relaxed whitespace-pre-wrap">
        {segments.map((seg, i) => {
          if (!seg.gene) {
            return <span key={i} className="text-muted-foreground/70">{seg.text}</span>
          }
          const color = geneScoreColor(seg.gene.score)
          const isSelected = selectedGene === seg.gene.type
          return (
            <span
              key={i}
              className={cn(
                'cursor-pointer rounded-sm px-0.5 transition-all',
                isSelected && 'ring-1 ring-foreground/30'
              )}
              style={{
                backgroundColor: `${color}15`,
                borderBottom: `2px solid ${color}`,
              }}
              onClick={() => onSelectGene(seg.gene!.type)}
              title={`${GENE_TYPE_LABELS[seg.gene.type]}: ${seg.gene.score}/5`}
            >
              {seg.text}
            </span>
          )
        })}
      </div>
    </div>
  )
}
