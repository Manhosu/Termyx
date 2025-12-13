import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendEmail, emailTemplates } from '@/lib/email'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get user details
    const { data: userData } = await supabase
      .from('users')
      .select('name, email')
      .eq('id', user.id)
      .single()

    const userName = userData?.name || user.email?.split('@')[0] || 'Usuario'
    const userEmail = userData?.email || user.email

    if (!userEmail) {
      return NextResponse.json(
        { error: 'User email not found' },
        { status: 400 }
      )
    }

    // Generate welcome email content
    const emailContent = emailTemplates.welcomeEmail({ userName })

    // Send welcome email
    const result = await sendEmail({
      to: userEmail,
      subject: emailContent.subject,
      html: emailContent.html,
    })

    if (!result.success) {
      console.error('Failed to send welcome email:', result.error)
      return NextResponse.json(
        { error: result.error || 'Failed to send email' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Welcome email API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
