'use client'

import { useState } from 'react'
import { X, CreditCard, Sparkles, Check, Coins } from 'lucide-react'
import Link from 'next/link'

interface NoCreditsModalProps {
  isOpen: boolean
  onClose: () => void
  credits?: number
}

const plans = [
  {
    name: 'Basic',
    price: 'R$ 19',
    period: '/mes',
    credits: 30,
    features: [
      '30 creditos/mes',
      '3 templates customizados',
      'Suporte por email',
    ],
    slug: 'basic',
    popular: false,
  },
  {
    name: 'Pro',
    price: 'R$ 49',
    period: '/mes',
    credits: 100,
    features: [
      '100 creditos/mes',
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
    credits: 500,
    features: [
      '500 creditos/mes',
      'Tudo do Pro',
      'API access',
      'Suporte dedicado',
    ],
    slug: 'enterprise',
    popular: false,
  },
]

const creditPackages = [
  { id: 'credits_10', credits: 10, price: 'R$ 19', pricePerCredit: 'R$ 1,90' },
  { id: 'credits_30', credits: 30, price: 'R$ 49', pricePerCredit: 'R$ 1,63' },
  { id: 'credits_100', credits: 100, price: 'R$ 149', pricePerCredit: 'R$ 1,49' },
]

export default function NoCreditsModal({
  isOpen,
  onClose,
  credits = 0,
}: NoCreditsModalProps) {
  const [selectedPlan, setSelectedPlan] = useState<string | null>('pro')
  const [activeTab, setActiveTab] = useState<'plans' | 'credits'>('plans')

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
            <CreditCard className="w-8 h-8 text-amber-600 dark:text-amber-400" />
          </div>
          <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2">
            Creditos insuficientes
          </h2>
          <p className="text-neutral-600 dark:text-neutral-400">
            Voce tem <span className="font-semibold text-amber-600">{credits} creditos</span> disponiveis.
            <br />
            Cada documento (rascunho ou finalizado) consome 1 credito.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-neutral-200 dark:border-neutral-800">
          <button
            onClick={() => setActiveTab('plans')}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              activeTab === 'plans'
                ? 'text-emerald-600 border-b-2 border-emerald-600'
                : 'text-neutral-500 hover:text-neutral-700'
            }`}
          >
            <Sparkles className="w-4 h-4 inline mr-2" />
            Assinar Plano
          </button>
          <button
            onClick={() => setActiveTab('credits')}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              activeTab === 'credits'
                ? 'text-emerald-600 border-b-2 border-emerald-600'
                : 'text-neutral-500 hover:text-neutral-700'
            }`}
          >
            <Coins className="w-4 h-4 inline mr-2" />
            Comprar Creditos
          </button>
        </div>

        {/* Content */}
        <div className="p-8">
          {activeTab === 'plans' ? (
            <>
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
                      <div className="mt-1 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                        {plan.credits} creditos/mes
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
                  href={`/billing?plan=${selectedPlan}`}
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
            </>
          ) : (
            <>
              <p className="text-center text-neutral-600 dark:text-neutral-400 mb-6">
                Compre creditos avulsos para usar quando precisar.
              </p>

              <div className="grid md:grid-cols-3 gap-4">
                {creditPackages.map((pkg) => (
                  <Link
                    key={pkg.id}
                    href={`/billing?credits=${pkg.credits}`}
                    className="p-6 rounded-xl border-2 border-neutral-200 dark:border-neutral-700 hover:border-emerald-500 transition-all text-center group"
                  >
                    <div className="w-12 h-12 mx-auto mb-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Coins className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div className="text-3xl font-bold text-neutral-900 dark:text-white mb-1">
                      {pkg.credits}
                    </div>
                    <div className="text-sm text-neutral-500 mb-3">
                      creditos
                    </div>
                    <div className="text-xl font-semibold text-emerald-600 dark:text-emerald-400">
                      {pkg.price}
                    </div>
                    <div className="text-xs text-neutral-400 mt-1">
                      {pkg.pricePerCredit}/credito
                    </div>
                  </Link>
                ))}
              </div>

              <p className="text-center text-xs text-neutral-400 mt-6">
                Creditos nao expiram e podem ser usados a qualquer momento.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
