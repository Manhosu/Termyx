import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getPayment } from '@/lib/mercadopago'
import { audit } from '@/lib/audit'
import { sendEmail, emailTemplates } from '@/lib/email'

// Use service role for webhook operations
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Mercado Pago sends different notification types
    // We're interested in payment notifications
    if (body.type !== 'payment') {
      return NextResponse.json({ received: true })
    }

    const paymentId = body.data?.id
    if (!paymentId) {
      return NextResponse.json({ error: 'Missing payment ID' }, { status: 400 })
    }

    // Get payment details from Mercado Pago
    const payment = await getPayment(paymentId)

    if (!payment) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 })
    }

    // Get metadata from the payment
    const metadata = payment.metadata || {}
    const userId = metadata.user_id
    const type = metadata.type

    if (!userId) {
      console.error('Missing user_id in payment metadata')
      return NextResponse.json({ error: 'Missing user_id' }, { status: 400 })
    }

    // Handle based on payment status
    switch (payment.status) {
      case 'approved':
        await handleApprovedPayment(payment, userId, type, metadata)
        break

      case 'pending':
      case 'in_process':
        await handlePendingPayment(payment, userId, type)
        break

      case 'rejected':
      case 'cancelled':
        await handleFailedPayment(payment, userId, type)
        break

      default:
        console.log(`Unhandled payment status: ${payment.status}`)
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

interface PaymentData {
  id?: number
  status?: string
  transaction_amount?: number
  currency_id?: string
  metadata?: Record<string, unknown>
}

async function handleApprovedPayment(
  payment: PaymentData,
  userId: string,
  type: string,
  metadata: Record<string, unknown>
) {
  if (type === 'credits') {
    // Add credits to user
    const creditsToAdd = Number(metadata.credits) || 0

    if (creditsToAdd > 0) {
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

      // Log credit transaction
      await supabaseAdmin.from('credit_transactions').insert({
        user_id: userId,
        amount: creditsToAdd,
        type: 'purchase',
        description: `Compra de ${creditsToAdd} creditos`,
        reference_id: String(payment.id),
      })
    }
  } else if (type === 'subscription') {
    // Handle subscription
    const planSlug = metadata.plan_slug as string

    if (planSlug) {
      // Get plan from database
      const { data: plan } = await supabaseAdmin
        .from('plans')
        .select('id, credits_included')
        .eq('slug', planSlug)
        .single()

      if (plan) {
        // Update user's plan
        const updateData: Record<string, unknown> = {
          plan_id: plan.id,
          subscription_status: 'active',
        }

        // Add credits if plan includes them
        if (plan.credits_included > 0) {
          const { data: currentUser } = await supabaseAdmin
            .from('users')
            .select('credits')
            .eq('id', userId)
            .single()

          updateData.credits = (currentUser?.credits || 0) + plan.credits_included

          // Log credit transaction
          await supabaseAdmin.from('credit_transactions').insert({
            user_id: userId,
            amount: plan.credits_included,
            type: 'bonus',
            description: `Creditos inclusos no plano ${planSlug}`,
            reference_id: String(payment.id),
          })
        }

        await supabaseAdmin
          .from('users')
          .update(updateData)
          .eq('id', userId)

        // Audit log
        await audit.subscriptionCreated(userId, String(payment.id), {
          plan: planSlug,
          status: 'active',
        })
      }
    }
  }

  // Log payment
  await supabaseAdmin.from('payments').insert({
    user_id: userId,
    amount: payment.transaction_amount || 0,
    currency: payment.currency_id || 'BRL',
    gateway: 'mercadopago',
    gateway_id: String(payment.id),
    type: type || 'credits',
    status: 'paid',
    metadata: metadata,
  })

  // Audit log
  await audit.paymentCompleted(userId, String(payment.id), {
    amount: payment.transaction_amount || 0,
    type: type,
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
      amount: payment.transaction_amount || 0,
      currency: payment.currency_id || 'BRL',
      type: type || 'credits',
      details: type === 'credits'
        ? `${metadata.credits} creditos adicionados`
        : `Plano ${metadata.plan_slug}`,
    })

    await sendEmail({
      to: userData.email,
      subject: emailContent.subject,
      html: emailContent.html,
    }).catch((err) => console.error('Payment email error:', err))
  }
}

async function handlePendingPayment(
  payment: PaymentData,
  userId: string,
  type: string
) {
  // Log pending payment
  await supabaseAdmin.from('payments').insert({
    user_id: userId,
    amount: payment.transaction_amount || 0,
    currency: payment.currency_id || 'BRL',
    gateway: 'mercadopago',
    gateway_id: String(payment.id),
    type: type || 'credits',
    status: 'pending',
    metadata: payment.metadata,
  })
}

async function handleFailedPayment(
  payment: PaymentData,
  userId: string,
  type: string
) {
  // Log failed payment
  await supabaseAdmin.from('payments').insert({
    user_id: userId,
    amount: payment.transaction_amount || 0,
    currency: payment.currency_id || 'BRL',
    gateway: 'mercadopago',
    gateway_id: String(payment.id),
    type: type || 'credits',
    status: 'failed',
    metadata: payment.metadata,
  })

  // Audit log
  await audit.paymentFailed(userId, String(payment.id), {
    amount: payment.transaction_amount || 0,
    type: type,
  })
}
