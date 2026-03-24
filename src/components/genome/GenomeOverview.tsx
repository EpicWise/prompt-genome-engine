'use client'

import type { GenomeResult } from '@/types/genome'
import { geneScoreColor } from '@/types/genome'

interface GenomeOverviewProps {
  result: GenomeResult
}

export function GenomeOverview({ result }: GenomeOverviewProps) {
  const color = geneScoreColor(result.overallScore)
  const pct = (result.overallScore / 5) * 100
  const r = 40
  const circ = 2 * Math.PI * r
  const offset = circ - (pct / 100) * circ

  return (
    <div className="flex items-center gap-6 p-4 border border-border rounded-lg bg-card">
      {/* Score ring */}
      <div className="flex flex-col items-center gap-1 shrink-0">
        <svg width="100" height="100" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r={r} fill="none" stroke="hsl(var(--border))" strokeWidth="6" />
          <circle
            cx="50" cy="50" r={r} fill="none"
            stroke={color} strokeWidth="6" strokeLinecap="round"
            strokeDasharray={circ} strokeDashoffset={offset}
            transform="rotate(-90 50 50)"
            style={{ transition: 'stroke-dashoffset 0.8s ease-out' }}
          />
          <text x="50" y="47" textAnchor="middle" fill={color} fontSize="22" fontWeight="700">
            {result.overallScore.toFixed(1)}
          </text>
          <text x="50" y="63" textAnchor="middle" fill="hsl(var(--muted-foreground))" fontSize="10">
            / 5.0
          </text>
        </svg>
      </div>

      {/* Summary */}
      <div className="space-y-2 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Genome Score</span>
          <span className={`text-xs px-2 py-0.5 rounded-full ${
            result.evolutionPotential === 'high' ? 'bg-red-50 text-red-700' :
            result.evolutionPotential === 'medium' ? 'bg-yellow-50 text-yellow-700' :
            'bg-green-50 text-green-700'
          }`}>
            {result.evolutionPotential} evolution potential
          </span>
        </div>
        <div className="text-xs text-muted-foreground">
          {result.genomeMap.presentGenes} of {result.genomeMap.totalGenes} genes present
          {result.genomeMap.missingGenes.length > 0 && (
            <> · Missing: {result.genomeMap.missingGenes.join(', ')}</>
          )}
        </div>
        <div className="text-xs text-muted-foreground">
          Strongest: <strong className="text-foreground">{result.genomeMap.strongestGene}</strong>
          {' · '}
          Weakest: <strong className="text-foreground">{result.genomeMap.weakestGene}</strong>
        </div>
      </div>
    </div>
  )
}
