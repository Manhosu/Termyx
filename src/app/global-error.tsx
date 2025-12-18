'use client'

import { useEffect } from 'react'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log error to console in development
    console.error('Global error:', error)
  }, [error])

  return (
    <html>
      <body className="min-h-screen bg-neutral-50 dark:bg-neutral-950 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          {/* Icon */}
          <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="w-10 h-10 text-red-600" />
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2">
            Algo deu errado
          </h1>

          {/* Description */}
          <p className="text-neutral-500 mb-6">
            Ocorreu um erro inesperado. Nossa equipe foi notificada e estamos trabalhando para resolver.
          </p>

          {/* Error digest for support */}
          {error.digest && (
            <p className="text-xs text-neutral-400 mb-6 font-mono">
              Codigo: {error.digest}
            </p>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={reset}
              className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white font-medium rounded-xl hover:bg-emerald-700 transition-colors"
            >
              <RefreshCw className="w-5 h-5" />
              Tentar novamente
            </button>
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
            <a
              href="/"
              className="flex items-center gap-2 px-6 py-3 border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 font-medium rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            >
              <Home className="w-5 h-5" />
              Ir para o inicio
            </a>
          </div>

          {/* Support Link */}
          <p className="mt-8 text-sm text-neutral-500">
            Se o problema persistir,{' '}
            <a href="mailto:suporte@termyx.com.br" className="text-emerald-600 hover:underline">
              entre em contato com o suporte
            </a>
          </p>
        </div>
      </body>
    </html>
  )
}
