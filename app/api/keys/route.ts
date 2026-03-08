import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

// GET: Retrieve user's API key using email (for docs page)
export async function GET(request: NextRequest) {
    if (!supabaseUrl || !supabaseKey) {
        return NextResponse.json({
            apiKey: null,
            baseUrl: `${request.nextUrl.origin}/api/v1/proxy/openai`,
            message: 'Supabase not configured. Using placeholder key.'
        })
    }

    const supabase = createClient(supabaseUrl, supabaseKey)
    const email = request.nextUrl.searchParams.get('email')

    if (!email) {
        return NextResponse.json({
            apiKey: null,
            baseUrl: `${request.nextUrl.origin}/api/v1/proxy/openai`,
            message: 'No email provided'
        }, { status: 400 })
    }

    try {
        const { data: profile, error } = await supabase
            .from('profiles')
            .select('api_key')
            .eq('email', email)
            .single()

        if (error || !profile) {
            return NextResponse.json({
                apiKey: null,
                baseUrl: `${request.nextUrl.origin}/api/v1/proxy/openai`,
                message: 'Profile not found'
            }, { status: 404 })
        }

        return NextResponse.json({
            apiKey: profile.api_key,
            baseUrl: `${request.nextUrl.origin}/api/v1/proxy/openai`,
        })
    } catch (error) {
        console.error('Error fetching API key:', error)
        return NextResponse.json({
            apiKey: null,
            baseUrl: `${request.nextUrl.origin}/api/v1/proxy/openai`,
            message: 'Server error'
        }, { status: 500 })
    }
}

// POST: Generate a new API key for a user (for signup/onboarding)  
export async function POST(request: NextRequest) {
    if (!supabaseUrl || !supabaseKey) {
        // Return a demo key when Supabase is not configured
        const demoKey = 'tg_live_' + Array.from({ length: 48 }, () =>
            Math.random().toString(36).charAt(2)
        ).join('')

        return NextResponse.json({
            apiKey: demoKey,
            baseUrl: `${request.nextUrl.origin}/api/v1/proxy/openai`,
            message: 'Demo mode - Supabase not configured'
        })
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    try {
        const body = await request.json()
        const { email, companyName, monthlyBudget } = body

        if (!email) {
            return NextResponse.json({
                error: 'Email is required'
            }, { status: 400 })
        }

        // Check if profile already exists
        const { data: existing } = await supabase
            .from('profiles')
            .select('api_key')
            .eq('email', email)
            .single()

        if (existing) {
            return NextResponse.json({
                apiKey: existing.api_key,
                baseUrl: `${request.nextUrl.origin}/api/v1/proxy/openai`,
                message: 'Existing API key returned'
            })
        }

        // Generate API key
        const apiKey = 'tg_live_' + Array.from({ length: 48 }, () =>
            Math.random().toString(36).charAt(2)
        ).join('')

        // Create the profile  
        const { data: profile, error } = await supabase
            .from('profiles')
            .insert({
                email,
                company_name: companyName || null,
                monthly_budget: parseInt(monthlyBudget) || 100,
                api_key: apiKey,
                plan: 'free',
            })
            .select('api_key')
            .single()

        if (error) {
            console.error('Error creating profile:', error)
            return NextResponse.json({
                error: 'Failed to create profile',
                details: error.message
            }, { status: 500 })
        }

        return NextResponse.json({
            apiKey: profile?.api_key || apiKey,
            baseUrl: `${request.nextUrl.origin}/api/v1/proxy/openai`,
            message: 'API key generated successfully'
        })
    } catch (error) {
        console.error('Error in keys API:', error)
        return NextResponse.json({
            error: 'Server error'
        }, { status: 500 })
    }
}
