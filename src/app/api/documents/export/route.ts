import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { rateLimiters, getRateLimitHeaders } from '@/lib/rate-limit'

type ExportFormat = 'html' | 'txt' | 'json'

/**
 * GET /api/documents/export?id=<documentId>&format=<format>
 * Export a document in various formats
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Verify authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Rate limiting
    const rateLimitResult = rateLimiters.standard(user.id)
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429, headers: getRateLimitHeaders(rateLimitResult) }
      )
    }

    // Get parameters
    const { searchParams } = new URL(request.url)
    const documentId = searchParams.get('id')
    const format = (searchParams.get('format') || 'html') as ExportFormat

    if (!documentId) {
      return NextResponse.json({ error: 'Document ID is required' }, { status: 400 })
    }

    // Validate format
    const validFormats: ExportFormat[] = ['html', 'txt', 'json']
    if (!validFormats.includes(format)) {
      return NextResponse.json(
        { error: `Invalid format. Valid formats: ${validFormats.join(', ')}` },
        { status: 400 }
      )
    }

    // Get document
    const { data: document, error: docError } = await supabase
      .from('documents')
      .select(`
        id,
        title,
        content,
        data,
        status,
        created_at,
        updated_at,
        templates (
          id,
          name,
          category
        )
      `)
      .eq('id', documentId)
      .eq('user_id', user.id)
      .single()

    if (docError || !document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 })
    }

    // Generate export based on format
    switch (format) {
      case 'html': {
        const htmlContent = generateHtmlExport(document)
        return new NextResponse(htmlContent, {
          headers: {
            'Content-Type': 'text/html; charset=utf-8',
            'Content-Disposition': `attachment; filename="${sanitizeFilename(document.title)}.html"`,
          },
        })
      }

      case 'txt': {
        const textContent = generateTextExport(document)
        return new NextResponse(textContent, {
          headers: {
            'Content-Type': 'text/plain; charset=utf-8',
            'Content-Disposition': `attachment; filename="${sanitizeFilename(document.title)}.txt"`,
          },
        })
      }

      case 'json': {
        const jsonContent = generateJsonExport(document)
        return new NextResponse(JSON.stringify(jsonContent, null, 2), {
          headers: {
            'Content-Type': 'application/json; charset=utf-8',
            'Content-Disposition': `attachment; filename="${sanitizeFilename(document.title)}.json"`,
          },
        })
      }

      default:
        return NextResponse.json({ error: 'Invalid format' }, { status: 400 })
    }
  } catch (error) {
    console.error('Document export error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * Sanitize filename for download
 */
function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[^a-zA-Z0-9\s\-_]/g, '')
    .replace(/\s+/g, '_')
    .substring(0, 100)
}

/**
 * Generate HTML export
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function generateHtmlExport(document: any): string {
  const templateName = document.templates?.name || 'Documento'
  const category = document.templates?.category || 'geral'

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${document.title}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Times New Roman', Times, serif;
      font-size: 12pt;
      line-height: 1.6;
      color: #000;
      padding: 2cm;
      max-width: 21cm;
      margin: 0 auto;
      background: #fff;
    }
    .header {
      text-align: center;
      margin-bottom: 2cm;
      padding-bottom: 1cm;
      border-bottom: 1px solid #ccc;
    }
    .header h1 {
      font-size: 18pt;
      margin-bottom: 0.5cm;
    }
    .header .meta {
      font-size: 10pt;
      color: #666;
    }
    .content {
      text-align: justify;
    }
    .footer {
      margin-top: 2cm;
      padding-top: 1cm;
      border-top: 1px solid #ccc;
      font-size: 10pt;
      color: #666;
      text-align: center;
    }
    @media print {
      body { padding: 0; }
      .footer { page-break-inside: avoid; }
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>${document.title}</h1>
    <p class="meta">
      Template: ${templateName} | Categoria: ${category}<br>
      Criado em: ${new Date(document.created_at).toLocaleDateString('pt-BR')}
    </p>
  </div>
  <div class="content">
    ${document.content || '<p>Documento sem conteudo.</p>'}
  </div>
  <div class="footer">
    <p>Documento gerado pelo Termyx - ${new Date().toLocaleDateString('pt-BR')}</p>
  </div>
</body>
</html>`
}

/**
 * Generate plain text export
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function generateTextExport(document: any): string {
  const templateName = document.templates?.name || 'Documento'
  const category = document.templates?.category || 'geral'

  // Strip HTML tags from content
  const plainContent = (document.content || '')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<\/div>/gi, '\n')
    .replace(/<\/h[1-6]>/gi, '\n\n')
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/\n{3,}/g, '\n\n')
    .trim()

  const separator = '='.repeat(60)

  return `${separator}
${document.title.toUpperCase()}
${separator}

Template: ${templateName}
Categoria: ${category}
Criado em: ${new Date(document.created_at).toLocaleDateString('pt-BR')}
Atualizado em: ${new Date(document.updated_at).toLocaleDateString('pt-BR')}

${separator}
CONTEUDO
${separator}

${plainContent || 'Documento sem conteudo.'}

${separator}
Documento gerado pelo Termyx - ${new Date().toLocaleDateString('pt-BR')}
${separator}
`
}

/**
 * Generate JSON export
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function generateJsonExport(document: any): object {
  return {
    meta: {
      exportedAt: new Date().toISOString(),
      exportedBy: 'Termyx',
      version: '1.0',
    },
    document: {
      id: document.id,
      title: document.title,
      status: document.status,
      createdAt: document.created_at,
      updatedAt: document.updated_at,
      template: document.templates ? {
        id: document.templates.id,
        name: document.templates.name,
        category: document.templates.category,
      } : null,
      content: document.content,
      data: document.data,
    },
  }
}
