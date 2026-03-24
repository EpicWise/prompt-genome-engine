import { NextRequest } from 'next/server'

// Allow up to 60s on Vercel (hobby plan max), locally unlimited
export const maxDuration = 60

import { callLLMJson, llmErrorToResponse } from '@/lib/llm-client'
import { genomeRequestSchema, validateRequest } from '@/lib/schemas'
import { GENOME_DECOMPOSE_SYSTEM_PROMPT, buildGenomeUserMessage } from '@/prompts/genome-decompose'
import { findCitationsForGene, findCitationByTechnique } from '@/data/research-citations'
import type { Gene, GenomeResult, GeneType, Citation } from '@/types/genome'
import { GENE_TYPES } from '@/types/genome'

interface LLMGenomeResponse {
  genes: Array<{
    type: string
    content: string | null
    startLine: number
    endLine: number
    score: number
    feedback: string
  }>
  missingGenes: string[]
  weakestGene: string
  strongestGene: string
  suggestedMutation: {
    geneType: string
    operator: string
    technique: string
    preview: string
    expectedImpact: string
  }
}

function enrichGeneWithCitations(gene: { type: GeneType; score: number; feedback: string }): Citation[] {
  const techniques = findCitationsForGene(gene.type)
  return techniques.slice(0, 2).map(t => ({
    paper: t.papers[0].authors,
    title: t.papers[0].title,
    finding: t.papers[0].finding,
    relevance: gene.score <= 2 ? 'high' as const : 'medium' as const,
  }))
}

function validateGeneType(type: string): type is GeneType {
  return (GENE_TYPES as readonly string[]).includes(type)
}

function calculateOverallScore(genes: Gene[]): number {
  const presentGenes = genes.filter(g => g.content !== null)
  if (presentGenes.length === 0) return 1
  const sum = presentGenes.reduce((acc, g) => acc + g.score, 0)
  return Math.round((sum / presentGenes.length) * 10) / 10
}

function calculateEvolutionPotential(genes: Gene[]): 'low' | 'medium' | 'high' {
  const missing = genes.filter(g => g.content === null).length
  const weak = genes.filter(g => g.score <= 2).length
  const total = missing + weak
  if (total >= 3) return 'high'
  if (total >= 1) return 'medium'
  return 'low'
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validation = validateRequest(genomeRequestSchema, body)
    if (!validation.success) {
      return Response.json({ error: validation.error }, { status: 400 })
    }

    const { prompt, useCase, apiKey, provider } = validation.data

    let llmResult: LLMGenomeResponse
    try {
      llmResult = await callLLMJson<LLMGenomeResponse>({
        provider,
        apiKey,
        systemPrompt: GENOME_DECOMPOSE_SYSTEM_PROMPT,
        userMessage: buildGenomeUserMessage(prompt, useCase),
        temperature: 0,
      })
    } catch (error) {
      // If JSON parsing failed after retry, return holistic fallback
      if (error instanceof SyntaxError) {
        return Response.json(
          { error: 'Prompt could not be decomposed into genes', fallback: 'holistic' },
          { status: 422 }
        )
      }
      throw error
    }

    // Validate gene count — fallback if too few
    const validGenes = (llmResult.genes || []).filter(g => validateGeneType(g.type))
    if (validGenes.length < 3) {
      return Response.json(
        { error: 'Prompt could not be decomposed into genes', fallback: 'holistic' },
        { status: 422 }
      )
    }

    // Enrich genes with validated citations
    const genes: Gene[] = validGenes.map(g => {
      const geneType = g.type as GeneType
      const citations = enrichGeneWithCitations({ type: geneType, score: g.score, feedback: g.feedback })

      // Build suggested mutation if this is the weakest gene
      let suggestedMutation: Gene['suggestedMutation']
      if (geneType === llmResult.weakestGene || geneType === llmResult.suggestedMutation?.geneType) {
        const technique = llmResult.suggestedMutation?.technique || ''
        const citation = findCitationByTechnique(technique)
        suggestedMutation = {
          operator: (llmResult.suggestedMutation?.operator || 'gene_strengthening') as Gene['suggestedMutation'] extends undefined ? never : NonNullable<Gene['suggestedMutation']>['operator'],
          technique: llmResult.suggestedMutation?.technique || '',
          citation: citation ? `${citation.papers[0].authors} ${citation.papers[0].year}` : '',
          preview: llmResult.suggestedMutation?.preview || '',
        }
      }

      return {
        type: geneType,
        content: g.content,
        startLine: g.startLine || 0,
        endLine: g.endLine || 0,
        score: Math.max(1, Math.min(5, Math.round(g.score))),
        feedback: g.feedback || '',
        citations,
        suggestedMutation,
      }
    })

    // Add entries for missing genes
    const presentTypes = new Set(genes.map(g => g.type))
    const missingGenes = (llmResult.missingGenes || [])
      .filter(t => validateGeneType(t) && !presentTypes.has(t as GeneType))
      .map(t => t as GeneType)

    for (const missing of missingGenes) {
      genes.push({
        type: missing,
        content: null,
        startLine: 0,
        endLine: 0,
        score: 1,
        feedback: `Missing. This gene would improve the prompt for the "${useCase}" use case.`,
        citations: enrichGeneWithCitations({ type: missing, score: 1, feedback: '' }),
        suggestedMutation: missing === llmResult.weakestGene ? {
          operator: 'gene_insertion',
          technique: llmResult.suggestedMutation?.technique || '',
          citation: '',
          preview: llmResult.suggestedMutation?.preview || '',
        } : undefined,
      })
    }

    const weakest = genes.reduce((a, b) => a.score <= b.score ? a : b)
    const strongest = genes.reduce((a, b) => a.score >= b.score ? a : b)

    const result: GenomeResult = {
      genes,
      genomeMap: {
        totalGenes: GENE_TYPES.length,
        presentGenes: genes.filter(g => g.content !== null).length,
        missingGenes,
        weakestGene: weakest.type,
        strongestGene: strongest.type,
      },
      overallScore: calculateOverallScore(genes),
      evolutionPotential: calculateEvolutionPotential(genes),
    }

    return Response.json(result)
  } catch (error) {
    return llmErrorToResponse(error)
  }
}
