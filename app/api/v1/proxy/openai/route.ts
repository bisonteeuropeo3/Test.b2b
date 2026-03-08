import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Initialize Supabase admin client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabaseAdmin = supabaseUrl && supabaseKey 
  ? createClient(supabaseUrl, supabaseKey)
  : null

// In-memory cache for duplicate detection (in production use Redis)
const requestCache = new Map<string, { response: any; timestamp: number }>()
const CACHE_TTL = 60000 // 1 minute

export async function POST(request: NextRequest) {
  const startTime = Date.now()
  
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
        { error: 'Missing TokenGuard API key. Add X-TokenGuard-Key header' },
        { status: 401 }
      )
    }

    // Check if Supabase is configured
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Server configuration error. Please check environment variables.' },
        { status: 500 }
      )
    }

    // Validate API key and get user
    const { data: userData, error: userError } = await supabaseAdmin
      .from('profiles')
      .select('id, monthly_budget')
      .eq('api_key', tokenGuardKey)
      .single()

    if (userError || !userData) {
      return NextResponse.json(
        { error: 'Invalid TokenGuard API key' },
        { status: 401 }
      )
    }

    // Generate prompt hash for duplicate detection
    const promptHash = generatePromptHash(body)
    const cacheKey = `${userData.id}:${promptHash}`
    
    // Check cache for duplicate
    const cached = requestCache.get(cacheKey)
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      // Log as cached response
      await logRequest({
        userId: userData.id,
        provider: 'openai',
        model: body.model || 'gpt-3.5-turbo',
        promptTokens: cached.response.usage?.prompt_tokens || 0,
        completionTokens: cached.response.usage?.completion_tokens || 0,
        cost: 0, // No cost for cached response
        endpoint: '/v1/chat/completions',
        cached: true,
        promptHash,
        latency: Date.now() - startTime,
      })

      return NextResponse.json({
        ...cached.response,
        _tokenguard: { cached: true, saved: true }
      })
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

    if (!openaiResponse.ok) {
      const error = await openaiResponse.json()
      return NextResponse.json(error, { status: openaiResponse.status })
    }

    const data = await openaiResponse.json()
    const latency = Date.now() - startTime

    // Calculate cost
    const model = body.model || 'gpt-3.5-turbo'
    const promptTokens = data.usage?.prompt_tokens || 0
    const completionTokens = data.usage?.completion_tokens || 0
    const cost = calculateCost(model, promptTokens, completionTokens)

    // Log the request
    await logRequest({
      userId: userData.id,
      provider: 'openai',
      model,
      promptTokens,
      completionTokens,
      cost,
      endpoint: '/v1/chat/completions',
      cached: false,
      promptHash,
      latency,
    })

    // Cache the response
    requestCache.set(cacheKey, { response: data, timestamp: Date.now() })

    // Check budget alert
    await checkBudgetAlert(userData.id, userData.monthly_budget)

    return NextResponse.json({
      ...data,
      _tokenguard: { 
        logged: true, 
        cost,
        latency,
        cached: false 
      }
    })

  } catch (error) {
    console.error('Proxy error:', error)
    return NextResponse.json(
      { error: 'Internal server error', message: (error as Error).message },
      { status: 500 }
    )
  }
}

// Helper functions
function generatePromptHash(body: any): string {
  // Simple hash based on model and messages
  const content = JSON.stringify({
    model: body.model,
    messages: body.messages,
    temperature: body.temperature,
  })
  return btoa(content).slice(0, 32)
}

function calculateCost(model: string, promptTokens: number, completionTokens: number): number {
  const pricing: Record<string, { prompt: number; completion: number }> = {
    'gpt-4': { prompt: 0.03, completion: 0.06 },
    'gpt-4-turbo': { prompt: 0.01, completion: 0.03 },
    'gpt-4-turbo-preview': { prompt: 0.01, completion: 0.03 },
    'gpt-3.5-turbo': { prompt: 0.0015, completion: 0.002 },
    'gpt-3.5-turbo-1106': { prompt: 0.001, completion: 0.002 },
    'gpt-3.5-turbo-0125': { prompt: 0.0005, completion: 0.0015 },
  }

  const modelPricing = pricing[model] || pricing['gpt-3.5-turbo']
  
  return Number((
    (promptTokens / 1000) * modelPricing.prompt +
    (completionTokens / 1000) * modelPricing.completion
  ).toFixed(6))
}

async function logRequest(params: {
  userId: string
  provider: string
  model: string
  promptTokens: number
  completionTokens: number
  cost: number
  endpoint: string
  cached: boolean
  promptHash: string
  latency: number
}) {
  if (!supabaseAdmin) {
    console.error('Supabase not configured, skipping log')
    return
  }
  try {
    await supabaseAdmin.from('api_logs').insert({
      user_id: params.userId,
      provider: params.provider,
      model: params.model,
      prompt_tokens: params.promptTokens,
      completion_tokens: params.completionTokens,
      total_tokens: params.promptTokens + params.completionTokens,
      cost_usd: params.cost,
      endpoint: params.endpoint,
      cached: params.cached,
      prompt_hash: params.promptHash,
      latency_ms: params.latency,
    })
  } catch (error) {
    console.error('Failed to log request:', error)
  }
}

async function checkBudgetAlert(userId: string, monthlyBudget: number) {
  if (!supabaseAdmin) return
  try {
    // Get current month's spending
    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)

    const { data: logs } = await supabaseAdmin
      .from('api_logs')
      .select('cost_usd')
      .eq('user_id', userId)
      .gte('created_at', startOfMonth.toISOString())

    const totalSpent = logs?.reduce((sum, log) => sum + (log.cost_usd || 0), 0) || 0
    const percentage = (totalSpent / monthlyBudget) * 100

    // Check if we should send alert (80% threshold)
    if (percentage >= 80 && percentage < 100) {
      // Check if alert already sent today
      const today = new Date().toISOString().split('T')[0]
      const { data: existingAlert } = await supabaseAdmin
        .from('budget_alerts')
        .select('*')
        .eq('user_id', userId)
        .eq('alert_type', 'threshold')
        .gte('created_at', today)
        .single()

      if (!existingAlert) {
        await supabaseAdmin.from('budget_alerts').insert({
          user_id: userId,
          alert_type: 'threshold',
          message: `You've reached ${percentage.toFixed(0)}% of your monthly budget ($${totalSpent.toFixed(2)} / $${monthlyBudget})`,
        })
      }
    }
  } catch (error) {
    console.error('Failed to check budget:', error)
  }
}
