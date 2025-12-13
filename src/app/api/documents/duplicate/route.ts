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
      console.error('Document duplication error:', insertError)
      return NextResponse.json({ error: 'Failed to duplicate document' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      document: newDoc,
      message: 'Document duplicated successfully',
    })
  } catch (error) {
    console.error('Document duplication error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
