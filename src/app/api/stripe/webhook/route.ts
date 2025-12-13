import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createClient } from '@supabase/supabase-js'
import Stripe from 'stripe'
import { audit } from '@/lib/audit'
import { sendEmail, emailTemplates } from '@/lib/email'

// Use service role for webhook operations
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (error) {
    console.error('Webhook signature verification failed:', error)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        await handleCheckoutCompleted(session)
        break
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        await handleSubscriptionChange(subscription)
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        await handleSubscriptionCanceled(subscription)
        break
      }

      case 'invoice.paid': {
        const invoice = event.data.object as Stripe.Invoice
        await handleInvoicePaid(invoice)
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        await handlePaymentFailed(invoice)
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook handler error:', error)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    )
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const { metadata } = session

  if (!metadata) return

  const userId = metadata.user_id

  if (metadata.type === 'credits') {
    // Add credits to user
    const creditsToAdd = parseInt(metadata.credits || '0', 10)

    if (creditsToAdd > 0 && userId) {
      // Get current credits
      const { data: user } = await supabaseAdmin
        .from('users')
        .select('credits')
        .eq('id', userId)
        .single()

      const newCredits = (user?.credits || 0) + creditsToAdd

      // Update credits
      await supabaseAdmin
        .from('users')
        .update({ credits: newCredits })
        .eq('id', userId)

      // Log payment
      await supabaseAdmin.from('payments').insert({
        user_id: userId,
        amount: (session.amount_total || 0) / 100,
        currency: session.currency || 'brl',
        gateway: 'stripe',
        gateway_id: session.id,
        type: 'credits',
        status: 'paid',
        metadata: {
          credits_added: creditsToAdd,
          package_id: metadata.package_id,
        },
      })

      // Audit log
      await audit.paymentCompleted(userId, session.id, {
        amount: (session.amount_total || 0) / 100,
        type: 'credits',
        credits_added: creditsToAdd,
      })

      // Send payment confirmation email
      const { data: userData } = await supabaseAdmin
        .from('users')
        .select('name, email')
        .eq('id', userId)
        .single()

      if (userData?.email) {
        const emailContent = emailTemplates.paymentConfirmation({
          userName: userData.name || 'Usuario',
          amount: (session.amount_total || 0) / 100,
          currency: session.currency || 'brl',
          type: 'credits',
          details: `${creditsToAdd} creditos adicionados`,
        })

        await sendEmail({
          to: userData.email,
          subject: emailContent.subject,
          html: emailContent.html,
        }).catch((err) => console.error('Payment email error:', err))
      }
    }
  }
}

async function handleSubscriptionChange(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string

  // Find user by Stripe customer ID
  const { data: user } = await supabaseAdmin
    .from('users')
    .select('id')
    .eq('stripe_customer_id', customerId)
    .single()

  if (!user) {
    console.error('User not found for customer:', customerId)
    return
  }

  // Get plan from price metadata or lookup
  const priceId = subscription.items.data[0]?.price.id
  const planSlug = await getPlanSlugFromPriceId(priceId)

  if (planSlug) {
    // Get plan ID from database
    const { data: plan } = await supabaseAdmin
      .from('plans')
      .select('id, credits_included')
      .eq('slug', planSlug)
      .single()

    if (plan) {
      // Update user's plan and subscription info
      const updateData: Record<string, unknown> = {
        plan_id: plan.id,
        subscription_id: subscription.id,
        subscription_status: subscription.status,
      }

      // Add credits if subscription is active and it's a new subscription
      if (subscription.status === 'active' && plan.credits_included > 0) {
        const { data: currentUser } = await supabaseAdmin
          .from('users')
          .select('credits')
          .eq('id', user.id)
          .single()

        updateData.credits = (currentUser?.credits || 0) + plan.credits_included
      }

      await supabaseAdmin
        .from('users')
        .update(updateData)
        .eq('id', user.id)

      // Audit log
      await audit.subscriptionCreated(user.id, subscription.id, {
        plan: planSlug,
        status: subscription.status,
      })
    }
  }
}

async function handleSubscriptionCanceled(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string

  // Find user by Stripe customer ID
  const { data: user } = await supabaseAdmin
    .from('users')
    .select('id')
    .eq('stripe_customer_id', customerId)
    .single()

  if (!user) return

  // Get free plan
  const { data: freePlan } = await supabaseAdmin
    .from('plans')
    .select('id')
    .eq('slug', 'free')
    .single()

  // Downgrade to free plan
  await supabaseAdmin
    .from('users')
    .update({
      plan_id: freePlan?.id || null,
      subscription_id: null,
      subscription_status: 'canceled',
    })
    .eq('id', user.id)

  // Audit log
  await audit.subscriptionCanceled(user.id, subscription.id)
}

async function handleInvoicePaid(invoice: Stripe.Invoice) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const invoiceAny = invoice as any
  const subscriptionId = typeof invoiceAny.subscription === 'string'
    ? invoiceAny.subscription
    : invoiceAny.subscription?.id

  if (!subscriptionId || !invoice.customer) return

  const customerId = typeof invoice.customer === 'string'
    ? invoice.customer
    : invoice.customer?.id

  if (!customerId) return

  // Find user
  const { data: user } = await supabaseAdmin
    .from('users')
    .select('id')
    .eq('stripe_customer_id', customerId)
    .single()

  if (!user) return

  // Log payment
  await supabaseAdmin.from('payments').insert({
    user_id: user.id,
    amount: (invoice.amount_paid || 0) / 100,
    currency: invoice.currency || 'brl',
    gateway: 'stripe',
    gateway_id: invoice.id,
    type: 'subscription',
    status: 'paid',
    metadata: {
      subscription_id: subscriptionId,
      invoice_url: invoice.hosted_invoice_url,
    },
  })

  // Audit log
  await audit.paymentCompleted(user.id, invoice.id || '', {
    amount: (invoice.amount_paid || 0) / 100,
    type: 'subscription',
    subscription_id: subscriptionId,
  })

  // Send payment confirmation email
  const { data: userData } = await supabaseAdmin
    .from('users')
    .select('name, email, plans(name)')
    .eq('id', user.id)
    .single()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const userDataAny = userData as any
  if (userDataAny?.email) {
    const planName = userDataAny.plans?.name || 'Assinatura'
    const emailContent = emailTemplates.paymentConfirmation({
      userName: userDataAny.name || 'Usuario',
      amount: (invoice.amount_paid || 0) / 100,
      currency: invoice.currency || 'brl',
      type: 'subscription',
      details: `Plano ${planName}`,
      invoiceUrl: invoice.hosted_invoice_url || undefined,
    })

    await sendEmail({
      to: userDataAny.email,
      subject: emailContent.subject,
      html: emailContent.html,
    }).catch((err) => console.error('Subscription payment email error:', err))
  }
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  if (!invoice.customer) return

  const customerId = typeof invoice.customer === 'string'
    ? invoice.customer
    : invoice.customer?.id

  if (!customerId) return

  // Find user
  const { data: user } = await supabaseAdmin
    .from('users')
    .select('id')
    .eq('stripe_customer_id', customerId)
    .single()

  if (!user) return

  // Update subscription status
  await supabaseAdmin
    .from('users')
    .update({ subscription_status: 'past_due' })
    .eq('id', user.id)

  // Log failed payment
  await supabaseAdmin.from('payments').insert({
    user_id: user.id,
    amount: (invoice.amount_due || 0) / 100,
    currency: invoice.currency || 'brl',
    gateway: 'stripe',
    gateway_id: invoice.id,
    type: 'subscription',
    status: 'failed',
  })

  // Audit log
  await audit.paymentFailed(user.id, invoice.id || '', {
    amount: (invoice.amount_due || 0) / 100,
    type: 'subscription',
  })
}

async function getPlanSlugFromPriceId(priceId: string): Promise<string | null> {
  // Map price IDs to plan slugs
  const priceToSlug: Record<string, string> = {
    [process.env.STRIPE_PRICE_BASIC_MONTHLY || '']: 'basic',
    [process.env.STRIPE_PRICE_BASIC_YEARLY || '']: 'basic',
    [process.env.STRIPE_PRICE_PRO_MONTHLY || '']: 'pro',
    [process.env.STRIPE_PRICE_PRO_YEARLY || '']: 'pro',
    [process.env.STRIPE_PRICE_ENTERPRISE_MONTHLY || '']: 'enterprise',
    [process.env.STRIPE_PRICE_ENTERPRISE_YEARLY || '']: 'enterprise',
  }

  return priceToSlug[priceId] || null
}
