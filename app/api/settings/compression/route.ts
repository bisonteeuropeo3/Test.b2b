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
 * GET /api/settings/compression?api_key_id=xxx
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
      .select('compression_enabled, compression_model, compression_threshold')
      .eq('id', apiKeyId)
      .eq('user_id', userId)
      .single()

    if (keyData) {
      return NextResponse.json({
        compression_enabled: keyData.compression_enabled ?? false,
        compression_model: keyData.compression_model ?? 'gpt-4o-mini',
        compression_threshold: keyData.compression_threshold ?? 2000,
      })
    }
  }

  // Fallback: profile defaults
  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('compression_enabled, compression_model, compression_threshold')
    .eq('id', userId)
    .single()

  return NextResponse.json({
    compression_enabled: profile?.compression_enabled ?? false,
    compression_model: profile?.compression_model ?? 'gpt-4o-mini',
    compression_threshold: profile?.compression_threshold ?? 2000,
  })
}

/**
 * PATCH /api/settings/compression
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
  const validThresholds = [500, 1000, 2000, 4000, 8000]
  const updates: Record<string, any> = {}

  if (typeof body.compression_enabled === 'boolean') {
    updates.compression_enabled = body.compression_enabled
  }

  if (typeof body.compression_model === 'string') {
    if (!VALID_MODELS.includes(body.compression_model)) {
      return NextResponse.json(
        { error: `Model must be one of: ${VALID_MODELS.join(', ')}` },
        { status: 400 }
      )
    }
    updates.compression_model = body.compression_model
  }

  if (typeof body.compression_threshold === 'number') {
    if (!validThresholds.includes(body.compression_threshold)) {
      return NextResponse.json(
        { error: `Threshold must be one of: ${validThresholds.join(', ')}` },
        { status: 400 }
      )
    }
    updates.compression_threshold = body.compression_threshold
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 })
  }

  // Per-key update
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

  // Global update: profilo + tutte le key attive
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

  const { error: keysError } = await supabaseAdmin
    .from('api_keys')
    .update(updates)
    .eq('user_id', userId)
    .eq('is_active', true)

  if (keysError) {
    console.error('Failed to sync compression to api_keys:', keysError.message)
  }

  return NextResponse.json({ success: true, scope: 'global', ...updates })
}
