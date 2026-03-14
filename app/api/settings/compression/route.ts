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

/** GET /api/settings/compression — Read current compression settings */
export async function GET(request: NextRequest) {
  const userId = await getUserIdFromToken(request)
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!supabaseAdmin) return NextResponse.json({ error: 'Server not configured' }, { status: 500 })

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

/** PATCH /api/settings/compression — Update compression settings */
export async function PATCH(request: NextRequest) {
  const userId = await getUserIdFromToken(request)
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!supabaseAdmin) return NextResponse.json({ error: 'Server not configured' }, { status: 500 })

  const body = await request.json()
  const validModels = [
    'gpt-4o-mini', 'gpt-4.1-mini', 'gpt-5.4', 'gpt-5.4-pro'
  ]
  const validThresholds = [500, 1000, 2000, 4000, 8000]
  const updates: Record<string, any> = {}

  if (typeof body.compression_enabled === 'boolean') {
    updates.compression_enabled = body.compression_enabled
  }

  if (typeof body.compression_model === 'string') {
    if (!validModels.includes(body.compression_model)) {
      return NextResponse.json(
        { error: `Model must be one of: ${validModels.join(', ')}` },
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
