import { describe, it, expect } from 'vitest'
import { findCitationByTechnique, findCitationsForGene, validateCitation, RESEARCH_CITATIONS } from '../research-citations'

describe('RESEARCH_CITATIONS', () => {
  it('has at least 10 entries', () => {
    expect(RESEARCH_CITATIONS.length).toBeGreaterThanOrEqual(10)
  })

  it('every entry has required fields', () => {
    for (const entry of RESEARCH_CITATIONS) {
      expect(entry.technique).toBeTruthy()
      expect(entry.description).toBeTruthy()
      expect(entry.applicableGenes.length).toBeGreaterThan(0)
      expect(entry.papers.length).toBeGreaterThan(0)
      expect(entry.papers[0].title).toBeTruthy()
      expect(entry.papers[0].authors).toBeTruthy()
      expect(entry.papers[0].year).toBeGreaterThan(2015)
    }
  })
})

describe('findCitationByTechnique', () => {
  it('finds exact match', () => {
    const result = findCitationByTechnique('chain-of-thought')
    expect(result).toBeDefined()
    expect(result!.technique).toBe('chain-of-thought')
  })

  it('finds partial match', () => {
    const result = findCitationByTechnique('few-shot')
    expect(result).toBeDefined()
  })

  it('returns undefined for unknown technique', () => {
    const result = findCitationByTechnique('quantum-entanglement-prompting')
    expect(result).toBeUndefined()
  })
})

describe('findCitationsForGene', () => {
  it('finds citations for examples gene', () => {
    const results = findCitationsForGene('examples')
    expect(results.length).toBeGreaterThan(0)
    expect(results.some(r => r.technique.includes('few-shot'))).toBe(true)
  })

  it('finds citations for reasoning gene', () => {
    const results = findCitationsForGene('reasoning')
    expect(results.length).toBeGreaterThan(0)
    expect(results.some(r => r.technique.includes('chain-of-thought'))).toBe(true)
  })
})

describe('validateCitation', () => {
  it('validates known technique', () => {
    expect(validateCitation('chain-of-thought')).toBe(true)
  })

  it('rejects unknown technique', () => {
    expect(validateCitation('made-up-technique')).toBe(false)
  })
})
