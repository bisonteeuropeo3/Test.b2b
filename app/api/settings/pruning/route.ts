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

/** GET /api/settings/pruning — Read current pruning settings */
export async function GET(request: NextRequest) {
  const userId = await getUserIdFromToken(request)
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!supabaseAdmin) return NextResponse.json({ error: 'Server not configured' }, { status: 500 })

  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('pruning_enabled, pruning_intensity')
    .eq('id', userId)
    .single()

  return NextResponse.json({
    pruning_enabled: profile?.pruning_enabled ?? false,
    pruning_intensity: profile?.pruning_intensity ?? 'medium',
  })
}

/** PATCH /api/settings/pruning — Update pruning settings */
export async function PATCH(request: NextRequest) {
  const userId = await getUserIdFromToken(request)
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!supabaseAdmin) return NextResponse.json({ error: 'Server not configured' }, { status: 500 })

  const body = await request.json()
  const validIntensities = ['low', 'medium', 'high']
  const updates: Record<string, any> = {}

  if (typeof body.pruning_enabled === 'boolean') {
    updates.pruning_enabled = body.pruning_enabled
  }

  if (typeof body.pruning_intensity === 'string') {
    if (!validIntensities.includes(body.pruning_intensity)) {
      return NextResponse.json(
        { error: `Intensity must be one of: ${validIntensities.join(', ')}` },
        { status: 400 }
      )
    }
    updates.pruning_intensity = body.pruning_intensity
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
