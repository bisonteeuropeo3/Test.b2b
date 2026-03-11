import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const supabaseAdmin = supabaseUrl && supabaseKey
  ? createClient(supabaseUrl, supabaseKey)
  : null

/**
 * Extracts the authenticated user ID from a Supabase JWT in the Authorization header.
 */
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

/**
 * GET /api/settings/cache — Read current semantic cache settings
 */
export async function GET(request: NextRequest) {
  const userId = await getUserIdFromToken(request)
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!supabaseAdmin) {
    return NextResponse.json({ error: 'Server not configured' }, { status: 500 })
  }

  const { data: profile, error } = await supabaseAdmin
    .from('profiles')
    .select('semantic_cache_enabled, semantic_cache_ttl_minutes')
    .eq('id', userId)
    .single()

  if (error || !profile) {
    return NextResponse.json({
      semantic_cache_enabled: false,
      semantic_cache_ttl_minutes: 60,
    })
  }

  return NextResponse.json({
    semantic_cache_enabled: profile.semantic_cache_enabled ?? false,
    semantic_cache_ttl_minutes: profile.semantic_cache_ttl_minutes ?? 60,
  })
}

/**
 * PATCH /api/settings/cache — Update semantic cache settings
 * Body: { semantic_cache_enabled?: boolean, semantic_cache_ttl_minutes?: number }
 */
export async function PATCH(request: NextRequest) {
  const userId = await getUserIdFromToken(request)
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!supabaseAdmin) {
    return NextResponse.json({ error: 'Server not configured' }, { status: 500 })
  }

  const body = await request.json()

  // Validate TTL options
  const validTtlValues = [5, 15, 30, 60, 360, 1440, 4320, 10080]
  const updates: Record<string, any> = {}

  if (typeof body.semantic_cache_enabled === 'boolean') {
    updates.semantic_cache_enabled = body.semantic_cache_enabled
  }

  if (typeof body.semantic_cache_ttl_minutes === 'number') {
    if (!validTtlValues.includes(body.semantic_cache_ttl_minutes)) {
      return NextResponse.json(
        { error: `TTL must be one of: ${validTtlValues.join(', ')}` },
        { status: 400 }
      )
    }
    updates.semantic_cache_ttl_minutes = body.semantic_cache_ttl_minutes
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 })
  }

  // Update profile
  const { error: profileError } = await supabaseAdmin
    .from('profiles')
    .update(updates)
    .eq('id', userId)

  if (profileError) {
    return NextResponse.json(
      { error: 'Failed to update settings: ' + profileError.message },
      { status: 500 }
    )
  }

  // Also update all active API keys for this user
  await supabaseAdmin
    .from('api_keys')
    .update(updates)
    .eq('user_id', userId)
    .eq('is_active', true)

  return NextResponse.json({ success: true, ...updates })
}
