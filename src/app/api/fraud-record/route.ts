import { NextRequest, NextResponse } from 'next/server'
import { recordIPSignup, recordDeviceFingerprint } from '@/lib/fraud-prevention'

export async function POST(request: NextRequest) {
  try {
    const { userId, fingerprintHash } = await request.json()

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      )
    }

    // Get IP address
    const forwardedFor = request.headers.get('x-forwarded-for')
    const realIp = request.headers.get('x-real-ip')
    const ip = forwardedFor?.split(',')[0]?.trim() || realIp || undefined

    // Record IP signup
    if (ip) {
      try {
        await recordIPSignup(ip, userId)
      } catch (err) {
        console.error('Error recording IP signup:', err)
        // Non-blocking, continue
      }
    }

    // Record device fingerprint
    if (fingerprintHash) {
      try {
        await recordDeviceFingerprint(
          userId,
          fingerprintHash,
          ip,
          request.headers.get('user-agent') || undefined
        )
      } catch (err) {
        console.error('Error recording device fingerprint:', err)
        // Non-blocking, continue
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Fraud record error:', error)
    // Return success anyway - this is a non-blocking operation
    return NextResponse.json({ success: true })
  }
}
