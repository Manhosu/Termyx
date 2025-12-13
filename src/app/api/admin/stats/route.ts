import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * GET /api/admin/stats
 * Get comprehensive admin statistics
 *
 * Query params:
 * - period: 'today' | 'week' | 'month' | 'year' (default: 'month')
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Verify authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (userError || userData?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Parse period
    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || 'month'

    // Calculate date range
    const now = new Date()
    let startDate: Date

    switch (period) {
      case 'today':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        break
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

    // Get user statistics
    const { count: totalUsers } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })

    const { count: newUsers } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', startDate.toISOString())

    const { count: activeUsers } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .gte('last_sign_in_at', startDate.toISOString())

    // Get document statistics
    const { count: totalDocuments } = await supabase
      .from('documents')
      .select('*', { count: 'exact', head: true })

    const { count: newDocuments } = await supabase
      .from('documents')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', startDate.toISOString())

    const { data: docsByStatus } = await supabase
      .from('documents')
      .select('status')

    const statusCounts: Record<string, number> = {}
    docsByStatus?.forEach(doc => {
      statusCounts[doc.status] = (statusCounts[doc.status] || 0) + 1
    })

    // Get template statistics
    const { count: totalTemplates } = await supabase
      .from('templates')
      .select('*', { count: 'exact', head: true })

    const { count: publicTemplates } = await supabase
      .from('templates')
      .select('*', { count: 'exact', head: true })
      .eq('is_public', true)

    // Get plan distribution
    const { data: planData } = await supabase
      .from('users')
      .select('plan_id')

    const planCounts: Record<string, number> = {}
    planData?.forEach(u => {
      const planId = u.plan_id || 'free'
      planCounts[planId] = (planCounts[planId] || 0) + 1
    })

    // Get revenue data (from payments table if exists)
    const revenue = await getRevenueData(supabase, startDate)

    async function getRevenueData(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      supabaseClient: any,
      periodStart: Date
    ): Promise<{ period: number; total: number }> {
      try {
        const { data: payments } = await supabaseClient
          .from('payments')
          .select('amount, created_at')
          .eq('status', 'completed')

        if (payments) {
          const total = payments.reduce((sum: number, p: { amount?: number }) => sum + (p.amount || 0), 0)
          const period = payments
            .filter((p: { created_at: string }) => new Date(p.created_at) >= periodStart)
            .reduce((sum: number, p: { amount?: number }) => sum + (p.amount || 0), 0)
          return { total, period }
        }
      } catch {
        // Payments table might not exist
      }
      return { period: 0, total: 0 }
    }

    // Get daily breakdown for charts
    const { data: dailyDocs } = await supabase
      .from('documents')
      .select('created_at')
      .gte('created_at', startDate.toISOString())

    const dailyBreakdown: Record<string, number> = {}
    dailyDocs?.forEach(doc => {
      const date = new Date(doc.created_at).toISOString().split('T')[0]
      dailyBreakdown[date] = (dailyBreakdown[date] || 0) + 1
    })

    const dailyData = Object.entries(dailyBreakdown)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date))

    // Get top users by document count
    const { data: userDocs } = await supabase
      .from('documents')
      .select('user_id')

    const userDocCounts: Record<string, number> = {}
    userDocs?.forEach(doc => {
      userDocCounts[doc.user_id] = (userDocCounts[doc.user_id] || 0) + 1
    })

    const topUserIds = Object.entries(userDocCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([id]) => id)

    let topUsers: { id: string; email: string; name: string; documentCount: number }[] = []

    if (topUserIds.length > 0) {
      const { data: users } = await supabase
        .from('users')
        .select('id, email, name')
        .in('id', topUserIds)

      topUsers = (users || []).map(u => ({
        id: u.id,
        email: u.email,
        name: u.name || 'Sem nome',
        documentCount: userDocCounts[u.id] || 0,
      })).sort((a, b) => b.documentCount - a.documentCount)
    }

    return NextResponse.json({
      period,
      periodStart: startDate.toISOString(),
      periodEnd: now.toISOString(),
      users: {
        total: totalUsers || 0,
        new: newUsers || 0,
        active: activeUsers || 0,
        byPlan: planCounts,
      },
      documents: {
        total: totalDocuments || 0,
        new: newDocuments || 0,
        byStatus: statusCounts,
      },
      templates: {
        total: totalTemplates || 0,
        public: publicTemplates || 0,
        private: (totalTemplates || 0) - (publicTemplates || 0),
      },
      revenue,
      charts: {
        daily: dailyData,
      },
      topUsers,
    })
  } catch (error) {
    console.error('Admin stats error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
