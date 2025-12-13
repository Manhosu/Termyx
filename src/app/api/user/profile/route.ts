import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { rateLimiters, getRateLimitHeaders } from '@/lib/rate-limit'
import { sanitizeString, isValidPhone, isValidCPF, isValidCNPJ } from '@/lib/validation'

interface ProfileUpdateRequest {
  name?: string
  phone?: string
  cpf_cnpj?: string
  company_name?: string
  business_category?: string
}

/**
 * GET /api/user/profile
 * Get current user's profile
 */
export async function GET() {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select(`
        id,
        email,
        name,
        phone,
        cpf_cnpj,
        company_name,
        business_category,
        avatar_url,
        credits,
        onboarding_completed,
        created_at,
        plans (
          id,
          name,
          slug
        )
      `)
      .eq('id', user.id)
      .single()

    if (profileError) {
      console.error('Profile fetch error:', profileError)
      return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 })
    }

    return NextResponse.json({ profile })
  } catch (error) {
    console.error('Profile GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * PATCH /api/user/profile
 * Update current user's profile
 */
export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient()

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

    const body: ProfileUpdateRequest = await request.json()
    const updates: Record<string, unknown> = {}
    const errors: string[] = []

    // Validate and sanitize name
    if (body.name !== undefined) {
      const name = sanitizeString(body.name)
      if (name.length < 2) {
        errors.push('Nome deve ter pelo menos 2 caracteres')
      } else if (name.length > 100) {
        errors.push('Nome deve ter no maximo 100 caracteres')
      } else {
        updates.name = name
      }
    }

    // Validate phone
    if (body.phone !== undefined) {
      if (body.phone === '' || body.phone === null) {
        updates.phone = null
      } else {
        const phone = body.phone.replace(/\D/g, '')
        if (!isValidPhone(phone)) {
          errors.push('Telefone invalido (formato: DDD + numero)')
        } else {
          updates.phone = phone
        }
      }
    }

    // Validate CPF/CNPJ
    if (body.cpf_cnpj !== undefined) {
      if (body.cpf_cnpj === '' || body.cpf_cnpj === null) {
        updates.cpf_cnpj = null
      } else {
        const digits = body.cpf_cnpj.replace(/\D/g, '')
        if (digits.length === 11) {
          if (!isValidCPF(digits)) {
            errors.push('CPF invalido')
          } else {
            updates.cpf_cnpj = digits
          }
        } else if (digits.length === 14) {
          if (!isValidCNPJ(digits)) {
            errors.push('CNPJ invalido')
          } else {
            updates.cpf_cnpj = digits
          }
        } else {
          errors.push('CPF deve ter 11 digitos ou CNPJ deve ter 14 digitos')
        }
      }
    }

    // Validate company name
    if (body.company_name !== undefined) {
      if (body.company_name === '' || body.company_name === null) {
        updates.company_name = null
      } else {
        const companyName = sanitizeString(body.company_name)
        if (companyName.length > 200) {
          errors.push('Nome da empresa deve ter no maximo 200 caracteres')
        } else {
          updates.company_name = companyName
        }
      }
    }

    // Validate business category
    if (body.business_category !== undefined) {
      const validCategories = ['freelancer', 'mei', 'empresa', 'outro']
      if (body.business_category === '' || body.business_category === null) {
        updates.business_category = null
      } else if (!validCategories.includes(body.business_category)) {
        errors.push(`Categoria invalida. Opcoes: ${validCategories.join(', ')}`)
      } else {
        updates.business_category = body.business_category
      }
    }

    // Return validation errors
    if (errors.length > 0) {
      return NextResponse.json({ errors }, { status: 400 })
    }

    // Check if there are any updates
    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: 'No valid fields to update' },
        { status: 400 }
      )
    }

    // Update profile
    const { data: updatedProfile, error: updateError } = await supabase
      .from('users')
      .update(updates)
      .eq('id', user.id)
      .select(`
        id,
        email,
        name,
        phone,
        cpf_cnpj,
        company_name,
        business_category,
        avatar_url,
        credits,
        onboarding_completed,
        created_at,
        plans (
          id,
          name,
          slug
        )
      `)
      .single()

    if (updateError) {
      console.error('Profile update error:', updateError)
      return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      profile: updatedProfile,
    })
  } catch (error) {
    console.error('Profile PATCH error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
