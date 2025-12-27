'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ArrowLeft, Download, Send, Share2, Trash2, Calendar, Clock, CreditCard, Loader2, Mail, MessageCircle, Copy, Check, FileText } from 'lucide-react'
import { useUser } from '@/lib/hooks/useUser'
import Link from 'next/link'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface Document {
  id: string
  title: string
  status: 'draft' | 'generated' | 'sent' | 'archived'
  data: Record<string, string>
  pdf_path: string | null
  credits_charged: number
  created_at: string
  updated_at: string
  generated_at: string | null
  templates: {
    id: string
    name: string
    category: string
    content_html: string
    placeholders: Array<{ name: string; label: string }>
  } | null
}

interface DocumentSend {
  id: string
  channel: 'email' | 'whatsapp'
  recipient: string
  status: string
  created_at: string
}

const statusConfig = {
  draft: { label: 'Rascunho', color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' },
  generated: { label: 'Gerado', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
  sent: { label: 'Enviado', color: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400' },
  archived: { label: 'Arquivado', color: 'bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-400' }
}

export default function DocumentDetailPage() {
  const params = useParams()
  const router = useRouter()
  const documentId = params?.id as string

  const [document, setDocument] = useState<Document | null>(null)
  const [sends, setSends] = useState<DocumentSend[]>([])
  const [loading, setLoading] = useState(true)
  const [showSendModal, setShowSendModal] = useState(false)
  const [showShareModal, setShowShareModal] = useState(false)
  const [shareLink, setShareLink] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [generationError, setGenerationError] = useState<string | null>(null)

  const supabase = createClient()
  const { profile } = useUser()

  const FREE_TRIAL_LIMIT = 2
  const freeTrialCount = profile?.free_trial_documents_count || 0
  const isTrialExhausted = freeTrialCount >= FREE_TRIAL_LIMIT
  const planSlug = profile?.plan?.slug || 'free'
  const showWatermark = planSlug === 'free' && isTrialExhausted

  useEffect(() => {
    loadDocument()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [documentId])

  async function loadDocument() {
    const { data: doc, error } = await supabase
      .from('documents')
      .select(`
        *,
        templates (id, name, category, content_html, placeholders)
      `)
      .eq('id', documentId)
      .single()

    if (error || !doc) {
      router.push('/documents')
      return
    }

    setDocument(doc as unknown as Document)

    // Load sends
    const { data: sendsData } = await supabase
      .from('document_sends')
      .select('*')
      .eq('document_id', documentId)
      .order('created_at', { ascending: false })

    if (sendsData) {
      setSends(sendsData as DocumentSend[])
    }

    setLoading(false)
  }

  const handleDownload = async () => {
    if (!document?.pdf_path) return

    const { data } = await supabase.storage
      .from('documents')
      .createSignedUrl(document.pdf_path, 60)

    if (data?.signedUrl) {
      window.open(data.signedUrl, '_blank')
    }
  }

  const handleGeneratePdf = async () => {
    if (!document?.templates?.content_html) return

    setGenerating(true)
    setGenerationError(null)

    try {
      const response = await fetch('/api/documents/generate-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentId: document.id,
          html: renderPreview()
        })
      })

      const data = await response.json()

      if (!response.ok) {
        if (data.code === 'FREE_TRIAL_EXHAUSTED') {
          setGenerationError('Limite de documentos gratuitos atingido. Assine um plano para continuar.')
        } else {
          setGenerationError(data.error || 'Erro ao gerar PDF')
        }
        return
      }

      // Update document with new pdf_path
      await supabase
        .from('documents')
        .update({
          pdf_path: data.pdfPath,
          status: 'generated',
          generated_at: new Date().toISOString()
        })
        .eq('id', document.id)

      // Reload document to show updated state
      await loadDocument()
    } catch (error) {
      setGenerationError('Erro ao gerar PDF. Tente novamente.')
      console.error('PDF generation error:', error)
    } finally {
      setGenerating(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Tem certeza que deseja excluir este documento?')) return

    const { error } = await supabase
      .from('documents')
      .delete()
      .eq('id', documentId)

    if (!error) {
      router.push('/documents')
    }
  }

  const handleShare = async () => {
    if (!document) return

    // Create share token
    const token = crypto.randomUUID()
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7) // 7 days

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase
      .from('document_shares')
      .insert({
        document_id: documentId,
        user_id: user.id,
        token,
        expires_at: expiresAt.toISOString()
      })

    if (!error) {
      setShareLink(`${window.location.origin}/share/${token}`)
      setShowShareModal(true)
    }
  }

  const copyShareLink = () => {
    if (shareLink) {
      navigator.clipboard.writeText(shareLink)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const renderPreview = () => {
    if (!document?.templates?.content_html) return ''

    let html = document.templates.content_html
    Object.entries(document.data).forEach(([key, value]) => {
      const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g')
      html = html.replace(regex, value || '')
    })

    return html
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
      </div>
    )
  }

  if (!document) {
    return null
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
        <div className="flex items-start gap-4">
          <Link
            href="/documents"
            className="p-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors mt-1"
          >
            <ArrowLeft className="w-5 h-5 text-neutral-600 dark:text-neutral-400" />
          </Link>
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
                {document.title}
              </h1>
              <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusConfig[document.status].color}`}>
                {statusConfig[document.status].label}
              </span>
            </div>
            <div className="flex items-center gap-4 text-sm text-neutral-500">
              {document.templates && (
                <span>{document.templates.name}</span>
              )}
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {format(new Date(document.created_at), "d 'de' MMMM 'de' yyyy", { locale: ptBR })}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 ml-11 sm:ml-0">
          {/* Gerar PDF para rascunhos */}
          {document.status === 'draft' && !document.pdf_path && (
            <button
              onClick={handleGeneratePdf}
              disabled={generating || (planSlug === 'free' && isTrialExhausted)}
              className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title={planSlug === 'free' && isTrialExhausted ? 'Limite de documentos gratuitos atingido' : 'Gerar PDF'}
            >
              {generating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <FileText className="w-4 h-4" />
              )}
              {generating ? 'Gerando...' : 'Gerar PDF'}
            </button>
          )}

          {document.pdf_path && (
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              Download
            </button>
          )}

          {document.status === 'generated' && (
            <>
              <button
                onClick={() => setShowSendModal(true)}
                className="flex items-center gap-2 px-4 py-2.5 border border-neutral-200 dark:border-neutral-700 rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
              >
                <Send className="w-4 h-4" />
                Enviar
              </button>
              <button
                onClick={handleShare}
                className="p-2.5 border border-neutral-200 dark:border-neutral-700 rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
              >
                <Share2 className="w-4 h-4" />
              </button>
            </>
          )}

          <button
            onClick={handleDelete}
            className="p-2.5 border border-red-200 dark:border-red-900 text-red-600 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Error message */}
      {generationError && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-400">
          {generationError}
          {generationError.includes('Limite') && (
            <Link href="/pricing" className="ml-2 underline font-medium">
              Ver planos
            </Link>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Preview */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
                Preview do Documento
              </h2>
              {showWatermark && (
                <span className="text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30 px-2 py-1 rounded-lg">
                  Preview com marca d'agua
                </span>
              )}
            </div>

            {/* Document Preview with Watermark */}
            <div className="relative overflow-hidden rounded-xl border border-neutral-200">
              <div
                className="bg-white p-8 min-h-[400px] text-neutral-900 prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: renderPreview() }}
              />

              {/* Multi-layer Anti-AI Watermark System */}
              {showWatermark && (
                <>
                  {/* Layer 1: Main diagonal watermarks */}
                  <div className="absolute inset-0 pointer-events-none select-none overflow-hidden" style={{ userSelect: 'none', WebkitUserSelect: 'none' }}>
                    <div className="absolute inset-0 flex items-center justify-center" style={{ transform: 'rotate(-35deg) scale(2)' }}>
                      {[...Array(8)].map((_, row) => (
                        <div key={row} className="absolute whitespace-nowrap" style={{ top: `${row * 15 - 30}%` }}>
                          {[...Array(4)].map((_, col) => (
                            <span
                              key={col}
                              className="inline-block mx-16 text-5xl font-bold"
                              style={{
                                color: 'rgba(16, 185, 129, 0.18)',
                                textShadow: '2px 2px 4px rgba(16, 185, 129, 0.12)',
                                letterSpacing: '0.15em'
                              }}
                            >
                              TERMYX
                            </span>
                          ))}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Layer 2: Counter-diagonal pattern */}
                  <div className="absolute inset-0 pointer-events-none select-none overflow-hidden" style={{ userSelect: 'none', WebkitUserSelect: 'none' }}>
                    <div className="absolute inset-0 flex items-center justify-center" style={{ transform: 'rotate(35deg) scale(2)' }}>
                      {[...Array(6)].map((_, row) => (
                        <div key={row} className="absolute whitespace-nowrap" style={{ top: `${row * 20 - 20}%`, left: '10%' }}>
                          {[...Array(3)].map((_, col) => (
                            <span
                              key={col}
                              className="inline-block mx-20 text-3xl font-semibold"
                              style={{
                                color: 'rgba(20, 184, 166, 0.12)',
                                letterSpacing: '0.2em'
                              }}
                            >
                              DOCUMENTO NAO OFICIAL
                            </span>
                          ))}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Layer 3: Grid pattern micro-watermarks */}
                  <div className="absolute inset-0 pointer-events-none select-none" style={{ userSelect: 'none', WebkitUserSelect: 'none' }}>
                    <div className="grid grid-cols-6 gap-4 h-full p-4">
                      {[...Array(36)].map((_, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-center text-xs font-medium"
                          style={{
                            color: 'rgba(16, 185, 129, 0.08)',
                            transform: `rotate(${(i % 4) * 15 - 30}deg)`
                          }}
                        >
                          TERMYX
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Layer 4: Central prominent watermark */}
                  <div className="absolute inset-0 pointer-events-none select-none flex items-center justify-center" style={{ userSelect: 'none', WebkitUserSelect: 'none' }}>
                    <div
                      className="text-7xl font-black tracking-widest"
                      style={{
                        color: 'rgba(16, 185, 129, 0.15)',
                        textShadow: '0 0 30px rgba(16, 185, 129, 0.1), 0 0 60px rgba(16, 185, 129, 0.05)',
                        transform: 'rotate(-20deg)'
                      }}
                    >
                      PREVIEW
                    </div>
                  </div>

                  {/* Layer 5: Noise pattern overlay */}
                  <div
                    className="absolute inset-0 pointer-events-none select-none opacity-[0.03]"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                      userSelect: 'none',
                      WebkitUserSelect: 'none'
                    }}
                  />

                  {/* Layer 6: Border watermark text */}
                  <div className="absolute inset-0 pointer-events-none select-none" style={{ userSelect: 'none', WebkitUserSelect: 'none' }}>
                    <div className="absolute top-2 left-0 right-0 text-center text-[10px] font-semibold tracking-[0.5em]" style={{ color: 'rgba(16, 185, 129, 0.25)' }}>
                      DOCUMENTO DE DEMONSTRACAO - NAO VALIDO - TERMYX.COM.BR
                    </div>
                    <div className="absolute bottom-2 left-0 right-0 text-center text-[10px] font-semibold tracking-[0.5em]" style={{ color: 'rgba(16, 185, 129, 0.25)' }}>
                      ASSINE UM PLANO PARA REMOVER A MARCA D'AGUA - TERMYX.COM.BR
                    </div>
                  </div>
                </>
              )}
            </div>

            {showWatermark && (
              <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl text-sm text-amber-700 dark:text-amber-400">
                <strong>Limite atingido:</strong> Voce usou seus {FREE_TRIAL_LIMIT} documentos gratuitos.
                <Link href="/pricing" className="ml-1 underline font-medium">
                  Assine um plano
                </Link> para remover a marca d'agua e continuar gerando documentos.
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Info Card */}
          <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6">
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">
              Informacoes
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-neutral-500 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Criado em
                </span>
                <span className="text-neutral-900 dark:text-white">
                  {format(new Date(document.created_at), 'dd/MM/yyyy HH:mm')}
                </span>
              </div>

              {document.generated_at && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-neutral-500 flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Gerado em
                  </span>
                  <span className="text-neutral-900 dark:text-white">
                    {format(new Date(document.generated_at), 'dd/MM/yyyy HH:mm')}
                  </span>
                </div>
              )}

              {document.credits_charged > 0 && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-neutral-500 flex items-center gap-2">
                    <CreditCard className="w-4 h-4" />
                    Creditos
                  </span>
                  <span className="text-neutral-900 dark:text-white">
                    {document.credits_charged} usado{document.credits_charged > 1 ? 's' : ''}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Data Card */}
          <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6">
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">
              Dados Preenchidos
            </h2>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {document.templates?.placeholders.map((placeholder) => (
                <div key={placeholder.name} className="text-sm">
                  <span className="text-neutral-500 block text-xs mb-0.5">
                    {placeholder.label}
                  </span>
                  <span className="text-neutral-900 dark:text-white">
                    {document.data[placeholder.name] || '-'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Send History */}
          {sends.length > 0 && (
            <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6">
              <h2 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">
                Historico de Envios
              </h2>
              <div className="space-y-3">
                {sends.map((send) => (
                  <div key={send.id} className="flex items-center gap-3 text-sm">
                    {send.channel === 'email' ? (
                      <Mail className="w-4 h-4 text-emerald-500" />
                    ) : (
                      <MessageCircle className="w-4 h-4 text-green-500" />
                    )}
                    <div className="flex-1 min-w-0">
                      <span className="text-neutral-900 dark:text-white truncate block">
                        {send.recipient}
                      </span>
                      <span className="text-neutral-500 text-xs">
                        {format(new Date(send.created_at), 'dd/MM/yyyy HH:mm')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200"
          onClick={() => setShowShareModal(false)}
        >
          <div
            className="bg-white dark:bg-neutral-900 rounded-2xl p-6 max-w-md w-full animate-in zoom-in-95 duration-200"
            onClick={e => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">
              Compartilhar Documento
            </h3>
            <p className="text-sm text-neutral-500 mb-4">
              Link valido por 7 dias. Qualquer pessoa com o link pode visualizar o documento.
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                value={shareLink || ''}
                readOnly
                className="flex-1 px-4 py-2.5 bg-neutral-100 dark:bg-neutral-800 rounded-xl text-sm text-neutral-900 dark:text-white"
              />
              <button
                onClick={copyShareLink}
                className="px-4 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors"
              >
                {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Send Modal */}
      {showSendModal && (
        <SendModal
          documentId={documentId}
          onClose={() => setShowSendModal(false)}
          onSent={() => {
            setShowSendModal(false)
            loadDocument()
          }}
        />
      )}
    </div>
  )
}

interface SendModalProps {
  documentId: string
  onClose: () => void
  onSent: () => void
}

function SendModal({ documentId, onClose, onSent }: SendModalProps) {
  const [channel, setChannel] = useState<'email' | 'whatsapp'>('email')
  const [recipient, setRecipient] = useState('')
  const [recipientName, setRecipientName] = useState('')
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  const handleSend = async () => {
    if (!recipient) return

    setSending(true)
    setError(null)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    if (channel === 'whatsapp') {
      // Open WhatsApp with the document link
      const phone = recipient.replace(/\D/g, '')
      const whatsappMessage = encodeURIComponent(message || `Segue o documento: ${window.location.origin}/documents/${documentId}`)
      window.open(`https://wa.me/${phone}?text=${whatsappMessage}`, '_blank')

      // Log the send
      await supabase.from('document_sends').insert({
        document_id: documentId,
        user_id: user.id,
        channel: 'whatsapp',
        recipient: phone,
        metadata: {
          recipient_name: recipientName || null,
          message: message || null
        }
      })

      // Update document status
      await supabase
        .from('documents')
        .update({ status: 'sent' })
        .eq('id', documentId)

      onSent()
    } else {
      // Send email via API
      try {
        const response = await fetch('/api/documents/send-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            documentId,
            recipientEmail: recipient,
            recipientName: recipientName || undefined,
            message: message || undefined
          })
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Falha ao enviar email')
        }

        // Update document status
        await supabase
          .from('documents')
          .update({ status: 'sent' })
          .eq('id', documentId)

        onSent()
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao enviar email')
      }
    }

    setSending(false)
  }

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-neutral-900 rounded-2xl p-6 max-w-md w-full animate-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">
          Enviar Documento
        </h3>

        {/* Error message */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-sm text-red-700 dark:text-red-400">
            {error}
          </div>
        )}

        {/* Channel Selection */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setChannel('email')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl transition-colors ${
              channel === 'email'
                ? 'bg-emerald-600 text-white'
                : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
            }`}
          >
            <Mail className="w-5 h-5" />
            Email
          </button>
          <button
            onClick={() => setChannel('whatsapp')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl transition-colors ${
              channel === 'whatsapp'
                ? 'bg-green-600 text-white'
                : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
            }`}
          >
            <MessageCircle className="w-5 h-5" />
            WhatsApp
          </button>
        </div>

        {/* Recipient Input */}
        <input
          type={channel === 'email' ? 'email' : 'tel'}
          placeholder={channel === 'email' ? 'email@exemplo.com' : '(11) 99999-9999'}
          value={recipient}
          onChange={(e) => setRecipient(e.target.value)}
          className="w-full px-4 py-3 bg-neutral-100 dark:bg-neutral-800 rounded-xl text-neutral-900 dark:text-white mb-3 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />

        {/* Recipient Name (optional) */}
        <input
          type="text"
          placeholder="Nome do destinatario (opcional)"
          value={recipientName}
          onChange={(e) => setRecipientName(e.target.value)}
          className="w-full px-4 py-3 bg-neutral-100 dark:bg-neutral-800 rounded-xl text-neutral-900 dark:text-white mb-3 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />

        {/* Message (optional) */}
        <textarea
          placeholder="Mensagem personalizada (opcional)"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={3}
          className="w-full px-4 py-3 bg-neutral-100 dark:bg-neutral-800 rounded-xl text-neutral-900 dark:text-white mb-4 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
        />

        {/* Info */}
        {channel === 'email' && (
          <p className="text-xs text-neutral-500 mb-4">
            O PDF sera anexado automaticamente ao email.
          </p>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={onClose}
            disabled={sending}
            className="flex-1 py-3 border border-neutral-200 dark:border-neutral-700 rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleSend}
            disabled={!recipient || sending}
            className="flex-1 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
            Enviar
          </button>
        </div>
      </div>
    </div>
  )
}
