import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

interface UserStats {
  documents: {
    total: number
    draft: number
    completed: number
    sent: number
  }
  credits: {
    current: number
    used: number
  }
  activity: {
    documentsThisMonth: number
    emailsSent: number
    lastActivity: string | null
  }
  plan: {
    name: string
    slug: string
  } | null
}

/**
 * GET /api/user/stats
 * Get user statistics for dashboard
 */
export async function GET() {
  try {
    const supabase = await createClient()

    // Verify authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user data with plan
    const { data: userData } = await supabase
      .from('users')
      .select('credits, plans(name, slug)')
      .eq('id', user.id)
      .single()

    // Get document counts by status
    const { data: documents } = await supabase
      .from('documents')
      .select('id, status, created_at')
      .eq('user_id', user.id)

    const docCounts = {
      total: documents?.length || 0,
      draft: documents?.filter(d => d.status === 'draft').length || 0,
      completed: documents?.filter(d => d.status === 'completed').length || 0,
      sent: 0,
    }

    // Get documents sent count
    const { count: sentCount } = await supabase
      .from('document_sends')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)

    docCounts.sent = sentCount || 0

    // Get documents created this month
    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)

    const docsThisMonth = documents?.filter(d =>
      new Date(d.created_at) >= startOfMonth
    ).length || 0

    // Get emails sent count
    const { count: emailCount } = await supabase
      .from('document_sends')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('channel', 'email')

    // Get credits used (from payments with credits type)
    const { data: payments } = await supabase
      .from('payments')
      .select('metadata')
      .eq('user_id', user.id)
      .eq('type', 'credits')
      .eq('status', 'paid')

    let creditsUsed = 0
    if (payments) {
      for (const payment of payments) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const meta = payment.metadata as any
        creditsUsed += meta?.credits_added || 0
      }
      // Credits used = credits purchased - current credits
      creditsUsed = Math.max(0, creditsUsed - (userData?.credits || 0))
    }

    // Get last activity
    const { data: lastDoc } = await supabase
      .from('documents')
      .select('updated_at')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false })
      .limit(1)
      .single()

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const userPlan = (userData?.plans as any) || null

    const stats: UserStats = {
      documents: docCounts,
      credits: {
        current: userData?.credits || 0,
        used: creditsUsed,
      },
      activity: {
        documentsThisMonth: docsThisMonth,
        emailsSent: emailCount || 0,
        lastActivity: lastDoc?.updated_at || null,
      },
      plan: userPlan ? {
        name: userPlan.name,
        slug: userPlan.slug,
      } : null,
    }

    return NextResponse.json({ stats })
  } catch (error) {
    console.error('User stats error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
