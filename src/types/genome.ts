/**
 * Prompt Genome Engine — Core Types
 *
 * GENE TYPES (the genome vocabulary):
 * ┌─────────────┬────────────────────────────────────────┐
 * │ role        │ Identity, persona, purpose              │
 * │ task        │ Core instruction, the imperative        │
 * │ context     │ Background info, domain knowledge       │
 * │ taxonomy    │ Categories, types, definitions          │
 * │ output_format│ Response structure requirements        │
 * │ examples    │ Few-shot demonstrations                 │
 * │ reasoning   │ CoT scaffolding, step-by-step           │
 * │ constraints │ Behavioral boundaries                   │
 * │ guardrails  │ Validation, quality gates, fallbacks    │
 * └─────────────┴────────────────────────────────────────┘
 */

export const GENE_TYPES = [
  'role',
  'task',
  'context',
  'taxonomy',
  'output_format',
  'examples',
  'reasoning',
  'constraints',
  'guardrails',
] as const

export type GeneType = (typeof GENE_TYPES)[number]

export const GENE_TYPE_LABELS: Record<GeneType, string> = {
  role: 'Role',
  task: 'Task',
  context: 'Context',
  taxonomy: 'Taxonomy',
  output_format: 'Output Format',
  examples: 'Examples',
  reasoning: 'Reasoning',
  constraints: 'Constraints',
  guardrails: 'Guardrails',
}

export const MUTATION_OPERATORS = [
  'gene_insertion',
  'gene_replacement',
  'gene_strengthening',
  'gene_splitting',
] as const

export type MutationOperator = (typeof MUTATION_OPERATORS)[number]

// --- API Response Types ---

export interface Citation {
  paper: string
  title: string
  finding: string
  relevance: 'high' | 'medium' | 'low'
}

export interface Gene {
  type: GeneType
  content: string | null
  startLine: number
  endLine: number
  score: number // 1-5
  feedback: string
  citations: Citation[]
  suggestedMutation?: {
    operator: MutationOperator
    technique: string
    citation: string
    preview: string
  }
}

export interface GenomeMap {
  totalGenes: number
  presentGenes: number
  missingGenes: GeneType[]
  weakestGene: GeneType
  strongestGene: GeneType
}

export interface GenomeResult {
  genes: Gene[]
  genomeMap: GenomeMap
  overallScore: number
  evolutionPotential: 'low' | 'medium' | 'high'
}

export interface MutationResult {
  originalGene: string | null
  mutatedGene: string
  mutatedPrompt: string
  technique: string
  citation: string
  expectedImpact: string
}

export interface GeneInteraction {
  geneA: GeneType
  geneB: GeneType
  type: 'dependency' | 'conflict' | 'neutral'
  description: string
}

export interface InteractionResult {
  interactions: GeneInteraction[]
  summary: string
}

// --- Score color helpers ---

export function geneScoreColor(score: number): string {
  if (score >= 4) return '#16a34a' // green
  if (score >= 3) return '#ca8a04' // yellow
  if (score >= 2) return '#ea580c' // orange
  return '#dc2626' // red
}

export function geneScoreLabel(score: number): string {
  if (score >= 4) return 'Strong'
  if (score >= 3) return 'Adequate'
  if (score >= 2) return 'Weak'
  return 'Missing/Critical'
}
