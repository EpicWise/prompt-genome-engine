import { NextRequest } from 'next/server'

export const maxDuration = 60

import { callLLMJson, llmErrorToResponse } from '@/lib/llm-client'
import { mutateRequestSchema, validateRequest } from '@/lib/schemas'
import { GENOME_MUTATE_SYSTEM_PROMPT, buildMutateUserMessage } from '@/prompts/genome-mutate'
import { findCitationByTechnique } from '@/data/research-citations'
import type { MutationResult } from '@/types/genome'

interface LLMMutateResponse {
  mutatedPrompt: string
  mutatedGene: string
  technique: string
  expectedImpact: string
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validation = validateRequest(mutateRequestSchema, body)
    if (!validation.success) {
      return Response.json({ error: validation.error }, { status: 400 })
    }

    const { prompt, geneType, mutationOperator, useCase, apiKey, provider } = validation.data

    // Get current gene content from the request body (optional)
    const geneContent = (body as Record<string, unknown>).geneContent as string | null ?? null

    const llmResult = await callLLMJson<LLMMutateResponse>({
      provider,
      apiKey,
      systemPrompt: GENOME_MUTATE_SYSTEM_PROMPT,
      userMessage: buildMutateUserMessage(prompt, geneType, mutationOperator, useCase, geneContent),
    })

    // Validate citation against our DB
    const citationMatch = findCitationByTechnique(llmResult.technique || '')
    const citation = citationMatch
      ? `${citationMatch.papers[0].authors} ${citationMatch.papers[0].year}`
      : ''

    const result: MutationResult = {
      originalGene: geneContent,
      mutatedGene: llmResult.mutatedGene || '',
      mutatedPrompt: llmResult.mutatedPrompt || prompt,
      technique: llmResult.technique || '',
      citation,
      expectedImpact: llmResult.expectedImpact || '',
    }

    return Response.json(result)
  } catch (error) {
    return llmErrorToResponse(error)
  }
}
