import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { rateLimiters, getRateLimitHeaders } from '@/lib/rate-limit'
import { isValidUUID } from '@/lib/validation'

type BulkAction = 'archive' | 'delete' | 'restore'

interface BulkRequest {
  action: BulkAction
  documentIds: string[]
}

const MAX_BULK_ITEMS = 50

/**
 * POST /api/documents/bulk
 * Perform bulk operations on documents
 *
 * Body:
 * - action: 'archive' | 'delete' | 'restore'
 * - documentIds: string[] - IDs of documents to process (max 50)
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Verify authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Rate limiting - stricter for bulk operations
    const rateLimitResult = rateLimiters.strict(user.id)
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429, headers: getRateLimitHeaders(rateLimitResult) }
      )
    }

    const body: BulkRequest = await request.json()
    const { action, documentIds } = body

    // Validate action
    const validActions: BulkAction[] = ['archive', 'delete', 'restore']
    if (!action || !validActions.includes(action)) {
      return NextResponse.json(
        { error: `Invalid action. Valid actions: ${validActions.join(', ')}` },
        { status: 400 }
      )
    }

    // Validate document IDs
    if (!documentIds || !Array.isArray(documentIds) || documentIds.length === 0) {
      return NextResponse.json({ error: 'No document IDs provided' }, { status: 400 })
    }

    if (documentIds.length > MAX_BULK_ITEMS) {
      return NextResponse.json(
        { error: `Maximum ${MAX_BULK_ITEMS} documents per bulk operation` },
        { status: 400 }
      )
    }

    // Validate each ID
    const invalidIds = documentIds.filter(id => !isValidUUID(id))
    if (invalidIds.length > 0) {
      return NextResponse.json(
        { error: `Invalid document IDs: ${invalidIds.join(', ')}` },
        { status: 400 }
      )
    }

    // Verify all documents belong to user
    const { data: documents, error: fetchError } = await supabase
      .from('documents')
      .select('id, status')
      .eq('user_id', user.id)
      .in('id', documentIds)

    if (fetchError) {
      console.error('Fetch documents error:', fetchError)
      return NextResponse.json({ error: 'Failed to verify documents' }, { status: 500 })
    }

    const foundIds = documents?.map(d => d.id) || []
    const notFoundIds = documentIds.filter(id => !foundIds.includes(id))

    if (notFoundIds.length > 0) {
      return NextResponse.json(
        { error: `Documents not found: ${notFoundIds.join(', ')}` },
        { status: 404 }
      )
    }

    // Perform bulk action
    let result: { processed: number; failed: number; message: string }

    switch (action) {
      case 'archive': {
        const { error } = await supabase
          .from('documents')
          .update({
            status: 'archived',
            archived_at: new Date().toISOString(),
          })
          .eq('user_id', user.id)
          .in('id', documentIds)
          .neq('status', 'archived')

        if (error) {
          console.error('Bulk archive error:', error)
          return NextResponse.json({ error: 'Failed to archive documents' }, { status: 500 })
        }

        result = {
          processed: documentIds.length,
          failed: 0,
          message: `${documentIds.length} documento(s) arquivado(s)`,
        }
        break
      }

      case 'restore': {
        const archivedDocs = documents?.filter(d => d.status === 'archived') || []
        const archivedIds = archivedDocs.map(d => d.id)

        if (archivedIds.length === 0) {
          return NextResponse.json(
            { error: 'No archived documents found to restore' },
            { status: 400 }
          )
        }

        const { error } = await supabase
          .from('documents')
          .update({
            status: 'draft',
            archived_at: null,
          })
          .eq('user_id', user.id)
          .in('id', archivedIds)

        if (error) {
          console.error('Bulk restore error:', error)
          return NextResponse.json({ error: 'Failed to restore documents' }, { status: 500 })
        }

        result = {
          processed: archivedIds.length,
          failed: documentIds.length - archivedIds.length,
          message: `${archivedIds.length} documento(s) restaurado(s)`,
        }
        break
      }

      case 'delete': {
        // Permanent delete - only for archived documents
        const archivedDocs = documents?.filter(d => d.status === 'archived') || []
        const archivedIds = archivedDocs.map(d => d.id)

        if (archivedIds.length === 0) {
          return NextResponse.json(
            { error: 'Only archived documents can be permanently deleted. Archive first.' },
            { status: 400 }
          )
        }

        const { error } = await supabase
          .from('documents')
          .delete()
          .eq('user_id', user.id)
          .in('id', archivedIds)

        if (error) {
          console.error('Bulk delete error:', error)
          return NextResponse.json({ error: 'Failed to delete documents' }, { status: 500 })
        }

        result = {
          processed: archivedIds.length,
          failed: documentIds.length - archivedIds.length,
          message: `${archivedIds.length} documento(s) excluido(s) permanentemente`,
        }
        break
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      ...result,
    })
  } catch (error) {
    console.error('Bulk operation error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
