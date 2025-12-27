import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()

    // Verificar autenticacao
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Nao autorizado' }, { status: 401 })
    }

    // Buscar dados do usuario
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('credits, plan_id, plans(slug, name)')
      .eq('id', user.id)
      .single()

    if (userError || !userData) {
      return NextResponse.json({ error: 'Usuario nao encontrado' }, { status: 404 })
    }

    const credits = userData.credits || 0
    const planSlug = (userData.plans as { slug: string; name: string } | null)?.slug || 'free'
    const planName = (userData.plans as { slug: string; name: string } | null)?.name || 'Free'
    const canCreate = credits > 0

    return NextResponse.json({
      canCreate,
      credits,
      plan: planSlug,
      planName,
      reason: !canCreate ? 'NO_CREDITS' : undefined
    })

  } catch (error) {
    console.error('Validate eligibility error:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
