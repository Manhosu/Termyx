import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { FileText, Calendar, Download, AlertTriangle } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import Link from 'next/link'
import { Metadata } from 'next'

interface SharePageProps {
  params: Promise<{ token: string }>
}

export async function generateMetadata({ params }: SharePageProps): Promise<Metadata> {
  const { token } = await params
  const supabase = await createClient()

  const { data: share } = await supabase
    .from('document_shares')
    .select('document:documents(title, templates(name, category))')
    .eq('token', token)
    .single()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const doc = (share?.document as any) || null

  if (!doc?.title) {
    return {
      title: 'Documento Compartilhado | Termyx',
    }
  }

  const category = doc.templates?.category || doc.templates?.[0]?.category || 'profissional'

  return {
    title: `${doc.title} | Termyx`,
    description: `Visualize o documento "${doc.title}" compartilhado via Termyx.`,
    openGraph: {
      title: doc.title,
      description: `Documento ${category} compartilhado via Termyx`,
      type: 'article',
    },
    robots: {
      index: false,
      follow: false,
    },
  }
}

export default async function SharePage({ params }: SharePageProps) {
  const { token } = await params
  const supabase = await createClient()

  // Find the share record
  const { data: share, error: shareError } = await supabase
    .from('document_shares')
    .select(`
      *,
      document:documents(
        id,
        title,
        data,
        pdf_path,
        created_at,
        templates(
          name,
          category,
          content_html,
          placeholders
        )
      )
    `)
    .eq('token', token)
    .single()

  if (shareError || !share) {
    notFound()
  }

  // Check if expired
  const isExpired = new Date(share.expires_at) < new Date()

  if (isExpired) {
    return (
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-yellow-600" />
          </div>
          <h1 className="text-xl font-bold text-neutral-900 dark:text-white mb-2">
            Link Expirado
          </h1>
          <p className="text-neutral-500 mb-6">
            Este link de compartilhamento nao esta mais valido. Solicite um novo link ao remetente.
          </p>
          <Link
            href="/"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
          >
            Ir para o Termyx
          </Link>
        </div>
      </div>
    )
  }

  // Increment view count
  await supabase
    .from('document_shares')
    .update({ views: (share.views || 0) + 1 })
    .eq('id', share.id)

  const document = share.document as {
    id: string
    title: string
    data: Record<string, string>
    pdf_path: string | null
    created_at: string
    templates: {
      name: string
      category: string
      content_html: string
      placeholders: Array<{ name: string; label: string }>
    } | null
  }

  // Render preview
  let previewHtml = ''
  if (document.templates?.content_html) {
    previewHtml = document.templates.content_html
    Object.entries(document.data).forEach(([key, value]) => {
      const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g')
      previewHtml = previewHtml.replace(regex, value || '')
    })
  }

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      {/* Header */}
      <header className="bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">T</span>
            </div>
            <span className="text-lg font-bold text-neutral-900 dark:text-white">Termyx</span>
          </Link>
          <span className="text-sm text-neutral-500">
            Documento compartilhado
          </span>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* Document Info */}
        <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-neutral-900 dark:text-white mb-1">
                  {document.title}
                </h1>
                <div className="flex items-center gap-4 text-sm text-neutral-500">
                  {document.templates && (
                    <span className="px-2 py-0.5 bg-neutral-100 dark:bg-neutral-800 rounded text-xs capitalize">
                      {document.templates.category}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {format(new Date(document.created_at), "d 'de' MMMM 'de' yyyy", { locale: ptBR })}
                  </span>
                </div>
              </div>
            </div>

            {document.pdf_path && (
              <a
                href={`/api/share/download?token=${token}`}
                className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
              >
                <Download className="w-4 h-4" />
                Download PDF
              </a>
            )}
          </div>
        </div>

        {/* Document Preview */}
        <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6">
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">
            Visualizacao do Documento
          </h2>
          <div
            className="bg-white rounded-xl border border-neutral-200 p-8 text-neutral-900 prose prose-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: previewHtml }}
          />
        </div>

        {/* Footer Info */}
        <div className="mt-6 text-center text-sm text-neutral-500">
          <p>Este link expira em {format(new Date(share.expires_at), "d 'de' MMMM 'de' yyyy", { locale: ptBR })}</p>
          <p className="mt-2">
            Powered by{' '}
            <Link href="/" className="text-blue-600 hover:underline">
              Termyx
            </Link>
          </p>
        </div>
      </main>
    </div>
  )
}
