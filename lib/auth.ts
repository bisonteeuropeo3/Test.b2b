import { createClient } from '@supabase/supabase-js'
import { NextRequest } from 'next/server'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

/**
 * Extracts the access token from the Authorization header.
 * Expects: "Bearer <token>"
 */
function getTokenFromRequest(request: NextRequest): string | null {
    const authHeader = request.headers.get('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return null
    }
    return authHeader.replace('Bearer ', '')
}

/**
 * Verifies the Supabase session token and returns the authenticated user.
 * Returns null if the token is invalid or missing.
 */
export async function getAuthenticatedUser(request: NextRequest) {
    const token = getTokenFromRequest(request)
    if (!token) {
        return null
    }

    if (!supabaseUrl || !supabaseServiceKey) {
        return null
    }

    // Create a Supabase client with the user's JWT to verify it
    const supabaseAuth = createClient(supabaseUrl, supabaseServiceKey)

    try {
        const { data: { user }, error } = await supabaseAuth.auth.getUser(token)
        if (error || !user) {
            return null
        }
        return user
    } catch {
        return null
    }
}

/**
 * Helper to get the user_id from a profile given an auth user.
 * Since profiles.id = auth.users.id, this is simply user.id.
 */
export function getUserId(user: { id: string }): string {
    return user.id
}

/**
 * Creates a Supabase admin client (service_role, bypasses RLS).
 */
export function getSupabaseAdmin() {
    if (!supabaseUrl || !supabaseServiceKey) {
        return null
    }
    return createClient(supabaseUrl, supabaseServiceKey)
}
