import { z } from 'zod'
import { GENE_TYPES, MUTATION_OPERATORS } from '@/types/genome'

const providerSchema = z.enum(['anthropic', 'openai', 'openrouter'])

const baseRequestSchema = z.object({
  apiKey: z.string().min(1, 'API key is required'),
  provider: providerSchema,
})

export const lintRequestSchema = baseRequestSchema.extend({
  prompt: z.string().min(1, 'Prompt is required'),
  useCase: z.string().min(1, 'Use case is required'),
})

export const genomeRequestSchema = baseRequestSchema.extend({
  prompt: z.string().min(10, 'Prompt must be at least 10 characters').max(100_000, 'Prompt exceeds 100K character limit'),
  useCase: z.string().min(3, 'Use case must be at least 3 characters').max(200, 'Use case exceeds 200 characters'),
})

export const mutateRequestSchema = baseRequestSchema.extend({
  prompt: z.string().min(10, 'Prompt must be at least 10 characters'),
  geneType: z.enum(GENE_TYPES, `Invalid gene type. Valid: ${GENE_TYPES.join(', ')}`),
  mutationOperator: z.enum(MUTATION_OPERATORS, `Invalid operator. Valid: ${MUTATION_OPERATORS.join(', ')}`),
  useCase: z.string().min(1, 'Use case is required'),
})

export const interactRequestSchema = baseRequestSchema.extend({
  prompt: z.string().min(10, 'Prompt must be at least 10 characters'),
  genes: z.array(z.object({
    type: z.enum(GENE_TYPES),
    content: z.string().nullable(),
    score: z.number().min(1).max(5),
  })).min(2, 'At least 2 genes required for interaction analysis'),
  useCase: z.string().min(1, 'Use case is required'),
})

export function validateRequest<T>(schema: z.ZodSchema<T>, body: unknown):
  { success: true; data: T } | { success: false; error: string } {
  const result = schema.safeParse(body)
  if (result.success) return { success: true, data: result.data }
  const message = result.error.issues.map(i => i.message).join('; ')
  return { success: false, error: message }
}
