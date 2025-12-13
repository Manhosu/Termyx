import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * GET /api/templates/stats
 * Get template usage statistics
 *
 * Query params:
 * - id: Optional template ID for specific template stats
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Verify authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const templateId = searchParams.get('id')

    if (templateId) {
      // Get specific template stats
      const stats = await getTemplateStats(supabase, user.id, templateId)
      return NextResponse.json({ stats })
    }

    // Get all templates with usage stats for the user
    const { data: templates, error: templatesError } = await supabase
      .from('templates')
      .select(`
        id,
        name,
        category,
        is_public,
        created_at
      `)
      .or(`is_public.eq.true,user_id.eq.${user.id}`)
      .order('name')

    if (templatesError) {
      console.error('Templates fetch error:', templatesError)
      return NextResponse.json({ error: 'Failed to fetch templates' }, { status: 500 })
    }

    // Get document counts per template for this user
    const { data: documentCounts, error: countsError } = await supabase
      .from('documents')
      .select('template_id')
      .eq('user_id', user.id)

    if (countsError) {
      console.error('Document counts error:', countsError)
      return NextResponse.json({ error: 'Failed to fetch statistics' }, { status: 500 })
    }

    // Count documents per template
    const templateUsage: Record<string, number> = {}
    documentCounts?.forEach(doc => {
      if (doc.template_id) {
        templateUsage[doc.template_id] = (templateUsage[doc.template_id] || 0) + 1
      }
    })

    // Combine templates with usage stats
    const templatesWithStats = templates?.map(template => ({
      ...template,
      documentsCount: templateUsage[template.id] || 0,
    })) || []

    // Calculate category statistics
    const categoryStats: Record<string, { count: number; documentsTotal: number }> = {}
    templatesWithStats.forEach(template => {
      const cat = template.category || 'outros'
      if (!categoryStats[cat]) {
        categoryStats[cat] = { count: 0, documentsTotal: 0 }
      }
      categoryStats[cat].count++
      categoryStats[cat].documentsTotal += template.documentsCount
    })

    // Find most used templates
    const mostUsed = [...templatesWithStats]
      .sort((a, b) => b.documentsCount - a.documentsCount)
      .slice(0, 5)

    return NextResponse.json({
      templates: templatesWithStats,
      summary: {
        totalTemplates: templates?.length || 0,
        publicTemplates: templates?.filter(t => t.is_public).length || 0,
        userTemplates: templates?.filter(t => !t.is_public).length || 0,
        totalDocumentsGenerated: documentCounts?.length || 0,
      },
      categoryStats,
      mostUsed,
    })
  } catch (error) {
    console.error('Template stats error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * Get detailed stats for a specific template
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function getTemplateStats(supabase: any, userId: string, templateId: string) {
  // Get template info
  const { data: template, error: templateError } = await supabase
    .from('templates')
    .select('id, name, category, is_public, created_at')
    .eq('id', templateId)
    .single()

  if (templateError || !template) {
    return null
  }

  // Get user's documents for this template
  const { data: documents, error: docsError } = await supabase
    .from('documents')
    .select('id, status, created_at')
    .eq('user_id', userId)
    .eq('template_id', templateId)

  if (docsError) {
    console.error('Template documents error:', docsError)
    return null
  }

  // Calculate stats
  const totalDocuments = documents?.length || 0
  const draftCount = documents?.filter((d: { status: string }) => d.status === 'draft').length || 0
  const completedCount = documents?.filter((d: { status: string }) => d.status === 'completed').length || 0
  const sentCount = documents?.filter((d: { status: string }) => d.status === 'sent').length || 0

  // Get documents by month (last 6 months)
  const sixMonthsAgo = new Date()
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

  const monthlyUsage: Record<string, number> = {}
  documents?.forEach((doc: { created_at: string }) => {
    const date = new Date(doc.created_at)
    if (date >= sixMonthsAgo) {
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      monthlyUsage[key] = (monthlyUsage[key] || 0) + 1
    }
  })

  // Get last used date
  const lastUsed = documents?.length
    ? new Date(Math.max(...documents.map((d: { created_at: string }) => new Date(d.created_at).getTime())))
    : null

  return {
    template,
    usage: {
      total: totalDocuments,
      byStatus: {
        draft: draftCount,
        completed: completedCount,
        sent: sentCount,
      },
      lastUsed: lastUsed?.toISOString() || null,
      monthlyUsage,
    },
  }
}
