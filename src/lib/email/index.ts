import sgMail from '@sendgrid/mail'

// Initialize SendGrid
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY)
}

export interface EmailOptions {
  to: string
  subject: string
  html: string
  text?: string
  attachments?: Array<{
    content: string // Base64 encoded
    filename: string
    type: string
    disposition?: 'attachment' | 'inline'
  }>
}

export async function sendEmail(options: EmailOptions): Promise<{ success: boolean; error?: string }> {
  if (!process.env.SENDGRID_API_KEY) {
    console.error('SENDGRID_API_KEY not configured')
    return { success: false, error: 'Email service not configured' }
  }

  const fromEmail = process.env.SENDGRID_FROM_EMAIL || 'noreply@termyx.com'
  const fromName = process.env.SENDGRID_FROM_NAME || 'Termyx'

  try {
    await sgMail.send({
      to: options.to,
      from: {
        email: fromEmail,
        name: fromName,
      },
      subject: options.subject,
      html: options.html,
      text: options.text || options.html.replace(/<[^>]*>/g, ''),
      attachments: options.attachments,
    })

    return { success: true }
  } catch (error) {
    console.error('Error sending email:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send email'
    }
  }
}

// Email templates
export const emailTemplates = {
  documentSent: (params: {
    recipientName: string
    senderName: string
    documentTitle: string
    message?: string
  }) => ({
    subject: `${params.senderName} compartilhou um documento com voce: ${params.documentTitle}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Documento Compartilhado</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                  <!-- Header -->
                  <tr>
                    <td style="background: linear-gradient(135deg, #2563eb 0%, #7c3aed 100%); padding: 32px; text-align: center;">
                      <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">Termyx</h1>
                      <p style="margin: 8px 0 0; color: rgba(255,255,255,0.9); font-size: 14px;">Documentos Legais Simplificados</p>
                    </td>
                  </tr>

                  <!-- Content -->
                  <tr>
                    <td style="padding: 40px 32px;">
                      <h2 style="margin: 0 0 16px; color: #171717; font-size: 22px; font-weight: 600;">
                        Ola${params.recipientName ? `, ${params.recipientName}` : ''}!
                      </h2>
                      <p style="margin: 0 0 24px; color: #525252; font-size: 16px; line-height: 1.6;">
                        <strong style="color: #171717;">${params.senderName}</strong> compartilhou um documento com voce.
                      </p>

                      <!-- Document Card -->
                      <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
                        <p style="margin: 0 0 4px; color: #6b7280; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Documento</p>
                        <p style="margin: 0; color: #171717; font-size: 18px; font-weight: 600;">${params.documentTitle}</p>
                      </div>

                      ${params.message ? `
                      <div style="background-color: #eff6ff; border-left: 4px solid #2563eb; border-radius: 0 8px 8px 0; padding: 16px 20px; margin-bottom: 24px;">
                        <p style="margin: 0 0 4px; color: #1e40af; font-size: 12px; font-weight: 600;">Mensagem:</p>
                        <p style="margin: 0; color: #1e3a8a; font-size: 14px; line-height: 1.5;">${params.message}</p>
                      </div>
                      ` : ''}

                      <p style="margin: 0; color: #525252; font-size: 14px; line-height: 1.6;">
                        O documento esta anexado a este email em formato PDF.
                      </p>
                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td style="background-color: #f9fafb; padding: 24px 32px; border-top: 1px solid #e5e7eb;">
                      <p style="margin: 0 0 8px; color: #6b7280; font-size: 12px; text-align: center;">
                        Este email foi enviado atraves do Termyx
                      </p>
                      <p style="margin: 0; color: #9ca3af; font-size: 11px; text-align: center;">
                        Se voce nao esperava este email, pode ignora-lo com seguranca.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `,
  }),

  passwordReset: (params: { userName: string; resetLink: string }) => ({
    subject: 'Redefinir sua senha - Termyx',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                  <tr>
                    <td style="background: linear-gradient(135deg, #2563eb 0%, #7c3aed 100%); padding: 32px; text-align: center;">
                      <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">Termyx</h1>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 40px 32px;">
                      <h2 style="margin: 0 0 16px; color: #171717; font-size: 22px;">
                        Redefinir sua senha
                      </h2>
                      <p style="margin: 0 0 24px; color: #525252; font-size: 16px; line-height: 1.6;">
                        Ola${params.userName ? `, ${params.userName}` : ''}! Recebemos uma solicitacao para redefinir a senha da sua conta.
                      </p>
                      <p style="margin: 0 0 24px; color: #525252; font-size: 16px; line-height: 1.6;">
                        Clique no botao abaixo para criar uma nova senha:
                      </p>
                      <div style="text-align: center; margin: 32px 0;">
                        <a href="${params.resetLink}" style="display: inline-block; background: linear-gradient(135deg, #2563eb 0%, #7c3aed 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                          Redefinir Senha
                        </a>
                      </div>
                      <p style="margin: 0 0 16px; color: #6b7280; font-size: 14px; line-height: 1.6;">
                        Se voce nao solicitou essa alteracao, ignore este email. Sua senha permanecera a mesma.
                      </p>
                      <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                        Este link expira em 1 hora por motivos de seguranca.
                      </p>
                    </td>
                  </tr>
                  <tr>
                    <td style="background-color: #f9fafb; padding: 24px 32px; border-top: 1px solid #e5e7eb; text-align: center;">
                      <p style="margin: 0; color: #6b7280; font-size: 12px;">
                        Equipe Termyx
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `,
  }),

  paymentConfirmation: (params: {
    userName: string
    amount: number
    currency: string
    type: 'credits' | 'subscription'
    details: string
    invoiceUrl?: string
  }) => ({
    subject: `Pagamento confirmado - Termyx`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                  <tr>
                    <td style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 32px; text-align: center;">
                      <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">Termyx</h1>
                      <p style="margin: 8px 0 0; color: rgba(255,255,255,0.9); font-size: 14px;">Pagamento Confirmado</p>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 40px 32px;">
                      <h2 style="margin: 0 0 16px; color: #171717; font-size: 22px;">
                        Obrigado pelo seu pagamento, ${params.userName}!
                      </h2>
                      <p style="margin: 0 0 24px; color: #525252; font-size: 16px; line-height: 1.6;">
                        Seu pagamento foi processado com sucesso. Aqui estao os detalhes:
                      </p>

                      <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
                        <table width="100%" style="border-collapse: collapse;">
                          <tr>
                            <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Tipo:</td>
                            <td style="padding: 8px 0; color: #171717; font-size: 14px; font-weight: 600; text-align: right;">
                              ${params.type === 'credits' ? 'Compra de Creditos' : 'Assinatura'}
                            </td>
                          </tr>
                          <tr>
                            <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Detalhes:</td>
                            <td style="padding: 8px 0; color: #171717; font-size: 14px; font-weight: 600; text-align: right;">
                              ${params.details}
                            </td>
                          </tr>
                          <tr>
                            <td style="padding: 8px 0; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 14px;">Valor:</td>
                            <td style="padding: 8px 0; border-top: 1px solid #e5e7eb; color: #10b981; font-size: 18px; font-weight: 700; text-align: right;">
                              ${params.currency.toUpperCase()} ${params.amount.toFixed(2)}
                            </td>
                          </tr>
                        </table>
                      </div>

                      ${params.invoiceUrl ? `
                      <div style="text-align: center; margin: 24px 0;">
                        <a href="${params.invoiceUrl}" style="display: inline-block; background-color: #f3f4f6; color: #374151; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 500; font-size: 14px;">
                          Ver Fatura Completa
                        </a>
                      </div>
                      ` : ''}

                      <p style="margin: 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
                        Se voce tiver alguma duvida sobre este pagamento, entre em contato com nosso suporte.
                      </p>
                    </td>
                  </tr>
                  <tr>
                    <td style="background-color: #f9fafb; padding: 24px 32px; border-top: 1px solid #e5e7eb; text-align: center;">
                      <p style="margin: 0; color: #6b7280; font-size: 12px;">
                        Equipe Termyx
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `,
  }),

  welcomeEmail: (params: { userName: string }) => ({
    subject: 'Bem-vindo ao Termyx!',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                  <tr>
                    <td style="background: linear-gradient(135deg, #2563eb 0%, #7c3aed 100%); padding: 32px; text-align: center;">
                      <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">Termyx</h1>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 40px 32px;">
                      <h2 style="margin: 0 0 16px; color: #171717; font-size: 22px;">
                        Bem-vindo ao Termyx, ${params.userName}!
                      </h2>
                      <p style="margin: 0 0 24px; color: #525252; font-size: 16px; line-height: 1.6;">
                        Estamos felizes em ter voce conosco. Agora voce pode criar documentos legais e comerciais de forma rapida e profissional.
                      </p>
                      <p style="margin: 0; color: #525252; font-size: 16px; line-height: 1.6;">
                        Comece explorando nossos templates ou crie seu primeiro documento agora mesmo!
                      </p>
                    </td>
                  </tr>
                  <tr>
                    <td style="background-color: #f9fafb; padding: 24px 32px; border-top: 1px solid #e5e7eb; text-align: center;">
                      <p style="margin: 0; color: #6b7280; font-size: 12px;">
                        Equipe Termyx
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `,
  }),
}
