import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { rateLimiters, getRateLimitHeaders } from '@/lib/rate-limit'
import { isValidUUID } from '@/lib/validation'

/**
 * POST /api/documents/archive
 * Archive a document (soft delete)
 *
 * Body:
 * - documentId: string - ID of the document to archive
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
    const { documentId } = body

    // Validate document ID
    if (!documentId || !isValidUUID(documentId)) {
      return NextResponse.json({ error: 'Invalid document ID' }, { status: 400 })
    }

    // Verify document exists and belongs to user
    const { data: document, error: fetchError } = await supabase
      .from('documents')
      .select('id, status')
      .eq('id', documentId)
      .eq('user_id', user.id)
      .single()

    if (fetchError || !document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 })
    }

    // Archive the document
    const { error: updateError } = await supabase
      .from('documents')
      .update({
        status: 'archived',
        archived_at: new Date().toISOString(),
      })
      .eq('id', documentId)
      .eq('user_id', user.id)

    if (updateError) {
      console.error('Archive error:', updateError)
      return NextResponse.json({ error: 'Failed to archive document' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Document archived successfully',
    })
  } catch (error) {
    console.error('Archive error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * DELETE /api/documents/archive
 * Restore an archived document
 *
 * Body:
 * - documentId: string - ID of the document to restore
 */
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Verify authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { documentId } = body

    // Validate document ID
    if (!documentId || !isValidUUID(documentId)) {
      return NextResponse.json({ error: 'Invalid document ID' }, { status: 400 })
    }

    // Verify document exists and is archived
    const { data: document, error: fetchError } = await supabase
      .from('documents')
      .select('id, status')
      .eq('id', documentId)
      .eq('user_id', user.id)
      .eq('status', 'archived')
      .single()

    if (fetchError || !document) {
      return NextResponse.json({ error: 'Archived document not found' }, { status: 404 })
    }

    // Restore the document to draft status
    const { error: updateError } = await supabase
      .from('documents')
      .update({
        status: 'draft',
        archived_at: null,
      })
      .eq('id', documentId)
      .eq('user_id', user.id)

    if (updateError) {
      console.error('Restore error:', updateError)
      return NextResponse.json({ error: 'Failed to restore document' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Document restored successfully',
    })
  } catch (error) {
    console.error('Restore error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * GET /api/documents/archive
 * Get all archived documents
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Verify authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse pagination
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100)
    const offset = (page - 1) * limit

    // Get archived documents
    const { data: documents, error: docsError, count } = await supabase
      .from('documents')
      .select(`
        id,
        title,
        archived_at,
        created_at,
        templates (
          id,
          name,
          category
        )
      `, { count: 'exact' })
      .eq('user_id', user.id)
      .eq('status', 'archived')
      .order('archived_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (docsError) {
      console.error('Fetch archived error:', docsError)
      return NextResponse.json({ error: 'Failed to fetch archived documents' }, { status: 500 })
    }

    const totalCount = count || 0
    const totalPages = Math.ceil(totalCount / limit)

    return NextResponse.json({
      documents: documents || [],
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    })
  } catch (error) {
    console.error('Fetch archived error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
