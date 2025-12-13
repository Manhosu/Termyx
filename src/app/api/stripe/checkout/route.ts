import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { stripe, creditPackages, planPriceIds, getAppUrl } from '@/lib/stripe'

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

    // Get user profile with Stripe customer ID
    const { data: profile } = await supabase
      .from('users')
      .select('id, email, name, stripe_customer_id')
      .eq('id', user.id)
      .single()

    if (!profile) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 })
    }

    const body: CheckoutRequest = await request.json()
    const { type, packageId, planSlug, billingPeriod = 'monthly' } = body

    // Get or create Stripe customer
    let customerId = profile.stripe_customer_id

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: profile.email,
        name: profile.name || undefined,
        metadata: {
          supabase_user_id: user.id,
        },
      })
      customerId = customer.id

      // Save customer ID to user profile
      await supabase
        .from('users')
        .update({ stripe_customer_id: customerId })
        .eq('id', user.id)
    }

    const appUrl = getAppUrl()

    if (type === 'credits') {
      // Credits purchase
      const creditPackage = creditPackages.find((p) => p.id === packageId)
      if (!creditPackage) {
        return NextResponse.json({ error: 'Invalid package' }, { status: 400 })
      }

      const session = await stripe.checkout.sessions.create({
        customer: customerId,
        mode: 'payment',
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'brl',
              product_data: {
                name: creditPackage.name,
                description: `Pacote de ${creditPackage.credits} creditos para gerar documentos`,
              },
              unit_amount: creditPackage.price,
            },
            quantity: 1,
          },
        ],
        metadata: {
          type: 'credits',
          user_id: user.id,
          credits: creditPackage.credits.toString(),
          package_id: creditPackage.id,
        },
        success_url: `${appUrl}/billing?success=credits`,
        cancel_url: `${appUrl}/billing?canceled=true`,
      })

      return NextResponse.json({ url: session.url })
    }

    if (type === 'subscription') {
      // Subscription purchase
      if (!planSlug || !planPriceIds[planSlug]) {
        return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
      }

      const priceId = planPriceIds[planSlug][billingPeriod]
      if (!priceId) {
        return NextResponse.json(
          { error: 'Price not configured for this plan' },
          { status: 400 }
        )
      }

      const session = await stripe.checkout.sessions.create({
        customer: customerId,
        mode: 'subscription',
        payment_method_types: ['card'],
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        metadata: {
          type: 'subscription',
          user_id: user.id,
          plan_slug: planSlug,
          billing_period: billingPeriod,
        },
        success_url: `${appUrl}/billing?success=subscription`,
        cancel_url: `${appUrl}/billing?canceled=true`,
      })

      return NextResponse.json({ url: session.url })
    }

    return NextResponse.json({ error: 'Invalid checkout type' }, { status: 400 })
  } catch (error) {
    console.error('Error creating checkout session:', error)
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}
