import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { rateLimiters, getRateLimitHeaders } from '@/lib/rate-limit'
import { isValidUUID, sanitizeString } from '@/lib/validation'

/**
 * POST /api/templates/clone
 * Clone a public template to user's private templates
 *
 * Body:
 * - templateId: string - ID of template to clone
 * - newName?: string - Optional new name for the cloned template
 */
export async function POST(request: NextRequest) {
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

    const body = await request.json()
    const { templateId, newName } = body

    // Validate template ID
    if (!templateId || !isValidUUID(templateId)) {
      return NextResponse.json({ error: 'Invalid template ID' }, { status: 400 })
    }

    // Get original template
    const { data: originalTemplate, error: fetchError } = await supabase
      .from('templates')
      .select('*')
      .eq('id', templateId)
      .single()

    if (fetchError || !originalTemplate) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 })
    }

    // Check if user can clone this template
    // User can clone: public templates OR their own templates
    if (!originalTemplate.is_public && originalTemplate.user_id !== user.id) {
      return NextResponse.json({ error: 'Cannot clone this template' }, { status: 403 })
    }

    // Prepare cloned template data
    const clonedName = newName
      ? sanitizeString(newName)
      : `${originalTemplate.name} (Copia)`

    // Create cloned template
    const { data: clonedTemplate, error: insertError } = await supabase
      .from('templates')
      .insert({
        user_id: user.id,
        name: clonedName,
        description: originalTemplate.description,
        category: originalTemplate.category,
        content: originalTemplate.content,
        fields: originalTemplate.fields,
        is_public: false, // Cloned templates are always private
        cloned_from: originalTemplate.id,
      })
      .select()
      .single()

    if (insertError) {
      console.error('Template clone error:', insertError)
      return NextResponse.json({ error: 'Failed to clone template' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      template: clonedTemplate,
      message: 'Template cloned successfully',
    })
  } catch (error) {
    console.error('Template clone error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
