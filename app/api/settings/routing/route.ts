import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const supabaseAdmin = supabaseUrl && supabaseKey
  ? createClient(supabaseUrl, supabaseKey)
  : null

async function getUserIdFromToken(request: NextRequest): Promise<string | null> {
  const authHeader = request.headers.get('authorization')
  if (!authHeader?.startsWith('Bearer ')) return null
  const token = authHeader.replace('Bearer ', '')
  if (!supabaseUrl || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) return null
  const userClient = createClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
  const { data: { user }, error } = await userClient.auth.getUser(token)
  if (error || !user) return null
  return user.id
}

const VALID_MODELS = [
  'gpt-4o-mini', 'gpt-4.1-mini', 'gpt-4.1-nano', 'gpt-4.1',
  'gpt-4o', 'gpt-5-mini', 'gpt-5-nano',
  'gpt-5', 'gpt-5.4', 'gpt-5.4-pro',
]

/**
 * GET /api/settings/routing?api_key_id=xxx
 * Se api_key_id è presente, legge le impostazioni della singola chiave.
 * Altrimenti legge i defaults dal profilo utente.
 */
export async function GET(request: NextRequest) {
  const userId = await getUserIdFromToken(request)
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!supabaseAdmin) return NextResponse.json({ error: 'Server not configured' }, { status: 500 })

  const apiKeyId = request.nextUrl.searchParams.get('api_key_id')

  // Per-key settings
  if (apiKeyId) {
    const { data: keyData } = await supabaseAdmin
      .from('api_keys')
      .select('routing_enabled, routing_cheap_model, routing_allowed_models')
      .eq('id', apiKeyId)
      .eq('user_id', userId)
      .single()

    if (keyData) {
      return NextResponse.json({
        routing_enabled: keyData.routing_enabled ?? false,
        routing_cheap_model: keyData.routing_cheap_model ?? 'gpt-4o-mini',
        routing_allowed_models: keyData.routing_allowed_models ?? ['gpt-4o-mini', 'gpt-5.4', 'gpt-5.4-pro'],
      })
    }
  }

  // Fallback: profile defaults
  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('routing_enabled, routing_cheap_model, routing_allowed_models')
    .eq('id', userId)
    .single()

  return NextResponse.json({
    routing_enabled: profile?.routing_enabled ?? false,
    routing_cheap_model: profile?.routing_cheap_model ?? 'gpt-4o-mini',
    routing_allowed_models: profile?.routing_allowed_models ?? ['gpt-4o-mini', 'gpt-5.4', 'gpt-5.4-pro'],
  })
}

/**
 * PATCH /api/settings/routing
 * Body opzionale: api_key_id per aggiornare una singola chiave.
 * Senza api_key_id aggiorna il profilo e tutte le active keys.
 */
export async function PATCH(request: NextRequest) {
  const userId = await getUserIdFromToken(request)
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!supabaseAdmin) return NextResponse.json({ error: 'Server not configured' }, { status: 500 })

  let body: Record<string, any>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const apiKeyId = body.api_key_id as string | undefined
  const updates: Record<string, any> = {}

  if (typeof body.routing_enabled === 'boolean') {
    updates.routing_enabled = body.routing_enabled
  }

  if (typeof body.routing_cheap_model === 'string') {
    if (!VALID_MODELS.includes(body.routing_cheap_model)) {
      return NextResponse.json(
        { error: `Model must be one of: ${VALID_MODELS.join(', ')}` },
        { status: 400 }
      )
    }
    updates.routing_cheap_model = body.routing_cheap_model
  }

  if (Array.isArray(body.routing_allowed_models)) {
    const invalid = body.routing_allowed_models.filter((m: string) => !VALID_MODELS.includes(m))
    if (invalid.length > 0) {
      return NextResponse.json(
        { error: `Invalid models: ${invalid.join(', ')}` },
        { status: 400 }
      )
    }
    if (body.routing_allowed_models.length === 0) {
      return NextResponse.json(
        { error: 'At least one model must be selected' },
        { status: 400 }
      )
    }
    updates.routing_allowed_models = body.routing_allowed_models
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 })
  }

  // Per-key update: aggiorna solo quella singola chiave
  if (apiKeyId) {
    const { error: keyError } = await supabaseAdmin
      .from('api_keys')
      .update(updates)
      .eq('id', apiKeyId)
      .eq('user_id', userId)

    if (keyError) {
      return NextResponse.json(
        { error: 'Failed to update key settings: ' + keyError.message },
        { status: 500 }
      )
    }
    return NextResponse.json({ success: true, scope: 'api_key', api_key_id: apiKeyId, ...updates })
  }

  // Global update: aggiorna profilo + tutte le key attive
  const { error: profileError } = await supabaseAdmin
    .from('profiles')
    .update(updates)
    .eq('id', userId)

  if (profileError) {
    return NextResponse.json(
      { error: 'Failed to update profile: ' + profileError.message },
      { status: 500 }
    )
  }

  // Sync to all active api_keys
  const { error: keysError } = await supabaseAdmin
    .from('api_keys')
    .update(updates)
    .eq('user_id', userId)
    .eq('is_active', true)

  if (keysError) {
    // Non-fatal: profilo aggiornato, keys no
    console.error('Failed to sync routing to api_keys:', keysError.message)
  }

  return NextResponse.json({ success: true, scope: 'global', ...updates })
}
