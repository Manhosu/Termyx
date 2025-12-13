import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { validatePagination } from '@/lib/validation'

interface ActivityItem {
  id: string
  type: 'document_created' | 'document_updated' | 'document_sent' | 'payment' | 'login'
  title: string
  description: string
  timestamp: string
  metadata?: Record<string, unknown>
}

/**
 * GET /api/user/activity
 * Get user's recent activity for dashboard
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Verify authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get pagination params
    const { searchParams } = new URL(request.url)
    const { page, limit, offset } = validatePagination(
      searchParams.get('page'),
      searchParams.get('limit'),
      50 // max 50 items
    )

    const activities: ActivityItem[] = []

    // Get recent documents (created/updated)
    const { data: documents } = await supabase
      .from('documents')
      .select('id, title, status, created_at, updated_at')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false })
      .range(0, 20)

    if (documents) {
      for (const doc of documents) {
        // Check if it was created recently (within last 7 days)
        const createdAt = new Date(doc.created_at)
        const updatedAt = new Date(doc.updated_at)
        const now = new Date()
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

        if (createdAt > sevenDaysAgo) {
          activities.push({
            id: `doc-created-${doc.id}`,
            type: 'document_created',
            title: 'Documento criado',
            description: doc.title,
            timestamp: doc.created_at,
          })
        }

        // If updated after creation (allow 1 minute buffer)
        if (updatedAt.getTime() - createdAt.getTime() > 60000 && updatedAt > sevenDaysAgo) {
          activities.push({
            id: `doc-updated-${doc.id}-${updatedAt.getTime()}`,
            type: 'document_updated',
            title: 'Documento atualizado',
            description: doc.title,
            timestamp: doc.updated_at,
          })
        }
      }
    }

    // Get document sends
    const { data: sends } = await supabase
      .from('document_sends')
      .select('id, channel, recipient, created_at, documents(title)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(0, 20)

    if (sends) {
      for (const send of sends) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const docTitle = (send.documents as any)?.title || 'Documento'
        activities.push({
          id: `send-${send.id}`,
          type: 'document_sent',
          title: `Documento enviado via ${send.channel === 'email' ? 'email' : 'WhatsApp'}`,
          description: `${docTitle} para ${send.recipient}`,
          timestamp: send.created_at,
        })
      }
    }

    // Get payments
    const { data: payments } = await supabase
      .from('payments')
      .select('id, type, amount, currency, status, created_at')
      .eq('user_id', user.id)
      .eq('status', 'paid')
      .order('created_at', { ascending: false })
      .range(0, 10)

    if (payments) {
      for (const payment of payments) {
        const amountFormatted = new Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: payment.currency?.toUpperCase() || 'BRL',
        }).format(payment.amount)

        activities.push({
          id: `payment-${payment.id}`,
          type: 'payment',
          title: payment.type === 'credits' ? 'Creditos adquiridos' : 'Assinatura paga',
          description: amountFormatted,
          timestamp: payment.created_at,
        })
      }
    }

    // Sort all activities by timestamp (most recent first)
    activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

    // Apply pagination
    const paginatedActivities = activities.slice(offset, offset + limit)
    const totalCount = activities.length

    return NextResponse.json({
      activities: paginatedActivities,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
        hasMore: offset + limit < totalCount,
      },
    })
  } catch (error) {
    console.error('User activity error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
