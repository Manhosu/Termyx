'use client'

import Link from 'next/link'
import { FileQuestion, Home, ArrowLeft } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        {/* Icon */}
        <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <FileQuestion className="w-10 h-10 text-white" />
        </div>

        {/* Title */}
        <h1 className="text-6xl font-bold text-neutral-900 dark:text-white mb-2">
          404
        </h1>
        <h2 className="text-xl font-semibold text-neutral-700 dark:text-neutral-300 mb-4">
          Pagina nao encontrada
        </h2>

        {/* Description */}
        <p className="text-neutral-500 mb-8">
          A pagina que voce esta procurando nao existe ou foi movida para outro endereco.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white font-medium rounded-xl hover:bg-emerald-700 transition-colors"
          >
            <Home className="w-5 h-5" />
            Ir para o inicio
          </Link>
          <button
            onClick={() => history.back()}
            className="flex items-center gap-2 px-6 py-3 border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 font-medium rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Voltar
          </button>
        </div>

        {/* Help Link */}
        <p className="mt-8 text-sm text-neutral-500">
          Precisa de ajuda?{' '}
          <Link href="/help" className="text-emerald-600 hover:underline">
            Acesse nossa central de ajuda
          </Link>
        </p>
      </div>
    </div>
  )
}
