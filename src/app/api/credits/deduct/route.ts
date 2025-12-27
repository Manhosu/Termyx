import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { audit } from '@/lib/audit'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Verificar autenticacao
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Nao autorizado' }, { status: 401 })
    }

    // Obter documentId opcional do body (para logging)
    let documentId: string | undefined
    try {
      const body = await request.json()
      documentId = body?.documentId
    } catch {
      // Body vazio e OK
    }

    // Verificar creditos atuais
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('credits')
      .eq('id', user.id)
      .single()

    if (userError || !userData) {
      return NextResponse.json({ error: 'Usuario nao encontrado' }, { status: 404 })
    }

    if (userData.credits <= 0) {
      return NextResponse.json({
        error: 'Creditos insuficientes',
        code: 'NO_CREDITS',
        credits: 0
      }, { status: 402 })
    }

    // Deduzir credito usando funcao atomica
    const { data: newCredits, error: deductError } = await supabase
      .rpc('deduct_credit', { p_user_id: user.id })

    if (deductError) {
      console.error('Deduct credit error:', deductError)

      // Se o erro e de creditos insuficientes
      if (deductError.code === 'P0001') {
        return NextResponse.json({
          error: 'Creditos insuficientes',
          code: 'NO_CREDITS',
          credits: 0
        }, { status: 402 })
      }

      return NextResponse.json({ error: 'Erro ao deduzir credito' }, { status: 500 })
    }

    // Logar acao
    await audit.log({
      userId: user.id,
      action: 'credit_deducted',
      resourceType: 'credit',
      resourceId: documentId,
      payload: {
        previousCredits: userData.credits,
        newCredits: newCredits,
        documentId
      }
    })

    return NextResponse.json({
      success: true,
      newBalance: newCredits,
      previousBalance: userData.credits
    })

  } catch (error) {
    console.error('Credit deduction error:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
