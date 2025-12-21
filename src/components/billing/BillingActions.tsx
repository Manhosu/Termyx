'use client'

import { useState } from 'react'
import { CreditCard, Rocket, Loader2, Settings } from 'lucide-react'
import BuyCreditsModal from './BuyCreditsModal'

interface BillingActionsProps {
  hasSubscription?: boolean
}

export function UpgradeButton({
  planSlug,
  billingPeriod = 'monthly',
}: {
  planSlug: string
  billingPeriod?: 'monthly' | 'yearly'
}) {
  const [loading, setLoading] = useState(false)

  const handleUpgrade = async () => {
    setLoading(true)

    try {
      const response = await fetch('/api/mercadopago/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'subscription',
          planSlug,
          billingPeriod,
        }),
      })

      const data = await response.json()

      if (data.url) {
        window.location.href = data.url
      }
    } catch (error) {
      console.error('Upgrade error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleUpgrade}
      disabled={loading}
      className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <>
          <Rocket className="w-4 h-4" />
          Fazer upgrade
        </>
      )}
    </button>
  )
}

export function ManageSubscriptionButton() {
  // Mercado Pago nao tem portal de gerenciamento como Stripe
  // O usuario pode cancelar entrando em contato com suporte
  return (
    <a
      href="/support"
      className="flex items-center gap-2 px-4 py-2.5 border border-neutral-200 dark:border-neutral-700 rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
    >
      <Settings className="w-4 h-4" />
      Gerenciar Assinatura
    </a>
  )
}

export function BuyCreditsButton() {
  const [showModal, setShowModal] = useState(false)

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="px-6 py-3 bg-white text-emerald-600 font-medium rounded-xl hover:bg-emerald-50 transition-colors flex items-center gap-2"
      >
        <CreditCard className="w-5 h-5" />
        Comprar creditos
      </button>

      <BuyCreditsModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
      />
    </>
  )
}

export default function BillingActions({ hasSubscription }: BillingActionsProps) {
  const [showCreditsModal, setShowCreditsModal] = useState(false)

  return (
    <>
      <div className="flex items-center gap-3">
        {hasSubscription && <ManageSubscriptionButton />}
        <button
          onClick={() => setShowCreditsModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-colors"
        >
          <CreditCard className="w-4 h-4" />
          Comprar Creditos
        </button>
      </div>

      <BuyCreditsModal
        isOpen={showCreditsModal}
        onClose={() => setShowCreditsModal(false)}
      />
    </>
  )
}
