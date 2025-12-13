import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * GET /api/dashboard/analytics
 * Get comprehensive analytics for the user dashboard
 *
 * Query params:
 * - period: 'week' | 'month' | 'year' (default: 'month')
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Verify authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse period
    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || 'month'

    // Calculate date range
    const now = new Date()
    let startDate: Date

    switch (period) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1)
        break
      case 'month':
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1)
    }

    // Get all documents for the period
    const { data: documents, error: docsError } = await supabase
      .from('documents')
      .select('id, status, created_at, template_id')
      .eq('user_id', user.id)
      .gte('created_at', startDate.toISOString())

    if (docsError) {
      console.error('Documents fetch error:', docsError)
      return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 })
    }

    // Get all-time stats
    const { data: allTimeDocs, error: allTimeError } = await supabase
      .from('documents')
      .select('id, status')
      .eq('user_id', user.id)

    if (allTimeError) {
      console.error('All-time fetch error:', allTimeError)
    }

    // Get user credits and plan
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select(`
        credits,
        plans (
          name,
          slug
        )
      `)
      .eq('id', user.id)
      .single()

    if (userError) {
      console.error('User fetch error:', userError)
    }

    // Calculate period stats
    const periodDocs = documents || []
    const periodStats = {
      total: periodDocs.length,
      draft: periodDocs.filter(d => d.status === 'draft').length,
      completed: periodDocs.filter(d => d.status === 'completed').length,
      sent: periodDocs.filter(d => d.status === 'sent').length,
      archived: periodDocs.filter(d => d.status === 'archived').length,
    }

    // Calculate all-time stats
    const allDocs = allTimeDocs || []
    const allTimeStats = {
      total: allDocs.length,
      draft: allDocs.filter(d => d.status === 'draft').length,
      completed: allDocs.filter(d => d.status === 'completed').length,
      sent: allDocs.filter(d => d.status === 'sent').length,
      archived: allDocs.filter(d => d.status === 'archived').length,
    }

    // Calculate daily breakdown for the period
    const dailyBreakdown: Record<string, number> = {}
    periodDocs.forEach(doc => {
      const date = new Date(doc.created_at).toISOString().split('T')[0]
      dailyBreakdown[date] = (dailyBreakdown[date] || 0) + 1
    })

    // Convert to sorted array
    const dailyData = Object.entries(dailyBreakdown)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date))

    // Calculate template usage
    const templateUsage: Record<string, number> = {}
    periodDocs.forEach(doc => {
      if (doc.template_id) {
        templateUsage[doc.template_id] = (templateUsage[doc.template_id] || 0) + 1
      }
    })

    // Get template details for top used
    const topTemplateIds = Object.entries(templateUsage)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([id]) => id)

    let topTemplates: { id: string; name: string; count: number }[] = []

    if (topTemplateIds.length > 0) {
      const { data: templates } = await supabase
        .from('templates')
        .select('id, name')
        .in('id', topTemplateIds)

      topTemplates = (templates || []).map(t => ({
        id: t.id,
        name: t.name,
        count: templateUsage[t.id] || 0,
      })).sort((a, b) => b.count - a.count)
    }

    // Calculate growth (compare with previous period)
    let previousStartDate: Date
    switch (period) {
      case 'week':
        previousStartDate = new Date(startDate.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case 'year':
        previousStartDate = new Date(startDate.getFullYear() - 1, 0, 1)
        break
      case 'month':
      default:
        previousStartDate = new Date(startDate.getFullYear(), startDate.getMonth() - 1, 1)
    }

    const { data: previousDocs } = await supabase
      .from('documents')
      .select('id')
      .eq('user_id', user.id)
      .gte('created_at', previousStartDate.toISOString())
      .lt('created_at', startDate.toISOString())

    const previousCount = previousDocs?.length || 0
    const currentCount = periodDocs.length
    const growth = previousCount === 0
      ? (currentCount > 0 ? 100 : 0)
      : Math.round(((currentCount - previousCount) / previousCount) * 100)

    return NextResponse.json({
      period,
      periodStart: startDate.toISOString(),
      periodEnd: now.toISOString(),
      stats: {
        period: periodStats,
        allTime: allTimeStats,
        growth: {
          percentage: growth,
          previousCount,
          currentCount,
          trend: growth > 0 ? 'up' : growth < 0 ? 'down' : 'stable',
        },
      },
      charts: {
        daily: dailyData,
        topTemplates,
      },
      user: {
        credits: userData?.credits || 0,
        plan: userData?.plans || null,
      },
    })
  } catch (error) {
    console.error('Analytics error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
