import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { validatePagination, isValidUUID } from '@/lib/validation'

/**
 * GET /api/notifications
 * Get user notifications
 *
 * Query params:
 * - page: Page number (default 1)
 * - limit: Items per page (default 20, max 100)
 * - unread_only: If true, only return unread notifications
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Verify authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse parameters
    const { searchParams } = new URL(request.url)
    const pagination = validatePagination(
      parseInt(searchParams.get('page') || '1'),
      parseInt(searchParams.get('limit') || '20')
    )
    const unreadOnly = searchParams.get('unread_only') === 'true'

    // Build query
    let query = supabase
      .from('notifications')
      .select('*', { count: 'exact' })
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (unreadOnly) {
      query = query.eq('read', false)
    }

    query = query.range(pagination.offset, pagination.offset + pagination.limit - 1)

    const { data: notifications, error, count } = await query

    if (error) {
      // Table might not exist yet
      console.error('Notifications fetch error:', error)
      return NextResponse.json({
        notifications: [],
        unreadCount: 0,
        pagination: {
          page: pagination.page,
          limit: pagination.limit,
          totalCount: 0,
          totalPages: 0,
          hasNextPage: false,
          hasPrevPage: false,
        },
      })
    }

    // Get unread count
    const { count: unreadCount } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('read', false)

    const totalCount = count || 0
    const totalPages = Math.ceil(totalCount / pagination.limit)

    return NextResponse.json({
      notifications: notifications || [],
      unreadCount: unreadCount || 0,
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        totalCount,
        totalPages,
        hasNextPage: pagination.page < totalPages,
        hasPrevPage: pagination.page > 1,
      },
    })
  } catch (error) {
    console.error('Notifications GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * PATCH /api/notifications
 * Mark notifications as read
 *
 * Body:
 * - notificationIds: string[] - IDs of notifications to mark as read
 * - markAll: boolean - If true, mark all notifications as read
 */
export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Verify authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { notificationIds, markAll } = body

    if (markAll) {
      // Mark all as read
      const { error } = await supabase
        .from('notifications')
        .update({ read: true, read_at: new Date().toISOString() })
        .eq('user_id', user.id)
        .eq('read', false)

      if (error) {
        console.error('Mark all read error:', error)
        return NextResponse.json({ error: 'Failed to mark notifications as read' }, { status: 500 })
      }

      return NextResponse.json({
        success: true,
        message: 'All notifications marked as read',
      })
    }

    // Mark specific notifications as read
    if (!notificationIds || !Array.isArray(notificationIds) || notificationIds.length === 0) {
      return NextResponse.json({ error: 'No notification IDs provided' }, { status: 400 })
    }

    // Validate IDs
    const invalidIds = notificationIds.filter((id: string) => !isValidUUID(id))
    if (invalidIds.length > 0) {
      return NextResponse.json({ error: 'Invalid notification IDs' }, { status: 400 })
    }

    const { error } = await supabase
      .from('notifications')
      .update({ read: true, read_at: new Date().toISOString() })
      .eq('user_id', user.id)
      .in('id', notificationIds)

    if (error) {
      console.error('Mark read error:', error)
      return NextResponse.json({ error: 'Failed to mark notifications as read' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: `${notificationIds.length} notification(s) marked as read`,
    })
  } catch (error) {
    console.error('Notifications PATCH error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * DELETE /api/notifications
 * Delete notifications
 *
 * Body:
 * - notificationIds: string[] - IDs of notifications to delete
 * - deleteAll: boolean - If true, delete all notifications
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
    const { notificationIds, deleteAll } = body

    if (deleteAll) {
      // Delete all notifications
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('user_id', user.id)

      if (error) {
        console.error('Delete all error:', error)
        return NextResponse.json({ error: 'Failed to delete notifications' }, { status: 500 })
      }

      return NextResponse.json({
        success: true,
        message: 'All notifications deleted',
      })
    }

    // Delete specific notifications
    if (!notificationIds || !Array.isArray(notificationIds) || notificationIds.length === 0) {
      return NextResponse.json({ error: 'No notification IDs provided' }, { status: 400 })
    }

    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('user_id', user.id)
      .in('id', notificationIds)

    if (error) {
      console.error('Delete error:', error)
      return NextResponse.json({ error: 'Failed to delete notifications' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: `${notificationIds.length} notification(s) deleted`,
    })
  } catch (error) {
    console.error('Notifications DELETE error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
