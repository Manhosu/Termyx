import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  createCreditsPreference,
  createPlanPreference,
  creditPackages,
} from '@/lib/mercadopago'

interface CheckoutRequest {
  type: 'credits' | 'subscription'
  packageId?: string // For credits
  planSlug?: string // For subscription
  billingPeriod?: 'monthly' | 'yearly'
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Get current user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user profile
    const { data: profile } = await supabase
      .from('users')
      .select('id, email, name')
      .eq('id', user.id)
      .single()

    if (!profile) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 })
    }

    const body: CheckoutRequest = await request.json()
    const { type, packageId, planSlug, billingPeriod = 'monthly' } = body

    if (type === 'credits') {
      // Credits purchase
      const creditPackage = creditPackages.find((p) => p.id === packageId)
      if (!creditPackage) {
        return NextResponse.json({ error: 'Invalid package' }, { status: 400 })
      }

      const preference = await createCreditsPreference(
        user.id,
        profile.email,
        packageId!
      )

      return NextResponse.json({
        url: preference.init_point,
        preferenceId: preference.id,
      })
    }

    if (type === 'subscription') {
      // Subscription purchase
      if (!planSlug) {
        return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
      }

      const preference = await createPlanPreference(
        user.id,
        profile.email,
        planSlug,
        billingPeriod
      )

      return NextResponse.json({
        url: preference.init_point,
        preferenceId: preference.id,
      })
    }

    return NextResponse.json({ error: 'Invalid checkout type' }, { status: 400 })
  } catch (error) {
    console.error('Error creating checkout preference:', error)
    return NextResponse.json(
      { error: 'Failed to create checkout preference' },
      { status: 500 }
    )
  }
}
