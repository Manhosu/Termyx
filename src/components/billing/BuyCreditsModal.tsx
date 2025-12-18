'use client'

import { useState } from 'react'
import { X, CreditCard, Loader2, Sparkles, Check } from 'lucide-react'

interface CreditPackage {
  id: string
  name: string
  credits: number
  price: number
  priceDisplay: string
  popular?: boolean
  savings?: string
}

const creditPackages: CreditPackage[] = [
  {
    id: 'credits_10',
    name: '10 Creditos',
    credits: 10,
    price: 1900,
    priceDisplay: 'R$ 19,00',
  },
  {
    id: 'credits_30',
    name: '30 Creditos',
    credits: 30,
    price: 4900,
    priceDisplay: 'R$ 49,00',
    popular: true,
    savings: '14%',
  },
  {
    id: 'credits_100',
    name: '100 Creditos',
    credits: 100,
    price: 14900,
    priceDisplay: 'R$ 149,00',
    savings: '22%',
  },
]

interface BuyCreditsModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function BuyCreditsModal({ isOpen, onClose }: BuyCreditsModalProps) {
  const [selectedPackage, setSelectedPackage] = useState<string>('credits_30')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handlePurchase = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'credits',
          packageId: selectedPackage,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao processar pagamento')
      }

      // Redirect to Stripe Checkout
      if (data.url) {
        window.location.href = data.url
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao processar pagamento')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-neutral-900 rounded-2xl w-full max-w-lg animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-neutral-200 dark:border-neutral-800">
          <div>
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
              Comprar Creditos
            </h2>
            <p className="text-sm text-neutral-500 mt-1">
              Escolha um pacote de creditos
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="p-2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Error */}
          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-sm text-red-700 dark:text-red-400">
              {error}
            </div>
          )}

          {/* Packages */}
          <div className="space-y-3">
            {creditPackages.map((pkg) => (
              <button
                key={pkg.id}
                onClick={() => setSelectedPackage(pkg.id)}
                disabled={loading}
                className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                  selectedPackage === pkg.id
                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20'
                    : 'border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600'
                } disabled:opacity-50`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      selectedPackage === pkg.id
                        ? 'bg-emerald-500 text-white'
                        : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-500'
                    }`}>
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-neutral-900 dark:text-white">
                          {pkg.name}
                        </span>
                        {pkg.popular && (
                          <span className="px-2 py-0.5 bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400 text-xs font-medium rounded-full">
                            Popular
                          </span>
                        )}
                      </div>
                      {pkg.savings && (
                        <span className="text-sm text-green-600">
                          Economize {pkg.savings}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-bold text-neutral-900 dark:text-white">
                      {pkg.priceDisplay}
                    </span>
                    {selectedPackage === pkg.id && (
                      <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Info */}
          <p className="text-sm text-neutral-500 text-center">
            Cada credito permite gerar 1 documento PDF
          </p>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-neutral-200 dark:border-neutral-800">
          <button
            onClick={handlePurchase}
            disabled={loading}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Processando...
              </>
            ) : (
              <>
                <CreditCard className="w-5 h-5" />
                Comprar Agora
              </>
            )}
          </button>
          <p className="text-xs text-neutral-400 text-center mt-3">
            Pagamento seguro processado pelo Stripe
          </p>
        </div>
      </div>
    </div>
  )
}
