/**
 * Shared LLM client for multi-provider API calls.
 *
 * PROVIDER ROUTING:
 * ┌─────────────┬──────────────────────────────────────┐
 * │ anthropic   │ api.anthropic.com/v1/messages         │
 * │ openai      │ api.openai.com/v1/chat/completions   │
 * │ openrouter  │ openrouter.ai/api/v1/chat/completions│
 * └─────────────┴──────────────────────────────────────┘
 */

export type Provider = 'anthropic' | 'openai' | 'openrouter'

export interface LLMCallOptions {
  provider: Provider
  apiKey: string
  systemPrompt: string
  userMessage: string
  temperature?: number
  maxTokens?: number
  timeoutMs?: number
}

export interface LLMResponse {
  content: string
  usage?: { input: number; output: number }
}

export class LLMError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public provider: Provider
  ) {
    super(message)
    this.name = 'LLMError'
  }
}

// --- Provider configs ---

interface ProviderConfig {
  url: string
  model: string
  buildHeaders: (apiKey: string) => Record<string, string>
  buildBody: (
    model: string,
    systemPrompt: string,
    userMessage: string,
    opts: { temperature?: number; maxTokens: number }
  ) => Record<string, unknown>
  extractContent: (data: Record<string, unknown>) => string | null
  errorMessages: Record<number, string>
}

const chatCompletionExtractor = (data: Record<string, unknown>): string | null => {
  const choices = data?.choices as Array<{ message?: { content?: string } }> | undefined
  return choices?.[0]?.message?.content ?? null
}

const chatCompletionBodyBuilder = (
  model: string,
  systemPrompt: string,
  userMessage: string,
  opts: { temperature?: number; maxTokens: number }
) => ({
  model,
  max_tokens: opts.maxTokens,
  ...(opts.temperature !== undefined && { temperature: opts.temperature }),
  messages: [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userMessage },
  ],
})

const PROVIDER_CONFIG: Record<Provider, ProviderConfig> = {
  anthropic: {
    url: 'https://api.anthropic.com/v1/messages',
    model: 'claude-sonnet-4-20250514',
    buildHeaders: (apiKey) => ({
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    }),
    buildBody: (model, systemPrompt, userMessage, opts) => ({
      model,
      max_tokens: opts.maxTokens,
      ...(opts.temperature !== undefined && { temperature: opts.temperature }),
      system: systemPrompt,
      messages: [{ role: 'user', content: userMessage }],
    }),
    extractContent: (data) => {
      const content = data?.content as Array<{ text?: string }> | undefined
      return content?.[0]?.text ?? null
    },
    errorMessages: {
      401: 'Invalid API key. Check your Anthropic API key and try again.',
      429: 'Rate limited. Wait a moment and try again.',
      529: 'Anthropic API is overloaded. Try again in a few seconds.',
    },
  },
  openai: {
    url: 'https://api.openai.com/v1/chat/completions',
    model: 'gpt-4o',
    buildHeaders: (apiKey) => ({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    }),
    buildBody: chatCompletionBodyBuilder,
    extractContent: chatCompletionExtractor,
    errorMessages: {
      401: 'Invalid API key. Check your OpenAI API key and try again.',
      429: 'Rate limited. Wait a moment and try again.',
      503: 'OpenAI API is temporarily unavailable. Try again in a few seconds.',
    },
  },
  openrouter: {
    url: 'https://openrouter.ai/api/v1/chat/completions',
    model: 'anthropic/claude-sonnet-4',
    buildHeaders: (apiKey) => ({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
      'HTTP-Referer': 'https://promptlint.vercel.app',
      'X-Title': 'PromptLint',
    }),
    buildBody: chatCompletionBodyBuilder,
    extractContent: chatCompletionExtractor,
    errorMessages: {
      401: 'Invalid API key. Check your OpenRouter API key and try again.',
      429: 'Rate limited. Wait a moment and try again.',
      502: 'Upstream model error. Try again or pick a different model.',
    },
  },
}

// --- Core call function ---

export function cleanJsonResponse(raw: string): string {
  return raw
    .replace(/^```json\s*\n?/i, '')
    .replace(/\n?```\s*$/i, '')
    .trim()
}

export async function callLLM(options: LLMCallOptions): Promise<LLMResponse> {
  const {
    provider,
    apiKey,
    systemPrompt,
    userMessage,
    temperature,
    maxTokens = 8192,
    timeoutMs = 120_000,
  } = options

  const config = PROVIDER_CONFIG[provider]
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), timeoutMs)

  try {
    const response = await fetch(config.url, {
      method: 'POST',
      headers: config.buildHeaders(apiKey),
      body: JSON.stringify(
        config.buildBody(config.model, systemPrompt, userMessage, {
          temperature,
          maxTokens,
        })
      ),
      signal: controller.signal,
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      const message =
        config.errorMessages[response.status] ??
        (errorData as Record<string, unknown>)?.error?.toString() ??
        `API error (${response.status})`
      throw new LLMError(message, response.status, provider)
    }

    const data = await response.json()
    const content = config.extractContent(data)

    if (!content) {
      throw new LLMError('Empty response from the model.', 502, provider)
    }

    return { content }
  } catch (error) {
    if (error instanceof LLMError) throw error
    if ((error as Error).name === 'AbortError') {
      throw new LLMError(
        'LLM request timed out. Try again or switch provider.',
        504,
        provider
      )
    }
    throw new LLMError(
      `Connection failed: ${(error as Error).message}`,
      502,
      provider
    )
  } finally {
    clearTimeout(timeout)
  }
}

export async function callLLMJson<T = unknown>(
  options: LLMCallOptions
): Promise<T> {
  const response = await callLLM(options)
  const cleaned = cleanJsonResponse(response.content)
  try {
    return JSON.parse(cleaned) as T
  } catch {
    // Retry once
    const retry = await callLLM(options)
    const retryCleaned = cleanJsonResponse(retry.content)
    return JSON.parse(retryCleaned) as T
  }
}

export function llmErrorToResponse(error: unknown): Response {
  if (error instanceof LLMError) {
    return Response.json({ error: error.message }, { status: error.statusCode })
  }
  console.error('Unexpected LLM error:', error)
  return Response.json({ error: 'Internal server error' }, { status: 500 })
}
