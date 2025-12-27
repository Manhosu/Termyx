import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { rateLimiters, getRateLimitHeaders } from '@/lib/rate-limit'
import { isValidUUID } from '@/lib/validation'

/**
 * POST /api/documents/duplicate
 * Duplicate an existing document
 *
 * Body:
 * - documentId: string - ID of the document to duplicate
 * - newTitle?: string - Optional new title (defaults to "Copy of [original]")
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Verify authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Rate limiting
    const rateLimitResult = rateLimiters.standard(user.id)
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429, headers: getRateLimitHeaders(rateLimitResult) }
      )
    }

    const body = await request.json()
    const { documentId, newTitle } = body

    // Validate document ID
    if (!documentId || !isValidUUID(documentId)) {
      return NextResponse.json({ error: 'Invalid document ID' }, { status: 400 })
    }

    // VERIFICACAO DE CREDITOS - Buscar creditos do usuario
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('credits')
      .eq('id', user.id)
      .single()

    if (userError || !userData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Bloquear se sem creditos
    if (userData.credits <= 0) {
      return NextResponse.json({
        error: 'Creditos insuficientes. Compre creditos ou assine um plano para continuar.',
        code: 'NO_CREDITS',
        credits: 0
      }, { status: 402 })
    }

    // Get original document
    const { data: originalDoc, error: fetchError } = await supabase
      .from('documents')
      .select('*')
      .eq('id', documentId)
      .eq('user_id', user.id)
      .single()

    if (fetchError || !originalDoc) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 })
    }

    // Create duplicate document
    const duplicateTitle = newTitle || `Copia de ${originalDoc.title}`

    const { data: newDoc, error: insertError } = await supabase
      .from('documents')
      .insert({
        user_id: user.id,
        template_id: originalDoc.template_id,
        title: duplicateTitle,
        content: originalDoc.content,
        data: originalDoc.data,
        status: 'draft', // Always start as draft
      })
      .select(`
        id,
        title,
        status,
        created_at,
        templates (
          id,
          name,
          category
        )
      `)
      .single()

    if (insertError) {
      // Se RLS bloqueou por falta de creditos
      if (insertError.code === '42501' || insertError.message?.includes('credits')) {
        return NextResponse.json({
          error: 'Creditos insuficientes',
          code: 'NO_CREDITS',
          credits: 0
        }, { status: 402 })
      }
      console.error('Document duplication error:', insertError)
      return NextResponse.json({ error: 'Failed to duplicate document' }, { status: 500 })
    }

    // DEDUZIR CREDITO apos duplicacao bem-sucedida
    const { data: newCredits, error: deductError } = await supabase
      .rpc('deduct_credit', { p_user_id: user.id })

    if (deductError) {
      console.error('Credit deduction error:', deductError)
      // Documento ja foi criado, nao reverter
    }

    return NextResponse.json({
      success: true,
      document: newDoc,
      message: 'Document duplicated successfully',
      credits: newCredits ?? userData.credits - 1
    })
  } catch (error) {
    console.error('Document duplication error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
