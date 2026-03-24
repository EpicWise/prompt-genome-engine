import { describe, it, expect } from 'vitest'
import { genomeRequestSchema, mutateRequestSchema, interactRequestSchema, validateRequest } from '../schemas'

describe('genomeRequestSchema', () => {
  const valid = { prompt: 'You are a helpful assistant. Answer questions.', useCase: 'Customer support', apiKey: 'sk-test', provider: 'anthropic' as const }

  it('accepts valid input', () => {
    const result = validateRequest(genomeRequestSchema, valid)
    expect(result.success).toBe(true)
  })

  it('rejects empty prompt', () => {
    const result = validateRequest(genomeRequestSchema, { ...valid, prompt: '' })
    expect(result.success).toBe(false)
  })

  it('rejects short prompt (<10 chars)', () => {
    const result = validateRequest(genomeRequestSchema, { ...valid, prompt: 'Hi' })
    expect(result.success).toBe(false)
  })

  it('rejects short use case (<3 chars)', () => {
    const result = validateRequest(genomeRequestSchema, { ...valid, useCase: 'Hi' })
    expect(result.success).toBe(false)
  })

  it('rejects missing apiKey', () => {
    const result = validateRequest(genomeRequestSchema, { ...valid, apiKey: '' })
    expect(result.success).toBe(false)
  })

  it('rejects invalid provider', () => {
    const result = validateRequest(genomeRequestSchema, { ...valid, provider: 'invalid' })
    expect(result.success).toBe(false)
  })
})

describe('mutateRequestSchema', () => {
  const valid = {
    prompt: 'You are a helpful assistant. Answer questions.',
    geneType: 'examples' as const,
    mutationOperator: 'gene_insertion' as const,
    useCase: 'Customer support',
    apiKey: 'sk-test',
    provider: 'anthropic' as const,
  }

  it('accepts valid input', () => {
    const result = validateRequest(mutateRequestSchema, valid)
    expect(result.success).toBe(true)
  })

  it('rejects invalid gene type', () => {
    const result = validateRequest(mutateRequestSchema, { ...valid, geneType: 'fake_gene' })
    expect(result.success).toBe(false)
  })

  it('rejects invalid mutation operator', () => {
    const result = validateRequest(mutateRequestSchema, { ...valid, mutationOperator: 'fake_op' })
    expect(result.success).toBe(false)
  })
})

describe('interactRequestSchema', () => {
  const valid = {
    prompt: 'You are a helpful assistant. Answer questions.',
    genes: [
      { type: 'role' as const, content: 'You are a helpful assistant', score: 4 },
      { type: 'task' as const, content: 'Answer questions', score: 3 },
    ],
    useCase: 'Customer support',
    apiKey: 'sk-test',
    provider: 'anthropic' as const,
  }

  it('accepts valid input', () => {
    const result = validateRequest(interactRequestSchema, valid)
    expect(result.success).toBe(true)
  })

  it('rejects fewer than 2 genes', () => {
    const result = validateRequest(interactRequestSchema, {
      ...valid,
      genes: [{ type: 'role', content: 'test', score: 3 }],
    })
    expect(result.success).toBe(false)
  })
})
