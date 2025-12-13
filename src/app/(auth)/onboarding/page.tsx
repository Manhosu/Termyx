'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Loader2, Briefcase, User, Building2, MoreHorizontal } from 'lucide-react'

const categories = [
  {
    id: 'freelancer',
    label: 'Freelancer / Autonomo',
    description: 'Designer, dev, social media, consultor...',
    icon: User,
  },
  {
    id: 'mei',
    label: 'MEI / Microempresa',
    description: 'Eletricista, diarista, personal, salao...',
    icon: Briefcase,
  },
  {
    id: 'empresa',
    label: 'Empresa / Agencia',
    description: 'Escritorio, imobiliaria, agencia...',
    icon: Building2,
  },
  {
    id: 'outro',
    label: 'Outro',
    description: 'Nenhuma das opcoes acima',
    icon: MoreHorizontal,
  },
]

export default function OnboardingPage() {
  const router = useRouter()
  const [selected, setSelected] = useState<string | null>(null)
  const [companyName, setCompanyName] = useState('')
  const [loading, setLoading] = useState(false)

  const supabase = createClient()

  const handleContinue = async () => {
    if (!selected) return

    setLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        // Update user profile
        await supabase
          .from('users')
          .update({
            business_category: selected,
            company_name: companyName || null,
            onboarding_completed: true,
          })
          .eq('id', user.id)

        // Send welcome email (fire and forget - don't block navigation)
        fetch('/api/email/welcome', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        }).catch((err) => console.error('Welcome email error:', err))
      }

      router.push('/dashboard')
      router.refresh()
    } catch (error) {
      console.error('Onboarding error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-950 px-4 py-8">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-white">
            Bem-vindo ao Termyx
          </h1>
          <p className="text-neutral-500 mt-2">
            Nos conte um pouco sobre voce para personalizarmos sua experiencia
          </p>
        </div>

        {/* Categories */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {categories.map((category) => {
            const Icon = category.icon
            const isSelected = selected === category.id

            return (
              <button
                key={category.id}
                onClick={() => setSelected(category.id)}
                className={`
                  p-6 rounded-2xl border-2 text-left transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]
                  ${isSelected
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:border-neutral-300 dark:hover:border-neutral-700'
                  }
                `}
              >
                <div className="flex items-start gap-4">
                  <div className={`
                    p-3 rounded-xl
                    ${isSelected
                      ? 'bg-blue-500 text-white'
                      : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
                    }
                  `}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className={`font-semibold ${isSelected ? 'text-blue-700 dark:text-blue-300' : 'text-neutral-900 dark:text-white'}`}>
                      {category.label}
                    </h3>
                    <p className="text-sm text-neutral-500 mt-1">
                      {category.description}
                    </p>
                  </div>
                </div>
              </button>
            )
          })}
        </div>

        {/* Company Name (optional) */}
        {selected && (
          <div className="mb-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <label
              htmlFor="company"
              className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2"
            >
              Nome da empresa ou marca (opcional)
            </label>
            <input
              id="company"
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="Ex: Studio Design, Joao Servicos..."
            />
          </div>
        )}

        {/* Continue Button */}
        <button
          onClick={handleContinue}
          disabled={!selected || loading}
          className="w-full py-4 px-6 bg-blue-600 hover:bg-blue-700 disabled:bg-neutral-300 dark:disabled:bg-neutral-700 disabled:cursor-not-allowed text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Salvando...
            </>
          ) : (
            'Continuar para o Dashboard'
          )}
        </button>

        {/* Skip */}
        <button
          onClick={() => router.push('/dashboard')}
          className="w-full mt-4 py-3 text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 text-sm"
        >
          Pular por enquanto
        </button>
      </div>
    </div>
  )
}
