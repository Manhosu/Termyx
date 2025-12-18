'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { Mail, CheckCircle2, RefreshCw, Loader2 } from 'lucide-react'

export default function VerifyEmailPage() {
  const router = useRouter()
  const [email, setEmail] = useState<string | null>(null)
  const [checking, setChecking] = useState(false)
  const [verified, setVerified] = useState(false)
  const [resending, setResending] = useState(false)
  const [resendMessage, setResendMessage] = useState<string | null>(null)

  const supabase = createClient()

  // Get user email on mount
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user?.email) {
        setEmail(user.email)

        // If already confirmed, redirect to dashboard
        if (user.email_confirmed_at) {
          setVerified(true)
          setTimeout(() => router.push('/dashboard'), 1500)
        }
      }
    }
    getUser()
  }, [supabase, router])

  // Poll for email confirmation
  useEffect(() => {
    if (verified) return

    const checkConfirmation = async () => {
      setChecking(true)
      try {
        // Refresh the session to get latest user data
        const { data: { user }, error } = await supabase.auth.getUser()

        if (error) {
          console.error('Error checking user:', error)
          return
        }

        if (user?.email_confirmed_at) {
          setVerified(true)
          // Small delay to show success state
          setTimeout(() => router.push('/dashboard'), 1500)
        }
      } catch (err) {
        console.error('Check confirmation error:', err)
      } finally {
        setChecking(false)
      }
    }

    // Check every 3 seconds
    const interval = setInterval(checkConfirmation, 3000)

    return () => clearInterval(interval)
  }, [supabase, router, verified])

  // Listen for auth state changes (when user clicks confirmation link)
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'USER_UPDATED' && session?.user?.email_confirmed_at) {
          setVerified(true)
          setTimeout(() => router.push('/dashboard'), 1500)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [supabase, router])

  const handleResendEmail = async () => {
    if (!email || resending) return

    setResending(true)
    setResendMessage(null)

    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
      })

      if (error) {
        setResendMessage('Erro ao reenviar. Tente novamente.')
      } else {
        setResendMessage('Email reenviado com sucesso!')
      }
    } catch {
      setResendMessage('Erro ao reenviar. Tente novamente.')
    } finally {
      setResending(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-950 px-4 py-8">
      <div className="w-full max-w-md text-center">
        {/* Logo */}
        <Link href="/" className="inline-block mb-8">
          <Image
            src="/logo.png"
            alt="Termyx"
            width={180}
            height={48}
            className="h-12 w-auto mx-auto"
            priority
          />
        </Link>

        {/* Card */}
        <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-xl p-8 border border-neutral-200 dark:border-neutral-800">
          {verified ? (
            // Success State
            <>
              <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h1 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2">
                Email verificado!
              </h1>
              <p className="text-neutral-500 mb-4">
                Redirecionando para o dashboard...
              </p>
              <Loader2 className="w-6 h-6 animate-spin text-emerald-600 mx-auto" />
            </>
          ) : (
            // Waiting State
            <>
              <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                <Mail className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h1 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2">
                Verifique seu email
              </h1>
              <p className="text-neutral-500 mb-6">
                Enviamos um link de confirmacao para{' '}
                <span className="font-medium text-neutral-700 dark:text-neutral-300">
                  {email || 'seu email'}
                </span>
              </p>

              {/* Checking indicator */}
              <div className="flex items-center justify-center gap-2 text-sm text-neutral-400 mb-6">
                <RefreshCw className={`w-4 h-4 ${checking ? 'animate-spin' : ''}`} />
                <span>Aguardando confirmacao...</span>
              </div>

              {/* Resend Button */}
              <button
                onClick={handleResendEmail}
                disabled={resending}
                className="text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 font-medium text-sm flex items-center justify-center gap-2 mx-auto disabled:opacity-50"
              >
                {resending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Reenviando...
                  </>
                ) : (
                  'Reenviar email de confirmacao'
                )}
              </button>

              {/* Resend Message */}
              {resendMessage && (
                <p className={`mt-3 text-sm ${
                  resendMessage.includes('sucesso')
                    ? 'text-emerald-600'
                    : 'text-red-500'
                }`}>
                  {resendMessage}
                </p>
              )}
            </>
          )}
        </div>

        {/* Help Text */}
        <p className="mt-6 text-sm text-neutral-500">
          Nao recebeu o email? Verifique sua caixa de spam ou{' '}
          <Link href="/login" className="text-emerald-600 hover:underline">
            tente fazer login
          </Link>
        </p>
      </div>
    </div>
  )
}
