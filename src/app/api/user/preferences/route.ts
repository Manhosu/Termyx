import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { rateLimiters, getRateLimitHeaders } from '@/lib/rate-limit'

interface NotificationPreferences {
  email_marketing: boolean
  email_updates: boolean
  email_document_shared: boolean
  email_payment_receipts: boolean
}

/**
 * GET /api/user/preferences
 * Get current user's notification preferences
 */
export async function GET() {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user preferences
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('notification_preferences')
      .eq('id', user.id)
      .single()

    if (userError) {
      console.error('Error fetching preferences:', userError)
      return NextResponse.json({ error: 'Failed to fetch preferences' }, { status: 500 })
    }

    // Default preferences if none set
    const defaultPreferences: NotificationPreferences = {
      email_marketing: true,
      email_updates: true,
      email_document_shared: true,
      email_payment_receipts: true,
    }

    const preferences = userData?.notification_preferences || defaultPreferences

    return NextResponse.json({ preferences })
  } catch (error) {
    console.error('Preferences GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * PATCH /api/user/preferences
 * Update user's notification preferences
 */
export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient()

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

    // Validate input - only allow specific boolean fields
    const allowedFields = [
      'email_marketing',
      'email_updates',
      'email_document_shared',
      'email_payment_receipts',
    ]

    const preferences: Partial<NotificationPreferences> = {}

    for (const field of allowedFields) {
      if (typeof body[field] === 'boolean') {
        preferences[field as keyof NotificationPreferences] = body[field]
      }
    }

    if (Object.keys(preferences).length === 0) {
      return NextResponse.json(
        { error: 'No valid preferences provided' },
        { status: 400 }
      )
    }

    // Get current preferences and merge
    const { data: currentData } = await supabase
      .from('users')
      .select('notification_preferences')
      .eq('id', user.id)
      .single()

    const currentPreferences = currentData?.notification_preferences || {}
    const updatedPreferences = { ...currentPreferences, ...preferences }

    // Update preferences
    const { error: updateError } = await supabase
      .from('users')
      .update({ notification_preferences: updatedPreferences })
      .eq('id', user.id)

    if (updateError) {
      console.error('Error updating preferences:', updateError)
      return NextResponse.json({ error: 'Failed to update preferences' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      preferences: updatedPreferences,
    })
  } catch (error) {
    console.error('Preferences PATCH error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
