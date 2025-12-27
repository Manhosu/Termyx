import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { audit } from '@/lib/audit'
import { rateLimiters, getRateLimitHeaders } from '@/lib/rate-limit'

interface UserWithPlan {
  credits: number
  plan_id: string | null
  plans: { slug: string } | null
  free_trial_documents_count: number | null
  free_trial_used: boolean | null
}

const FREE_TRIAL_LIMIT = 2 // Maximum free documents for trial users

// PDF generation using html-pdf-node (lightweight alternative to Puppeteer)
// For production, consider using Puppeteer or a dedicated PDF service

const pdfStyles = `
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: 'Times New Roman', Times, serif;
      font-size: 12pt;
      line-height: 1.6;
      color: #000;
      padding: 2cm;
    }
    .document {
      max-width: 100%;
    }
    h1 {
      text-align: center;
      font-size: 16pt;
      font-weight: bold;
      margin-bottom: 24pt;
      text-transform: uppercase;
    }
    h2 {
      font-size: 12pt;
      font-weight: bold;
      margin-top: 18pt;
      margin-bottom: 6pt;
      text-transform: uppercase;
    }
    p {
      text-align: justify;
      margin-bottom: 12pt;
    }
    .signatures {
      margin-top: 48pt;
      text-align: center;
    }
    .signature-line {
      display: inline-block;
      margin: 12pt 24pt;
      text-align: center;
    }
    .amount-box {
      font-size: 18pt;
      font-weight: bold;
      text-align: center;
      padding: 12pt;
      border: 2pt solid #000;
      margin: 12pt 0;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 12pt 0;
    }
    table td {
      padding: 6pt;
      border: 1pt solid #ccc;
    }
    table .total td {
      font-weight: bold;
      background-color: #f5f5f5;
    }
    .header-info, .client-info {
      margin-bottom: 18pt;
    }
    .watermark {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%) rotate(-45deg);
      font-size: 72pt;
      color: rgba(0, 0, 0, 0.05);
      white-space: nowrap;
      pointer-events: none;
      z-index: -1;
    }
  </style>
`

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Verify authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Nao autorizado' }, { status: 401 })
    }

    // Rate limiting (20 PDFs per hour per user)
    const rateLimitResult = rateLimiters.pdf(user.id)
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Limite de geracao de PDFs excedido. Tente novamente mais tarde.' },
        { status: 429, headers: getRateLimitHeaders(rateLimitResult) }
      )
    }

    const body = await request.json()
    const { documentId, html } = body

    if (!documentId || !html) {
      return NextResponse.json({ error: 'Dados incompletos' }, { status: 400 })
    }

    // Get user data to check credits, plan, and free trial status
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('credits, plan_id, plans(slug), free_trial_documents_count, free_trial_used')
      .eq('id', user.id)
      .single() as { data: UserWithPlan | null, error: unknown }

    if (userError || !userData) {
      return NextResponse.json({ error: 'Usuario nao encontrado' }, { status: 404 })
    }

    // Check plan and trial eligibility
    const planSlug = userData.plans?.slug || 'free'
    const freeTrialCount = userData.free_trial_documents_count || 0

    // For users without a paid plan, check free trial limit
    if (planSlug === 'free') {
      // Check if user has exceeded the free trial limit (2 documents)
      if (freeTrialCount >= FREE_TRIAL_LIMIT) {
        return NextResponse.json({
          error: 'Limite de documentos gratuitos atingido. Assine um plano para continuar.',
          code: 'FREE_TRIAL_EXHAUSTED',
          trialLimit: FREE_TRIAL_LIMIT,
          documentsUsed: freeTrialCount
        }, { status: 402 })
      }

      // Also check credits as a secondary measure
      if (userData.credits <= 0 && freeTrialCount >= FREE_TRIAL_LIMIT) {
        return NextResponse.json({
          error: 'Creditos insuficientes. Faca upgrade do seu plano.',
          code: 'INSUFFICIENT_CREDITS'
        }, { status: 402 })
      }
    }

    // Generate full HTML with styles
    const showWatermark = planSlug === 'free'
    const fullHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          ${pdfStyles}
        </head>
        <body>
          ${showWatermark ? '<div class="watermark">TERMYX</div>' : ''}
          ${html}
        </body>
      </html>
    `

    // For now, we'll store the HTML and generate PDF on-demand
    // In production, use Puppeteer, html-pdf-node, or a PDF service like DocRaptor

    // Generate a unique filename
    const timestamp = Date.now()
    const fileName = `${user.id}/${documentId}_${timestamp}.html`

    // Store the HTML file (can be converted to PDF later)
    const { error: uploadError } = await supabase.storage
      .from('documents')
      .upload(fileName, fullHtml, {
        contentType: 'text/html',
        upsert: true
      })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      return NextResponse.json({ error: 'Erro ao salvar documento' }, { status: 500 })
    }

    // For free plan users: increment trial counter and optionally deduct credits
    if (planSlug === 'free') {
      const newTrialCount = freeTrialCount + 1
      const isTrialExhausted = newTrialCount >= FREE_TRIAL_LIMIT

      await supabase
        .from('users')
        .update({
          credits: Math.max(0, userData.credits - 1),
          free_trial_documents_count: newTrialCount,
          free_trial_used: isTrialExhausted
        })
        .eq('id', user.id)
    }

    // Log the action
    await audit.documentGeneratePdf(user.id, documentId, {
      plan: planSlug,
      freeTrialCount: planSlug === 'free' ? freeTrialCount + 1 : undefined
    })

    // Build response with trial info for free users
    const response: Record<string, unknown> = {
      success: true,
      pdfPath: fileName,
      message: 'Documento gerado com sucesso'
    }

    if (planSlug === 'free') {
      response.trial = {
        documentsUsed: freeTrialCount + 1,
        documentsRemaining: Math.max(0, FREE_TRIAL_LIMIT - (freeTrialCount + 1)),
        limit: FREE_TRIAL_LIMIT,
        exhausted: (freeTrialCount + 1) >= FREE_TRIAL_LIMIT
      }
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('PDF generation error:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

// GET endpoint to download/view PDF
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Nao autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const documentId = searchParams.get('id')

    if (!documentId) {
      return NextResponse.json({ error: 'ID do documento nao fornecido' }, { status: 400 })
    }

    // Get document
    const { data: doc, error: docError } = await supabase
      .from('documents')
      .select('*')
      .eq('id', documentId)
      .eq('user_id', user.id)
      .single()

    if (docError || !doc) {
      return NextResponse.json({ error: 'Documento nao encontrado' }, { status: 404 })
    }

    if (!doc.pdf_path) {
      return NextResponse.json({ error: 'PDF nao gerado ainda' }, { status: 404 })
    }

    // Create signed URL for download
    const { data: signedUrl, error: urlError } = await supabase.storage
      .from('documents')
      .createSignedUrl(doc.pdf_path, 3600) // 1 hour expiry

    if (urlError) {
      return NextResponse.json({ error: 'Erro ao gerar URL de download' }, { status: 500 })
    }

    return NextResponse.json({
      url: signedUrl.signedUrl,
      title: doc.title
    })

  } catch (error) {
    console.error('PDF download error:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
