import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { isValidUUID } from '@/lib/validation'

/**
 * GET /api/templates/favorites
 * Get user's favorite templates
 */
export async function GET() {
  try {
    const supabase = await createClient()

    // Verify authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's favorite template IDs from user preferences
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('favorite_templates')
      .eq('id', user.id)
      .single()

    if (userError) {
      console.error('User fetch error:', userError)
      return NextResponse.json({ error: 'Failed to fetch favorites' }, { status: 500 })
    }

    const favoriteIds = userData?.favorite_templates || []

    if (favoriteIds.length === 0) {
      return NextResponse.json({ favorites: [] })
    }

    // Get template details
    const { data: templates, error: templatesError } = await supabase
      .from('templates')
      .select('id, name, description, category, is_public, created_at')
      .in('id', favoriteIds)

    if (templatesError) {
      console.error('Templates fetch error:', templatesError)
      return NextResponse.json({ error: 'Failed to fetch templates' }, { status: 500 })
    }

    return NextResponse.json({ favorites: templates || [] })
  } catch (error) {
    console.error('Favorites GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * POST /api/templates/favorites
 * Add a template to favorites
 *
 * Body:
 * - templateId: string - ID of the template to add
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Verify authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { templateId } = body

    // Validate template ID
    if (!templateId || !isValidUUID(templateId)) {
      return NextResponse.json({ error: 'Invalid template ID' }, { status: 400 })
    }

    // Verify template exists
    const { data: template, error: templateError } = await supabase
      .from('templates')
      .select('id')
      .eq('id', templateId)
      .single()

    if (templateError || !template) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 })
    }

    // Get current favorites
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('favorite_templates')
      .eq('id', user.id)
      .single()

    if (userError) {
      console.error('User fetch error:', userError)
      return NextResponse.json({ error: 'Failed to fetch user data' }, { status: 500 })
    }

    const currentFavorites: string[] = userData?.favorite_templates || []

    // Check if already favorited
    if (currentFavorites.includes(templateId)) {
      return NextResponse.json({
        success: true,
        message: 'Template already in favorites',
      })
    }

    // Add to favorites (limit to 50)
    const newFavorites = [...currentFavorites, templateId].slice(0, 50)

    const { error: updateError } = await supabase
      .from('users')
      .update({ favorite_templates: newFavorites })
      .eq('id', user.id)

    if (updateError) {
      console.error('Update favorites error:', updateError)
      return NextResponse.json({ error: 'Failed to add favorite' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Template added to favorites',
    })
  } catch (error) {
    console.error('Favorites POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * DELETE /api/templates/favorites
 * Remove a template from favorites
 *
 * Body:
 * - templateId: string - ID of the template to remove
 */
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Verify authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { templateId } = body

    // Validate template ID
    if (!templateId || !isValidUUID(templateId)) {
      return NextResponse.json({ error: 'Invalid template ID' }, { status: 400 })
    }

    // Get current favorites
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('favorite_templates')
      .eq('id', user.id)
      .single()

    if (userError) {
      console.error('User fetch error:', userError)
      return NextResponse.json({ error: 'Failed to fetch user data' }, { status: 500 })
    }

    const currentFavorites: string[] = userData?.favorite_templates || []

    // Remove from favorites
    const newFavorites = currentFavorites.filter(id => id !== templateId)

    const { error: updateError } = await supabase
      .from('users')
      .update({ favorite_templates: newFavorites })
      .eq('id', user.id)

    if (updateError) {
      console.error('Update favorites error:', updateError)
      return NextResponse.json({ error: 'Failed to remove favorite' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Template removed from favorites',
    })
  } catch (error) {
    console.error('Favorites DELETE error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
