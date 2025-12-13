# Etapa 5: Pagamentos

## Objetivo
Implementar integracao com gateways de pagamento (Stripe e Mercado Pago) para assinaturas e compra de creditos.

---

## Checklist

### 5.1 Setup Stripe
- [ ] Criar conta Stripe
- [ ] Configurar produtos e precos
- [ ] Obter chaves de API (test e live)
- [ ] Configurar webhook endpoint
- [ ] Instalar `stripe` SDK

### 5.2 Setup Mercado Pago (Opcional)
- [ ] Criar conta MP
- [ ] Configurar preferencias
- [ ] Obter credenciais
- [ ] Configurar webhook

### 5.3 Produtos e Precos
- [ ] Criar produtos no Stripe:
  - [ ] Plano Basic (R$19/mes)
  - [ ] Plano Pro (R$49/mes)
  - [ ] Plano Enterprise (R$150/mes)
  - [ ] Pacote 10 creditos (R$29)
  - [ ] Pacote 50 creditos (R$99)
  - [ ] Pacote 100 creditos (R$179)

### 5.4 API de Pagamentos
- [ ] POST `/api/payments/create-checkout` - criar sessao de checkout
- [ ] POST `/api/payments/create-portal` - portal de gerenciamento
- [ ] POST `/api/webhooks/stripe` - receber eventos
- [ ] GET `/api/payments/history` - historico de pagamentos

### 5.5 Fluxos de Pagamento
- [ ] Checkout para assinatura
- [ ] Checkout para creditos
- [ ] Upgrade/downgrade de plano
- [ ] Cancelamento de assinatura
- [ ] Reativacao de assinatura

### 5.6 Webhooks
- [ ] `checkout.session.completed` - pagamento concluido
- [ ] `customer.subscription.created` - assinatura criada
- [ ] `customer.subscription.updated` - assinatura atualizada
- [ ] `customer.subscription.deleted` - assinatura cancelada
- [ ] `invoice.paid` - fatura paga
- [ ] `invoice.payment_failed` - falha no pagamento

### 5.7 UI de Pagamentos
- [ ] Pagina de precos/planos
- [ ] Pagina de billing do usuario
- [ ] Historico de pagamentos
- [ ] Botao de upgrade
- [ ] Modal de compra de creditos

---

## Implementacao

### Variaveis de Ambiente
```env
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

### Servico Stripe
```typescript
// /lib/services/stripe.ts
import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16'
})

// Precos dos planos (IDs do Stripe)
export const PLAN_PRICES = {
  basic: {
    monthly: 'price_basic_monthly_id',
    yearly: 'price_basic_yearly_id'
  },
  pro: {
    monthly: 'price_pro_monthly_id',
    yearly: 'price_pro_yearly_id'
  },
  enterprise: {
    monthly: 'price_enterprise_monthly_id',
    yearly: 'price_enterprise_yearly_id'
  }
}

// Precos dos pacotes de creditos
export const CREDIT_PRICES = {
  '10': 'price_credits_10_id',
  '50': 'price_credits_50_id',
  '100': 'price_credits_100_id'
}

export const CREDIT_AMOUNTS = {
  'price_credits_10_id': 10,
  'price_credits_50_id': 50,
  'price_credits_100_id': 100
}
```

### Criar Checkout de Assinatura
```typescript
// /app/api/payments/create-checkout/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { stripe, PLAN_PRICES, CREDIT_PRICES } from '@/lib/services/stripe'

export async function POST(request: NextRequest) {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { type, planId, billingPeriod, creditPackage } = await request.json()

  // Buscar ou criar customer no Stripe
  const { data: profile } = await supabase
    .from('users')
    .select('stripe_customer_id')
    .eq('id', user.id)
    .single()

  let customerId = profile?.stripe_customer_id

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      metadata: { user_id: user.id }
    })
    customerId = customer.id

    await supabase
      .from('users')
      .update({ stripe_customer_id: customerId })
      .eq('id', user.id)
  }

  let lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = []
  let mode: Stripe.Checkout.SessionCreateParams.Mode = 'payment'

  if (type === 'subscription') {
    const priceId = PLAN_PRICES[planId as keyof typeof PLAN_PRICES]?.[billingPeriod as 'monthly' | 'yearly']
    if (!priceId) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
    }
    lineItems = [{ price: priceId, quantity: 1 }]
    mode = 'subscription'
  } else if (type === 'credits') {
    const priceId = CREDIT_PRICES[creditPackage as keyof typeof CREDIT_PRICES]
    if (!priceId) {
      return NextResponse.json({ error: 'Invalid credit package' }, { status: 400 })
    }
    lineItems = [{ price: priceId, quantity: 1 }]
    mode = 'payment'
  }

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode,
    line_items: lineItems,
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/billing?success=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/billing?canceled=true`,
    metadata: {
      user_id: user.id,
      type,
      plan_id: planId,
      credit_package: creditPackage
    }
  })

  return NextResponse.json({ url: session.url })
}
```

### Webhook Stripe
```typescript
// /app/api/webhooks/stripe/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { stripe, CREDIT_AMOUNTS } from '@/lib/services/stripe'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      const userId = session.metadata?.user_id
      const type = session.metadata?.type

      if (type === 'credits') {
        // Adicionar creditos
        const priceId = session.line_items?.data[0]?.price?.id
        const creditsToAdd = CREDIT_AMOUNTS[priceId as keyof typeof CREDIT_AMOUNTS] || 0

        const { data: user } = await supabase
          .from('users')
          .select('credits')
          .eq('id', userId)
          .single()

        await supabase
          .from('users')
          .update({ credits: (user?.credits || 0) + creditsToAdd })
          .eq('id', userId)

        // Registrar pagamento
        await supabase.from('payments').insert({
          user_id: userId,
          amount: session.amount_total! / 100,
          currency: session.currency!.toUpperCase(),
          gateway: 'stripe',
          gateway_id: session.id,
          type: 'credits',
          status: 'paid',
          metadata: { credits: creditsToAdd }
        })
      }
      break
    }

    case 'customer.subscription.created':
    case 'customer.subscription.updated': {
      const subscription = event.data.object as Stripe.Subscription
      const customerId = subscription.customer as string

      // Buscar usuario pelo customer_id
      const { data: user } = await supabase
        .from('users')
        .select('id')
        .eq('stripe_customer_id', customerId)
        .single()

      if (user) {
        // Mapear price_id para plan_id
        const priceId = subscription.items.data[0]?.price.id
        const planId = getPlanIdFromPrice(priceId)

        await supabase
          .from('users')
          .update({
            plan_id: planId,
            subscription_status: subscription.status,
            subscription_id: subscription.id
          })
          .eq('id', user.id)
      }
      break
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription
      const customerId = subscription.customer as string

      const { data: user } = await supabase
        .from('users')
        .select('id')
        .eq('stripe_customer_id', customerId)
        .single()

      if (user) {
        await supabase
          .from('users')
          .update({
            plan_id: null,
            subscription_status: 'canceled',
            subscription_id: null
          })
          .eq('id', user.id)
      }
      break
    }
  }

  return NextResponse.json({ received: true })
}

function getPlanIdFromPrice(priceId: string): string | null {
  // Mapear price IDs para plan IDs do banco
  const mapping: Record<string, string> = {
    'price_basic_monthly_id': 'uuid-plano-basic',
    'price_pro_monthly_id': 'uuid-plano-pro',
    // ... etc
  }
  return mapping[priceId] || null
}
```

### Portal do Cliente
```typescript
// /app/api/payments/create-portal/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { stripe } from '@/lib/services/stripe'

export async function POST(request: NextRequest) {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: profile } = await supabase
    .from('users')
    .select('stripe_customer_id')
    .eq('id', user.id)
    .single()

  if (!profile?.stripe_customer_id) {
    return NextResponse.json({ error: 'No subscription found' }, { status: 400 })
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: profile.stripe_customer_id,
    return_url: `${process.env.NEXT_PUBLIC_APP_URL}/billing`
  })

  return NextResponse.json({ url: session.url })
}
```

---

## Adicionar Campos na Tabela Users

```sql
ALTER TABLE users ADD COLUMN stripe_customer_id TEXT;
ALTER TABLE users ADD COLUMN subscription_id TEXT;
ALTER TABLE users ADD COLUMN subscription_status TEXT;

CREATE INDEX idx_users_stripe_customer ON users(stripe_customer_id);
```

---

## UI Components

### PricingCard
```
- Nome do plano
- Preco mensal/anual
- Lista de features
- Botao "Assinar"
- Badge "Popular" (Pro)
```

### CreditPackageCard
```
- Quantidade de creditos
- Preco
- Preco por credito
- Botao "Comprar"
```

### BillingPage
```
- Plano atual
- Creditos disponiveis
- Historico de pagamentos
- Botao "Gerenciar Assinatura"
- Botao "Comprar Creditos"
```

---

## Entregaveis
- [ ] Checkout de assinatura funcionando
- [ ] Checkout de creditos funcionando
- [ ] Webhooks processando corretamente
- [ ] Creditos sendo adicionados
- [ ] Plano sendo atualizado
- [ ] Portal do cliente acessivel

---

## Proxima Etapa
[Etapa 6: Frontend Base](./06-frontend-base.md)
