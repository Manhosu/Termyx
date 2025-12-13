import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendEmail, emailTemplates } from '@/lib/email'
import { audit } from '@/lib/audit'
import { rateLimiters, getRateLimitHeaders } from '@/lib/rate-limit'

interface SendEmailRequest {
  documentId: string
  recipientEmail: string
  recipientName?: string
  message?: string
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Get current user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Rate limiting (10 emails per hour per user)
    const rateLimitResult = rateLimiters.email(user.id)
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Limite de envio de emails excedido. Tente novamente mais tarde.' },
        { status: 429, headers: getRateLimitHeaders(rateLimitResult) }
      )
    }

    // Parse request body
    const body: SendEmailRequest = await request.json()
    const { documentId, recipientEmail, recipientName, message } = body

    if (!documentId || !recipientEmail) {
      return NextResponse.json(
        { error: 'Document ID and recipient email are required' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(recipientEmail)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Get document with user info
    const { data: document, error: docError } = await supabase
      .from('documents')
      .select('*, users!documents_user_id_fkey(name, email)')
      .eq('id', documentId)
      .eq('user_id', user.id)
      .single()

    if (docError || !document) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      )
    }

    // Check if document has PDF
    if (!document.pdf_path) {
      return NextResponse.json(
        { error: 'Document does not have a PDF generated. Please generate the PDF first.' },
        { status: 400 }
      )
    }

    // Get sender name
    const senderName = document.users?.name || document.users?.email || 'Um usuario do Termyx'

    // Download PDF from storage (pdf_path is the storage path directly)
    const pdfPath = document.pdf_path
    const { data: pdfData, error: downloadError } = await supabase
      .storage
      .from('documents')
      .download(pdfPath)

    if (downloadError || !pdfData) {
      console.error('Error downloading PDF:', downloadError)
      return NextResponse.json(
        { error: 'Failed to retrieve PDF' },
        { status: 500 }
      )
    }

    // Convert PDF to base64
    const pdfArrayBuffer = await pdfData.arrayBuffer()
    const pdfBase64 = Buffer.from(pdfArrayBuffer).toString('base64')

    // Prepare email
    const template = emailTemplates.documentSent({
      recipientName: recipientName || '',
      senderName,
      documentTitle: document.title,
      message,
    })

    // Send email
    const result = await sendEmail({
      to: recipientEmail,
      subject: template.subject,
      html: template.html,
      attachments: [
        {
          content: pdfBase64,
          filename: `${document.title.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`,
          type: 'application/pdf',
          disposition: 'attachment',
        },
      ],
    })

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to send email' },
        { status: 500 }
      )
    }

    // Log the send in document_sends table
    await supabase
      .from('document_sends')
      .insert({
        document_id: documentId,
        user_id: user.id,
        channel: 'email',
        recipient: recipientEmail,
        status: 'sent',
        metadata: {
          recipient_name: recipientName || null,
          message: message || null,
        },
      })

    // Audit log
    await audit.documentSendEmail(user.id, documentId, recipientEmail)

    return NextResponse.json({
      success: true,
      message: 'Document sent successfully',
    })
  } catch (error) {
    console.error('Error in send-email route:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
