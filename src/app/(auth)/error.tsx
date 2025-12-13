'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'

export default function AuthError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Auth error:', error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-950 px-4">
      <div className="w-full max-w-md text-center">
        {/* Icon */}
        <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="w-8 h-8 text-red-600" />
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2">
          Algo deu errado
        </h1>

        {/* Description */}
        <p className="text-neutral-500 mb-4">
          Ocorreu um erro inesperado. Tente novamente ou volte para a pagina inicial.
        </p>

        {/* Error digest for support */}
        {error.digest && (
          <p className="text-xs text-neutral-400 mb-6 font-mono bg-neutral-100 dark:bg-neutral-800 px-3 py-2 rounded-lg inline-block">
            Codigo: {error.digest}
          </p>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-6">
          <button
            onClick={reset}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors"
          >
            <RefreshCw className="w-5 h-5" />
            Tentar novamente
          </button>
          <Link
            href="/"
            className="flex items-center gap-2 px-6 py-3 border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 font-medium rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <Home className="w-5 h-5" />
            Pagina inicial
          </Link>
        </div>

        {/* Help Link */}
        <p className="mt-8 text-sm text-neutral-500">
          Se o problema persistir,{' '}
          <Link href="/help" className="text-blue-600 hover:underline">
            acesse nossa central de ajuda
          </Link>
        </p>
      </div>
    </div>
  )
}
