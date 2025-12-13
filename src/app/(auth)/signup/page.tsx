'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Eye, EyeOff, Loader2, Check, X } from 'lucide-react'

export default function SignupPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [acceptTerms, setAcceptTerms] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()

  // Password strength indicators
  const passwordChecks = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
  }

  const isPasswordStrong = Object.values(passwordChecks).every(Boolean)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (!acceptTerms) {
      setError('Voce precisa aceitar os termos de uso')
      setLoading(false)
      return
    }

    if (!isPasswordStrong) {
      setError('A senha nao atende aos requisitos minimos')
      setLoading(false)
      return
    }

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
          },
        },
      })

      if (error) {
        if (error.message.includes('already registered')) {
          setError('Este email ja esta cadastrado')
        } else {
          setError(error.message)
        }
        return
      }

      // Log successful signup
      try {
        await fetch('/api/audit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'user.signup', payload: { name } }),
        })
      } catch {
        // Non-blocking audit
      }

      router.push('/onboarding')
      router.refresh()
    } catch {
      setError('Erro ao criar conta. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-950 px-4 py-8">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-white">
            Termyx
          </h1>
          <p className="text-neutral-500 mt-2">
            Crie sua conta gratuitamente
          </p>
        </div>

        {/* Card */}
        <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-xl p-8 border border-neutral-200 dark:border-neutral-800">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Error Message */}
            {error && (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm">
                {error}
              </div>
            )}

            {/* Name */}
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2"
              >
                Nome completo
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Seu nome"
              />
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="seu@email.com"
              />
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2"
              >
                Senha
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all pr-12"
                  placeholder="********"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>

              {/* Password Requirements */}
              {password && (
                <div className="mt-3 space-y-1">
                  <PasswordCheck passed={passwordChecks.length} text="Minimo 8 caracteres" />
                  <PasswordCheck passed={passwordChecks.uppercase} text="Uma letra maiuscula" />
                  <PasswordCheck passed={passwordChecks.lowercase} text="Uma letra minuscula" />
                  <PasswordCheck passed={passwordChecks.number} text="Um numero" />
                </div>
              )}
            </div>

            {/* Terms */}
            <div className="flex items-start gap-3">
              <input
                id="terms"
                type="checkbox"
                checked={acceptTerms}
                onChange={(e) => setAcceptTerms(e.target.checked)}
                className="mt-1 w-4 h-4 rounded border-neutral-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="terms" className="text-sm text-neutral-600 dark:text-neutral-400">
                Concordo com os{' '}
                <Link href="/terms" className="text-blue-600 hover:underline">
                  Termos de Uso
                </Link>{' '}
                e{' '}
                <Link href="/privacy" className="text-blue-600 hover:underline">
                  Politica de Privacidade
                </Link>
              </label>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || !acceptTerms}
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Criando conta...
                </>
              ) : (
                'Criar conta'
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center">
            <div className="flex-1 border-t border-neutral-200 dark:border-neutral-700" />
            <span className="px-4 text-sm text-neutral-500">ou</span>
            <div className="flex-1 border-t border-neutral-200 dark:border-neutral-700" />
          </div>

          {/* Login Link */}
          <p className="text-center text-neutral-600 dark:text-neutral-400">
            Ja tem uma conta?{' '}
            <Link
              href="/login"
              className="text-blue-600 hover:text-blue-700 dark:text-blue-400 font-medium"
            >
              Entrar
            </Link>
          </p>
        </div>

        {/* Benefits */}
        <div className="mt-8 text-center text-sm text-neutral-500">
          <p className="font-medium text-neutral-700 dark:text-neutral-300 mb-2">
            Comece gratis com:
          </p>
          <ul className="space-y-1">
            <li>3 documentos por mes</li>
            <li>Templates profissionais</li>
            <li>Envio por email e WhatsApp</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

function PasswordCheck({ passed, text }: { passed: boolean; text: string }) {
  return (
    <div className="flex items-center gap-2 text-xs">
      {passed ? (
        <Check className="w-4 h-4 text-green-500" />
      ) : (
        <X className="w-4 h-4 text-neutral-400" />
      )}
      <span className={passed ? 'text-green-600' : 'text-neutral-500'}>
        {text}
      </span>
    </div>
  )
}
