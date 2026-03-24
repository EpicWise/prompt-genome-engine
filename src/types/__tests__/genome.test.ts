import { describe, it, expect } from 'vitest'
import { GENE_TYPES, GENE_TYPE_LABELS, geneScoreColor, geneScoreLabel } from '../genome'

describe('GENE_TYPES', () => {
  it('has 9 gene types', () => {
    expect(GENE_TYPES).toHaveLength(9)
  })

  it('includes all expected types', () => {
    expect(GENE_TYPES).toContain('role')
    expect(GENE_TYPES).toContain('task')
    expect(GENE_TYPES).toContain('examples')
    expect(GENE_TYPES).toContain('output_format')
    expect(GENE_TYPES).toContain('guardrails')
  })
})

describe('GENE_TYPE_LABELS', () => {
  it('has a label for every gene type', () => {
    for (const type of GENE_TYPES) {
      expect(GENE_TYPE_LABELS[type]).toBeTruthy()
    }
  })
})

describe('geneScoreColor', () => {
  it('returns green for high scores', () => {
    expect(geneScoreColor(5)).toBe('#16a34a')
    expect(geneScoreColor(4)).toBe('#16a34a')
  })

  it('returns yellow for score 3', () => {
    expect(geneScoreColor(3)).toBe('#ca8a04')
  })

  it('returns orange for score 2', () => {
    expect(geneScoreColor(2)).toBe('#ea580c')
  })

  it('returns red for score 1', () => {
    expect(geneScoreColor(1)).toBe('#dc2626')
  })
})

describe('geneScoreLabel', () => {
  it('returns correct labels', () => {
    expect(geneScoreLabel(5)).toBe('Strong')
    expect(geneScoreLabel(4)).toBe('Strong')
    expect(geneScoreLabel(3)).toBe('Adequate')
    expect(geneScoreLabel(2)).toBe('Weak')
    expect(geneScoreLabel(1)).toBe('Missing/Critical')
  })
})
