import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { CreditCard, Crown, Zap, Check, Sparkles, Building2 } from 'lucide-react'
import Link from 'next/link'
import { UpgradeButton, BuyCreditsButton, ManageSubscriptionButton } from '@/components/billing/BillingActions'

interface Plan {
  id: string
  name: string
  slug: string
  price_monthly: number
  price_yearly: number
  documents_per_month: number | null
  features: string[]
  is_popular: boolean
}

interface UserProfile {
  id: string
  name: string
  email: string
  credits: number
  plan_id: string | null
  plan: Plan | null
  subscription_id: string | null
}

const planIcons: Record<string, React.ElementType> = {
  free: Zap,
  basic: Sparkles,
  pro: Crown,
  enterprise: Building2,
}

const planColors: Record<string, string> = {
  free: 'from-neutral-500 to-neutral-600',
  basic: 'from-emerald-500 to-emerald-600',
  pro: 'from-teal-500 to-teal-600',
  enterprise: 'from-amber-500 to-amber-600',
}

export default async function BillingPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch user profile with plan
  const { data: profile } = await supabase
    .from('users')
    .select('*, plan:plans(*)')
    .eq('id', user.id)
    .single() as { data: UserProfile | null }

  // Fetch all plans
  const { data: plans } = await supabase
    .from('plans')
    .select('*')
    .order('price_monthly', { ascending: true }) as { data: Plan[] | null }

  // Fetch payment history
  const { data: payments } = await supabase
    .from('payments')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(10)

  const currentPlan = profile?.plan
  const currentPlanSlug = currentPlan?.slug || 'free'

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
          Plano e Cobranca
        </h1>
        <p className="text-neutral-500 mt-1">
          Gerencie seu plano e veja seu historico de pagamentos
        </p>
      </div>

      {/* Current Plan Card */}
      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${planColors[currentPlanSlug]} flex items-center justify-center`}>
              {(() => {
                const Icon = planIcons[currentPlanSlug] || Zap
                return <Icon className="w-7 h-7 text-white" />
              })()}
            </div>
            <div>
              <p className="text-sm text-neutral-500">Plano Atual</p>
              <h2 className="text-xl font-bold text-neutral-900 dark:text-white">
                {currentPlan?.name || 'Free'}
              </h2>
              {currentPlan?.price_monthly ? (
                <p className="text-sm text-neutral-500">
                  R$ {currentPlan.price_monthly.toFixed(2)}/mes
                </p>
              ) : (
                <p className="text-sm text-green-600">Gratuito</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-6">
            {/* Credits */}
            <div className="text-center">
              <p className="text-3xl font-bold text-neutral-900 dark:text-white">
                {profile?.credits || 0}
              </p>
              <p className="text-sm text-neutral-500">Creditos</p>
            </div>

            {/* Documents limit */}
            {currentPlan?.documents_per_month && (
              <div className="text-center">
                <p className="text-3xl font-bold text-neutral-900 dark:text-white">
                  {currentPlan.documents_per_month === -1 ? 'Ilimitado' : currentPlan.documents_per_month}
                </p>
                <p className="text-sm text-neutral-500">Docs/mes</p>
              </div>
            )}
          </div>
        </div>

        {/* Features */}
        {currentPlan?.features && currentPlan.features.length > 0 && (
          <div className="mt-6 pt-6 border-t border-neutral-200 dark:border-neutral-800">
            <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-3">
              Recursos incluidos:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {currentPlan.features.map((feature, index) => (
                <div key={index} className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
                  <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                  {feature}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Plans Grid */}
      <div>
        <h2 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">
          {currentPlanSlug === 'free' ? 'Faca upgrade do seu plano' : 'Planos disponiveis'}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {plans?.map((plan) => {
            const Icon = planIcons[plan.slug] || Zap
            const isCurrentPlan = plan.id === currentPlan?.id
            const isUpgrade = (plan.price_monthly || 0) > (currentPlan?.price_monthly || 0)

            return (
              <div
                key={plan.id}
                className={`relative bg-white dark:bg-neutral-900 rounded-2xl border p-6 transition-all ${
                  isCurrentPlan
                    ? 'border-emerald-500 ring-2 ring-emerald-500/20'
                    : plan.is_popular
                    ? 'border-teal-500 ring-2 ring-teal-500/20'
                    : 'border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700'
                }`}
              >
                {plan.is_popular && !isCurrentPlan && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="px-3 py-1 bg-teal-600 text-white text-xs font-medium rounded-full">
                      Mais popular
                    </span>
                  </div>
                )}

                {isCurrentPlan && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="px-3 py-1 bg-emerald-600 text-white text-xs font-medium rounded-full">
                      Plano atual
                    </span>
                  </div>
                )}

                <div className="text-center mb-4">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${planColors[plan.slug]} flex items-center justify-center mx-auto mb-3`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
                    {plan.name}
                  </h3>
                </div>

                <div className="text-center mb-4">
                  {plan.price_monthly > 0 ? (
                    <>
                      <p className="text-3xl font-bold text-neutral-900 dark:text-white">
                        R$ {plan.price_monthly.toFixed(0)}
                      </p>
                      <p className="text-sm text-neutral-500">/mes</p>
                    </>
                  ) : (
                    <p className="text-3xl font-bold text-green-600">Gratis</p>
                  )}
                </div>

                <div className="space-y-2 mb-6">
                  <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
                    <Check className="w-4 h-4 text-green-500" />
                    {plan.documents_per_month === -1
                      ? 'Documentos ilimitados'
                      : `${plan.documents_per_month} documentos/mes`}
                  </div>
                  {plan.features?.slice(0, 3).map((feature, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
                      <Check className="w-4 h-4 text-green-500" />
                      {feature}
                    </div>
                  ))}
                </div>

                {isCurrentPlan ? (
                  <button
                    disabled
                    className="w-full py-2.5 px-4 bg-neutral-100 dark:bg-neutral-800 text-neutral-500 rounded-xl cursor-not-allowed"
                  >
                    Plano atual
                  </button>
                ) : isUpgrade && plan.slug !== 'free' ? (
                  <UpgradeButton planSlug={plan.slug} />
                ) : (
                  <button
                    disabled
                    className="w-full py-2.5 px-4 bg-neutral-100 dark:bg-neutral-800 text-neutral-500 rounded-xl cursor-not-allowed"
                  >
                    {plan.slug === 'free' ? 'Plano gratuito' : 'Downgrade'}
                  </button>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Buy Credits Section */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl p-6 text-white">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold">Precisa de mais creditos?</h2>
            <p className="text-emerald-100 mt-1">
              Compre pacotes de creditos avulsos para usar quando precisar
            </p>
          </div>
          <BuyCreditsButton />
        </div>
      </div>

      {/* Manage Subscription (if user has one) */}
      {profile?.subscription_id && (
        <div className="flex justify-center">
          <ManageSubscriptionButton />
        </div>
      )}

      {/* Payment History */}
      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6">
        <h2 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">
          Historico de Pagamentos
        </h2>

        {payments && payments.length > 0 ? (
          <div className="space-y-3">
            {payments.map((payment) => (
              <div
                key={payment.id}
                className="flex items-center justify-between py-3 border-b border-neutral-100 dark:border-neutral-800 last:border-0"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                    <CreditCard className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-neutral-900 dark:text-white">
                      {payment.description || 'Pagamento'}
                    </p>
                    <p className="text-sm text-neutral-500">
                      {new Date(payment.created_at).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-neutral-900 dark:text-white">
                    R$ {Number(payment.amount).toFixed(2)}
                  </p>
                  <p className={`text-sm ${
                    payment.status === 'paid' ? 'text-green-600' :
                    payment.status === 'pending' ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {payment.status === 'paid' ? 'Pago' :
                     payment.status === 'pending' ? 'Pendente' : 'Cancelado'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-neutral-100 dark:bg-neutral-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <CreditCard className="w-8 h-8 text-neutral-400" />
            </div>
            <p className="text-neutral-500">Nenhum pagamento realizado ainda</p>
          </div>
        )}
      </div>

      {/* Need help */}
      <div className="text-center py-4">
        <p className="text-neutral-500">
          Tem alguma duvida sobre cobranca?{' '}
          <Link href="/support" className="text-emerald-600 hover:text-emerald-700">
            Entre em contato
          </Link>
        </p>
      </div>
    </div>
  )
}
