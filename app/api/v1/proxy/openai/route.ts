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

// CORS headers for external API access
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-TokenGuard-Key',
  'Access-Control-Max-Age': '86400',
}

// Handle CORS preflight requests (needed for external API calls)
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders,
  })
}

// Handle GET requests (e.g., /v1/models listing)
export async function GET(request: NextRequest) {
  const apiKey = request.headers.get('authorization')?.replace('Bearer ', '')

  if (!apiKey) {
    return NextResponse.json(
      { error: 'Missing OpenAI API key in Authorization header' },
      { status: 401, headers: corsHeaders }
    )
  }

  try {
    // Forward GET request to OpenAI (e.g., /v1/models)
    const openaiResponse = await fetch('https://api.openai.com/v1/models', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
    })

    const data = await openaiResponse.json()
    return NextResponse.json(data, {
      status: openaiResponse.status,
      headers: corsHeaders
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to reach OpenAI', message: (error as Error).message },
      { status: 502, headers: corsHeaders }
    )
  }
}

export async function POST(request: NextRequest) {
  const startTime = Date.now()

  try {
    const body = await request.json()
    const apiKey = request.headers.get('authorization')?.replace('Bearer ', '')
    const tokenGuardKey = request.headers.get('x-tokenguard-key')

    if (!apiKey) {
      return NextResponse.json(
        {
          error: {
            message: 'Missing OpenAI API key. Pass it via Authorization: Bearer YOUR_KEY',
            type: 'authentication_error',
            code: 'missing_api_key'
          }
        },
        { status: 401, headers: corsHeaders }
      )
    }

    if (!tokenGuardKey) {
      return NextResponse.json(
        {
          error: {
            message: 'Missing TokenGuard API key. Add the header: X-TokenGuard-Key: YOUR_TG_KEY',
            type: 'authentication_error',
            code: 'missing_tokenguard_key'
          }
        },
        { status: 401, headers: corsHeaders }
      )
    }

    // Check if Supabase is configured
    if (!supabaseAdmin) {
      return NextResponse.json(
        {
          error: {
            message: 'Server not configured. Supabase environment variables are missing.',
            type: 'server_error',
            code: 'missing_config'
          }
        },
        { status: 500, headers: corsHeaders }
      )
    }

    // Validate API key — resolve userId in priority order:
    // 1. api_keys table with user_id linked → use user_id (= profile/auth id)
    // 2. profiles table by api_key → use profile.id (= auth user id)
    // 3. auto-register in api_keys → use the api_keys row id as anonymous userId
    let userId: string | null = null
    let monthlyBudget = 100

    // 1. Check api_keys table (standalone keys)
    const { data: apiKeyEntry } = await supabaseAdmin
      .from('api_keys')
      .select('id, user_id, monthly_budget, is_active')
      .eq('api_key', tokenGuardKey)
      .eq('is_active', true)
      .single()

    if (apiKeyEntry) {
      if (apiKeyEntry.user_id) {
        // Key is linked to a real auth user — use that ID (matches profiles.id)
        userId = apiKeyEntry.user_id
      } else {
        // Key exists but no user_id: try to find matching profile by api_key
        const { data: profileByKey } = await supabaseAdmin
          .from('profiles')
          .select('id, monthly_budget')
          .eq('api_key', tokenGuardKey)
          .single()

        if (profileByKey) {
          // Link the api_keys entry to the profile for future lookups
          userId = profileByKey.id
          monthlyBudget = profileByKey.monthly_budget || 100
          supabaseAdmin.from('api_keys')
            .update({ user_id: profileByKey.id, last_used_at: new Date().toISOString() })
            .eq('id', apiKeyEntry.id)
            .then(() => { })
        } else {
          // Truly anonymous key — use the api_keys row id
          userId = apiKeyEntry.id
          monthlyBudget = apiKeyEntry.monthly_budget || 100
          supabaseAdmin.from('api_keys')
            .update({ last_used_at: new Date().toISOString() })
            .eq('id', apiKeyEntry.id)
            .then(() => { })
        }
      }
      monthlyBudget = apiKeyEntry.monthly_budget || monthlyBudget
    } else {
      // 2. Fallback: check profiles table (keys created via Supabase Auth signup)
      const { data: profileEntry } = await supabaseAdmin
        .from('profiles')
        .select('id, monthly_budget, api_key')
        .eq('api_key', tokenGuardKey)
        .single()

      if (profileEntry) {
        userId = profileEntry.id
        monthlyBudget = profileEntry.monthly_budget || 100
        // Also sync this key into api_keys table for faster future lookups
        supabaseAdmin.from('api_keys').upsert({
          api_key: tokenGuardKey,
          user_id: profileEntry.id,
          label: 'Synced from profile',
          plan: 'free',
          monthly_budget: profileEntry.monthly_budget || 100,
          is_active: true,
          last_used_at: new Date().toISOString(),
        }, { onConflict: 'api_key' }).then(() => { })
      } else {
        // 3. Key not found anywhere — auto-register as anonymous
        console.log('Auto-registering new API key:', tokenGuardKey.substring(0, 12) + '...')

        const { data: newKey, error: insertError } = await supabaseAdmin
          .from('api_keys')
          .insert({
            api_key: tokenGuardKey,
            label: 'Auto-registered',
            plan: 'free',
            monthly_budget: 100,
            is_active: true,
          })
          .select('id')
          .single()

        if (insertError || !newKey) {
          console.error('Failed to auto-register key:', insertError?.message)
          return NextResponse.json(
            {
              error: {
                message: 'Could not validate or register API key. Error: ' + (insertError?.message || 'unknown'),
                type: 'authentication_error',
                code: 'key_registration_failed'
              }
            },
            { status: 401, headers: corsHeaders }
          )
        }

        userId = newKey.id
        console.log('Auto-registered anonymous key with id:', newKey.id)
      }
    }

    // Safety check
    if (!userId) {
      return NextResponse.json(
        { error: { message: 'Authentication failed', type: 'authentication_error', code: 'no_user' } },
        { status: 401, headers: corsHeaders }
      )
    }

    const userData = { id: userId, monthly_budget: monthlyBudget }

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
      }, { headers: corsHeaders })
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
      return NextResponse.json(error, {
        status: openaiResponse.status,
        headers: corsHeaders
      })
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

    // Clean old cache entries (prevent memory leak)
    cleanCache()

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
    }, { headers: corsHeaders })

  } catch (error) {
    console.error('Proxy error:', error)
    return NextResponse.json(
      {
        error: {
          message: `Proxy error: ${(error as Error).message}`,
          type: 'server_error',
          code: 'proxy_error'
        }
      },
      { status: 500, headers: corsHeaders }
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
    'gpt-4o': { prompt: 0.005, completion: 0.015 },
    'gpt-4o-mini': { prompt: 0.00015, completion: 0.0006 },
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

function cleanCache() {
  const now = Date.now()
  const entries = Array.from(requestCache.entries())
  entries.forEach(([key, value]) => {
    if (now - value.timestamp > CACHE_TTL * 5) {
      requestCache.delete(key)
    }
  })
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

    const totalSpent = logs?.reduce((sum: number, log: Record<string, number>) => sum + ((log.cost_usd as number) || 0), 0) || 0
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
