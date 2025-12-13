import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { validatePagination } from '@/lib/validation'

/**
 * GET /api/user/credits
 * Get user's credit balance and transaction history
 *
 * Query params:
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

    // Parse pagination
    const { searchParams } = new URL(request.url)
    const pagination = validatePagination(
      parseInt(searchParams.get('page') || '1'),
      parseInt(searchParams.get('limit') || '20')
    )

    // Get current credit balance
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('credits')
      .eq('id', user.id)
      .single()

    if (userError) {
      console.error('User fetch error:', userError)
      return NextResponse.json({ error: 'Failed to fetch credits' }, { status: 500 })
    }

    // Get credit transactions
    const { data: transactions, error: txError, count } = await supabase
      .from('credit_transactions')
      .select('*', { count: 'exact' })
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(pagination.offset, pagination.offset + pagination.limit - 1)

    if (txError) {
      // Table might not exist yet, return empty array
      console.error('Transactions fetch error:', txError)
    }

    // Calculate stats
    const allTransactions = transactions || []
    const totalEarned = allTransactions
      .filter(t => t.amount > 0)
      .reduce((sum, t) => sum + t.amount, 0)
    const totalSpent = Math.abs(
      allTransactions
        .filter(t => t.amount < 0)
        .reduce((sum, t) => sum + t.amount, 0)
    )

    const totalCount = count || 0
    const totalPages = Math.ceil(totalCount / pagination.limit)

    return NextResponse.json({
      balance: userData?.credits || 0,
      stats: {
        totalEarned,
        totalSpent,
        transactionCount: totalCount,
      },
      transactions: allTransactions,
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
    console.error('Credits GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
