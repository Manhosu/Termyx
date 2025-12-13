import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { rateLimiters, getRateLimitHeaders } from '@/lib/rate-limit'
import { isValidUUID } from '@/lib/validation'
import crypto from 'crypto'

/**
 * GET /api/documents/shares
 * Get all shared links for user's documents
 *
 * Query params:
 * - document_id: Optional filter by document
 * - active_only: If true, only return non-expired links
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Verify authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const documentId = searchParams.get('document_id')
    const activeOnly = searchParams.get('active_only') === 'true'

    // Build query
    let query = supabase
      .from('document_shares')
      .select(`
        id,
        token,
        expires_at,
        created_at,
        view_count,
        documents (
          id,
          title
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (documentId && isValidUUID(documentId)) {
      query = query.eq('document_id', documentId)
    }

    if (activeOnly) {
      query = query.gt('expires_at', new Date().toISOString())
    }

    const { data: shares, error: sharesError } = await query

    if (sharesError) {
      // Table might not exist
      console.error('Shares fetch error:', sharesError)
      return NextResponse.json({ shares: [] })
    }

    // Add status to each share
    const now = new Date()
    const sharesWithStatus = (shares || []).map(share => ({
      ...share,
      isExpired: new Date(share.expires_at) < now,
      shareUrl: `${process.env.NEXT_PUBLIC_APP_URL || ''}/share/${share.token}`,
    }))

    return NextResponse.json({ shares: sharesWithStatus })
  } catch (error) {
    console.error('Shares GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * POST /api/documents/shares
 * Create a new share link for a document
 *
 * Body:
 * - documentId: string - ID of document to share
 * - expiresIn: number - Hours until expiration (default 24, max 720 = 30 days)
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
    const { documentId, expiresIn = 24 } = body

    // Validate document ID
    if (!documentId || !isValidUUID(documentId)) {
      return NextResponse.json({ error: 'Invalid document ID' }, { status: 400 })
    }

    // Validate expiration
    const maxHours = 720 // 30 days
    const hours = Math.min(Math.max(1, expiresIn), maxHours)

    // Verify document belongs to user
    const { data: document, error: docError } = await supabase
      .from('documents')
      .select('id, title')
      .eq('id', documentId)
      .eq('user_id', user.id)
      .single()

    if (docError || !document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 })
    }

    // Generate secure token
    const token = crypto.randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + hours * 60 * 60 * 1000)

    // Create share link
    const { data: share, error: shareError } = await supabase
      .from('document_shares')
      .insert({
        document_id: documentId,
        user_id: user.id,
        token,
        expires_at: expiresAt.toISOString(),
        view_count: 0,
      })
      .select()
      .single()

    if (shareError) {
      console.error('Share create error:', shareError)
      return NextResponse.json({ error: 'Failed to create share link' }, { status: 500 })
    }

    const shareUrl = `${process.env.NEXT_PUBLIC_APP_URL || ''}/share/${token}`

    return NextResponse.json({
      success: true,
      share: {
        ...share,
        shareUrl,
        document: {
          id: document.id,
          title: document.title,
        },
      },
    })
  } catch (error) {
    console.error('Shares POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * DELETE /api/documents/shares
 * Revoke a share link
 *
 * Body:
 * - shareId: string - ID of share to revoke
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
    const { shareId } = body

    // Validate share ID
    if (!shareId || !isValidUUID(shareId)) {
      return NextResponse.json({ error: 'Invalid share ID' }, { status: 400 })
    }

    // Delete share (only if belongs to user)
    const { error: deleteError } = await supabase
      .from('document_shares')
      .delete()
      .eq('id', shareId)
      .eq('user_id', user.id)

    if (deleteError) {
      console.error('Share delete error:', deleteError)
      return NextResponse.json({ error: 'Failed to revoke share link' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Share link revoked',
    })
  } catch (error) {
    console.error('Shares DELETE error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
