import { NextRequest } from 'next/server'

export const maxDuration = 60

import { callLLMJson, llmErrorToResponse } from '@/lib/llm-client'
import { interactRequestSchema, validateRequest } from '@/lib/schemas'
import { GENOME_INTERACT_SYSTEM_PROMPT, buildInteractUserMessage } from '@/prompts/genome-interact'
import { GENE_TYPES } from '@/types/genome'
import type { InteractionResult, GeneType } from '@/types/genome'

interface LLMInteractResponse {
  interactions: Array<{
    geneA: string
    geneB: string
    type: string
    description: string
  }>
  summary: string
}

function isValidGeneType(type: string): type is GeneType {
  return (GENE_TYPES as readonly string[]).includes(type)
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validation = validateRequest(interactRequestSchema, body)
    if (!validation.success) {
      return Response.json({ error: validation.error }, { status: 400 })
    }

    const { genes, useCase, apiKey, provider } = validation.data

    const llmResult = await callLLMJson<LLMInteractResponse>({
      provider,
      apiKey,
      systemPrompt: GENOME_INTERACT_SYSTEM_PROMPT,
      userMessage: buildInteractUserMessage(genes, useCase),
    })

    // Filter to only valid gene types that exist in the input
    const inputGeneTypes = new Set(genes.map(g => g.type))
    const validInteractions = (llmResult.interactions || [])
      .filter(i =>
        isValidGeneType(i.geneA) &&
        isValidGeneType(i.geneB) &&
        inputGeneTypes.has(i.geneA as GeneType) &&
        inputGeneTypes.has(i.geneB as GeneType) &&
        (i.type === 'dependency' || i.type === 'conflict')
      )
      .map(i => ({
        geneA: i.geneA as GeneType,
        geneB: i.geneB as GeneType,
        type: i.type as 'dependency' | 'conflict',
        description: i.description || '',
      }))

    const result: InteractionResult = {
      interactions: validInteractions,
      summary: llmResult.summary || '',
    }

    return Response.json(result)
  } catch (error) {
    return llmErrorToResponse(error)
  }
}
