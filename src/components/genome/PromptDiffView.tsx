'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'

interface PromptDiffViewProps {
  original: string
  mutated: string
  technique: string
  citation: string
  expectedImpact: string
  onApply: () => void
  onDismiss: () => void
}

/**
 * Inline diff view showing before/after of a gene mutation.
 * Highlights added lines in green and removed lines in red.
 */
export function PromptDiffView({
  original,
  mutated,
  technique,
  citation,
  expectedImpact,
  onApply,
  onDismiss,
}: PromptDiffViewProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(mutated)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Simple line-based diff
  const originalLines = original.split('\n')
  const mutatedLines = mutated.split('\n')

  // Find first and last differing lines
  let firstDiff = 0
  while (firstDiff < originalLines.length && firstDiff < mutatedLines.length && originalLines[firstDiff] === mutatedLines[firstDiff]) {
    firstDiff++
  }
  let lastSameOriginal = originalLines.length - 1
  let lastSameMutated = mutatedLines.length - 1
  while (lastSameOriginal > firstDiff && lastSameMutated > firstDiff && originalLines[lastSameOriginal] === mutatedLines[lastSameMutated]) {
    lastSameOriginal--
    lastSameMutated--
  }

  return (
    <div className="border border-border rounded-lg bg-card overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-border bg-muted/30">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Mutation Preview</span>
          {technique && (
            <span className="text-[10px] bg-green-50 text-green-700 px-1.5 py-0.5 rounded-full">
              {technique.replace(/-/g, ' ')}
            </span>
          )}
          {citation && (
            <span className="text-[10px] text-muted-foreground">
              {citation}
            </span>
          )}
        </div>
      </div>

      {/* Impact */}
      {expectedImpact && (
        <div className="px-4 py-2 text-xs text-muted-foreground border-b border-border bg-green-50/50">
          Expected: {expectedImpact}
        </div>
      )}

      {/* Diff content */}
      <div className="font-mono text-xs leading-relaxed max-h-96 overflow-y-auto">
        {/* Context before */}
        {firstDiff > 0 && (
          <div className="px-4 py-1 text-muted-foreground/60">
            {originalLines.slice(Math.max(0, firstDiff - 2), firstDiff).map((line, i) => (
              <div key={`ctx-before-${i}`} className="py-0.5">{line || '\u00A0'}</div>
            ))}
          </div>
        )}

        {/* Removed lines */}
        {originalLines.slice(firstDiff, lastSameOriginal + 1).map((line, i) => (
          <div key={`rm-${i}`} className={cn('px-4 py-0.5', 'bg-red-50 text-red-800')}>
            <span className="text-red-400 mr-2">-</span>{line || '\u00A0'}
          </div>
        ))}

        {/* Added lines */}
        {mutatedLines.slice(firstDiff, lastSameMutated + 1).map((line, i) => (
          <div key={`add-${i}`} className={cn('px-4 py-0.5', 'bg-green-50 text-green-800')}>
            <span className="text-green-400 mr-2">+</span>{line || '\u00A0'}
          </div>
        ))}

        {/* Context after */}
        {lastSameOriginal < originalLines.length - 1 && (
          <div className="px-4 py-1 text-muted-foreground/60">
            {originalLines.slice(lastSameOriginal + 1, lastSameOriginal + 3).map((line, i) => (
              <div key={`ctx-after-${i}`} className="py-0.5">{line || '\u00A0'}</div>
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 px-4 py-3 border-t border-border">
        <button
          onClick={onApply}
          className="text-xs bg-foreground text-background px-4 py-1.5 rounded-md hover:opacity-90 transition-opacity"
        >
          Apply Mutation
        </button>
        <button
          onClick={handleCopy}
          className="text-xs border border-border px-4 py-1.5 rounded-md hover:bg-muted transition-colors"
        >
          {copied ? 'Copied!' : 'Copy Mutated'}
        </button>
        <button
          onClick={onDismiss}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors ml-auto"
        >
          Dismiss
        </button>
      </div>
    </div>
  )
}
