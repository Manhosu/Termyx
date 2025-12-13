'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { User as AuthUser } from '@supabase/supabase-js'
import type { User } from '@/types/database'

interface UseUserReturn {
  authUser: AuthUser | null
  profile: User | null
  loading: boolean
  error: Error | null
  refetch: () => Promise<void>
}

export function useUser(): UseUserReturn {
  const [authUser, setAuthUser] = useState<AuthUser | null>(null)
  const [profile, setProfile] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const supabase = createClient()

  const fetchUser = async () => {
    try {
      setLoading(true)
      setError(null)

      const { data: { user }, error: authError } = await supabase.auth.getUser()

      if (authError) throw authError

      setAuthUser(user)

      if (user) {
        const { data: profileData, error: profileError } = await supabase
          .from('users')
          .select('*, plan:plans(*)')
          .eq('id', user.id)
          .single()

        if (profileError) throw profileError

        setProfile(profileData)
      } else {
        setProfile(null)
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setAuthUser(session?.user ?? null)
        if (session?.user) {
          await fetchUser()
        } else {
          setProfile(null)
        }
      }
    )

    return () => subscription.unsubscribe()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return {
    authUser,
    profile,
    loading,
    error,
    refetch: fetchUser,
  }
}
