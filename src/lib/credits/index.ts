import { createClient } from '@/lib/supabase/server'

interface CreditCheckResult {
  hasCredits: boolean
  credits: number
  plan: string
  planName: string
}

interface DeductResult {
  success: boolean
  newBalance: number
  previousBalance: number
}

/**
 * Verifica se o usuario tem creditos disponiveis
 */
export async function checkCredits(userId: string): Promise<CreditCheckResult> {
  const supabase = await createClient()

  const { data: userData, error } = await supabase
    .from('users')
    .select('credits, plan_id, plans(slug, name)')
    .eq('id', userId)
    .single()

  if (error || !userData) {
    return {
      hasCredits: false,
      credits: 0,
      plan: 'free',
      planName: 'Free'
    }
  }

  const credits = userData.credits || 0
  const plan = (userData.plans as { slug: string; name: string } | null)?.slug || 'free'
  const planName = (userData.plans as { slug: string; name: string } | null)?.name || 'Free'

  return {
    hasCredits: credits > 0,
    credits,
    plan,
    planName
  }
}

/**
 * Deduz 1 credito do usuario usando funcao atomica
 */
export async function deductCredit(userId: string): Promise<DeductResult> {
  const supabase = await createClient()

  // Obter creditos atuais
  const { data: userData } = await supabase
    .from('users')
    .select('credits')
    .eq('id', userId)
    .single()

  const previousBalance = userData?.credits || 0

  if (previousBalance <= 0) {
    return {
      success: false,
      newBalance: 0,
      previousBalance: 0
    }
  }

  // Deduzir usando funcao atomica
  const { data: newCredits, error } = await supabase
    .rpc('deduct_credit', { p_user_id: userId })

  if (error) {
    console.error('Deduct credit error:', error)
    return {
      success: false,
      newBalance: previousBalance,
      previousBalance
    }
  }

  return {
    success: true,
    newBalance: newCredits,
    previousBalance
  }
}

/**
 * Verifica se o usuario pode criar um documento
 */
export async function canCreateDocument(userId: string): Promise<boolean> {
  const { hasCredits } = await checkCredits(userId)
  return hasCredits
}

/**
 * Adiciona creditos ao usuario (compra ou bonus de plano)
 */
export async function addCredits(
  userId: string,
  amount: number,
  type: 'purchase' | 'bonus' | 'refund',
  description: string
): Promise<{ success: boolean; newBalance: number }> {
  const supabase = await createClient()

  const { data: newCredits, error } = await supabase
    .rpc('add_credits', {
      p_user_id: userId,
      p_amount: amount,
      p_type: type,
      p_description: description
    })

  if (error) {
    console.error('Add credits error:', error)
    return { success: false, newBalance: 0 }
  }

  return { success: true, newBalance: newCredits }
}
