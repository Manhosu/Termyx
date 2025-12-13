'use client'

import { useState } from 'react'
import { X, Send, Loader2, CheckCircle, AlertCircle } from 'lucide-react'

interface SendEmailModalProps {
  documentId: string
  documentTitle: string
  isOpen: boolean
  onClose: () => void
}

export default function SendEmailModal({
  documentId,
  documentTitle,
  isOpen,
  onClose,
}: SendEmailModalProps) {
  const [recipientEmail, setRecipientEmail] = useState('')
  const [recipientName, setRecipientName] = useState('')
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!recipientEmail.trim()) return

    setSending(true)
    setStatus('idle')
    setErrorMessage('')

    try {
      const response = await fetch('/api/documents/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          documentId,
          recipientEmail: recipientEmail.trim(),
          recipientName: recipientName.trim() || undefined,
          message: message.trim() || undefined,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send email')
      }

      setStatus('success')
      // Reset form after success
      setTimeout(() => {
        setRecipientEmail('')
        setRecipientName('')
        setMessage('')
        setStatus('idle')
        onClose()
      }, 2000)
    } catch (error) {
      setStatus('error')
      setErrorMessage(error instanceof Error ? error.message : 'Failed to send email')
    } finally {
      setSending(false)
    }
  }

  const handleClose = () => {
    if (!sending) {
      setRecipientEmail('')
      setRecipientName('')
      setMessage('')
      setStatus('idle')
      setErrorMessage('')
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200"
      onClick={handleClose}
    >
      <div
        className="bg-white dark:bg-neutral-900 rounded-2xl w-full max-w-lg animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-neutral-200 dark:border-neutral-800">
          <div>
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
              Enviar por Email
            </h2>
            <p className="text-sm text-neutral-500 mt-1 truncate max-w-[300px]">
              {documentTitle}
            </p>
          </div>
          <button
            onClick={handleClose}
            disabled={sending}
            className="p-2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Success State */}
          {status === 'success' && (
            <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
              <p className="text-sm text-green-700 dark:text-green-400">
                Email enviado com sucesso!
              </p>
            </div>
          )}

          {/* Error State */}
          {status === 'error' && (
            <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
              <p className="text-sm text-red-700 dark:text-red-400">
                {errorMessage}
              </p>
            </div>
          )}

          {/* Recipient Email */}
          <div>
            <label
              htmlFor="recipientEmail"
              className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5"
            >
              Email do destinatario *
            </label>
            <input
              type="email"
              id="recipientEmail"
              value={recipientEmail}
              onChange={(e) => setRecipientEmail(e.target.value)}
              placeholder="email@exemplo.com"
              required
              disabled={sending}
              className="w-full px-4 py-3 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white placeholder-neutral-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all disabled:opacity-50"
            />
          </div>

          {/* Recipient Name (optional) */}
          <div>
            <label
              htmlFor="recipientName"
              className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5"
            >
              Nome do destinatario
              <span className="text-neutral-400 font-normal ml-1">(opcional)</span>
            </label>
            <input
              type="text"
              id="recipientName"
              value={recipientName}
              onChange={(e) => setRecipientName(e.target.value)}
              placeholder="Nome completo"
              disabled={sending}
              className="w-full px-4 py-3 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white placeholder-neutral-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all disabled:opacity-50"
            />
          </div>

          {/* Message (optional) */}
          <div>
            <label
              htmlFor="message"
              className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5"
            >
              Mensagem
              <span className="text-neutral-400 font-normal ml-1">(opcional)</span>
            </label>
            <textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Adicione uma mensagem personalizada..."
              rows={3}
              disabled={sending}
              className="w-full px-4 py-3 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white placeholder-neutral-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none disabled:opacity-50"
            />
          </div>

          {/* Info */}
          <p className="text-sm text-neutral-500">
            O documento PDF sera anexado ao email automaticamente.
          </p>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              disabled={sending}
              className="flex-1 px-4 py-3 border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={sending || !recipientEmail.trim() || status === 'success'}
              className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {sending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Enviar
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
