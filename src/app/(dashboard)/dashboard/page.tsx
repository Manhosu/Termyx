import { createClient } from '@/lib/supabase/server'
import { DashboardClient } from '@/components/dashboard/DashboardClient'

interface RecentDocument {
  id: string
  title: string
  status: string
  created_at: string
  templates: { name: string } | null
}

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  // Fetch user profile
  const { data: profile } = await supabase
    .from('users')
    .select('*, plan:plans(*)')
    .eq('id', user.id)
    .single()

  // Count documents this month
  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  startOfMonth.setHours(0, 0, 0, 0)

  const { count: docsThisMonth } = await supabase
    .from('documents')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .gte('created_at', startOfMonth.toISOString())

  // Recent documents
  const { data: recentDocs } = await supabase
    .from('documents')
    .select('id, title, status, created_at, templates(name)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(5) as { data: RecentDocument[] | null }

  // Public templates
  const { data: publicTemplates } = await supabase
    .from('templates')
    .select('id, name, category, description')
    .eq('is_public', true)
    .limit(4)

  return (
    <DashboardClient
      profile={profile}
      docsThisMonth={docsThisMonth || 0}
      recentDocs={recentDocs}
      publicTemplates={publicTemplates}
    />
  )
}
