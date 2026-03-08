import { NextRequest, NextResponse } from 'next/server'

// OpenAI Proxy Endpoint
// This intercepts API calls to log and analyze them

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const apiKey = request.headers.get('authorization')?.replace('Bearer ', '')
    const tokenGuardKey = request.headers.get('x-tokenguard-key')

    if (!apiKey) {
      return NextResponse.json(
        { error: 'Missing OpenAI API key' },
        { status: 401 }
      )
    }

    if (!tokenGuardKey) {
      return NextResponse.json(
        { error: 'Missing TokenGuard API key' },
        { status: 401 }
      )
    }

    // Forward request to OpenAI
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    const data = await openaiResponse.json()

    // Log the request (async, don't block response)
    logRequest(tokenGuardKey, body, data).catch(console.error)

    return NextResponse.json(data)
  } catch (error) {
    console.error('Proxy error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

async function logRequest(
  tokenGuardKey: string,
  request: any,
  response: any
) {
  try {
    // Calculate cost based on model and tokens
    const model = request.model || 'gpt-3.5-turbo'
    const promptTokens = response.usage?.prompt_tokens || 0
    const completionTokens = response.usage?.completion_tokens || 0
    
    const cost = calculateCost(model, promptTokens, completionTokens)

    // Log to Supabase
    await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/api_logs`, {
      method: 'POST',
      headers: {
        'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY!,
        'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal',
      },
      body: JSON.stringify({
        user_id: tokenGuardKey, // In production, map API key to user_id
        provider: 'openai',
        model,
        prompt_tokens: promptTokens,
        completion_tokens: completionTokens,
        total_tokens: promptTokens + completionTokens,
        cost_usd: cost,
        endpoint: '/v1/chat/completions',
      }),
    })
  } catch (error) {
    console.error('Failed to log request:', error)
  }
}

function calculateCost(model: string, promptTokens: number, completionTokens: number): number {
  // Pricing per 1K tokens
  const pricing: Record<string, { prompt: number; completion: number }> = {
    'gpt-4': { prompt: 0.03, completion: 0.06 },
    'gpt-4-turbo': { prompt: 0.01, completion: 0.03 },
    'gpt-3.5-turbo': { prompt: 0.0015, completion: 0.002 },
    'gpt-3.5-turbo-1106': { prompt: 0.001, completion: 0.002 },
  }

  const modelPricing = pricing[model] || pricing['gpt-3.5-turbo']
  
  return (
    (promptTokens / 1000) * modelPricing.prompt +
    (completionTokens / 1000) * modelPricing.completion
  )
}
