import Stripe from 'stripe'

// Lazy initialization to avoid build-time errors
let stripeInstance: Stripe | null = null

export function getStripe(): Stripe {
  if (!stripeInstance) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('STRIPE_SECRET_KEY not configured')
    }
    stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-11-17.clover',
      typescript: true,
    })
  }
  return stripeInstance
}

// Backwards compatibility - use getStripe() in new code
export const stripe = {
  get webhooks() { return getStripe().webhooks },
  get checkout() { return getStripe().checkout },
  get customers() { return getStripe().customers },
  get billingPortal() { return getStripe().billingPortal },
  get subscriptions() { return getStripe().subscriptions },
  get prices() { return getStripe().prices },
}

// Credit packages for purchase
export const creditPackages = [
  {
    id: 'credits_10',
    name: '10 Creditos',
    credits: 10,
    price: 1900, // R$ 19.00 in cents
    priceDisplay: 'R$ 19,00',
    popular: false,
  },
  {
    id: 'credits_30',
    name: '30 Creditos',
    credits: 30,
    price: 4900, // R$ 49.00 in cents
    priceDisplay: 'R$ 49,00',
    popular: true,
    savings: '14%',
  },
  {
    id: 'credits_100',
    name: '100 Creditos',
    credits: 100,
    price: 14900, // R$ 149.00 in cents
    priceDisplay: 'R$ 149,00',
    popular: false,
    savings: '22%',
  },
]

// Plan slugs mapped to Stripe price IDs (configure in Stripe Dashboard)
export const planPriceIds: Record<string, { monthly: string; yearly: string }> = {
  basic: {
    monthly: process.env.STRIPE_PRICE_BASIC_MONTHLY || '',
    yearly: process.env.STRIPE_PRICE_BASIC_YEARLY || '',
  },
  pro: {
    monthly: process.env.STRIPE_PRICE_PRO_MONTHLY || '',
    yearly: process.env.STRIPE_PRICE_PRO_YEARLY || '',
  },
  enterprise: {
    monthly: process.env.STRIPE_PRICE_ENTERPRISE_MONTHLY || '',
    yearly: process.env.STRIPE_PRICE_ENTERPRISE_YEARLY || '',
  },
}

export function getAppUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
}
