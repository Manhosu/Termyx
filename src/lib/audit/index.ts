import { createClient, SupabaseClient } from '@supabase/supabase-js'

// Lazy initialization to avoid build-time errors
let supabaseAdminInstance: SupabaseClient | null = null

function getSupabaseAdmin(): SupabaseClient {
  if (!supabaseAdminInstance) {
    supabaseAdminInstance = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
  }
  return supabaseAdminInstance
}

export type AuditAction =
  | 'user.login'
  | 'user.logout'
  | 'user.signup'
  | 'user.update'
  | 'document.create'
  | 'document.update'
  | 'document.delete'
  | 'document.generate_pdf'
  | 'document.send_email'
  | 'document.send_whatsapp'
  | 'document.share'
  | 'template.create'
  | 'template.update'
  | 'template.delete'
  | 'payment.checkout_started'
  | 'payment.completed'
  | 'payment.failed'
  | 'subscription.created'
  | 'subscription.updated'
  | 'subscription.canceled'
  | 'admin.user_update'
  | 'admin.template_update'

export type ResourceType =
  | 'user'
  | 'document'
  | 'template'
  | 'payment'
  | 'subscription'

interface AuditLogParams {
  userId?: string | null
  action: AuditAction
  resourceType?: ResourceType
  resourceId?: string
  payload?: Record<string, unknown>
  ipAddress?: string
}

export async function logAudit({
  userId,
  action,
  resourceType,
  resourceId,
  payload,
  ipAddress,
}: AuditLogParams): Promise<void> {
  try {
    await getSupabaseAdmin().from('audit_logs').insert({
      user_id: userId || null,
      action,
      resource_type: resourceType || null,
      resource_id: resourceId || null,
      payload: payload || {},
      ip_address: ipAddress || null,
    })
  } catch (error) {
    // Log to console but don't throw - audit logging should not break the app
    console.error('Failed to log audit event:', error)
  }
}

// Helper to get IP from request headers
export function getClientIP(headers: Headers): string | null {
  // Try various headers that might contain the real IP
  const forwardedFor = headers.get('x-forwarded-for')
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim()
  }

  const realIP = headers.get('x-real-ip')
  if (realIP) {
    return realIP
  }

  return null
}

// Convenience functions for common audit events
export const audit = {
  userLogin: (userId: string, ip?: string) =>
    logAudit({ userId, action: 'user.login', resourceType: 'user', resourceId: userId, ipAddress: ip }),

  userSignup: (userId: string, payload?: Record<string, unknown>) =>
    logAudit({ userId, action: 'user.signup', resourceType: 'user', resourceId: userId, payload }),

  documentCreate: (userId: string, documentId: string, title: string) =>
    logAudit({ userId, action: 'document.create', resourceType: 'document', resourceId: documentId, payload: { title } }),

  documentGeneratePdf: (userId: string, documentId: string, payload?: Record<string, unknown>) =>
    logAudit({ userId, action: 'document.generate_pdf', resourceType: 'document', resourceId: documentId, payload }),

  documentSendEmail: (userId: string, documentId: string, recipientEmail: string) =>
    logAudit({ userId, action: 'document.send_email', resourceType: 'document', resourceId: documentId, payload: { recipient: recipientEmail } }),

  documentSendWhatsapp: (userId: string, documentId: string, phone: string) =>
    logAudit({ userId, action: 'document.send_whatsapp', resourceType: 'document', resourceId: documentId, payload: { phone } }),

  documentDelete: (userId: string, documentId: string) =>
    logAudit({ userId, action: 'document.delete', resourceType: 'document', resourceId: documentId }),

  paymentCompleted: (userId: string, paymentId: string, payload?: Record<string, unknown>) =>
    logAudit({ userId, action: 'payment.completed', resourceType: 'payment', resourceId: paymentId, payload }),

  paymentFailed: (userId: string, paymentId: string, payload?: Record<string, unknown>) =>
    logAudit({ userId, action: 'payment.failed', resourceType: 'payment', resourceId: paymentId, payload }),

  subscriptionCreated: (userId: string, subscriptionId: string, payload?: Record<string, unknown>) =>
    logAudit({ userId, action: 'subscription.created', resourceType: 'subscription', resourceId: subscriptionId, payload }),

  subscriptionCanceled: (userId: string, subscriptionId: string) =>
    logAudit({ userId, action: 'subscription.canceled', resourceType: 'subscription', resourceId: subscriptionId }),
}
