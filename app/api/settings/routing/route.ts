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

/** GET /api/settings/routing — Read current routing settings */
export async function GET(request: NextRequest) {
  const userId = await getUserIdFromToken(request)
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!supabaseAdmin) return NextResponse.json({ error: 'Server not configured' }, { status: 500 })

  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('routing_enabled, routing_cheap_model, routing_allowed_models')
    .eq('id', userId)
    .single()

  return NextResponse.json({
    routing_enabled: profile?.routing_enabled ?? false,
    routing_cheap_model: profile?.routing_cheap_model ?? 'gpt-4o-mini',
    routing_allowed_models: profile?.routing_allowed_models ?? ['gpt-4o-mini', 'gpt-4o', 'gpt-4-turbo'],
  })
}

/** PATCH /api/settings/routing — Update routing settings */
export async function PATCH(request: NextRequest) {
  const userId = await getUserIdFromToken(request)
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!supabaseAdmin) return NextResponse.json({ error: 'Server not configured' }, { status: 500 })

  const body = await request.json()
  const validModels = [
    'gpt-4o-mini', 'gpt-4.1-mini', 'gpt-5.4', 'gpt-5.4-pro'
  ]
  const updates: Record<string, any> = {}

  if (typeof body.routing_enabled === 'boolean') {
    updates.routing_enabled = body.routing_enabled
  }

  if (typeof body.routing_cheap_model === 'string') {
    if (!validModels.includes(body.routing_cheap_model)) {
      return NextResponse.json(
        { error: `Model must be one of: ${validModels.join(', ')}` },
        { status: 400 }
      )
    }
    updates.routing_cheap_model = body.routing_cheap_model
  }

  if (Array.isArray(body.routing_allowed_models)) {
    const invalid = body.routing_allowed_models.filter((m: string) => !validModels.includes(m))
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

  const { error: profileError } = await supabaseAdmin
    .from('profiles')
    .update(updates)
    .eq('id', userId)

  if (profileError) {
    return NextResponse.json({ error: 'Failed to update: ' + profileError.message }, { status: 500 })
  }

  // Sync to api_keys
  await supabaseAdmin
    .from('api_keys')
    .update(updates)
    .eq('user_id', userId)
    .eq('is_active', true)

  return NextResponse.json({ success: true, ...updates })
}
