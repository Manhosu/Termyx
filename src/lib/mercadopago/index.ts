import { MercadoPagoConfig, Preference, Payment } from 'mercadopago'

// Lazy initialization to avoid build-time errors
let mpClient: MercadoPagoConfig | null = null

export function getMercadoPago(): MercadoPagoConfig {
  if (!mpClient) {
    if (!process.env.MP_ACCESS_TOKEN) {
      throw new Error('MP_ACCESS_TOKEN not configured')
    }
    mpClient = new MercadoPagoConfig({
      accessToken: process.env.MP_ACCESS_TOKEN,
    })
  }
  return mpClient
}

// Credit packages for purchase
export const creditPackages = [
  {
    id: 'credits_10',
    name: '10 Creditos',
    credits: 10,
    price: 19, // R$ 19.00
    priceDisplay: 'R$ 19,00',
    popular: false,
  },
  {
    id: 'credits_30',
    name: '30 Creditos',
    credits: 30,
    price: 49, // R$ 49.00
    priceDisplay: 'R$ 49,00',
    popular: true,
    savings: '14%',
  },
  {
    id: 'credits_100',
    name: '100 Creditos',
    credits: 100,
    price: 149, // R$ 149.00
    priceDisplay: 'R$ 149,00',
    popular: false,
    savings: '22%',
  },
]

// Plan prices
export const planPrices = {
  basic: {
    monthly: 19,
    yearly: 190,
  },
  pro: {
    monthly: 49,
    yearly: 490,
  },
  enterprise: {
    monthly: 150,
    yearly: 1500,
  },
}

export function getAppUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
}

// Create a preference for credits purchase
export async function createCreditsPreference(
  userId: string,
  userEmail: string,
  packageId: string
) {
  const pkg = creditPackages.find(p => p.id === packageId)
  if (!pkg) {
    throw new Error('Invalid package')
  }

  const preference = new Preference(getMercadoPago())

  const result = await preference.create({
    body: {
      items: [
        {
          id: pkg.id,
          title: pkg.name,
          quantity: 1,
          unit_price: pkg.price,
          currency_id: 'BRL',
        },
      ],
      payer: {
        email: userEmail,
      },
      metadata: {
        user_id: userId,
        type: 'credits',
        package_id: pkg.id,
        credits: pkg.credits,
      },
      back_urls: {
        success: `${getAppUrl()}/billing?status=success`,
        failure: `${getAppUrl()}/billing?status=failure`,
        pending: `${getAppUrl()}/billing?status=pending`,
      },
      auto_return: 'approved',
      notification_url: `${getAppUrl()}/api/mercadopago/webhook`,
    },
  })

  return result
}

// Create a preference for plan subscription
export async function createPlanPreference(
  userId: string,
  userEmail: string,
  planSlug: string,
  billingPeriod: 'monthly' | 'yearly'
) {
  const prices = planPrices[planSlug as keyof typeof planPrices]
  if (!prices) {
    throw new Error('Invalid plan')
  }

  const price = billingPeriod === 'yearly' ? prices.yearly : prices.monthly
  const planName = planSlug.charAt(0).toUpperCase() + planSlug.slice(1)

  const preference = new Preference(getMercadoPago())

  const result = await preference.create({
    body: {
      items: [
        {
          id: `plan_${planSlug}_${billingPeriod}`,
          title: `Plano ${planName} - ${billingPeriod === 'yearly' ? 'Anual' : 'Mensal'}`,
          quantity: 1,
          unit_price: price,
          currency_id: 'BRL',
        },
      ],
      payer: {
        email: userEmail,
      },
      metadata: {
        user_id: userId,
        type: 'subscription',
        plan_slug: planSlug,
        billing_period: billingPeriod,
      },
      back_urls: {
        success: `${getAppUrl()}/billing?status=success`,
        failure: `${getAppUrl()}/billing?status=failure`,
        pending: `${getAppUrl()}/billing?status=pending`,
      },
      auto_return: 'approved',
      notification_url: `${getAppUrl()}/api/mercadopago/webhook`,
    },
  })

  return result
}

// Get payment details
export async function getPayment(paymentId: string) {
  const payment = new Payment(getMercadoPago())
  return await payment.get({ id: paymentId })
}
