import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { rateLimiters, getRateLimitHeaders } from '@/lib/rate-limit'
import { sanitizeString, validatePagination } from '@/lib/validation'

/**
 * GET /api/documents/search
 * Search and filter user documents
 *
 * Query params:
 * - q: Search query (searches title and content)
 * - status: Filter by status (draft, completed, sent)
 * - template_id: Filter by template
 * - category: Filter by template category
 * - date_from: Filter documents created after this date
 * - date_to: Filter documents created before this date
 * - sort: Sort field (created_at, updated_at, title)
 * - order: Sort order (asc, desc)
 * - page: Page number (default 1)
 * - limit: Items per page (default 20, max 100)
 */
export async function GET(request: NextRequest) {
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

    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const query = sanitizeString(searchParams.get('q') || '')
    const status = searchParams.get('status')
    const templateId = searchParams.get('template_id')
    const category = searchParams.get('category')
    const dateFrom = searchParams.get('date_from')
    const dateTo = searchParams.get('date_to')
    const sortField = searchParams.get('sort') || 'created_at'
    const sortOrder = searchParams.get('order') || 'desc'

    // Pagination
    const pagination = validatePagination(
      parseInt(searchParams.get('page') || '1'),
      parseInt(searchParams.get('limit') || '20')
    )

    // Validate status
    const validStatuses = ['draft', 'completed', 'sent']
    if (status && !validStatuses.includes(status)) {
      return NextResponse.json(
        { error: `Invalid status. Valid options: ${validStatuses.join(', ')}` },
        { status: 400 }
      )
    }

    // Validate sort field
    const validSortFields = ['created_at', 'updated_at', 'title']
    if (!validSortFields.includes(sortField)) {
      return NextResponse.json(
        { error: `Invalid sort field. Valid options: ${validSortFields.join(', ')}` },
        { status: 400 }
      )
    }

    // Validate sort order
    if (!['asc', 'desc'].includes(sortOrder)) {
      return NextResponse.json(
        { error: 'Invalid sort order. Use asc or desc' },
        { status: 400 }
      )
    }

    // Build query
    let dbQuery = supabase
      .from('documents')
      .select(`
        id,
        title,
        status,
        created_at,
        updated_at,
        templates (
          id,
          name,
          category
        )
      `, { count: 'exact' })
      .eq('user_id', user.id)

    // Apply text search
    if (query) {
      // Search in title using ilike for partial matching
      dbQuery = dbQuery.ilike('title', `%${query}%`)
    }

    // Apply filters
    if (status) {
      dbQuery = dbQuery.eq('status', status)
    }

    if (templateId) {
      dbQuery = dbQuery.eq('template_id', templateId)
    }

    // Date range filters
    if (dateFrom) {
      const fromDate = new Date(dateFrom)
      if (!isNaN(fromDate.getTime())) {
        dbQuery = dbQuery.gte('created_at', fromDate.toISOString())
      }
    }

    if (dateTo) {
      const toDate = new Date(dateTo)
      if (!isNaN(toDate.getTime())) {
        // Add one day to include the end date
        toDate.setDate(toDate.getDate() + 1)
        dbQuery = dbQuery.lt('created_at', toDate.toISOString())
      }
    }

    // Apply sorting
    const ascending = sortOrder === 'asc'
    dbQuery = dbQuery.order(sortField, { ascending })

    // Apply pagination
    const from = (pagination.page - 1) * pagination.limit
    const to = from + pagination.limit - 1
    dbQuery = dbQuery.range(from, to)

    // Execute query
    const { data: documents, error: queryError, count } = await dbQuery

    if (queryError) {
      console.error('Document search error:', queryError)
      return NextResponse.json({ error: 'Failed to search documents' }, { status: 500 })
    }

    // Filter by category if specified (needs to be done post-query due to nested relation)
    let filteredDocuments = documents || []
    if (category) {
      filteredDocuments = filteredDocuments.filter(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (doc: any) => doc.templates?.category === category
      )
    }

    // Calculate pagination info
    const totalCount = count || 0
    const totalPages = Math.ceil(totalCount / pagination.limit)

    return NextResponse.json({
      documents: filteredDocuments,
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        totalCount,
        totalPages,
        hasNextPage: pagination.page < totalPages,
        hasPrevPage: pagination.page > 1,
      },
      filters: {
        query: query || null,
        status: status || null,
        templateId: templateId || null,
        category: category || null,
        dateFrom: dateFrom || null,
        dateTo: dateTo || null,
      },
      sort: {
        field: sortField,
        order: sortOrder,
      },
    })
  } catch (error) {
    console.error('Document search error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
