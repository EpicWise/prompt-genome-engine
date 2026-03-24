import { NextRequest } from 'next/server'
import type { Provider } from '@/lib/llm-client'

const VERIFY_CONFIG: Record<Provider, {
  url: string
  buildHeaders: (apiKey: string) => Record<string, string>
  body: string | null
  method: string
}> = {
  anthropic: {
    url: 'https://api.anthropic.com/v1/messages',
    method: 'POST',
    buildHeaders: (apiKey) => ({
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    }),
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1,
      messages: [{ role: 'user', content: 'Hi' }],
    }),
  },
  openai: {
    url: 'https://api.openai.com/v1/models',
    method: 'GET',
    buildHeaders: (apiKey) => ({
      'Authorization': `Bearer ${apiKey}`,
    }),
    body: null,
  },
  openrouter: {
    url: 'https://openrouter.ai/api/v1/auth/key',
    method: 'GET',
    buildHeaders: (apiKey) => ({
      'Authorization': `Bearer ${apiKey}`,
    }),
    body: null,
  },
}

function isValidProvider(value: string): value is Provider {
  return value === 'anthropic' || value === 'openai' || value === 'openrouter'
}

export async function POST(request: NextRequest) {
  try {
    const { apiKey, provider: rawProvider } = await request.json()

    if (!apiKey) {
      return Response.json({ error: 'API key is required.' }, { status: 400 })
    }

    const provider: Provider = isValidProvider(rawProvider) ? rawProvider : 'anthropic'
    const config = VERIFY_CONFIG[provider]

    const response = await fetch(config.url, {
      method: config.method,
      headers: config.buildHeaders(apiKey),
      ...(config.body ? { body: config.body } : {}),
    })

    if (response.status === 401 || response.status === 403) {
      return Response.json({ valid: false, error: 'Invalid API key.' }, { status: 200 })
    }

    if (!response.ok && response.status >= 500) {
      return Response.json(
        { valid: false, error: `Provider returned ${response.status}. Try again later.` },
        { status: 200 }
      )
    }

    return Response.json({ valid: true })
  } catch (error) {
    console.error('Verify API error:', error)
    return Response.json({ error: 'Verification failed.' }, { status: 500 })
  }
}
