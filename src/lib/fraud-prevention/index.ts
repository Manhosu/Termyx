import { createClient } from '@/lib/supabase/server'

export interface FraudCheckResult {
  allowed: boolean
  reason?: string
  code?: 'BLOCKED_EMAIL' | 'FINGERPRINT_USED' | 'IP_ABUSE' | 'TRIAL_EXHAUSTED'
}

/**
 * Check if email domain is blocked (disposable email)
 */
export async function isEmailBlocked(email: string): Promise<boolean> {
  const domain = email.split('@')[1]?.toLowerCase()
  if (!domain) return false

  const supabase = await createClient()
  const { data } = await supabase
    .from('blocked_email_domains')
    .select('id')
    .eq('domain', domain)
    .single()

  return !!data
}

/**
 * Check if device fingerprint was used by another account
 */
export async function isDeviceFingerprintUsed(
  fingerprintHash: string,
  excludeUserId?: string
): Promise<boolean> {
  const supabase = await createClient()

  let query = supabase
    .from('device_fingerprints')
    .select('id, user_id')
    .eq('fingerprint_hash', fingerprintHash)

  if (excludeUserId) {
    query = query.neq('user_id', excludeUserId)
  }

  const { data } = await query.limit(1)
  return data && data.length > 0
}

/**
 * Count signups from an IP in the last N hours
 */
export async function countSignupsFromIP(
  ipAddress: string,
  hours: number = 24
): Promise<number> {
  const supabase = await createClient()
  const cutoffTime = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString()

  const { count } = await supabase
    .from('ip_signup_tracking')
    .select('*', { count: 'exact', head: true })
    .eq('ip_address', ipAddress)
    .gte('created_at', cutoffTime)

  return count || 0
}

/**
 * Record a signup from an IP
 */
export async function recordIPSignup(
  ipAddress: string,
  userId: string
): Promise<void> {
  const supabase = await createClient()
  await supabase
    .from('ip_signup_tracking')
    .insert({ ip_address: ipAddress, user_id: userId })
}

/**
 * Record device fingerprint for a user
 */
export async function recordDeviceFingerprint(
  userId: string,
  fingerprintHash: string,
  ipAddress?: string,
  userAgent?: string
): Promise<void> {
  const supabase = await createClient()
  await supabase
    .from('device_fingerprints')
    .insert({
      user_id: userId,
      fingerprint_hash: fingerprintHash,
      ip_address: ipAddress,
      user_agent: userAgent,
    })
}

/**
 * Comprehensive fraud check for signup
 */
export async function checkSignupFraud(params: {
  email: string
  ipAddress?: string
  fingerprintHash?: string
}): Promise<FraudCheckResult> {
  const { email, ipAddress, fingerprintHash } = params

  // 1. Check if email domain is blocked
  if (await isEmailBlocked(email)) {
    return {
      allowed: false,
      reason: 'Este provedor de email nao e permitido. Use um email pessoal ou corporativo.',
      code: 'BLOCKED_EMAIL',
    }
  }

  // 2. Check if fingerprint was already used
  if (fingerprintHash && await isDeviceFingerprintUsed(fingerprintHash)) {
    return {
      allowed: false,
      reason: 'Este dispositivo ja foi usado para criar uma conta.',
      code: 'FINGERPRINT_USED',
    }
  }

  // 3. Check IP abuse (max 3 accounts per IP in 24h)
  if (ipAddress) {
    const signupsFromIP = await countSignupsFromIP(ipAddress, 24)
    if (signupsFromIP >= 3) {
      return {
        allowed: false,
        reason: 'Muitas contas criadas deste endereco. Tente novamente mais tarde.',
        code: 'IP_ABUSE',
      }
    }
  }

  return { allowed: true }
}

/**
 * Check if user can create a free trial document
 * Returns { allowed: true } if user can create, or { allowed: false, reason } if not
 */
export async function checkFreeTrialEligibility(userId: string): Promise<FraudCheckResult> {
  const supabase = await createClient()

  // Get user's trial status and plan
  const { data: user } = await supabase
    .from('users')
    .select(`
      free_trial_used,
      free_trial_documents_count,
      plan_id,
      plans:plan_id (slug)
    `)
    .eq('id', userId)
    .single()

  if (!user) {
    return { allowed: false, reason: 'Usuario nao encontrado' }
  }

  const planSlug = (user.plans as { slug: string } | null)?.slug || 'free'

  // Paid plan users have unlimited access
  if (planSlug !== 'free') {
    return { allowed: true }
  }

  // Check free trial limit (2 documents)
  const docsCreated = user.free_trial_documents_count || 0
  const FREE_TRIAL_LIMIT = 2

  if (docsCreated >= FREE_TRIAL_LIMIT) {
    return {
      allowed: false,
      reason: `Voce ja utilizou seus ${FREE_TRIAL_LIMIT} documentos gratuitos. Assine um plano para continuar.`,
      code: 'TRIAL_EXHAUSTED',
    }
  }

  return { allowed: true }
}

/**
 * Increment free trial document count for a user
 */
export async function incrementFreeTrialCount(userId: string): Promise<void> {
  const supabase = await createClient()

  // First get current count
  const { data: user } = await supabase
    .from('users')
    .select('free_trial_documents_count')
    .eq('id', userId)
    .single()

  const currentCount = user?.free_trial_documents_count || 0

  await supabase
    .from('users')
    .update({
      free_trial_documents_count: currentCount + 1,
      free_trial_used: currentCount + 1 >= 2, // Mark as used after 2 docs
    })
    .eq('id', userId)
}
