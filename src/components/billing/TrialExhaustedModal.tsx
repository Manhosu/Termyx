'use client'

import { useState } from 'react'
import { X, FileX, Sparkles, Check } from 'lucide-react'
import Link from 'next/link'

interface TrialExhaustedModalProps {
  isOpen: boolean
  onClose: () => void
  documentsUsed?: number
  trialLimit?: number
}

const plans = [
  {
    name: 'Basic',
    price: 'R$ 19',
    period: '/mes',
    features: [
      '50 documentos/mes',
      '5 templates',
      'Suporte por email',
    ],
    slug: 'basic',
    popular: false,
  },
  {
    name: 'Pro',
    price: 'R$ 49',
    period: '/mes',
    features: [
      '100 documentos/mes',
      'Templates ilimitados',
      'Suporte prioritario',
      'Sem marca d\'agua',
    ],
    slug: 'pro',
    popular: true,
  },
  {
    name: 'Enterprise',
    price: 'R$ 150',
    period: '/mes',
    features: [
      '500 documentos/mes',
      'Tudo do Pro',
      'API access',
      'Suporte dedicado',
    ],
    slug: 'enterprise',
    popular: false,
  },
]

export default function TrialExhaustedModal({
  isOpen,
  onClose,
  documentsUsed = 2,
  trialLimit = 2,
}: TrialExhaustedModalProps) {
  const [selectedPlan, setSelectedPlan] = useState<string | null>('pro')

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="p-8 pb-6 text-center border-b border-neutral-200 dark:border-neutral-800">
          <div className="w-16 h-16 mx-auto mb-4 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center">
            <FileX className="w-8 h-8 text-amber-600 dark:text-amber-400" />
          </div>
          <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2">
            Periodo de teste finalizado
          </h2>
          <p className="text-neutral-600 dark:text-neutral-400">
            Voce usou {documentsUsed} de {trialLimit} documentos gratuitos.
            <br />
            Assine um plano para continuar gerando documentos.
          </p>
        </div>

        {/* Plans */}
        <div className="p-8">
          <div className="grid md:grid-cols-3 gap-4">
            {plans.map((plan) => (
              <div
                key={plan.slug}
                onClick={() => setSelectedPlan(plan.slug)}
                className={`relative p-6 rounded-xl border-2 cursor-pointer transition-all ${
                  selectedPlan === plan.slug
                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20'
                    : 'border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-emerald-500 text-white text-xs font-medium rounded-full flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    Popular
                  </div>
                )}

                <div className="text-center mb-4">
                  <h3 className="font-semibold text-neutral-900 dark:text-white">
                    {plan.name}
                  </h3>
                  <div className="mt-2">
                    <span className="text-2xl font-bold text-neutral-900 dark:text-white">
                      {plan.price}
                    </span>
                    <span className="text-neutral-500 text-sm">{plan.period}</span>
                  </div>
                </div>

                <ul className="space-y-2">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
                      <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href={`/settings?tab=billing&plan=${selectedPlan}`}
              className="w-full sm:w-auto px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl transition-colors text-center"
            >
              Assinar {plans.find(p => p.slug === selectedPlan)?.name}
            </Link>
            <Link
              href="/pricing"
              className="text-sm text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
            >
              Ver todos os planos
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
