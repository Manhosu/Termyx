import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { audit, AuditAction } from '@/lib/audit'

// Allowed actions from client
const ALLOWED_CLIENT_ACTIONS: AuditAction[] = [
  'user.login',
  'user.signup',
]

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Nao autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { action, payload } = body

    if (!action || !ALLOWED_CLIENT_ACTIONS.includes(action)) {
      return NextResponse.json({ error: 'Acao invalida' }, { status: 400 })
    }

    // Get IP address from headers
    const forwarded = request.headers.get('x-forwarded-for')
    const ipAddress = forwarded ? forwarded.split(',')[0] : request.headers.get('x-real-ip') || undefined

    // Log the action
    if (action === 'user.login') {
      await audit.userLogin(user.id, ipAddress)
    } else if (action === 'user.signup') {
      await audit.userSignup(user.id, payload)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Audit API error:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
