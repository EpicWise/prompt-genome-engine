import { describe, it, expect } from 'vitest'
import { cleanJsonResponse, LLMError } from '../llm-client'

describe('cleanJsonResponse', () => {
  it('strips markdown json fences', () => {
    const raw = '```json\n{"key": "value"}\n```'
    expect(cleanJsonResponse(raw)).toBe('{"key": "value"}')
  })

  it('strips json fences case-insensitively', () => {
    const raw = '```JSON\n{"key": "value"}\n```'
    expect(cleanJsonResponse(raw)).toBe('{"key": "value"}')
  })

  it('returns clean JSON unchanged', () => {
    const raw = '{"key": "value"}'
    expect(cleanJsonResponse(raw)).toBe('{"key": "value"}')
  })

  it('trims whitespace', () => {
    const raw = '  \n {"key": "value"}  \n '
    expect(cleanJsonResponse(raw)).toBe('{"key": "value"}')
  })

  it('handles empty string', () => {
    expect(cleanJsonResponse('')).toBe('')
  })
})

describe('LLMError', () => {
  it('has correct properties', () => {
    const error = new LLMError('test message', 401, 'anthropic')
    expect(error.message).toBe('test message')
    expect(error.statusCode).toBe(401)
    expect(error.provider).toBe('anthropic')
    expect(error.name).toBe('LLMError')
  })

  it('is instanceof Error', () => {
    const error = new LLMError('test', 500, 'openai')
    expect(error).toBeInstanceOf(Error)
  })
})
