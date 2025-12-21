import { createClient } from '@/lib/supabase/server'
import { TemplatesClient } from './TemplatesClient'

export interface Template {
  id: string
  name: string
  description: string | null
  category: string
  price_credit: number
  is_public: boolean
  created_at: string
}

export default async function TemplatesPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  // Fetch public templates
  const { data: publicTemplates } = await supabase
    .from('templates')
    .select('*')
    .eq('is_public', true)
    .order('name')

  // Fetch user's custom templates
  const { data: myTemplates } = user
    ? await supabase
        .from('templates')
        .select('*')
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false })
    : { data: [] }

  return (
    <TemplatesClient
      publicTemplates={publicTemplates || []}
      myTemplates={myTemplates || []}
    />
  )
}
