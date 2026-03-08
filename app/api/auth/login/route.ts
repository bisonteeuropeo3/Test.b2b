import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export async function POST(request: NextRequest) {
    if (!supabaseUrl || !supabaseAnonKey) {
        return NextResponse.json(
            { error: 'Supabase non configurato. Controlla le variabili d\'ambiente.' },
            { status: 500 }
        )
    }

    try {
        const body = await request.json()
        const { email, password } = body

        if (!email || !password) {
            return NextResponse.json(
                { error: 'Email e password sono obbligatori' },
                { status: 400 }
            )
        }

        const supabase = createClient(supabaseUrl, supabaseAnonKey)
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        })

        if (error) {
            console.error('Login error:', error)
            return NextResponse.json(
                { error: error.message },
                { status: 401 }
            )
        }

        return NextResponse.json({
            success: true,
            session: data.session,
            user: data.user,
            message: 'Login effettuato con successo!'
        })

    } catch (error) {
        console.error('Login error:', error)
        return NextResponse.json(
            { error: 'Errore del server. Riprova più tardi.' },
            { status: 500 }
        )
    }
}
