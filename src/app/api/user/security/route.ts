import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { rateLimiters, getRateLimitHeaders } from '@/lib/rate-limit'
import { validatePassword } from '@/lib/validation'

interface PasswordChangeRequest {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

/**
 * POST /api/user/security/password
 * Change user's password
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Verify authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Rate limiting - strict for security operations
    const rateLimitResult = rateLimiters.strict(user.id)
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Too many attempts. Please try again later.' },
        { status: 429, headers: getRateLimitHeaders(rateLimitResult) }
      )
    }

    const body: PasswordChangeRequest = await request.json()
    const { currentPassword, newPassword, confirmPassword } = body

    // Validate required fields
    if (!currentPassword || !newPassword || !confirmPassword) {
      return NextResponse.json(
        { error: 'All password fields are required' },
        { status: 400 }
      )
    }

    // Validate password confirmation
    if (newPassword !== confirmPassword) {
      return NextResponse.json(
        { error: 'New passwords do not match' },
        { status: 400 }
      )
    }

    // Validate new password strength
    const passwordValidation = validatePassword(newPassword)
    if (!passwordValidation.isValid) {
      const missing: string[] = []
      if (!passwordValidation.checks.length) missing.push('pelo menos 8 caracteres')
      if (!passwordValidation.checks.uppercase) missing.push('uma letra maiuscula')
      if (!passwordValidation.checks.lowercase) missing.push('uma letra minuscula')
      if (!passwordValidation.checks.number) missing.push('um numero')

      return NextResponse.json(
        {
          error: 'Senha muito fraca',
          details: `A senha precisa ter: ${missing.join(', ')}`,
        },
        { status: 400 }
      )
    }

    // Verify current password by attempting to sign in
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email!,
      password: currentPassword,
    })

    if (signInError) {
      return NextResponse.json(
        { error: 'Current password is incorrect' },
        { status: 400 }
      )
    }

    // Update password
    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword,
    })

    if (updateError) {
      console.error('Password update error:', updateError)
      return NextResponse.json(
        { error: 'Failed to update password' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Password updated successfully',
    })
  } catch (error) {
    console.error('Password change error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * GET /api/user/security
 * Get account security information
 */
export async function GET() {
  try {
    const supabase = await createClient()

    // Verify authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user metadata
    const identities = user.identities || []
    const providers = identities.map(i => i.provider)

    return NextResponse.json({
      security: {
        email: user.email,
        emailVerified: user.email_confirmed_at !== null,
        lastSignIn: user.last_sign_in_at,
        createdAt: user.created_at,
        providers,
        mfaEnabled: false, // Placeholder for future MFA implementation
      },
    })
  } catch (error) {
    console.error('Security info error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * DELETE /api/user/security
 * Request account deletion
 */
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Verify authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Rate limiting
    const rateLimitResult = rateLimiters.strict(user.id)
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Too many attempts. Please try again later.' },
        { status: 429, headers: getRateLimitHeaders(rateLimitResult) }
      )
    }

    const body = await request.json()
    const { password, confirmation } = body

    // Require confirmation text
    if (confirmation !== 'DELETE MY ACCOUNT') {
      return NextResponse.json(
        { error: 'Please type "DELETE MY ACCOUNT" to confirm' },
        { status: 400 }
      )
    }

    // Verify password
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email!,
      password,
    })

    if (signInError) {
      return NextResponse.json(
        { error: 'Password is incorrect' },
        { status: 400 }
      )
    }

    // Mark user for deletion (soft delete)
    // In production, you might want to schedule actual deletion after a grace period
    const { error: updateError } = await supabase
      .from('users')
      .update({
        deleted_at: new Date().toISOString(),
        email: `deleted_${user.id}@deleted.local`,
        name: 'Deleted User',
      })
      .eq('id', user.id)

    if (updateError) {
      console.error('Account deletion error:', updateError)
      return NextResponse.json(
        { error: 'Failed to delete account' },
        { status: 500 }
      )
    }

    // Sign out the user
    await supabase.auth.signOut()

    return NextResponse.json({
      success: true,
      message: 'Account scheduled for deletion',
    })
  } catch (error) {
    console.error('Account deletion error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
