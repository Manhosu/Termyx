import { NextRequest, NextResponse } from 'next/server'
import { checkSignupFraud } from '@/lib/fraud-prevention'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, fingerprintHash } = body

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required', allowed: false },
        { status: 400 }
      )
    }

    // Get IP address from request headers
    const forwardedFor = request.headers.get('x-forwarded-for')
    const realIp = request.headers.get('x-real-ip')
    const ipAddress = forwardedFor?.split(',')[0]?.trim() || realIp || undefined

    // Run fraud checks
    const result = await checkSignupFraud({
      email,
      ipAddress,
      fingerprintHash,
    })

    if (!result.allowed) {
      return NextResponse.json({
        allowed: false,
        reason: result.reason,
        message: result.message,
      }, { status: 403 })
    }

    return NextResponse.json({
      allowed: true,
    })

  } catch (error) {
    console.error('Fraud check error:', error)
    // On error, allow the signup to proceed (fail-open)
    // The actual signup will still require email verification
    return NextResponse.json({ allowed: true })
  }
}
